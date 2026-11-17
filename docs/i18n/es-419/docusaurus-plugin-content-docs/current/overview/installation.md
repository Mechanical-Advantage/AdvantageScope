---
sidebar_position: 1
---

# 📦 Instalación {#installation}

Puedes conseguir la versión oficial de AdvantageScope directamente desde el Equipo 6328 o mediante el instalador de WPILib. También existen varias distribuciones no oficiales.

## Equipo 6328 {#team-6328}

### Descargas: [estable](https://github.com/Mechanical-Advantage/AdvantageScope/releases/latest), [versión preliminar](https://github.com/Mechanical-Advantage/AdvantageScope/releases) {#6328-downloads}

Al descargar AdvantageScope directamente del Equipo 6328 obtienes:

- Las funciones más recientes y correcciones de errores antes de que lleguen por otros canales.
- Avisos dentro de la aplicación cuando haya una nueva versión lista para descargar.
- Una colección integrada de modelos recientes de los robots de 6328 para usar en la pestaña 👀 [Campo 3D](/tab-reference/3d-field).

:::note
Antes de ejecutar los paquetes AppImage en Ubuntu 23.10 o posterior, descarga el perfil de AppArmor desde la página de versiones y cópialo a /etc/apparmor.d.
:::

:::info
Cada versión principal de AdvantageScope sale en enero, antes del kickoff de FRC, con un número de versión correspondiente al año (por ejemplo, la v26.0.0 se lanzó en enero de 2026). En los meses previos a cada lanzamiento suelen estar disponibles versiones alfa y beta para los equipos que quieran probar funciones nuevas y enviar comentarios. **Si usas estas versiones preliminares, ten en cuenta que probablemente encontrarás problemas y errores que no aparecen en las versiones estables.**
:::

## WPILib {#wpilib}

### Instalación: [Documentos de WPILib](https://docs.wpilib.org/es/stable/docs/zero-to-robot/step-2/wpilib-setup.html) {#wpilib-installation}

El instalador de WPILib incluye una versión reciente de AdvantageScope, aunque puede ir un poco por detrás de la última versión disponible para descarga directa. Puedes consultar [aquí](https://docs.wpilib.org/es/stable/docs/software/dashboards/advantagescope.html) cómo iniciar AdvantageScope desde la versión de VSCode de WPILib.

## Distribuciones no oficiales {#unofficial-distributions}

Existen distribuciones no oficiales de AdvantageScope mantenidas por terceros, que no cuentan con el soporte oficial de los desarrolladores de AdvantageScope ni de WPILib. Es posible que estas versiones no estén al día con la última publicación oficial, así que comunícate directamente con sus responsables si tienes algún problema.

- [**AdvantageScope Lite para el sistema de control de REV:**](https://github.com/j5155/AdvantageScope-Lite-FTC) Una adaptación de [AdvantageScope Lite](/more-features/advantagescope-lite) para el sistema de control actual de FTC (anterior a Systemcore).
- [**Instalador de Homebrew:**](https://formulae.brew.sh/cask/advantagescope) Un *cask* de Homebrew para instalar AdvantageScope desde la línea de comandos en macOS.
- [**Arch User Repository:**](https://aur.archlinux.org/packages/advantagescope) Un método alternativo para instalar AdvantageScope con el gestor de paquetes pacman (tienes una distribución oficial para Arch disponible [aquí](#6328-downloads)).
