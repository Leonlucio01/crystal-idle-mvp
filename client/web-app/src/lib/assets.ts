import type { CharacterClass } from './types';

const A = '/assets';

export const asset = {
  logo: `${A}/ui/logo_crystal_idle.png`,
  backgrounds: {
    crystal_forest: `${A}/backgrounds/bg_crystal_forest.png`,
    dark_cave: `${A}/backgrounds/bg_dark_cave.png`,
    frozen_ruins: `${A}/backgrounds/bg_frozen_ruins.png`,
    volcanic_core: `${A}/backgrounds/bg_volcanic_core.png`,
    ancient_temple: `${A}/backgrounds/bg_ancient_temple.png`,
    crystal_abyss: `${A}/backgrounds/bg_crystal_abyss.png`,
  } as Record<string, string>,
  enemies: {
    green_slime: `${A}/enemies/enemy_green_slime.png`,
    crystal_wolf: `${A}/enemies/enemy_crystal_wolf.png`,
    forest_sprite: `${A}/enemies/enemy_forest_sprite.png`,
    cave_bat: `${A}/enemies/enemy_cave_bat.png`,
    goblin_raider: `${A}/enemies/enemy_goblin_raider.png`,
    shadow_spider: `${A}/enemies/enemy_shadow_spider.png`,
    ice_spider: `${A}/enemies/enemy_ice_spider.png`,
    frost_wolf: `${A}/enemies/enemy_frost_wolf.png`,
    frozen_sentinel: `${A}/enemies/enemy_frozen_sentinel.png`,
    fire_imp: `${A}/enemies/enemy_fire_imp.png`,
    lava_beast: `${A}/enemies/enemy_lava_beast.png`,
    ancient_guardian: `${A}/enemies/enemy_ancient_guardian.png`,
  } as Record<string, string>,
  bosses: {
    slime_king: `${A}/bosses/boss_slime_king.png`,
    cave_troll: `${A}/bosses/boss_cave_troll.png`,
    ice_golem: `${A}/bosses/boss_ice_golem.png`,
    fire_drake: `${A}/bosses/boss_fire_drake.png`,
    crystal_wraith: `${A}/bosses/boss_crystal_wraith.png`,
    ancient_colossus: `${A}/bosses/boss_ancient_colossus.png`,
  } as Record<string, string>,
  heroes: {
    WARRIOR: `${A}/hero/hero_warrior.png`,
    MAGE: `${A}/hero/hero_mage.png`,
    RANGER: `${A}/hero/hero_ranger.png`,
    ASSASSIN: `${A}/hero/hero_assassin.png`,
    PALADIN: `${A}/hero/hero_warrior.png`,
  } as Record<CharacterClass, string>,
  avatars: {
    WARRIOR: `${A}/hero/avatar_warrior.png`,
    MAGE: `${A}/hero/hero_mage_avatar.png`,
    RANGER: `${A}/hero/hero_ranger_avatar.png`,
    ASSASSIN: `${A}/hero/avatar_assassin.png`,
    PALADIN: `${A}/hero/avatar_warrior.png`,
  } as Record<CharacterClass, string>,
  icons: {
    gold: `${A}/ui/icons/icon_gold.png`,
    diamond: `${A}/ui/icons/icon_diamond.png`,
    attack: `${A}/ui/icons/icon_attack.png`,
    def: `${A}/ui/icons/icon_def.png`,
    hp: `${A}/ui/icons/icon_hp.png`,
    crit: `${A}/ui/icons/icon_crit.png`,
    power: `${A}/ui/icons/icon_power.png`,
    combat: `${A}/ui/icons/icon_combat.png`,
    campaign: `${A}/ui/icons/icon_campaign.png`,
    hero: `${A}/ui/icons/icon_hero.png`,
    inventory: `${A}/ui/icons/icon_inventory.png`,
    equipment: `${A}/ui/icons/icon_equipment.png`,
    ranking: `${A}/ui/icons/icon_ranking.png`,
    shop: `${A}/ui/icons/icon_shop.png`,
    check: `${A}/ui/icons/icon_check.png`,
    lock: `${A}/ui/icons/icon_lock.png`,
    boss: `${A}/ui/icons/icon_boss.png`,
    offline: `${A}/ui/icons/icon_offline.png`,
  },
  fx: {
    hit: `${A}/fx/fx_hit.png`,
    crit: `${A}/fx/fx_crit.png`,
    reward: `${A}/fx/fx_reward_glow.png`,
    bossDefeated: `${A}/fx/fx_boss_defeated.png`,
  },
  panels: {
    battle: `${A}/ui/panels/panel_battle_frame.png`,
    inventory: `${A}/ui/panels/panel_inventory_frame.png`,
    boss: `${A}/ui/panels/panel_boss_frame.png`,
    reward: `${A}/ui/panels/panel_reward_frame.png`,
    zone: `${A}/ui/panels/panel_zone_frame.png`,
  },
  items: {
    item_crystal_sword: `${A}/items/item_crystal_sword.png`,
    item_frost_spear: `${A}/items/item_frost_spear.png`,
    item_cave_axe: `${A}/items/item_cave_axe.png`,
    item_fire_blade: `${A}/items/item_fire_blade.png`,
    item_ice_armor: `${A}/items/item_ice_armor.png`,
    item_crystal_boots: `${A}/items/item_crystal_boots.png`,
    item_shadow_amulet: `${A}/items/item_shadow_amulet.png`,
    item_lava_core: `${A}/items/item_lava_core.png`,
    chest_boss: `${A}/loot/chest_boss.png`,
    chest_epic: `${A}/loot/chest_epic.png`,
    mat_frost_crystal: `${A}/loot/mat_frost_crystal.png`,
  } as Record<string, string>,
};

export const classInfo = {
  WARRIOR: {
    name: 'Warrior',
    role: 'Tanque balanceado',
    text: 'Alto HP y defensa. Ideal para progreso estable.',
  },
  MAGE: {
    name: 'Mage',
    role: 'XP y daño mágico',
    text: 'Daño alto, crítico mágico y progreso rápido.',
  },
  RANGER: {
    name: 'Ranger',
    role: 'Crítico y drops',
    text: 'Buen crítico, bonus de loot y farmeo eficiente.',
  },
  ASSASSIN: {
    name: 'Assassin',
    role: 'Crítico explosivo',
    text: 'Daño rápido, crítico alto y estilo agresivo.',
  },
} as const;

export function enemyImage(enemyId?: string, isBoss?: boolean) {
  if (!enemyId) return asset.enemies.green_slime;
  return isBoss ? asset.bosses[enemyId] || asset.enemies[enemyId] : asset.enemies[enemyId] || asset.bosses[enemyId] || asset.enemies.green_slime;
}

export function zoneBackground(zoneId?: string) {
  return asset.backgrounds[zoneId || 'crystal_forest'] || asset.backgrounds.crystal_forest;
}
