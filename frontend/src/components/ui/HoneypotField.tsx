'use client'

/**
 * Visually-hidden spam trap. Real users never see or fill it; naive bots that
 * populate every field do, and the CMS rejects any public submission where `hp`
 * is set. Kept off-screen (not display:none) so bots don't skip it, and hidden
 * from assistive tech + tab order so it never reaches a real user.
 */
export function HoneypotField({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
      <label>
        Leave this field empty
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      </label>
    </div>
  )
}
