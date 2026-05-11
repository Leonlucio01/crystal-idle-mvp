const DEFAULT_RENDER_API_URL = "https://crystal-idle-api.onrender.com";
const DEFAULT_LOCAL_API_URL = "http://localhost:3000";
const API_URL = localStorage.getItem("crystal_idle_api_url") || (location.protocol === "file:" ? DEFAULT_LOCAL_API_URL : DEFAULT_RENDER_API_URL);

let token = localStorage.getItem("crystal_idle_token") || "";
let character = null;
let selectedEnemy = null;
let zones = [];
let inventoryItems = [];
let equippedItems = [];
let selectedInventoryFilter = "ALL";
let recentDrops = [];

let enemyCurrentHp = 0;
let autoFarmEnabled = false;
let autoFarmInterval = null;
let autoFarmProgressInterval = null;
let farmProgress = 0;
const AUTO_FARM_SECONDS = 2;

const $ = (id) => document.getElementById(id);

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

function formatNumber(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }).format(number);
}

function formatDuration(seconds) {
  const total = Number(seconds || 0);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = Math.floor(total % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function getCurrentZone() {
  if (!character) return null;
  return character.currentZone || zones.find((zone) => zone.id === character.currentZoneId) || null;
}

function getCurrentEnemies() {
  const zone = getCurrentZone();
  return zone?.enemies || [];
}

function getCurrentBoss() {
  return getCurrentEnemies().find((enemy) => enemy.isBoss) || null;
}

function getNormalEnemies(enemies = getCurrentEnemies()) {
  return enemies.filter((enemy) => !enemy.isBoss);
}

function getRecommendedPower(enemy, zone = null) {
  if (enemy?.powerRecommended) return Number(enemy.powerRecommended);
  if (zone?.requiredPower) return Number(zone.requiredPower);
  if (!enemy) return 0;
  return Math.max(100, Math.floor(enemy.maxHp * 0.45 + enemy.atk * 12 + enemy.def * 18));
}

function getNextZone() {
  const currentZone = getCurrentZone();
  if (!currentZone || !zones.length) return null;
  const sorted = [...zones].sort((a, b) => (a.orderIndex || a.requiredLevel) - (b.orderIndex || b.requiredLevel));
  const index = sorted.findIndex((zone) => zone.id === currentZone.id);
  return index >= 0 ? sorted[index + 1] : null;
}

function normalizeDrop(drop) {
  if (!drop) return null;
  return {
    name: drop.name || "Drop desconocido",
    id: drop.id || null,
    itemDefinitionId: drop.itemDefinitionId || null,
    name: drop.name || "Drop desconocido",
    type: drop.type || null,
    rarity: (drop.rarity || "common").toLowerCase(),
    slot: drop.slot || null,
    source: drop.source || "Combate",
    quantity: drop.quantity || 1,
    atk: drop.atk || 0,
    def: drop.def || 0,
    maxHp: drop.maxHp || 0,
    critChance: drop.critChance || 0,
    goldBonus: drop.goldBonus || 0,
    xpBonus: drop.xpBonus || 0,
    autoFarmSpeed: drop.autoFarmSpeed || 0,
  };
}

function addDrop(drop) {
  const normalized = normalizeDrop(drop);
  if (!normalized) return;
  recentDrops.unshift({ ...normalized, id: `${Date.now()}-${Math.random()}` });
  recentDrops = recentDrops.slice(0, 10);
  renderDropFeed();
  addLog(`Drop encontrado: ${normalized.name} (${normalized.rarity}).`, "success");
}

function addDrops(drops = [], source = "Combate") {
  drops.forEach((drop) => addDrop({ ...drop, source: drop.source || source }));
}

function statLine(item) {
  const parts = [];
  if (item.atk) parts.push(`ATK +${formatNumber(item.atk)}`);
  if (item.def) parts.push(`DEF +${formatNumber(item.def)}`);
  if (item.maxHp) parts.push(`HP +${formatNumber(item.maxHp)}`);
  if (item.critChance) parts.push(`CRIT +${Math.round(item.critChance * 1000) / 10}%`);
  if (item.goldBonus) parts.push(`Oro +${Math.round(item.goldBonus * 100)}%`);
  if (item.xpBonus) parts.push(`XP +${Math.round(item.xpBonus * 100)}%`);
  if (item.autoFarmSpeed) parts.push(`Auto +${Math.round(item.autoFarmSpeed * 100)}%`);
  return parts.join(" · ") || "Material / coleccionable";
}

function itemTypeLabel(item) {
  const map = {
    WEAPON: "Arma",
    ARMOR: "Armadura",
    HELMET: "Casco",
    BOOTS: "Botas",
    AMULET: "Amuleto",
    MATERIAL: "Material",
    CHEST: "Cofre",
  };
  return map[item.type] || item.type || "Item";
}

function slotLabel(slot) {
  const map = { WEAPON: "Arma", ARMOR: "Armadura", HELMET: "Casco", BOOTS: "Botas", AMULET: "Amuleto" };
  return map[slot] || slot || "Slot";
}

function renderDropFeed() {
  const feed = $("dropFeed");
  if (!feed) return;

  if (!recentDrops.length) {
    feed.innerHTML = `<p class="status">Aun no hay drops. Farmea enemigos o desafia jefes.</p>`;
    return;
  }

  feed.innerHTML = recentDrops
    .map((drop) => `
      <div class="drop-item ${drop.rarity}">
        <div>
          <strong>${drop.quantity > 1 ? `${drop.quantity}x ` : ""}${drop.name}</strong>
          <span>${drop.source}</span>
        </div>
        <em class="drop-rarity">${drop.rarity}</em>
      </div>
    `)
    .join("");
}

function renderEquipment() {
  const container = $("equipmentGrid");
  if (!container) return;

  const slots = ["WEAPON", "ARMOR", "HELMET", "BOOTS", "AMULET"];
  const bySlot = Object.fromEntries(equippedItems.map((item) => [item.equippedSlot || item.slot, item]));

  container.innerHTML = slots.map((slot) => {
    const item = bySlot[slot];
    return `
      <div class="equipment-slot ${item ? String(item.rarity || "common").toLowerCase() : "empty"}">
        <span>${slotLabel(slot)}</span>
        <strong>${item ? item.name : "Vacío"}</strong>
        <small>${item ? statLine(item) : "Sin bonus"}</small>
      </div>
    `;
  }).join("");
}

function renderInventory() {
  renderEquipment();
  const container = $("inventoryList");
  if (!container) return;

  const filterButtons = document.querySelectorAll(".inventoryFilter");
  filterButtons.forEach((button) => button.classList.toggle("active", button.dataset.filter === selectedInventoryFilter));

  let items = [...inventoryItems];
  if (selectedInventoryFilter !== "ALL") {
    items = items.filter((item) => item.type === selectedInventoryFilter || item.slot === selectedInventoryFilter);
  }

  status("inventoryCount", `${formatNumber(inventoryItems.length)} items`);

  if (!character) {
    container.innerHTML = `<p class="status">Inicia sesión para ver tu inventario.</p>`;
    return;
  }

  if (!items.length) {
    container.innerHTML = `<p class="status">Inventario vacío. Usa Auto Farm, derrota enemigos o desafía jefes para conseguir drops.</p>`;
    return;
  }

  container.innerHTML = items.map((item) => {
    const rarity = String(item.rarity || "common").toLowerCase();
    const canEquip = Boolean(item.slot);
    const equipped = Boolean(item.equippedSlot);
    const qty = item.quantity > 1 ? `${item.quantity}x ` : "";
    return `
      <div class="inventory-item ${rarity}">
        <div class="inventory-item-main">
          <div class="inventory-title-row">
            <strong>${qty}${item.name}</strong>
            <span class="drop-rarity">${rarity}</span>
          </div>
          <p>${itemTypeLabel(item)}${equipped ? ` · Equipado en ${slotLabel(item.equippedSlot)}` : ""}</p>
          <small>${statLine(item)}</small>
        </div>
        <div class="inventory-actions">
          <button class="small primary inventory-equip" data-item-id="${item.id}" ${!canEquip || equipped ? "disabled" : ""}>${equipped ? "Equipado" : "Equipar"}</button>
          <button class="small ghost inventory-sell" data-item-id="${item.id}" ${equipped ? "disabled" : ""}>Vender</button>
        </div>
      </div>
    `;
  }).join("");

  container.querySelectorAll(".inventory-equip").forEach((button) => {
    button.onclick = () => equipItem(button.dataset.itemId);
  });
  container.querySelectorAll(".inventory-sell").forEach((button) => {
    button.onclick = () => sellItem(button.dataset.itemId);
  });
}

async function loadInventory() {
  if (!token) {
    inventoryItems = [];
    equippedItems = [];
    renderInventory();
    return;
  }

  try {
    const data = await api("/inventory");
    inventoryItems = data.data?.items || [];
    equippedItems = data.data?.equipped || [];
    renderInventory();
  } catch (e) {
    status("inventoryStatus", `Error: ${e.message}`);
    addLog(`Error cargando inventario: ${e.message}`, "error");
  }
}

function status(id, msg) {
  const el = $(id);
  if (el) el.textContent = msg;
}

function addLog(message, type = "info") {
  const log = $("activityLog");
  if (!log) return;
  const time = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const item = document.createElement("div");
  item.className = `log-item ${type}`;
  item.innerHTML = `<strong>${time}</strong> · ${message}`;
  log.prepend(item);
  while (log.children.length > 12) log.lastElementChild.remove();
}

function setTopResources(c) {
  $("topLevel").textContent = formatNumber(c?.level ?? 0);
  $("topGold").textContent = formatNumber(c?.gold ?? 0);
  $("topDiamonds").textContent = formatNumber(c?.diamonds ?? 0);
  $("topPower").textContent = formatNumber(c?.power ?? 0);
}

function setXpProgress(c) {
  const xp = Number(c?.xp || 0);
  const level = Number(c?.level || 1);
  const nextXp = Number(c?.nextLevelXp || c?.xpToNextLevel || level * level * 100 || 100);
  const currentLevelStart = Number(c?.currentLevelStartXp || 0);
  const gainedThisLevel = Math.max(0, xp - currentLevelStart);
  const neededThisLevel = Math.max(1, nextXp - currentLevelStart);
  const percent = Math.max(0, Math.min(100, (gainedThisLevel / neededThisLevel) * 100));
  $("xpFill").style.width = `${percent}%`;
}

async function loadZones() {
  try {
    const data = await api("/zones");
    zones = data.data || [];
    renderZones();
    addLog("Zonas cargadas desde la API.");
  } catch (e) {
    console.error("Error loading zones:", e);
    status("combatStatus", `Error cargando zonas: ${e.message}`);
    addLog(`Error cargando zonas: ${e.message}`, "error");
  }
}

function normalizeCharacter(c) {
  if (!c) return c;
  const previousUpgrades = character?.upgrades || [];
  const previousCurrentZone = character?.currentZone;

  return {
    ...c,
    upgrades: Array.isArray(c.upgrades) && c.upgrades.length ? c.upgrades : previousUpgrades,
    currentZone: c.currentZone || previousCurrentZone,
  };
}

function getUpgrade(stat) {
  return character?.upgrades?.find((upgrade) => upgrade.stat === stat);
}

function hasBossKillForZone(zone) {
  // MVP: el backend valida el jefe con CombatLog. En frontend solo mostramos la meta.
  return Boolean(zone && character && character.currentZoneId !== zone.id && character.level >= zone.requiredLevel);
}

function renderZones() {
  const container = $("zoneList");
  if (!container) return;

  container.innerHTML = "";

  if (!zones.length) {
    container.innerHTML = `<p class="status">No hay zonas cargadas.</p>`;
    return;
  }

  const currentZoneId = character?.currentZoneId || character?.currentZone?.id;
  const characterLevel = character?.level ?? 0;

  status("zoneStatus", character ? `Nivel actual: ${characterLevel}` : "Inicia sesión para cambiar de zona.");

  zones.forEach((zone) => {
    const isCurrent = zone.id === currentZoneId;
    const isUnlocked = character ? Boolean(zone.unlocked || (!zone.locked && characterLevel >= zone.requiredLevel)) : zone.requiredLevel <= 1;

    const card = document.createElement("div");
    card.className = "zone-card" + (isCurrent ? " current" : "") + (!isUnlocked ? " locked" : "");

    const enemyNames = (zone.enemies || [])
      .map((enemy) => enemy.isBoss ? `${enemy.name} (Boss)` : enemy.name)
      .join(", ");

    card.innerHTML = `
      <div class="zone-meta">
        <span class="badge ${isCurrent ? "current" : isUnlocked ? "ok" : "locked"}">
          ${isCurrent ? "Actual" : isUnlocked ? "Disponible" : "Bloqueada"}
        </span>
        <span class="badge">Nivel ${zone.requiredLevel}+</span>
      </div>
      <h3>${zone.name}</h3>
      <p>${zone.description || "Zona de combate y farmeo."}</p>
      <p><strong>Enemigos:</strong> ${enemyNames || "Sin enemigos"}</p>
      <p><strong>Poder recomendado:</strong> ${formatNumber(getRecommendedPower((zone.enemies || []).find((enemy) => enemy.isBoss) || (zone.enemies || [])[0], zone))}</p>
      <button data-zone-id="${zone.id}" ${!isUnlocked || isCurrent ? "disabled" : ""}>
        ${isCurrent ? "Zona actual" : isUnlocked ? "Entrar" : `Bloqueada · Nivel ${zone.requiredLevel} / Poder ${formatNumber(zone.requiredPower || 0)}`}
      </button>
    `;

    const button = card.querySelector("button");
    button.onclick = () => changeZone(zone.id);
    container.appendChild(card);
  });
}

function renderUpgradeButtons() {
  const gold = character?.gold ?? 0;
  const buttons = document.querySelectorAll(".upgradeBtn");

  status("upgradeGoldHint", `Gold: ${formatNumber(gold)}`);

  buttons.forEach((button) => {
    const stat = button.dataset.stat;
    const upgrade = getUpgrade(stat);

    if (!character) {
      button.disabled = true;
      button.classList.remove("affordable", "expensive");
      button.innerHTML = `<span class="upgrade-title">Subir ${stat}</span><span class="upgrade-meta">Inicia sesión para ver costo</span>`;
      return;
    }

    if (!upgrade) {
      button.disabled = false;
      button.classList.remove("affordable", "expensive");
      button.innerHTML = `<span class="upgrade-title">Subir ${stat}</span><span class="upgrade-meta">Actualizando costo...</span>`;
      return;
    }

    const cost = upgrade.currentCost;
    const canAfford = gold >= cost;

    button.disabled = !canAfford;
    button.classList.toggle("affordable", canAfford);
    button.classList.toggle("expensive", !canAfford);

    button.innerHTML =
      `<span class="upgrade-title">Subir ${stat}</span>` +
      `<span class="upgrade-meta">Nivel ${upgrade.level} · Coste ${formatNumber(cost)} gold</span>` +
      (!canAfford
        ? `<span class="upgrade-warning">Faltan ${formatNumber(cost - gold)} gold</span>`
        : `<span class="upgrade-meta">Disponible</span>`);
  });
}

function renderCharacter(c) {
  character = normalizeCharacter(c);
  setTopResources(character);

  status("name", character?.name || "---");
  status("className", character?.class || "---");
  status("xp", formatNumber(character?.xp ?? 0));
  status("atk", formatNumber(character?.atk ?? 0));
  status("def", formatNumber(character?.def ?? 0));
  status("hp", `${formatNumber(character?.currentHp ?? 0)}/${formatNumber(character?.maxHp ?? 0)}`);
  status("crit", `${Math.round((character?.critChance ?? 0) * 1000) / 10}%`);
  status("zone", character?.currentZone?.name || "---");
  setXpProgress(character);

  let enemies = character?.currentZone?.enemies || [];

  if (!enemies.length && character?.currentZoneId && zones.length) {
    const zone = zones.find((item) => item.id === character.currentZoneId);
    enemies = zone?.enemies || [];
  }

  if (!enemies.length && character?.currentZone?.id && zones.length) {
    const zone = zones.find((item) => item.id === character.currentZone.id);
    enemies = zone?.enemies || [];
  }

  renderEnemies(enemies);
  renderBossPanel();
  renderUpgradeButtons();
  renderZones();
}

function renderEnemies(enemies) {
  const previousEnemyId = selectedEnemy?.id;
  const enemySelect = $("enemySelect");
  enemySelect.innerHTML = "";

  const farmEnemies = getNormalEnemies(enemies);

  farmEnemies.forEach((e) => {
    const o = document.createElement("option");
    o.value = e.id;
    o.textContent = `${e.name}${e.isBoss ? " (Boss)" : ""}`;
    enemySelect.appendChild(o);
  });

  selectedEnemy = farmEnemies.find((enemy) => enemy.id === previousEnemyId) || farmEnemies[0] || null;
  if (selectedEnemy) enemySelect.value = selectedEnemy.id;

  resetEnemyHp();
  renderEnemy();
}

function renderBossPanel() {
  const boss = getCurrentBoss();
  const button = $("bossBtn");

  if (!boss || !character) {
    status("bossName", "---");
    status("bossStats", "Inicia sesion para ver el jefe de la zona.");
    status("bossReward", "Derrota jefes para desbloquear nuevas zonas y cofres.");
    if (button) button.disabled = true;
    return;
  }

  const recommendedPower = getRecommendedPower(boss, getCurrentZone());
  const nextZone = getNextZone();
  const power = Number(character.power || 0);
  const ready = power >= recommendedPower;

  status("bossName", boss.name);
  status("bossStats", `HP ${formatNumber(boss.maxHp)} | ATK ${formatNumber(boss.atk)} | DEF ${formatNumber(boss.def)} | Poder recomendado ${formatNumber(recommendedPower)}`);
  status("bossReward", nextZone
    ? `Victoria: gran recompensa, chance de cofre y progreso hacia ${nextZone.name}.`
    : "Victoria: gran recompensa, chance de cofre y ranking de poder.");

  if (button) {
    button.disabled = !ready;
    button.textContent = ready ? "Desafiar jefe" : `Falta poder: ${formatNumber(recommendedPower - power)}`;
  }
}

function resetEnemyHp() {
  enemyCurrentHp = selectedEnemy?.maxHp || 0;
  renderEnemyHp();
}

function renderEnemyHp() {
  const maxHp = selectedEnemy?.maxHp || 0;
  const hp = Math.max(0, Math.min(enemyCurrentHp, maxHp));
  const percent = maxHp > 0 ? (hp / maxHp) * 100 : 0;
  status("enemyHpText", `${Math.ceil(hp)} / ${formatNumber(maxHp)}`);
  $("enemyHpFill").style.width = `${percent}%`;
}

function renderEnemy() {
  if (!selectedEnemy) {
    status("enemyName", "---");
    status("enemyStats", "---");
    status("enemyHpText", "0 / 0");
    $("enemyHpFill").style.width = "0%";
    return;
  }

  status("enemyName", selectedEnemy.name);
  status("enemyStats", `HP ${formatNumber(selectedEnemy.maxHp)} | ATK ${formatNumber(selectedEnemy.atk)} | DEF ${formatNumber(selectedEnemy.def)} | XP ${formatNumber(selectedEnemy.xpReward)} | Gold ${formatNumber(selectedEnemy.goldReward)}`);
  renderEnemyHp();
}

function showKillPopup() {
  const popup = $("killPopup");
  popup.textContent = "KILL";
  popup.classList.remove("show");
  void popup.offsetWidth;
  popup.classList.add("show");

  const monster = $("monsterSprite");
  monster.classList.add("hit");
  setTimeout(() => monster.classList.remove("hit"), 140);
}

function showRewardPopup(gold, xp) {
  const popup = $("rewardPopup");
  popup.textContent = `+${formatNumber(gold)} gold  +${formatNumber(xp)} XP`;
  popup.classList.remove("show");
  void popup.offsetWidth;
  popup.classList.add("show");
}

function showDeathAnimation() {
  const monster = $("monsterSprite");
  monster.classList.add("dead");
  setTimeout(() => {
    monster.classList.remove("dead");
    resetEnemyHp();
  }, 380);
}

function simulateKillVisual() {
  if (!selectedEnemy) return;
  enemyCurrentHp = 0;
  renderEnemyHp();
  showKillPopup();
  showDeathAnimation();
}

async function register() {
  try {
    status("authStatus", "Registrando...");

    const data = await api("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: $("email").value.trim(),
        password: $("password").value,
        characterName: $("characterName").value.trim(),
      }),
    });

    token = data.token;
    localStorage.setItem("crystal_idle_token", token);

    status("authStatus", "Registro correcto.");
    addLog("Registro correcto. Personaje creado.", "success");
    await loadCharacter();
    await loadInventory();
    loadLeaderboard();
  } catch (e) {
    status("authStatus", `Error: ${e.message}`);
    addLog(`Error de registro: ${e.message}`, "error");
  }
}

async function login() {
  try {
    status("authStatus", "Iniciando sesión...");

    const data = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: $("email").value.trim(), password: $("password").value }),
    });

    token = data.token;
    localStorage.setItem("crystal_idle_token", token);

    status("authStatus", "Sesión iniciada.");
    addLog("Sesión iniciada correctamente.", "success");
    await loadCharacter();
    await loadInventory();
    loadLeaderboard();
  } catch (e) {
    status("authStatus", `Error: ${e.message}`);
    addLog(`Error de login: ${e.message}`, "error");
  }
}

async function loadCharacter() {
  if (!token) return status("authStatus", "Primero inicia sesión.");

  try {
    const data = await api("/character/me");
    renderCharacter(data.data);
  } catch (e) {
    status("authStatus", `Error: ${e.message}`);
    addLog(`Error cargando personaje: ${e.message}`, "error");
  }
}

async function changeZone(zoneId) {
  if (!token) return status("zoneStatus", "Primero inicia sesión.");

  try {
    if (autoFarmEnabled) toggleAutoFarm();
    status("zoneStatus", "Cambiando zona...");

    const data = await api("/character/change-zone", {
      method: "POST",
      body: JSON.stringify({ zoneId }),
    });

    status("zoneStatus", data.message);
    addLog(data.message || "Zona cambiada.", "success");
    renderCharacter(data.data);
    await loadInventory();
    loadLeaderboard();
  } catch (e) {
    status("zoneStatus", `Error: ${e.message}`);
    addLog(`Error cambiando zona: ${e.message}`, "error");
  }
}

async function killEnemy() {
  if (!selectedEnemy) return status("combatStatus", "No hay enemigo seleccionado.");

  try {
    status("combatStatus", `Peleando contra ${selectedEnemy.name}...`);

    const data = await api("/combat/attack", {
      method: "POST",
      body: JSON.stringify({ enemyTypeId: selectedEnemy.id }),
    });

    const r = data.data;
    simulateKillVisual();
    showRewardPopup(r.goldEarned, r.xpEarned);

    addDrops(r.drops || (r.drop ? [r.drop] : []), selectedEnemy.name);

    const dropText = r.drops?.length ? ` Drops: ${r.drops.map((drop) => `${drop.quantity || 1}x ${drop.name}`).join(", ")}.` : r.drop ? ` Drop: ${r.drop.name}.` : "";
    status("combatStatus", `${data.message}. +${formatNumber(r.goldEarned)} gold, +${formatNumber(r.xpEarned)} XP.${dropText}`);
    addLog(`Derrotaste a ${selectedEnemy.name}: +${formatNumber(r.goldEarned)} oro, +${formatNumber(r.xpEarned)} XP.${dropText}`, "combat");
    await loadCharacter();
    await loadInventory();
    loadLeaderboard();
  } catch (e) {
    status("combatStatus", `Error: ${e.message}`);
    addLog(`Error en combate: ${e.message}`, "error");
  }
}


async function challengeBoss() {
  const boss = getCurrentBoss();
  if (!boss) return status("combatStatus", "No hay jefe en la zona actual.");

  try {
    if (autoFarmEnabled) toggleAutoFarm();
    status("combatStatus", `Desafiando a ${boss.name}...`);

    const data = await api("/combat/challenge-boss", {
      method: "POST",
      body: JSON.stringify({ enemyTypeId: boss.id }),
    });

    const r = data.data;
    enemyCurrentHp = 0;
    renderEnemyHp();
    showKillPopup();
    showRewardPopup(r.goldEarned, r.xpEarned);

    addDrops(r.drops || (r.drop ? [r.drop] : []), boss.name);

    const unlockedZone = r.nextZone || r.unlockedZone || null;
    const unlockText = unlockedZone ? ` Proxima meta: ${unlockedZone.name}.` : " Has conquistado la ultima zona disponible.";
    const dropText = r.drops?.length ? ` Drops: ${r.drops.map((drop) => `${drop.quantity || 1}x ${drop.name}`).join(", ")}.` : r.drop ? ` Drop: ${r.drop.name}.` : "";
    status("combatStatus", `Jefe derrotado: +${formatNumber(r.goldEarned)} gold, +${formatNumber(r.xpEarned)} XP.${dropText}${unlockText}`);
    addLog(`Jefe ${boss.name} derrotado.${dropText}${unlockText}`, "success");

    await loadCharacter();
    await loadInventory();
    await loadZones();
    loadLeaderboard();
  } catch (e) {
    status("combatStatus", `Error: ${e.message}`);
    addLog(`El jefe resistio: ${e.message}`, "error");
  }
}

function updateFarmButton() {
  const button = $("autoFarmBtn");
  if (!button) return;
  button.textContent = autoFarmEnabled ? "Auto Farm: ON" : "Auto Farm: OFF";
  button.classList.toggle("active", autoFarmEnabled);
}

function resetFarmProgress() {
  farmProgress = 0;
  $("farmProgress").style.width = "0%";
  status("farmTimerText", "0%");
}

function startFarmProgress() {
  resetFarmProgress();
  clearInterval(autoFarmProgressInterval);

  autoFarmProgressInterval = setInterval(() => {
    farmProgress += 100 / (AUTO_FARM_SECONDS * 10);
    if (farmProgress > 100) farmProgress = 100;
    $("farmProgress").style.width = `${farmProgress}%`;
    status("farmTimerText", `${Math.round(farmProgress)}%`);

    if (selectedEnemy) {
      const simulatedHp = selectedEnemy.maxHp - (selectedEnemy.maxHp * farmProgress) / 100;
      enemyCurrentHp = Math.max(0, simulatedHp);
      renderEnemyHp();
    }
  }, 100);
}

async function autoFarmTick() {
  if (!autoFarmEnabled) return;

  startFarmProgress();

  setTimeout(async () => {
    if (!autoFarmEnabled) return;
    await killEnemy();
    resetFarmProgress();
  }, AUTO_FARM_SECONDS * 1000);
}

function toggleAutoFarm() {
  autoFarmEnabled = !autoFarmEnabled;
  updateFarmButton();

  if (autoFarmEnabled) {
    status("combatStatus", "Auto Farm iniciado...");
    addLog("Auto Farm iniciado.", "success");
    autoFarmTick();
    autoFarmInterval = setInterval(() => autoFarmTick(), AUTO_FARM_SECONDS * 1000);
  } else {
    clearInterval(autoFarmInterval);
    clearInterval(autoFarmProgressInterval);
    resetFarmProgress();
    resetEnemyHp();
    status("combatStatus", "Auto Farm detenido.");
    addLog("Auto Farm detenido.");
  }
}

function showOfflineModal(reward) {
  status("offlineTime", formatDuration(reward.secondsOffline));
  status("offlineKills", formatNumber(reward.kills));
  status("offlineGold", formatNumber(reward.goldEarned));
  status("offlineXp", formatNumber(reward.xpEarned));

  const drops = reward.drops || [];
  const offlineDrops = $("offlineDrops");
  if (offlineDrops) {
    offlineDrops.innerHTML = drops.length
      ? drops.map((drop) => `
        <div class="drop-item ${String(drop.rarity || "common").toLowerCase()}">
          <div><strong>${drop.quantity || 1}x ${drop.name}</strong><span>${itemTypeLabel(drop)} · Recompensa offline</span></div>
          <em class="drop-rarity">${drop.rarity || "common"}</em>
        </div>
      `).join("")
      : `<p class="status">Sin drops esta vez. Sigue farmeando para conseguir cofres y materiales.</p>`;
  }

  drops.forEach((drop) => addDrop({ ...drop, source: "Offline" }));
  $("offlineModal").classList.remove("hidden");
}

async function claimOffline() {
  try {
    status("combatStatus", "Reclamando offline...");

    const data = await api("/idle/claim-offline", { method: "POST" });
    const r = data.data;

    const dropsText = r.drops?.length ? `, ${r.drops.length} drops` : "";
    status("combatStatus", `${data.message}. ${formatDuration(r.secondsOffline)}, kills ${formatNumber(r.kills)}, +${formatNumber(r.goldEarned)} gold, +${formatNumber(r.xpEarned)} XP${dropsText}.`);
    addLog(`Offline reclamado: ${formatDuration(r.secondsOffline)}, ${formatNumber(r.kills)} kills, +${formatNumber(r.goldEarned)} oro, +${formatNumber(r.xpEarned)} XP${dropsText}.`, "success");

    if (r.goldEarned > 0 || r.xpEarned > 0) {
      showRewardPopup(r.goldEarned, r.xpEarned);
      showOfflineModal(r);
    }

    await loadCharacter();
    await loadInventory();
    loadLeaderboard();
  } catch (e) {
    status("combatStatus", `Error: ${e.message}`);
    addLog(`Error reclamando offline: ${e.message}`, "error");
  }
}

async function upgrade(stat) {
  try {
    const upgradeInfo = getUpgrade(stat);

    if (!character) return status("upgradeStatus", "Primero inicia sesión.");

    if (!upgradeInfo) {
      await loadCharacter();
      return status("upgradeStatus", `Costos actualizados. Intenta subir ${stat} otra vez.`);
    }

    if ((character?.gold ?? 0) < upgradeInfo.currentCost) {
      return status("upgradeStatus", `Necesitas ${formatNumber(upgradeInfo.currentCost - character.gold)} gold más para subir ${stat}.`);
    }

    status("upgradeStatus", `Mejorando ${stat}...`);

    const data = await api("/character/upgrade-stat", {
      method: "POST",
      body: JSON.stringify({ stat }),
    });

    status("upgradeStatus", data.message);
    addLog(`${data.message || `Upgrade ${stat} comprado.`}`, "success");
    await loadCharacter();
    await loadInventory();
    loadLeaderboard();
  } catch (e) {
    status("upgradeStatus", `Error: ${e.message}`);
    addLog(`Error comprando upgrade: ${e.message}`, "error");
  }
}

async function equipItem(inventoryItemId) {
  if (!inventoryItemId) return;
  try {
    status("inventoryStatus", "Equipando item...");
    const data = await api("/inventory/equip", {
      method: "POST",
      body: JSON.stringify({ inventoryItemId }),
    });
    status("inventoryStatus", data.message || "Item equipado.");
    addLog(data.message || "Item equipado.", "success");
    if (data.data?.character) renderCharacter(data.data.character);
    await loadInventory();
    loadLeaderboard();
  } catch (e) {
    status("inventoryStatus", `Error: ${e.message}`);
    addLog(`Error equipando item: ${e.message}`, "error");
  }
}

async function sellItem(inventoryItemId) {
  if (!inventoryItemId) return;
  try {
    status("inventoryStatus", "Vendiendo item...");
    const data = await api("/inventory/sell", {
      method: "POST",
      body: JSON.stringify({ inventoryItemId, quantity: 1 }),
    });
    status("inventoryStatus", data.message || "Item vendido.");
    addLog(data.message || "Item vendido.", "success");
    if (data.data?.character) renderCharacter(data.data.character);
    await loadInventory();
    loadLeaderboard();
  } catch (e) {
    status("inventoryStatus", `Error: ${e.message}`);
    addLog(`Error vendiendo item: ${e.message}`, "error");
  }
}

async function loadLeaderboard() {
  try {
    const data = await api("/leaderboard/power");
    const tbody = $("leaderboard");
    tbody.innerHTML = "";

    data.data.forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML =
        `<td>${row.rank}</td>` +
        `<td>${row.name}</td>` +
        `<td>${row.class}</td>` +
        `<td>${formatNumber(row.level)}</td>` +
        `<td>${formatNumber(row.power)}</td>` +
        `<td>${row.currentZone?.name || "---"}</td>`;
      tbody.appendChild(tr);
    });
  } catch (e) {
    $("leaderboard").innerHTML = `<tr><td colspan="6">Error: ${e.message}</td></tr>`;
  }
}

$("registerBtn").onclick = register;
$("loginBtn").onclick = login;
$("refreshCharacterBtn").onclick = loadCharacter;
$("killBtn").onclick = killEnemy;
$("autoFarmBtn").onclick = toggleAutoFarm;
$("offlineBtn").onclick = claimOffline;
$("leaderboardBtn").onclick = loadLeaderboard;
$("bossBtn").onclick = challengeBoss;
$("closeOfflineModal").onclick = () => $("offlineModal").classList.add("hidden");
$("offlineModal").onclick = (event) => {
  if (event.target.id === "offlineModal") $("offlineModal").classList.add("hidden");
};

document.querySelectorAll(".upgradeBtn").forEach((button) => {
  button.onclick = () => upgrade(button.dataset.stat);
});

document.querySelectorAll(".inventoryFilter").forEach((button) => {
  button.onclick = () => {
    selectedInventoryFilter = button.dataset.filter;
    renderInventory();
  };
});

$("enemySelect").onchange = () => {
  const enemies = getNormalEnemies(
    character?.currentZone?.enemies ||
    zones.find((zone) => zone.id === character?.currentZoneId)?.enemies ||
    zones.find((zone) => zone.id === character?.currentZone?.id)?.enemies ||
    []
  );

  selectedEnemy = enemies.find((enemy) => enemy.id === $("enemySelect").value) || null;
  resetEnemyHp();
  renderEnemy();
};

(async () => {
  addLog("Cliente web iniciado.");
  setTopResources(null);
  await loadZones();
  await loadLeaderboard();

  if (token) {
    status("authStatus", "Token guardado encontrado.");
    addLog("Token guardado encontrado. Cargando personaje...");
    await loadCharacter();
    await loadInventory();
  } else {
    renderUpgradeButtons();
    renderZones();
    renderInventory();
  }

  renderDropFeed();
  renderBossPanel();
  updateFarmButton();
})();
