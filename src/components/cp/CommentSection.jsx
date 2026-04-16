import { useState } from 'react';
import { MessageSquare, ChevronDown, ChevronRight, Send, Trash2 } from 'lucide-react';

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'gerade eben';
  if (mins < 60) return `vor ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `vor ${hrs}h`;
  return `vor ${Math.floor(hrs / 24)}d`;
}

export default function CommentSection({ comments, onAdd, onDelete }) {
  const [text, setText] = useState('');
  const [expanded, setExpanded] = useState(comments.length > 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text.trim());
    setText('');
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-[10px] font-mono text-txt-tertiary hover:text-txt-secondary transition-colors mb-2"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        Kommentare {comments.length > 0 && `(${comments.length})`}
        {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>

      {expanded && (
        <div className="space-y-2 pl-1">
          {comments.length > 0 && (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {comments.map(c => (
                <div key={c.id} className="group flex items-start gap-2 bg-bg-elevated/60 rounded-sm px-2.5 py-2 border border-bd-faint/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-txt-primary leading-snug whitespace-pre-wrap">{c.text}</p>
                    <span className="text-[9px] font-mono text-txt-tertiary mt-0.5 inline-block">{timeAgo(c.createdAt)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
                    className="p-0.5 text-txt-tertiary/30 hover:text-scnat-red opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Kommentar schreiben..."
              className="flex-1 bg-bg-elevated border border-bd-faint text-txt-primary text-[11px] px-2.5 py-1.5 rounded-sm focus:border-purple-500/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="p-1.5 text-purple-400 hover:text-purple-300 disabled:text-txt-tertiary/30 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
