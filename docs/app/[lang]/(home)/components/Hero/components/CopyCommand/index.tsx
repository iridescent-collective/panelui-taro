"use client";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { CopyStatus } from "./constant";
import type { CopyState } from "./type";

export function CopyCommand({ command }: { command: string }) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<CopyState>(CopyStatus.idle);
  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setStatus(CopyStatus.copied);
    } catch {
      setStatus(CopyStatus.failed);
    }
  }
  return (
    <div className="command">
      <code>{command}</code>
      <button type="button" aria-label={t("copy.label")} onClick={copy}>
        {status === CopyStatus.copied ? (
          <Check size={15} />
        ) : (
          <Copy size={15} />
        )}
      </button>
      <span className="sr-only" role="status">
        {t(`copy.${status}`)}
      </span>
    </div>
  );
}
