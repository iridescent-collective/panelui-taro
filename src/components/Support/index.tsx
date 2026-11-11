import {
  SupportChannels,
  SupportConversations,
  SupportArticles,
} from "./groups";
import { SupportAgent } from "./support-agent";
import { SupportArticle } from "./support-article";
import { SupportChannel } from "./support-channel";
import { SupportConversation } from "./support-conversation";
import { SupportHandoff } from "./support-handoff";
import { SupportHeader } from "./support-header";
import { SupportNote } from "./support-note";
import { SupportReplies } from "./support-replies";
import { SupportReply } from "./support-reply";
import { SupportResolution } from "./support-resolution";
import { SupportRoot } from "./support-root";
import { SupportStatus } from "./support-status";
import { SupportTicket } from "./support-ticket";
import { SupportTopic } from "./support-topic";
import { SupportTopics } from "./support-topics";

export { useSupport } from "./context";
export type {
  SupportAvailability,
  SupportConversationStatus,
  SupportProps,
  SupportHeaderProps,
  SupportStatusProps,
  SupportGroupProps,
  SupportChannelProps,
  SupportTopicsProps,
  SupportTopicProps,
  SupportConversationProps,
  SupportArticleProps,
  SupportAgentProps,
  SupportTicketProps,
  SupportHandoffProps,
  SupportNoteProps,
  SupportRepliesProps,
  SupportReplyProps,
  SupportResolutionProps,
  SupportVariants,
} from "./types";
export const Support = Object.assign(SupportRoot, {
  Agent: SupportAgent,
  Article: SupportArticle,
  Articles: SupportArticles,
  Channel: SupportChannel,
  Channels: SupportChannels,
  Conversation: SupportConversation,
  Conversations: SupportConversations,
  Handoff: SupportHandoff,
  Header: SupportHeader,
  Note: SupportNote,
  Replies: SupportReplies,
  Reply: SupportReply,
  Resolution: SupportResolution,
  Status: SupportStatus,
  Ticket: SupportTicket,
  Topic: SupportTopic,
  Topics: SupportTopics,
});
