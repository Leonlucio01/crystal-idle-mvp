const API_URL = "https://crystal-idle-api.onrender.com";

let token = localStorage.getItem("crystal_idle_token") || "";
let character = null;
let selectedEnemy = null;
let zones = [];

let enemyCurrentHp = 0;
let autoFarmEnabled = false;
let autoFarmInterval = null;
let autoFarmProgressInterval = null;
let farmProgress = 0;
const AUTO_FARM_SECONDS = 2;

const $ = (id) => document.getElementById(id);

async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `HTTP ${res.status}`);
  }

  return data;
}

function status(id, msg) {
  $(id).textContent = msg;
}

async function loadZones() {
  try {
    const data = await api("/zones");
    zones = data.data || [];
  } catch (e) {
    console.error("Error loading zones:", e);
    status("combatStatus", `Error cargando zonas: ${e.message}`);
  }
}

function renderCharacter(c) {
  character = c;

  $("name").textContent = c?.name || "---";
  $("className").textContent = c?.class || "---";
  $("level").textContent = c?.level ?? 0;
  $("xp").textContent = c?.xp ?? 0;
  $("gold").textContent = c?.gold ?? 0;
  $("power").textContent = c?.power ?? 0;
  $("atk").textContent = c?.atk ?? 0;
  $("def").textContent = c?.def ?? 0;
  $("hp").textContent = `${c?.currentHp ?? 0}/${c?.maxHp ?? 0}`;
  $("crit").textContent = `${Math.round((c?.critChance ?? 0) * 1000) / 10}%`;
  $("zone").textContent = c?.currentZone?.name || "---";

  let enemies = c?.currentZone?.enemies || [];

  if (!enemies.length && c?.currentZoneId && zones.length) {
    const zone = zones.find((item) => item.id === c.currentZoneId);
    enemies = zone?.enemies || [];
  }

  if (!enemies.length && c?.currentZone?.id && zones.length) {
    const zone = zones.find((item) => item.id === c.currentZone.id);
    enemies = zone?.enemies || [];
  }

  renderEnemies(enemies);
}

function renderEnemies(enemies) {
  const previousEnemyId = selectedEnemy?.id;

  $("enemySelect").innerHTML = "";

  enemies.forEach((e) => {
    const o = document.createElement("option");
    o.value = e.id;
    o.textContent = `${e.name}${e.isBoss ? " (Boss)" : ""}`;
    $("enemySelect").appendChild(o);
  });

  selectedEnemy =
    enemies.find((enemy) => enemy.id === previousEnemyId) ||
    enemies[0] ||
    null;

  if (selectedEnemy) {
    $("enemySelect").value = selectedEnemy.id;
  }

  resetEnemyHp();
  renderEnemy();
}

function resetEnemyHp() {
  enemyCurrentHp = selectedEnemy?.maxHp || 0;
  renderEnemyHp();
}

function renderEnemyHp() {
  const maxHp = selectedEnemy?.maxHp || 0;
  const hp = Math.max(0, Math.min(enemyCurrentHp, maxHp));
  const percent = maxHp > 0 ? (hp / maxHp) * 100 : 0;

  $("enemyHpText").textContent = `${Math.ceil(hp)} / ${maxHp}`;

  if ($("enemyHpFill")) {
    $("enemyHpFill").style.width = `${percent}%`;
  }
}

function renderEnemy() {
  if (!selectedEnemy) {
    $("enemyName").textContent = "---";
    $("enemyStats").textContent = "---";
    $("enemyHpText").textContent = "0 / 0";
    $("enemyHpFill").style.width = "0%";
    return;
  }

  $("enemyName").textContent = selectedEnemy.name;
  $("enemyStats").textContent =
    `HP ${selectedEnemy.maxHp} | ATK ${selectedEnemy.atk} | DEF ${selectedEnemy.def} | XP ${selectedEnemy.xpReward} | Gold ${selectedEnemy.goldReward}`;

  renderEnemyHp();
}

function showDamagePopup(amount) {
  const popup = $("damagePopup");
  popup.textContent = `-${amount}`;
  popup.classList.remove("show");
  void popup.offsetWidth;
  popup.classList.add("show");

  const monster = $("monsterSprite");
  monster.classList.add("hit");
  setTimeout(() => monster.classList.remove("hit"), 140);
}

function showRewardPopup(gold, xp) {
  const popup = $("rewardPopup");
  popup.textContent = `+${gold} gold  +${xp} XP`;
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

function simulateAttackVisual() {
  if (!selectedEnemy) return;

  const visualDamage = Math.max(
    1,
    Math.min(selectedEnemy.maxHp, character?.atk || 1)
  );

  enemyCurrentHp = Math.max(0, enemyCurrentHp - visualDamage);
  renderEnemyHp();
  showDamagePopup(visualDamage);

  if (enemyCurrentHp <= 0) {
    showDeathAnimation();
  }
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
    renderCharacter(data.character);
    loadLeaderboard();
  } catch (e) {
    status("authStatus", `Error: ${e.message}`);
  }
}

async function login() {
  try {
    status("authStatus", "Iniciando sesión...");

    const data = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: $("email").value.trim(),
        password: $("password").value,
      }),
    });

    token = data.token;
    localStorage.setItem("crystal_idle_token", token);

    status("authStatus", "Sesión iniciada.");
    renderCharacter(data.character);
    loadLeaderboard();
  } catch (e) {
    status("authStatus", `Error: ${e.message}`);
  }
}

async function loadCharacter() {
  if (!token) {
    return status("authStatus", "Primero inicia sesión.");
  }

  try {
    const data = await api("/character/me");
    renderCharacter(data.data);
  } catch (e) {
    status("authStatus", `Error: ${e.message}`);
  }
}

async function killEnemy() {
  if (!selectedEnemy) {
    return status("combatStatus", "No hay enemigo seleccionado.");
  }

  try {
    simulateAttackVisual();
    status("combatStatus", `Atacando ${selectedEnemy.name}...`);

    const data = await api("/combat/kill", {
      method: "POST",
      body: JSON.stringify({
        enemyTypeId: selectedEnemy.id,
      }),
    });

    const r = data.data;

    enemyCurrentHp = 0;
    renderEnemyHp();
    showRewardPopup(r.goldEarned, r.xpEarned);
    showDeathAnimation();

    status(
      "combatStatus",
      `${data.message}. +${r.goldEarned} gold, +${r.xpEarned} XP.`
    );

    renderCharacter(r.character);
    loadLeaderboard();
  } catch (e) {
    status("combatStatus", `Error: ${e.message}`);
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

  if ($("farmProgress")) {
    $("farmProgress").style.width = "0%";
  }
}

function startFarmProgress() {
  resetFarmProgress();
  clearInterval(autoFarmProgressInterval);

  autoFarmProgressInterval = setInterval(() => {
    farmProgress += 100 / (AUTO_FARM_SECONDS * 10);

    if (farmProgress > 100) {
      farmProgress = 100;
    }

    if ($("farmProgress")) {
      $("farmProgress").style.width = `${farmProgress}%`;
    }

    if (selectedEnemy) {
      const simulatedHp =
        selectedEnemy.maxHp -
        (selectedEnemy.maxHp * farmProgress) / 100;
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
    autoFarmTick();

    autoFarmInterval = setInterval(() => {
      autoFarmTick();
    }, AUTO_FARM_SECONDS * 1000);
  } else {
    clearInterval(autoFarmInterval);
    clearInterval(autoFarmProgressInterval);
    resetFarmProgress();
    resetEnemyHp();
    status("combatStatus", "Auto Farm detenido.");
  }
}

async function claimOffline() {
  try {
    status("combatStatus", "Reclamando offline...");

    const data = await api("/idle/claim-offline", {
      method: "POST",
    });

    const r = data.data;

    status(
      "combatStatus",
      `${data.message}. ${r.secondsOffline}s, kills ${r.kills}, +${r.goldEarned} gold, +${r.xpEarned} XP.`
    );

    if (r.goldEarned > 0 || r.xpEarned > 0) {
      showRewardPopup(r.goldEarned, r.xpEarned);
    }

    renderCharacter(r.character);
    loadLeaderboard();
  } catch (e) {
    status("combatStatus", `Error: ${e.message}`);
  }
}

async function upgrade(stat) {
  try {
    status("upgradeStatus", `Mejorando ${stat}...`);

    const data = await api("/character/upgrade-stat", {
      method: "POST",
      body: JSON.stringify({ stat }),
    });

    status("upgradeStatus", data.message);
    renderCharacter(data.data.character);
    loadLeaderboard();
  } catch (e) {
    status("upgradeStatus", `Error: ${e.message}`);
  }
}

async function loadLeaderboard() {
  try {
    const data = await api("/leaderboard/power");

    $("leaderboard").innerHTML = "";

    data.data.forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML =
        `<td>${row.rank}</td>` +
        `<td>${row.name}</td>` +
        `<td>${row.class}</td>` +
        `<td>${row.level}</td>` +
        `<td>${row.power}</td>` +
        `<td>${row.currentZone?.name || "---"}</td>`;

      $("leaderboard").appendChild(tr);
    });
  } catch (e) {
    $("leaderboard").innerHTML =
      `<tr><td colspan="6">Error: ${e.message}</td></tr>`;
  }
}

$("registerBtn").onclick = register;
$("loginBtn").onclick = login;
$("refreshCharacterBtn").onclick = loadCharacter;
$("killBtn").onclick = killEnemy;
$("autoFarmBtn").onclick = toggleAutoFarm;
$("offlineBtn").onclick = claimOffline;
$("leaderboardBtn").onclick = loadLeaderboard;

document.querySelectorAll(".upgradeGrid button").forEach((button) => {
  button.onclick = () => upgrade(button.dataset.stat);
});

$("enemySelect").onchange = () => {
  const enemies =
    character?.currentZone?.enemies ||
    zones.find((zone) => zone.id === character?.currentZoneId)?.enemies ||
    zones.find((zone) => zone.id === character?.currentZone?.id)?.enemies ||
    [];

  selectedEnemy =
    enemies.find((enemy) => enemy.id === $("enemySelect").value) ||
    null;

  resetEnemyHp();
  renderEnemy();
};

(async () => {
  await loadZones();
  await loadLeaderboard();

  if (token) {
    status("authStatus", "Token guardado encontrado.");
    await loadCharacter();
  }

  updateFarmButton();
})();
