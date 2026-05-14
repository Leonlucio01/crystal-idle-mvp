export type CharacterClass = 'WARRIOR' | 'MAGE' | 'RANGER' | 'ASSASSIN' | 'PALADIN';

export type UpgradeStat = 'ATK' | 'DEF' | 'HP' | 'CRIT';

export interface EnemyType {
  id: string;
  zoneId: string;
  name: string;
  level?: number;
  sortOrder?: number;
  maxHp: number;
  atk: number;
  def: number;
  xpReward: number;
  goldReward: number;
  isBoss: boolean;
  powerRecommended?: number;
}

export interface ZoneProgress {
  unlocked: boolean;
  enemiesKilled: number;
  bossDefeated: boolean;
  bossKills: number;
}

export interface Zone {
  id: string;
  name: string;
  description: string;
  orderIndex?: number;
  requiredLevel: number;
  requiredPower?: number;
  unlocked?: boolean;
  locked?: boolean;
  isCurrent?: boolean;
  progress?: ZoneProgress | null;
  enemies: EnemyType[];
}

export interface Upgrade {
  id: string;
  stat: UpgradeStat;
  level: number;
  baseCost: number;
  currentCost: number;
}

export interface ItemDefinition {
  id: string;
  name: string;
  description?: string;
  type: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';
  slot?: string | null;
  sellGold?: number;
}

export interface InventoryItem {
  id: string;
  itemDefinitionId?: string;
  itemDefinition?: ItemDefinition;
  name?: string;
  description?: string;
  type?: string;
  rarity?: ItemDefinition['rarity'];
  slot?: string | null;
  equippedSlot?: string | null;
  quantity: number;
  atk?: number;
  def?: number;
  maxHp?: number;
  critChance?: number;
  goldBonus?: number;
  xpBonus?: number;
  autoFarmSpeed?: number;
  sellGold?: number;
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
  totalKills?: number;
  bossKills?: number;
  maxZoneOrderUnlocked?: number;
  currentZoneId: string;
  currentZone?: Zone;
  upgrades?: Upgrade[];
  inventory?: InventoryItem[];
  zoneProgress?: Array<ZoneProgress & { zone?: Zone }>;
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

export interface CombatReward {
  id?: string;
  itemDefinitionId?: string;
  name: string;
  rarity?: string;
  quantity: number;
}
