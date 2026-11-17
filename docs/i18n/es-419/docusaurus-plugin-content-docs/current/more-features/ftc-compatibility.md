---
sidebar_position: 1
---

# ✴️ Compatibilidad con FTC {#ftc-compatibility}

AdvantageScope ya incluye funciones para darte una experiencia fluida en el sistema de control actual de FIRST Tech Challenge, mientras prepara el terreno para la transición a [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) en futuras temporadas. A partir de la temporada 2027-2028, con la llegada de Systemcore, todas las funciones de AdvantageScope tendrán soporte oficial en FTC.

## Campos y robots {#fields-and-robots}

Los campos y modelos de robots de FTC tienen soporte nativo completo.

- **Modelos de campos y robots:** Elige campos y modelos de robots de FTC directamente desde los menús desplegables en las pestañas 🗺️ [Campo 2D](/tab-reference/2d-field) y 👀 [Campo 3D](/tab-reference/3d-field). Todos los campos funcionan con [AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr).
- **Sistemas de coordenadas:** Puedes configurar el [sistema de coordenadas](/more-features/coordinate-systems) en cualquier campo para que coincida con las [coordenadas estándar de FTC](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html). Los campos de FTC ya usan este sistema de forma predeterminada.

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

## Formatos compatibles {#supported-formats}

AdvantageScope soporta de forma nativa la transmisión en vivo de **FTC Dashboard** y los archivos `.log` de **Road Runner**, además de formatos de WPILib como WPILOG y NetworkTables.

Existen varias bibliotecas de telemetría y registro de terceros para FTC que generan datos compatibles con AdvantageScope. El equipo de desarrollo de AdvantageScope no avala ni recomienda ninguna solución en particular, y ten en cuenta que algunas pueden tener funciones limitadas.

Aquí tienes algunas opciones para empezar (aunque hay más):

- [**Road Runner**](https://rr.brott.dev/docs/v1-0/installation/): Genera archivos de registro para depurar la lógica de planificación de trayectorias.
- [**FTC Dashboard**](https://acmerobotics.github.io/ftc-dashboard/): Transmite telemetría en vivo compatible tanto con su propio panel como con AdvantageScope.
- [**FateWeaver**](https://github.com/HermesFTC/FateWeaver): Permite registrar datos personalizados en varios formatos, tanto en archivos de registro como en transmisión en vivo.
- [**Koala Log**](https://github.com/Koala-Log/Koala-Log): Guarda datos en formato WPILOG mediante anotaciones.
- **PsiKit**: Un framework de registro y reproducción para FTC inspirado en AdvantageKit.

:::warning
Recuerda cumplir con la regla R704 durante las competencias. El uso de servicios de telemetría de terceros, como FTC Dashboard, está prohibido cuando te conectas por Wi-Fi en un evento oficial.
:::

### AdvantageScope Lite para FTC {#advantagescope-lite-for-ftc}

Existe una distribución no oficial de [AdvantageScope Lite](/more-features/advantagescope-lite) optimizada para FTC: [**AdvantageScope Lite for REV Control System**](https://github.com/j5155/AdvantageScope-Lite-FTC). Como no es oficial, no cuenta con soporte de los desarrolladores de AdvantageScope.

Mientras que el [AdvantageScope Lite](/more-features/advantagescope-lite) estándar es una aplicación web pensada para Systemcore y la Driver Station de FIRST, esta versión modificada corre directamente en el sistema de control actual de FTC y permite ver datos en vivo por el protocolo de FTC Dashboard sin instalar software adicional.
