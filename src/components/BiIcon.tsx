/*
 * Universal Bootstrap Icon Component
 * Renders any Bootstrap Icons class name (e.g. "bi-globe2", "bi-envelope-fill")
 * via the Bootstrap Icons CDN CSS.
 */

import React from 'react'

interface BiIconProps {
  icon?: string
  className?: string
  style?: React.CSSProperties
}

export function BiIcon({ icon, className = '', style }: BiIconProps): React.ReactElement {
  if (!icon) {
    return <span className={className} style={style} />
  }

  // Support both "bi-xxx" and "bi bi-xxx" formats
  const iconClass = icon.startsWith('bi bi-') ? icon : `bi ${icon}`

  return (
    <i
      className={`${iconClass} ${className}`.trim()}
      style={style}
      aria-hidden="true"
    />
  )
}

export default BiIcon