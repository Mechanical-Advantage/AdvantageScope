# Suporte a unidades {#unit-support}

A guia de gráfico de linha é consciente de unidades, o que significa que valores numéricos podem ser facilmente convertidos entre tipos de unidades compatíveis. Quando informações de unidade estão disponíveis, todos os valores numéricos também são rotulados com precisão quando exibidos nos eixos ou legendas. Veja [aqui](#supported-formats) para mais informações sobre publicação de informações de unidades. O AdvantageScope fornece várias ferramentas para converter rapidamente entre unidades:

- Ao adicionar **campos no mesmo eixo com tipos de unidades compatíveis**, o AdvantageScope converte automaticamente ambos os campos para a mesma unidade. Isso se reflete na rotulagem do eixo Y e da legenda.
- Clique nos três pontos perto do título do eixo para **alternar rapidamente para unidades alternativas**. Esta lista inclui as unidades mais comuns que são compatíveis com os campos selecionados.
- Habilite a **integração ou diferenciação** ([docs](/tab-reference/line-graph/#integration-and-differentiation)) para ver as unidades de integral ou derivada precisas. A unidade base pode ser ajustada usando o menu para suportar filtragem em unidades não nativas.

<img src="/img/tab-reference/line-graph/units-1.webp" alt="Gráficos cientes de unidade" />

_A interface em inglês é exibida acima._

## Formatos suportados {#supported-formats}

O AdvantageScope suporta vários métodos para fornecer informações de unidade sobre cada campo. As unidades mais comuns são suportadas; para uma lista completa, consulte o menu pop-up ao configurar a [conversão manual](#manual-conversion).

Para (2) e (3), os tipos de unidades são analisados usando strings. O AdvantageScope suporta múltiplos nomes para cada unidade, incluindo abreviações comuns (por exemplo, `ft` e `feet` são ambos aceitos) e grafias em inglês americano e britânico (por exemplo, `meters` e `metres`). Observe que os nomes das unidades devem ser fornecidos usando símbolos SI ou inglês, independentemente do idioma selecionado no AdvantageScope. Se um nome de unidade não estiver sendo analisado como esperado, por favor [abra um problema](https://github.com/Mechanical-Advantage/AdvantageScope/issues).

:::tip
Não tem certeza se as unidades estão sendo analisadas corretamente? Verifique se um tipo de unidade é exibido no eixo Y ao adicionar um campo ao gráfico de linha.
:::

### 🥇 Unidades em Structs {#struct-units}

O AdvantageScope usa automaticamente as unidades nativas para tipos de dados estruturados comuns como `Rotation2d` e `Translation3d`. Publicar valores aplicáveis usando esses formatos é **sempre a melhor maneira de publicar dados** e garante a máxima compatibilidade ao visualizar dados de geometria.

### 🥈 Metadados do campo {#field-metadata}

Os formatos WPILOG e NetworkTables suportam a publicação de "metadados" adicionais para cada campo. O AdvantageScope procura por campos JSON chamados "unit" ou "units" contendo um nome em string para o tipo de unidade (usando espaços, camel-case, pascal-case ou snake-case). Para verificar os metadados de cada campo, passe o cursor sobre o nome do campo na barra lateral.

:::tip
O AdvantageKit inclui suporte para metadados de unidades ao registrar entradas e saídas, incluindo registro de anotações. Consulte a documentação [aqui](https://docs.advantagekit.org/data-flow/supported-types#units) para mais detalhes.
:::

### 🥉 Nomenclatura dos campos {#field-naming}

Como alternativa final, o AdvantageScope tenta determinar o tipo de unidade correto analisando o nome de cada campo. **O tipo de unidade deve ser incluído como um sufixo.** O AdvantageScope suporta uma variedade de esquemas de nomenclatura. Algumas opções válidas estão listadas abaixo:

- **Camel/pascal-case**, como `PositionMeters`, `velocityRadPerSec` e `TimestampS`
- **Snake-case**, como `position_meters`, `velocity_rad_per_sec` e `timestamp_s`
- **Separadores de espaço**, como `position meters`, `velocity rad per sec` e `timestamp s`

A nomenclatura _não_ diferencia maiúsculas de minúsculas ao usar snake-case ou separadores de espaço.

:::tip
Se as unidades forem analisadas incorretamente, clique em `Unidades manuais` > `Desativar unidades automáticas` para ignorar as informações de unidade. A conversão manual pode então ser usada para alternar para unidades alternativas.
:::

## Conversão manual {#manual-conversion}

Quando metadados de unidades estiverem indisponíveis ou forem imprecisos, os eixos também podem ser configurados manualmente para converter entre unidades (ou ignorar metadados de unidades inteiramente).

Para configurar a conversão manual, clique nos três pontos perto do título do eixo e depois em `Unidades manuais` > `Editar conversão...`. Selecione o tipo de unidade, a unidade de origem e a unidade de destino. Cada valor também é multiplicado pelo "Fator extra", permitindo conversões personalizadas (como proporções de transmissão/redução, conversões angulares para lineares ou outras unidades não fornecidas pelo AdvantageScope). O fator também pode ser inserido usando uma expressão matemática como `1,5*pi`.

:::tip
Para habilitar ou desabilitar rapidamente a conversão de unidades, clique nos três pontos perto do título do eixo e escolha `Predefinições recentes` ou `Redefinir unidades`.
:::

<img src="/img/tab-reference/line-graph/units-2.webp" alt="Editando conversão de unidades" height="250" />

_A interface em inglês é exibida acima._
