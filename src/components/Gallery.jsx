// Галерия със снимки за детайлния изглед (главна снимка + миниатюри + лупа).
import { useState, useEffect } from 'react'
import Photo from './Photo'
import Icon from './Icons'

export default function Gallery({ photos = [], alt = '' }) {
  const list = photos.filter(Boolean)
  const [idx, setIdx] = useState(0)
  const [zoom, setZoom] = useState(false)

  useEffect(() => {
    if (!zoom) return
    const onKey = (e) => {
      if (e.key === 'Escape') setZoom(false)
      if (e.key === 'ArrowRight') setIdx((i) => (i + 1) % list.length)
      if (e.key === 'ArrowLeft') setIdx((i) => (i - 1 + list.length) % list.length)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [zoom, list.length])

  if (!list.length) {
    return <Photo src={null} alt={alt} className="gallery__main" />
  }

  return (
    <div className="gallery">
      <button className="gallery__main-btn" onClick={() => setZoom(true)} aria-label="Увеличи снимката">
        <Photo src={list[idx]} alt={alt} className="gallery__main" eager />
        <span className="gallery__zoom"><Icon name="search" size={16} /></span>
      </button>

      {list.length > 1 && (
        <div className="gallery__thumbs">
          {list.map((p, i) => (
            <button
              key={i}
              className={`gallery__thumb${i === idx ? ' gallery__thumb--on' : ''}`}
              onClick={() => setIdx(i)}
              aria-label={`Снимка ${i + 1}`}
            >
              <Photo src={p} alt="" />
            </button>
          ))}
        </div>
      )}

      {zoom && (
        <div className="lightbox" onClick={() => setZoom(false)}>
          <button className="lightbox__close" aria-label="Затвори"><Icon name="close" size={24} /></button>
          {list.length > 1 && (
            <button className="lightbox__nav lightbox__nav--prev" aria-label="Предишна"
              onClick={(e) => { e.stopPropagation(); setIdx((i) => (i - 1 + list.length) % list.length) }}>
              <Icon name="chevron" size={28} className="rot90ccw" />
            </button>
          )}
          <img className="lightbox__img" src={list[idx]} alt={alt} onClick={(e) => e.stopPropagation()} />
          {list.length > 1 && (
            <button className="lightbox__nav lightbox__nav--next" aria-label="Следваща"
              onClick={(e) => { e.stopPropagation(); setIdx((i) => (i + 1) % list.length) }}>
              <Icon name="chevron" size={28} className="rot90cw" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
