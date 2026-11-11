export const readTaroStyle = (
  element: Element | null | undefined
): string | undefined =>
  element?.attributes.getNamedItem("data-taro-style")?.value;
