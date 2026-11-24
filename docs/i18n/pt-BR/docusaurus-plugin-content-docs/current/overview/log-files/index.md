# 📂 Arquivos de log {#log-files}

## Formatos suportados {#supported-formats}

- **WPILOG (.wpilog)** - Gerado pelo [logging de dados integrado](https://docs.wpilib.org/pt/stable/docs/software/telemetry/datalog.html) da WPILib e pelo AdvantageKit. Você também pode usar o [URCL](/more-features/urcl) para gravar sinais de controladores de motor da REV em um arquivo WPILOG.
- **Hoot (.hoot)** - Gerado pelo [signal logger](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) do Phoenix 6 da CTRE.
- **REVLOG (.revlog)** - Gerado pelo [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) da REV Robotics.
- **Road Runner (.log)** - Gerado pela biblioteca [Road Runner](https://github.com/acmerobotics/road-runner) para FTC.
- **CSV (.csv)** - Valores separados por vírgula no mesmo formato [exportado](/overview/log-files/export) pelo AdvantageScope nos modos "CSV (Tabela)" ou "CSV (Lista)". Veja mais detalhes [aqui](#csv-formatting).
- **Logs da Driver Station da NI (.dslog e .dsevents)** - Legado, gerado pela [FRC Driver Station](https://docs.wpilib.org/pt/stable/docs/software/driverstation/driver-station.html) da NI (2010–2026). Ao abrir qualquer um dos dois arquivos, o AdvantageScope procura automaticamente o arquivo complementar correspondente.
- **RLOG (.rlog)** - Legado, gerado pelo AdvantageKit 2022.

:::info
Arquivos de log Hoot só podem ser abertos depois que você aceitar o [contrato de licença de usuário final](https://raw.githubusercontent.com/CrossTheRoadElec/Phoenix-Releases/refs/heads/master/CTRE_LICENSE.txt) da CTRE. Na primeira vez que você abrir um arquivo Hoot, o AdvantageScope exibirá um aviso para confirmar sua concordância com esses termos.
:::

## Abrindo logs {#opening-logs}

Na barra de menus, clique em `Arquivo` > `Abrir log(s)...` e escolha um ou mais arquivos de log no seu computador. Você também pode arrastar um arquivo de log do gerenciador de arquivos do sistema para o ícone ou para a janela do AdvantageScope.

:::info
Se você abrir vários arquivos ao mesmo tempo, os timestamps serão alinhados automaticamente, facilitando a comparação entre logs de diferentes fontes. Veja a página de [Timestamps](/more-features/timestamps) para conhecer as opções de exibição.
:::

<img src="/img/overview/log-files/open-file-1.webp" alt="Abrindo um log salvo" />

_A interface em inglês é exibida acima._

## Adicionando novos logs {#adding-new-logs}

Depois de abrir um arquivo de log, você pode adicionar outros arquivos à visualização sem complicação. Os timestamps são realinhados automaticamente para sincronizar com os dados já abertos.

Na barra de menus, clique em `Arquivo` > `Adicionar novo(s) log(s)...` e escolha um ou mais arquivos para incluir na visualização atual. Os campos de cada log aparecerão em tabelas chamadas `Log0`, `Log1`, etc.

## Baixando do robô {#downloading-from-the-robot}

<details>
<summary>Configurações</summary>

Abra a janela de preferências clicando em `App` > `Mostrar preferências...` (Windows/Linux) ou `AdvantageScope` > `Configurações...` (macOS). Atualize o endereço do robô e a pasta de logs.

<img src="/img/prefs_pt-BR.webp" alt="Diagrama de preferências" height="450" />
</details>

Clique em `Arquivo` > `Baixar logs...` para abrir a janela de download. O download de logs funciona tanto no Systemcore quanto no roboRIO. Assim que a conexão com o robô for estabelecida, os logs disponíveis aparecem com o mais recente no topo. Selecione um ou mais arquivos ou pastas de log (segure Shift e clique para selecionar um intervalo, ou use **cmd/ctrl + A** para selecionar tudo). Depois, clique no ícone ↓ e escolha a pasta de destino.

:::tip
Ao baixar vários arquivos, o AdvantageScope pula automaticamente aqueles que já existem na pasta de destino.
:::

<img src="/img/overview/log-files/open-file-2.webp" alt="Baixando arquivos de log" height="350" />

_A interface em inglês é exibida acima._

## Formatação CSV {#csv-formatting}

Os cabeçalhos das colunas do CSV devem seguir o padrão "Timestamp, Key, Value" ou "Timestamp, (Key), (Key), etc". Os timestamps são medidos em segundos. A lista abaixo mostra o formato esperado para os tipos de valores mais comuns. Lembre-se de que exportar e reimportar dados de log em CSV envolve _perda de dados_, pois o formato CSV não suporta tipos de campos complexos.

- **Booleanos:** `true` ou `false`
- **Strings:** `"(valor)"`
  - Exemplo: `"Hello world"`
- **Arrays:** `[(valor); (valor); (valor)]`
  - Exemplo: `[1; 2; 3]`
- **Bytes:** hexadecimal, separados por `-`
  - Exemplo: `4d-41-36-33-32-38`
