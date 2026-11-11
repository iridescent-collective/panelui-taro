export const restoreTextValue = (node: unknown, value: string) => {
  if (!node || typeof node !== "object") {
    return;
  }
  if ("value" in node) {
    node.value = value;
    return;
  }
  if ("setAttribute" in node && typeof node.setAttribute === "function") {
    node.setAttribute("value", value);
  }
};
