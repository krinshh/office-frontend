import { useRef, useState, useCallback, MouseEvent, TouchEvent } from 'react';

export const useDraggableScroll = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mouseIsDown, setMouseIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = useCallback((e: MouseEvent) => {
    if (!ref.current) return;
    if (e.button !== 0) return; // Only left click

    setMouseIsDown(true);
    setStartX(e.pageX - ref.current.offsetLeft);
    setStartY(e.pageY - ref.current.offsetTop);
    setScrollLeft(ref.current.scrollLeft);
  }, []);

  const onMouseUp = useCallback(() => {
    setMouseIsDown(false);
    setIsDragging(false);
    if (ref.current) {
      ref.current.style.removeProperty('user-select');
      ref.current.style.cursor = 'grab';
    }
  }, []);

  const onMouseLeave = useCallback(() => {
    setMouseIsDown(false);
    setIsDragging(false);
    if (ref.current) {
      ref.current.style.removeProperty('user-select');
      ref.current.style.cursor = 'grab';
    }
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!mouseIsDown || !ref.current) return;

    const x = e.pageX - ref.current.offsetLeft;
    const y = e.pageY - ref.current.offsetTop;
    
    const dx = Math.abs(x - startX);
    const dy = Math.abs(y - startY);

    // Initial movement check: if horizontal movement is dominant, start dragging
    if (!isDragging && dx > 10 && dx > dy * 1.5) {
      setIsDragging(true);
      ref.current.style.userSelect = 'none';
      ref.current.style.cursor = 'grabbing';
    }

    if (isDragging) {
      e.preventDefault();
      const walk = (x - startX) * 1.5;
      ref.current.scrollLeft = scrollLeft - walk;
    }
  }, [mouseIsDown, isDragging, startX, startY, scrollLeft]);

  // Touch support with same logic
  const onTouchStart = useCallback((e: TouchEvent) => {
    if (!ref.current) return;
    setMouseIsDown(true);
    setStartX(e.touches[0].pageX - ref.current.offsetLeft);
    setStartY(e.touches[0].pageY - ref.current.offsetTop);
    setScrollLeft(ref.current.scrollLeft);
  }, []);

  const onTouchEnd = useCallback(() => {
    setMouseIsDown(false);
    setIsDragging(false);
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!mouseIsDown || !ref.current) return;
    
    const x = e.touches[0].pageX - ref.current.offsetLeft;
    const y = e.touches[0].pageY - ref.current.offsetTop;
    const dx = Math.abs(x - startX);
    const dy = Math.abs(y - startY);

    if (!isDragging && dx > 10 && dx > dy * 1.5) {
      setIsDragging(true);
    }

    if (isDragging) {
      const walk = (x - startX) * 1.5;
      ref.current.scrollLeft = scrollLeft - walk;
    }
  }, [mouseIsDown, isDragging, startX, startY, scrollLeft]);

  return {
    ref,
    onMouseDown,
    onMouseUp,
    onMouseLeave,
    onMouseMove,
    onTouchStart,
    onTouchEnd,
    onTouchMove,
    isDragging
  };
};
