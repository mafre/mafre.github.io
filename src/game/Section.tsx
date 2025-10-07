import { useCallback, useState } from "react";

export default function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState<{[k: string]: boolean}>({ overview: true, progress: true });
  const toggle = useCallback((k: string) => setOpen(o => ({ ...o, [k]: !o[k] })), []);
  const expanded = open[id];

    return (
      <div
	    className={ 'flex flex-col gap-1 text-left ui-parchment'}>
        <button
          onClick={() => toggle(id)}
		  className={ expanded ? '' : 'ui-button rounded'}
        >
          <span>{title}</span>
        </button>
        {expanded && <div className="flex flex-col gap-0.5">{children}</div>}
      </div>
    )
}