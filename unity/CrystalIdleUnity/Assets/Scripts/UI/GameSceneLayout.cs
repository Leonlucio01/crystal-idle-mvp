using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class GameSceneLayout : MonoBehaviour
{
    private static readonly Color PanelColor = new Color(0.03f, 0.05f, 0.10f, 0.78f);
    private static readonly Color Cyan = new Color(0.34f, 0.94f, 1f, 1f);
    private static readonly Color Violet = new Color(0.66f, 0.48f, 1f, 1f);
    private static readonly Color Gold = new Color(1f, 0.78f, 0.28f, 1f);
    private static readonly Color SoftWhite = new Color(0.90f, 0.96f, 1f, 1f);
    private static readonly Color MutedText = new Color(0.66f, 0.74f, 0.88f, 1f);
    private static readonly Color ButtonText = new Color(0.04f, 0.06f, 0.11f, 1f);

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

    [Header("Zone")]
    public RectTransform zoneDropdown;
    public RectTransform changeZoneButton;
    public RectTransform zoneStatusText;

    [Header("Enemy Preview")]
    public RectTransform enemyNameText;
    public RectTransform enemyStatsText;
    public RectTransform enemyRewardText;

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

        zoneDropdown = FindRect(root, "ZoneDropdown");
        changeZoneButton = FindRect(root, "ChangeZoneButton");
        zoneStatusText = FindRect(root, "ZoneStatusText");

        enemyNameText = FindRect(root, "EnemyNameText");
        enemyStatsText = FindRect(root, "EnemyStatsText");
        enemyRewardText = FindRect(root, "EnemyRewardText");

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

        float leftX = -335f;
        float rightX = 230f;
        float leftWidth = 385f;
        float rightWidth = 465f;

        SetText(nameText, leftX, 226, leftWidth, 38, 30, Cyan, TextAlignmentOptions.Left, false);
        SetText(classText, leftX, 190, leftWidth, 28, 20, Violet, TextAlignmentOptions.Left, false);
        SetText(levelText, leftX, 142, leftWidth, 26, 18, SoftWhite);
        SetText(xpText, leftX, 112, leftWidth, 26, 18, MutedText);
        SetText(goldText, leftX, 82, leftWidth, 26, 18, Gold);
        SetText(atkText, leftX, 38, leftWidth, 25, 18, SoftWhite);
        SetText(defText, leftX, 10, leftWidth, 25, 18, SoftWhite);
        SetText(hpText, leftX, -18, leftWidth, 25, 18, SoftWhite);
        SetText(critText, leftX, -46, leftWidth, 25, 18, SoftWhite);
        SetText(powerText, leftX, -86, leftWidth, 28, 20, Gold);
        SetText(zoneText, leftX, -126, leftWidth, 30, 18, Cyan);
        SetText(statusText, leftX, -181, leftWidth, 60, 16, MutedText);

        SetRect(zoneDropdown, rightX, 202, rightWidth, 42);
        SetRect(changeZoneButton, rightX + 145, 152, 175, 42);
        SetText(zoneStatusText, rightX, 103, rightWidth, 54, 16, MutedText);

        SetText(enemyNameText, rightX, 42, rightWidth, 34, 24, Violet, TextAlignmentOptions.Left, false);
        SetText(enemyStatsText, rightX, 8, rightWidth, 28, 17, SoftWhite);
        SetText(enemyRewardText, rightX, -24, rightWidth, 28, 17, Gold);

        SetRect(enemyDropdown, rightX, -78, rightWidth, 42);
        SetRect(killEnemyButton, rightX + 145, -130, 175, 44);
        SetText(combatStatusText, rightX, -193, rightWidth, 64, 17, MutedText);

        SetRect(refreshButton, -90, -260, 160, 42);
        SetRect(logoutButton, 90, -260, 160, 42);

        SetButtonText(refreshButton, "Refresh", 18);
        SetButtonText(logoutButton, "Logout", 18);
        SetButtonText(killEnemyButton, "Atacar", 18);
        SetButtonText(changeZoneButton, "Entrar zona", 17);

        StyleButton(refreshButton, Cyan);
        StyleButton(logoutButton, Violet);
        StyleButton(killEnemyButton, Gold);
        StyleButton(changeZoneButton, Cyan);
        StyleDropdown(zoneDropdown);
        StyleDropdown(enemyDropdown);
    }

    private void SetupPanel(RectTransform rect)
    {
        if (rect == null) return;

        rect.anchorMin = new Vector2(0.5f, 0.5f);
        rect.anchorMax = new Vector2(0.5f, 0.5f);
        rect.pivot = new Vector2(0.5f, 0.5f);
        rect.anchoredPosition = Vector2.zero;
        rect.sizeDelta = new Vector2(1040, 600);
        rect.localScale = Vector3.one;

        Image image = rect.GetComponent<Image>();
        if (image != null)
            image.color = PanelColor;
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
        SetText(rect, x, y, width, height, fontSize, SoftWhite);
    }

    private void SetText(
        RectTransform rect,
        float x,
        float y,
        float width,
        float height,
        int fontSize,
        Color color,
        TextAlignmentOptions alignment = TextAlignmentOptions.Left,
        bool wrap = true
    )
    {
        SetRect(rect, x, y, width, height);

        TMP_Text text = rect != null ? rect.GetComponent<TMP_Text>() : null;
        if (text == null) return;

        text.fontSize = fontSize;
        text.enableAutoSizing = false;
        text.alignment = alignment;
        text.textWrappingMode = wrap ? TextWrappingModes.Normal : TextWrappingModes.NoWrap;
        text.overflowMode = TextOverflowModes.Ellipsis;
        text.color = color;
    }

    private void SetButtonText(RectTransform buttonRect, string value, int fontSize)
    {
        if (buttonRect == null) return;

        TMP_Text childText = buttonRect.GetComponentInChildren<TMP_Text>();
        if (childText == null) return;

        childText.text = value;
        childText.fontSize = fontSize;
        childText.alignment = TextAlignmentOptions.Center;
        childText.enableAutoSizing = false;
        childText.overflowMode = TextOverflowModes.Ellipsis;
        childText.color = ButtonText;
    }

    private void StyleButton(RectTransform buttonRect, Color baseColor)
    {
        if (buttonRect == null) return;

        Image image = buttonRect.GetComponent<Image>();
        if (image != null)
            image.color = baseColor;

        Button button = buttonRect.GetComponent<Button>();
        if (button == null) return;

        ColorBlock colors = button.colors;
        colors.normalColor = baseColor;
        colors.highlightedColor = Color.Lerp(baseColor, Color.white, 0.18f);
        colors.pressedColor = Color.Lerp(baseColor, Color.black, 0.18f);
        colors.selectedColor = colors.highlightedColor;
        colors.disabledColor = new Color(baseColor.r, baseColor.g, baseColor.b, 0.38f);
        button.colors = colors;
    }

    private void StyleDropdown(RectTransform dropdownRect)
    {
        if (dropdownRect == null) return;

        Image image = dropdownRect.GetComponent<Image>();
        if (image != null)
            image.color = new Color(0.07f, 0.10f, 0.20f, 0.95f);

        TMP_Dropdown dropdown = dropdownRect.GetComponent<TMP_Dropdown>();
        if (dropdown == null) return;

        if (dropdown.captionText != null)
        {
            dropdown.captionText.fontSize = 16;
            dropdown.captionText.color = SoftWhite;
            dropdown.captionText.overflowMode = TextOverflowModes.Ellipsis;
        }

        if (dropdown.itemText != null)
        {
            dropdown.itemText.fontSize = 15;
            dropdown.itemText.color = SoftWhite;
            dropdown.itemText.overflowMode = TextOverflowModes.Ellipsis;
        }
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
