# AGENTS.md

Project: Crystal Idle MVP

This repository contains a Node/Express/Prisma backend and a Unity client prototype for an online 3D idle RPG.

## Main paths

- Backend: `server/`
- Unity project: `unity/CrystalIdleUnity/`
- Unity scripts: `unity/CrystalIdleUnity/Assets/Scripts/`
- Unity scenes: `unity/CrystalIdleUnity/Assets/Scenes/`
- Unity UI asset pack: `unity/CrystalIdleUnity/Assets/Layer Lab/GUI Pro-CasualGame/`

## Do not scan, modify, or commit Unity generated folders

Never read, edit, modify, or commit these paths unless the user explicitly asks:

- `unity/CrystalIdleUnity/Library/`
- `unity/CrystalIdleUnity/Temp/`
- `unity/CrystalIdleUnity/Obj/`
- `unity/CrystalIdleUnity/Logs/`
- `unity/CrystalIdleUnity/UserSettings/`
- `unity/CrystalIdleUnity/.vs/`
- `unity/CrystalIdleUnity/Build/`
- `unity/CrystalIdleUnity/Builds/`

Also avoid generated IDE files:

- `*.csproj`
- `*.sln`
- `*.suo`
- `*.user`
- `*.pidb`
- `*.booproj`

Unity `.meta` files may be modified only when required by Unity assets, scenes, prefabs, or scripts.

## Backend rules

The backend lives in `server/`.

Important backend files:

- `server/src/server.js`
- `server/src/routes/`
- `server/prisma/schema.prisma`
- `server/prisma/seed.js`
- `server/package.json`

The backend uses:

- Node.js
- Express
- Prisma
- PostgreSQL
- JWT auth
- Render deployment

Production API:

- `https://crystal-idle-api.onrender.com`

Do not change production environment variables or secrets.

Do not run destructive database commands unless explicitly requested by the user.

Avoid commands such as:

- `prisma migrate reset`
- `prisma db push --force-reset`
- deleting tables
- truncating production data
- changing production seed data without confirmation

If database changes are needed, prefer:

1. Modify `server/prisma/schema.prisma`.
2. Create a new Prisma migration.
3. Update seed data only if necessary.
4. Explain what changed and how to apply it locally first.
5. Ask before applying anything to production.

## Unity rules

Unity version target:

- Unity 6.3 LTS

Keep Unity changes focused and compatible with Unity 6.3 LTS.

Prefer simple, readable C# scripts.

Current Unity client includes:

- `LoginScene`
- `GameScene`
- `ApiClient`
- `LoginUI`
- `GameUI`
- `GameSceneLayout`

Current Unity gameplay supports:

- Login/register through API
- Load current character
- Load zones
- Change zone
- Select enemy
- Kill enemy
- Display character stats
- Basic zone/enemy preview

## UI asset pack

The project includes GUI Pro - Casual Game assets under:

`unity/CrystalIdleUnity/Assets/Layer Lab/GUI Pro-CasualGame/`

Preferred UI prefabs:

Frames:

- `Assets/Layer Lab/GUI Pro-CasualGame/Prefabs/Prefabs_Component_Frames/PanelFrame03_Topbar_Navy.prefab`
- `Assets/Layer Lab/GUI Pro-CasualGame/Prefabs/Prefabs_Component_Frames/PanelFrame04_TopbarDivided_Single_Navy.prefab`
- `Assets/Layer Lab/GUI Pro-CasualGame/Prefabs/Prefabs_Component_Frames/CardFrame01-Group.prefab`
- `Assets/Layer Lab/GUI Pro-CasualGame/Prefabs/Prefabs_Component_Frames/ItemFrame01-Group.prefab`
- `Assets/Layer Lab/GUI Pro-CasualGame/Prefabs/Prefabs_Component_Frames/SkillFrame01-Group.prefab`

Buttons:

- `Assets/Layer Lab/GUI Pro-CasualGame/Prefabs/Prefabs_Component_Buttons/Button01_195_BtnText_Blue.prefab`
- `Assets/Layer Lab/GUI Pro-CasualGame/Prefabs/Prefabs_Component_Buttons/Button01_225_BtnText_Sky.prefab`
- `Assets/Layer Lab/GUI Pro-CasualGame/Prefabs/Prefabs_Component_Buttons/Button01_175_BtnText_Green.prefab`
- `Assets/Layer Lab/GUI Pro-CasualGame/Prefabs/Prefabs_Component_Buttons/Button01_175_BtnText_Red.prefab`
- `Assets/Layer Lab/GUI Pro-CasualGame/Prefabs/Prefabs_Component_Buttons/Button01_195_BtnText_Purple.prefab`

Do not import new Asset Store packages unless explicitly requested.

Do not duplicate the whole asset pack.

Prefer using existing imported assets.

## Current API endpoints

Known API endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `GET /character/me`
- `GET /zones`
- `POST /character/change-zone`
- `POST /combat/kill`
- upgrade endpoints may exist in backend routes

Before changing Unity API calls, inspect the backend route files in `server/src/routes/`.

## Development style

Keep changes small and focused.

Explain exactly which files changed and why.

Prefer incremental improvements over large rewrites.

When modifying gameplay logic:

- Preserve login flow.
- Preserve API connection.
- Preserve existing character state behavior.
- Do not break `LoginScene`.
- Do not break `GameScene`.

When modifying UI:

- Keep 16:9 layout readable.
- Avoid text clipping.
- Use TextMeshPro.
- Prefer panel-based layout.
- Prefer dark/cyan/violet/gold Crystal Idle style.
- Use existing GUI Pro assets when possible.

## Good task order

Recommended order for future work:

1. Improve `GameScene` visual layout.
2. Add upgrades UI in Unity.
3. Add enemy HP bar and damage feedback.
4. Add simple 3D placeholders for player/enemy/crystals.
5. Add auto farm UI.
6. Add offline reward UI.
7. Improve zone progression.
8. Add inventory/items later.

## Safety

Do not commit secrets.

Do not print or expose JWT secrets, database passwords, PayPal secrets, OAuth secrets, or production tokens.

Do not modify `.env` files.

Do not create files containing real secrets.

Use placeholders in examples.
