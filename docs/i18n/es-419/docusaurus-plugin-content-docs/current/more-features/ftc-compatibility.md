---
sidebar_position: 1
---

# ✴️ Compatibilidad con FTC {#ftc-compatibility}

AdvantageScope incluye funciones para brindar una experiencia fluida en el sistema de control actual de FIRST Tech Challenge, a la vez que prepara la transición a [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) en futuras temporadas. Todas las funciones de AdvantageScope serán compatibles oficialmente en FTC después de la transición a Systemcore a partir de la temporada 2027-2028.

## Campos y robots {#fields-and-robots}

Los campos y modelos de robots de FTC son compatibles de forma nativa.

- **Modelos de campos y robots:** Selecciona campos y modelos de robots de FTC en las pestañas 🗺️ [Campo 2D](/tab-reference/2d-field) y 👀 [Campo 3D](/tab-reference/3d-field) directamente desde los menús desplegables. Todos los campos son compatibles con [AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr).
- **Sistemas de coordenadas:** Configura el [sistema de coordenadas](/more-features/coordinate-systems) para compatibilidad con las [coordenadas estándar de FTC](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html) en cualquier campo. Este sistema de coordenadas se utiliza de forma predeterminada en los campos de FTC.

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

## Formatos compatibles {#supported-formats}

AdvantageScope incluye soporte nativo para el formato de transmisión en vivo de **FTC Dashboard** y los archivos `.log` de **Road Runner**, además de formatos compatibles con WPILib como WPILOG y NetworkTables.

Varias bibliotecas de telemetría y registro de FTC de terceros producen datos en formatos compatibles con AdvantageScope. Los desarrolladores de AdvantageScope no avalan ni recomiendan ninguna solución de registro particular de FTC, y es posible que encuentres capacidades limitadas al utilizar algunas soluciones de registro.

La lista a continuación proporciona un punto de partida, pero no es exhaustiva:

- [**Road Runner**](https://rr.brott.dev/docs/v1-0/installation/): Genera archivos de registro para depurar la lógica de planificación de trayectorias.
- [**FTC Dashboard**](https://acmerobotics.github.io/ftc-dashboard/): Transmite telemetría en vivo compatible tanto con su propio panel como con AdvantageScope.
- [**FateWeaver**](https://github.com/HermesFTC/FateWeaver): Permite el registro de datos personalizado en múltiples formatos, incluidos archivos de registro y transmisión en vivo.
- [**Koala Log**](https://github.com/Koala-Log/Koala-Log): Guarda datos en formato WPILOG utilizando anotaciones.
- **PsiKit**: Un marco de trabajo de registro y reproducción para FTC inspirado en AdvantageKit.

:::warning
Los equipos deben tener cuidado de cumplir con la regla R704 durante la competencia. Los servicios de telemetría de terceros, como FTC Dashboard, están prohibidos cuando se conectan mediante Wi-Fi en las competencias.
:::

### AdvantageScope Lite para FTC {#advantagescope-lite-for-ftc}

Está disponible una distribución no oficial de [AdvantageScope Lite](/more-features/advantagescope-lite) optimizada para FTC: [**AdvantageScope Lite for REV Control System**](https://github.com/j5155/AdvantageScope-Lite-FTC). Esta distribución no es oficial y no cuenta con el soporte de los desarrolladores de AdvantageScope.

Mientras que el [AdvantageScope Lite](/more-features/advantagescope-lite) estándar es una aplicación web diseñada para usarse en Systemcore y la Driver Station de FIRST, la distribución no oficial de FTC está específicamente modificada para usarse directamente en el sistema de control de FTC existente. Admite de forma nativa la visualización de datos en vivo a través del protocolo de FTC Dashboard sin necesidad de software adicional.
