# Game Design Document - Crystal Idle MVP

## 1. Concepto general

Crystal Idle MVP es un idle RPG online de fantasía donde el jugador controla un avatar que combate automáticamente contra monstruos, gana experiencia, oro y cristales, y mejora sus estadísticas para desbloquear zonas más difíciles.

El loop principal del juego es:

```txt
Matar monstruos -> ganar recompensas -> mejorar stats -> desbloquear zonas -> derrotar bosses -> conseguir equipo -> repetir
```

## 2. Género

- Idle RPG
- Online RPG
- Fantasía
- Auto-combate
- Progresión persistente
- Juego con backend y base de datos

## 3. Inspiración

El juego toma inspiración de:

- MU Online
- Legend of Angel
- Crystal Saga Idle
- Ragnarok Online
- AFK-style idle RPGs

No se busca copiar estos juegos, sino tomar ideas de progresión, estética fantasy, equipos, bosses, alas, resets y sensación de crecimiento.

## 4. Estilo visual

El juego usará una estética fantasy stylized 3D.

Características:

- Armaduras brillantes
- Espadas grandes
- Cristales mágicos
- Monstruos demoníacos y criaturas de fantasía
- Alas en etapas avanzadas
- Efectos de golpe y crítico
- Números flotantes de daño
- UI clara y llamativa
- Colores intensos
- Sensación visual de poder creciente

Para el MVP no se usará realismo 3D, porque requiere más tiempo, animaciones y arte.

## 5. Historia base

El mundo fue invadido por criaturas nacidas de cristales corruptos. Los cazadores absorben la energía de esos cristales para volverse más fuertes.

El jugador empieza como un cazador novato y debe limpiar zonas, derrotar bosses y purificar cristales antiguos.

## 6. Objetivo del jugador

El objetivo principal es aumentar el poder total del personaje, desbloquear zonas, derrotar bosses y escalar en el ranking global.

## 7. Loop principal

1. El jugador entra al juego.
2. El personaje busca un enemigo.
3. El personaje ataca automáticamente.
4. El enemigo recibe daño.
5. El enemigo muere.
6. El jugador recibe XP, oro y posibles objetos.
7. El jugador mejora sus stats.
8. El jugador desbloquea enemigos y zonas más fuertes.
9. El ciclo se repite.

## 8. Stats principales

### HP

Vida máxima del personaje.

### ATK

Daño base del personaje.

### DEF

Reduce el daño recibido.

### CRIT Chance

Probabilidad de hacer golpe crítico.

### CRIT Damage

Multiplicador de daño crítico.

### Power

Valor total calculado a partir de los stats. Sirve para ranking y desbloqueos.

## 9. Stats iniciales

```txt
Level: 1
XP: 0
Gold: 0
HP: 100
ATK: 10
DEF: 3
CRIT Chance: 5%
CRIT Damage: 150%
Power: 100
```

## 10. Clase inicial

Para el MVP solo existirá una clase:

### Warrior

Clase balanceada con HP, ATK y DEF estables.

Clases futuras:

- Mage
- Ranger
- Paladin
- Assassin

## 11. Zonas iniciales

### Zona 1: Crystal Forest

Un bosque contaminado por cristales verdes.

Enemigos:

- Green Slime
- Crystal Wolf
- Slime King

Recompensas:

- Oro
- XP
- Green Crystals

### Zona 2: Goblin Cave

Una cueva oscura ocupada por goblins.

Enemigos:

- Goblin
- Goblin Archer
- Goblin Chief

Recompensas:

- Oro
- XP
- Equipo básico
- Red Crystals

### Zona 3: Demon Ruins

Ruinas antiguas tomadas por demonios menores.

Enemigos:

- Lesser Demon
- Dark Knight
- Corrupted Guardian

Recompensas:

- Cristales raros
- Equipo raro
- Materiales de boss

## 12. Enemigos del MVP

### Green Slime

```txt
HP: 30
ATK: 4
DEF: 0
XP Reward: 10
Gold Reward: 3
```

### Crystal Wolf

```txt
HP: 80
ATK: 8
DEF: 1
XP Reward: 25
Gold Reward: 8
```

### Slime King

```txt
HP: 500
ATK: 15
DEF: 3
XP Reward: 150
Gold Reward: 60
```

## 13. Upgrades

El jugador podrá mejorar:

- ATK
- DEF
- HP
- CRIT Chance

Costos iniciales:

```txt
ATK: 10 gold
DEF: 10 gold
HP: 15 gold
CRIT: 25 gold
```

Fórmula de costo:

```txt
nextCost = baseCost * upgradeLevel ^ 1.3
```

## 14. MVP

El MVP incluirá:

- Login
- Personaje
- Stats
- Auto-combate
- Una zona
- Tres enemigos
- Un boss
- Oro
- XP
- Level up
- Upgrades
- Recompensa offline
- Guardado online
- Ranking de poder

## 15. Sistemas futuros

Después del MVP:

- Inventario
- Equipo
- Rarezas
- Mascotas
- Monturas
- Alas
- Skills
- Dungeons
- Boss global
- Chat
- Guilds
- Eventos diarios
- Tienda
- PvP asíncrono
- Ascension / Rebirth
