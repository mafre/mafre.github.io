import { Modal } from './Modal';
import { useGameData } from './GameData';
import { ABILITY_DEFS, type AbilityDef } from './abilities';

interface AbilityRowProps {
  def: AbilityDef;
  owned: boolean;
  active: boolean;
  canPurchase: boolean;
  onPurchase: () => void;
}

function AbilityRow({ def, owned, active, canPurchase, onPurchase }: AbilityRowProps) {
  return (
    <Modal>
      <div className="flex items-center justify-between gap-2">
        <span >{def.name}</span>
        {!owned && (
          <button
            className="px-1 py-1 rounded ui-button primary"
            disabled={!canPurchase}
            onClick={onPurchase}
            title={canPurchase ? 'Purchase ability' : 'Locked'}
          >
            Buy
          </button>
        )}
        {owned && (
          <span className={`px-2 py-0.5 rounded ${active ? 'bg-emerald-700/70 text-emerald-100' : 'bg-zinc-700/70 text-zinc-100'}`}>{active ? 'Active' : 'Inactive'}</span>
        )}
      </div>
      <p className="font-medium leading-snug">{def.description}</p>
      <div className="flex flex-wrap">
        <span>L{def.level}</span>
        {def.effect?.timeSpeedAdd !== undefined && <span>+{def.effect.timeSpeedAdd} speed</span>}
        {def.condition && <span className="italic opacity-70">cond.</span>}
      </div>
    </Modal>
  );
}

export default function AbilitiesPanel() {
  const { data, update } = useGameData();

  return (
    <div className="grid grid-autos-rows-[auto_1fr]">
      {ABILITY_DEFS.map(ability => {
        const locked = ability.level > data.level;
        const owned = data.hasAbility(ability.id);
        const active = owned && (!ability.condition || ability.condition(data));
        const canPurchase = !locked && !owned; // placeholder (add cost logic later)
        return (
          <AbilityRow
            key={ability.id}
            def={ability}
            owned={owned}
            active={active}
            canPurchase={canPurchase}
            onPurchase={() => {
              if (!canPurchase) return;
              update(gd => gd.purchaseAbility(ability.id));
            }}
          />
        );
      })}
    </div>
  );
}
