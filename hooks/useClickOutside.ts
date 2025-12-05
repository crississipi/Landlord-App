import { useEffect, useRef } from 'react';

export function useClickOutside<T extends HTMLElement>(
  onClickOutside: () => void,
  active: boolean = true
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!active) return;

    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutside();
      }
    };

    document.addEventListener('mousedown', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [onClickOutside, active]);

  return ref;
}
