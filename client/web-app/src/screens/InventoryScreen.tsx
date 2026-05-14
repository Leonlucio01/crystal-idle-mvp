import { useEffect, useMemo, useState } from 'react';
import { asset } from '../lib/assets';
import { api } from '../lib/api';
import type { Character, InventoryItem, UpgradeStat } from '../lib/types';
import { GameButton } from '../components/GameButton';

const upgradeStats: UpgradeStat[] = ['ATK', 'DEF', 'HP', 'CRIT'];

function itemName(item: InventoryItem) {
  return item.name || item.itemDefinition?.name || item.itemDefinitionId || 'Item';
}

function itemRarity(item: InventoryItem) {
  return item.rarity || item.itemDefinition?.rarity || 'COMMON';
}

function itemIcon(item: InventoryItem) {
  const id = item.itemDefinitionId || item.itemDefinition?.id || '';
  const type = item.type || item.itemDefinition?.type || '';
  if (id.includes('chest')) return asset.items.chest_boss;
  if (id.includes('frost') || id.includes('ice')) return asset.items.mat_frost_crystal;
  if (type === 'ARMOR' || type === 'HELMET') return asset.items.item_ice_armor;
  if (type === 'BOOTS') return asset.items.item_crystal_boots;
  if (type === 'AMULET') return asset.items.item_shadow_amulet;
  if (type === 'MATERIAL') return asset.items.mat_frost_crystal;
  return asset.items.item_crystal_sword;
}

function itemStats(item: InventoryItem) {
  const parts = [];
  if (item.atk) parts.push(`ATK +${item.atk}`);
  if (item.def) parts.push(`DEF +${item.def}`);
  if (item.maxHp) parts.push(`HP +${item.maxHp}`);
  if (item.critChance) parts.push(`CRIT +${(item.critChance * 100).toFixed(1)}%`);
  if (item.goldBonus) parts.push(`ORO +${(item.goldBonus * 100).toFixed(0)}%`);
  if (item.xpBonus) parts.push(`XP +${(item.xpBonus * 100).toFixed(0)}%`);
  if (item.autoFarmSpeed) parts.push(`FARM +${(item.autoFarmSpeed * 100).toFixed(0)}%`);
  return parts.join(' · ') || item.description || item.itemDefinition?.description || 'Material / recompensa';
}

export function InventoryScreen({ token, character, onCharacter }: { token: string; character: Character; onCharacter: (c: Character) => void }) {
  const [items, setItems] = useState<InventoryItem[]>(character.inventory || []);
  const [busyId, setBusyId] = useState('');
  const [message, setMessage] = useState('');

  async function loadInventory() {
    try {
      const res = await api.inventory(token);
      setItems(res.data.items || []);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'No se pudo cargar inventario');
    }
  }

  useEffect(() => {
    loadInventory();
  }, [token, character.inventory?.length]);

  async function upgrade(stat: UpgradeStat) {
    setMessage('');
    try {
      const res = await api.upgrade(token, stat);
      onCharacter(res.data.character);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'No se pudo mejorar');
    }
  }

  async function equip(item: InventoryItem) {
    setBusyId(item.id);
    setMessage('');
    try {
      const res = await api.equip(token, item.id);
      onCharacter(res.data.character);
      setItems(res.data.character.inventory || items);
      setMessage(`${itemName(item)} equipado.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'No se pudo equipar');
    } finally {
      setBusyId('');
    }
  }

  async function sell(item: InventoryItem) {
    setBusyId(item.id);
    setMessage('');
    try {
      const res = await api.sell(token, item.id, 1);
      onCharacter(res.data.character);
      setItems(res.data.character.inventory || []);
      setMessage(`${itemName(item)} vendido por ${res.data.goldEarned} oro.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'No se pudo vender');
    } finally {
      setBusyId('');
    }
  }

  const sortedItems = useMemo(() => [...items].sort((a, b) => Number(Boolean(b.equippedSlot)) - Number(Boolean(a.equippedSlot))), [items]);

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
        {message ? <p className="inventory-message">{message}</p> : null}
      </div>
      <div className="inventory-panel glass-panel">
        <small>Equipo e inventario</small>
        <h1>Loot real</h1>
        {sortedItems.length === 0 ? <p className="empty-state">Todavía no tienes objetos. Farmea enemigos, reclama offline o derrota jefes.</p> : null}
        <div className="loot-grid">
          {sortedItems.map(item => {
            const canEquip = Boolean(item.slot || item.itemDefinition?.slot);
            return (
              <article key={item.id} className={`loot-card rarity-${itemRarity(item).toLowerCase()} ${item.equippedSlot ? 'equipped' : ''}`}>
                <img src={itemIcon(item)} alt="" />
                <div>
                  <strong>{itemName(item)} {item.quantity > 1 ? `x${item.quantity}` : ''}</strong>
                  <span>{itemRarity(item)} {item.equippedSlot ? `· Equipado ${item.equippedSlot}` : ''}</span>
                  <p>{itemStats(item)}</p>
                  <div className="item-actions">
                    {canEquip ? <button disabled={busyId === item.id || Boolean(item.equippedSlot)} onClick={() => equip(item)}>Equipar</button> : null}
                    <button disabled={busyId === item.id || Boolean(item.equippedSlot)} onClick={() => sell(item)}>Vender</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
