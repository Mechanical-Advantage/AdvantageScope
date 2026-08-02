# ⚙️ Recursos personalizados {#custom-assets}

O AdvantageScope usa um conjunto padrão de imagens de campo planas, modelos de campo, modelos de robôs e configurações de joysticks. Recursos simples (por exemplo, campos evergreen) estão incluídos na instalação inicial. Recursos detalhados (por exemplo, campos específicos da temporada) são baixados automaticamente em segundo plano quando o AdvantageScope está conectado à internet. Para verificar o status desses downloads, clique em `App`/`AdvantageScope` > `Status do download de recursos...`.

O conjunto de recursos pode ser personalizado para adicionar mais opções, se desejado. Para abrir a pasta de recursos do usuário, clique em `App`/`AdvantageScope` > `Mostrar pasta de recursos`. Os formatos esperados para os recursos são definidos abaixo. Consulte o conjunto padrão de [recursos detalhados](https://github.com/Mechanical-Advantage/AdvantageScopeAssets/releases) e [recursos empacotados](https://github.com/Mechanical-Advantage/AdvantageScope/tree/main/bundledAssets) para referência.

:::tip
Para carregar recursos de um local alternativo, clique em `App`/`AdvantageScope` > `Usar pasta de recursos personalizada`. A pasta selecionada deve ser a _pasta pai_ onde múltiplos recursos em subpastas separadas podem ser colocados. Este recurso permite que recursos personalizados sejam armazenados sob controle de versão junto com o código do robô.
:::

## Formato geral {#general-format}

Todos os recursos são armazenados em pastas com a convenção de nomenclatura "TIPO_NOME". O NOME usado para a pasta não é exibido pelo AdvantageScope. Os tipos de recursos possíveis são:

- "Field2d"
- "Field3d"
- "Robot"
- "Joystick"

:::info
Exemplos de nomes de pastas seriam "Field2d_2023Field", "Joystick_OperatorButtons" ou "Robot_Dozer".
:::

Esta pasta deve conter um arquivo chamado "config.json" e um ou mais arquivos de recursos, conforme descrito abaixo. O arquivo de configuração sempre inclui o nome do recurso a ser exibido pelo AdvantageScope. Este nome deve ser exclusivo para cada tipo de recurso.

```json
{
  "name": string // Nome exclusivo, obrigatório para todos os tipos de recursos
  ... // Configuração dependente do tipo, descrita abaixo
}
```

## Modelos de robôs 3D {#3d-robot-models}

### Tutorial em vídeo {#video-tutorial}

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/unX1PsPi0VA" title="Configuring Custom Robot Models for AdvantageScope" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### Visão geral {#overview}

Um modelo deve ser incluído na pasta com o nome "model.glb". Arquivos CAD devem ser convertidos para glTF; consulte [esta página](gltf-convert) para mais detalhes. O arquivo de configuração deve estar no seguinte formato:

```json
{
  "name": string // Nome exclusivo, obrigatório para todos os tipos de recursos
  "isFTC": boolean // Se o modelo é destinado ao uso em campos do FTC em vez de campos da FRC (padrão "false")
  "disableSimplification": boolean // Se deve desativar a simplificação do modelo, opcional
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequência de rotações ao longo dos eixos x, y e z
  "position": [number, number, number] // Deslocamento de posição em metros, aplicado após a rotação
  "cameras": [ // Posições de câmeras fixas, pode ser vazio
    {
      "name": string // Nome da câmera
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequência de rotações ao longo dos eixos x, y e z
      "position": [number, number, number] // Deslocamento de posição em metros relativo ao robô, aplicado após a rotação
      "resolution": [number, number] // Resolução em pixels, usada para definir a proporção de imagem fixa
      "fov": number // Campo de visão horizontal em graus
    }
  ],
  "components": [...] // Veja "Componentes articulados"
}
```

A maneira mais simples de determinar valores apropriados de posição e rotação é por tentativa e erro. Recomendamos ajustar a rotação antes da posição, pois as transformações são aplicadas nesta ordem.

:::info
O AdvantageScope simplifica a geometria do modelo automaticamente para melhorar o desempenho, onde o nível de detalhe depende do [modo de renderização](/tab-reference/3d-field#rendering-modes) selecionado. Em casos onde a simplificação do modelo produz efeitos indesejados com recursos personalizados, duas soluções podem ser usadas:

- Para desativar a remoção automática de uma malha (mesh) específica, inclua a string `NOSIMPLIFY` no nome da malha.
- Para desativar a simplificação do modelo para um modelo de robô inteiro, defina a opção `disableSimplification` na configuração como `true`.

:::

### Componentes articulados {#articulated-components}

:::warning
A configuração de componentes articulados pode ser complexa e demorada. Considere utilizar o suporte a `Mechanism2d` 3D do AdvantageScope ([docs](/tab-reference/3d-field#2d-mechanisms)), que oferece uma abordagem mais simplificada para **visualizar mecanismos no campo 3D**.
:::

Modelos de robôs podem conter componentes articulados para visualizar dados de mecanismos (consulte [aqui](/tab-reference/3d-field) para detalhes). O modelo glTF base não deve incluir componentes, e cada componente deve ser exportado como um modelo glTF separado. Os modelos de componentes seguem a convenção de nomenclatura "model_INDEX.glb", portanto o primeiro componente articulado seria "model_0.glb"

A configuração do componente é fornecida no arquivo de configuração do robô. Um array de componentes deve ser fornecido sob a chave "components". Quando nenhuma pose de componente for fornecida pelo usuário no AdvantageScope, os modelos dos componentes serão posicionados usando as rotações e a posição padrão do robô (veja acima). Quando poses de componentes forem fornecidas pelo usuário, as rotações e a posição "zeradas" serão aplicadas para trazer cada componente para a origem do robô. As poses do usuário são então aplicadas para mover cada componente para o local correto no robô.

:::tip
Ao posicionar componentes 3D em relação ao robô, a origem do sistema de coordenadas corresponde à pose publicada do robô. Observe que esta pose geralmente usa uma altura de zero, que é o plano do chão e NÃO a base interna do robô (bellypan) (para movimento 2D típico do robô).
:::

```json
"components": [
  {
    "zeroedRotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequência de rotações ao longo dos eixos x, y e z
    "zeroedPosition": [number, number, number] // Deslocamento de posição em metros relativo ao robô, applied após a rotação
  }
]
```

#### Processo de configuração {#setup-process}

Para calibrar as posições dos componentes articulados, recomendamos o seguinte processo:

1. Exporte o modelo base e os componentes em suas posições "padrão" corretas. É assim que eles devem ser renderizados se nenhuma pose de componente for fornecida no AdvantageScope.

2. Publique uma pose 2D zerada no código do robô, depois selecione-a como a pose do robô no AdvantageScope. Alterne para o campo 3D "Eixos", que mostra a origem do campo.

3. Ajuste as rotações gerais do robô (não dos componentes) até que todo o robô esteja orientado corretamente. Em seguida, ajuste a posição geral para trazer todo o robô para a origem. Os componentes devem ser renderizados nas mesmas posições padrão durante todo esse processo.

4. Publique um array de poses 3D zeradas a partir do código do robô correspondente ao número de componentes no modelo, depois selecione-o como o conjunto de poses dos componentes no AdvantageScope.

5. Ajuste as rotações, seguidas pelas posições, para cada componente até que estejam alinhados à origem. Por exemplo, um segmento de braço seria alinhado com o pivô na origem enquanto apontado para frente ao longo do eixo X.

6. Publique as poses reais dos componentes a partir do código do robô, que serão baseadas nas origens recém-definidas para cada componente. Por exemplo, a pose para um segmento de braço seria posicionada na articulação do braço apontada na direção do segmento.

## Joysticks {#joysticks}

Uma imagem deve ser incluída na pasta com o nome "image.png". O arquivo de configuração deve estar no seguinte formato:

```json
{
  "name": string // Nome exclusivo, obrigatório para todos os tipos de recursos
  "components": [...] // Array de configurações de componentes, veja abaixo
}
```

:::info
Botões, joysticks e valores de eixos suportam tanto associações (bindings) [SDL](https://www.libsdl.org) (usadas pela Driver Station atual da FIRST) quanto associações NI (usadas pela antiga Driver Station da NI FRC). Pelo menos um conjunto de associações deve ser fornecido para cada componente.

Para associações NI, o AdvantageScope é compatível com as antigas chaves de configuração sem prefixo (por exemplo, `sourceIndex`). **Todos os novos joysticks devem usar associações SDL explícitas (por exemplo, `sdlSourceIndex`) para compatibilidade com a Driver Station atual da FIRST.**
:::

### Botão único / Valor de POV {#single-button-pov-value}

```json
{
  "type": "button"
  "isYellow": boolean
  "isEllipse": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number
  "sdlSourcePov": string // Opcional, pode ser "up", "right", "down" ou "left". Se fornecido, "sdlSourceIndex" será o índice do POV a ser lido.

  // Associações alternativas para a Driver Station da NI (opcional)
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

  // Associações alternativas para a Driver Station da NI (opcional)
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

  // Associações alternativas para a Driver Station da NI (opcional)
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

Uma imagem deve ser incluída na pasta com o nome "image.png". Ela deve ser orientada com a aliança vermelha à esquerda. O arquivo de configuração deve estar no seguinte formato:

```json
{
  "name": string // Nome exclusivo, obrigatório para todos os tipos de recursos
  "isFTC": boolean // Se este é um campo do FTC em vez de um campo da FRC
  "coordinateSystem": // O sistema de coordenadas padrão a ser usado (veja abaixo)
      "wall-alliance" |  // FRC 2022
      "wall-blue" |      // FRC 2023-2026
      "center-rotated" | // FTC tradicional
      "center-red"       // Systemcore
  "useGrid": boolean // Se deve renderizar linhas de grade se este campo for do FTC (padrão "true")
  "sourceUrl": string // Link para o arquivo original, opcional
  "topLeft": [number, number] // Coordenada em pixels (origem no canto superior esquerdo)
  "bottomRight": [number, number] // Coordenada em pixels (origem no canto superior esquerdo)
  "widthInches": number // Largura real do campo (lado longo)
  "heightInches": number // Altura real do campo (lado curto)
}
```

## Modelos de campo 3D {#3d-field-models}

Um modelo deve ser incluído na pasta com o nome "model.glb". Após todas as rotações serem aplicadas, o campo deve estar orientado com a aliança vermelha à esquerda. Arquivos CAD devem ser convertidos para glTF; consulte [esta página](gltf-convert) para mais detalhes. Os modelos de peças do jogo seguem a convenção de nomenclatura "model_INDEX.glb" com base na ordem em que aparecem no array "gamePieces". AprilTags declaradas aqui são sempre posicionadas usando um sistema de coordenadas [centro/vermelho](/more-features/coordinate-systems#center-red), independentemente de quaisquer outras opções de configuração.

O arquivo de configuração deve estar no seguinte formato:

```json
{
  "name": string // Nome exclusivo, obrigatório para todos os tipos de recursos
  "isFTC": boolean // Se este é um campo do FTC em vez de um campo da FRC
  "coordinateSystem": // O sistema de coordenadas padrão a ser usado (veja abaixo)
      "wall-alliance" |  // FRC 2022
      "wall-blue" |      // FRC 2023-2026
      "center-rotated" | // FTC tradicional
      "center-red"       // Systemcore
  "useGrid": boolean // Se deve renderizar linhas de grade se este campo for do FTC (padrão "true")
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequência de rotações ao longo dos eixos x, y e z
  "widthInches": number // Largura real do campo (lado longo)
  "heightInches": number // Altura real do campo (lado curto)
  "defaultOrigin": "auto" | "blue" | "red" // Local da origem padrão, "auto" se não especificado
  "driverStations": [
    [number, number] // Posições das estações de piloto (X e Y em metros relativos ao centro do campo)
    ...              // Para FRC, 6 elementos ordenados [B1, B2, B3, R1, R2, R3]. Para FTC, 4 elementos ordenados [BL, BR, RL, RR].
  ]
  "gamePieces": [ // Lista de tipos de peças do jogo
    {
      "name": string // Nome da peça do jogo
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequência de rotações ao longo dos eixos x, y e z
      "position": [number, number, number] // Deslocamento de posição em metros, aplicado após a rotação
      "stagedObjects": string[] // Nomes de objetos de peças do jogo dispostos, a ocultar se poses do usuário forem fornecidas
    },
    ...
  ],
  "aprilTags": [ // Lista de modelos de AprilTag suplementares (se não fizerem parte do modelo do campo)
    "variant": string // Formato como "FAMILY-SIZEin" onde "FAMILY" é "36h11" ou "16h5" e "SIZE" é o comprimento da seção preta
    "id": number
    "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequência de rotações ao longo dos eixos x, y e z
    "position": [number, number, number] // Deslocamento de posição em metros, aplicado após a rotação
  ]
}
```
