import { asset, classInfo } from '../lib/assets';
import type { Character } from '../lib/types';

export function HeroScreen({ character }: { character: Character }) {
  const info = classInfo[character.class as keyof typeof classInfo] || classInfo.WARRIOR;
  const xpRequired = Math.floor(100 * Math.pow(character.level, 1.5));
  const xpPct = Math.min(100, Math.round((character.xp / Math.max(1, xpRequired)) * 100));
  return (
    <section className="screen hero-screen">
      <div className="hero-art glass-panel">
        <img src={asset.heroes[character.class]} alt="" />
      </div>
      <div className="hero-sheet glass-panel">
        <small>Héroe</small>
        <h1>{character.name}</h1>
        <h2>{info.name} · {info.role}</h2>
        <p>{info.text}</p>
        <div className="xp-track"><span style={{ width: `${xpPct}%` }} /></div>
        <p>{character.xp} / {xpRequired} XP</p>
        <div className="stats-grid">
          <div><img src={asset.icons.attack} alt="" /><small>ATK</small><strong>{character.atk}</strong></div>
          <div><img src={asset.icons.def} alt="" /><small>DEF</small><strong>{character.def}</strong></div>
          <div><img src={asset.icons.hp} alt="" /><small>HP</small><strong>{character.currentHp}/{character.maxHp}</strong></div>
          <div><img src={asset.icons.crit} alt="" /><small>CRIT</small><strong>{(character.critChance * 100).toFixed(1)}%</strong></div>
          <div><img src={asset.icons.power} alt="" /><small>PODER</small><strong>{character.power}</strong></div>
          <div><img src={asset.icons.diamond} alt="" /><small>DIAMANTES</small><strong>{character.diamonds}</strong></div>
        </div>
      </div>
    </section>
  );
}
