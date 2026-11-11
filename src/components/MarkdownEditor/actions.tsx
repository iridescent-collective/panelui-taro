import type { ReactNode } from "react";

import {
  BoldIcon,
  CodeIcon,
  HeadingIcon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
} from "../../icons";
import {
  hasFence,
  hasLinePrefix,
  hasOrderedList,
  hasWrap,
  insertImage,
  insertLink,
  toggleFence,
  toggleLinePrefix,
  toggleOrderedList,
  toggleWrap,
} from "./transforms";
import type { EditResult, EditorSelection } from "./transforms";
import type { MarkdownEditorAction } from "./types";

export const DEFAULT_ACTIONS: MarkdownEditorAction[] = [
  "bold",
  "italic",
  "heading",
  "bulletList",
  "orderedList",
  "quote",
  "code",
  "link",
];
export const DEFAULT_PILL_ACTIONS: MarkdownEditorAction[] = [
  "bold",
  "italic",
  "heading",
  "link",
  "image",
  "orderedList",
  "bulletList",
  "code",
];
export const FAMILY: Record<
  MarkdownEditorAction,
  "inline" | "insert" | "block"
> = {
  bold: "inline",
  bulletList: "insert",
  code: "block",
  heading: "inline",
  image: "insert",
  italic: "inline",
  link: "insert",
  orderedList: "insert",
  quote: "block",
};
export const ACTIONS: Record<
  MarkdownEditorAction,
  {
    label: string;
    icon: (size: number) => ReactNode;
    apply: (text: string, selection: EditorSelection) => EditResult;
    isActive?: (text: string, selection: EditorSelection) => boolean;
  }
> = {
  bold: {
    apply: (text, selection) => toggleWrap(text, selection, "**"),
    icon: (size) => <BoldIcon size={size} />,
    isActive: (text, selection) => hasWrap(text, selection, "**"),
    label: "Bold",
  },
  bulletList: {
    apply: (text, selection) => toggleLinePrefix(text, selection, "- "),
    icon: (size) => <ListIcon size={size} />,
    isActive: (text, selection) => hasLinePrefix(text, selection, "- "),
    label: "Bulleted list",
  },
  code: {
    apply: toggleFence,
    icon: (size) => <CodeIcon size={size} />,
    isActive: hasFence,
    label: "Code block",
  },
  heading: {
    apply: (text, selection) => toggleLinePrefix(text, selection, "## "),
    icon: (size) => <HeadingIcon size={size} />,
    isActive: (text, selection) => hasLinePrefix(text, selection, "## "),
    label: "Heading",
  },
  image: {
    apply: insertImage,
    icon: (size) => <ImageIcon size={size} />,
    label: "Image",
  },
  italic: {
    apply: (text, selection) => toggleWrap(text, selection, "_"),
    icon: (size) => <ItalicIcon size={size} />,
    isActive: (text, selection) => hasWrap(text, selection, "_"),
    label: "Italic",
  },
  link: {
    apply: insertLink,
    icon: (size) => <LinkIcon size={size} />,
    label: "Link",
  },
  orderedList: {
    apply: toggleOrderedList,
    icon: (size) => <ListOrderedIcon size={size} />,
    isActive: hasOrderedList,
    label: "Numbered list",
  },
  quote: {
    apply: (text, selection) => toggleLinePrefix(text, selection, "> "),
    icon: (size) => <QuoteIcon size={size} />,
    isActive: (text, selection) => hasLinePrefix(text, selection, "> "),
    label: "Quote",
  },
};
