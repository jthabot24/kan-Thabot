import type { ColorList } from '../../api/types'

// Port of Kanboard.Task.prototype.renderColorPicker (assets/js/src/Task.js):
// each option shows a colored square next to the color label.
export function ColorPicker({
  id,
  colors,
  value,
  onChange,
}: {
  id?: string
  colors: ColorList
  value: string
  onChange: (value: string) => void
}) {
  const entries = Object.entries(colors)
  return (
    <div className="color-picker" role="radiogroup" id={id}>
      {entries.map(([colorId, label]) => (
        <label key={colorId} className={`color-picker-option${value === colorId ? ' selected' : ''}`}>
          <input
            type="radio"
            name={id ?? 'color_id'}
            value={colorId}
            checked={value === colorId}
            onChange={() => onChange(colorId)}
          />
          <span className={`color-picker-square color-${colorId}`} />
          <span className="color-picker-label">{label}</span>
        </label>
      ))}
    </div>
  )
}
