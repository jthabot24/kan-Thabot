import { useState, type KeyboardEvent } from 'react'

export function TagsInput({
  value,
  suggestions,
  onChange,
}: {
  value: string[]
  suggestions: string[]
  onChange: (tags: string[]) => void
}) {
  const [draft, setDraft] = useState('')
  const listId = 'tag-suggestions'

  function add(tag: string) {
    const trimmed = tag.trim()
    if (!trimmed || value.includes(trimmed)) return
    onChange([...value, trimmed])
    setDraft('')
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      add(draft)
    } else if (event.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className="tags-input">
      <ul className="tag-list">
        {value.map((tag) => (
          <li key={tag} className="tag">
            {tag}{' '}
            <button type="button" aria-label={`Remove tag ${tag}`} onClick={() => onChange(value.filter((t) => t !== tag))}>
              ×
            </button>
          </li>
        ))}
      </ul>
      <input
        type="text"
        list={listId}
        placeholder="Add a tag and press Enter"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => add(draft)}
      />
      <datalist id={listId}>
        {suggestions
          .filter((s) => !value.includes(s))
          .map((s) => (
            <option key={s} value={s} />
          ))}
      </datalist>
    </div>
  )
}
