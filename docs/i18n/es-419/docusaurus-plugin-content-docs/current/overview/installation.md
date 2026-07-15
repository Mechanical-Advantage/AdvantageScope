---
sidebar_position: 1
---

# 📦 Instalación

La versión oficialmente compatible de AdvantageScope está disponible directamente del Equipo 6328 o a través del instalador de WPILib. También hay disponibles varias distribuciones no oficiales.

## Equipo 6328 {#team-6328}

### Descargas: [estable](https://github.com/Mechanical-Advantage/AdvantageScope/releases/latest), [versión preliminar](https://github.com/Mechanical-Advantage/AdvantageScope/releases) {#6328-downloads}

Descargar AdvantageScope directamente del Equipo 6328 proporciona:

- Las últimas funciones y correcciones de errores antes de que estén disponibles a través de otros canales.
- Alertas dentro de la aplicación cuando hay una nueva versión disponible para descargar.
- Una colección integrada de modelos recientes de robots 6328 para su uso en la pestaña 👀 [Campo 3D](/tab-reference/3d-field).

:::note
Antes de ejecutar compilaciones de AppImage en Ubuntu 23.10 o posterior, debes descargar el perfil AppArmor desde la página de versiones y copiarlo a /etc/apparmor.d.
:::

:::info
Cada versión principal de AdvantageScope se lanza en enero antes del inicio de FRC, con un número de versión correspondiente al año (por ejemplo, v26.0.0 se lanzará en enero de 2026). Las versiones beta y alfa de AdvantageScope pueden estar disponibles en los meses previos a cada lanzamiento, para los equipos que deseen experimentar con nuevas funciones y brindar comentarios. **Los equipos que utilicen estas versiones preliminares deben esperar ver problemas y errores que no están presentes en las versiones estables.**
:::

## WPILib

### Instalación: [Documentos de WPILib](https://docs.wpilib.org/en/stable/docs/zero-to-robot/step-2/wpilib-setup.html) {#wpilib-installation}

El instalador de WPILib incluye una versión reciente de AdvantageScope, pero puede estar rezagada respecto a la última versión disponible para descarga directa. La documentación para iniciar AdvantageScope desde la versión WPILib de VSCode se puede encontrar [aquí](https://docs.wpilib.org/en/stable/docs/software/dashboards/advantagescope.html).

## Distribuciones no oficiales

Las distribuciones no oficiales de AdvantageScope están disponibles en varias fuentes, las cuales no cuentan con el soporte oficial de los desarrolladores de AdvantageScope/WPILib. Estas distribuciones pueden estar rezagadas respecto a la última versión de AdvantageScope disponible en fuentes oficiales. Comunícate directamente con los mantenedores en caso de problemas.

- **[AdvantageScope Lite para el sistema de control de REV:](https://github.com/j5155/AdvantageScope-Lite-FTC)** Una modificación de [AdvantageScope Lite](/more-features/advantagescope-lite) para su uso en el sistema de control de FTC existente (anterior a Systemcore).
- **[Instalador Homebrew:](https://formulae.brew.sh/cask/advantagescope)** Un "cask" de Homebrew para instalar AdvantageScope desde la línea de comandos en macOS.
- **[Repositorio de usuarios de Arch:](https://aur.archlinux.org/packages/advantagescope)** Un método de distribución alternativo para usar con el administrador de paquetes pacman (una distribución oficial de Arch de AdvantageScope está disponible [aquí](#6328-downloads)).
