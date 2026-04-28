'use client';

import { useEffect, useState } from 'react';

export function JsonStream({
  obj,
  speed = 12,
}: {
  obj: unknown;
  speed?: number;
}) {
  const full = JSON.stringify(obj, null, 2);
  const [shown, setShown] = useState('');

  useEffect(() => {
    setShown('');
    let i = 0;
    const itv = setInterval(() => {
      i += 2;
      setShown(full.slice(0, i));
      if (i >= full.length) clearInterval(itv);
    }, speed);
    return () => clearInterval(itv);
  }, [full, speed]);

  const caret = shown.length < full.length ? '<span style="opacity:1">▍</span>' : '';
  const html =
    shown
      .replace(/("[^"]+")(\s*:)/g, '<span class="json-key">$1</span>$2')
      .replace(/:\s*("[^"]*")/g, ': <span class="json-string">$1</span>')
      .replace(/:\s*(\d+\.?\d*)/g, ': <span class="json-num">$1</span>')
      .replace(/([{}[\],])/g, '<span class="json-punct">$1</span>') + caret;

  return <pre className="json-stream" dangerouslySetInnerHTML={{ __html: html }} />;
}
