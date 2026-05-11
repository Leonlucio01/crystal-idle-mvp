using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class GameSceneLayout : MonoBehaviour
{
    public RectTransform gamePanel;

    [Header("Character")]
    public RectTransform nameText;
    public RectTransform classText;
    public RectTransform levelText;
    public RectTransform xpText;
    public RectTransform goldText;
    public RectTransform atkText;
    public RectTransform defText;
    public RectTransform hpText;
    public RectTransform critText;
    public RectTransform powerText;
    public RectTransform zoneText;
    public RectTransform statusText;

    [Header("Combat")]
    public RectTransform enemyDropdown;
    public RectTransform killEnemyButton;
    public RectTransform combatStatusText;

    [Header("Buttons")]
    public RectTransform refreshButton;
    public RectTransform logoutButton;

    [ContextMenu("Auto Find Children")]
    public void AutoFindChildren()
    {
        if (gamePanel == null)
            gamePanel = GetComponent<RectTransform>();

        Transform root = gamePanel != null ? gamePanel : transform;

        nameText = FindRect(root, "NameText");
        classText = FindRect(root, "ClassText");
        levelText = FindRect(root, "LevelText");
        xpText = FindRect(root, "XPText");
        goldText = FindRect(root, "GoldText");
        atkText = FindRect(root, "ATKText");
        defText = FindRect(root, "DEFText");
        hpText = FindRect(root, "HPText");
        critText = FindRect(root, "CRITText");
        powerText = FindRect(root, "PowerText");
        zoneText = FindRect(root, "ZoneText");
        statusText = FindRect(root, "StatusText");

        enemyDropdown = FindRect(root, "EnemyDropdown");
        killEnemyButton = FindRect(root, "KillEnemyButton");
        combatStatusText = FindRect(root, "CombatStatusText");

        refreshButton = FindRect(root, "RefreshButton");
        logoutButton = FindRect(root, "LogoutButton");
    }

    [ContextMenu("Apply Layout")]
    public void ApplyLayout()
    {
        if (gamePanel == null)
            gamePanel = GetComponent<RectTransform>();

        AutoFindChildren();
        SetupPanel(gamePanel);

        SetText(nameText, -285, 195, 330, 34, 28);
        SetText(classText, -285, 160, 330, 28, 21);
        SetText(levelText, -285, 118, 330, 26, 19);
        SetText(xpText, -285, 91, 330, 26, 19);
        SetText(goldText, -285, 64, 330, 26, 19);
        SetText(atkText, -285, 37, 330, 26, 19);
        SetText(defText, -285, 10, 330, 26, 19);
        SetText(hpText, -285, -17, 330, 26, 19);
        SetText(critText, -285, -44, 330, 26, 19);
        SetText(powerText, -285, -71, 330, 26, 19);
        SetText(zoneText, -285, -98, 330, 26, 19);
        SetText(statusText, -285, -142, 330, 36, 18);

        SetRect(enemyDropdown, 220, 95, 330, 38);
        SetRect(killEnemyButton, 220, 40, 210, 42);
        SetText(combatStatusText, 220, -20, 330, 70, 18);

        SetRect(refreshButton, -285, -220, 165, 40);
        SetRect(logoutButton, -105, -220, 165, 40);

        SetButtonText(refreshButton, "Refresh", 19);
        SetButtonText(logoutButton, "Logout", 19);
        SetButtonText(killEnemyButton, "Matar enemigo", 18);

        StyleButton(refreshButton);
        StyleButton(logoutButton);
        StyleButton(killEnemyButton);
    }

    private void SetupPanel(RectTransform rect)
    {
        if (rect == null) return;

        rect.anchorMin = new Vector2(0.5f, 0.5f);
        rect.anchorMax = new Vector2(0.5f, 0.5f);
        rect.pivot = new Vector2(0.5f, 0.5f);
        rect.anchoredPosition = Vector2.zero;
        rect.sizeDelta = new Vector2(820, 500);
        rect.localScale = Vector3.one;

        Image image = rect.GetComponent<Image>();
        if (image != null)
            image.color = new Color(0f, 0f, 0f, 0.25f);
    }

    private void SetRect(RectTransform rect, float x, float y, float width, float height)
    {
        if (rect == null) return;

        rect.anchorMin = new Vector2(0.5f, 0.5f);
        rect.anchorMax = new Vector2(0.5f, 0.5f);
        rect.pivot = new Vector2(0.5f, 0.5f);
        rect.anchoredPosition = new Vector2(x, y);
        rect.sizeDelta = new Vector2(width, height);
        rect.localScale = Vector3.one;
    }

    private void SetText(RectTransform rect, float x, float y, float width, float height, int fontSize)
    {
        SetRect(rect, x, y, width, height);

        TMP_Text text = rect != null ? rect.GetComponent<TMP_Text>() : null;
        if (text == null) return;

        text.fontSize = fontSize;
        text.enableAutoSizing = false;
        text.alignment = TextAlignmentOptions.Left;
        text.textWrappingMode = TextWrappingModes.Normal;
        text.overflowMode = TextOverflowModes.Ellipsis;
        text.color = Color.white;
    }

    private void SetButtonText(RectTransform buttonRect, string value, int fontSize)
    {
        if (buttonRect == null) return;

        TMP_Text childText = buttonRect.GetComponentInChildren<TMP_Text>();
        if (childText == null) return;

        childText.text = value;
        childText.fontSize = fontSize;
        childText.alignment = TextAlignmentOptions.Center;
        childText.color = new Color(0.05f, 0.08f, 0.12f);
    }

    private void StyleButton(RectTransform buttonRect)
    {
        if (buttonRect == null) return;

        Image image = buttonRect.GetComponent<Image>();
        if (image != null)
            image.color = new Color(0.75f, 0.88f, 1f, 1f);
    }

    private RectTransform FindRect(Transform root, string objectName)
    {
        if (root == null) return null;

        Transform[] all = root.GetComponentsInChildren<Transform>(true);
        foreach (Transform child in all)
        {
            if (child.name == objectName)
                return child.GetComponent<RectTransform>();
        }

        return null;
    }
}
