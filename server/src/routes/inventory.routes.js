const express = require("express");
const prisma = require("../utils/prisma");
const authMiddleware = require("../middleware/auth.middleware");
const { calculatePower } = require("../game/progression");
const { serializeDrop } = require("../game/drops");

const router = express.Router();

async function getCharacter(userId) {
  return prisma.character.findUnique({
    where: { userId },
    include: {
      inventory: { include: { itemDefinition: true }, orderBy: { acquiredAt: "desc" } },
    },
  });
}

router.get("/", authMiddleware, async (req, res) => {
  try {
    const character = await getCharacter(req.user.id);

    if (!character) {
      return res.status(404).json({ success: false, message: "Character not found" });
    }

    const items = character.inventory.map(serializeDrop);
    const equipped = items.filter((item) => item.equippedSlot);

    res.json({
      success: true,
      data: {
        items,
        equipped,
      },
    });
  } catch (error) {
    console.error("Inventory list error:", error);
    res.status(500).json({ success: false, message: "Error fetching inventory" });
  }
});

router.post("/equip", authMiddleware, async (req, res) => {
  try {
    const { inventoryItemId } = req.body;

    if (!inventoryItemId) {
      return res.status(400).json({ success: false, message: "inventoryItemId is required" });
    }

    const character = await getCharacter(req.user.id);
    if (!character) {
      return res.status(404).json({ success: false, message: "Character not found" });
    }

    const item = character.inventory.find((entry) => entry.id === inventoryItemId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Inventory item not found" });
    }

    if (!item.itemDefinition.slot) {
      return res.status(400).json({ success: false, message: "This item cannot be equipped" });
    }

    const slot = item.itemDefinition.slot;

    const result = await prisma.$transaction(async (tx) => {
      await tx.characterInventoryItem.updateMany({
        where: {
          characterId: character.id,
          equippedSlot: slot,
        },
        data: { equippedSlot: null },
      });

      const equippedItem = await tx.characterInventoryItem.update({
        where: { id: item.id },
        data: { equippedSlot: slot },
        include: { itemDefinition: true },
      });

      const updatedInventory = await tx.characterInventoryItem.findMany({
        where: { characterId: character.id },
        include: { itemDefinition: true },
      });

      const equipmentStats = updatedInventory
        .filter((entry) => entry.equippedSlot)
        .reduce(
          (acc, entry) => {
            acc.atk += entry.atk || 0;
            acc.def += entry.def || 0;
            acc.maxHp += entry.maxHp || 0;
            acc.critChance += entry.critChance || 0;
            return acc;
          },
          { atk: 0, def: 0, maxHp: 0, critChance: 0 }
        );

      const updatedCharacter = await tx.character.update({
        where: { id: character.id },
        data: {
          power: calculatePower({
            atk: character.atk + equipmentStats.atk,
            def: character.def + equipmentStats.def,
            maxHp: character.maxHp + equipmentStats.maxHp,
            critChance: character.critChance + equipmentStats.critChance,
          }),
        },
        include: {
          upgrades: true,
          currentZone: { include: { enemies: { orderBy: { sortOrder: "asc" } } } },
          inventory: { include: { itemDefinition: true } },
        },
      });

      return { equippedItem, updatedCharacter };
    });

    res.json({
      success: true,
      message: `${item.itemDefinition.name} equipped`,
      data: {
        item: serializeDrop(result.equippedItem),
        character: result.updatedCharacter,
      },
    });
  } catch (error) {
    console.error("Inventory equip error:", error);
    res.status(500).json({ success: false, message: "Error equipping item" });
  }
});

router.post("/sell", authMiddleware, async (req, res) => {
  try {
    const { inventoryItemId, quantity = 1 } = req.body;

    if (!inventoryItemId) {
      return res.status(400).json({ success: false, message: "inventoryItemId is required" });
    }

    const character = await getCharacter(req.user.id);
    if (!character) {
      return res.status(404).json({ success: false, message: "Character not found" });
    }

    const item = character.inventory.find((entry) => entry.id === inventoryItemId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Inventory item not found" });
    }

    if (item.equippedSlot) {
      return res.status(400).json({ success: false, message: "Unequip the item before selling it" });
    }

    const sellQuantity = Math.max(1, Math.min(Number(quantity) || 1, item.quantity));
    const goldEarned = sellQuantity * (item.itemDefinition.sellGold || 0);

    const result = await prisma.$transaction(async (tx) => {
      if (item.quantity > sellQuantity) {
        await tx.characterInventoryItem.update({
          where: { id: item.id },
          data: { quantity: item.quantity - sellQuantity },
        });
      } else {
        await tx.characterInventoryItem.delete({ where: { id: item.id } });
      }

      const updatedCharacter = await tx.character.update({
        where: { id: character.id },
        data: { gold: character.gold + goldEarned },
        include: {
          upgrades: true,
          currentZone: { include: { enemies: { orderBy: { sortOrder: "asc" } } } },
          inventory: { include: { itemDefinition: true } },
        },
      });

      return { updatedCharacter };
    });

    res.json({
      success: true,
      message: `${item.itemDefinition.name} sold for ${goldEarned} gold`,
      data: {
        goldEarned,
        quantity: sellQuantity,
        character: result.updatedCharacter,
      },
    });
  } catch (error) {
    console.error("Inventory sell error:", error);
    res.status(500).json({ success: false, message: "Error selling item" });
  }
});

module.exports = router;
