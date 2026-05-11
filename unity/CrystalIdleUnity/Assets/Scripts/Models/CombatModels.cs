using System;

[Serializable]
public class KillEnemyRequest
{
    public string enemyTypeId;
}

[Serializable]
public class KillEnemyResponse
{
    public bool success;
    public string message;
    public KillEnemyData data;
}

[Serializable]
public class KillEnemyData
{
    public EnemyTypeData enemy;
    public int goldEarned;
    public int xpEarned;
    public int levelsGained;
    public CharacterData character;
}
