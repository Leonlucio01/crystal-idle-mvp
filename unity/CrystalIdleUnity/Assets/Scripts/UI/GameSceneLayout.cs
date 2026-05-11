using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class GameSceneLayout : MonoBehaviour
{
    private static readonly Color PanelColor = new Color(0.03f, 0.05f, 0.10f, 0.78f);
    private static readonly Color CardColor = new Color(0.06f, 0.08f, 0.16f, 0.86f);
    private static readonly Color HeaderColor = new Color(0.04f, 0.09f, 0.18f, 0.92f);
    private static readonly Color FieldColor = new Color(0.05f, 0.08f, 0.16f, 0.96f);
    private static readonly Color Cyan = new Color(0.34f, 0.94f, 1f, 1f);
    private static readonly Color Violet = new Color(0.66f, 0.48f, 1f, 1f);
    private static readonly Color Gold = new Color(1f, 0.78f, 0.28f, 1f);
    private static readonly Color SoftWhite = new Color(0.90f, 0.96f, 1f, 1f);
    private static readonly Color MutedText = new Color(0.66f, 0.74f, 0.88f, 1f);
    private static readonly Color ButtonText = new Color(0.04f, 0.06f, 0.11f, 1f);
    private static readonly Color SeparatorColor = new Color(0.34f, 0.94f, 1f, 0.38f);

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

    private void Start()
    {
        ApplyLayout();
    }

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
        EnsureVisualScaffold();

        float leftX = -335f;
        float rightX = 230f;
        float leftWidth = 385f;
        float rightWidth = 465f;

        SetText(nameText, leftX, 160, leftWidth, 38, 30, Cyan, TextAlignmentOptions.Left, false);
        SetText(classText, leftX, 128, leftWidth, 28, 20, Violet, TextAlignmentOptions.Left, false);
        SetText(levelText, leftX, 82, leftWidth, 26, 18, SoftWhite);
        SetText(xpText, leftX, 54, leftWidth, 26, 18, MutedText);
        SetText(goldText, leftX, 26, leftWidth, 26, 18, Gold);
        SetText(atkText, leftX, -24, leftWidth, 25, 18, SoftWhite);
        SetText(defText, leftX, -52, leftWidth, 25, 18, SoftWhite);
        SetText(hpText, leftX, -80, leftWidth, 25, 18, SoftWhite);
        SetText(critText, leftX, -108, leftWidth, 25, 18, SoftWhite);
        SetText(powerText, leftX, -150, leftWidth, 28, 20, Gold);
        SetText(zoneText, leftX, -180, leftWidth, 30, 18, Cyan);
        SetText(statusText, leftX, -218, leftWidth, 42, 16, MutedText);

        SetRect(zoneDropdown, rightX, 163, rightWidth, 42);
        SetRect(changeZoneButton, rightX + 145, 112, 175, 42);
        SetText(zoneStatusText, rightX, 72, rightWidth, 40, 16, MutedText);

        SetText(enemyNameText, rightX, 20, rightWidth, 34, 24, Violet, TextAlignmentOptions.Left, false);
        SetText(enemyStatsText, rightX, -14, rightWidth, 28, 17, SoftWhite);
        SetText(enemyRewardText, rightX, -44, rightWidth, 28, 17, Gold);

        SetRect(enemyDropdown, rightX, -88, rightWidth, 42);
        SetRect(killEnemyButton, rightX + 145, -140, 175, 44);
        SetText(combatStatusText, rightX, -194, rightWidth, 54, 17, MutedText);

        SetRect(refreshButton, -90, -270, 160, 42);
        SetRect(logoutButton, 90, -270, 160, 42);

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
        BringGameplayControlsToFront();
    }

    private void SetupPanel(RectTransform rect)
    {
        if (rect == null) return;

        rect.anchorMin = new Vector2(0.5f, 0.5f);
        rect.anchorMax = new Vector2(0.5f, 0.5f);
        rect.pivot = new Vector2(0.5f, 0.5f);
        rect.anchoredPosition = Vector2.zero;
        rect.sizeDelta = new Vector2(1100, 640);
        rect.localScale = Vector3.one;

        Image image = rect.GetComponent<Image>();
        if (image != null)
            image.color = PanelColor;
    }

    private void EnsureVisualScaffold()
    {
        if (gamePanel == null) return;

        RectTransform root = gamePanel;

        RectTransform header = EnsurePanel(root, "CrystalIdle_HeaderPanel", 0, 263, 1040, 72, HeaderColor);
        RectTransform characterPanel = EnsurePanel(root, "CrystalIdle_CharacterPanel", -335, -20, 430, 460, CardColor);
        RectTransform zonePanel = EnsurePanel(root, "CrystalIdle_ZonePanel", 230, 145, 520, 170, CardColor);
        RectTransform combatPanel = EnsurePanel(root, "CrystalIdle_CombatPanel", 230, -85, 520, 265, CardColor);
        RectTransform actionsPanel = EnsurePanel(root, "CrystalIdle_ActionsPanel", 0, -270, 420, 70, new Color(0.05f, 0.07f, 0.14f, 0.90f));

        header.SetAsFirstSibling();
        characterPanel.SetAsFirstSibling();
        zonePanel.SetAsFirstSibling();
        combatPanel.SetAsFirstSibling();
        actionsPanel.SetAsFirstSibling();

        EnsureLabel(root, "CrystalIdle_HeaderTitle", "CRYSTAL IDLE", -470, 268, 410, 36, 28, Cyan, TextAlignmentOptions.Left);
        EnsureLabel(root, "CrystalIdle_HeaderSubtitle", "ONLINE IDLE RPG", -470, 240, 410, 24, 14, MutedText, TextAlignmentOptions.Left);
        EnsureLabel(root, "CrystalIdle_HeaderStatus", "Explora zonas, caza enemigos y fortalece tu héroe", 210, 255, 560, 30, 16, SoftWhite, TextAlignmentOptions.Right);

        EnsureLabel(root, "CrystalIdle_CharacterTitle", "PERSONAJE", -335, 198, 360, 22, 15, Gold, TextAlignmentOptions.Left);
        EnsureLabel(root, "CrystalIdle_ZoneTitle", "ZONA", 230, 209, 450, 22, 15, Cyan, TextAlignmentOptions.Left);
        EnsureLabel(root, "CrystalIdle_CombatTitle", "ENEMIGO", 230, 52, 450, 22, 15, Violet, TextAlignmentOptions.Left);
        EnsureLabel(root, "CrystalIdle_ActionsTitle", "ACCIONES", -175, -270, 90, 20, 13, MutedText, TextAlignmentOptions.Left);

        EnsureSeparator(root, "CrystalIdle_CharacterDivider", -335, 111, 360, 2, Gold);
        EnsureSeparator(root, "CrystalIdle_StatsDivider", -335, -1, 360, 2, SeparatorColor);
        EnsureSeparator(root, "CrystalIdle_ZoneDivider", 230, 189, 450, 2, SeparatorColor);
        EnsureSeparator(root, "CrystalIdle_CombatDivider", 230, 37, 450, 2, Violet);
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

    private RectTransform EnsurePanel(RectTransform parent, string objectName, float x, float y, float width, float height, Color color)
    {
        RectTransform rect = FindDirectRect(parent, objectName);

        if (rect == null)
        {
            GameObject obj = new GameObject(objectName, typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
            obj.transform.SetParent(parent, false);
            rect = obj.GetComponent<RectTransform>();
        }

        SetRect(rect, x, y, width, height);

        Image image = rect.GetComponent<Image>();
        if (image != null)
            image.color = color;

        return rect;
    }

    private RectTransform EnsureSeparator(RectTransform parent, string objectName, float x, float y, float width, float height, Color color)
    {
        RectTransform rect = EnsurePanel(parent, objectName, x, y, width, height, color);
        return rect;
    }

    private TMP_Text EnsureLabel(
        RectTransform parent,
        string objectName,
        string value,
        float x,
        float y,
        float width,
        float height,
        int fontSize,
        Color color,
        TextAlignmentOptions alignment
    )
    {
        RectTransform rect = FindDirectRect(parent, objectName);

        if (rect == null)
        {
            GameObject obj = new GameObject(objectName, typeof(RectTransform), typeof(CanvasRenderer), typeof(TextMeshProUGUI));
            obj.transform.SetParent(parent, false);
            rect = obj.GetComponent<RectTransform>();
        }

        SetRect(rect, x, y, width, height);

        TMP_Text text = rect.GetComponent<TMP_Text>();
        if (text != null)
        {
            text.text = value;
            text.fontSize = fontSize;
            text.enableAutoSizing = false;
            text.alignment = alignment;
            text.textWrappingMode = TextWrappingModes.NoWrap;
            text.overflowMode = TextOverflowModes.Ellipsis;
            text.color = color;
        }

        return text;
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
            image.color = FieldColor;

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

    private void BringGameplayControlsToFront()
    {
        BringToFront(nameText);
        BringToFront(classText);
        BringToFront(levelText);
        BringToFront(xpText);
        BringToFront(goldText);
        BringToFront(atkText);
        BringToFront(defText);
        BringToFront(hpText);
        BringToFront(critText);
        BringToFront(powerText);
        BringToFront(zoneText);
        BringToFront(statusText);
        BringToFront(zoneDropdown);
        BringToFront(changeZoneButton);
        BringToFront(zoneStatusText);
        BringToFront(enemyNameText);
        BringToFront(enemyStatsText);
        BringToFront(enemyRewardText);
        BringToFront(enemyDropdown);
        BringToFront(killEnemyButton);
        BringToFront(combatStatusText);
        BringToFront(refreshButton);
        BringToFront(logoutButton);
    }

    private void BringToFront(RectTransform rect)
    {
        if (rect != null)
            rect.SetAsLastSibling();
    }

    private RectTransform FindDirectRect(Transform parent, string objectName)
    {
        if (parent == null) return null;

        for (int i = 0; i < parent.childCount; i++)
        {
            Transform child = parent.GetChild(i);
            if (child.name == objectName)
                return child.GetComponent<RectTransform>();
        }

        return null;
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
