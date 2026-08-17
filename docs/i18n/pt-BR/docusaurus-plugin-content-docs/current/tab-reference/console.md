---
sidebar_position: 5
---

# 💬 Console {#console}

A visualização do console é projetada para visualizar um único campo de texto com dados do console. Alguns campos sugeridos estão listados abaixo.

- **DS:/Dscomm/Console** - Salvo pela Driver Station da FIRST.
- **messages** - Salvo pelo logging integrado da WPILib com base em chamadas ao método [`DataLogManager.log`](<https://github.wpilib.org/allwpilib/docs/release/java/edu/wpi/first/wpilibj/DataLogManager.html#log(java.lang.String)>).
- **/RealOutputs/Console** - Salvo pelo AdvantageKit automaticamente durante a operação do robô (use `System.out.println` normalmente).
- **/ReplayOutputs/Console** - Salvo pelo AdvantageKit automaticamente durante a reprodução do log (use `System.out.println` normalmente).

Arraste o campo desejado para a visualização principal para começar. Cada linha representa uma atualização do campo. Para logs da WPILib, uma nova linha é criada para cada linha salva. Para logs do AdvantageKit, uma nova linha é criada para cada ciclo de loop.

<img src="/img/tab-reference/console-1.webp" alt="Visualização do console" />

:::info
Clique no ícone de paleta de cores para alternar o destaque de mensagens de aviso e erro. Para logs da WPILib e do AdvantageKit, as mensagens são destacadas se contiverem o texto "warning" ou "error".
:::

Os controles são semelhantes aos da guia 🔢 [Tabela](../tab-reference/table). O tempo selecionado é sincronizado em todas as guias. Clique em uma linha para selecioná-la ou passe o mouse sobre uma linha para pré-visualizá-la em quaisquer janelas pop-up visíveis. Clicar no botão ↓ pula para o tempo selecionado (ou o tempo inserido na caixa). Os timestamps e as entradas de salto são formatados de acordo com a preferência de [Timestamps](/more-features/timestamps).

Insira o texto na entrada "Filtrar" para exibir apenas as linhas que contêm o texto do filtro. Pressione `Ctrl+F` para selecionar rapidamente a entrada "Filtrar". Adicione um "!" no início do texto do filtro para _excluir_ mensagens correspondentes da visualização principal.

## Formatação ANSI {#ansi-formatting}

O renderizador do console suporta formatação e códigos de cor usando sequências de escape ANSI padrão:

- **Estilos de texto:** Negrito, esmaecido, itálico e sublinhado
- **Cores de primeiro plano e fundo:** 16 cores padrão (padrão e alta intensidade)
- **Cores de 8 bits e 24 bits:** Paleta de consulta de 256 cores e RGB de 24 bits
- **Redefinições seletivas:** Redefinir estilos ou cores específicos mantendo outros

:::tip
Clique no ícone de salvar para exportar os dados do console para um arquivo de texto.
:::
