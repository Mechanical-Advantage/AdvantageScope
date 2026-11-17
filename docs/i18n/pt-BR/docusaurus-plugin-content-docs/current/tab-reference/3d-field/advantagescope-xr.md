# AdvantageScope XR {#advantagescope-xr}

O AdvantageScope XR leva a visualização do 👀 [Campo 3D](/tab-reference/3d-field) para a realidade aumentada, abrindo várias formas novas de analisar os dados do robô. Você pode assistir a um autônomo simulado em tamanho real, discutir estratégia da partida com uma maquete da arena em cima da mesa, sobrepor informações de diagnóstico diretamente no robô real e muito mais! O vídeo abaixo mostra alguns exemplos do que dá para fazer com esse recurso:

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/gWPhQyB66DQ" title="AdvantageScope XR: Feature Overview" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Requisitos {#requirements}

- **Computador (Host):** O aplicativo de desktop do AdvantageScope no Windows, macOS ou Linux (v4.1.0 ou mais recente). Os firewalls do computador precisam estar [desativados](https://docs.wpilib.org/pt/stable/docs/networking/networking-introduction/windows-firewall-configuration.html#disabling-windows-firewall).
- **Dispositivo móvel (Cliente):** Um iPhone ou iPad com iOS/iPadOS 16 ou mais recente. Você não precisa instalar nenhum aplicativo.
- **Rede:** Os dois aparelhos precisam estar na mesma rede (Wi-Fi, ancoragem USB, etc.). Fora o caso explicado no item abaixo, essa rede não precisa ter acesso à internet.
- **Internet:** Se o AdvantageScope XR não tiver sido usado recentemente no celular ou tablet, ele precisará de conexão com a internet (por exemplo, dados móveis) na primeira abertura. Para evitar depender disso, veja a seção de [uso offline](#offline-usage) mais abaixo.

:::tip
O AdvantageScope XR funciona em vários modelos de iPhone e iPad, mas fica bem mais estável em aparelhos com **sensor LiDAR** — como o iPhone Pro (a partir do iPhone 12 Pro) e o iPad Pro (a partir de 2020).
:::

<details>
<summary>E quanto a outras plataformas?</summary>

O AdvantageScope XR funciona apenas no iOS e iPadOS, e por enquanto não há planos imediatos para outras plataformas. O cliente precisa de uma integração muito próxima com APIs nativas de realidade aumentada, gravação de vídeo, renderização web e outros recursos. O iOS e o iPadOS recebem prioridade por alguns motivos:

- **Consistência:** O AdvantageScope XR exige bastante processamento. Enquanto aparelhos Android variam muito em potência e recursos, o iPhone e o iPad oferecem uma base muito parecida entre gerações. Todos os dispositivos iOS e iPadOS recentes dão conta de rodar o AdvantageScope XR, e os mais novos ainda trazem recursos extras que o aplicativo aproveita (como o sensor LiDAR).

- **Disponibilidade:** Nos Estados Unidos, o iPhone é o celular mais comum entre os estudantes ou fácil de pegar emprestado com alguém da equipe, sendo bem mais acessível do que óculos de VR ou realidade mista. Dar suporte ao iOS permite que mais pessoas consigam usar o AdvantageScope XR sem complicação.

- **Suporte a tablets:** Rodar o AdvantageScope XR em um tablet é ótimo porque a tela maior facilita para várias pessoas acompanharem juntas. Como o iPad é o tablet mais usado no mundo, o suporte ao iPadOS torna essa experiência mais acessível.

</details>

## Configuração {#setup}

1. No computador, **clique no botão "XR"** em qualquer guia Campo 3D. Só é possível manter uma sessão XR ativa por vez, então clicar nesse botão encerra qualquer outra sessão que já esteja aberta.

<img src="/img/tab-reference/3d-field/xr-1.webp" alt="Botão XR" height="450" />

_A interface em inglês é exibida acima._

2. A janela **Controles de XR** vai abrir com um QR code e [opções](#options) para ajustar a experiência em realidade aumentada. Quando quiser encerrar a sessão XR e desconectar os aparelhos, basta fechar essa janela.

<img src="/img/tab-reference/3d-field/xr-2.webp" alt="Janela Controles de XR" height="350" />

_A interface em inglês é exibida acima._

3. Aponte a **câmera nativa** do iPhone ou iPad para o QR code. Não é preciso instalar nada antes.
4. Toque em "AdvantageScope XR" e depois em "Abrir" para **iniciar a sessão** e conectar ao computador. Se o sistema pedir permissão, libere o acesso à **câmera e à rede local**.
5. Siga as instruções na tela do aparelho para **calibrar e posicionar o campo**.
6. Controle tudo normalmente pelo computador, seja **reproduzindo um log ou acompanhando dados ao vivo**. Tudo o que acontece no campo aparece em tempo real no celular ou tablet.
7. Se quiser **gravar um vídeo** rápido, toque no ícone de gravação no topo da tela. Toque de novo para parar, edite se precisar e salve o clipe.

:::warning
Mapas de calor e velocidades dos módulos Swerve ainda não estão disponíveis no XR. Todos os outros tipos de objetos já funcionam normalmente.
:::

:::tip
O AdvantageScope XR é um recurso pesado e pode perder desempenho se a cena 3D estiver muito carregada. Se notar travamentos, experimente usar um modelo de robô mais simples ou exibir menos objetos ao mesmo tempo.
:::

## Opções {#options}

Na janela Controles de XR, você encontra várias opções para ajustar como o campo aparece em realidade aumentada:

- **Calibração:**
  - Escolha _Miniatura_ para ver uma versão reduzida da arena, ideal para colocar em cima de uma mesa.
  - Escolha _Tamanho real_ para ver a arena em escala 1:1, alinhada a partir de uma barreira real do campo. Alternar entre _Aliança Azul_ e _Aliança Vermelha_ muda qual lado do campo você usa como referência na calibração, mas a arena inteira aparece nos dois casos.
- **Transmissão:**
  - Escolha _Suave_ quando um pequeno atraso não atrapalhar e você quiser uma transmissão mais estável, como ao simular rotinas autônomas ou reproduzir logs.
  - Escolha _Baixa latência_ quando precisar de resposta imediata (mesmo com alguma oscilação visual), como ao sobrepor dados em um robô real ou pilotar um robô simulado no teleoperado.
- **Mostrar chão:** Exibe o modelo plano do piso/tapete embaixo do campo em vez de sobrepor diretamente na superfície real.
- **Mostrar campo:** Exibe o modelo da arena, incluindo as barreiras e os elementos do jogo. Os objetos personalizados de [peças do jogo](/tab-reference/3d-field#game-piece-objects) aparecem sempre, mesmo com essa opção desligada.
- **Mostrar robôs:** Exibe os modelos dos robôs. Você pode desativar essa opção quando estiver sobrepondo dados em um robô físico (como alvos de visão ou mecanismos 2D).

## Uso offline {#offline-usage}

O AdvantageScope XR não precisa de internet para funcionar. Para garantir que ele esteja disponível mesmo sem conexão, baixe o aplicativo AdvantageScope XR na App Store pelo link abaixo. Depois, para conectar ao AdvantageScope no computador, escaneie o QR code com a câmera do iOS ou toque no botão "Escanear" dentro do próprio app.

[<img src="/img/tab-reference/3d-field/app-store.svg" alt="App Store" />](https://apps.apple.com/us/app/advantagescope-xr/id6739718081)

:::note
Mesmo offline, o computador e o dispositivo móvel **precisam estar na mesma rede** (como a rede do robô, um Wi-Fi próprio ou via ancoragem USB).
:::
