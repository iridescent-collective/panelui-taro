import { Button } from "panelui-taro/button";
import { Chip } from "panelui-taro/chip";
import { Feedback } from "panelui-taro/feedback";
import { Field } from "panelui-taro/field";
import { CheckIcon, StarIcon, XIcon } from "panelui-taro/icons";
import { Text } from "panelui-taro/primitives/text";
import { Rating } from "panelui-taro/rating";
import { clsx as cn } from "clsx";
import { useEffect, useState, type ReactNode } from "react";

import { Linking, Platform, View } from "../runtime/native";
import { useCSSVariable } from "../runtime/theme";
import { ComponentEntry } from "../types";
function FeedbackDemo() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  return (
    <View className="items-center gap-4">
      <Feedback open={open} onOpenChange={setOpen}>
        <Feedback.Trigger>
          <Button variant="outline">Give feedback</Button>
        </Feedback.Trigger>
        <Feedback.Content>
          <Feedback.Panel>
            <Feedback.Title>What should we fix first?</Feedback.Title>
            <Feedback.Close />
            <Feedback.Field placeholder="Tell us what got in your way" />
          </Feedback.Panel>
          <Feedback.Footer>
            <Feedback.Cancel />
            <Feedback.Submit
              onSubmit={(message) => {
                setSent(message);
                setOpen(false);
              }}
            />
          </Feedback.Footer>
        </Feedback.Content>
      </Feedback>

      {sent ? (
        <Text size="sm" muted numberOfLines={2} className="text-center">
          Sent: {sent}
        </Text>
      ) : null}
    </View>
  );
}
function FeedbackDraftDemo() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(
    "Exporting takes two or three goes before it picks the right folder."
  );
  return (
    <View className="items-center gap-4">
      <Feedback
        open={open}
        onOpenChange={setOpen}
        value={draft}
        onValueChange={setDraft}
      >
        <Feedback.Trigger>
          <Button variant="outline">Open the draft</Button>
        </Feedback.Trigger>
        <Feedback.Content blur>
          <Feedback.Panel>
            <Feedback.Title>Anything else?</Feedback.Title>
            <Feedback.Close />
            <Feedback.Field />
          </Feedback.Panel>
          <Feedback.Footer>
            <Feedback.Cancel />
            <Feedback.Submit onSubmit={() => setOpen(false)} />
          </Feedback.Footer>
        </Feedback.Content>
      </Feedback>

      <Text size="sm" muted numberOfLines={3} className="text-center">
        {draft.length ? draft : "The draft is empty."}
      </Text>
    </View>
  );
}
function DialogOutcome({
  tone,
  icon,
  title,
  children,
}: {
  tone: "success" | "destructive";
  icon: ReactNode;
  title: string;
  children: string;
}) {
  return (
    <View
      className="items-center justify-center gap-3 px-2"
      style={{ minHeight: 200 }}
    >
      <View
        className={cn(
          "h-14 w-14 items-center justify-center rounded-full",
          tone === "success" ? "bg-success" : "bg-destructive"
        )}
      >
        {icon}
      </View>
      <Text size="lg" weight="semibold">
        {title}
      </Text>
      <Text size="sm" muted className="text-center">
        {children}
      </Text>
    </View>
  );
}
function FeedbackThanksDemo() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const token = useCSSVariable("--color-success-solid-foreground");
  const onSolid = typeof token === "string" ? token : undefined;
  return (
    <View className="items-center gap-4">
      <Feedback
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) setSent(false);
        }}
      >
        <Feedback.Trigger>
          <Button variant="outline">Send a note</Button>
        </Feedback.Trigger>
        <Feedback.Content>
          <Feedback.Panel>
            {sent ? (
              <DialogOutcome
                tone="success"
                title="Got it"
                icon={<CheckIcon size={24} color={onSolid} />}
              >
                This goes to the people who can fix it. We only write back when
                there is something to say.
              </DialogOutcome>
            ) : (
              <>
                <Feedback.Title>What should we fix first?</Feedback.Title>
                <Feedback.Close />
                <Feedback.Field placeholder="Tell us what got in your way" />
              </>
            )}
          </Feedback.Panel>
          <Feedback.Footer>
            {sent ? (
              <Feedback.Submit disabled={false} onPress={() => setOpen(false)}>
                Done
              </Feedback.Submit>
            ) : (
              <>
                <Feedback.Cancel />
                <Feedback.Submit onSubmit={() => setSent(true)} />
              </>
            )}
          </Feedback.Footer>
        </Feedback.Content>
      </Feedback>
    </View>
  );
}
function FeedbackRetryDemo() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "failed" | "sent">(
    "idle"
  );
  const [attempts, setAttempts] = useState(0);
  const [draft, setDraft] = useState("");
  const failedToken = useCSSVariable("--color-destructive-solid-foreground");
  const onFailed = typeof failedToken === "string" ? failedToken : undefined;
  const sentToken = useCSSVariable("--color-success-solid-foreground");
  const onSent = typeof sentToken === "string" ? sentToken : undefined;
  useEffect(() => {
    if (state !== "sending") return;
    const timer = setTimeout(() => {
      if (attempts === 0) {
        setAttempts(1);
        setState("failed");
        return;
      }
      setState("sent");
      setAttempts(0);
      setDraft("");
    }, 1200);
    return () => clearTimeout(timer);
  }, [state, attempts]);
  return (
    <View className="items-center gap-4">
      <Feedback
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) {
            setState("idle");
            setAttempts(0);
          }
        }}
        value={draft}
        onValueChange={setDraft}
      >
        <Feedback.Trigger>
          <Button variant="outline">Report a problem</Button>
        </Feedback.Trigger>
        <Feedback.Content dismissible={state !== "sending"}>
          <Feedback.Panel>
            {state === "sent" ? null : <Feedback.Close />}
            {state === "sent" ? (
              <DialogOutcome
                tone="success"
                title="Sent"
                icon={<CheckIcon size={24} color={onSent} />}
              >
                It went through on the second try. Nothing left to do here.
              </DialogOutcome>
            ) : state === "failed" ? (
              <DialogOutcome
                tone="destructive"
                title="Could not send"
                icon={<XIcon size={22} color={onFailed} />}
              >
                Your note is still here. Try again when you have a signal.
              </DialogOutcome>
            ) : (
              <>
                <Feedback.Title>What went wrong?</Feedback.Title>
                <Feedback.Field
                  editable={state !== "sending"}
                  placeholder="What were you doing when it happened"
                />
              </>
            )}
          </Feedback.Panel>

          <Feedback.Footer>
            {state === "sent" ? (
              <Feedback.Submit disabled={false} onPress={() => setOpen(false)}>
                Done
              </Feedback.Submit>
            ) : (
              <>
                <Feedback.Cancel
                  onPress={
                    state === "failed" ? () => setState("idle") : undefined
                  }
                >
                  {state === "failed" ? "Back" : "Cancel"}
                </Feedback.Cancel>
                <Feedback.Submit
                  disabled={state === "sending" || draft.trim().length === 0}
                  onPress={() => setState("sending")}
                >
                  {state === "sending"
                    ? "Sending…"
                    : state === "failed"
                      ? "Try again"
                      : "Submit"}
                </Feedback.Submit>
              </>
            )}
          </Feedback.Footer>
        </Feedback.Content>
      </Feedback>
    </View>
  );
}
const REASONS = ["Too slow", "Confusing", "Wrong result", "Crashed"];
function FeedbackTagsDemo() {
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState(false);
  const token = useCSSVariable("--color-success-solid-foreground");
  const onSolid = typeof token === "string" ? token : undefined;
  const toggle = (reason: string) =>
    setTags((current) =>
      current.includes(reason)
        ? current.filter((item) => item !== reason)
        : [...current, reason]
    );
  return (
    <View className="items-center gap-4">
      <Feedback
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) {
            setTags([]);
            setSent(false);
          }
        }}
        value={draft}
        onValueChange={setDraft}
      >
        <Feedback.Trigger>
          <Button variant="outline">Rate this answer</Button>
        </Feedback.Trigger>
        <Feedback.Content>
          <Feedback.Panel>
            {sent ? (
              <DialogOutcome
                tone="success"
                title="Filed"
                icon={<CheckIcon size={24} color={onSolid} />}
              >
                We sort these by what you picked, so it lands with the people
                who own that part.
              </DialogOutcome>
            ) : (
              <>
                <Feedback.Title>What went wrong?</Feedback.Title>
                <Feedback.Close />
                <View className="flex-row flex-wrap gap-2">
                  {REASONS.map((reason) => (
                    <Chip
                      key={reason}
                      size="sm"
                      selected={tags.includes(reason)}
                      onPress={() => toggle(reason)}
                    >
                      {reason}
                    </Chip>
                  ))}
                </View>

                <Feedback.Field
                  minHeight={120}
                  placeholder="Anything else we should know"
                />
              </>
            )}
          </Feedback.Panel>
          <Feedback.Footer>
            {sent ? (
              <Feedback.Submit disabled={false} onPress={() => setOpen(false)}>
                Done
              </Feedback.Submit>
            ) : (
              <>
                <Feedback.Cancel />
                <Feedback.Submit
                  disabled={tags.length === 0 && draft.trim().length === 0}
                  onSubmit={() => {
                    setDraft("");
                    setSent(true);
                  }}
                />
              </>
            )}
          </Feedback.Footer>
        </Feedback.Content>
      </Feedback>
    </View>
  );
}
const APP_STORE_URL =
  "https://apps.apple.com/app/id000000000?action=write-review";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.example.app";
const STORE = Platform.select({
  ios: { label: "App Store", url: APP_STORE_URL },
  android: { label: "Google Play", url: PLAY_STORE_URL },
  default: { label: "Rate the app", url: APP_STORE_URL },
});
function FeedbackStepsDemo() {
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState(0);
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [draft, setDraft] = useState("");
  const liked = score >= 4;
  const token = useCSSVariable("--color-success-solid-foreground");
  const onSolid = typeof token === "string" ? token : undefined;
  return (
    <View className="items-center gap-4">
      <Feedback
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) {
            setStep(0);
            setScore(0);
            setDraft("");
          }
        }}
        value={draft}
        onValueChange={setDraft}
      >
        <Feedback.Trigger>
          <Button variant="outline">Rate the app</Button>
        </Feedback.Trigger>
        <Feedback.Content>
          <Feedback.Panel>
            {step === 2 ? null : <Feedback.Close />}
            {step === 0 ? (
              <View
                className="items-center justify-center gap-4"
                style={{ minHeight: 200 }}
              >
                <Feedback.Title className="ps-9 text-center">
                  How are you finding the app?
                </Feedback.Title>
                <Rating size="lg" value={score} onValueChange={setScore} />
                <Text size="sm" muted>
                  {score === 0 ? "Tap a star" : SCORE_WORDS[score - 1]}
                </Text>
              </View>
            ) : step === 1 ? (
              <>
                <Feedback.Title>
                  {liked ? "What do you like most?" : "What would have helped?"}
                </Feedback.Title>
                <Feedback.Field placeholder="In your own words" />
              </>
            ) : (
              <DialogOutcome
                tone="success"
                title={liked ? "Glad you like it" : "Thanks — we'll fix it"}
                icon={
                  liked ? (
                    <StarIcon size={24} color={onSolid} />
                  ) : (
                    <CheckIcon size={24} color={onSolid} />
                  )
                }
              >
                {liked
                  ? "A rating on the store is how other people find it. It takes a moment."
                  : "This goes straight to the team. A rating still helps, if you have one in you."}
              </DialogOutcome>
            )}
          </Feedback.Panel>
          <Feedback.Footer>
            {step === 0 ? (
              <>
                <Feedback.Cancel />
                <Feedback.Submit
                  disabled={score === 0}
                  onPress={() => setStep(1)}
                >
                  Next
                </Feedback.Submit>
              </>
            ) : step === 1 ? (
              <>
                <Feedback.Cancel onPress={() => setStep(0)}>
                  Back
                </Feedback.Cancel>
                <Feedback.Submit
                  onSubmit={() => {
                    setDraft("");
                    setStep(2);
                  }}
                />
              </>
            ) : (
              <>
                <Feedback.Cancel>Done</Feedback.Cancel>
                <Feedback.Submit
                  disabled={false}
                  onPress={() => {
                    void Linking.openURL(STORE!.url).catch(() => {});
                  }}
                >
                  {STORE!.label}
                </Feedback.Submit>
              </>
            )}
          </Feedback.Footer>
        </Feedback.Content>
      </Feedback>
    </View>
  );
}
const SCORE_WORDS = ["Bad", "Poor", "Fine", "Good", "Great"];
export const entry: ComponentEntry = {
  slug: "feedback",
  name: "Feedback",
  summary: "Dialog whose body is a well to write in",
  demos: [
    { label: "Asking for a sentence", render: () => <FeedbackDemo /> },
    { label: "Thanks, then done", render: () => <FeedbackThanksDemo /> },
    { label: "The send that failed", render: () => <FeedbackRetryDemo /> },
    { label: "What went wrong", render: () => <FeedbackTagsDemo /> },
    { label: "Score first, words second", render: () => <FeedbackStepsDemo /> },
    { label: "A draft you hold", render: () => <FeedbackDraftDemo /> },
  ],
};
