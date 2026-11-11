import { createContext, useContext } from "react";
import type { ReactNode } from "react";

const IconColorContext = createContext<string | undefined>(undefined);
export interface IconColorProviderProps {
  color: string | undefined;
  children?: ReactNode;
}
export const IconColorProvider = ({
  color,
  children,
}: IconColorProviderProps) => (
  <IconColorContext.Provider value={color}>
    {children}
  </IconColorContext.Provider>
);
export const useIconColor = (): string | undefined =>
  useContext(IconColorContext);
export const useResolvedIconColor = (
  explicit: string | undefined,
  fallback: string
): string => {
  const inherited = useIconColor();
  return explicit ?? inherited ?? fallback;
};
