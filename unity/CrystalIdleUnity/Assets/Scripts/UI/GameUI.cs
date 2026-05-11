using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class GameUI : MonoBehaviour
{
    [Header("Character Texts")]
    public TMP_Text nameText;
    public TMP_Text classText;
    public TMP_Text levelText;
    public TMP_Text xpText;
    public TMP_Text goldText;
    public TMP_Text atkText;
    public TMP_Text defText;
    public TMP_Text hpText;
    public TMP_Text critText;
    public TMP_Text powerText;
    public TMP_Text zoneText;
    public TMP_Text statusText;

    [Header("Zone UI")]
    public TMP_Dropdown zoneDropdown;
    public Button changeZoneButton;
    public TMP_Text zoneStatusText;

    [Header("Enemy Preview UI")]
    public TMP_Text enemyNameText;
    public TMP_Text enemyStatsText;
    public TMP_Text enemyRewardText;

    [Header("Combat UI")]
    public TMP_Dropdown enemyDropdown;
    public Button killEnemyButton;
    public TMP_Text combatStatusText;

    [Header("Buttons")]
    public Button refreshButton;
    public Button logoutButton;

    private CharacterData currentCharacter;
    private readonly List<ZoneData> allZones = new List<ZoneData>();
    private readonly List<EnemyTypeData> previewEnemies = new List<EnemyTypeData>();
    private readonly List<EnemyTypeData> currentEnemies = new List<EnemyTypeData>();

    private string currentZoneId = "";
    private string currentZoneName = "";
    private bool suppressDropdownEvents;

    private void Awake()
    {
        AutoWireIfNeeded();
    }

    private void Start()
    {
        if (refreshButton != null)
            refreshButton.onClick.AddListener(LoadCharacter);

        if (logoutButton != null)
            logoutButton.onClick.AddListener(Logout);

        if (killEnemyButton != null)
            killEnemyButton.onClick.AddListener(KillSelectedEnemy);

        if (changeZoneButton != null)
            changeZoneButton.onClick.AddListener(ChangeSelectedZone);

        if (zoneDropdown != null)
            zoneDropdown.onValueChanged.AddListener(OnZoneDropdownChanged);

        if (enemyDropdown != null)
            enemyDropdown.onValueChanged.AddListener(OnEnemyDropdownChanged);

        LoadCharacter();
    }

    [ContextMenu("Auto Wire UI References")]
    public void AutoWireIfNeeded()
    {
        nameText ??= FindTMPText("NameText");
        classText ??= FindTMPText("ClassText");
        levelText ??= FindTMPText("LevelText");
        xpText ??= FindTMPText("XPText");
        goldText ??= FindTMPText("GoldText");
        atkText ??= FindTMPText("ATKText");
        defText ??= FindTMPText("DEFText");
        hpText ??= FindTMPText("HPText");
        critText ??= FindTMPText("CRITText");
        powerText ??= FindTMPText("PowerText");
        zoneText ??= FindTMPText("ZoneText");
        statusText ??= FindTMPText("StatusText");

        zoneDropdown ??= FindTMPDropdown("ZoneDropdown");
        changeZoneButton ??= FindButton("ChangeZoneButton");
        zoneStatusText ??= FindTMPText("ZoneStatusText");

        enemyNameText ??= FindTMPText("EnemyNameText");
        enemyStatsText ??= FindTMPText("EnemyStatsText");
        enemyRewardText ??= FindTMPText("EnemyRewardText");

        enemyDropdown ??= FindTMPDropdown("EnemyDropdown");
        killEnemyButton ??= FindButton("KillEnemyButton");
        combatStatusText ??= FindTMPText("CombatStatusText");

        refreshButton ??= FindButton("RefreshButton");
        logoutButton ??= FindButton("LogoutButton");
    }

    private void LoadCharacter()
    {
        SetStatus("Sincronizando héroe...");

        StartCoroutine(ApiClient.Instance.GetJson<CharacterResponse>(
            "/character/me",
            response =>
            {
                if (!response.success)
                {
                    SetStatus("No se pudo cargar el héroe: " + response.message);
                    return;
                }

                currentCharacter = response.data;
                CacheZoneFromCharacter(currentCharacter);
                RenderCharacter(currentCharacter);
                LoadZones();
                SetStatus("Héroe listo para explorar.");
            },
            error =>
            {
                SetStatus("Error de conexión: " + error);
            }
        ));
    }

    private void LoadZones()
    {
        StartCoroutine(ApiClient.Instance.GetJson<ZonesResponse>(
            "/zones",
            response =>
            {
                if (!response.success)
                {
                    SetZoneStatus("No se pudieron abrir las zonas: " + response.message);
                    return;
                }

                allZones.Clear();

                if (response.data != null)
                    allZones.AddRange(response.data);

                ZoneData currentZone = FindCurrentZone();

                if (currentZone != null)
                {
                    currentZoneId = currentZone.id;
                    currentZoneName = currentZone.name;
                    LoadEnemiesFromZone(currentZone, true);
                }

                RenderCharacter(currentCharacter);
                RenderZoneDropdown();

                int currentZoneIndex = GetCurrentZoneIndex();
                PreviewZoneByIndex(currentZoneIndex);

                SetZoneStatus("Elige una zona para inspeccionar sus enemigos.");
            },
            error =>
            {
                SetZoneStatus("Error de conexión al cargar zonas: " + error);
            }
        ));
    }

    private void RenderZoneDropdown()
    {
        if (zoneDropdown == null)
            return;

        suppressDropdownEvents = true;

        zoneDropdown.ClearOptions();

        List<string> options = new List<string>();

        for (int i = 0; i < allZones.Count; i++)
        {
            ZoneData zone = allZones[i];

            bool unlocked = IsZoneUnlocked(zone);
            bool isCurrent = zone.id == currentZoneId;

            string label = zone.name + " | Nivel " + zone.requiredLevel;

            if (isCurrent)
                label += " | Actual";
            else if (unlocked)
                label += " | Disponible";
            else
                label += " | Bloqueada";

            options.Add(label);
        }

        zoneDropdown.AddOptions(options);

        int currentIndex = GetCurrentZoneIndex();
        if (currentIndex >= 0)
            zoneDropdown.value = currentIndex;

        zoneDropdown.RefreshShownValue();

        suppressDropdownEvents = false;
    }

    private void OnZoneDropdownChanged(int index)
    {
        if (suppressDropdownEvents)
            return;

        PreviewZoneByIndex(index);
    }

    private void PreviewZoneByIndex(int index)
    {
        if (index < 0 || index >= allZones.Count)
            return;

        ZoneData selectedZone = allZones[index];

        bool unlocked = IsZoneUnlocked(selectedZone);
        bool isCurrent = selectedZone.id == currentZoneId;

        if (isCurrent)
            SetZoneStatus("Zona actual: " + selectedZone.name);
        else if (unlocked)
            SetZoneStatus(selectedZone.name + " está disponible. Pulsa Entrar zona.");
        else
            SetZoneStatus("Zona bloqueada. Requiere nivel " + selectedZone.requiredLevel + ".");

        SetChangeZoneButtonEnabled(unlocked && !isCurrent);

        previewEnemies.Clear();

        if (selectedZone.enemies != null)
            previewEnemies.AddRange(selectedZone.enemies);

        RenderEnemyDropdown(previewEnemies);

        if (isCurrent)
            LoadEnemiesFromZone(selectedZone, false);
    }

    private void ChangeSelectedZone()
    {
        if (zoneDropdown == null || allZones.Count == 0)
        {
            SetZoneStatus("No hay zonas disponibles.");
            return;
        }

        int index = zoneDropdown.value;

        if (index < 0 || index >= allZones.Count)
        {
            SetZoneStatus("Zona inválida.");
            return;
        }

        ZoneData selectedZone = allZones[index];

        if (!IsZoneUnlocked(selectedZone))
        {
            SetZoneStatus("Zona bloqueada. Requiere nivel " + selectedZone.requiredLevel + ".");
            return;
        }

        if (selectedZone.id == currentZoneId)
        {
            SetZoneStatus("Ya estás en " + selectedZone.name + ".");
            return;
        }

        SetZoneStatus("Abriendo portal a " + selectedZone.name + "...");

        ChangeZoneRequest body = new ChangeZoneRequest
        {
            zoneId = selectedZone.id
        };

        string json = JsonUtility.ToJson(body);

        StartCoroutine(ApiClient.Instance.PostJson<ChangeZoneResponse>(
            "/character/change-zone",
            json,
            response =>
            {
                if (!response.success)
                {
                    SetZoneStatus("No se pudo entrar: " + response.message);
                    return;
                }

                currentCharacter = response.data;
                currentZoneId = selectedZone.id;
                currentZoneName = selectedZone.name;

                RestoreCachedZone(currentCharacter);
                RenderCharacter(currentCharacter);
                LoadEnemiesFromZone(selectedZone, true);
                RenderZoneDropdown();

                int currentZoneIndex = GetCurrentZoneIndex();
                if (zoneDropdown != null && currentZoneIndex >= 0)
                {
                    suppressDropdownEvents = true;
                    zoneDropdown.value = currentZoneIndex;
                    zoneDropdown.RefreshShownValue();
                    suppressDropdownEvents = false;
                }

                SetChangeZoneButtonEnabled(false);
                SetZoneStatus("Zona activa: " + selectedZone.name + ".");
            },
            error =>
            {
                SetZoneStatus("Error de conexión: " + error);
            }
        ));
    }

    private void LoadEnemiesFromZone(ZoneData zone, bool renderDropdown)
    {
        currentEnemies.Clear();

        if (zone != null && zone.enemies != null)
            currentEnemies.AddRange(zone.enemies);

        if (renderDropdown)
            RenderEnemyDropdown(currentEnemies);
    }

    private void RenderEnemyDropdown(List<EnemyTypeData> enemies)
    {
        if (enemyDropdown == null)
            return;

        suppressDropdownEvents = true;

        enemyDropdown.ClearOptions();

        List<string> options = new List<string>();

        foreach (EnemyTypeData enemy in enemies)
        {
            string label = enemy.name;

            if (enemy.isBoss)
                label += " (Boss)";

            label += $" | Oro {enemy.goldReward} | XP {enemy.xpReward}";
            options.Add(label);
        }

        enemyDropdown.AddOptions(options);
        enemyDropdown.value = 0;
        enemyDropdown.RefreshShownValue();

        suppressDropdownEvents = false;

        if (enemies.Count > 0)
        {
            PreviewEnemy(enemies[0]);
            SetCombatStatus("Selecciona un objetivo y ataca.");
        }
        else
        {
            ClearEnemyPreview();
            SetCombatStatus("No hay enemigos visibles en esta zona.");
        }
    }

    private void OnEnemyDropdownChanged(int index)
    {
        if (suppressDropdownEvents)
            return;

        ZoneData selectedZone = GetSelectedZone();

        if (selectedZone == null || selectedZone.enemies == null)
            return;

        if (index < 0 || index >= selectedZone.enemies.Length)
            return;

        PreviewEnemy(selectedZone.enemies[index]);
    }

    private void PreviewEnemy(EnemyTypeData enemy)
    {
        if (enemy == null)
        {
            ClearEnemyPreview();
            return;
        }

        if (enemyNameText != null)
            enemyNameText.text = enemy.isBoss ? enemy.name + " (Boss)" : enemy.name;

        if (enemyStatsText != null)
            enemyStatsText.text = $"HP {enemy.maxHp} | ATK {enemy.atk} | DEF {enemy.def}";

        if (enemyRewardText != null)
            enemyRewardText.text = $"+{enemy.goldReward} oro | +{enemy.xpReward} XP";
    }

    private void ClearEnemyPreview()
    {
        if (enemyNameText != null)
            enemyNameText.text = "Sin enemigo";

        if (enemyStatsText != null)
            enemyStatsText.text = "---";

        if (enemyRewardText != null)
            enemyRewardText.text = "---";
    }

    private void KillSelectedEnemy()
    {
        if (enemyDropdown == null)
        {
            SetCombatStatus("No se encontró el selector de enemigos.");
            return;
        }

        ZoneData selectedZone = GetSelectedZone();

        if (selectedZone == null)
        {
            SetCombatStatus("Selecciona una zona para iniciar combate.");
            return;
        }

        if (selectedZone.id != currentZoneId)
        {
            SetCombatStatus("Primero entra a esta zona para combatir.");
            return;
        }

        if (currentEnemies.Count == 0)
        {
            SetCombatStatus("No hay enemigo seleccionado.");
            return;
        }

        int index = enemyDropdown.value;

        if (index < 0 || index >= currentEnemies.Count)
        {
            SetCombatStatus("Selección de enemigo inválida.");
            return;
        }

        EnemyTypeData enemy = currentEnemies[index];

        SetCombatStatus("Atacando a " + enemy.name + "...");

        KillEnemyRequest body = new KillEnemyRequest
        {
            enemyTypeId = enemy.id
        };

        string json = JsonUtility.ToJson(body);

        StartCoroutine(ApiClient.Instance.PostJson<KillEnemyResponse>(
            "/combat/kill",
            json,
            response =>
            {
                if (!response.success)
                {
                    SetCombatStatus("El ataque falló: " + response.message);
                    return;
                }

                int goldEarned = response.data != null ? response.data.goldEarned : 0;
                int xpEarned = response.data != null ? response.data.xpEarned : 0;

                SetCombatStatus($"Victoria: +{goldEarned} oro, +{xpEarned} XP");

                if (response.data != null && response.data.character != null)
                {
                    currentCharacter = response.data.character;
                    RestoreCachedZone(currentCharacter);
                    RenderCharacter(currentCharacter);
                    RenderZoneDropdown();
                }
                else
                {
                    LoadCharacter();
                }
            },
            error =>
            {
                SetCombatStatus("Error de conexión: " + error);
            }
        ));
    }

    private ZoneData FindCurrentZone()
    {
        foreach (ZoneData zone in allZones)
        {
            if (zone.id == currentZoneId)
                return zone;
        }

        if (currentCharacter != null && currentCharacter.currentZone != null)
        {
            foreach (ZoneData zone in allZones)
            {
                if (zone.id == currentCharacter.currentZone.id)
                    return zone;
            }
        }

        return null;
    }

    private ZoneData GetSelectedZone()
    {
        if (zoneDropdown == null || allZones.Count == 0)
            return FindCurrentZone();

        int index = zoneDropdown.value;

        if (index < 0 || index >= allZones.Count)
            return FindCurrentZone();

        return allZones[index];
    }

    private int GetCurrentZoneIndex()
    {
        for (int i = 0; i < allZones.Count; i++)
        {
            if (allZones[i].id == currentZoneId)
                return i;
        }

        return 0;
    }

    private bool IsZoneUnlocked(ZoneData zone)
    {
        return currentCharacter != null && zone != null && currentCharacter.level >= zone.requiredLevel;
    }

    private void SetChangeZoneButtonEnabled(bool enabled)
    {
        if (changeZoneButton == null)
            return;

        changeZoneButton.interactable = enabled;
    }

    private void CacheZoneFromCharacter(CharacterData character)
    {
        if (character == null)
            return;

        if (!string.IsNullOrEmpty(character.currentZoneId))
            currentZoneId = character.currentZoneId;

        if (character.currentZone != null)
        {
            currentZoneId = character.currentZone.id;
            currentZoneName = character.currentZone.name;
        }
    }

    private void RestoreCachedZone(CharacterData character)
    {
        if (character == null)
            return;

        if (string.IsNullOrEmpty(character.currentZoneId))
            character.currentZoneId = currentZoneId;
    }

    private void RenderCharacter(CharacterData character)
    {
        if (character == null)
            return;

        SetTextIfPresent(nameText, string.IsNullOrEmpty(character.name) ? "Héroe sin nombre" : character.name);
        SetTextIfPresent(classText, string.IsNullOrEmpty(character.@class) ? "Clase desconocida" : character.@class);
        SetTextIfPresent(levelText, "Nivel: " + character.level);
        SetTextIfPresent(xpText, "XP: " + character.xp);
        SetTextIfPresent(goldText, "Oro: " + character.gold);
        SetTextIfPresent(atkText, "ATK: " + character.atk);
        SetTextIfPresent(defText, "DEF: " + character.def);
        SetTextIfPresent(hpText, "HP: " + character.currentHp + "/" + character.maxHp);
        SetTextIfPresent(critText, "CRIT: " + (character.critChance * 100f).ToString("0.0") + "%");
        SetTextIfPresent(powerText, "Poder: " + character.power);

        string zoneName = "";

        if (character.currentZone != null && !string.IsNullOrEmpty(character.currentZone.name))
            zoneName = character.currentZone.name;
        else if (!string.IsNullOrEmpty(currentZoneName))
            zoneName = currentZoneName;
        else
            zoneName = character.currentZoneId;

        if (string.IsNullOrEmpty(zoneName))
            zoneName = "Sin zona";

        SetTextIfPresent(zoneText, "Zona: " + zoneName);
    }

    private void SetTextIfPresent(TMP_Text target, string value)
    {
        if (target != null)
            target.text = value;
    }

    private void Logout()
    {
        ApiClient.Instance.ClearToken();
        SceneManager.LoadScene("LoginScene");
    }

    private void SetStatus(string message)
    {
        if (statusText != null)
            statusText.text = message;

        Debug.Log(message);
    }

    private void SetZoneStatus(string message)
    {
        if (zoneStatusText != null)
            zoneStatusText.text = message;

        Debug.Log(message);
    }

    private void SetCombatStatus(string message)
    {
        if (combatStatusText != null)
            combatStatusText.text = message;

        Debug.Log(message);
    }

    private TMP_Text FindTMPText(string objectName)
    {
        GameObject obj = GameObject.Find(objectName);
        return obj != null ? obj.GetComponent<TMP_Text>() : null;
    }

    private TMP_Dropdown FindTMPDropdown(string objectName)
    {
        GameObject obj = GameObject.Find(objectName);
        return obj != null ? obj.GetComponent<TMP_Dropdown>() : null;
    }

    private Button FindButton(string objectName)
    {
        GameObject obj = GameObject.Find(objectName);
        return obj != null ? obj.GetComponent<Button>() : null;
    }
}
