# Exportando dados de log {#exporting-log-data}

O AdvantageScope inclui um sistema flexível para exportar dados de log como um arquivo CSV, WPILOG ou MCAP. As funções de exportação funcionam ao visualizar um arquivo de log ou quando conectado a uma fonte de dados ao vivo. Os casos de uso possíveis incluem:

- Converter um arquivo WPILOG para CSV ou MCAP para análise em outros aplicativos.
- Exportar um arquivo WPILOG com base em dados do NetworkTables, para acesso posterior.
- Salvar um WPILOG com um número limitado de campos (e valores duplicados removidos) para reduzir o tamanho do arquivo.

Para ver as opções de exportação, clique em `Arquivo` > `Exportar dados...`.

<img src="/img/overview/log-files/export-1.webp" alt="Opções de exportação" />

_A interface em inglês é exibida acima._

:::tip
Além da exportação completa do log descrita aqui, a guia 💬 [Console](/tab-reference/console) permite que dados do console sejam exportados para um arquivo de texto.
:::

:::warning
**Exportando dados para SysId**

Não recomendamos o uso deste recurso para exportar dados de log **gerados em simulação** para uso no [SysId](https://docs.wpilib.org/pt/stable/docs/software/advanced-controls/system-identification/introduction.html), pois o SysId requer dados de timestamp adicionais inconsistentes com as opções de exportação padrão do AdvantageScope. Observe que os dados de log **gerados _fora_ da simulação** podem ser exportados para uso no SysId com perda mínima de dados (embora a precisão máxima possa ser alcançada usando o log de dados _original_ diretamente no SysId).

_Este aviso **não se aplica** aos logs produzidos pelo AdvantageKit, que podem ser exportados sem perda de dados selecionando a opção "Ciclos do AdvantageKit". Consulte [esta página](https://docs.advantagekit.org/data-flow/sysid-compatibility) para mais detalhes._
:::

## Opções {#options}

As seguintes opções são fornecidas ao exportar:

- **Formato:** Define o formato geral do arquivo exportado. Veja as opções abaixo.
  - _CSV (Tabela):_ Valores separados por vírgula, onde cada linha representa um timestamp distinto e cada coluna representa um campo (mais uma coluna para o valor do timestamp). Cada linha pode representar um valor em múltiplos campos.
  - _CSV (Lista):_ Valores separados por vírgula, onde cada linha representa um valor em um único campo com colunas para timestamp, chave e valor.
  - _WPILOG:_ Arquivo WPILOG padrão que pode ser aberto novamente no AdvantageScope.
  - _MCAP:_ Arquivo [MCAP](https://mcap.dev) padrão que pode ser aberto no [Foxglove](https://foxglove.dev).
- **Timestamps:** Apenas para "CSV (Tabela)". Define o método para criar novas linhas. Veja as opções abaixo.
  - _Todas as alterações:_ Cria novas linhas/entradas apenas quando os valores dos campos são atualizados. Minimiza o tamanho do arquivo exportado.
  - _Período fixo:_ Cria novas linhas/entradas em um intervalo fixo, útil para logs sem sincronização de timestamp (quando muitos campos estão sendo registrados com timestamps semelhantes, mas não idênticos). Observe que todos os valores são incluídos, independentemente de ter havido alteração entre os pontos de amostragem.
  - _Ciclos do AdvantageKit:_ Cria uma nova linha/entrada para cada ciclo de loop sincronizado do AdvantageKit. Observe que todos os valores são incluídos, independentemente de ter havido alteração entre os ciclos de loop.
- **Período:** Apenas quando "Período fixo" está selecionado. Define o período em milissegundos entre cada amostra. Tipicamente, isso deve corresponder ao período do ciclo de loop do código do robô.
- **Prefixos:** Se em branco, inclui todos os campos. Caso contrário, inclui apenas os campos que correspondem aos prefixos fornecidos (separados por vírgulas). Veja os exemplos abaixo.
  - "_/DriverStation/Joystick0_": Inclui todos os campos que começam com "/DriverStation/Joystick0" (dados do primeiro joystick).
  - "_Flywheels,DS:enabled_": Inclui todos os campos que começam com "/Flywheels" ou "DS:enabled" (todos os dados do volante de inércia, mais o status de habilitado do robô).
  - "_Drive/LeftPosition,Drive/RightPosition_": Inclui apenas os campos "/Drive/LeftPosition" e "/Drive/RightPosition".
- **Conjunto de campos:** Veja as opções abaixo. Campos gerados são criados pelo AdvantageScope para decompor tipos complexos e são exibidos com texto cinza na barra lateral. Isso inclui componentes individuais de arrays, structs e outros esquemas.
  - _Incluir gerados:_ Exporta todos os campos visualizáveis, o que inclui campos gerados. Recomendado se os dados exportados forem abertos em um aplicativo incapaz de analisar tipos complexos.
  - _Apenas originais:_ Exporta apenas os campos presentes no arquivo de log original, o que exclui campos gerados. Recomendado se os dados exportados forem abertos no AdvantageScope ou em outro aplicativo capaz de analisar tipos complexos.

Um exemplo de arquivo CSV exportado do AdvantageScope é mostrado abaixo, no formato "CSV (Tabela)" com timestamps definidos como "Todas as alterações":

<img src="/img/overview/log-files/export-2.webp" alt="Tabela CSV" />
