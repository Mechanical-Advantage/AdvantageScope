---
sidebar_position: 5
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🌐 Soporte de idiomas {#language-support}

AdvantageScope admite múltiples idiomas para brindar una experiencia localizada a equipos de todo el mundo. Los siguientes idiomas están disponibles actualmente:

- Inglés (EE. UU.)
- Español (Latinoamérica)
- Francés
- Portugués (Brasil)
- Turco
- Rumano
- Hebreo
- Kazajo
- Ruso
- Árabe
- Chino simplificado
- Chino tradicional

## Configuración {#configuration}

Para cambiar el idioma de visualización en AdvantageScope, abre la ventana de preferencias haciendo clic en `App` > `Mostrar preferencias...` (Windows/Linux) o `AdvantageScope` > `Configuración...` (macOS). En la configuración de "Idioma", puedes elegir entre la lista de idiomas compatibles o seleccionar "Predeterminado del sistema" para que coincida automáticamente con el idioma de tu sistema operativo.

<img src="/img/prefs_es-419.webp" alt="Diagrama de preferencias" height="450" />

## Claves de registro {#logging-keys}

Todos los formatos admitidos por AdvantageScope cuentan con compatibilidad total con Unicode al definir claves de registro. Esto significa que puedes registrar datos utilizando tu idioma nativo (incluidos acentos, caracteres especiales y alfabetos no latinos) y se registrarán y mostrarán correctamente en AdvantageScope.

Aquí tienes un ejemplo de cómo registrar una cadena de texto con una clave en español:

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
SmartDashboard.putString("Tracción/Velocidad del motor derecho", "Rápido");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Logger.recordOutput("Tracción/Velocidad del motor derecho", "Rápido");
```

</TabItem>
</Tabs>

:::tip Soporte de unidades
Consulta la página sobre [soporte de unidades](/tab-reference/line-graph/units) para obtener más detalles sobre la comunicación de metadatos de unidades. Los nombres de las unidades se deben proporcionar utilizando símbolos SI o inglés (ortografía estadounidense o británica), independientemente del idioma seleccionado en AdvantageScope.
:::

## Desarrollo {#development}

La localización de AdvantageScope está impulsada por una combinación de inteligencia artificial y colaboración comunitaria. Dado que AdvantageScope es un proyecto en rápida evolución, el uso de IA es esencial para mantener sincronizada la aplicación traducida y la documentación en todos los idiomas. Esto significa que las nuevas funciones y actualizaciones están siempre disponibles simultáneamente, independientemente del idioma que selecciones.

Para garantizar traducciones de la más alta calidad, nuestro proceso se basa en extensos materiales de referencia de hablantes nativos de la comunidad de FIRST para crear glosarios y pautas detalladas para cada idioma. Esto ayuda a que las traducciones coincidan con el vocabulario específico, los préstamos lingüísticos y las transliteraciones con las que los equipos locales están familiarizados.

Las traducciones fundamentales se generan de forma iterativa utilizando IA con supervisión humana sobre decisiones críticas (como las traducciones del vocabulario de FIRST). Estas traducciones luego son revisadas y perfeccionadas por hablantes nativos de la comunidad de FIRST para garantizar la precisión del texto resultante. Los usuarios también pueden proporcionar comentarios sobre las traducciones haciendo clic en el ícono morado en la aplicación (cuando está configurada para cualquier idioma que no sea inglés).
