import { TEMPLATES } from '../emv/templates'
import type { ResponseTemplate } from '../emv/templates'

interface Props {
  current: string
  onSelect: (t: ResponseTemplate) => void
  onImport: () => void
}

export default function Sidebar({ current, onSelect, onImport }: Props): React.JSX.Element {
  const groups = [...new Set(TEMPLATES.map((t) => t.group))]
  return (
    <nav className="sidebar">
      <div className="brand">
        <div className="brand-title">EMV APDU Builder</div>
        <div className="muted small">Composizione guidata delle response</div>
      </div>
      <div className="sidebar-scroll">
        {groups.map((g) => (
          <div key={g} className="tpl-group">
            <div className="tpl-group-title">{g}</div>
            {TEMPLATES.filter((t) => t.group === g).map((t) => (
              <button
                key={t.id}
                className={`tpl ${current === t.id ? 'active' : ''}`}
                onClick={() => onSelect(t)}
              >
                <span className="tpl-name">{t.name}</span>
                {t.command.apdu && (
                  <span className="tpl-cmd mono">{t.command.apdu.substr(0, 8)}…</span>
                )}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="sidebar-foot">
        <button className={`btn wide ${current === 'import' ? 'primary' : ''}`} onClick={onImport}>
          ⤓ Importa response da hex
        </button>
      </div>
    </nav>
  )
}
