---
sidebar_position: 1
---

# 📦 Установка {#installation}

Официально поддерживаемая версия AdvantageScope доступна непосредственно от команды 6328 или через установщик WPILib. Также доступно несколько неофициальных дистрибутивов.

## Команда 6328 {#team-6328}

### Загрузки: [Стабильная](https://github.com/Mechanical-Advantage/AdvantageScope/releases/latest), [Предрелиз](https://github.com/Mechanical-Advantage/AdvantageScope/releases) {#6328-downloads}

Скачивание AdvantageScope напрямую от команды 6328 даёт:

- Новейшие функции и исправления ошибок раньше, чем они появятся в других источниках.
- Оповещения в приложении о доступности новой версии для скачивания.
- Встроенную коллекцию недавних моделей роботов 6328 для использования на вкладке 👀 [3D-поле](/tab-reference/3d-field).

:::note
Перед запуском сборок AppImage на Ubuntu 23.10 или более поздней версии Вы должны скачать профиль AppArmor со страницы релизов и скопировать его в `/etc/apparmor.d`.
:::

:::info
Каждая крупная версия AdvantageScope выпускается в январе перед стартом сезона FRC, а номер версии соответствует году (например, v26.0.0 была выпущена в январе 2026 года). Бета- и альфа-версии AdvantageScope могут выходить в течение месяцев, предшествующих каждому релизу, для команд, желающих поэкспериментировать с новыми функциями и оставить отзыв. **При использовании этих предрелизных версий возможны сбои и ошибки, которых нет в стабильных релизах.**
:::

## WPILib {#wpilib}

### Установка: [Документация WPILib](https://docs.wpilib.org/en/stable/docs/zero-to-robot/step-2/wpilib-setup.html) {#wpilib-installation}

Установщик WPILib включает недавний релиз AdvantageScope, но может отставать от последней версии, доступной для прямого скачивания. Документацию по запуску AdvantageScope из сборки VS Code от WPILib можно найти [здесь](https://docs.wpilib.org/en/stable/docs/software/dashboards/advantagescope.html).

## Неофициальные дистрибутивы {#unofficial-distributions}

Существует несколько неофициальных дистрибутивов AdvantageScope, которые официально не поддерживаются разработчиками AdvantageScope и WPILib. Они могут отставать от последней официальной версии AdvantageScope. При возникновении проблем обращайтесь напрямую к их сопровождающим.

- [**AdvantageScope Lite для системы управления REV:**](https://github.com/j5155/AdvantageScope-Lite-FTC) Модификация [AdvantageScope Lite](/more-features/advantagescope-lite) для использования в существующей (до Systemcore) системе управления FTC.
- [**Установщик Homebrew:**](https://formulae.brew.sh/cask/advantagescope) Cask Homebrew для установки AdvantageScope из командной строки на macOS.
- [**Пользовательский репозиторий Arch (AUR):**](https://aur.archlinux.org/packages/advantagescope) Альтернативный способ распространения для использования с пакетным менеджером pacman (официальный дистрибутив Arch AdvantageScope доступен [здесь](#6328-downloads)).
