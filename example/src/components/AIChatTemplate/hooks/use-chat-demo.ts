import { useDidHide } from "@tarojs/taro";
import { useCallback, useEffect, useRef, useState } from "react";

import { classifyPrompt, INITIAL_SESSIONS, MODELS, REPLIES } from "../constant";
import { AI_API_URL, AI_CONFIGURED } from "../services/config";
import { serializeHistory } from "../services/history";
import type { ChatTransport } from "../services/protocol";
import { reduceEvent } from "../services/reduce-event";
import { createWeappTransport } from "../services/transport";
import type { ChatSession, ChatTurn, StreamJob } from "../type";
const serviceTransport = createWeappTransport(AI_API_URL);
interface ChatOptions {
  transport?: ChatTransport;
  initialMode?: "demo" | "live";
}

export const useChatDemo = ({
  transport = serviceTransport,
  initialMode = "demo",
}: ChatOptions = {}) => {
  const liveRequest = useRef<{
    cancel: () => void;
    flush: () => void;
    sessionId: string;
    messageId: string;
  } | null>(null);
  const [liveBusy, setLiveBusy] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>(() =>
    INITIAL_SESSIONS.map((entry) => ({
      ...entry,
      mode: entry.id === INITIAL_SESSIONS[0].id ? initialMode : entry.mode,
      messages: entry.messages.map((turn) => ({ ...turn })),
    }))
  );
  const [activeId, setActiveId] = useState(INITIAL_SESSIONS[0].id);
  const [job, setJob] = useState<StreamJob | null>(null);
  const [failNext, setFailNext] = useState(false);
  const sequence = useRef(0);
  const epoch = useRef(0);
  const busyRef = useRef(false);
  const session =
    sessions.find((entry) => entry.id === activeId) ?? sessions[0];
  const mode = session.mode;
  const updateSession = useCallback(
    (id: string, update: (current: ChatSession) => ChatSession) => {
      setSessions((current) =>
        current.map((entry) => (entry.id === id ? update(entry) : entry))
      );
    },
    []
  );
  const updateTurn = useCallback(
    (sessionId: string, messageId: string, patch: Partial<ChatTurn>) => {
      updateSession(sessionId, (current) => ({
        ...current,
        messages: current.messages.map((turn) =>
          turn.id === messageId ? { ...turn, ...patch } : turn
        ),
      }));
    },
    [updateSession]
  );
  const startLive = (
    sessionId: string,
    turn: ChatTurn,
    history: ChatTurn[]
  ) => {
    busyRef.current = true;
    setLiveBusy(true);
    const generation = ++epoch.current;
    let pending = turn;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const flush = () => {
      clearTimeout(timer);
      timer = undefined;
      if (generation === epoch.current) updateTurn(sessionId, turn.id, pending);
    };
    const finish = () => {
      flush();
      epoch.current += 1;
      busyRef.current = false;
      setLiveBusy(false);
      liveRequest.current = null;
    };
    const handle = { cancel: () => {}, flush, sessionId, messageId: turn.id };
    liveRequest.current = handle;
    try {
      handle.cancel = transport(
        {
          messages: serializeHistory(history),
        },
        (event) => {
          if (generation !== epoch.current) return;
          pending = reduceEvent(pending, event);
          if (event.type === "finish" || event.type === "error") finish();
          else if (!timer) timer = setTimeout(flush, 50);
        },
        (error) => {
          if (generation !== epoch.current) return;
          pending = { ...pending, phase: "error", error: error.message };
          finish();
        }
      );
    } catch (error) {
      pending = {
        ...pending,
        phase: "error",
        error: error instanceof Error ? error.message : "Connection failed",
      };
      finish();
    }
  };
  useEffect(
    () => () => {
      const current = liveRequest.current;
      // Invalidate before abort: late network callbacks must not update unmounted state.
      epoch.current += 1;
      current?.cancel();
      current?.flush();
      liveRequest.current = null;
    },
    []
  );
  useEffect(() => {
    if (!job) {
      return;
    }
    const generation = epoch.current;
    let ticks = 0;
    let cursor = 0;
    const timer = setInterval(() => {
      if (generation !== epoch.current) {
        return;
      }
      ticks += 1;
      if (ticks < 5) {
        return;
      }
      if (job.fail) {
        updateTurn(job.sessionId, job.messageId, { phase: "error" });
        busyRef.current = false;
        setJob(null);
        return;
      }
      cursor = Math.min(job.text.length, cursor + 32);
      const done = cursor === job.text.length;
      updateTurn(job.sessionId, job.messageId, {
        phase: done ? "complete" : "streaming",
        text: job.text.slice(0, cursor),
      });
      if (done) {
        busyRef.current = false;
        setJob(null);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [job, updateTurn]);
  const stop = useCallback(() => {
    const current = liveRequest.current;
    current?.flush();
    epoch.current += 1;
    current?.cancel();
    liveRequest.current = null;
    setLiveBusy(false);
    busyRef.current = false;
    if (current)
      updateTurn(current.sessionId, current.messageId, { phase: "stopped" });
    if (job) {
      updateTurn(job.sessionId, job.messageId, { phase: "stopped" });
    }
    setJob(null);
  }, [job, updateTurn]);
  useDidHide(stop);
  const send = (prompt = session.draft) => {
    const text = prompt.trim();
    if (!text || busyRef.current) {
      return;
    }
    const kind = classifyPrompt(text);
    sequence.current += 1;
    const id = `turn-${sequence.current}`;
    busyRef.current = true;
    epoch.current += 1;
    updateSession(activeId, (current) => ({
      ...current,
      attachment: false,
      draft: "",
      messages: [
        ...current.messages,
        {
          attachment: current.attachment,
          id: `${id}-user`,
          kind,
          live: mode === "live",
          phase: "complete",
          role: "user",
          text,
        },
        {
          id,
          kind,
          live: mode === "live",
          phase: "submitted",
          role: "assistant",
          text: "",
        },
      ],
      title: current.messages.length ? current.title : text.slice(0, 32),
    }));
    if (mode === "live") {
      startLive(
        activeId,
        {
          id,
          kind,
          live: true,
          phase: "submitted",
          role: "assistant",
          text: "",
        },
        [
          ...session.messages,
          {
            id: `${id}-user`,
            kind,
            live: true,
            phase: "complete",
            role: "user",
            text,
            attachment: session.attachment,
          },
        ]
      );
      return;
    }
    setJob({
      fail: failNext,
      messageId: id,
      sessionId: activeId,
      text: REPLIES[kind],
    });
    setFailNext(false);
  };
  const retry = () => {
    if (busyRef.current) {
      return;
    }
    const last = session.messages.at(-1);
    if (!last || last.role !== "assistant") {
      return;
    }
    if (last.live) {
      const fresh: ChatTurn = {
        ...last,
        phase: "submitted",
        text: "",
        reasoning: "",
        parts: [],
        error: undefined,
      };
      updateTurn(activeId, last.id, fresh);
      startLive(activeId, fresh, session.messages.slice(0, -1));
      return;
    }
    busyRef.current = true;
    epoch.current += 1;
    updateTurn(activeId, last.id, { phase: "submitted", text: "" });
    setJob({
      fail: false,
      messageId: last.id,
      sessionId: activeId,
      text: REPLIES[last.kind],
    });
  };
  const retryAction = useRef(retry);
  retryAction.current = retry;
  const retryLast = useCallback(() => retryAction.current(), []);
  const chooseSession = (id: string) => {
    if (!sessions.some((entry) => entry.id === id)) {
      return;
    }
    stop();
    setActiveId(id);
  };
  const createSession = (nextMode: "demo" | "live") => {
    stop();
    sequence.current += 1;
    const id = `session-${sequence.current}`;
    setSessions((current) => [
      {
        mode: nextMode,
        attachment: false,
        draft: "",
        id,
        messages: [],
        model: MODELS[0],
        title: "New conversation",
      },
      ...current,
    ]);
    setActiveId(id);
  };
  return {
    busy: !!job || liveBusy,
    mode,
    configured: AI_CONFIGURED,
    setMode: (next: "demo" | "live") => {
      if (busyRef.current || (next === "live" && !AI_CONFIGURED)) return;
      if (next !== mode) createSession(next);
    },
    chooseSession,
    failNext,
    newSession: () => createSession(mode),
    retry: retryLast,
    send,
    session,
    sessions,
    setDraft: (draft: string) =>
      updateSession(activeId, (current) => ({ ...current, draft })),
    setFailNext,
    setModel: (model: string) => {
      if (MODELS.includes(model) && !busyRef.current) {
        updateSession(activeId, (current) => ({ ...current, model }));
      }
    },
    stop,
    toggleAttachment: () => {
      if (!busyRef.current) {
        updateSession(activeId, (current) => ({
          ...current,
          attachment: !current.attachment,
        }));
      }
    },
  };
};
