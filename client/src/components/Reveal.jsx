import { useEffect, useRef, useState } from 'react'

/**
 * Fades + rises its children the first time they scroll into view.
 *
 * The visual state lives in CSS (`[data-reveal]` / `.is-visible`), so when the
 * user prefers reduced motion the stylesheet forces everything visible and this
 * component becomes a no-op wrapper. Elements already on screen at mount reveal
 * immediately, which keeps above-the-fold content from flashing.
 */
export default function Reveal({ children, delay = 0, as: Tag = 'div', className = '', style, ...rest }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || shown) return
    // No IntersectionObserver (or a very old browser) — show it and move on.
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [shown])

  return (
    <Tag
      ref={ref}
      data-reveal=""
      className={`${className}${shown ? ' is-visible' : ''}`}
      style={{ '--fi-delay': `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
