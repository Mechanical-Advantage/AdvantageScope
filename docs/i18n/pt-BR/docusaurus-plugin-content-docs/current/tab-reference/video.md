---
sidebar_position: 7
---

# 🎬 Vídeo {#video}

A guia de vídeo permite que os dados de log sejam comparados lado a lado com um vídeo da partida gravado separadamente. As etapas abaixo mostram como carregar um vídeo e sincronizá-lo com o log.

## Carregando o vídeo {#loading-the-video}

O AdvantageScope oferece três opções para carregar um vídeo:

1. **Arquivo local:** Clique no ícone de arquivo cinza, depois escolha o arquivo de vídeo a ser carregado. A maioria dos formatos de vídeo comuns é suportada.
2. **YouTube:** Copie um link do YouTube para a área de transferência, depois clique no ícone de prancheta vermelho. Após alguns segundos, o vídeo começará a ser baixado.
3. **The Blue Alliance:** Clique no ícone azul do TBA para carregar automaticamente o vídeo da partida com base no arquivo de log. Se múltiplos vídeos estiverem disponíveis, escolha o vídeo a ser baixado no menu pop-up. Este recurso requer uma chave de API para o TBA, que deve ser obtida em [thebluealliance.com/account](https://www.thebluealliance.com/account) e copiada para a página de preferências do AdvantageScope sob "Chave de API do TBA".

<img src="/img/tab-reference/video-1.png" alt="Source chooser" />

Após escolher um vídeo, a linha do tempo no canto inferior direito começa a ficar azul para indicar os quadros que foram armazenados em cache (esta etapa é necessária para uma reprodução suave). Este recurso destina-se apenas a vídeos de duração de partida devido à conversão de quadros necessária.

:::warning
O download de vídeos do YouTube e do TBA pode falhar inesperadamente devido a alterações nos servidores do YouTube. Em caso de problemas, tente atualizar o AdvantageScope ou usar um arquivo de vídeo local.
:::

:::info
O AdvantageScope requer o [FFmpeg](https://ffmpeg.org) para processar arquivos de vídeo. Se uma cópia válida do FFmpeg não for encontrada no PATH do seu sistema, o AdvantageScope solicitará o download do FFmpeg da internet ao carregar um vídeo pela primeira vez. A instalação automática do FFmpeg é suportada apenas no Windows e macOS; usuários de Linux podem precisar instalar o FFmpeg manualmente e adicioná-lo ao PATH do sistema.
:::

## Navegando pelo vídeo {#navigating-the-video}

Quando um vídeo é carregado inicialmente e ainda não foi sincronizado com os dados do log, os controles de reprodução do vídeo e do log continuam independentes. Use a linha do tempo e os botões no canto inferior direito para controlar a reprodução do vídeo. Os seguintes atalhos de teclado também são suportados:

- / = alternar reprodução
- → = avançar um quadro
- ← = voltar um quadro
- \> = avançar cinco segundos
- < = voltar cinco segundos

<img src="/img/tab-reference/video-2.png" alt="Video controls" />

## Sincronização automática {#automatic-synchronization}

A maioria dos vídeos de partidas será sincronizada automaticamente com o log logo após os quadros para o período autônomo da partida serem carregados. Nenhuma ação é necessária; se a sincronização for bem-sucedida, os controles do vídeo serão bloqueados automaticamente (veja "Reprodução" abaixo).

:::warning
A sincronização automática funciona apenas em vídeos de partidas que incluem overlays de pontuação e pode não ser bem-sucedida em todos os casos. Se os controles do vídeo não forem bloqueados automaticamente assim que todos os quadros forem carregados, a sincronização manual será necessária.
:::

## Sincronização manual {#manual-synchronization}

Primeiro, use os controles do vídeo para navegar até um local conhecido na partida, como o início do autônomo. Em seguida, selecione o tempo no arquivo de log que se alinha com o quadro atual do vídeo.

:::tip
O cursor na linha do tempo se encaixa no início e no fim dos períodos da partida, tornando mais fácil selecionar com precisão o início da partida.
:::

Assim que o vídeo e o log estiverem alinhados, clique no ícone de cadeado ao lado da linha do tempo do vídeo (ou pressione **↑ ou ↓**). Os controles do vídeo agora estão desativados. Clique no ícone de cadeado novamente para desbloquear a reprodução do vídeo.

<img src="/img/tab-reference/video-3.png" alt="Lock button" />

## Reprodução {#playback}

Uma vez bloqueada, a reprodução do vídeo permanece alinhada com o tempo selecionado no log. Observe que a reprodução de som não é suportada, pois o vídeo original é convertido em uma representação quadro a quadro para suportar a sincronização de logs.

<details>
<summary>Controles da linha do tempo</summary>

A linha do tempo é usada para controlar a reprodução e a visualização. Clicar na linha do tempo seleciona um tempo, e clicar com o botão direito desmarca. O tempo selecionado é sincronizado em todas as guias, tornando fácil encontrar rapidamente esse local em outras visualizações.

Seções amarelas indicam quando o robô está em autônomo, seções azuis indicam quando o robô está teleoperado e seções cinzas indicam quando o robô está no modo utility.

Para dar zoom, posicione o cursor sobre a linha do tempo e role para cima ou para baixo. Um intervalo também pode ser selecionado clicando e arrastando enquanto mantém `Shift` pressionado. Mova para a esquerda e para a direita rolando horizontalmente (em dispositivos suportados) ou clicando e arrastando na linha do tempo. Quando conectado ao vivo, rolar para a esquerda desbloqueia do tempo atual, e rolar totalmente para a direita bloqueia no tempo atual novamente. Pressione `Ctrl+\` para dar zoom no período em que o robô está habilitado.

<img src="/img/tab-reference/timeline.png" alt="Timeline" />

</details>

:::tip
Se desejado, o FOV da câmera pode ser ajustado na visualização de campo 3D para corresponder à aparência do vídeo. Para mais detalhes, consulte "Opções de câmera" na página do 👀 [Campo 3D](/tab-reference/3d-field).
:::

<img src="/img/tab-reference/video-4.png" alt="Video snapshot with odometry" />
