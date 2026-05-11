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

    [Header("Combat UI")]
    public TMP_Dropdown enemyDropdown;
    public Button killEnemyButton;
    public TMP_Text combatStatusText;

    [Header("Buttons")]
    public Button refreshButton;
    public Button logoutButton;

    private CharacterData currentCharacter;
    private readonly List<EnemyTypeData> currentEnemies = new List<EnemyTypeData>();

    private string currentZoneName = "";
    private string currentZoneId = "";

    private void Start()
    {
        if (refreshButton != null)
            refreshButton.onClick.AddListener(LoadCharacter);

        if (logoutButton != null)
            logoutButton.onClick.AddListener(Logout);

        if (killEnemyButton != null)
            killEnemyButton.onClick.AddListener(KillSelectedEnemy);

        LoadCharacter();
    }

    private void LoadCharacter()
    {
        SetStatus("Cargando personaje...");

        StartCoroutine(ApiClient.Instance.GetJson<CharacterResponse>(
            "/character/me",
            response =>
            {
                if (!response.success)
                {
                    SetStatus("Error: " + response.message);
                    return;
                }

                currentCharacter = response.data;
                CacheZoneFromCharacter(currentCharacter);
                RenderCharacter(currentCharacter);
                LoadZones();
                SetStatus("Personaje cargado.");
            },
            error =>
            {
                SetStatus("Error: " + error);
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
                    SetCombatStatus("Error cargando zonas: " + response.message);
                    return;
                }

                ZoneData currentZone = FindCurrentZone(response.data);

                if (currentZone == null)
                {
                    SetCombatStatus("No se encontró la zona actual.");
                    return;
                }

                currentZoneId = currentZone.id;
                currentZoneName = currentZone.name;

                if (zoneText != null)
                    zoneText.text = "Zone: " + currentZoneName;

                currentEnemies.Clear();

                if (currentZone.enemies != null)
                    currentEnemies.AddRange(currentZone.enemies);

                RenderEnemyDropdown();
            },
            error =>
            {
                SetCombatStatus("Error cargando zonas: " + error);
            }
        ));
    }

    private ZoneData FindCurrentZone(ZoneData[] zones)
    {
        if (zones == null || currentCharacter == null)
            return null;

        string zoneId = currentCharacter.currentZoneId;

        if (string.IsNullOrEmpty(zoneId) && currentCharacter.currentZone != null)
            zoneId = currentCharacter.currentZone.id;

        if (string.IsNullOrEmpty(zoneId))
            zoneId = currentZoneId;

        foreach (ZoneData zone in zones)
        {
            if (zone.id == zoneId)
                return zone;
        }

        return null;
    }

    private void RenderEnemyDropdown()
    {
        if (enemyDropdown == null)
            return;

        enemyDropdown.ClearOptions();

        List<string> options = new List<string>();

        foreach (EnemyTypeData enemy in currentEnemies)
        {
            string label = enemy.name;

            if (enemy.isBoss)
                label += " (Boss)";

            label += $" | Gold {enemy.goldReward} | XP {enemy.xpReward}";
            options.Add(label);
        }

        enemyDropdown.AddOptions(options);

        if (currentEnemies.Count > 0)
        {
            enemyDropdown.value = 0;
            SetCombatStatus("Enemigos cargados.");
        }
        else
        {
            SetCombatStatus("No hay enemigos en esta zona.");
        }
    }

    private void KillSelectedEnemy()
    {
        if (enemyDropdown == null || currentEnemies.Count == 0)
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

        SetCombatStatus("Matando " + enemy.name + "...");

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
                    SetCombatStatus("Error: " + response.message);
                    return;
                }

                int goldEarned = response.data != null ? response.data.goldEarned : 0;
                int xpEarned = response.data != null ? response.data.xpEarned : 0;

                SetCombatStatus($"+{goldEarned} gold, +{xpEarned} XP");

                if (response.data != null && response.data.character != null)
                {
                    currentCharacter = response.data.character;
                    RestoreCachedZone(currentCharacter);
                    RenderCharacter(currentCharacter);
                }
                else
                {
                    LoadCharacter();
                }
            },
            error =>
            {
                SetCombatStatus("Error: " + error);
            }
        ));
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

        nameText.text = character.name;
        classText.text = character.@class;
        levelText.text = "Level: " + character.level;
        xpText.text = "XP: " + character.xp;
        goldText.text = "Gold: " + character.gold;
        atkText.text = "ATK: " + character.atk;
        defText.text = "DEF: " + character.def;
        hpText.text = "HP: " + character.currentHp + "/" + character.maxHp;
        critText.text = "CRIT: " + (character.critChance * 100f).ToString("0.0") + "%";
        powerText.text = "Power: " + character.power;

        string zoneName = "";

        if (character.currentZone != null && !string.IsNullOrEmpty(character.currentZone.name))
            zoneName = character.currentZone.name;
        else if (!string.IsNullOrEmpty(currentZoneName))
            zoneName = currentZoneName;
        else
            zoneName = character.currentZoneId;

        zoneText.text = "Zone: " + zoneName;
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

    private void SetCombatStatus(string message)
    {
        if (combatStatusText != null)
            combatStatusText.text = message;

        Debug.Log(message);
    }
}
