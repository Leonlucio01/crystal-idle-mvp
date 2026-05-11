# Combat System

## Goal

El combate debe ser simple, entendible y fácil de validar desde el backend.

El cliente muestra animaciones, pero el servidor decide:

- Daño
- Crítico
- Muerte del enemigo
- XP ganada
- Oro ganado
- Level up
- Drops futuros

## Main Formula

Daño básico:

```txt
damage = max(1, attackerATK - defenderDEF)
```

Crítico:

```txt
if random() < critChance:
    damage = damage * critDamage
```

Daño recibido:

```txt
damageTaken = max(1, enemyATK - playerDEF)
```

## Player Stats

```txt
HP
ATK
DEF
CRIT Chance
CRIT Damage
Attack Speed
Power
```

## Enemy Stats

```txt
HP
ATK
DEF
XP Reward
Gold Reward
Is Boss
```

## MVP Combat Flow

1. Cliente manda ataque.
2. Backend carga personaje.
3. Backend carga enemigo.
4. Backend calcula daño.
5. Backend calcula crítico.
6. Backend decide si el enemigo muere.
7. Backend entrega XP y oro.
8. Backend guarda cambios.
9. Backend responde al cliente.
10. Cliente muestra animación, daño y recompensa.

## Example

Player:

```txt
ATK: 10
DEF: 3
CRIT Chance: 5%
CRIT Damage: 150%
```

Enemy:

```txt
HP: 30
DEF: 0
```

Damage:

```txt
damage = max(1, 10 - 0)
damage = 10
```

If crit:

```txt
damage = 10 * 1.5
damage = 15
```

## Level Up

XP necesaria:

```txt
xpRequired = 100 * level ^ 1.5
```

Cuando el jugador sube de nivel:

```txt
level += 1
maxHp += 10
atk += 2
def += 1
currentHp = maxHp
```

## Power Formula

Fórmula inicial:

```txt
power = atk * 5 + def * 4 + maxHp * 1 + critChance * 1000
```

Ejemplo:

```txt
ATK: 10
DEF: 3
HP: 100
CRIT: 0.05

power = 10*5 + 3*4 + 100*1 + 0.05*1000
power = 212
```

## Offline Rewards

No se simula cada golpe. Se calcula por fórmula.

```txt
playerDps = atk * attackSpeed
secondsPerKill = enemyHp / playerDps
kills = offlineSeconds / secondsPerKill
gold = kills * enemyGoldReward
xp = kills * enemyXpReward
```

Límite:

```txt
maxOfflineHours = 8
```

## Anti Cheat Rules

El cliente nunca decide:

- oro final
- XP final
- drops
- level up
- daño real
- recompensas offline

El cliente solo solicita acciones. El backend valida todo.
