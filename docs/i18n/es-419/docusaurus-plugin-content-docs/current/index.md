---
sidebar_position: 1
title: Bienvenida
slug: /
---

import DocCardList from "@theme/DocCardList";

#

<img src="/img/banner.png" alt="AdvantageScope" />

AdvantageScope es una aplicación de diagnóstico de robots, revisión/análisis de registros y visualización de datos para equipos de FIRST desarrollada por el [Equipo 6328](https://littletonrobotics.org). Lee archivos de registro en los formatos WPILOG, registro de DS, Hoot (CTRE), REVLOG (REV Robotics), Road Runner, CSV y RLOG, además de permitir la visualización de datos en vivo del robot mediante transmisión NT4, Phoenix, RLOG o FTC Dashboard. AdvantageScope se puede utilizar con cualquier proyecto de WPILib, pero también está optimizada para su uso con nuestro marco de trabajo de reproducción de registros [AdvantageKit](https://docs.advantagekit.org). Ten en cuenta que **no se requiere AdvantageKit para usar AdvantageScope**.

<DocCardList
items={[
{
type: "category",
label: "Descripción general",
href: "/category/overview"
},
{
type: "category",
label: "Referencia de pestañas",
href: "/category/tab-reference"
},
{
type: "category",
label: "Más funciones",
href: "/category/more-features"
},
{
type: "category",
label: "Conferencia del campeonato",
href: "/overview/champs-conference"
}
]}
/>

AdvantageScope incluye las siguientes herramientas:

- Una amplia selección de gráficas y tablas flexibles
- Visualizaciones de campo 2D y 3D de datos de poses, con robots basados en CAD personalizables
- Reproducción de video sincronizada desde un video del partido cargado por separado
- Visualización de joysticks, que muestra las acciones del conductor en representaciones de controladores personalizables
- Pantallas de vectores de módulos de tracción swerve
- Revisión de mensajes de la consola
- Análisis de estadísticas de registros
- Opciones de exportación flexibles, con soporte para CSV y WPILOG

<Button
label="Ir a descargas"
link="https://github.com/Mechanical-Advantage/AdvantageScope/releases/latest"
variant="primary"
size="lg"
block
style={{ marginBottom: "15px" }}
/>

Los comentarios, las solicitudes de funciones y los informes de errores son bienvenidos en la [página de issues](https://github.com/Mechanical-Advantage/AdvantageScope/issues). Consulta la [página de contribuciones](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/CONTRIBUTING.md) para obtener más información sobre cómo contribuir a AdvantageScope. Para consultas no públicas, envía un mensaje a software@team6328.org.

<img src="/img/screenshot-light.png" className="light-only" />
<img src="/img/screenshot-light.png" className="dark-only" />
