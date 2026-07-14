---
sidebar_position: 3
---

# 📐 Sistemas de coordenadas

AdvantageScope incluye soporte para varios sistemas de coordenadas comunes en las pestañas [🗺️ Campo 2D](/tab-reference/2d-field) y [👀 Campo 3D](/tab-reference/3d-field). Consulta la [documentación de sistemas de coordenadas de WPILib](https://docs.wpilib.org/en/stable/docs/software/basic-programming/coordinate-system.html#wpilib-coordinate-system) para obtener más información sobre las convenciones de ejes y rotación utilizadas por AdvantageScope.

### Personalización

De forma predeterminada, el sistema de coordenadas se selecciona automáticamente en función de la imagen/modelo de campo elegido. Para seleccionar un sistema de coordenadas diferente para usar en todos los campos, abre la ventana de preferencias haciendo clic en `Aplicación` > `Mostrar preferencias...` (Windows/Linux) o `AdvantageScope` > `Configuración...` (macOS) y cambia la opción "Sistema de coordenadas" (Coordinate System).

:::tip
Todas las opciones del sistema de coordenadas son compatibles con los campos de FRC y FTC.
:::

## Centro/rojo (Systemcore) {#centerred-systemcore}

El origen está en el centro del campo con el eje +X mirando en dirección opuesta a la pared de la alianza roja, como se muestra a continuación. **Este es el sistema de coordenadas predeterminado para los campos de FRC a partir de 2027 y los campos de FTC a partir de 2027-2028.**

<img src="/img/more-features/coordinate-system-center-red.png" alt="Sistema de coordenadas centro/rojo" />

## Pared azul

El origen está en la esquina más a la derecha de la pared de la alianza azul con el eje +X mirando hacia la pared de la alianza roja, como se muestra a continuación. **Este es el sistema de coordenadas predeterminado para los campos de FRC de 2023 a 2026.**

<img src="/img/more-features/coordinate-system-blue-wall.png" alt="Sistema de coordenadas de pared azul" />

## Pared de la alianza

El origen está en la esquina más a la derecha de la pared de la alianza para la _alianza actual del robot_ con el eje +X mirando hacia la pared de la alianza opuesta, como se muestra a continuación. **Este es el sistema de coordenadas predeterminado para FRC en 2022.**

<img src="/img/more-features/coordinate-system-alliance-wall.png" alt="Sistema de coordenadas de pared de la alianza" />

## Centro/rotado

El origen está en el centro del campo con el eje +X apuntando hacia la derecha desde la perspectiva de la pared de la alianza roja, como se muestra a continuación. **Este es el sistema de coordenadas predeterminado para los campos de FTC de 2024-2025 a 2026-2027.**

<img src="/img/more-features/coordinate-system-center-rotated.png" alt="Sistema de coordenadas centro/rotado" height="400" />
