import type { CopyStatus } from "./constant";

export type CopyState = (typeof CopyStatus)[keyof typeof CopyStatus];
