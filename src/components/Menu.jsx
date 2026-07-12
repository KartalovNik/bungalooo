// Просто изскачащо меню (popover). Затваря се при клик отвън или Esc.
import { useEffect, useRef, useState, cloneElement } from 'react'
import Icon from './Icons'

export default function Menu({ trigger, items = [], align = 'end', label = 'Меню', children }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const triggerEl = cloneElement(trigger, {
    onClick: (e) => {
      e.stopPropagation()
      setOpen((o) => !o)
      trigger.props.onClick?.(e)
    },
    'aria-haspopup': 'menu',
    'aria-expanded': open,
  })

  return (
    <div className="menu-wrap" ref={wrapRef}>
      {triggerEl}
      {open && (
        <div className={`menu menu--${align}`} role="menu" aria-label={label}>
          {children
            ? children(() => setOpen(false))
            : items.map((it, i) =>
                it.separator ? (
                  <div key={i} className="menu__sep" role="separator" />
                ) : (
                  <button
                    key={i}
                    role="menuitem"
                    className={`menu__item${it.danger ? ' menu__item--danger' : ''}${
                      it.active ? ' menu__item--active' : ''
                    }`}
                    disabled={it.disabled}
                    onClick={(e) => {
                      e.stopPropagation()
                      setOpen(false)
                      it.onClick?.()
                    }}
                  >
                    {it.icon && <Icon name={it.icon} size={18} />}
                    <span>{it.label}</span>
                    {it.active && <Icon name="check" size={16} className="menu__check" />}
                  </button>
                )
              )}
        </div>
      )}
    </div>
  )
}
