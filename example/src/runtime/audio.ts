import { createInnerAudioContext } from "@tarojs/taro";
import { useEffect, useMemo, useState } from "react";

export const useAudioPlayer = (source: string | { uri: string } | null) => {
  const player = useMemo(() => createInnerAudioContext(), []);
  const uri = typeof source === "string" ? source : source?.uri;
  useEffect(() => {
    if (uri) {
      player.src = uri;
    }
  }, [player, uri]);
  useEffect(() => () => player.destroy(), [player]);
  return player;
};
export const useAudioPlayerStatus = (
  player: ReturnType<typeof useAudioPlayer>
) => {
  const [status, setStatus] = useState({
    currentTime: 0,
    didJustFinish: false,
    duration: 0,
    playing: false,
  });
  useEffect(() => {
    const update = () =>
      setStatus({
        currentTime: player.currentTime,
        didJustFinish: false,
        duration: player.duration,
        playing: !player.paused,
      });
    const end = () =>
      setStatus((value) => ({ ...value, didJustFinish: true, playing: false }));
    player.onPlay(update);
    player.onPause(update);
    player.onTimeUpdate(update);
    player.onEnded(end);
    return () => {
      player.offPlay(update);
      player.offPause(update);
      player.offTimeUpdate(update);
      player.offEnded(end);
    };
  }, [player]);
  return status;
};
