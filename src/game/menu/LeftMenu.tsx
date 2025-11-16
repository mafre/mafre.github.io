import { useCallback, useState } from 'react';
import AbilitiesPanel from '../panels/AbilitiesPanel';
import Stats from '../modals/Stats';
import EffectsPanel from '../panels/EffectsPanel';

export default function LeftMenu() {
  const [open, setOpen] = useState<{[k: string]: boolean}>({ overview: true, progress: true });
  const toggle = useCallback((k: string) => setOpen(o => ({ ...o, [k]: !o[k] })), []);

  const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => {
    const expanded = open[id];
    return (
      <div className="flex flex-col gap-1 text-left">
        <button
          onClick={() => toggle(id)}
          className="flex items-center justify-between text-left w-full font-bold uppercase tracking-wide opacity-70 hover:opacity-100 transition-colors"
        >
          <span>{title}</span>
          <span className="ml-2">{expanded ? '−' : '+'}</span>
        </button>
        {expanded && <div className="flex flex-col gap-0.5">{children}</div>}
      </div>
    );
  };

  return (
    <aside className="ui-parchment sticky top-0 h-full flex flex-col gap-5 p-4 m-4">
      <Section id="stats" title="Stats">
	  	<Stats />
      </Section>
      <Section id="abilities" title="Abilities">
	  	<AbilitiesPanel />
      </Section>
      <Section id="effects" title="Effects">
	  	<EffectsPanel />
      </Section>
    </aside>
  );
}
