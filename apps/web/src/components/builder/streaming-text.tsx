'use client';

import { useEffect, useState } from 'react';

export function StreamingText({
  text,
  speed = 14,
  onDone,
}: {
  text: string;
  speed?: number;
  onDone?: () => void;
}) {
  const [shown, setShown] = useState('');

  useEffect(() => {
    setShown('');
    let i = 0;
    const itv = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(itv);
        onDone?.();
      }
    }, speed);
    return () => clearInterval(itv);
  }, [text, speed, onDone]);

  const caretVisible = shown.length < text.length;

  return (
    <>
      {shown}
      <span style={{ opacity: caretVisible ? 1 : 0, marginLeft: 1 }}>▍</span>
    </>
  );
}
