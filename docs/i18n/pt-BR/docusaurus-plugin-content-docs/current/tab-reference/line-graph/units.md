# Suporte a unidades {#unit-support}

A guia Gráfico de linha tem suporte a unidades, o que significa que ela converte valores numéricos entre unidades compatíveis com facilidade. Quando o campo tem informação de unidade, os valores nos eixos e nas legendas já aparecem rotulados corretamente. Veja [aqui](#supported-formats) como publicar informações de unidade no seu código. O AdvantageScope oferece vários recursos para trabalhar com unidades:

- Ao colocar **campos com unidades compatíveis no mesmo eixo**, o AdvantageScope converte ambos automaticamente para a mesma unidade, atualizando os rótulos do eixo Y e da legenda.
- Clique nos três pontinhos ao lado do título do eixo para **alternar rapidamente entre unidades**. A lista mostra as unidades mais comuns compatíveis com os campos selecionados.
- Ative a **integração ou diferenciação** ([documentação](/tab-reference/line-graph/#integration-and-differentiation)) para ver as unidades exatas da integral ou da derivada. Você pode ajustar a unidade base pelo menu para aplicar o filtro em unidades diferentes da original.

<img src="/img/tab-reference/line-graph/units-1.webp" alt="Gráficos com suporte a unidades" />

_A interface em inglês é exibida acima._

## Formatos suportados {#supported-formats}

O AdvantageScope aceita várias formas de informar a unidade de cada campo. A maioria das unidades comuns já é suportada; para ver a lista completa, abra o menu suspenso ao configurar a [conversão manual](#manual-conversion).

Nos métodos (2) e (3), as unidades são identificadas a partir de textos (strings). O AdvantageScope reconhece vários nomes para cada unidade, incluindo abreviações comuns (por exemplo, `ft` e `feet`) e grafias do inglês americano e britânico (`meters` e `metres`). Atenção: os nomes das unidades devem usar símbolos do SI ou termos em inglês, independentemente do idioma escolhido no AdvantageScope. Se alguma unidade não for reconhecida como esperado, [abra uma issue](https://github.com/Mechanical-Advantage/AdvantageScope/issues).

:::tip
Não tem certeza se as unidades estão sendo reconhecidas? Adicione o campo ao gráfico de linha e confira se o tipo de unidade aparece no eixo Y.
:::

### 🥇 Unidades em structs {#struct-units}

O AdvantageScope usa automaticamente as unidades nativas para tipos de dados estruturados comuns, como `Rotation2d` e `Translation3d`. Sempre que possível, publicar valores nesses formatos é **a melhor escolha**, garantindo total compatibilidade ao visualizar dados de geometria.

### 🥈 Metadados do campo {#field-metadata}

Os formatos WPILOG e NetworkTables permitem publicar "metadados" extras para cada campo. O AdvantageScope procura campos JSON chamados "unit" ou "units" com uma string indicando a unidade (separada por espaços, camel-case, pascal-case ou snake-case). Para conferir os metadados de um campo, passe o cursor sobre o nome dele na barra lateral.

:::tip
Na WPILib, registrar objetos `Measure` com `Telemetry.log()` anexa os metadados de unidade automaticamente. Você também pode configurá-los de forma explícita usando `Telemetry.setProperty("fieldName", "unit", "\"volts\"")`.

O AdvantageKit também suporta metadados de unidade ao registrar entradas e saídas (veja os detalhes [aqui](https://docs.advantagekit.org/data-flow/supported-types#units)).
:::

### 🥉 Nomenclatura dos campos {#field-naming}

Como última alternativa, o AdvantageScope tenta identificar a unidade analisando o nome de cada campo. **A unidade precisa aparecer como um sufixo.** Vários padrões de nomenclatura são aceitos, como nos exemplos abaixo:

- **Camel/pascal-case**: `PositionMeters`, `velocityRadPerSec` e `TimestampS`
- **Snake-case**: `position_meters`, `velocity_rad_per_sec` e `timestamp_s`
- **Separadores com espaço**: `position meters`, `velocity rad per sec` e `timestamp s`

Ao usar snake-case ou separadores com espaço, a identificação _não_ diferencia maiúsculas de minúsculas.

:::tip
Se alguma unidade for identificada incorretamente, clique em `Unidades manuais` > `Desativar unidades automáticas` para ignorar a detecção automática. Depois, você pode usar a conversão manual para escolher a unidade desejada.
:::

## Conversão manual {#manual-conversion}

Quando os metadados de unidade não estão disponíveis ou estão incorretos, você também pode configurar os eixos manualmente para converter unidades (ou ignorar os metadados por completo).

Para configurar a conversão manual, clique nos três pontinhos ao lado do título do eixo e selecione `Unidades manuais` > `Editar conversão...`. Escolha o tipo de unidade, a unidade de origem e a unidade de destino. Cada valor também é multiplicado pelo "Fator extra", o que permite conversões personalizadas (como relações de transmissão, conversões de angular para linear ou outras unidades que não estão na lista do AdvantageScope). Você também pode digitar o fator como uma expressão matemática, como `1.5*pi`.

:::tip
Para ativar ou desativar rapidamente uma conversão de unidades, clique nos três pontinhos ao lado do título do eixo e escolha `Predefinições recentes` ou `Redefinir unidades`.
:::

<img src="/img/tab-reference/line-graph/units-2.webp" alt="Editando conversão de unidades" height="250" />

_A interface em inglês é exibida acima._
