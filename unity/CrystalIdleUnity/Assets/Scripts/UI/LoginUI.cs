using TMPro;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class LoginUI : MonoBehaviour
{
    [Header("Inputs")]
    public TMP_InputField emailInput;
    public TMP_InputField passwordInput;
    public TMP_InputField characterNameInput;

    [Header("Buttons")]
    public Button loginButton;
    public Button registerButton;

    [Header("Texts")]
    public TMP_Text statusText;

    private void Start()
    {
        loginButton.onClick.AddListener(Login);
        registerButton.onClick.AddListener(Register);

        if (emailInput != null)
            emailInput.text = "prodtest@example.com";

        if (passwordInput != null)
            passwordInput.text = "123456";

        if (characterNameInput != null)
            characterNameInput.text = "ProdHero";
    }

    private void Login()
    {
        SetStatus("Iniciando sesion...");

        AuthRequest body = new AuthRequest
        {
            email = emailInput.text,
            password = passwordInput.text
        };

        string json = JsonUtility.ToJson(body);

        StartCoroutine(ApiClient.Instance.PostJson<AuthResponse>(
            "/auth/login",
            json,
            response =>
            {
                if (!response.success)
                {
                    SetStatus("Login fallo: " + response.message);
                    return;
                }

                ApiClient.Instance.SetToken(response.token);
                SetStatus("Login correcto.");

                SceneManager.LoadScene("GameScene");
            },
            error =>
            {
                SetStatus("Error: " + error);
            }
        ));
    }

    private void Register()
    {
        SetStatus("Registrando...");

        AuthRequest body = new AuthRequest
        {
            email = emailInput.text,
            password = passwordInput.text,
            characterName = characterNameInput.text
        };

        string json = JsonUtility.ToJson(body);

        StartCoroutine(ApiClient.Instance.PostJson<AuthResponse>(
            "/auth/register",
            json,
            response =>
            {
                if (!response.success)
                {
                    SetStatus("Registro fallo: " + response.message);
                    return;
                }

                ApiClient.Instance.SetToken(response.token);
                SetStatus("Registro correcto.");

                SceneManager.LoadScene("GameScene");
            },
            error =>
            {
                SetStatus("Error: " + error);
            }
        ));
    }

    private void SetStatus(string message)
    {
        if (statusText != null)
            statusText.text = message;

        Debug.Log(message);
    }
}
