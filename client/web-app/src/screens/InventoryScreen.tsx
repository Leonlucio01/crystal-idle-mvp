import { asset } from '../lib/assets';
import { api } from '../lib/api';
import type { Character, UpgradeStat } from '../lib/types';
import { GameButton } from '../components/GameButton';

const loot = [
  ['item_crystal_sword', 'Crystal Sword', 'RARE', 'ATK +14 · CRIT +2%'],
  ['item_frost_spear', 'Frost Spear', 'RARE', 'ATK +18'],
  ['item_ice_armor', 'Ice Armor', 'EPIC', 'DEF +24 · HP +160'],
  ['item_shadow_amulet', 'Shadow Amulet', 'EPIC', 'CRIT +6%'],
  ['item_lava_core', 'Lava Core', 'LEGENDARY', 'ATK +32 · Boss damage +8%'],
  ['chest_boss', 'Boss Chest', 'RARE', 'Recompensa de jefe'],
  ['mat_frost_crystal', 'Frost Crystal', 'COMMON', 'Material de crafteo'],
];

const upgradeStats: UpgradeStat[] = ['ATK', 'DEF', 'HP', 'CRIT'];

export function InventoryScreen({ token, character, onCharacter }: { token: string; character: Character; onCharacter: (c: Character) => void }) {
  async function upgrade(stat: UpgradeStat) {
    const res = await api.upgrade(token, stat);
    onCharacter(res.data.character);
  }

  return (
    <section className="screen inventory-screen">
      <div className="upgrades glass-panel">
        <small>Progresión</small>
        <h1>Mejoras</h1>
        <div className="upgrade-grid">
          {upgradeStats.map(stat => {
            const u = character.upgrades?.find(x => x.stat === stat);
            return <GameButton key={stat} icon={asset.icons[stat === 'ATK' ? 'attack' : stat === 'DEF' ? 'def' : stat === 'HP' ? 'hp' : 'crit']} onClick={() => upgrade(stat)}>{stat} · {u ? `${u.currentCost} oro` : 'Mejorar'}</GameButton>;
          })}
        </div>
      </div>
      <div className="inventory-panel glass-panel">
        <small>Equipo e inventario</small>
        <h1>Loot visual</h1>
        <div className="loot-grid">
          {loot.map(([key, name, rarity, desc]) => (
            <article key={key} className="loot-card">
              <img src={asset.items[key]} alt="" />
              <div>
                <strong>{name}</strong>
                <span>{rarity}</span>
                <p>{desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
