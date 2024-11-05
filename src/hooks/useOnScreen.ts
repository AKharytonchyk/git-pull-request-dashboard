import { useEffect, useState, useRef, RefObject } from 'react';

export const useOnScreen = (ref: RefObject<Element>, rootMargin = '0px', once: boolean = true) => {
  const observer = useRef<IntersectionObserver | null>(null);
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    observer.current = new IntersectionObserver(
      ([entry]) => {
        setIntersecting(entry.isIntersecting);
        if (once && entry.isIntersecting) {
          observer.current?.unobserve(entry.target);
        }
      },
      {
        rootMargin,
      }
    );
  }, [rootMargin, once]);

  useEffect(() => {
    if (ref.current) {
      observer.current?.observe(ref.current);
    }

    return () => {
      observer.current?.disconnect();
    };
  }, [ref]);

  return isIntersecting;
}
