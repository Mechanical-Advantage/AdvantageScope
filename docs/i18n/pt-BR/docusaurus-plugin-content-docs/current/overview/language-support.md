---
sidebar_position: 5
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🌐 Suporte a idiomas {#language-support}

O AdvantageScope oferece suporte a vários idiomas para proporcionar uma experiência localizada a equipes do mundo inteiro. Os seguintes idiomas estão disponíveis atualmente na documentação, no aplicativo para desktop, nos aplicativos móveis (AdvantageScope XR e AdvantageTune) e no AdvantageScope Lite (no Systemcore e na FIRST Driver Station):

- Inglês (EUA)
- Espanhol (América Latina)
- Francês
- Holandês
- Português (Brasil)
- Romeno
- Turco
- Russo
- Cazaque
- Hebraico
- Árabe
- Hindi
- Chinês simplificado
- Chinês tradicional

## Configuração {#configuration}

Para mudar o idioma do AdvantageScope, abra a janela de preferências clicando em `App` > `Mostrar preferências...` (Windows/Linux) ou `AdvantageScope` > `Configurações...` (macOS). Na opção "Idioma", escolha um dos idiomas disponíveis ou selecione "Padrão do sistema" para acompanhar automaticamente o idioma do seu sistema operacional.

<img src="/img/prefs_pt-BR.webp" alt="Diagrama de preferências" height="450" />

## Chaves de log {#logging-keys}

Todos os formatos compatíveis com o AdvantageScope têm suporte completo a Unicode na definição de chaves de log. Isso significa que você pode registrar dados no seu idioma (incluindo acentos, caracteres especiais e alfabetos não latinos) e tudo será gravado e exibido normalmente no AdvantageScope.

Veja um exemplo de registro de texto usando uma chave em português:

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Telemetry.log("Tração/Velocidade do motor direito", "Rápido");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Logger.recordOutput("Tração/Velocidade do motor direito", "Rápido");
```

</TabItem>
</Tabs>

:::tip Suporte a unidades
Consulte a página sobre [suporte a unidades](/tab-reference/line-graph/units) para ver mais detalhes sobre como informar metadados de unidade. Os nomes das unidades precisam ser escritos usando símbolos do SI ou em inglês (ortografia americana ou britânica), independentemente do idioma escolhido no AdvantageScope.
:::

## Desenvolvimento {#development}

A localização do AdvantageScope é feita combinando inteligência artificial e colaboração da comunidade. Como o projeto evolui muito rápido, o uso de IA é essencial para manter o aplicativo e a documentação sincronizados em todos os idiomas — assim, novos recursos e atualizações chegam ao mesmo tempo, qualquer que seja o idioma escolhido.

Nosso processo busca respeitar o vocabulário, os termos em inglês adotados no dia a dia e as expressões que as equipes locais já usam. Ainda assim, traduções geradas por IA às vezes trazem frases pouco naturais ou pequenas imprecisões. Se você notar algo estranho, seu feedback é muito bem-vindo: basta clicar no ícone roxo dentro do aplicativo (quando ele estiver em qualquer idioma diferente do inglês).
