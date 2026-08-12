---
sidebar_position: 1
title: Добро пожаловать
slug: /
---

import DocCardList from "@theme/DocCardList";

#

<img src="/img/banner.webp" alt="AdvantageScope" />

AdvantageScope — это приложение для диагностики роботов, просмотра/анализа логов и визуализации данных для команд FIRST, разработанное [Командой 6328](https://littletonrobotics.org). Оно читает логи в форматах файлов WPILOG, DS log, Hoot (CTRE), REVLOG (REV Robotics), Road Runner, CSV и RLOG, а также поддерживает просмотр данных робота в реальном времени с использованием потоковой передачи NT4, Phoenix, RLOG или FTC Dashboard. AdvantageScope может использоваться с любым проектом WPILib, но также оптимизировано для использования с нашим фреймворком повторного воспроизведения логов [AdvantageKit](https://docs.advantagekit.org). Обратите внимание, что **AdvantageKit не требуется для использования AdvantageScope**.

<DocCardList
items={[
{
type: "category",
label: "Обзор",
href: "/category/overview"
},
{
type: "category",
label: "Справочник вкладок",
href: "/category/tab-reference"
},
{
type: "category",
label: "Другие функции",
href: "/category/more-features"
},
{
type: "link",
label: "Конференция Чемпионата",
href: "/overview/champs-conference"
}
]}
/>

AdvantageScope включает в себя следующие инструменты:

- Широкий выбор гибких графиков и диаграмм
- 2D- и 3D-визуализации полей данных поз с настраиваемыми роботами на основе CAD
- Синхронизированное воспроизведение видео из отдельно загруженного видео матча
- Визуализация джойстиков, показывающая действия водителя на настраиваемых представлениях контроллеров
- Векторные дисплеи модулей swerve drive
- Просмотр сообщений консоли
- Анализ статистики логов
- Гибкие опции экспорта с поддержкой CSV и WPILOG

<Button
label="Перейти к загрузкам"
link="https://github.com/Mechanical-Advantage/AdvantageScope/releases/latest"
variant="primary"
size="lg"
block
style={{ marginBottom: "15px" }}
/>

Отзывы, запросы функций и сообщения об ошибках приветствуются на [странице проблем](https://github.com/Mechanical-Advantage/AdvantageScope/issues). Смотрите [страницу участия](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/CONTRIBUTING.md) для получения дополнительной информации о внесении вклада в AdvantageScope. Для непубличных запросов отправьте сообщение по адресу software@team6328.org.

<img src="/img/screenshot-light.webp" className="light-only" />
<img src="/img/screenshot-light.webp" className="dark-only" />
