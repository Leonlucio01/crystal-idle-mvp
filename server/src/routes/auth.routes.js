const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");
const { calculatePower } = require("../game/progression");

const router = express.Router();

function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

router.post("/register", async (req, res) => {
  try {
    const { email, password, characterName } = req.body;

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
    const defaultStats = {
      atk: 10,
      def: 3,
      maxHp: 100,
      currentHp: 100,
      critChance: 0.05,
      critDamage: 1.5,
    };

    const power = calculatePower(defaultStats);

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          character: {
            create: {
              name: characterName,
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
