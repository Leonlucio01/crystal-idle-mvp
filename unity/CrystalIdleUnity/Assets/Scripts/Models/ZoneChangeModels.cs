using System;

[Serializable]
public class ChangeZoneRequest
{
    public string zoneId;
}

[Serializable]
public class ChangeZoneResponse
{
    public bool success;
    public string message;
    public CharacterData data;
}
