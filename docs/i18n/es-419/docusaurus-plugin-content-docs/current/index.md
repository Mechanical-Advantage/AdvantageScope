---
sidebar_position: 1
title: Bienvenida
slug: /
---

import DocCardList from "@theme/DocCardList";

#

<img src="/img/banner-ltr-light.webp" className="light-only" />
<img src="/img/banner-ltr-dark.webp" className="dark-only" />

AdvantageScope es una aplicación de diagnóstico, análisis de registros y visualización de datos de robots para equipos de FIRST, desarrollada por el [Equipo 6328](https://littletonrobotics.org). Te permite abrir archivos de registro en los formatos WPILOG, Hoot (CTRE), REVLOG (REV Robotics), Road Runner, CSV, NI DS y RLOG, además de ver datos del robot en tiempo real mediante NT4, Phoenix, RLOG o FTC Dashboard. Puedes usar AdvantageScope con cualquier proyecto de WPILib, aunque también está optimizada para trabajar con nuestro framework de reproducción de registros [AdvantageKit](https://docs.advantagekit.org). Ten en cuenta que **no necesitas AdvantageKit para usar AdvantageScope**.

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
type: "link",
label: "Conferencia del campeonato",
href: "/overview/champs-conference"
}
]}
/>

Con AdvantageScope tienes acceso a estas herramientas:

- Una gran variedad de gráficos y tablas flexibles
- Visualizaciones en campo 2D y 3D para datos de poses, con modelos de robots basados en CAD que puedes personalizar
- Reproducción de video sincronizada con un video del partido cargado por separado
- Visualización de joysticks, donde ves las acciones del conductor sobre representaciones personalizables de los controles
- Visualización de vectores para módulos swerve
- Revisión de mensajes de la consola
- Análisis estadístico de registros
- Opciones flexibles de exportación, compatibles con CSV y WPILOG

<Button
label="Ir a descargas"
link="https://github.com/Mechanical-Advantage/AdvantageScope/releases/latest"
variant="primary"
size="lg"
block
style={{ marginBottom: "15px" }}
/>

Si tienes comentarios, quieres sugerir una función o necesitas reportar un error, puedes hacerlo en la [página de issues](https://github.com/Mechanical-Advantage/AdvantageScope/issues). Consulta la [página de contribuciones](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/CONTRIBUTING.md) si te interesa colaborar con AdvantageScope. Para consultas privadas, escríbenos a software@team6328.org.

<img src="/img/screenshot-light.webp" className="light-only" />
<img src="/img/screenshot-dark.webp" className="dark-only" />
