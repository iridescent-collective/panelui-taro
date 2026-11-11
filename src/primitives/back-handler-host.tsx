import { PageContainer } from "@tarojs/components";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import type { BackHandlerStore } from "./back-handler-store";

export const BackHandlerHost = ({ store }: { store: BackHandlerStore }) => {
  const owner = useId();
  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot
  );
  const [cycle, setCycle] = useState(0);
  const mounted = useRef(false);
  const leaving = useRef(false);
  useEffect(() => {
    mounted.current = true;
    const release = store.registerHost(owner);
    return () => {
      mounted.current = false;
      release();
    };
  }, [owner, store]);
  if (snapshot.host !== owner) {
    return null;
  }
  return (
    <PageContainer
      key={cycle}
      show={snapshot.active}
      duration={0}
      overlay={false}
      position="center"
      zIndex={0}
      customStyle="width:1px;height:1px;opacity:0;pointer-events:none;background:transparent;"
      onBeforeLeave={() => {
        if (leaving.current || !store.getSnapshot().active) {
          return;
        }
        leaving.current = true;
        store.trigger();
      }}
      onAfterLeave={() => {
        leaving.current = false;
        if (mounted.current && store.getSnapshot().active) {
          setCycle((current) => current + 1);
        }
      }}
    />
  );
};
