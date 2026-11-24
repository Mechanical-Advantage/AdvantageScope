---
sidebar_position: 1
---

# Modo de ajuste (tuning) {#tuning-mode}

Algumas fontes ao vivo permitem ajustar valores numéricos e booleanos em tempo real. Você pode usar esse recurso, por exemplo, para [ajustar ganhos de controladores](https://docs.wpilib.org/pt/stable/docs/software/advanced-controls/introduction/tutorial-intro.html) quando estiver conectado a uma fonte NetworkTables. Lembre-se de que o código do robô precisa estar preparado para receber esses ganhos via NetworkTables.

Por padrão, todos os valores no AdvantageScope são somente leitura. Para ativar ou desativar o modo de ajuste, **clique no ícone de controles deslizantes** à direita da barra de pesquisa quando estiver conectado a uma fonte ao vivo compatível. Quando o ícone ficar roxo, o modo de ajuste está ativo e a edição dos campos fica liberada.

- Para editar um **campo numérico**, digite o novo valor na caixa de texto à direita do campo na barra lateral. O valor é publicado assim que você sai da caixa ou pressiona a tecla "Enter". Deixe a caixa em branco para voltar a usar o valor publicado pelo robô.
- Para alternar um **campo booleano**, clique no círculo vermelho ou verde à direita do campo na barra lateral.
- Para copiar todos os valores publicados para a área de transferência, **clique com o botão direito no ícone de controles deslizantes** e selecione **"Copiar valores ajustados"**.

:::warning
Este recurso não foi feito para controlar o robô em campo. Elementos típicos de dashboard, como seletores (choosers), botões de acionamento, etc., não são suportados.
:::

## Ajuste com o AdvantageKit {#tuning-with-advantagekit}

Os campos publicados pelo AdvantageKit na subtabela `AdvantageKit` são apenas de saída e não podem ser editados. Mesmo assim, você pode publicar no seu código campos que podem ser ajustados pelo AdvantageScope. **Qualquer campo publicado na tabela "/Tuning" do NetworkTables aparecerá na tabela "Tuning" ao usar a fonte ao vivo "NetworkTables (AdvantageKit)".**

Por exemplo, você pode publicar um número ajustável usando a classe [`LoggedNetworkNumber`](https://docs.advantagekit.org/data-flow/recording-inputs/dashboard-inputs):

```java
LoggedNetworkNumber tunableNumber = new LoggedNetworkNumber("/Tuning/MyTunableNumber", 0.0);
```

:::warning
A subtabela `NetworkInputs` **não pode ser editada**, pois o AdvantageKit a utiliza para registrar entradas de rede para log e replay. Use a tabela `Tuning` para interagir com entradas de rede em tempo real.
:::
