# AdvantageScope XR

O AdvantageScope XR traz a visualização do 👀 [Campo 3D](/tab-reference/3d-field) à vida em realidade aumentada, permitindo que você visualize dados de maneiras totalmente novas. Veja um autônomo simulado em tamanho real, revise a estratégia da partida com um modelo de campo de mesa, sobreponha informações de diagnóstico em um robô real e muito mais! O vídeo abaixo demonstra vários casos de uso para este recurso:

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/gWPhQyB66DQ" title="AdvantageScope XR: Feature Overview" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Requisitos

- **Hospedeiro (Host):** O aplicativo de desktop do AdvantageScope no Windows, macOS ou Linux (v4.1.0 ou posterior). Quaisquer firewalls no dispositivo devem ser [desativados](https://docs.wpilib.org/pt/stable/docs/networking/networking-introduction/windows-firewall-configuration.html#disabling-windows-firewall).
- **Cliente:** Um iPhone ou iPad executando o iOS/iPadOS 16 ou posterior. Nenhuma instalação de aplicativo é necessária.
- **Rede:** Ambos os dispositivos devem estar conectados à mesma rede (Wi-Fi, ancoragem USB, etc). Sujeito ao requisito abaixo, esta rede não precisa estar conectada à internet.
- **Internet:** Se o AdvantageScope XR não tiver sido usado recentemente, o dispositivo móvel deve ter uma conexão com a internet (por exemplo, dados móveis). Para eliminar este requisito, consulte a seção de [uso offline](#offline-usage) abaixo.

:::tip
O AdvantageScope XR é suportado em muitos modelos de iPhone e iPad, mas é mais estável em dispositivos com um **sensor LiDAR**. Isso inclui o iPhone Pro (a partir do iPhone 12 Pro) e o iPad Pro (primavera de 2020 ou posterior).
:::

<details>
<summary>E quanto a outras plataformas?</summary>

O AdvantageScope XR é suportado apenas no iOS e iPadOS. Não há planos imediatos para suportar plataformas alternativas. O aplicativo cliente requer integração estreita com APIs nativas para realidade aumentada, gravação de vídeo, renderização web e mais. O iOS e o iPadOS recebem prioridade de desenvolvimento e suporte por vários motivos:

- **Consistência:** O AdvantageScope XR é um aplicativo exigente. Enquanto os dispositivos Android variam amplamente em poder de processamento e recursos, o iPhone e o iPad oferecem uma experiência de desenvolvimento consistente entre gerações. Todos os dispositivos iOS e iPadOS recentes são poderosos o suficiente para executar o AdvantageScope XR, e dispositivos mais novos suportam recursos adicionais que o AdvantageScope pode utilizar (como LiDAR).

- **Disponibilidade:** O iPhone continua sendo o smartphone mais comum que os estudantes nos Estados Unidos provavelmente possuem ou têm acesso fácil através de colegas, e está mais amplamente disponível do que qualquer modelo de óculos de VR ou realidade mista. Suportar o iOS maximiza o número de usuários que têm acesso fácil ao AdvantageScope XR.

- **Suporte a tablets:** Os usuários podem se beneficiar da execução do AdvantageScope XR em um tablet, já que os tablets oferecem uma tela maior que é mais fácil de visualizar por várias pessoas ao mesmo tempo. O iPad é o tablet mais comumente usado no mundo todo, portanto, suportar o iPadOS torna a experiência em tablet o mais acessível possível.

</details>

## Configuração

1. No sistema hospedeiro, **clique no botão "XR"** em qualquer guia de campo 3D. Apenas uma sessão hospedeira de XR pode estar ativa ao mesmo tempo, portanto, clicar neste botão interromperá quaisquer outras sessões ativas.

<img src="/img/tab-reference/3d-field/xr-1.png" alt="XR button" height="450" />

2. A **janela de controles do XR** será aberta, com um código QR e [opções](#options) para personalizar a experiência de AR. Para cancelar a sessão de XR e desconectar quaisquer clientes, feche a janela de controles.

<img src="/img/tab-reference/3d-field/xr-2.png" alt="XR window" height="350" />

3. Escaneie o código QR usando o **aplicativo de câmera integrado** no dispositivo cliente. Nenhuma instalação de aplicativo é necessária.
4. Toque em "AdvantageScope XR" e depois em "Abrir" para **iniciar a experiência** e se conectar ao hospedeiro. Se solicitado, permita que o AdvantageScope XR acesse a **câmera e a rede local**.
5. Siga as instruções no dispositivo para **calibrar e posicionar o modelo do campo**.
6. Controle o modelo do campo normalmente usando o dispositivo hospedeiro, incluindo **reprodução de logs e transmissão ao vivo**. O estado do modelo do campo é exibido ao vivo no dispositivo cliente.
7. Para **gravar um vídeo** rapidamente, toque no ícone "Gravar" na parte superior da tela. Toque nele novamente para parar a gravação, depois edite e salve o clipe.

:::warning
Mapas de calor e velocidades de módulos Swerve ainda não estão disponíveis no XR. Todos os outros tipos de objetos são suportados.
:::

:::tip
O AdvantageScope XR é um aplicativo exigente e pode apresentar problemas de desempenho dependendo da complexidade da cena 3D. Considere usar modelos de robôs mais simples ou menos objetos, se necessário.
:::

## Opções {#options}

A janela de controles do XR apresenta várias opções que controlam como o modelo é exibido em realidade aumentada:

- **Calibração:**
  - Escolha _Miniatura_ para visualizar uma versão reduzida do campo, adequada para uso em mesas.
  - Escolha _Tamanho real_ para visualizar o campo com escala precisa, posicionado com base em uma barreira de campo real. Alternar entre _Aliança Azul_ e _Aliança Vermelha_ controla qual lado do campo é usado para calibração, mas o campo completo é visualizado em todos os casos.
- **Transmissão:**
  - Escolha _Suave_ para aplicações onde alguma latência é aceitável em troca de uma transmissão mais confiável, como simulação de rotinas autônomas ou reprodução de arquivos de log.
  - Escolha _Baixa latência_ para aplicações em tempo real onde alguma oscilação (jitter) é aceitável, como sobreposição de dados em um robô real ou pilotagem de um robô simulado no teleoperado.
- **Mostrar chão:** Exibe o modelo de tapete/piso plano sob o campo em vez de sobrepor em uma superfície real.
- **Mostrar campo:** Exibe o modelo do campo, incluindo a barreira do campo e elementos específicos do jogo. Objetos de [peças do jogo](/tab-reference/3d-field#game-piece-objects) personalizados são sempre exibidos.
- **Mostrar robôs:** Exibe os modelos de robôs, podendo ser desativado ao sobrepor dados em um robô real (como alvos de visão ou mecanismos 2D).

## Uso offline {#offline-usage}

O AdvantageScope XR não requer uma conexão com a internet. Para garantir que o aplicativo esteja disponível offline, baixe o AdvantageScope XR da App Store usando o link abaixo. Para se conectar ao aplicativo de desktop do AdvantageScope, escaneie o código QR usando o aplicativo de câmera do iOS ou toque no botão "Escanear" no aplicativo AdvantageScope XR.

[<img src="/img/tab-reference/3d-field/app-store.svg" alt="App Store" />](https://apps.apple.com/us/app/advantagescope-xr/id6739718081)

:::note
Mesmo ao executar sem uma conexão com a internet, os dispositivos hospedeiro e cliente **devem estar conectados à mesma rede** (como um robô, rede Wi-Fi personalizada ou via ancoragem USB).
:::
