import { createContext, useContext } from "react";

export interface MenuContextValue {
  close: () => void;
  haptics: boolean;
}
export const MenuContext = createContext<MenuContextValue | null>(null);
export const useMenu = (component: string) => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error(`${component} must be used within a <Menu>`);
  }
  return context;
};
export interface MenuRadioContextValue {
  value: string | undefined;
  select: (value: string) => void;
}
export const MenuRadioContext = createContext<MenuRadioContextValue | null>(
  null
);
export interface MenuSubContextValue {
  open: boolean;
  toggle: () => void;
}
export const MenuSubContext = createContext<MenuSubContextValue | null>(null);
export const useMenuSub = (component: string) => {
  const context = useContext(MenuSubContext);
  if (!context) {
    throw new Error(`${component} must be used within a <Menu.Sub>`);
  }
  return context;
};
