using System;

[Serializable]
public class ZonesResponse
{
    public bool success;
    public ZoneData[] data;
    public string message;
}

[Serializable]
public class EnemyTypeData
{
    public string id;
    public string zoneId;
    public string name;
    public int maxHp;
    public int atk;
    public int def;
    public int xpReward;
    public int goldReward;
    public bool isBoss;
}
