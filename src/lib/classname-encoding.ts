import { WXSS_ESCAPE_CODES } from "./constants";

export const decodeWxssClassName = (className: string): string =>
  className.replaceAll(
    /_[a-zA-Z]/gu,
    (token) => WXSS_ESCAPE_CODES[token.slice(1)] ?? token
  );
