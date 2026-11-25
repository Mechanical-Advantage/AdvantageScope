---
sidebar_position: 10
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ⚙️ Mecanismo {#mechanism}

A guia Mecanismo mostra uma representação articulada de subsistemas do robô — como braços, elevadores ou lançadores — criada a partir de um ou mais objetos [Mechanism2d](https://docs.wpilib.org/pt/stable/docs/software/dashboards/glass/mech2d-widget.html).

<img src="/img/tab-reference/mechanism-1.webp" alt="Visão geral da guia Mecanismo" />

_A interface em inglês é exibida acima._

<details>
<summary>Controles da linha do tempo</summary>

A linha do tempo serve para controlar a reprodução e navegar pelo log. Clique em qualquer ponto dela para selecionar um instante específico, ou clique com o botão direito para desmarcar. O momento escolhido fica sincronizado em todas as guias, facilitando encontrar exatamente o mesmo instante em outras visualizações.

As faixas coloridas mostram o estado do robô: amarelo para o período autônomo, azul para o teleoperado e cinza para o modo utility.

Para dar zoom, coloque o cursor sobre a linha do tempo e role para cima ou para baixo. Você também pode selecionar um trecho segurando `Shift` enquanto clica e arrasta. Para andar para os lados, use a rolagem horizontal (em dispositivos compatíveis) ou clique e arraste na própria linha do tempo. Quando estiver conectado ao vivo, rolar para a esquerda destrava a visualização do momento atual, e rolar tudo para a direita trava no tempo real de novo. Pressione `Ctrl+\` para ajustar o zoom exatamente para o período em que o robô ficou habilitado.

<img src="/img/tab-reference/timeline.webp" alt="Linha do tempo" />

</details>

## Adicionando mecanismos {#adding-mechanisms}

Para começar, arraste um campo `Mechanism2d` para o painel de controle. Se quiser remover um mecanismo, clique no botão X; para apenas escondê-lo temporariamente, clique no ícone de olho ou dê um duplo clique no nome dele. Para apagar tudo de uma vez, clique na lixeira ao lado do título e depois em `Limpar tudo`. Você também pode clicar e arrastar os itens para mudar a ordem na lista.

## Publicando dados {#publishing-data}

Para publicar dados de mecanismos, registre um objeto `Mechanism2d` periodicamente (mostrado abaixo). Vale lembrar que essa chamada grava apenas o estado atual do `Mechanism2d`, então ela precisa rodar em todo ciclo de loop logo após você atualizar as posições do mecanismo.

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
Mechanism2d mechanism = new Mechanism2d(3, 3);

periodic() {
  Telemetry.log("MyMechanism", mechanism);
}
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

```cpp
wpi::Mechanism2d mechanism{3, 3};

void Periodic() {
  wpi::telemetry::Log("MyMechanism", mechanism);
}
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
import wpilib
import telemetry

mechanism = wpilib.Mechanism2d(3, 3)

def periodic():
    telemetry.log("MyMechanism", mechanism)
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
LoggedMechanism2d mechanism = new LoggedMechanism2d(3, 3);

periodic() {
  Logger.recordOutput("MyMechanism", mechanism);
}
```

:::tip
Com a anotação [@AutoLogOutput](https://docs.advantagekit.org/data-flow/recording-outputs/annotation-logging) do AdvantageKit, você pode registrar o estado do mecanismo automaticamente a cada ciclo de loop sem precisar chamar `Logger.recordOutput`.
:::

</TabItem>
</Tabs>
