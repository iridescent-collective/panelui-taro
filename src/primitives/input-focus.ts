import { getCurrentInstance } from "@tarojs/taro";
import { useCallback, useEffect, useId, useMemo, useState } from "react";

export class InputFocusScope {
  private owner: symbol | null = null;
  private id: string | null = null;
  claim(owner: symbol, id: string) {
    this.owner = owner;
    this.id = id;
  }
  release(owner: symbol) {
    if (this.owner === owner) {
      this.owner = null;
      this.id = null;
    }
  }
  read() {
    return this.id;
  }
}
const scopes = new WeakMap<object, InputFocusScope>();
const fallback = {};
const readScope = () => {
  const page = getCurrentInstance().page ?? fallback;
  let scope = scopes.get(page);
  if (!scope) {
    scope = new InputFocusScope();
    scopes.set(page, scope);
  }
  return scope;
};
export const useInputFocusScope = () => useState(readScope)[0];
export const useInputFocusOwner = (id?: string) => {
  const scope = useInputFocusScope();
  const generated = `panelui-input-focus-${useId().replaceAll(":", "")}`;
  const owner = useMemo(() => Symbol("input-focus"), []);
  const field = id ?? generated;
  const claim = useCallback(
    () => scope.claim(owner, field),
    [scope, owner, field]
  );
  const release = useCallback(() => scope.release(owner), [scope, owner]);
  useEffect(() => release, [release]);
  return { claim, release };
};
