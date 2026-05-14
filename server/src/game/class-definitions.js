const CLASS_DEFINITIONS = {
  WARRIOR: {
    code: "WARRIOR",
    name: "Warrior",
    role: "Tanque balanceado",
    atk: 14,
    def: 8,
    maxHp: 140,
    currentHp: 140,
    critChance: 0.05,
    critDamage: 1.5,
    attackSpeed: 1.0,
  },
  MAGE: {
    code: "MAGE",
    name: "Mage",
    role: "XP y dano magico",
    atk: 18,
    def: 4,
    maxHp: 90,
    currentHp: 90,
    critChance: 0.08,
    critDamage: 1.75,
    attackSpeed: 1.0,
  },
  RANGER: {
    code: "RANGER",
    name: "Ranger",
    role: "Critico y drops",
    atk: 13,
    def: 5,
    maxHp: 110,
    currentHp: 110,
    critChance: 0.12,
    critDamage: 1.6,
    attackSpeed: 1.15,
  },
  ASSASSIN: {
    code: "ASSASSIN",
    name: "Assassin",
    role: "Critico explosivo",
    atk: 16,
    def: 4,
    maxHp: 95,
    currentHp: 95,
    critChance: 0.16,
    critDamage: 1.9,
    attackSpeed: 1.25,
  },
};

function getClassDefinition(code) {
  return CLASS_DEFINITIONS[String(code || "WARRIOR").toUpperCase()] || CLASS_DEFINITIONS.WARRIOR;
}

module.exports = {
  CLASS_DEFINITIONS,
  getClassDefinition,
};
