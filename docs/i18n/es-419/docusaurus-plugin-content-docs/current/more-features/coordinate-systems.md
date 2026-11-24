---
sidebar_position: 4
---

# 📐 Sistemas de coordenadas {#coordinate-systems}

AdvantageScope es compatible con varios sistemas de coordenadas comunes en las pestañas [🗺️ Campo 2D](/tab-reference/2d-field) y [👀 Campo 3D](/tab-reference/3d-field). Si quieres conocer más a fondo las convenciones de ejes y rotación que usa AdvantageScope, consulta la [documentación de sistemas de coordenadas de WPILib](https://docs.wpilib.org/es/stable/docs/software/basic-programming/coordinate-system.html#wpilib-coordinate-system).

### Personalización {#customization}

De forma predeterminada, AdvantageScope elige el sistema de coordenadas automáticamente según la imagen o el modelo de campo que selecciones. Si prefieres usar un sistema distinto en todos los campos, abre la ventana de preferencias desde `App` > `Mostrar preferencias...` (Windows/Linux) o `AdvantageScope` > `Configuración...` (macOS) y cambia la opción "Sistema de coordenadas".

:::tip
Todas las opciones de sistemas de coordenadas funcionan tanto en campos de FRC como de FTC.
:::

## Centro/rojo (Systemcore) {#center-red}

El origen está en el centro del campo y el eje +X apunta en dirección contraria a la pared de la alianza roja, como ves abajo. **Este es el sistema de coordenadas predeterminado para los campos de FRC a partir de 2027 y los de FTC desde la temporada 2027-2028.**

<img src="/img/more-features/coordinate-system-center-red.webp" alt="Sistema de coordenadas centro/rojo" />

## Pared azul {#blue-wall}

El origen está en la esquina derecha de la pared de la alianza azul y el eje +X apunta hacia la pared de la alianza roja, como ves abajo. **Este es el sistema de coordenadas predeterminado para los campos de FRC de 2023 a 2026.**

<img src="/img/more-features/coordinate-system-blue-wall.webp" alt="Sistema de coordenadas pared azul" />

## Pared de la alianza {#alliance-wall}

El origen está en la esquina derecha de la pared de la alianza _actual del robot_ y el eje +X apunta hacia la pared opuesta, como ves abajo. **Este es el sistema de coordenadas predeterminado para FRC en 2022.**

<img src="/img/more-features/coordinate-system-alliance-wall.webp" alt="Sistema de coordenadas pared de alianza" />

## Centro/rotado {#center-rotated}

El origen está en el centro del campo y el eje +X apunta hacia la derecha desde la perspectiva de la pared de la alianza roja, como ves abajo. **Este es el sistema de coordenadas predeterminado para los campos de FTC de 2024-2025 a 2026-2027.**

<img src="/img/more-features/coordinate-system-center-rotated.webp" alt="Sistema de coordenadas centro/rotado" height="400" />
