# GameSceneLayout.cs

Script para ordenar automaticamente la UI de GameScene.

## Uso

1. Copia `Assets/Scripts/UI/GameSceneLayout.cs` dentro de tu proyecto Unity.
2. Abre `GameScene`.
3. Selecciona `Canvas/GamePanel`.
4. Add Component -> `GameSceneLayout`.
5. El script intenta encontrar automaticamente:
   - NameText
   - ClassText
   - LevelText
   - XPText
   - GoldText
   - ATKText
   - DEFText
   - HPText
   - CRITText
   - PowerText
   - ZoneText
   - StatusText
   - EnemyDropdown
   - KillEnemyButton
   - CombatStatusText
   - RefreshButton
   - LogoutButton
6. En el componente, usa el menu de tres puntos o click derecho sobre el componente:
   - Auto Find Children
   - Apply Layout

Tambien se aplica automaticamente en editor si `autoApplyInEditor` esta activo.
