# Crystal Idle Unity MVP - Starter Scripts

Este zip trae la estructura inicial para conectar Unity con la API online.

## Copiar en Unity

Copia la carpeta `Assets` dentro de tu proyecto Unity:

```txt
crystal-idle-mvp/unity/CrystalIdleUnity/
```

Debe fusionarse con la carpeta `Assets` existente.

## Estructura incluida

```txt
Assets/
  Scripts/
    Api/
      ApiConfig.cs
      ApiClient.cs
    Models/
      AuthModels.cs
      CharacterModels.cs
    UI/
      LoginUI.cs
      GameUI.cs
  Scenes/
  Prefabs/
  Materials/
  Art/
```

## Escenas

Crea manualmente en Unity:

```txt
Assets/Scenes/LoginScene.unity
Assets/Scenes/GameScene.unity
```

Luego agregalas en:

```txt
File -> Build Profiles / Build Settings
```

Orden:

```txt
1. LoginScene
2. GameScene
```

## LoginScene

Crea:

```txt
Canvas
  Panel
    TitleText
    EmailInput
    PasswordInput
    CharacterNameInput
    LoginButton
    RegisterButton
    StatusText

ApiClient GameObject
LoginController GameObject
```

- Al GameObject `ApiClient` agregale `ApiClient.cs`
- Al GameObject `LoginController` agregale `LoginUI.cs`
- Arrastra los inputs, botones y status text al inspector de `LoginUI`

## GameScene

Crea:

```txt
Canvas
  Panel
    NameText
    ClassText
    LevelText
    XPText
    GoldText
    ATKText
    DEFText
    HPText
    CRITText
    PowerText
    ZoneText
    StatusText
    RefreshButton
    LogoutButton

GameController GameObject
```

- Al GameObject `GameController` agregale `GameUI.cs`
- Arrastra todos los textos y botones al inspector de `GameUI`

## API

La API configurada es:

```txt
https://crystal-idle-api.onrender.com
```

Archivo:

```txt
Assets/Scripts/Api/ApiConfig.cs
```
