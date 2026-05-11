using System;
using System.Collections;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

public class ApiClient : MonoBehaviour
{
    public static ApiClient Instance { get; private set; }

    public string Token { get; private set; }

    private void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }

        Instance = this;
        DontDestroyOnLoad(gameObject);

        Token = PlayerPrefs.GetString("AUTH_TOKEN", "");
    }

    public void SetToken(string token)
    {
        Token = token;
        PlayerPrefs.SetString("AUTH_TOKEN", token);
        PlayerPrefs.Save();
    }

    public void ClearToken()
    {
        Token = "";
        PlayerPrefs.DeleteKey("AUTH_TOKEN");
        PlayerPrefs.Save();
    }

    public IEnumerator PostJson<TResponse>(
        string path,
        string jsonBody,
        Action<TResponse> onSuccess,
        Action<string> onError
    )
    {
        string url = ApiConfig.BaseUrl + path;

        using UnityWebRequest request = new UnityWebRequest(url, "POST");
        byte[] bodyRaw = Encoding.UTF8.GetBytes(jsonBody);

        request.uploadHandler = new UploadHandlerRaw(bodyRaw);
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "application/json");

        if (!string.IsNullOrEmpty(Token))
        {
            request.SetRequestHeader("Authorization", "Bearer " + Token);
        }

        yield return request.SendWebRequest();

        if (request.result != UnityWebRequest.Result.Success)
        {
            onError?.Invoke(request.error + " | " + request.downloadHandler.text);
            yield break;
        }

        try
        {
            TResponse response = JsonUtility.FromJson<TResponse>(request.downloadHandler.text);
            onSuccess?.Invoke(response);
        }
        catch (Exception e)
        {
            onError?.Invoke("JSON parse error: " + e.Message + " | " + request.downloadHandler.text);
        }
    }

    public IEnumerator GetJson<TResponse>(
        string path,
        Action<TResponse> onSuccess,
        Action<string> onError
    )
    {
        string url = ApiConfig.BaseUrl + path;

        using UnityWebRequest request = UnityWebRequest.Get(url);

        if (!string.IsNullOrEmpty(Token))
        {
            request.SetRequestHeader("Authorization", "Bearer " + Token);
        }

        yield return request.SendWebRequest();

        if (request.result != UnityWebRequest.Result.Success)
        {
            onError?.Invoke(request.error + " | " + request.downloadHandler.text);
            yield break;
        }

        try
        {
            TResponse response = JsonUtility.FromJson<TResponse>(request.downloadHandler.text);
            onSuccess?.Invoke(response);
        }
        catch (Exception e)
        {
            onError?.Invoke("JSON parse error: " + e.Message + " | " + request.downloadHandler.text);
        }
    }
}
