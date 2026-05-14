import { useState } from 'react';
import { asset, classInfo } from '../lib/assets';
import { api } from '../lib/api';
import type { AuthResponse, CharacterClass } from '../lib/types';
import { GameButton } from '../components/GameButton';

const classes: CharacterClass[] = ['WARRIOR', 'MAGE', 'RANGER', 'ASSASSIN'];

export function AuthScreen({ onAuth }: { onAuth: (payload: AuthResponse) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('prodtest@example.com');
  const [password, setPassword] = useState('123456');
  const [characterName, setCharacterName] = useState('ProdHero');
  const [characterClass, setCharacterClass] = useState<CharacterClass>('WARRIOR');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setError('');
    try {
      const payload = mode === 'login'
        ? await api.login(email, password)
        : await api.register(email, password, characterName, characterClass);
      localStorage.setItem('crystal_token', payload.token);
      onAuth(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-screen">
      <div className="auth-bg" />
      <section className="auth-card glass-panel">
        <div className="brand auth-brand">
          <img src={asset.logo} alt="Crystal Idle" />
          <div>
            <small>Crystal Idle</small>
            <strong>Fantasy Idle RPG</strong>
          </div>
        </div>
        <div className="mode-switch">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Entrar</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Crear héroe</button>
        </div>
        <label>Email<input value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} /></label>
        {mode === 'register' ? (
          <>
            <label>Nombre del personaje<input value={characterName} onChange={e => setCharacterName(e.target.value)} /></label>
            <div className="class-grid">
              {classes.map(c => (
                <button key={c} className={characterClass === c ? 'class-card active' : 'class-card'} onClick={() => setCharacterClass(c)}>
                  <img src={asset.avatars[c]} alt="" />
                  <strong>{classInfo[c].name}</strong>
                  <span>{classInfo[c].role}</span>
                </button>
              ))}
            </div>
          </>
        ) : null}
        {error ? <p className="error">{error}</p> : null}
        <GameButton icon={mode === 'login' ? asset.icons.check : asset.icons.hero} onClick={submit} disabled={loading}>
          {loading ? 'Cargando...' : mode === 'login' ? 'Entrar al mundo' : 'Crear personaje'}
        </GameButton>
      </section>
      {mode === 'register' ? (
        <aside className="hero-preview">
          <img src={asset.heroes[characterClass]} alt="" />
          <div>
            <h1>{classInfo[characterClass].name}</h1>
            <p>{classInfo[characterClass].text}</p>
          </div>
        </aside>
      ) : null}
    </main>
  );
}
