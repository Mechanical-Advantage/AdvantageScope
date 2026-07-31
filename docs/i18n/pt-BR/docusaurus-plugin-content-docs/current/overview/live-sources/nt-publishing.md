---
sidebar_position: 3
---

# Publicando dados NetworkTables

O AdvantageScope suporta a publicação de dados NetworkTables armazenados em um arquivo de log de volta para um servidor NetworkTables, como um simulador ou robô. Os casos de uso possíveis incluem:

- Reproduzir partidas em simulação para depuração.
- Simular dados de um coprocessador em um robô real.
- Depurar aplicativos de dashboard do piloto usando dados de partidas reais.

Este recurso requer um arquivo de log com uma captura completa dos dados do NetworkTables, que pode ser gerado usando o [logger de dados integrado](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) da WPILib. Observe que o AdvantageKit não suporta este recurso, pois ele habilita uma reprodução determinística mais completa em simulação.

## Primeiros passos

Para iniciar a publicação, um arquivo de log contendo dados do NetworkTables deve estar aberto. Em seguida, siga estas etapas:

- **Publicar no robô:** Clique em `Arquivo` > `Publicar dados NT` > `Conectar ao robô`.
- **Publicar no simulador:** Clique em `Arquivo` > `Publicar dados NT` > `Conectar ao simulador`.

A parte superior da janela exibe o texto "Buscando" ou "Publicando" para indicar o status da publicação de dados. O AdvantageScope tenta reconectar automaticamente usando as mesmas configurações após uma desconexão.

Todos os campos serão publicados usando seus valores armazenados no _timestamp selecionado_ usado por muitas guias do AdvantageScope. Isso permite a reprodução em rede em tempo real através do mesmo mecanismo de reprodução no AdvantageScope. Consulte [Navegação do aplicativo](/overview/navigation) para mais detalhes. Se nenhum timestamp for selecionado, os campos serão publicados usando seus valores armazenados no _timestamp sob o ponteiro_.

Para parar de publicar, clique em `Arquivo` > `Publicar dados NT` > `Parar de publicar`.

## Filtrando campos

Por padrão, o AdvantageScope publica todos os campos do NetworkTables armazenados no arquivo de log (exceto tópicos meta publicados pelo servidor). Alguns casos de uso, como simular um coprocessador, exigem a publicação de apenas um conjunto limitado de campos ou subtabelas. Para ajustar o conjunto de prefixos de campos permitidos, abra a janela de preferências clicando em `App` > `Mostrar preferências...` (Windows/Linux) ou `AdvantageScope` > `Configurações...` (macOS).

A opção "Prefixos de publicação NT" define os prefixos permitidos para campos publicados no NetworkTables. Se deixada em branco, todos os campos serão incluídos. Caso contrário, uma lista de prefixos ou campos separados por vírgulas pode ser fornecida. Veja os exemplos abaixo.

- "_SmartDashboard_": Inclui todos os campos na tabela "SmartDashboard".
- "_SmartDashboard/Auto Selector_": Inclui apenas a tabela "SmartDashboard/Auto Selector".
- "_limelight/tx,limelight/ty_": Inclui apenas os campos "limelight/tx" e "limelight/ty".

## Limitações

:::warning

- Os campos são publicados a cada 20 ms, portanto, dados do NetworkTables originalmente publicados com uma frequência mais alta ignorarão amostras.
- Os timestamps das amostras publicadas não são preservados. Isso seria impossível ao avançar e retroceder no tempo ou reproduzir em diferentes velocidades.
  :::
