# Database Design

## Stack

Base de datos propuesta:

```txt
PostgreSQL
```

ORM:

```txt
Prisma
```

Hosting MVP:

```txt
Render PostgreSQL
```

## Main Tables

## users

Guarda las cuentas de usuario.

Campos:

```txt
id
email
password_hash
created_at
updated_at
```

## characters

Guarda el personaje principal del usuario.

Campos:

```txt
id
user_id
name
class
level
xp
gold
diamonds
atk
def
max_hp
current_hp
crit_chance
crit_damage
power
current_zone_id
last_logout_at
created_at
updated_at
```

## zones

Guarda las zonas del juego.

Campos:

```txt
id
name
description
required_level
enemy_type_id
boss_enemy_type_id
created_at
updated_at
```

## enemy_types

Guarda tipos de enemigos.

Campos:

```txt
id
name
zone_id
max_hp
atk
def
xp_reward
gold_reward
is_boss
created_at
updated_at
```

## stat_upgrades

Guarda el nivel de cada mejora por personaje.

Campos:

```txt
id
character_id
stat
level
base_cost
current_cost
created_at
updated_at
```

Stats válidos:

```txt
ATK
DEF
HP
CRIT
```

## offline_rewards

Historial de recompensas offline.

Campos:

```txt
id
character_id
seconds_offline
kills
gold_earned
xp_earned
claimed_at
```

## combat_logs

Logs básicos de combate.

Campos:

```txt
id
character_id
enemy_type_id
damage
is_crit
enemy_killed
gold_earned
xp_earned
created_at
```

## leaderboard_snapshots

Opcional para rankings.

Campos:

```txt
id
character_id
power
level
rank
created_at
```

## Future Tables

Más adelante:

```txt
items
character_items
equipment_slots
pets
mounts
wings
skills
guilds
guild_members
daily_rewards
shop_purchases
events
```

## Initial Seed Data

### Zone: Crystal Forest

```txt
id: crystal_forest
name: Crystal Forest
required_level: 1
```

### Enemy: Green Slime

```txt
id: green_slime
name: Green Slime
max_hp: 30
atk: 4
def: 0
xp_reward: 10
gold_reward: 3
is_boss: false
```

### Enemy: Crystal Wolf

```txt
id: crystal_wolf
name: Crystal Wolf
max_hp: 80
atk: 8
def: 1
xp_reward: 25
gold_reward: 8
is_boss: false
```

### Boss: Slime King

```txt
id: slime_king
name: Slime King
max_hp: 500
atk: 15
def: 3
xp_reward: 150
gold_reward: 60
is_boss: true
```
