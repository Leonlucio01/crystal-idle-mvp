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

    [Header("Buttons")]
    public Button refreshButton;
    public Button logoutButton;

    private void Start()
    {
        refreshButton.onClick.AddListener(LoadCharacter);
        logoutButton.onClick.AddListener(Logout);

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

                RenderCharacter(response.data);
                SetStatus("Personaje cargado.");
            },
            error =>
            {
                SetStatus("Error: " + error);
            }
        ));
    }

    private void RenderCharacter(CharacterData character)
    {
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

        string zoneName = character.currentZone != null
            ? character.currentZone.name
            : character.currentZoneId;

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
}
