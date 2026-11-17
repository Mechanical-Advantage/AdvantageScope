# ⚙️ Recursos personalizados {#custom-assets}

O AdvantageScope vem com um conjunto padrão de imagens planas de campo, modelos de campo 3D, modelos de robôs e layouts de joysticks. Os recursos mais simples (como os campos atemporais) já vêm incluídos na instalação inicial. Já os recursos detalhados (como os campos específicos de cada temporada) são baixados automaticamente em segundo plano quando o AdvantageScope está conectado à internet. Para acompanhar o status desses downloads, clique em `App`/`AdvantageScope` > `Status do download de recursos...`.

Se quiser adicionar suas próprias opções, você pode personalizar esse conjunto de recursos. Para abrir a pasta de recursos do usuário, clique em `App`/`AdvantageScope` > `Mostrar pasta de recursos`. Os formatos esperados para cada tipo estão descritos abaixo. Você também pode usar os conjuntos padrão de [recursos detalhados](https://github.com/Mechanical-Advantage/AdvantageScopeAssets/releases) e [recursos empacotados](https://github.com/Mechanical-Advantage/AdvantageScope/tree/main/bundledAssets) como referência.

:::tip
Para carregar recursos de outra pasta no computador, clique em `App`/`AdvantageScope` > `Usar pasta de recursos personalizada`. Selecione a _pasta pai_ que contém as subpastas de cada recurso. Isso permite manter seus recursos personalizados sob controle de versão junto com o código do robô.
:::

## Formato geral {#general-format}

Todos os recursos ficam guardados em pastas com o padrão de nome "TIPO_NOME". O NOME usado na pasta não aparece dentro do AdvantageScope. Os tipos aceitos são:

- "Field2d"
- "Field3d"
- "Robot"
- "Joystick"

:::info
Exemplos de nomes de pasta: "Field2d_2023Field", "Joystick_OperatorButtons" ou "Robot_Dozer".
:::

Dentro dessa pasta deve haver um arquivo chamado "config.json" e um ou mais arquivos de recurso, conforme descrito abaixo. O arquivo de configuração sempre traz o nome do recurso exibido no AdvantageScope, e esse nome precisa ser único dentro de cada tipo. Você também pode incluir um objeto "locales" mapeando códigos de idioma (como "es-419", "fr", "zh-CN") para traduções do nome. Se o idioma selecionado não estiver listado ou se "locales" for omitido, o AdvantageScope usa o "name" principal como padrão.

```json
{
  "name": string, // Nome padrão único, obrigatório para todos os tipos de recursos
  "locales": { [locale: string]: string } // Nomes localizados opcionais mapeando códigos de idioma (ex.: "es-419", "fr") para traduções
  ... // Configuração específica de cada tipo, descrita abaixo
}
```

## Modelos de robôs 3D {#3d-robot-models}

### Tutorial em vídeo {#video-tutorial}

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/unX1PsPi0VA" title="Configuring Custom Robot Models for AdvantageScope" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### Visão geral {#overview}

A pasta precisa conter um modelo chamado "model.glb". Arquivos CAD precisam ser convertidos para glTF; veja os detalhes [nesta página](gltf-convert). O arquivo de configuração deve seguir este formato:

```json
{
  "name": string // Nome único, obrigatório para todos os tipos de recursos
  "locales": { [locale: string]: string } // Traduções opcionais para o nome do recurso
  "isFTC": boolean // Define se o modelo é para campos da FTC em vez da FRC (padrão "false")
  "disableSimplification": boolean // Desativa a simplificação do modelo, opcional
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequência de rotações nos eixos x, y e z
  "position": [number, number, number] // Deslocamento de posição em metros, aplicado após a rotação
  "cameras": [ // Posições de câmeras fixas, pode ficar vazio
    {
      "name": string // Nome da câmera
      "locales": { [locale: string]: string } // Traduções opcionais para o nome da câmera
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequência de rotações nos eixos x, y e z
      "position": [number, number, number] // Deslocamento de posição em metros em relação ao robô, aplicado após a rotação
      "resolution": [number, number] // Resolução em pixels, usada para definir a proporção fixa da imagem
      "fov": number // Campo de visão horizontal em graus
    }
  ],
  "components": [...] // Veja "Componentes articulados"
}
```

O jeito mais simples de acertar os valores de posição e rotação é por tentativa e erro. Como as transformações são aplicadas na ordem rotação → posição, recomendamos ajustar a rotação primeiro.

:::info
O AdvantageScope simplifica a geometria dos modelos automaticamente para melhorar o desempenho, variando o nível de detalhe conforme o [modo de renderização](/tab-reference/3d-field#rendering-modes) selecionado. Se essa simplificação causar efeitos indesejados nos seus recursos personalizados, você tem duas saídas:

- Para impedir a remoção automática de uma malha (mesh) específica, inclua `NOSIMPLIFY` no nome da malha.
- Para desativar a simplificação de um modelo de robô inteiro, defina a opção `disableSimplification` como `true` na configuração.

:::

### Componentes articulados {#articulated-components}

:::warning
Configurar componentes articulados pode ser complexo e trabalhoso. Vale considerar o suporte a [`Mechanism2d` em 3D](/tab-reference/3d-field#2d-mechanisms) do AdvantageScope, que oferece um caminho bem mais direto para **visualizar mecanismos no campo 3D**.
:::

Modelos de robôs podem incluir componentes articulados para visualizar dados de mecanismos (confira os detalhes [aqui](/tab-reference/3d-field)). O modelo glTF base não deve conter esses componentes; cada parte móvel deve ser exportada como um arquivo glTF separado. Os arquivos dos componentes seguem o padrão "model_INDEX.glb", então o primeiro componente articulado seria "model_0.glb".

A configuração dos componentes fica no `config.json` do robô, dentro de um array na chave "components". Quando você não informa nenhuma pose de componente no AdvantageScope, os modelos aparecem na posição padrão usando as rotações e a posição do robô (descritas acima). Quando você informa poses de componentes, o AdvantageScope aplica as rotações e a posição "zeradas" para levar cada componente até a origem do robô e, depois, aplica as poses informadas para mover cada peça para o lugar certo no robô.

:::tip
Ao posicionar componentes 3D em relação ao robô, lembre-se de que a origem do sistema de coordenadas coincide com a pose publicada do robô. Em movimentação 2D típica, essa pose geralmente usa altura zero — ou seja, fica no plano do chão, e NÃO na base do chassi (bellypan).
:::

```json
"components": [
  {
    "zeroedRotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequência de rotações nos eixos x, y e z
    "zeroedPosition": [number, number, number] // Deslocamento de posição em metros em relação ao robô, aplicado após a rotação
  }
]
```

#### Processo de configuração {#setup-process}

Para calibrar as posições dos componentes articulados, recomendamos seguir este passo a passo:

1. Exporte o modelo base e os componentes nas posições "padrão" corretas — exatamente como eles devem aparecer caso nenhuma pose de componente seja informada no AdvantageScope.

2. No código do robô, publique uma pose 2D zerada e selecione-a como a pose do robô no AdvantageScope. Mude o campo 3D para a opção "Eixos", que mostra a origem do campo.

3. Ajuste as rotações gerais do robô (não dos componentes) até que o robô inteiro fique na orientação certa. Depois, ajuste a posição geral para alinhar o robô à origem. Os componentes devem continuar sendo exibidos nas mesmas posições padrão durante essa etapa.

4. Publique no código do robô um array de poses 3D zeradas com a mesma quantidade de componentes do modelo e selecione-o como o conjunto de poses dos componentes no AdvantageScope.

5. Para cada componente, ajuste primeiro as rotações e depois as posições até alinhá-lo à origem. Por exemplo, o segmento de um braço deve ficar com o pivô na origem e apontando para frente ao longo do eixo X.

6. Publique as poses reais dos componentes no código do robô, já tomando como base as novas origens definidas para cada peça. No exemplo do braço, a pose ficaria na articulação, apontando na direção do segmento.

## Joysticks {#joysticks}

A pasta precisa conter uma imagem chamada "image.png". O arquivo de configuração deve seguir este formato:

```json
{
  "name": string // Nome único, obrigatório para todos os tipos de recursos
  "locales": { [locale: string]: string } // Traduções opcionais para o nome do recurso
  "components": [...] // Array de configurações de componentes, veja abaixo
}
```

:::info
Botões, joysticks e valores de eixos aceitam tanto mapeamentos [SDL](https://www.libsdl.org) (usados pela atual FIRST Driver Station) quanto mapeamentos NI (usados pela antiga NI FRC Driver Station). Cada componente precisa ter pelo menos um conjunto de mapeamentos.

Para mapeamentos NI, o AdvantageScope mantém compatibilidade com as chaves antigas sem prefixo (como `sourceIndex`). **Todos os novos joysticks devem usar mapeamentos SDL explícitos (como `sdlSourceIndex`) para garantir compatibilidade com a atual FIRST Driver Station.**
:::

### Botão único / Valor POV {#single-button-pov-value}

```json
{
  "type": "button"
  "isYellow": boolean
  "isEllipse": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number
  "sdlSourcePov": string // Opcional, pode ser "up", "right", "down" ou "left". Se informado, "sdlSourceIndex" será o índice do POV a ser lido.

  // Mapeamentos alternativos para a NI Driver Station (opcional)
  "niSourceIndex": number
  "niSourcePov": string
}
```

### Joystick de dois eixos {#two-axis-joystick}

```json
{
  "type": "joystick" // Um joystick que se move em duas dimensões
  "isYellow": boolean
  "centerPx": [number, number]
  "radiusPx": number
  "sdlXSourceIndex": number
  "sdlXSourceInverted": boolean // Não invertido: direita = positivo
  "sdlYSourceIndex": number
  "sdlYSourceInverted": boolean // Não invertido: cima = positivo
  "sdlButtonSourceIndex": number // Opcional

  // Mapeamentos alternativos para a NI Driver Station (opcional)
  "niXSourceIndex": number
  "niXSourceInverted": boolean
  "niYSourceIndex": number
  "niYSourceInverted": boolean
  "niButtonSourceIndex": number
}
```

### Eixo único {#single-axis}

```json
{
  "type": "axis" // Um valor de eixo único
  "isYellow": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number,
  "sdlSourceRange": [number, number] // Mínimo maior que o máximo para inverter

  // Mapeamentos alternativos para a NI Driver Station (opcional)
  "niSourceIndex": number,
  "niSourceRange": [number, number]
}
```

### Touchpad {#touchpad}

```json
{
  "type": "touchpad" // Um touchpad
  "isYellow": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number,
}
```

## Imagens de campo planas {#flat-field-images}

A pasta deve conter uma imagem chamada "image.png", orientada com a aliança vermelha à esquerda. O arquivo de configuração deve seguir este formato:

```json
{
  "name": string // Nome único, obrigatório para todos os tipos de recursos
  "locales": { [locale: string]: string } // Traduções opcionais para o nome do recurso
  "isFTC": boolean // Define se este é um campo da FTC em vez da FRC
  "coordinateSystem": // O sistema de coordenadas padrão a ser usado (veja abaixo)
      "wall-alliance" |  // FRC 2022
      "wall-blue" |      // FRC 2023-2026
      "center-rotated" | // FTC tradicional
      "center-red"       // Systemcore
  "useGrid": boolean // Define se deve renderizar linhas de grade caso seja um campo da FTC (padrão "true")
  "sourceUrl": string // Link para o arquivo original, opcional
  "topLeft": [number, number] // Coordenada em pixels (origem no canto superior esquerdo)
  "bottomRight": [number, number] // Coordenada em pixels (origem no canto superior esquerdo)
  "widthInches": number // Largura real do campo (lado longo)
  "heightInches": number // Altura real do campo (lado curto)
}
```

## Modelos de campo 3D {#3d-field-models}

A pasta deve conter um modelo chamado "model.glb". Depois de aplicar todas as rotações, o campo deve ficar orientado com a aliança vermelha à esquerda. Arquivos CAD precisam ser convertidos para glTF; veja os detalhes [nesta página](gltf-convert). Os modelos das peças do jogo seguem o padrão "model_INDEX.glb" de acordo com a ordem em que aparecem no array "gamePieces". As AprilTags declaradas aqui são sempre posicionadas usando o sistema de coordenadas [centro/vermelho](/more-features/coordinate-systems#center-red), independentemente de qualquer outra opção de configuração.

O arquivo de configuração deve seguir este formato:

```json
{
  "name": string // Nome único, obrigatório para todos os tipos de recursos
  "locales": { [locale: string]: string } // Traduções opcionais para o nome do recurso
  "isFTC": boolean // Define se este é um campo da FTC em vez da FRC
  "coordinateSystem": // O sistema de coordenadas padrão a ser usado (veja abaixo)
      "wall-alliance" |  // FRC 2022
      "wall-blue" |      // FRC 2023-2026
      "center-rotated" | // FTC tradicional
      "center-red"       // Systemcore
  "useGrid": boolean // Define se deve renderizar linhas de grade caso seja um campo da FTC (padrão "true")
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequência de rotações nos eixos x, y e z
  "widthInches": number // Largura real do campo (lado longo)
  "heightInches": number // Altura real do campo (lado curto)
  "defaultOrigin": "auto" | "blue" | "red" // Posição padrão da origem, "auto" se não especificado
  "driverStations": [
    [number, number] // Posições da Driver Station (X e Y em metros em relação ao centro do campo)
    ...              // Para FRC, 6 elementos na ordem [B1, B2, B3, R1, R2, R3]. Para FTC, 4 elementos na ordem [BL, BR, RL, RR].
  ]
  "gamePieces": [ // Lista de tipos de peças do jogo
    {
      "name": string // Nome da peça do jogo
      "locales": { [locale: string]: string } // Traduções opcionais para o nome da peça do jogo
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequência de rotações nos eixos x, y e z
      "position": [number, number, number] // Deslocamento de posição em metros, aplicado após a rotação
      "stagedObjects": string[] // Nomes de objetos de peças do jogo já posicionados no modelo, para ocultar caso poses do usuário sejam fornecidas
    },
    ...
  ],
  "aprilTags": [ // Lista de modelos suplementares de AprilTag (se não fizerem parte do modelo do campo)
    "variant": string // Formato "FAMILY-SIZEin", onde "FAMILY" é "36h11" ou "16h5" e "SIZE" é o tamanho da parte preta
    "id": number
    "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequência de rotações nos eixos x, y e z
    "position": [number, number, number] // Deslocamento de posição em metros, aplicado após a rotação
  ]
}
```