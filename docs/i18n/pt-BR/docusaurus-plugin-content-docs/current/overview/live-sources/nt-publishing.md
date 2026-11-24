---
sidebar_position: 3
---

# Publicando dados do NetworkTables {#publishing-networktables-data}

O AdvantageScope permite publicar dados do NetworkTables salvos em um arquivo de log de volta para um servidor NetworkTables, como um simulador ou um robô. Isso é útil para:

- Reproduzir partidas no simulador para depuração.
- Simular dados de um coprocessador em um robô real.
- Depurar dashboards do piloto usando dados de partidas reais.

Para usar esse recurso, você precisa de um arquivo de log com a captura completa dos dados do NetworkTables — algo que pode ser gerado com o [logger de dados integrado](https://docs.wpilib.org/pt/stable/docs/software/telemetry/datalog.html) da WPILib. Vale notar que o AdvantageKit não oferece suporte a esse recurso, já que ele próprio permite um replay determinístico mais completo em simulação.

## Primeiros passos {#getting-started}

Para começar a publicar, abra um arquivo de log que contenha dados do NetworkTables. Em seguida, faça o seguinte:

- **Publicar no robô:** Clique em `Arquivo` > `Publicar dados NT` > `Conectar ao robô`.
- **Publicar no simulador:** Clique em `Arquivo` > `Publicar dados NT` > `Conectar ao simulador`.

A parte superior da janela mostra "Buscando" ou "Publicando" para indicar o status da publicação. Se a conexão cair, o AdvantageScope tenta reconectar automaticamente com as mesmas configurações.

Todos os campos serão publicados com os valores gravados no _timestamp selecionado_, o mesmo usado por várias guias do AdvantageScope. Isso permite reproduzir os dados pela rede em tempo real usando o próprio controle de reprodução do AdvantageScope. Veja [Navegação no aplicativo](/overview/navigation) para mais detalhes. Se nenhum timestamp estiver selecionado, os campos serão publicados com os valores do _timestamp sob o ponteiro_.

Para interromper a publicação, clique em `Arquivo` > `Publicar dados NT` > `Parar de publicar`.

## Filtrando campos {#filtering-fields}

Por padrão, o AdvantageScope publica todos os campos do NetworkTables salvos no arquivo de log (exceto meta tópicos publicados pelo servidor). Em alguns casos, como ao simular um coprocessador, você pode querer publicar apenas um conjunto específico de campos ou subtabelas. Para definir os prefixos permitidos, abra a janela de preferências em `App` > `Mostrar preferências...` (Windows/Linux) ou `AdvantageScope` > `Configurações...` (macOS).

A opção "Prefixos de publicação NT" define quais prefixos podem ser publicados no NetworkTables. Se ficar em branco, todos os campos serão incluídos; caso contrário, informe uma lista de prefixos ou campos separados por vírgulas. Veja os exemplos abaixo:

- "_Telemetry_": Inclui todos os campos da tabela "Telemetry".
- "_Telemetry/Drive_": Inclui apenas a tabela "Telemetry/Drive".
- "_limelight/tx,limelight/ty_": Inclui apenas os campos "limelight/tx" e "limelight/ty".

## Limitações {#limitations}

:::warning

- Os campos são publicados a cada 20 ms; portanto, dados do NetworkTables originalmente publicados em uma frequência maior terão amostras ignoradas.
- Os timestamps das amostras publicadas não são preservados — isso seria impossível ao avançar, retroceder ou reproduzir o log em velocidades diferentes.
  :::
