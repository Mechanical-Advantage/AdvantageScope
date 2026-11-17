---
sidebar_position: 5
---

# 💬 Console {#console}

A guia Console serve para acompanhar um único campo de texto com as mensagens do console do robô. Estes são os campos mais comuns para arrastar para cá:

- **DS:/Dscomm/Console** - Gravado pela Driver Station da FIRST.
- **messages** - Gravado pelo sistema de log integrado da WPILib quando você chama [`DataLogManager.log`](<https://github.wpilib.org/allwpilib/docs/release/java/edu/wpi/first/wpilibj/DataLogManager.html#log(java.lang.String)>).
- **/RealOutputs/Console** - Gravado automaticamente pelo AdvantageKit durante a execução no robô (basta usar `System.out.println` normalmente).
- **/ReplayOutputs/Console** - Gravado automaticamente pelo AdvantageKit durante a reprodução (replay) de um log (basta usar `System.out.println` normalmente).

Para começar, arraste o campo desejado para a área principal. Cada linha da lista representa uma atualização daquele campo: em logs da WPILib, aparece uma linha para cada texto salvo; em logs do AdvantageKit, aparece uma linha para cada ciclo de loop.

<img src="/img/tab-reference/console-1.webp" alt="Visualização do console" />

_A interface em inglês é exibida acima._

:::info
Clique no ícone de paleta de cores para ligar ou desligar o destaque de avisos e erros. Em logs da WPILib e do AdvantageKit, qualquer mensagem que contenha as palavras "warning" ou "error" ganha destaque automático.
:::

Os controles funcionam de forma parecida com os da guia 🔢 [Tabela](../tab-reference/table), e o instante selecionado fica sincronizado em todas as guias. Clique em uma linha para selecioná-la ou passe o mouse sobre ela para pré-visualizar aquele momento nas janelas destacadas que estiverem abertas. Clicar no botão ↓ leva a lista direto para o instante selecionado (ou para o tempo que você digitou na caixa). Tanto os timestamps quanto o campo de busca por tempo seguem o formato configurado na preferência [Timestamps](/more-features/timestamps).

Digite qualquer texto no campo "Filtrar" para mostrar apenas as linhas que contêm aquele trecho (aperte `Ctrl+F` para pular direto para a caixa de filtro). Se colocar um "!" no começo do texto, o filtro faz o oposto e _oculta_ todas as mensagens que combinarem com ele.

## Formatação ANSI {#ansi-formatting}

O console também entende códigos de cor e formatação usando sequências de escape ANSI padrão:

- **Estilos de texto:** Negrito, esmaecido, itálico e sublinhado
- **Cores de texto e fundo:** As 16 cores padrão (normais e de alta intensidade)
- **Cores de 8 e 24 bits:** Paleta de 256 cores e RGB de 24 bits
- **Redefinições seletivas:** Limpa apenas estilos ou cores específicos sem afetar o restante da linha

:::tip
Clique no ícone de salvar para exportar todo o conteúdo do console para um arquivo de texto.
:::
