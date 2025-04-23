
import { useEffect, useState } from "react";

export function useRotatingText(words: string[], interval: number = 2000) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, interval);
    return () => clearInterval(timer);
  }, [words.length, interval]);

  return words[index];
}
