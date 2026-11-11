import type { ChatSession, ReplyKind } from "./type";

export const AI_TEMPLATE_VALUE = "ai";
export const AI_TEMPLATE_URL = "/showcases/ai/index";
export const MODELS = ["Balanced", "Reasoning", "Fast"];
export const SUGGESTIONS = [
  {
    detail: "An itinerary, a plan and sources",
    kind: "research",
    prompt: "Plan a thoughtful weekend in Copenhagen",
    title: "Plan a weekend",
  },
  {
    detail: "A code example you can copy",
    kind: "code",
    prompt: "Build an accessible React button component",
    title: "Build something",
  },
  {
    detail: "Turn a sample brief into next steps",
    kind: "summary",
    prompt: "Summarize the attached project brief",
    title: "Find the essentials",
  },
] as const;
export const REPLIES: Record<ReplyKind, string> = {
  code: "## A small, accessible button\n\nUse a native **button** so keyboard interaction and focus work naturally. Give it an explicit `type` and keep the label descriptive.\n\nThe example below separates behaviour from styling. It is a prepared code sample for this local demo.",
  general:
    "## Let’s give the idea a shape\n\nStart with **one clear outcome**, then break it into a few small decisions.\n\n1. Describe what a good result would look like.\n2. Gather the context that changes the answer.\n3. Try a small first version and refine it.\n\nThis is a prepared response for the local interface demo. A connected model would answer your specific message here.",
  research:
    "## A slower weekend in Copenhagen\n\n**Saturday — discover the city.** Start with a walk along Nyhavn, then leave time for a coffee and a neighbourhood bookshop.\n\n**Sunday — make room for curiosity.** Choose one museum, explore its surroundings, and keep the afternoon open.\n\n### Keep it simple\n- Choose one main activity each day.\n- Group nearby stops so the day feels unhurried.\n- Check opening hours before you travel.\n\nThis is a prepared itinerary for the interface demo, not live travel research.",
  summary:
    "## The brief, at a glance\n\n**Goal:** create a calm, coherent assistant experience.\n\n### What matters\n- Keep the conversation readable as it grows.\n- Make sending, stopping and retrying obvious.\n- Show tool progress and sources alongside the answer.\n\n### Next steps\n1. Agree on the primary conversation flow.\n2. Build and test the message states.\n3. Connect an authenticated model service.\n\nThis summary uses the included sample brief; no document was uploaded or analysed.",
};
export const EXAMPLE_CODE =
  'interface ButtonProps {\n  label: string;\n  onPress: () => void;\n  disabled?: boolean;\n}\n\nexport function Button({ label, onPress, disabled }: ButtonProps) {\n  return (\n    <button type="button" disabled={disabled} onClick={onPress}>\n      {label}\n    </button>\n  );\n}';
export const INITIAL_SESSIONS: ChatSession[] = [
  {
    mode: "demo",
    attachment: false,
    draft: "",
    id: "welcome",
    messages: [],
    model: MODELS[0],
    title: "New conversation",
  },
  {
    mode: "demo",
    attachment: false,
    draft: "",
    id: "theme-tokens",
    messages: [
      {
        id: "tokens-user",
        kind: "general",
        phase: "complete",
        role: "user",
        text: "Where should semantic colours live?",
      },
      {
        id: "tokens-ai",
        kind: "general",
        phase: "complete",
        role: "assistant",
        text: "Keep primitives in one place and derive semantic tokens from them. Components can then ask for a role such as **background** or **foreground**, while each theme supplies its own value.",
      },
    ],
    model: MODELS[1],
    title: "Theme tokens",
  },
];
export const classifyPrompt = (prompt: string): ReplyKind => {
  if (/react|code|component|代码|组件/iu.test(prompt)) {
    return "code";
  }
  if (/brief|summar|document|总结|文档/iu.test(prompt)) {
    return "summary";
  }
  if (/plan|weekend|copenhagen|行程|计划/iu.test(prompt)) {
    return "research";
  }
  return "general";
};
