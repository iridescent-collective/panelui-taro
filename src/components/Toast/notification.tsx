import {
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastIndicator,
  ToastTitle,
} from "./parts";
import { ToastRoot } from "./surface";
import type { ToastHandle, ToastItem } from "./toast-store";

export const buildToastContent = (item: ToastItem, handle: ToastHandle) => {
  if (item.component) {
    return item.component(handle);
  }
  return (
    <ToastRoot variant={item.variant ?? "default"} onHide={handle.hide}>
      {item.icon === null ? null : (
        <ToastIndicator>{item.icon ?? undefined}</ToastIndicator>
      )}
      <ToastContent>
        {item.label ? <ToastTitle>{item.label}</ToastTitle> : null}
        {item.description ? (
          <ToastDescription>{item.description}</ToastDescription>
        ) : null}
      </ToastContent>
      {item.actionLabel ? (
        <ToastAction onPress={() => item.onActionPress?.(handle)}>
          {item.actionLabel}
        </ToastAction>
      ) : null}
      {(item.closable ?? !item.actionLabel) ? <ToastClose /> : null}
    </ToastRoot>
  );
};
