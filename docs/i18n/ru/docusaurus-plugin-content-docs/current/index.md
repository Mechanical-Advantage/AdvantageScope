---
sidebar_position: 1
title: Добро пожаловать
slug: /
---

import DocCardList from "@theme/DocCardList";

#

<img src="/img/banner-ltr-light.webp" className="light-only" />
<img src="/img/banner-ltr-dark.webp" className="dark-only" />

AdvantageScope — это приложение для диагностики роботов, просмотра/анализа логов и визуализации данных для команд FIRST, разработанное [командой 6328](https://littletonrobotics.org). Оно читает логи в форматах WPILOG, Hoot (CTRE), REVLOG (REV Robotics), Road Runner, CSV, NI DS log и RLOG, а также поддерживает просмотр данных робота в реальном времени через потоковую передачу NT4, Phoenix, RLOG или FTC Dashboard. AdvantageScope можно использовать с любым проектом WPILib, при этом приложение также оптимизировано для работы с нашим фреймворком воспроизведения логов [AdvantageKit](https://docs.advantagekit.org). Обратите внимание, что **AdvantageKit не требуется для использования AdvantageScope**.

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
- 2D- и 3D-визуализация поля с отображением поз и настраиваемыми моделями роботов на основе CAD
- Синхронизированное воспроизведение видео из отдельно загруженного видеозаписи матча
- Визуализация джойстиков, показывающая действия оператора на настраиваемых изображениях контроллеров
- Векторное отображение модулей swerve
- Просмотр сообщений консоли
- Анализ статистики логов
- Гибкие возможности экспорта с поддержкой CSV и WPILOG

<Button
label="Перейти к загрузкам"
link="https://github.com/Mechanical-Advantage/AdvantageScope/releases/latest"
variant="primary"
size="lg"
block
style={{ marginBottom: "15px" }}
/>

Отзывы, предложения новых функций и сообщения об ошибках принимаются на [странице Issues](https://github.com/Mechanical-Advantage/AdvantageScope/issues). Подробнее о том, как внести вклад в развитие AdvantageScope, читайте на [странице для участников](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/CONTRIBUTING.md). По непубличным вопросам пишите на software@team6328.org.

<img src="/img/screenshot-light.webp" className="light-only" />
<img src="/img/screenshot-dark.webp" className="dark-only" />
