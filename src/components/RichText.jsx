import React from 'react';

// Lightweight markdown-ish renderer optimised for our Massnahmen / Admin-Task
// descriptions. No dependencies. Supports:
//   ## Heading                    → h3
//   ### Subheading                → h4
//   **bold** *italic* `code`      → inline
//   [text](url)                   → link
//   bare https?://… URLs          → auto-link
//   - item / * item               → unordered list
//   blank line                    → paragraph break
//   Numbered sections "1) Title"  → auto h3 (if line stands alone)

const URL_RE = /(\bhttps?:\/\/[^\s<>"'\)]+[A-Za-z0-9\/])/g;
const MD_LINK_RE = /\[([^\]]+)\]\(([^)\s]+)\)/g;

function renderInline(text, keyPrefix) {
  if (!text) return null;
  // Sequentially tokenize: links → bold → italic → code → bare urls.
  // Use a simple multi-pass approach with a sentinel array of nodes.
  let parts = [text];

  // 1. Markdown links [text](url)
  parts = parts.flatMap((p) => {
    if (typeof p !== 'string') return [p];
    const out = [];
    let lastIdx = 0;
    let m;
    const re = new RegExp(MD_LINK_RE.source, 'g');
    while ((m = re.exec(p)) !== null) {
      if (m.index > lastIdx) out.push(p.slice(lastIdx, m.index));
      out.push({ type: 'link', label: m[1], url: m[2] });
      lastIdx = m.index + m[0].length;
    }
    if (lastIdx < p.length) out.push(p.slice(lastIdx));
    return out;
  });

  // 2. **bold**
  parts = parts.flatMap((p) => {
    if (typeof p !== 'string') return [p];
    const out = [];
    let lastIdx = 0;
    const re = /\*\*([^*\n]+)\*\*/g;
    let m;
    while ((m = re.exec(p)) !== null) {
      if (m.index > lastIdx) out.push(p.slice(lastIdx, m.index));
      out.push({ type: 'bold', text: m[1] });
      lastIdx = m.index + m[0].length;
    }
    if (lastIdx < p.length) out.push(p.slice(lastIdx));
    return out;
  });

  // 3. *italic* (single asterisk, but not inside word)
  parts = parts.flatMap((p) => {
    if (typeof p !== 'string') return [p];
    const out = [];
    let lastIdx = 0;
    const re = /(^|[\s(])\*([^*\n]+)\*(?=[\s.,;:!?)\]]|$)/g;
    let m;
    while ((m = re.exec(p)) !== null) {
      const start = m.index + m[1].length;
      if (start > lastIdx) out.push(p.slice(lastIdx, start));
      out.push({ type: 'italic', text: m[2] });
      lastIdx = start + m[2].length + 2;
    }
    if (lastIdx < p.length) out.push(p.slice(lastIdx));
    return out;
  });

  // 4. `code`
  parts = parts.flatMap((p) => {
    if (typeof p !== 'string') return [p];
    const out = [];
    let lastIdx = 0;
    const re = /`([^`\n]+)`/g;
    let m;
    while ((m = re.exec(p)) !== null) {
      if (m.index > lastIdx) out.push(p.slice(lastIdx, m.index));
      out.push({ type: 'code', text: m[1] });
      lastIdx = m.index + m[0].length;
    }
    if (lastIdx < p.length) out.push(p.slice(lastIdx));
    return out;
  });

  // 5. bare URLs in remaining strings
  parts = parts.flatMap((p) => {
    if (typeof p !== 'string') return [p];
    const out = [];
    let lastIdx = 0;
    const re = new RegExp(URL_RE.source, 'g');
    let m;
    while ((m = re.exec(p)) !== null) {
      if (m.index > lastIdx) out.push(p.slice(lastIdx, m.index));
      out.push({ type: 'link', label: m[1], url: m[1] });
      lastIdx = m.index + m[0].length;
    }
    if (lastIdx < p.length) out.push(p.slice(lastIdx));
    return out;
  });

  return parts.map((p, i) => {
    const k = `${keyPrefix}-${i}`;
    if (typeof p === 'string') return <React.Fragment key={k}>{p}</React.Fragment>;
    if (p.type === 'link') {
      return (
        <a
          key={k}
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-scnat-red hover:underline break-words"
        >
          {p.label}
        </a>
      );
    }
    if (p.type === 'bold') return <strong key={k} className="font-semibold text-txt-primary">{p.text}</strong>;
    if (p.type === 'italic') return <em key={k}>{p.text}</em>;
    if (p.type === 'code') return <code key={k} className="font-mono text-[0.85em] bg-bg-elevated text-txt-primary px-1 py-px rounded-sm">{p.text}</code>;
    return null;
  });
}

function parseBlocks(src) {
  const text = (src || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = text.split('\n');
  const blocks = [];
  let para = []; // array of strings (un-merged lines of current paragraph)

  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: 'p', lines: para });
      para = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const ln = raw.trim();

    if (!ln) {
      flushPara();
      continue;
    }

    // ATX headings
    let m;
    if ((m = /^####\s+(.*)$/.exec(ln))) { flushPara(); blocks.push({ type: 'h5', text: m[1] }); continue; }
    if ((m = /^###\s+(.*)$/.exec(ln))) { flushPara(); blocks.push({ type: 'h4', text: m[1] }); continue; }
    if ((m = /^##\s+(.*)$/.exec(ln))) { flushPara(); blocks.push({ type: 'h3', text: m[1] }); continue; }
    if ((m = /^#\s+(.*)$/.exec(ln))) { flushPara(); blocks.push({ type: 'h2', text: m[1] }); continue; }

    // Numbered section "1) Title" / "1. Title" – treat as h3 if it starts a paragraph
    if (para.length === 0 && /^\d+[\)\.]\s+\S/.test(ln)) {
      flushPara();
      blocks.push({ type: 'h3', text: ln });
      continue;
    }

    // Bullet list
    if (/^[-*•]\s+\S/.test(ln)) {
      flushPara();
      const items = [ln.replace(/^[-*•]\s+/, '')];
      while (i + 1 < lines.length && /^[-*•]\s+\S/.test(lines[i + 1].trim())) {
        i++;
        items.push(lines[i].trim().replace(/^[-*•]\s+/, ''));
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    // Numbered list "1. " (only if previous block was also a numbered list or this para is empty)
    // skipped to keep simple.

    para.push(ln);
  }
  flushPara();

  // Heuristic: a paragraph that is exactly one short line (≤45 chars, no terminal
  // punctuation) followed by another paragraph block is treated as a sub-heading.
  for (let i = 0; i < blocks.length - 1; i++) {
    const b = blocks[i];
    if (b.type !== 'p') continue;
    if (b.lines.length !== 1) continue;
    const txt = b.lines[0];
    if (txt.length > 45) continue;
    if (/[.!?,;]\s*$/.test(txt)) continue;
    // Don't promote if the line itself contains markdown structural chars
    if (/^[-*•]\s/.test(txt)) continue;
    if (/\bhttps?:\/\//.test(txt)) continue;
    const next = blocks[i + 1];
    if (next.type !== 'p' && next.type !== 'ul') continue;
    // Promote
    blocks[i] = { type: 'h4', text: txt };
  }

  return blocks;
}

export default function RichText({ value, className = '' }) {
  if (!value || !value.trim()) return null;
  const blocks = parseBlocks(value);

  return (
    <div className={`rich-text text-sm text-txt-secondary leading-relaxed space-y-3 ${className}`}>
      {blocks.map((b, i) => {
        const k = `b-${i}`;
        if (b.type === 'h2') return <h2 key={k} className="text-base font-heading font-semibold text-txt-primary mt-4 first:mt-0 mb-1">{renderInline(b.text, k)}</h2>;
        if (b.type === 'h3') return <h3 key={k} className="text-[15px] font-heading font-semibold text-txt-primary mt-4 first:mt-0 mb-1">{renderInline(b.text, k)}</h3>;
        if (b.type === 'h4') return <h4 key={k} className="text-[13px] font-semibold text-txt-primary mt-2 mb-0.5 uppercase tracking-wide">{renderInline(b.text, k)}</h4>;
        if (b.type === 'h5') return <h5 key={k} className="text-xs font-semibold text-txt-primary mt-1.5 mb-0.5">{renderInline(b.text, k)}</h5>;
        if (b.type === 'ul') {
          return (
            <ul key={k} className="list-disc pl-5 space-y-1 marker:text-txt-tertiary">
              {b.items.map((it, j) => (
                <li key={`${k}-${j}`} className="leading-relaxed">{renderInline(it, `${k}-${j}`)}</li>
              ))}
            </ul>
          );
        }
        // Paragraph: preserve intra-paragraph soft line breaks via <br/>
        return (
          <p key={k} className="leading-relaxed whitespace-normal">
            {b.lines.map((ln, j) => (
              <React.Fragment key={`${k}-${j}`}>
                {j > 0 && <br />}
                {renderInline(ln, `${k}-${j}`)}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

// Optional: tiny helper to "auto-format" a plain block of pasted text into
// markdown that this renderer can present nicely. Used by the editor.
// Rules:
//   - "N)" / "N." prefix at start of paragraph  →  ## N) ...
//   - blank-line-isolated short line followed by paragraph → **line**
//   - common bullet chars normalised to "-"
export function autoFormatDescription(src) {
  if (!src) return '';
  let text = src.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\u00A0/g, ' ');
  // collapse 3+ blank lines
  text = text.replace(/\n{3,}/g, '\n\n');
  const lines = text.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    let ln = lines[i];
    const trimmed = ln.trim();
    // Numbered section heading
    if (/^\d+[\)\.]\s+\S/.test(trimmed) && !trimmed.startsWith('## ')) {
      // ensure preceding blank line for clarity
      if (out.length && out[out.length - 1].trim() !== '') out.push('');
      out.push('## ' + trimmed);
      continue;
    }
    // Normalize bullet chars
    if (/^[•·●○∙]\s+/.test(trimmed)) {
      out.push(trimmed.replace(/^[•·●○∙]\s+/, '- '));
      continue;
    }
    out.push(ln);
  }
  let result = out.join('\n');

  // Promote isolated short lines (between blank lines or at start of section)
  // followed by content into bold sub-headings.
  const blocks = result.split(/\n{2,}/);
  for (let i = 0; i < blocks.length; i++) {
    const blk = blocks[i];
    const blkLines = blk.split('\n');
    if (blkLines.length < 2) continue;
    const first = blkLines[0].trim();
    if (
      first.length > 0 &&
      first.length <= 45 &&
      !/[.!?,;:]\s*$/.test(first) &&
      !/^#/.test(first) &&
      !/^[-*]\s/.test(first) &&
      !/^\*\*/.test(first) &&
      !/\bhttps?:\/\//.test(first)
    ) {
      blkLines[0] = '**' + first + '**';
      blocks[i] = blkLines.join('\n');
    }
  }
  return blocks.join('\n\n').trim() + '\n';
}
