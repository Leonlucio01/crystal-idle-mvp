import { useEffect, useMemo, useState } from 'react';
import { asset, enemyImage } from '../lib/assets';
import { api } from '../lib/api';
import type { Character, CombatReward, EnemyType, Zone } from '../lib/types';
import { GameButton } from '../components/GameButton';
import { PixiBattleStage } from '../game/PixiBattleStage';

function rewardText(drops?: CombatReward[]) {
  if (!drops?.length) return '';
  return ` · Loot: ${drops.map(d => `${d.name} x${d.quantity}`).join(', ')}`;
}

export function BattleScreen({ token, character, zones, onCharacter }: { token: string; character: Character; zones: Zone[]; onCharacter: (c: Character) => void }) {
  const currentZone = zones.find(z => z.id === character.currentZoneId) || character.currentZone;
  const enemies = useMemo(() => currentZone?.enemies || [], [currentZone]);
  const normalEnemies = useMemo(() => enemies.filter(e => !e.isBoss), [enemies]);
  const boss = enemies.find(e => e.isBoss);
  const [selectedEnemyId, setSelectedEnemyId] = useState(normalEnemies[0]?.id || enemies[0]?.id || '');
  const selectedEnemy = useMemo(() => enemies.find(e => e.id === selectedEnemyId) || normalEnemies[0] || enemies[0], [enemies, normalEnemies, selectedEnemyId]);
  const [log, setLog] = useState<string[]>(['Bienvenido al nuevo campo de batalla.']);
  const [flashKey, setFlashKey] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const valid = enemies.some(e => e.id === selectedEnemyId && !e.isBoss);
    if (!valid) setSelectedEnemyId(normalEnemies[0]?.id || enemies[0]?.id || '');
  }, [character.currentZoneId, enemies, normalEnemies, selectedEnemyId]);

  async function attack(enemy?: EnemyType) {
    if (!enemy) return;
    setBusy(true);
    try {
      const res = await api.attack(token, enemy.id);
      onCharacter(res.data.character);
      setFlashKey(v => v + 1);
      const levelText = res.data.levelsGained ? `, +${res.data.levelsGained} nivel` : '';
      const line = `${enemy.name} derrotado: +${res.data.goldEarned} oro, +${res.data.xpEarned} XP${levelText}${rewardText(res.data.drops)}.`;
      setLog(l => [line, ...l].slice(0, 8));
    } catch (err) {
      setLog(l => [`Error: ${err instanceof Error ? err.message : 'No se pudo atacar'}`, ...l].slice(0, 8));
    } finally {
      setBusy(false);
    }
  }

  async function challengeBoss(enemy?: EnemyType) {
    if (!enemy) return;
    setBusy(true);
    try {
      const res = await api.challengeBoss(token, enemy.id);
      onCharacter(res.data.character);
      setFlashKey(v => v + 1);
      const unlockText = res.data.unlockedZone ? ` · Nueva zona: ${res.data.unlockedZone.name}` : '';
      const diamondText = res.data.diamondsEarned ? ` · +${res.data.diamondsEarned} diamantes` : '';
      const line = `Jefe derrotado: ${enemy.name}. +${res.data.goldEarned} oro, +${res.data.xpEarned} XP${diamondText}${unlockText}${rewardText(res.data.drops)}.`;
      setLog(l => [line, ...l].slice(0, 8));
    } catch (err) {
      setLog(l => [`Jefe: ${err instanceof Error ? err.message : 'No se pudo desafiar al jefe'}`, ...l].slice(0, 8));
    } finally {
      setBusy(false);
    }
  }

  async function claimOffline() {
    setBusy(true);
    try {
      const res = await api.claimOffline(token);
      onCharacter(res.data.character);
      const levelText = res.data.levelsGained ? `, +${res.data.levelsGained} nivel` : '';
      setLog(l => [`Offline reclamado: ${res.data.kills} kills, +${res.data.goldEarned} oro, +${res.data.xpEarned} XP${levelText}${rewardText(res.data.drops)}.`, ...l].slice(0, 8));
    } catch (err) {
      setLog(l => [`Error offline: ${err instanceof Error ? err.message : 'No se pudo reclamar'}`, ...l].slice(0, 8));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="screen battle-screen">
      <div className="battle-hero glass-panel">
        <PixiBattleStage character={character} enemy={selectedEnemy} flashKey={flashKey} />
        <div className="battle-overlay">
          <div>
            <small>Zona actual</small>
            <h1>{currentZone?.name || 'Crystal Forest'}</h1>
          </div>
          <div className="battle-actions">
            <select value={selectedEnemy?.id || ''} onChange={e => setSelectedEnemyId(e.target.value)}>
              {normalEnemies.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
            <GameButton icon={asset.icons.attack} disabled={busy || !selectedEnemy} onClick={() => attack(selectedEnemy)}>Atacar</GameButton>
            <GameButton icon={asset.icons.offline} variant="ghost" disabled={busy} onClick={claimOffline}>Offline</GameButton>
          </div>
        </div>
      </div>
      <div className="battle-bottom">
        <div className="enemy-card glass-panel">
          <img src={enemyImage(selectedEnemy?.id, selectedEnemy?.isBoss)} alt="" />
          <div>
            <small>Objetivo</small>
            <h2>{selectedEnemy?.name || 'Enemigo'}</h2>
            <p>HP {selectedEnemy?.maxHp} · ATK {selectedEnemy?.atk} · DEF {selectedEnemy?.def}</p>
            <p>Recompensa: {selectedEnemy?.xpReward} XP · {selectedEnemy?.goldReward} oro</p>
          </div>
        </div>
        {boss ? (
          <div className="boss-card glass-panel">
            <img src={enemyImage(boss.id, true)} alt="" />
            <div>
              <small>Jefe de zona</small>
              <h2>{boss.name}</h2>
              <p>Poder recomendado: {boss.powerRecommended || currentZone?.requiredPower || 0}</p>
              <p>Victoria: desbloquea campaña y otorga diamantes.</p>
            </div>
            <GameButton icon={asset.icons.boss} variant="gold" disabled={busy} onClick={() => challengeBoss(boss)}>Desafiar jefe</GameButton>
          </div>
        ) : null}
      </div>
      <aside className="combat-log glass-panel">
        <h3>Actividad</h3>
        {log.map((line, idx) => <p key={idx}>{line}</p>)}
      </aside>
    </section>
  );
}
