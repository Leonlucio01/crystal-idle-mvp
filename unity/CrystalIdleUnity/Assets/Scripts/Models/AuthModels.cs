using System;

[Serializable]
public class AuthRequest
{
    public string email;
    public string password;
    public string characterName;
}

[Serializable]
public class AuthResponse
{
    public bool success;
    public string token;
    public CharacterData character;
    public string message;
}
