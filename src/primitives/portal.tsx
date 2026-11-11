import { RootPortal, View } from "@tarojs/components";
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useId,
  useRef,
  useSyncExternalStore,
  useState,
} from "react";
import type { ReactNode } from "react";

import { useDirection } from "../hooks/use-direction";
import { useTheme, useThemeStyles } from "../theme/use-theme";
import {
  BackHandlerContext,
  OverlayOrderContext,
  pageBackHandlerStore,
  reserveOverlayOrder,
} from "./back-handler-context";
import { BackHandlerHost } from "./back-handler-host";
import {
  CanvasPaintActiveContext,
  CanvasPaintContext,
  pageCanvasPaintStack,
} from "./canvas-paint-context";
import {
  captureFocusRestore,
  FocusRestorationStore,
} from "./focus-restoration-store";
import { ModalIsolationStore } from "./modal-isolation-store";

const PortalVisibilityContext = createContext(true);
const PortalContext = createContext(false);
const ModalIsolationContext = createContext<ModalIsolationStore | null>(null);
const FocusRestorationContext = createContext<FocusRestorationStore | null>(
  null
);
export const PortalProvider = ({
  children,
  active = true,
}: {
  children: ReactNode;
  active?: boolean;
}) => {
  const [backStore] = useState(pageBackHandlerStore);
  const inheritedPaint = useContext(CanvasPaintContext);
  const [localPaint] = useState(pageCanvasPaintStack);
  const paint = inheritedPaint ?? localPaint;
  const modal = useRef<ModalIsolationStore | null>(null);
  const focus = useRef<FocusRestorationStore | null>(null);
  modal.current ??= new ModalIsolationStore();
  focus.current ??= new FocusRestorationStore();
  return (
    <CanvasPaintContext.Provider value={paint}>
      <BackHandlerContext.Provider value={backStore}>
        <PortalVisibilityContext.Provider value={active}>
          <PortalContext.Provider value>
            <ModalIsolationContext.Provider value={modal.current}>
              <FocusRestorationContext.Provider value={focus.current}>
                {children}
              </FocusRestorationContext.Provider>
            </ModalIsolationContext.Provider>
          </PortalContext.Provider>
        </PortalVisibilityContext.Provider>
        {active ? <BackHandlerHost store={backStore} /> : null}
      </BackHandlerContext.Provider>
    </CanvasPaintContext.Provider>
  );
};
const usePortalProvider = (component: string) => {
  if (!useContext(PortalContext)) {
    throw new Error(`${component} must be used within a <PanelUIProvider>`);
  }
};
const useModalIsolationStore = (component: string) => {
  const store = useContext(ModalIsolationContext);
  if (!store) {
    throw new Error(`${component} must be used within a <PanelUIProvider>`);
  }
  return store;
};
const useFocusRestorationStore = (component: string) => {
  const store = useContext(FocusRestorationContext);
  if (!store) {
    throw new Error(`${component} must be used within a <PanelUIProvider>`);
  }
  return store;
};
const idlePortalSubscribe = () => () => {};
const emptyPortalOrder = () => 0;
const PortalLayer = ({
  children,
  order,
  interactive = true,
  priority = "normal",
}: {
  children: ReactNode;
  order: number;
  priority?: "normal" | "feedback";
  interactive?: boolean;
}) => {
  usePortalProvider("Portal");
  const { theme } = useTheme();
  const themeStyle = useThemeStyles();
  const direction = useDirection();
  const visible = useContext(PortalVisibilityContext);
  const paint = useContext(CanvasPaintContext);
  const normalOrder = useSyncExternalStore(
    priority === "feedback"
      ? (paint?.subscribe ?? idlePortalSubscribe)
      : idlePortalSubscribe,
    priority === "feedback"
      ? (paint?.getNormalSnapshot ?? emptyPortalOrder)
      : emptyPortalOrder,
    emptyPortalOrder
  );
  const effectiveOrder =
    priority === "feedback" ? Math.max(order, normalOrder) + 0.5 : order;
  useLayoutEffect(
    () => (visible ? paint?.acquire(order, priority) : undefined),
    [paint, order, priority, visible]
  );
  if (!visible) {
    return null;
  }
  return (
    <OverlayOrderContext.Provider value={effectiveOrder}>
      <CanvasPaintActiveContext.Provider value={interactive}>
        <RootPortal enable>
          <View
            className={`panelui-theme panelui-background-transparent panelui-theme--${theme} panelui-portal-layer-${interactive ? "active" : "inactive"}`}
            style={{
              ...themeStyle,
              direction,
              inset: 0,
              pointerEvents: "none",
              position: "fixed",
              zIndex: 1000 + effectiveOrder * 2,
            }}
          >
            {children}
          </View>
        </RootPortal>
      </CanvasPaintActiveContext.Provider>
    </OverlayOrderContext.Provider>
  );
};
export const Portal = ({
  children,
  priority = "normal",
}: {
  children: ReactNode;
  priority?: "normal" | "feedback";
}) => {
  const [order] = useState(reserveOverlayOrder);
  return (
    <PortalLayer order={order} priority={priority}>
      {children}
    </PortalLayer>
  );
};
export const ModalPortal = ({
  children,
  interactive = true,
}: {
  children: ReactNode;
  interactive?: boolean;
}) => {
  const isolation = useModalIsolationStore("ModalPortal");
  const focus = useFocusRestorationStore("ModalPortal");
  const owner = useId();
  const [order] = useState(reserveOverlayOrder);
  useEffect(() => {
    if (!interactive) {
      return;
    }
    const releaseIsolation = isolation.acquire(owner);
    const releaseFocus = focus.acquire(owner, captureFocusRestore(), order);
    return () => {
      releaseIsolation();
      releaseFocus();
    };
  }, [focus, isolation, order, owner, interactive]);
  return (
    <PortalLayer order={order} interactive={interactive}>
      {children}
    </PortalLayer>
  );
};
export const FocusRestorePortal = ({
  children,
  interactive = true,
}: {
  children: ReactNode;
  interactive?: boolean;
}) => {
  const store = useFocusRestorationStore("FocusRestorePortal");
  const owner = useId();
  const [order] = useState(reserveOverlayOrder);
  useEffect(
    () =>
      interactive
        ? store.acquire(owner, captureFocusRestore(), order)
        : undefined,
    [order, owner, store, interactive]
  );
  return (
    <PortalLayer order={order} interactive={interactive}>
      {children}
    </PortalLayer>
  );
};
export const useModalIsolationActive = () => {
  const store = useModalIsolationStore("useModalIsolationActive");
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot
  );
};
export const PortalHost = () => {
  usePortalProvider("PortalHost");
  return <RootPortal enable />;
};
