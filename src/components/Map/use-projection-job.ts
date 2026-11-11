import { useCallback, useEffect, useRef } from "react";

interface ProjectionJob<Identity, Result> {
  identity: Identity;
  revision: number;
  enabled: boolean;
  work: (isCurrent: () => boolean) => Promise<Result>;
  receive: (result: Result) => void;
  fail: (error: unknown) => void;
}
export const useMapProjectionJob = <Identity, Result>({
  identity,
  revision,
  enabled,
  work,
  receive,
  fail,
}: ProjectionJob<Identity, Result>) => {
  const latest = useRef({ enabled, fail, identity, receive, work });
  latest.current = { enabled, fail, identity, receive, work };
  const generation = useRef(0);
  const wanted = useRef(0);
  const busy = useRef<object | null>(null);
  const mounted = useRef(true);
  const drain = useCallback(async () => {
    if (busy.current || !mounted.current || !latest.current.enabled) {
      return;
    }
    const lease = {};
    busy.current = lease;
    const snapshot = latest.current;
    const epoch = generation.current;
    const request = wanted.current;
    try {
      const result = await snapshot.work(
        () =>
          mounted.current &&
          epoch === generation.current &&
          snapshot.identity === latest.current.identity &&
          latest.current.enabled
      );
      if (
        mounted.current &&
        epoch === generation.current &&
        snapshot.identity === latest.current.identity &&
        latest.current.enabled
      ) {
        latest.current.receive(result);
      }
    } catch (error) {
      if (
        mounted.current &&
        epoch === generation.current &&
        snapshot.identity === latest.current.identity &&
        latest.current.enabled
      ) {
        latest.current.fail(error);
      }
    } finally {
      if (busy.current === lease) {
        busy.current = null;
        if (
          mounted.current &&
          (epoch !== generation.current || request !== wanted.current)
        ) {
          void drain();
        }
      }
    }
  }, []);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      generation.current += 1;
    };
  }, []);
  useEffect(() => {
    generation.current += 1;
    wanted.current += 1;
    void drain();
  }, [identity, enabled, drain]);
  useEffect(() => {
    wanted.current += 1;
    void drain();
  }, [revision, drain]);
};
