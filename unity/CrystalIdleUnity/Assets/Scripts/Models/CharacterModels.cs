using System;

[Serializable]
public class CharacterResponse
{
    public bool success;
    public CharacterData data;
    public string message;
}

[Serializable]
public class CharacterData
{
    public string id;
    public string userId;
    public string name;
    public string @class;
    public int level;
    public int xp;
    public int gold;
    public int atk;
    public int def;
    public int maxHp;
    public int currentHp;
    public float critChance;
    public int power;
    public string currentZoneId;
    public ZoneData currentZone;
}

[Serializable]
public class ZoneData
{
    public string id;
    public string name;
    public string description;
    public int requiredLevel;
}
