---
sidebar_position: 1
---

# Modo de ajuste (tuning)

Algumas fontes ao vivo suportam o ajuste ao vivo de valores numéricos e booleanos. Por exemplo, este recurso pode ser usado para [ajustar ganhos de controladores](https://docs.wpilib.org/pt/stable/docs/software/advanced-controls/introduction/tutorial-intro.html) quando conectado a uma fonte NetworkTables. Observe que o código do robô deve suportar o recebimento de ganhos via NetworkTables.

Por padrão, todos os valores no AdvantageScope são somente leitura. Para alternar o modo de ajuste, **clique no ícone de controle deslizante** à direita da barra de pesquisa quando conectado a uma fonte ao vivo suportada. Quando o ícone estiver roxo, o modo de ajuste estará ativo e a edição de campos estará habilitada.

- Para editar um **campo numérico**, insira um novo valor usando a caixa de texto à direita do campo na barra lateral. O valor é publicado depois que a entrada é desmarcada ou a tecla "Enter" é pressionada. Deixe a caixa de texto em branco para usar o valor publicado pelo robô.
- Para alternar um **campo booleano**, clique no círculo vermelho ou verde à direita do campo na barra lateral.

:::warning
Este recurso não destina-se a controlar o robô no campo. Entradas no estilo dashboard, como seletores (choosers), botões de gatilho, etc. não são suportadas.
:::

## Ajuste com AdvantageKit

Campos publicados pelo AdvantageKit na subtabela `AdvantageKit` são apenas de saída e não podem ser editados. No entanto, os usuários podem publicar campos a partir do código do usuário que são ajustáveis no AdvantageScope. **Quaisquer campos publicados na tabela "/Tuning" no NetworkTables aparecerão sob a tabela "Tuning" ao usar a fonte ao vivo "NetworkTables (AdvantageKit)".**

Por exemplo, um número ajustável pode ser publicado usando a classe [`LoggedNetworkNumber`](https://docs.advantagekit.org/data-flow/recording-inputs/dashboard-inputs):

```java
LoggedNetworkNumber tunableNumber = new LoggedNetworkNumber("/Tuning/MyTunableNumber", 0.0);
```

:::warning
A subtabela `NetworkInputs` **não pode ser editada**, pois é usada pelo AdvantageKit para registrar valores de rede para log e reprodução. Use a tabela `Tuning` para interagir com entradas de rede em tempo real.
:::
