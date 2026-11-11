export type TokenKind =
  | "plain"
  | "keyword"
  | "string"
  | "number"
  | "comment"
  | "function"
  | "property"
  | "punctuation"
  | "inserted"
  | "deleted";
export interface Token {
  text: string;
  kind: TokenKind;
}
export type CodeLanguage =
  | "ts"
  | "tsx"
  | "js"
  | "jsx"
  | "json"
  | "bash"
  | "python"
  | "css"
  | "html"
  | "sql"
  | "markdown"
  | "diff"
  | "text";
const ALIASES: Record<string, CodeLanguage> = {
  bash: "bash",
  cjs: "js",
  console: "bash",
  css: "css",
  diff: "diff",
  html: "html",
  javascript: "js",
  js: "js",
  json: "json",
  json5: "json",
  jsx: "jsx",
  markdown: "markdown",
  md: "markdown",
  mdx: "markdown",
  mjs: "js",
  patch: "diff",
  py: "python",
  python: "python",
  scss: "css",
  sh: "bash",
  shell: "bash",
  sql: "sql",
  svg: "html",
  ts: "ts",
  tsx: "tsx",
  typescript: "ts",
  xml: "html",
  zsh: "bash",
};
export const resolveLanguage = (language: string | undefined): CodeLanguage => {
  if (!language) {
    return "text";
  }
  return ALIASES[language.toLowerCase()] ?? "text";
};
const JS_KEYWORDS =
  "as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|is|keyof|let|new|of|private|protected|public|readonly|return|satisfies|set|static|super|switch|this|throw|try|type|typeof|var|void|while|yield";
const JS_LITERALS = "true|false|null|undefined|NaN|Infinity";
const PYTHON_KEYWORDS =
  "and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield";
const PYTHON_LITERALS = "True|False|None|self";
const SQL_KEYWORDS =
  "ADD|ALL|ALTER|AND|AS|ASC|BETWEEN|BY|CASE|COLUMN|CREATE|CROSS|DELETE|DESC|DISTINCT|DROP|ELSE|END|EXISTS|FROM|FULL|GROUP|HAVING|IN|INDEX|INNER|INSERT|INTO|IS|JOIN|LEFT|LIKE|LIMIT|NOT|NULL|OFFSET|ON|OR|ORDER|OUTER|PRIMARY|RIGHT|SELECT|SET|TABLE|THEN|UNION|UPDATE|VALUES|WHEN|WHERE|WITH";
const BASH_KEYWORDS =
  "case|do|done|elif|else|esac|export|fi|for|function|if|in|local|return|source|then|until|while";
interface Rule {
  pattern: RegExp;
  kind: TokenKind;
}
const wordsOf = (list: string): RegExp => new RegExp(`^(?:${list})\\b`);
const jsRules = (): Rule[] => [
  { kind: "comment", pattern: /^\/\/.*/u },
  { kind: "comment", pattern: /^\/\*[\s\S]*?(?:\*\/|$)/u },
  { kind: "string", pattern: /^`(?:[^`\\]|\\.)*`/u },
  { kind: "string", pattern: /^"(?:[^"\\]|\\.)*"/u },
  { kind: "string", pattern: /^'(?:[^'\\]|\\.)*'/u },
  { kind: "keyword", pattern: wordsOf(JS_KEYWORDS) },
  { kind: "keyword", pattern: wordsOf(JS_LITERALS) },
  { kind: "function", pattern: /^[A-Za-z_$][\w$]*(?=\s*\()/u },
  {
    kind: "number",
    pattern: /^0[xb][\da-f]+|^\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?/iu,
  },
  { kind: "punctuation", pattern: /^[{}[\]().,;:?!<>=+\-*/%&|^~]/u },
];
const RULES: Record<CodeLanguage, Rule[]> = {
  bash: [
    { kind: "comment", pattern: /^#.*/u },
    { kind: "string", pattern: /^"(?:[^"\\]|\\.)*"/u },
    { kind: "string", pattern: /^'(?:[^'\\]|\\.)*'/u },
    { kind: "property", pattern: /^\$\{?[A-Za-z_][\w]*\}?/u },
    { kind: "keyword", pattern: wordsOf(BASH_KEYWORDS) },
    { kind: "property", pattern: /^-{1,2}[A-Za-z][\w-]*/u },
    { kind: "punctuation", pattern: /^[|&;<>()$]/u },
  ],
  css: [
    { kind: "comment", pattern: /^\/\*[\s\S]*?(?:\*\/|$)/u },
    { kind: "string", pattern: /^"(?:[^"\\]|\\.)*"/u },
    { kind: "string", pattern: /^'(?:[^'\\]|\\.)*'/u },
    { kind: "property", pattern: /^--[\w-]+/u },
    { kind: "keyword", pattern: /^@[\w-]+/u },
    { kind: "function", pattern: /^[.#][\w-]+/u },
    { kind: "property", pattern: /^[a-z-]+(?=\s*:)/iu },
    { kind: "number", pattern: /^-?\d*\.?\d+(?:px|rem|em|%|vh|vw|s|ms|deg)?/u },
    { kind: "punctuation", pattern: /^[{}();:,]/u },
  ],
  diff: [],
  html: [
    { kind: "comment", pattern: /^<!--[\s\S]*?(?:-->|$)/u },
    { kind: "string", pattern: /^"(?:[^"\\]|\\.)*"/u },
    { kind: "string", pattern: /^'(?:[^'\\]|\\.)*'/u },
    { kind: "keyword", pattern: /^<\/?[\w-]+/u },
    { kind: "property", pattern: /^[\w-]+(?==)/u },
    { kind: "keyword", pattern: /^\/?>/u },
    { kind: "punctuation", pattern: /^[=]/u },
  ],
  js: jsRules(),
  json: [
    { kind: "property", pattern: /^"(?:[^"\\]|\\.)*"\s*(?=:)/u },
    { kind: "string", pattern: /^"(?:[^"\\]|\\.)*"/u },
    { kind: "number", pattern: /^-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/iu },
    { kind: "keyword", pattern: /^(?:true|false|null)\b/u },
    { kind: "punctuation", pattern: /^[{}[\],:]/u },
  ],
  jsx: jsRules(),
  markdown: [
    { kind: "keyword", pattern: /^#{1,6}\s.*/u },
    { kind: "string", pattern: /^`[^`]*`/u },
    { kind: "function", pattern: /^\*\*[^*]+\*\*/u },
    { kind: "property", pattern: /^\[[^\]]*\]\([^)]*\)/u },
    { kind: "punctuation", pattern: /^[>-]\s/u },
  ],
  python: [
    { kind: "comment", pattern: /^#.*/u },
    { kind: "string", pattern: /^[rbf]?"""[\s\S]*?(?:"""|$)/u },
    { kind: "string", pattern: /^[rbf]?"(?:[^"\\]|\\.)*"/u },
    { kind: "string", pattern: /^[rbf]?'(?:[^'\\]|\\.)*'/u },
    { kind: "keyword", pattern: wordsOf(PYTHON_KEYWORDS) },
    { kind: "keyword", pattern: wordsOf(PYTHON_LITERALS) },
    { kind: "function", pattern: /^[A-Za-z_]\w*(?=\s*\()/u },
    { kind: "function", pattern: /^@[A-Za-z_]\w*/u },
    { kind: "number", pattern: /^\d[\d_]*(?:\.\d+)?/u },
    { kind: "punctuation", pattern: /^[{}[\]().,:;]/u },
  ],
  sql: [
    { kind: "comment", pattern: /^--.*/u },
    { kind: "string", pattern: /^'(?:[^'\\]|\\.)*'/u },
    { kind: "keyword", pattern: new RegExp(`^(?:${SQL_KEYWORDS})\\b`, "i") },
    { kind: "number", pattern: /^\d+(?:\.\d+)?/u },
    { kind: "punctuation", pattern: /^[(),;*.]/u },
  ],
  text: [],
  ts: jsRules(),
  tsx: jsRules(),
};
const tokenizeDiffLine = (line: string): Token[] => {
  if (line.startsWith("+")) {
    return [{ kind: "inserted", text: line }];
  }
  if (line.startsWith("-")) {
    return [{ kind: "deleted", text: line }];
  }
  if (line.startsWith("@@") || line.startsWith("diff ")) {
    return [{ kind: "comment", text: line }];
  }
  return [{ kind: "plain", text: line }];
};
const tokenizeLine = (line: string, rules: Rule[]): Token[] => {
  if (rules.length === 0) {
    return line ? [{ kind: "plain", text: line }] : [];
  }
  const tokens: Token[] = [];
  let rest = line;
  let plain = "";
  while (rest.length > 0) {
    let matched: {
      text: string;
      kind: TokenKind;
    } | null = null;
    for (const rule of rules) {
      const found = rule.pattern.exec(rest);
      if (found && found[0].length > 0) {
        matched = { kind: rule.kind, text: found[0] };
        break;
      }
    }
    if (matched) {
      if (plain) {
        tokens.push({ kind: "plain", text: plain });
        plain = "";
      }
      tokens.push(matched);
      rest = rest.slice(matched.text.length);
    } else {
      plain += rest[0];
      rest = rest.slice(1);
    }
  }
  if (plain) {
    tokens.push({ kind: "plain", text: plain });
  }
  return tokens;
};
export const highlight = (
  code: string,
  language: string | undefined
): Token[][] => {
  const resolved = resolveLanguage(language);
  const lines = code.split("\n");
  if (resolved === "diff") {
    return lines.map(tokenizeDiffLine);
  }
  const rules = RULES[resolved];
  return lines.map((line) => tokenizeLine(line, rules));
};
