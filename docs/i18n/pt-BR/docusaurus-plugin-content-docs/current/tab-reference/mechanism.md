---
sidebar_position: 10
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ⚙️ Mecanismo

A guia de mecanismo exibe um mecanismo articulado criado com um ou mais objetos [Mechanism2d](https://docs.wpilib.org/pt/stable/docs/software/dashboards/glass/mech2d-widget.html).

<img src="/img/tab-reference/mechanism-1.png" alt="Overview of mechanism tab" />

<details>
<summary>Controles da linha do tempo</summary>

A linha do tempo é usada para controlar a reprodução e a visualização. Clicar na linha do tempo seleciona um tempo, e clicar com o botão direito desmarca. O tempo selecionado é sincronizado em todas as guias, tornando fácil encontrar rapidamente esse local em outras visualizações.

Seções amarelas indicam quando o robô está em autônomo, seções azuis indicam quando o robô está teleoperado e seções cinzas indicam quando o robô está no modo utility.

Para dar zoom, posicione o cursor sobre a linha do tempo e role para cima ou para baixo. Um intervalo também pode ser selecionado clicando e arrastando enquanto mantém `Shift` pressionado. Mova para a esquerda e para a direita rolando horizontalmente (em dispositivos suportados) ou clicando e arrastando na linha do tempo. Quando conectado ao vivo, rolar para a esquerda desbloqueia do tempo atual, e rolar totalmente para a direita bloqueia no tempo atual novamente. Pressione `Ctrl+\` para dar zoom no período em que o robô está habilitado.

<img src="/img/tab-reference/timeline.png" alt="Timeline" />

</details>

## Adicionando mecanismos

Para começar, arraste um `Mechanism2d` para o painel de controle. Exclua um mecanismo usando o botão X ou oculte-o temporariamente clicando no ícone de olho ou dando um duplo clique no nome do campo. Para remover todos os mecanismos, clique na lixeira perto do título do eixo e depois em `Limpar tudo`. Os mecanismos podem ser reorganizados na lista clicando e arrastando.

## Publicando dados

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

Para publicar dados de mecanismo usando a WPILib, envie um objeto `Mechanism2d` para o NetworkTables (mostrado abaixo). Se o logging de dados estiver habilitado, os mecanismos também poderão ser visualizados com base no arquivo WPILOG gerado.

```java
Mechanism2d mechanism = new Mechanism2d(3, 3);
SmartDashboard.putData("MyMechanism", mechanism);
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

Para publicar dados de mecanismo usando o AdvantageKit, registre um `Mechanism2d` como um campo de saída (mostrado abaixo). Observe que esta chamada apenas registra o estado atual do `Mechanism2d`, portanto deve ser chamada a cada ciclo de loop após o objeto ser atualizado.

```java
LoggedMechanism2d mechanism = new LoggedMechanism2d(3, 3);
Logger.recordOutput("MyMechanism", mechanism);
```

</TabItem>
</Tabs>
