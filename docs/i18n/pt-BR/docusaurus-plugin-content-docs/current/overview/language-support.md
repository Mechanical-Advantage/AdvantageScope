---
sidebar_position: 5
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🌐 Suporte a idiomas {#language-support}

O AdvantageScope suporta múltiplos idiomas para fornecer uma experiência localizada para equipes do mundo todo. Os seguintes idiomas estão disponíveis no momento:

- Inglês (EUA)
- Espanhol (América Latina)
- Francês
- Português (Brasil)
- Turco
- Romeno
- Hebraico
- Cazaque
- Russo
- Árabe
- Chinês Simplificado
- Chinês Tradicional

## Configuração {#configuration}

Para alterar o idioma de exibição no AdvantageScope, abra a janela de preferências clicando em `App` > `Mostrar Preferências...` (Windows/Linux) ou `AdvantageScope` > `Configurações...` (macOS). Sob a configuração "Idioma", você pode escolher na lista de idiomas suportados ou selecionar "Padrão do Sistema" para corresponder automaticamente ao idioma do seu sistema operacional.

<img src="/img/prefs_pt-BR.webp" alt="Diagrama de preferências" height="350" />

## Chaves de log {#logging-keys}

Todos os formatos suportados pelo AdvantageScope possuem compatibilidade total com Unicode ao definir chaves de log. Isso significa que você pode registrar dados usando seu idioma nativo (incluindo acentos, caracteres especiais e alfabetos não latinos) e eles serão devidamente gravados e exibidos no AdvantageScope.

Aqui está um exemplo de gravação de uma string com uma chave em português:

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
SmartDashboard.putString("Tração/Velocidade do motor direito", "Rápido");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Logger.recordOutput("Tração/Velocidade do motor direito", "Rápido");
```

</TabItem>
</Tabs>

:::tip Suporte a unidades
Consulte a página sobre [suporte a unidades](/tab-reference/line-graph/units) para mais detalhes sobre a comunicação de metadados de unidade. Os nomes das unidades devem ser fornecidos usando símbolos SI ou em inglês (ortografia americana ou britânica), independentemente do idioma selecionado no AdvantageScope.
:::

## Desenvolvimento {#development}

A localização do AdvantageScope é impulsionada por uma combinação de inteligência artificial e colaboração comunitária. Como o AdvantageScope é um projeto em rápida evolução, a utilização de IA é essencial para manter o aplicativo traduzido e a documentação sincronizados em todos os idiomas. Isso significa que novos recursos e atualizações estão sempre disponíveis simultaneamente, independentemente do idioma selecionado.

Para garantir traduções da mais alta qualidade, nosso processo depende de extensos materiais de referência de falantes nativos da comunidade FIRST para construir glossários e diretrizes detalhadas para cada idioma. Isso ajuda as traduções a corresponderem ao vocabulário específico, estrangeirismos e transliterações com os quais as equipes locais estão familiarizadas.

As traduções fundamentais são geradas iterativamente usando IA com supervisão humana sobre escolhas críticas (como termos de vocabulário da FIRST). Essas traduções são então revisadas e refinadas por falantes nativos da comunidade FIRST para garantir a precisão do texto resultante. Os usuários também podem fornecer feedback sobre as traduções clicando no ícone roxo no aplicativo (quando configurado para qualquer idioma além do inglês).
