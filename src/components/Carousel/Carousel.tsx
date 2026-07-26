import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
  itemWidth: number; // px
}

function Carousel<T>({ items, renderItem, keyExtractor, itemWidth }: CarouselProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.85;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const arrowStyle: React.CSSProperties = {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    zIndex: 2, width: 34, height: 34, borderRadius: '50%',
    background: 'var(--ps-surface)', border: '1px solid var(--ps-border)',
    boxShadow: 'var(--ps-shadow-md)', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: 'var(--ps-text)',
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => scroll('left')}
        aria-label="Scroll left"
        style={{ ...arrowStyle, left: -16 }}
        className="hidden sm:flex"
      >
        <ChevronLeft style={{ width: 18, height: 18 }} />
      </button>

      <div
        ref={scrollRef}
        className="no-scrollbar"
        style={{
          display: 'flex', gap: 14, overflowX: 'auto',
          scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch',
          paddingBottom: 4, scrollPaddingLeft: 4,
        }}
      >
        {items.map((item) => (
          <div
            key={keyExtractor(item)}
            style={{ flex: `0 0 ${itemWidth}px`, scrollSnapAlign: 'start' }}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>

      <button
        onClick={() => scroll('right')}
        aria-label="Scroll right"
        style={{ ...arrowStyle, right: -16 }}
        className="hidden sm:flex"
      >
        <ChevronRight style={{ width: 18, height: 18 }} />
      </button>
    </div>
  );
}

export default Carousel;
