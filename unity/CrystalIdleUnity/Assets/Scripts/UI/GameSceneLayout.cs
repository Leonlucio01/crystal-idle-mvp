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

    private struct PanelRect
    {
        public float x;
        public float y;
        public float width;
        public float height;

        public PanelRect(float x, float y, float width, float height)
        {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }

        public float Top => y + height * 0.5f;
        public float Bottom => y - height * 0.5f;
    }

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
        Vector2 size = GetRectSize(gamePanel);
        float width = size.x;
        float height = size.y;
        float margin = Mathf.Clamp(Mathf.Min(width, height) * 0.035f, 12f, 24f);
        float gap = Mathf.Clamp(width * 0.018f, 10f, 18f);
        float headerHeight = Mathf.Clamp(height * 0.115f, 46f, 62f);
        float actionsHeight = Mathf.Clamp(height * 0.105f, 50f, 62f);
        float headerY = height * 0.5f - margin - headerHeight * 0.5f;
        float actionsY = -height * 0.5f + margin + actionsHeight * 0.5f;
        float contentTop = headerY - headerHeight * 0.5f - gap;
        float contentBottom = actionsY + actionsHeight * 0.5f + gap;
        float contentHeight = Mathf.Max(260f, contentTop - contentBottom);
        float leftWidth = Mathf.Clamp(width * 0.36f, 260f, 350f);
        float rightWidth = width - margin * 2f - gap - leftWidth;

        if (rightWidth < 320f)
        {
            float shortage = 320f - rightWidth;
            leftWidth = Mathf.Max(235f, leftWidth - shortage);
            rightWidth = width - margin * 2f - gap - leftWidth;
        }

        float leftX = -width * 0.5f + margin + leftWidth * 0.5f;
        float rightX = width * 0.5f - margin - rightWidth * 0.5f;
        float panelCenterY = (contentTop + contentBottom) * 0.5f;
        float zoneHeight = Mathf.Clamp(contentHeight * 0.34f, 112f, 148f);
        float combatHeight = contentHeight - gap - zoneHeight;
        PanelRect header = new PanelRect(0f, headerY, width - margin * 2f, headerHeight);
        PanelRect character = new PanelRect(leftX, panelCenterY, leftWidth, contentHeight);
        PanelRect zone = new PanelRect(rightX, contentTop - zoneHeight * 0.5f, rightWidth, zoneHeight);
        PanelRect combat = new PanelRect(rightX, contentBottom + combatHeight * 0.5f, rightWidth, combatHeight);
        PanelRect actions = new PanelRect(0f, actionsY, Mathf.Min(420f, width - margin * 2f), actionsHeight);
        float characterTextWidth = character.width - 34f;
        float rightTextWidth = rightWidth - 34f;
        int largeFont = ResponsiveFont(30, height);
        int titleFont = ResponsiveFont(24, height);
        int bodyFont = ResponsiveFont(18, height);
        int smallFont = ResponsiveFont(16, height);
        int buttonFont = ResponsiveFont(18, height);
        float fieldHeight = Mathf.Clamp(height * 0.075f, 34f, 40f);
        float buttonWidth = Mathf.Clamp(rightWidth * 0.36f, 132f, 168f);
        float actionButtonWidth = Mathf.Clamp(actions.width * 0.36f, 132f, 158f);
        float rightStatusWidth = Mathf.Max(120f, rightTextWidth - buttonWidth - 16f);
        float rightContentLeft = rightX - rightTextWidth * 0.5f;
        float rightStatusX = rightContentLeft + rightStatusWidth * 0.5f;
        float rightButtonX = rightContentLeft + rightStatusWidth + 16f + buttonWidth * 0.5f;

        EnsureVisualScaffold(header, character, zone, combat, actions, margin);

        SetText(nameText, character.x, character.Top - 56f, characterTextWidth, 34, largeFont, Cyan, TextAlignmentOptions.Left, false);
        SetText(classText, character.x, character.Top - 85f, characterTextWidth, 24, ResponsiveFont(20, height), Violet, TextAlignmentOptions.Left, false);
        SetText(levelText, character.x, character.Top - 130f, characterTextWidth, 23, bodyFont, SoftWhite);
        SetText(xpText, character.x, character.Top - 156f, characterTextWidth, 23, bodyFont, MutedText);
        SetText(goldText, character.x, character.Top - 182f, characterTextWidth, 23, bodyFont, Gold);
        SetText(atkText, character.x, character.Top - 230f, characterTextWidth, 23, bodyFont, SoftWhite);
        SetText(defText, character.x, character.Top - 256f, characterTextWidth, 23, bodyFont, SoftWhite);
        SetText(hpText, character.x, character.Top - 282f, characterTextWidth, 23, bodyFont, SoftWhite);
        SetText(critText, character.x, character.Top - 308f, characterTextWidth, 23, bodyFont, SoftWhite);
        SetText(powerText, character.x, character.Bottom + 64f, characterTextWidth, 26, ResponsiveFont(20, height), Gold);
        SetText(zoneText, character.x, character.Bottom + 36f, characterTextWidth, 25, bodyFont, Cyan);
        SetText(statusText, character.x, character.Bottom + 12f, characterTextWidth, 24, smallFont, MutedText);

        SetRect(zoneDropdown, zone.x, zone.Top - 55f, rightTextWidth, fieldHeight);
        SetRect(changeZoneButton, rightButtonX, zone.Bottom + 31f, buttonWidth, fieldHeight);
        SetText(zoneStatusText, rightStatusX, zone.Bottom + 30f, rightStatusWidth, 38, smallFont, MutedText);

        SetText(enemyNameText, combat.x, combat.Top - 51f, rightTextWidth, 30, titleFont, Violet, TextAlignmentOptions.Left, false);
        SetText(enemyStatsText, combat.x, combat.Top - 82f, rightTextWidth, 25, smallFont, SoftWhite);
        SetText(enemyRewardText, combat.x, combat.Top - 110f, rightTextWidth, 25, smallFont, Gold);
        SetRect(enemyDropdown, combat.x, combat.Bottom + 94f, rightTextWidth, fieldHeight);
        SetRect(killEnemyButton, rightButtonX, combat.Bottom + 43f, buttonWidth, fieldHeight + 2f);
        SetText(combatStatusText, rightStatusX, combat.Bottom + 42f, rightStatusWidth, 42, smallFont, MutedText);

        SetRect(refreshButton, actions.x - actionButtonWidth * 0.56f, actions.y, actionButtonWidth, fieldHeight);
        SetRect(logoutButton, actions.x + actionButtonWidth * 0.56f, actions.y, actionButtonWidth, fieldHeight);

        SetButtonText(refreshButton, "Refresh", buttonFont);
        SetButtonText(logoutButton, "Logout", buttonFont);
        SetButtonText(killEnemyButton, "Atacar", buttonFont);
        SetButtonText(changeZoneButton, "Entrar zona", ResponsiveFont(17, height));

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

        Vector2 availableSize = GetAvailableSize(rect);
        float outerMargin = Mathf.Clamp(Mathf.Min(availableSize.x, availableSize.y) * 0.03f, 8f, 18f);

        rect.anchorMin = new Vector2(0.5f, 0.5f);
        rect.anchorMax = new Vector2(0.5f, 0.5f);
        rect.pivot = new Vector2(0.5f, 0.5f);
        rect.anchoredPosition = Vector2.zero;
        rect.sizeDelta = new Vector2(
            Mathf.Max(320f, availableSize.x - outerMargin * 2f),
            Mathf.Max(260f, availableSize.y - outerMargin * 2f)
        );
        rect.localScale = Vector3.one;

        Image image = rect.GetComponent<Image>();
        if (image != null)
            image.color = PanelColor;
    }

    private Vector2 GetAvailableSize(RectTransform rect)
    {
        Canvas.ForceUpdateCanvases();

        RectTransform parent = rect.parent as RectTransform;
        if (parent != null && parent.rect.width > 0f && parent.rect.height > 0f)
            return parent.rect.size;

        Canvas canvas = rect.GetComponentInParent<Canvas>();
        RectTransform canvasRect = canvas != null ? canvas.GetComponent<RectTransform>() : null;
        if (canvasRect != null && canvasRect.rect.width > 0f && canvasRect.rect.height > 0f)
            return canvasRect.rect.size;

        if (rect.rect.width > 0f && rect.rect.height > 0f)
            return rect.rect.size;

        if (rect.sizeDelta.x > 0f && rect.sizeDelta.y > 0f)
            return rect.sizeDelta;

        return new Vector2(960f, 540f);
    }

    private Vector2 GetRectSize(RectTransform rect)
    {
        if (rect == null)
            return new Vector2(960f, 540f);

        if (rect.rect.width > 0f && rect.rect.height > 0f)
            return rect.rect.size;

        if (rect.sizeDelta.x > 0f && rect.sizeDelta.y > 0f)
            return rect.sizeDelta;

        return new Vector2(960f, 540f);
    }

    private int ResponsiveFont(int baseSize, float layoutHeight)
    {
        float scale = Mathf.Clamp(layoutHeight / 620f, 0.78f, 1f);
        return Mathf.Max(12, Mathf.RoundToInt(baseSize * scale));
    }

    private void EnsureVisualScaffold(
        PanelRect header,
        PanelRect character,
        PanelRect zone,
        PanelRect combat,
        PanelRect actions,
        float margin
    )
    {
        if (gamePanel == null) return;

        RectTransform root = gamePanel;

        RectTransform headerPanel = EnsurePanel(root, "CrystalIdle_HeaderPanel", header.x, header.y, header.width, header.height, HeaderColor);
        RectTransform characterPanel = EnsurePanel(root, "CrystalIdle_CharacterPanel", character.x, character.y, character.width, character.height, CardColor);
        RectTransform zonePanel = EnsurePanel(root, "CrystalIdle_ZonePanel", zone.x, zone.y, zone.width, zone.height, CardColor);
        RectTransform combatPanel = EnsurePanel(root, "CrystalIdle_CombatPanel", combat.x, combat.y, combat.width, combat.height, CardColor);
        RectTransform actionsPanel = EnsurePanel(root, "CrystalIdle_ActionsPanel", actions.x, actions.y, actions.width, actions.height, new Color(0.05f, 0.07f, 0.14f, 0.90f));

        headerPanel.SetAsFirstSibling();
        characterPanel.SetAsFirstSibling();
        zonePanel.SetAsFirstSibling();
        combatPanel.SetAsFirstSibling();
        actionsPanel.SetAsFirstSibling();

        float layoutHeight = GetRectSize(gamePanel).y;
        float headerTextWidth = Mathf.Clamp(header.width * 0.42f, 150f, Mathf.Max(150f, header.width * 0.52f));
        float headerStatusWidth = Mathf.Max(80f, header.width - headerTextWidth - margin * 2f);

        EnsureLabel(root, "CrystalIdle_HeaderTitle", "CRYSTAL IDLE", header.x - header.width * 0.5f + margin + headerTextWidth * 0.5f, header.y + 9f, headerTextWidth, 30, ResponsiveFont(28, layoutHeight), Cyan, TextAlignmentOptions.Left);
        EnsureLabel(root, "CrystalIdle_HeaderSubtitle", "ONLINE IDLE RPG", header.x - header.width * 0.5f + margin + headerTextWidth * 0.5f, header.y - 17f, headerTextWidth, 20, ResponsiveFont(14, layoutHeight), MutedText, TextAlignmentOptions.Left);
        EnsureLabel(root, "CrystalIdle_HeaderStatus", "Explora zonas, caza enemigos y fortalece tu heroe", header.x + header.width * 0.5f - margin - headerStatusWidth * 0.5f, header.y, headerStatusWidth, 30, ResponsiveFont(16, layoutHeight), SoftWhite, TextAlignmentOptions.Right);

        EnsureLabel(root, "CrystalIdle_CharacterTitle", "PERSONAJE", character.x, character.Top - 24f, character.width - 34f, 22, ResponsiveFont(15, layoutHeight), Gold, TextAlignmentOptions.Left);
        EnsureLabel(root, "CrystalIdle_ZoneTitle", "ZONA", zone.x, zone.Top - 22f, zone.width - 34f, 22, ResponsiveFont(15, layoutHeight), Cyan, TextAlignmentOptions.Left);
        EnsureLabel(root, "CrystalIdle_CombatTitle", "ENEMIGO", combat.x, combat.Top - 22f, combat.width - 34f, 22, ResponsiveFont(15, layoutHeight), Violet, TextAlignmentOptions.Left);
        EnsureLabel(root, "CrystalIdle_ActionsTitle", "ACCIONES", actions.x - actions.width * 0.5f + margin + 45f, actions.y, 90, 20, ResponsiveFont(13, layoutHeight), MutedText, TextAlignmentOptions.Left);

        EnsureSeparator(root, "CrystalIdle_CharacterDivider", character.x, character.Top - 108f, character.width - 34f, 2, Gold);
        EnsureSeparator(root, "CrystalIdle_StatsDivider", character.x, character.Top - 211f, character.width - 34f, 2, SeparatorColor);
        EnsureSeparator(root, "CrystalIdle_ZoneDivider", zone.x, zone.Top - 41f, zone.width - 34f, 2, SeparatorColor);
        EnsureSeparator(root, "CrystalIdle_CombatDivider", combat.x, combat.Top - 38f, combat.width - 34f, 2, Violet);
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
