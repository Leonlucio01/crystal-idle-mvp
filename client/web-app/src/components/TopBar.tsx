import { asset } from '../lib/assets';
import type { Character } from '../lib/types';

function fmt(value: number) {
  return new Intl.NumberFormat('es-CO').format(value || 0);
}

export function TopBar({ character, onLogout }: { character?: Character | null; onLogout?: () => void }) {
  return (
    <header className="top-bar">
      <div className="brand">
        <img src={asset.logo} alt="Crystal Idle" />
        <div>
          <small>Crystal Idle</small>
          <strong>Fantasy Idle RPG</strong>
        </div>
      </div>
      {character ? (
        <div className="resource-strip">
          <div className="resource"><small>Nivel</small><strong>{character.level}</strong></div>
          <div className="resource gold"><small>Oro</small><strong>{fmt(character.gold)}</strong></div>
          <div className="resource diamond"><small>Diamantes</small><strong>{fmt(character.diamonds)}</strong></div>
          <div className="resource"><small>Poder</small><strong>{fmt(character.power)}</strong></div>
          <button className="logout" onClick={onLogout}>Salir</button>
        </div>
      ) : null}
    </header>
  );
}
