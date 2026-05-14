const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");
const { calculatePower } = require("../game/progression");

const router = express.Router();

function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

const CLASS_STATS = {
  WARRIOR: {
    atk: 14,
    def: 8,
    maxHp: 140,
    currentHp: 140,
    critChance: 0.05,
    critDamage: 1.5,
  },
  MAGE: {
    atk: 18,
    def: 4,
    maxHp: 90,
    currentHp: 90,
    critChance: 0.08,
    critDamage: 1.65,
  },
  RANGER: {
    atk: 13,
    def: 5,
    maxHp: 110,
    currentHp: 110,
    critChance: 0.12,
    critDamage: 1.6,
  },
  ASSASSIN: {
    atk: 16,
    def: 4,
    maxHp: 95,
    currentHp: 95,
    critChance: 0.16,
    critDamage: 1.75,
  },
};

function normalizeClass(value) {
  const normalized = String(value || "WARRIOR").trim().toUpperCase();
  return CLASS_STATS[normalized] ? normalized : "WARRIOR";
}


router.post("/register", async (req, res) => {
  try {
    const { email, password, characterName, characterClass } = req.body;

    if (!email || !password || !characterName) {
      return res.status(400).json({ success: false, message: "Email, password and characterName are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const firstZone = await prisma.zone.findFirst({ orderBy: { orderIndex: "asc" } });
    if (!firstZone) {
      return res.status(500).json({ success: false, message: "No zones found. Run npm run seed first." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const selectedClass = normalizeClass(characterClass);
    const defaultStats = CLASS_STATS[selectedClass];

    const power = calculatePower(defaultStats);

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          character: {
            create: {
              name: characterName,
              class: selectedClass,
              atk: defaultStats.atk,
              def: defaultStats.def,
              maxHp: defaultStats.maxHp,
              currentHp: defaultStats.currentHp,
              critChance: defaultStats.critChance,
              critDamage: defaultStats.critDamage,
              power,
              currentZoneId: firstZone.id,
              maxZoneOrderUnlocked: firstZone.orderIndex,
              upgrades: {
                create: [
                  { stat: "ATK", level: 1, baseCost: 10, currentCost: 10 },
                  { stat: "DEF", level: 1, baseCost: 10, currentCost: 10 },
                  { stat: "HP", level: 1, baseCost: 15, currentCost: 15 },
                  { stat: "CRIT", level: 1, baseCost: 25, currentCost: 25 },
                ],
              },
            },
          },
        },
        include: { character: true },
      });

      const zones = await tx.zone.findMany({ orderBy: { orderIndex: "asc" } });
      for (const zone of zones) {
        await tx.characterZoneProgress.create({
          data: {
            characterId: createdUser.character.id,
            zoneId: zone.id,
            unlocked: zone.orderIndex <= firstZone.orderIndex,
          },
        });
      }

      return tx.user.findUnique({
        where: { id: createdUser.id },
        include: {
          character: {
            include: {
              upgrades: true,
              currentZone: { include: { enemies: { orderBy: { sortOrder: "asc" } } } },
              inventory: { include: { itemDefinition: true } },
              zoneProgress: { include: { zone: true } },
            },
          },
        },
      });
    });

    const token = createToken(user.id);

    res.status(201).json({
      success: true,
      token,
      user: { id: user.id, email: user.email },
      character: user.character,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Error registering user" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        character: {
          include: {
            upgrades: true,
            currentZone: { include: { enemies: { orderBy: { sortOrder: "asc" } } } },
            inventory: { include: { itemDefinition: true } },
            zoneProgress: { include: { zone: true } },
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = createToken(user.id);

    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email },
      character: user.character,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Error logging in" });
  }
});

module.exports = router;
