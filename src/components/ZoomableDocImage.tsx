import { useState } from 'react';
import { ImageLightbox } from './ImageLightbox';

interface ZoomableDocImageProps {
  src: string;
  alt: string;
}

/** A verification thumbnail that opens full-screen and zoomable on click. */
export function ZoomableDocImage({ src, alt }: ZoomableDocImageProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="doc-image-button" onClick={() => setOpen(true)} aria-label={`Open ${alt} full-screen`}>
        <img className="doc-image" src={src} alt={alt} />
      </button>
      {open && <ImageLightbox src={src} alt={alt} onClose={() => setOpen(false)} />}
    </>
  );
}
