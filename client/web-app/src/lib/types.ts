export type CharacterClass = 'WARRIOR' | 'MAGE' | 'RANGER' | 'ASSASSIN' | 'PALADIN';

export type UpgradeStat = 'ATK' | 'DEF' | 'HP' | 'CRIT';

export interface EnemyType {
  id: string;
  zoneId: string;
  name: string;
  maxHp: number;
  atk: number;
  def: number;
  xpReward: number;
  goldReward: number;
  isBoss: boolean;
}

export interface Zone {
  id: string;
  name: string;
  description: string;
  requiredLevel: number;
  enemies: EnemyType[];
}

export interface Upgrade {
  id: string;
  stat: UpgradeStat;
  level: number;
  baseCost: number;
  currentCost: number;
}

export interface Character {
  id: string;
  userId: string;
  name: string;
  class: CharacterClass;
  level: number;
  xp: number;
  gold: number;
  diamonds: number;
  atk: number;
  def: number;
  maxHp: number;
  currentHp: number;
  critChance: number;
  critDamage: number;
  attackSpeed: number;
  power: number;
  currentZoneId: string;
  currentZone?: Zone;
  upgrades?: Upgrade[];
}

export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  character: Character;
}

export interface LeaderboardRow extends Character {
  rank: number;
}
