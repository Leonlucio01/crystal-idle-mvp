import { asset, zoneBackground } from '../lib/assets';
import { api } from '../lib/api';
import type { Character, Zone } from '../lib/types';
import { GameButton } from '../components/GameButton';

export function CampaignScreen({ token, character, zones, onCharacter }: { token: string; character: Character; zones: Zone[]; onCharacter: (c: Character) => void }) {
  async function enter(zone: Zone) {
    const res = await api.changeZone(token, zone.id);
    onCharacter(res.data);
  }

  return (
    <section className="screen campaign-screen">
      <div className="map-card glass-panel">
        <img className="world-map" src={asset.backgrounds.crystal_abyss ? '/assets/map/map_world.png' : zoneBackground(character.currentZoneId)} alt="Mapa" />
        <div className="map-copy">
          <small>Campaña</small>
          <h1>Reinos de Cristal</h1>
          <p>Derrota jefes para desbloquear nuevas zonas. Además, cada zona puede pedir nivel y poder mínimo.</p>
        </div>
      </div>
      <div className="zone-grid">
        {zones.map(zone => {
          const missingLevel = character.level < zone.requiredLevel;
          const missingPower = character.power < (zone.requiredPower || 0);
          const lockedByProgress = zone.locked === true || zone.unlocked === false;
          const locked = lockedByProgress || missingLevel || missingPower;
          const active = character.currentZoneId === zone.id;
          const reason = lockedByProgress
            ? 'Derrota el jefe anterior'
            : missingLevel
              ? `Requiere nivel ${zone.requiredLevel}`
              : missingPower
                ? `Requiere ${zone.requiredPower} poder`
                : active
                  ? 'Zona actual'
                  : 'Disponible';

          return (
            <article className={`zone-card ${active ? 'active' : ''} ${locked ? 'locked' : ''}`} key={zone.id} style={{ backgroundImage: `linear-gradient(180deg, rgba(8,12,30,.38), rgba(8,12,30,.92)), url(${zoneBackground(zone.id)})` }}>
              <div>
                <img src={locked ? asset.icons.lock : active ? asset.icons.check : asset.icons.campaign} alt="" />
                <span>{reason}</span>
              </div>
              <h2>{zone.name}</h2>
              <p>{zone.description}</p>
              <small>Nivel {zone.requiredLevel} · Poder {zone.requiredPower || 0}</small>
              <small>{zone.enemies?.map(e => e.name).join(' · ')}</small>
              <GameButton icon={locked ? asset.icons.lock : asset.icons.check} disabled={locked || active} onClick={() => enter(zone)}>
                {locked ? 'Bloqueada' : active ? 'Zona actual' : 'Entrar'}
              </GameButton>
            </article>
          );
        })}
      </div>
    </section>
  );
}
