import { useState } from "react";

import { PageLayout } from "@/components/navigation/PageLayout";

import { ChatComposer } from "./components/Composer";
import { ChatHeader } from "./components/Header";
import { ChatHistory } from "./components/History";
import { ChatOptions } from "./components/Options";
import { ChatTranscript } from "./components/Transcript";
import { SimulatedVoice } from "./components/Voice";
import { ConnectedVoice } from "./components/Voice/connected";
import { useChatDemo } from "./hooks/use-chat-demo";

export const AIChatTemplate = () => {
  const model = useChatDemo();
  const [history, setHistory] = useState(false);
  const [options, setOptions] = useState(false);
  const [voice, setVoice] = useState(false);
  return (
    <PageLayout
      bodyClassName={false}
      style={{ background: "var(--panel-background)" }}
      header={
        voice ? undefined : (
          <ChatHeader
            title={model.session.title}
            onHistory={() => setHistory(true)}
            onNew={model.newSession}
          />
        )
      }
      footer={
        voice ? undefined : (
          <ChatComposer
            mode={model.mode}
            session={model.session}
            busy={model.busy}
            onChange={model.setDraft}
            onSubmit={model.send}
            onStop={model.stop}
            onOptions={() => setOptions(true)}
            onVoice={() => {
              if (!model.busy) {
                setVoice(true);
              }
            }}
            onAttachment={model.toggleAttachment}
          />
        )
      }
    >
      {voice ? (
        model.mode === "live" ? (
          <ConnectedVoice
            onClose={() => setVoice(false)}
            onTranscript={model.setDraft}
            answer={
              model.session.messages
                .filter(
                  (turn) =>
                    turn.role === "assistant" &&
                    turn.live &&
                    turn.phase === "complete"
                )
                .at(-1)?.text ?? ""
            }
          />
        ) : (
          <SimulatedVoice onClose={() => setVoice(false)} />
        )
      ) : (
        <ChatTranscript
          mode={model.mode}
          key={model.session.id}
          session={model.session}
          busy={model.busy}
          onChoose={model.send}
          onRetry={model.retry}
        />
      )}
      <ChatHistory
        open={history}
        onOpenChange={setHistory}
        sessions={model.sessions}
        activeId={model.session.id}
        onChoose={model.chooseSession}
        onNew={model.newSession}
      />
      <ChatOptions
        open={options}
        onOpenChange={setOptions}
        mode={model.mode}
        configured={model.configured}
        onMode={model.setMode}
        model={model.session.model}
        onModel={model.setModel}
        failNext={model.failNext}
        onFailNext={model.setFailNext}
      />
    </PageLayout>
  );
};
