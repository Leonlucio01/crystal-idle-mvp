import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { LeaderboardRow } from '../lib/types';

export function RankingScreen() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  useEffect(() => {
    api.leaderboard().then(res => setRows(res.data)).catch(() => setRows([]));
  }, []);
  return (
    <section className="screen ranking-screen glass-panel">
      <small>Competencia</small>
      <h1>Ranking de poder</h1>
      <table>
        <thead><tr><th>#</th><th>Nombre</th><th>Clase</th><th>Nivel</th><th>Poder</th></tr></thead>
        <tbody>
          {rows.map(row => <tr key={row.id}><td>{row.rank}</td><td>{row.name}</td><td>{row.class}</td><td>{row.level}</td><td>{row.power}</td></tr>)}
        </tbody>
      </table>
    </section>
  );
}
