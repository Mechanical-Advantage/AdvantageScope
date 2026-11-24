# Exportando dados de log {#exporting-log-data}

O AdvantageScope conta com um sistema flexível para exportar dados de log nos formatos CSV, WPILOG ou MCAP. A exportação funciona tanto ao analisar um arquivo de log quanto ao estar conectado a uma fonte ao vivo. Alguns exemplos de uso:

- Converter um arquivo WPILOG para CSV ou MCAP para analisar os dados em outros programas.
- Exportar um arquivo WPILOG a partir de dados do NetworkTables para consultar depois.
- Salvar um WPILOG com menos campos (e sem valores repetidos) para diminuir o tamanho do arquivo.

Para ver as opções de exportação, clique em `Arquivo` > `Exportar dados...`.

<img src="/img/overview/log-files/export-1.webp" alt="Opções de exportação" />

_A interface em inglês é exibida acima._

:::tip
Além da exportação completa do log descrita aqui, a guia 💬 [Console](/tab-reference/console) permite exportar as mensagens do console para um arquivo de texto.
:::

:::warning
**Exportando dados para o SysId**

Não recomendamos usar este recurso para exportar dados de log **gerados em simulação** para o [SysId](https://docs.wpilib.org/pt/stable/docs/software/advanced-controls/system-identification/introduction.html), pois o SysId precisa de informações extras de timestamp que não são compatíveis com as opções padrão de exportação do AdvantageScope. Já os dados de log **gerados _fora_ da simulação** podem ser exportados para o SysId com perda mínima de dados (embora a maior precisão seja obtida abrindo o arquivo de log _original_ diretamente no SysId).

_Esse aviso **não vale** para logs gerados pelo AdvantageKit, que podem ser exportados sem perda de dados selecionando a opção "Ciclos do AdvantageKit". Veja [esta página](https://docs.advantagekit.org/data-flow/sysid-compatibility) para mais detalhes._
:::

## Opções {#options}

Ao exportar, você encontrará as seguintes opções:

- **Formato:** Define o formato do arquivo exportado:
  - _CSV (Tabela):_ Valores separados por vírgula, em que cada linha representa um timestamp e cada coluna representa um campo (além de uma coluna para o timestamp). Cada linha pode trazer valores de vários campos.
  - _CSV (Lista):_ Valores separados por vírgula, em que cada linha traz o valor de um único campo, com colunas para timestamp, chave e valor.
  - _WPILOG:_ Arquivo WPILOG padrão, que pode ser aberto novamente no AdvantageScope.
  - _MCAP:_ Arquivo [MCAP](https://mcap.dev) padrão, que pode ser aberto no [Foxglove](https://foxglove.dev).
- **Timestamps:** Disponível apenas para "CSV (Tabela)". Define como as novas linhas serão criadas:
  - _Todas as alterações:_ Cria uma nova linha apenas quando o valor de algum campo muda, reduzindo o tamanho do arquivo exportado.
  - _Período fixo:_ Cria novas linhas em um intervalo fixo, o que ajuda quando os logs não têm timestamps sincronizados (vários campos gravados em instantes parecidos, mas não idênticos). Todos os valores são incluídos a cada passo, mesmo que não tenham mudado entre um ponto e outro.
  - _Ciclos do AdvantageKit:_ Cria uma nova linha para cada ciclo de loop sincronizado do AdvantageKit. Todos os valores são incluídos, mesmo sem alteração entre os ciclos.
- **Período:** Disponível apenas quando "Período fixo" está selecionado. Define o intervalo em milissegundos entre as amostras. Em geral, deve corresponder ao período do ciclo de loop do código do robô.
- **Prefixos:** Se ficar em branco, todos os campos são incluídos. Caso contrário, apenas os campos que correspondem aos prefixos informados (separados por vírgulas) entram na exportação. Veja alguns exemplos:
  - "_/DriverStation/Joystick0_": Inclui todos os campos que começam com "/DriverStation/Joystick0" (dados do primeiro joystick).
  - "_Flywheels,DS:enabled_": Inclui todos os campos que começam com "/Flywheels" ou "DS:enabled" (todos os dados do flywheel e o status de habilitado do robô).
  - "_Drive/LeftPosition,Drive/RightPosition_": Inclui apenas os campos "/Drive/LeftPosition" e "/Drive/RightPosition".
- **Conjunto de campos:** Veja as opções abaixo. Campos gerados são criados pelo AdvantageScope para quebrar tipos complexos em partes e aparecem em cinza na barra lateral — por exemplo, elementos individuais de arrays, structs e outros schemas.
  - _Incluir gerados:_ Exporta todos os campos visíveis, incluindo os campos gerados. Recomendado se você for abrir o arquivo em um programa que não sabe ler tipos complexos.
  - _Apenas originais:_ Exporta apenas os campos que já existiam no log original, deixando os campos gerados de fora. Recomendado se você for abrir o arquivo no AdvantageScope ou em outro programa capaz de ler tipos complexos.

Abaixo você vê um exemplo de arquivo CSV exportado do AdvantageScope no formato "CSV (Tabela)" com timestamps definidos como "Todas as alterações":

<img src="/img/overview/log-files/export-2.webp" alt="Tabela CSV" />
