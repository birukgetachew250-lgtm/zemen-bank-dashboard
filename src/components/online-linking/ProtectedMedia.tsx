'use client';

import React, { useEffect, useRef } from 'react';

interface ProtectedMediaProps {
  src: string;
  type: 'image' | 'video';
  alt?: string;
  className?: string;
}

/**
 * ProtectedMedia — renders images/videos from the secure /api/online-linking/[id]/media endpoint.
 * Disables right-click, drag, and common save keyboard shortcuts.
 */
export default function ProtectedMedia({ src, type, alt = 'Protected media', className = '' }: ProtectedMediaProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const preventSave = (e: KeyboardEvent) => {
      // Block Ctrl+S, Ctrl+Shift+I, Ctrl+U
      if (
        (e.ctrlKey && e.key === 's') ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
      }
    };

    const preventContext = (e: MouseEvent) => e.preventDefault();
    const preventDrag    = (e: DragEvent)  => e.preventDefault();

    el.addEventListener('contextmenu', preventContext);
    el.addEventListener('dragstart',   preventDrag);
    document.addEventListener('keydown', preventSave);

    return () => {
      el.removeEventListener('contextmenu', preventContext);
      el.removeEventListener('dragstart',   preventDrag);
      document.removeEventListener('keydown', preventSave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative select-none ${className}`}
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {type === 'image' ? (
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="max-w-full max-h-[500px] rounded-xl object-contain"
          style={{ pointerEvents: 'none' }}
          onContextMenu={(e) => e.preventDefault()}
        />
      ) : (
        <video
          src={src}
          controls
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          playsInline
          className="max-w-full max-h-[500px] rounded-xl"
          onContextMenu={(e) => e.preventDefault()}
        >
          Your browser does not support the video tag.
        </video>
      )}

      {/* Invisible overlay to prevent dragging / right-click on the media itself */}
      {type === 'image' && (
        <div
          className="absolute inset-0"
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
          style={{ cursor: 'default' }}
        />
      )}
    </div>
  );
}
