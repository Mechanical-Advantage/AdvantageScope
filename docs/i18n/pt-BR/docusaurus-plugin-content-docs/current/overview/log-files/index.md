# 📂 Arquivos de log {#log-files}

## Formatos suportados {#supported-formats}

- **WPILOG (.wpilog)** - Produzido pelo [logging de dados integrado](https://docs.wpilib.org/pt/stable/docs/software/telemetry/datalog.html) da WPILib e pelo AdvantageKit. O [URCL](/more-features/urcl) pode ser usado para capturar sinais de controladores de motor da REV em um arquivo WPILOG.
- **Hoot (.hoot)** - Produzido pelo [signal logger](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) do Phoenix 6 da CTRE.
- **REVLOG (.revlog)** - Produzido pelo [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) da REV Robotics.
- **Road Runner (.log)** - Produzido pela biblioteca [Road Runner](https://github.com/acmerobotics/road-runner) para o FTC.
- **CSV (.csv)** - Valores separados por vírgula, correspondentes ao formato [exportado](/overview/log-files/export) pelo AdvantageScope nos modos "CSV (Tabela)" ou "CSV (Lista)". Veja [aqui](#csv-formatting) para mais detalhes.
- **Logs da Driver Station da NI (.dslog e .dsevents)** - Legado, produzidos pela [Driver Station da FRC](https://docs.wpilib.org/pt/stable/docs/software/driverstation/driver-station.html) da NI (2010-2026). O AdvantageScope pesquisa automaticamente o arquivo de log correspondente ao abrir qualquer um dos tipos de log.
- **RLOG (.rlog)** - Legado, produzido pelo AdvantageKit 2022.

:::info
Arquivos de log Hoot só podem ser abertos após concordar com o [contrato de licença de usuário final](https://raw.githubusercontent.com/CrossTheRoadElec/Phoenix-Releases/refs/heads/master/CTRE_LICENSE.txt) da CTRE. O AdvantageScope exibe um aviso para confirmar a concordância com estes termos ao abrir um arquivo de log Hoot pela primeira vez.
:::

## Abrindo logs {#opening-logs}

Na barra de menus, clique em `Arquivo` > `Abrir log(s)...`, depois escolha um ou mais arquivos de log do disco local. Arrastar um arquivo de log do navegador de arquivos do sistema para o ícone ou janela do AdvantageScope também faz com que ele seja aberto.

:::info
Se múltiplos arquivos forem abertos simultaneamente, os timestamps serão alinhados automaticamente. Isso permite uma comparação fácil de arquivos de log de múltiplas fontes. Consulte a página de [Timestamps](/more-features/timestamps) para obter detalhes sobre as opções de exibição de timestamps.
:::

<img src="/img/overview/log-files/open-file-1.webp" alt="Abrindo um log salvo" />

_A interface em inglês é exibida acima._

## Adicionando novos logs {#adding-new-logs}

Após abrir um arquivo de log, logs adicionais podem ser facilmente adicionados à visualização. Os timestamps serão realinhados automaticamente para sincronização com os dados existentes.

Na barra de menus, clique em `Arquivo` > `Adicionar novo(s) log(s)...`, depois escolha um ou mais arquivos de log para adicionar à visualização atual. Os campos de cada log serão registrados em tabelas nomeadas como `Log0`, `Log1`, etc.

## Baixando do robô {#downloading-from-the-robot}

<details>
<summary>Configurações</summary>

Abra a janela de preferências clicando em `App` > `Mostrar Preferências...` (Windows/Linux) ou `AdvantageScope` > `Configurações...` (macOS). Atualize o endereço do robô e a pasta de logs.

<img src="/img/prefs_pt-BR.webp" alt="Diagrama de preferências" height="450" />
</details>

Clique em `Arquivo` > `Baixar logs...` para abrir a janela de download. Uma vez conectado ao robô, os logs disponíveis são exibidos com o mais recente no topo. Selecione um ou mais arquivos de log para baixar (clique com shift para selecionar um intervalo ou **cmd/ctrl + A** para selecionar todos). Em seguida, clique no símbolo ↓ e selecione um local de salvamento.

:::info
O [registrador de sinais](https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/api-usage/signal-logging.html) da CTRE usa um formato não padrão que agrupa os logs em subpastas. Selecione uma ou mais pastas na lista para baixar os arquivos de log como um grupo.
:::

:::tip
Ao baixar vários arquivos, o AdvantageScope ignora qualquer um que já exista na pasta de destino.
:::

<img src="/img/overview/log-files/open-file-2.webp" alt="Baixando arquivos de log" height="350" />

_A interface em inglês é exibida acima._

## Formatação CSV {#csv-formatting}

Os nomes das colunas CSV devem ser "Timestamp, Key, Value" ou "Timestamp, (Key), (Key), etc". Os valores de timestamp estão em segundos. A lista abaixo mostra o formato esperado dos tipos de valores comuns. Observe que exportar e reimportar dados de log como CSV é _com perda de dados_, já que o CSV não suporta tipos de campos complexos.

- **Booleanos:** `true` ou `false`
- **Strings:** `"(valor)"`
  - Exemplo: `"Hello world"`
- **Arrays:** `[(valor); (valor); (valor)]`
  - Exemplo: `[1; 2; 3]`
- **Bytes:** hexadecimal, separados por `-`
  - Exemplo: `4d-41-36-33-32-38`
