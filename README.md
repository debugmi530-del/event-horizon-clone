# Event Horizon Clone

Клон игры [Event Horizon](https://github.com/PavelZinchenko/event-horizon-main) на **Phaser.js 3** с поддержкой сборки **Android APK** через GitHub Actions.

## 🎮 Возможности

| Модуль | Статус | Описание |
|---|---|---|
| Главное меню | ✅ | Новая игра, продолжить, настройки |
| Звёздная карта | ✅ | 12 систем, навигация, опасность, топливо |
| Боевая система | ✅ | Волны врагов, боссы, коллизии снарядов |
| ИИ врагов | ✅ | 5 типов: aggressive, swarm, tactical, defensive, boss |
| Ангар | ✅ | 10 кораблей, смена, покупка |
| Оружие | ✅ | 11 типов: лазер, плазма, ракеты, торпеды, вортекс |
| Модули | ✅ | Щиты, двигатели, реакторы, спец |
| Магазин | ✅ | Покупка оружия/модулей, ремонт, топливо |
| Дерево технологий | ✅ | 12 технологий с зависимостями |
| Сохранения | ✅ | localStorage, полная прогрессия |
| Оригинальные спрайты | ✅ | Из репозитория Павла Зинченко |

## 📱 Сборка APK

### Через GitHub Actions (рекомендуется)

1. Сделай пуш в `main`
2. Перейди в **Actions** → **Build APK**
3. Скачай артефакт `event-horizon-clone-debug`

### Локально

```bash
# Установить зависимости и собрать веб
npm install
npm run build

# Скопировать в Android assets
mkdir -p android/app/src/main/assets/public
cp -r dist/* android/app/src/main/assets/public/

# Собрать APK
cd android
chmod +x gradlew
./gradlew assembleDebug

# APK будет в:
# android/app/build/outputs/apk/debug/app-debug.apk
```

## 🚀 Разработка

```bash
npm install
npm run dev   # Открыть http://localhost:3000
```

## 🏗 Архитектура

```
src/
├── main.js              # Точка входа, конфиг Phaser
├── scenes/
│   ├── BootScene.js     # Инициализация, загрузка save
│   ├── PreloadScene.js  # Загрузка всех ассетов
│   ├── MainMenuScene.js # Главное меню
│   ├── StarMapScene.js  # Звёздная карта (навигация)
│   ├── CombatScene.js   # Боевой экран
│   ├── HangarScene.js   # Управление флотом
│   ├── ShopScene.js     # Магазин
│   └── TechTreeScene.js # Дерево технологий
├── entities/
│   └── ShipEntity.js    # Корабль (игрок + враги)
├── systems/
│   ├── SaveSystem.js    # localStorage сохранения
│   ├── AISystem.js      # 5 типов ИИ врагов
│   ├── BulletSystem.js  # Управление снарядами
│   └── ParticleSystem.js# Взрывы и эффекты
└── data/
    ├── ships.js         # 10 кораблей
    ├── weapons.js       # 11 типов оружия
    ├── modules.js       # 12 модулей
    ├── enemies.js       # 8 врагов + 2 босса
    └── starmap.js       # 12 звёздных систем
```

## 📜 Лицензия

Спрайты из оригинального репозитория Event Horizon: © Pavel Zinchenko  
Код клона: MIT
