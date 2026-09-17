import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

interface DropdownProps {
  trigger: ReactNode
  children: ReactNode
  className?: string
  ariaLabel?: string
}

/** React port of assets/js/src/Dropdown.js using the legacy .dropdown markup/CSS */
export function Dropdown({ trigger, children, className, ariaLabel }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDocumentClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('click', onDocumentClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onDocumentClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className={`dropdown react-dropdown${className ? ` ${className}` : ''}`} ref={ref}>
      <a
        href="#"
        className="dropdown-menu dropdown-menu-link-icon"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={(e) => {
          e.preventDefault()
          setOpen((v) => !v)
        }}
      >
        {trigger}
      </a>
      {open && (
        <ul className="dropdown-submenu-open react-dropdown-list" onClick={() => setOpen(false)}>
          {children}
        </ul>
      )}
    </div>
  )
}
