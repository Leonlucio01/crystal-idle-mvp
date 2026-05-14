import { asset } from '../lib/assets';

export type ScreenKey = 'battle' | 'campaign' | 'hero' | 'inventory' | 'ranking' | 'shop';

const items: Array<{ key: ScreenKey; label: string; icon: string }> = [
  { key: 'battle', label: 'Batalla', icon: asset.icons.combat },
  { key: 'campaign', label: 'Campaña', icon: asset.icons.campaign },
  { key: 'hero', label: 'Héroe', icon: asset.icons.hero },
  { key: 'inventory', label: 'Inventario', icon: asset.icons.inventory },
  { key: 'ranking', label: 'Ranking', icon: asset.icons.ranking },
  { key: 'shop', label: 'Tienda', icon: asset.icons.shop },
];

export function SideNav({ active, onChange }: { active: ScreenKey; onChange: (screen: ScreenKey) => void }) {
  return (
    <nav className="side-nav">
      {items.map(item => (
        <button key={item.key} className={active === item.key ? 'active' : ''} onClick={() => onChange(item.key)}>
          <img src={item.icon} alt="" />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
