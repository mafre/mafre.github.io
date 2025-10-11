import { useMemo } from 'react';
import { useGameData } from './GameData';
import { ABILITY_DEFS, type AbilityDef } from './abilities';
import { Modal } from './Modal';

interface Contribution {
  def: AbilityDef;
  active: boolean;
  add: number;
}

export default function EffectsPanel() {
  const { data } = useGameData();

  const { contributions, abilityBonus, effective } = useMemo(() => {
    const purchased = ABILITY_DEFS.filter(d => data.hasAbility(d.id));
    const contributions: Contribution[] = purchased.map(def => {
      const active = !def.condition || def.condition(data);
      const add = active ? (def.effect?.timeSpeedAdd ?? 0) : 0;
      return { def, active, add };
    });
    const abilityBonus = contributions.reduce((s, c) => s + c.add, 0);
    const effective = data.timeSpeed + abilityBonus; // mirrors effectiveTimeSpeed logic
    return { contributions, abilityBonus, effective };
  }, [data]);

  return (
    <div className="flex-1 flex flex-col gap-2">
      <Modal>
      <div className="w-64">
        <div className="flex justify-between"><span>Base Speed</span><span >{data.timeSpeed.toFixed(2)}</span></div>
        <div className="flex justify-between"><span >Ability Bonus</span><span >+{abilityBonus.toFixed(2)}</span></div>
        <div className="flex justify-between mt-1 border-t border-zinc-700 pt-1"><span  >Total</span><span >{effective.toFixed(2)}</span></div>
        </div>
      </Modal>
      <Modal>
        {contributions.length === 0 && (
          <div className="italic opacity-60">No abilities purchased yet.</div>
        )}
        {contributions.map(c => (
          <div key={c.def.id} className="text-left">
            <div className="flex-1 flex flex-row">
              <div >{c.def.name}</div>
              <div className="flex-1"/>
              <span>{c.active ? `+${c.add}` : '0'}</span>
            </div>
          </div>
        ))}
      </Modal>
    </div>
  );
}
