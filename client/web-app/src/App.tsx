import { useEffect, useState } from 'react';
import { TopBar } from './components/TopBar';
import { SideNav, type ScreenKey } from './components/SideNav';
import { AuthScreen } from './screens/AuthScreen';
import { BattleScreen } from './screens/BattleScreen';
import { CampaignScreen } from './screens/CampaignScreen';
import { HeroScreen } from './screens/HeroScreen';
import { InventoryScreen } from './screens/InventoryScreen';
import { RankingScreen } from './screens/RankingScreen';
import { ShopScreen } from './screens/ShopScreen';
import { api } from './lib/api';
import { zoneBackground } from './lib/assets';
import type { AuthResponse, Character, Zone } from './lib/types';

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('crystal_token') || '');
  const [character, setCharacter] = useState<Character | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [screen, setScreen] = useState<ScreenKey>('battle');
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState('');

  async function refreshZones(authToken = token) {
    try {
      const res = await api.zones(authToken || undefined);
      setZones(res.data);
    } catch (_) {
      setZones([]);
    }
  }

  useEffect(() => {
    refreshZones(token);
  }, [token]);

  useEffect(() => {
    async function boot() {
      if (!token) {
        setBooting(false);
        return;
      }
      try {
        const res = await api.me(token);
        setCharacter(res.data);
      } catch (err) {
        localStorage.removeItem('crystal_token');
        setToken('');
      } finally {
        setBooting(false);
      }
    }
    boot();
  }, [token]);

  function handleAuth(payload: AuthResponse) {
    localStorage.setItem('crystal_token', payload.token);
    setToken(payload.token);
    setCharacter(payload.character);
    refreshZones(payload.token);
  }

  function logout() {
    localStorage.removeItem('crystal_token');
    setToken('');
    setCharacter(null);
    setScreen('battle');
  }

  function updateCharacter(next: Character) {
    setCharacter(prev => ({ ...(prev || next), ...next }));
    refreshZones(token);
  }

  if (booting) return <div className="boot-screen">Cargando Crystal Idle...</div>;
  if (!token || !character) return <AuthScreen onAuth={handleAuth} />;

  let content = null;
  if (screen === 'battle') content = <BattleScreen token={token} character={character} zones={zones} onCharacter={updateCharacter} />;
  if (screen === 'campaign') content = <CampaignScreen token={token} character={character} zones={zones} onCharacter={updateCharacter} />;
  if (screen === 'hero') content = <HeroScreen character={character} />;
  if (screen === 'inventory') content = <InventoryScreen token={token} character={character} onCharacter={updateCharacter} />;
  if (screen === 'ranking') content = <RankingScreen />;
  if (screen === 'shop') content = <ShopScreen />;

  return (
    <div className="game-app" style={{ backgroundImage: `linear-gradient(90deg, rgba(3,7,18,.92), rgba(6,10,28,.72)), url(${zoneBackground(character.currentZoneId)})` }}>
      <TopBar character={character} onLogout={logout} />
      <div className="game-layout">
        <SideNav active={screen} onChange={setScreen} />
        <main className="game-main">
          {error ? <p className="error">{error}</p> : null}
          {content}
        </main>
      </div>
    </div>
  );
}

export default App;
