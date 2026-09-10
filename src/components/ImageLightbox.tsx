import { useEffect, useRef, useState } from 'react';

const MIN_SCALE = 1;
const MAX_SCALE = 6;

interface ImageLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

/** Full-screen viewer for a verification photo/document — scroll or the +/- buttons to zoom,
 *  drag to pan once zoomed in. Lets an admin check whether an ID photo is blurry or too small,
 *  or spot a selfie mismatch, without guessing from a fixed 320px thumbnail. */
export function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragState = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') zoomBy(0.5);
      if (e.key === '-') zoomBy(-0.5);
    };
    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clampScale(value: number) {
    return Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));
  }

  function zoomBy(delta: number) {
    setScale((prev) => {
      const next = clampScale(prev + delta);
      if (next === MIN_SCALE) setPos({ x: 0, y: 0 });
      return next;
    });
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    zoomBy(e.deltaY < 0 ? 0.4 : -0.4);
  }

  function handleMouseDown(e: React.MouseEvent) {
    if (scale === MIN_SCALE) return;
    dragState.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!dragState.current) return;
    const { startX, startY, origX, origY } = dragState.current;
    setPos({ x: origX + (e.clientX - startX), y: origY + (e.clientY - startY) });
  }

  function stopDragging() {
    dragState.current = null;
  }

  function resetZoom() {
    setScale(1);
    setPos({ x: 0, y: 0 });
  }

  return (
    <div
      className="lightbox-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="lightbox-toolbar">
        <button type="button" className="btn btn-secondary" onClick={() => zoomBy(-0.5)} disabled={scale <= MIN_SCALE}>
          −
        </button>
        <span className="muted">{Math.round(scale * 100)}%</span>
        <button type="button" className="btn btn-secondary" onClick={() => zoomBy(0.5)} disabled={scale >= MAX_SCALE}>
          +
        </button>
        <button type="button" className="btn btn-secondary" onClick={resetZoom} disabled={scale === MIN_SCALE}>
          Reset
        </button>
        <button type="button" className="btn btn-secondary lightbox-close" onClick={onClose}>
          Close ✕
        </button>
      </div>
      <div
        className="lightbox-viewport"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
      >
        <img
          src={src}
          alt={alt}
          className="lightbox-image"
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
            cursor: scale > MIN_SCALE ? 'grab' : 'default',
          }}
          draggable={false}
        />
      </div>
    </div>
  );
}
