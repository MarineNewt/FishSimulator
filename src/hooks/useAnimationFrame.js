import { useEffect, useRef } from "react";

const useAnimationFrame = (callback) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const loop = (time) => {
      callbackRef.current(time);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }, []);
};

export default useAnimationFrame;
