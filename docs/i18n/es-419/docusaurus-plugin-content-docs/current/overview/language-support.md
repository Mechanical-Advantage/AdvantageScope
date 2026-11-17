---
sidebar_position: 5
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🌐 Soporte de idiomas {#language-support}

AdvantageScope está disponible en varios idiomas para ofrecer una experiencia adaptada a equipos de todo el mundo. Actualmente puedes usar cualquiera de los siguientes idiomas en la documentación, la aplicación de escritorio, las aplicaciones móviles (AdvantageScope XR y AdvantageTune) y AdvantageScope Lite (tanto en Systemcore como en la Driver Station de FIRST):

- Inglés (EE. UU.)
- Español (Latinoamérica)
- Francés
- Neerlandés
- Portugués (Brasil)
- Rumano
- Turco
- Ruso
- Kazajo
- Hebreo
- Árabe
- Hindi
- Chino simplificado
- Chino tradicional

## Configuración {#configuration}

Para cambiar el idioma en AdvantageScope, abre la ventana de preferencias en `App` > `Mostrar preferencias...` (Windows/Linux) o `AdvantageScope` > `Configuración...` (macOS). En la opción "Idioma", elige uno de la lista o selecciona "Predeterminado del sistema" para usar automáticamente el idioma de tu sistema operativo.

<img src="/img/prefs_es-419.webp" alt="Diagrama de preferencias" height="450" />

## Claves de registro {#logging-keys}

Todos los formatos compatibles con AdvantageScope soportan Unicode por completo al definir claves de registro. Esto significa que puedes guardar datos usando tu propio idioma —con tildes, eñes, caracteres especiales o alfabetos no latinos— y AdvantageScope los registrará y mostrará sin problemas.

Aquí tienes un ejemplo de cómo registrar una cadena de texto con una clave en español:

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Telemetry.log("Tracción/Velocidad del motor derecho", "Rápido");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Logger.recordOutput("Tracción/Velocidad del motor derecho", "Rápido");
```

</TabItem>
</Tabs>

:::tip Soporte de unidades
Consulta la página de [soporte de unidades](/tab-reference/line-graph/units) para ver cómo enviar metadatos de unidades. Ten en cuenta que los nombres de las unidades siempre deben escribirse usando símbolos del SI o en inglés (ortografía estadounidense o británica), sin importar el idioma que elijas en AdvantageScope.
:::

## Desarrollo {#development}

La traducción de AdvantageScope combina inteligencia artificial con el aporte de la comunidad. Como el proyecto avanza muy rápido, apoyarnos en la IA nos permite mantener sincronizadas la aplicación y la documentación en todos los idiomas, de modo que siempre tengas acceso a las nuevas funciones y actualizaciones al mismo tiempo, sin importar el idioma que uses.

Diseñamos este proceso para respetar la terminología, los anglicismos habituales y las expresiones que ya usan los equipos en su día a día. Aun así, las traducciones generadas por IA a veces suenan poco naturales o tienen imprecisiones. Si notas algo que se pueda mejorar, cuéntanos haciendo clic en el ícono morado dentro de la aplicación (disponible cuando usas cualquier idioma distinto del inglés).
