---
sidebar_position: 7
---

# 🎬 Vídeo {#video}

A guia Vídeo permite comparar os dados do log lado a lado com a gravação da partida. Veja abaixo como carregar um vídeo e sincronizá-lo com o log.

## Carregando o vídeo {#loading-the-video}

O AdvantageScope oferece três formas de carregar um vídeo:

1. **Arquivo local:** Clique no ícone cinza de arquivo e escolha o vídeo no seu computador. A maioria dos formatos comuns funciona sem problemas.
2. **YouTube:** Copie o link do YouTube para a área de transferência e clique no ícone vermelho de prancheta. Depois de alguns segundos, o vídeo começa a ser baixado.
3. **The Blue Alliance:** Clique no ícone azul do TBA para buscar automaticamente o vídeo da partida com base no arquivo de log. Se houver mais de um vídeo disponível, escolha qual deseja baixar no menu suspenso. Esse recurso exige uma chave de API do TBA, que você pode gerar em [thebluealliance.com/account](https://www.thebluealliance.com/account) e colar nas preferências do AdvantageScope, no campo "Chave de API do TBA".

<img src="/img/tab-reference/video-1.webp" alt="Seletor de fonte" />

Depois de escolher o vídeo, a linha do tempo no canto inferior direito começa a ficar azul para indicar os quadros que já foram carregados em cache (isso garante uma reprodução fluida). Como todos os quadros precisam ser convertidos, esse recurso foi pensado apenas para vídeos com duração de partida.

:::warning
O download de vídeos do YouTube e do TBA pode falhar inesperadamente por causa de mudanças nos servidores do YouTube. Se isso acontecer, tente atualizar o AdvantageScope ou usar um arquivo de vídeo local.
:::

:::info
O AdvantageScope precisa do [FFmpeg](https://ffmpeg.org) para processar arquivos de vídeo. Se não encontrar uma cópia válida do FFmpeg no PATH do sistema, ele perguntará se você quer baixar o FFmpeg da internet na primeira vez que carregar um vídeo. A instalação automática só funciona no Windows e no macOS; no Linux, pode ser necessário instalar o FFmpeg manualmente e adicioná-lo ao PATH do sistema.
:::

## Navegando pelo vídeo {#navigating-the-video}

Logo depois de carregar um vídeo, antes de sincronizá-lo com o log, os controles de reprodução do vídeo e do log funcionam de forma independente. Use a linha do tempo e os botões no canto inferior direito para controlar o vídeo, ou use os atalhos de teclado abaixo:

- / = reproduzir/pausar
- → = avançar um quadro
- ← = voltar um quadro
- \> = avançar cinco segundos
- < = voltar cinco segundos

<img src="/img/tab-reference/video-2.webp" alt="Controles de vídeo" />

## Sincronização automática {#automatic-synchronization}

A maioria dos vídeos de partidas sincroniza sozinha com o log logo após carregar os quadros do período autônomo. Você não precisa fazer nada: se a sincronização der certo, os controles do vídeo travam automaticamente (veja "Reprodução" abaixo).

:::warning
A sincronização automática só funciona em vídeos de partidas que tenham o placar (overlay de pontuação) na tela e pode falhar em alguns casos. Se os controles do vídeo não travarem sozinhos depois que todos os quadros carregarem, você precisará fazer a sincronização manual.
:::

## Sincronização manual {#manual-synchronization}

Primeiro, use os controles do vídeo para ir até um ponto conhecido da partida, como o início do autônomo. Em seguida, selecione no arquivo de log o instante correspondente àquele quadro do vídeo.

:::tip
O cursor na linha do tempo gruda automaticamente no início e no fim dos períodos da partida, facilitando marcar com precisão o começo do jogo.
:::

Quando o vídeo e o log estiverem alinhados, clique no ícone de cadeado ao lado da linha do tempo do vídeo (ou pressione **↑ ou ↓**). Os controles do vídeo ficarão desativados. Clique no cadeado novamente se quiser destravar a reprodução do vídeo.

<img src="/img/tab-reference/video-3.webp" alt="Botão de bloqueio" />

## Reprodução {#playback}

Com o vídeo travado, a reprodução acompanha o instante selecionado no log. Vale lembrar que o vídeo fica sem áudio, pois o arquivo original é convertido quadro a quadro para permitir a sincronização com o log.

<details>
<summary>Controles da linha do tempo</summary>

A linha do tempo controla a reprodução e a visualização. Clique na linha do tempo para selecionar um instante e clique com o botão direito para desmarcar. O instante selecionado fica sincronizado em todas as guias, facilitando encontrar o mesmo ponto em outras visualizações.

Faixas amarelas indicam o período autônomo; faixas azuis, o teleoperado; e faixas cinzas, o modo utility.

Para dar zoom, posicione o cursor sobre a linha do tempo e role para cima ou para baixo. Você também pode selecionar um intervalo clicando e arrastando com a tecla `Shift` pressionada. Para navegar para a esquerda e para a direita, role horizontalmente (em dispositivos compatíveis) ou clique e arraste a linha do tempo. Quando estiver conectado ao vivo, rolar para a esquerda destrava o acompanhamento do tempo atual, e rolar tudo para a direita trava novamente no tempo atual. Pressione `Ctrl+\` para dar zoom no trecho em que o robô está habilitado.

<img src="/img/tab-reference/timeline.webp" alt="Linha do tempo" />

</details>

:::tip
Se quiser, você pode ajustar o FOV da câmera na visualização Campo 3D para combinar com o ângulo do vídeo. Veja mais detalhes em "Opções de câmera" na página 👀 [Campo 3D](/tab-reference/3d-field).
:::

<img src="/img/tab-reference/video-4.webp" alt="Captura de vídeo com odometria" />
