import { Fragment, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

// Minimal Markdown renderer covering what Kanboard task descriptions and comments
// typically use: headings, paragraphs, lists, fenced code, inline code, emphasis,
// links and task references (#123). Output is built from React elements only, so
// no raw HTML is ever injected.

const INLINE_TOKEN = /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*\s][^*]*\*|_[^_\s][^_]*_|\[[^\]]+\]\([^)\s]+\)|https?:\/\/[^\s<]+|#\d+)/g

function renderInline(text: string): ReactNode[] {
  const parts = text.split(INLINE_TOKEN)
  return parts.map((part, index) => {
    if (index % 2 === 0) return part
    if (part.startsWith('`')) return <code key={index}>{part.slice(1, -1)}</code>
    if (part.startsWith('**') || part.startsWith('__')) return <strong key={index}>{renderInline(part.slice(2, -2))}</strong>
    if (part.startsWith('*') || part.startsWith('_')) return <em key={index}>{renderInline(part.slice(1, -1))}</em>
    if (part.startsWith('[')) {
      const match = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part)
      if (match) {
        return (
          <a key={index} href={match[2]} target="_blank" rel="noopener noreferrer">
            {match[1]}
          </a>
        )
      }
    }
    if (part.startsWith('#')) {
      return (
        <Link key={index} to={`/tasks/${part.slice(1)}`}>
          {part}
        </Link>
      )
    }
    return (
      <a key={index} href={part} target="_blank" rel="noopener noreferrer">
        {part}
      </a>
    )
  })
}

export function Markdown({ text }: { text: string }) {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const blocks: ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.trim() === '') {
      i++
      continue
    }

    if (line.startsWith('```')) {
      const code: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) code.push(lines[i++])
      i++
      blocks.push(
        <pre key={blocks.length}>
          <code>{code.join('\n')}</code>
        </pre>,
      )
      continue
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line)
    if (heading) {
      const level = heading[1].length
      const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
      blocks.push(<Tag key={blocks.length}>{renderInline(heading[2])}</Tag>)
      i++
      continue
    }

    const listMatch = /^\s*([-*+]|\d+[.)])\s+/.exec(line)
    if (listMatch) {
      const ordered = /\d/.test(listMatch[1])
      const items: ReactNode[] = []
      while (i < lines.length) {
        const itemMatch = /^\s*(?:[-*+]|\d+[.)])\s+(.*)$/.exec(lines[i])
        if (!itemMatch) break
        const checkbox = /^\[( |x|X)\]\s+(.*)$/.exec(itemMatch[1])
        items.push(
          <li key={items.length}>
            {checkbox ? (
              <>
                <input type="checkbox" checked={checkbox[1] !== ' '} readOnly disabled /> {renderInline(checkbox[2])}
              </>
            ) : (
              renderInline(itemMatch[1])
            )}
          </li>,
        )
        i++
      }
      blocks.push(ordered ? <ol key={blocks.length}>{items}</ol> : <ul key={blocks.length}>{items}</ul>)
      continue
    }

    if (line.startsWith('>')) {
      const quote: string[] = []
      while (i < lines.length && lines[i].startsWith('>')) quote.push(lines[i++].replace(/^>\s?/, ''))
      blocks.push(<blockquote key={blocks.length}>{renderInline(quote.join(' '))}</blockquote>)
      continue
    }

    const paragraph: string[] = []
    while (i < lines.length && lines[i].trim() !== '' && !/^(```|#{1,6}\s|>|\s*(?:[-*+]|\d+[.)])\s+)/.test(lines[i])) {
      paragraph.push(lines[i++])
    }
    blocks.push(
      <p key={blocks.length}>
        {paragraph.map((p, index) => (
          <Fragment key={index}>
            {index > 0 && <br />}
            {renderInline(p)}
          </Fragment>
        ))}
      </p>,
    )
  }

  return <div className="markdown">{blocks}</div>
}
