// Снимка с мързеливо зареждане и placeholder при липса/грешка.
import { useState } from 'react'
import Icon from './Icons'
import { safeUrl } from '../utils/sanitize'

function Placeholder({ className }) {
  return (
    <div className={`photo photo--empty ${className || ''}`} aria-hidden="true">
      <div className="photo__wave">
        <Icon name="image" size={30} />
        <span>Няма снимка</span>
      </div>
    </div>
  )
}

export default function Photo({ src, alt = '', className, eager = false }) {
  const [failed, setFailed] = useState(false)
  const safe = safeUrl(src)
  if (!safe || failed) return <Placeholder className={className} />
  return (
    <img
      className={`photo ${className || ''}`}
      src={safe}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}
