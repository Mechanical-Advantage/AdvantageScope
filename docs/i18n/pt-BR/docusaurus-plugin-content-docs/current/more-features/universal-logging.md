---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🪐 Logging universal com WPILOG

WPILOG é o formato de log aberto padrão usado em todo o ecossistema WPILib. Com o AdvantageScope, o WPILOG pode servir como um contêiner universal para vários arquivos e formatos de log. Isso significa que um único arquivo `.wpilog` pode conter vários fluxos de dados codificados em qualquer formato compatível com o AdvantageScope, incluindo CSV, logs específicos de fabricantes ou outros arquivos WPILOG.

Esse recurso foi projetado para simplificar o diagnóstico, reunindo **todos os dados de diagnóstico de um robô em um único arquivo de log universal**; não há necessidade de baixar, associar ou sincronizar vários arquivos de log de uma única partida, mesmo ao coletar dados de bibliotecas de terceiros ou serviços externos. Por exemplo, um único arquivo WPILOG pode conter:

- Telemetria padrão do robô publicada pela API `Telemetry` da WPILib ou pelo NetworkTables.
- Sinais de dispositivos de alta frequência registrados por bibliotecas de fabricantes.
- Dados de status de coprocessadores e serviços externos registrados em CSV ou WPILOG.
- ...e muito mais!

Todos esses dados aparecem em uma única árvore unificada no AdvantageScope, conforme mostrado abaixo com um WPILOG contendo sinais de dispositivos capturados por vários fabricantes.

:::note
No Systemcore, o [URCL](https://github.com/Mechanical-Advantage/URCL) foi substituído pelo [status logger](https://docs.revrobotics.com/revlib/logs) oficial da REV. O logging universal com o AdvantageScope permite que o status logger oficial grave dados de todos os dispositivos REV em um único arquivo WPILOG (semelhante ao URCL).
:::

<img src="/img/more-features/universal-logging-1.webp" alt="Um arquivo WPILOG mostrando vários logs de fabricantes na barra lateral." />

_A interface em inglês é exibida acima._

:::tip
Usuários do AdvantageKit também podem aproveitar a compactação XZ para reduzir significativamente o tamanho dos logs de terceiros armazenados em um WPILOG. Consulte a documentação do AdvantageKit sobre receptores de dados de log para obter detalhes.
:::

## Experimental: Logging de fabricantes {#experimental-vendor-logging}

Muitos projetos de robô geram vários arquivos de log simultaneamente: um arquivo WPILOG padrão para a telemetria da WPILib/AdvantageKit junto com arquivos proprietários de bibliotecas de fabricantes. O logging universal elimina essa divisão incorporando esses logs de fabricantes diretamente no `.wpilog` principal. Veja as instruções abaixo para WPILib e AdvantageKit.

:::note
Como essa abordagem não é oficialmente suportada pelos fabricantes, solicitações de suporte devem ser direcionadas à [página de issues](https://github.com/Mechanical-Advantage/AdvantageScope/issues) do AdvantageScope ou ao e-mail software@team6328.org. Consulte [Exportando dados de fabricantes](#exporting-vendor-data) para obter detalhes sobre como exportar os arquivos de log originais para diagnóstico.
:::

<Tabs groupId="library">
{/*
<TabItem value="wpilib-java" label="Java" default>

Baixe a classe [`VendorLogCapture.java`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/VendorLogCapture.java) e coloque-a no seu projeto do robô. Essa classe captura automaticamente os dados dos logs de fabricantes para o `DataLog` ativo e deve ser configurada no construtor `Robot`, conforme mostrado abaixo. Você deve selecionar um diretório apropriado (recomendamos `/home/systemcore/logs/`) para armazenar temporariamente os logs de fabricantes durante a captura. Consulte a seção [Como funciona](#how-it-works) para obter detalhes.

```java
public Robot() {
  // Inicia o DataLogManager da WPILib normalmente
  DataLogManager.start();

  // Ativa a captura de logs de fabricantes a partir de um diretório temporário
  // Recomendamos armazenar temporariamente os logs de fabricantes no armazenamento interno
  // mesmo ao usar um pen drive USB (os logs de fabricantes não persistem após a captura)
  VendorLogCapture.start(DataLogManager.getLog(), "/home/systemcore/logs/");

  // Inicia o logger do fabricante APÓS a ativação da captura de logs
  // Se configurável, o diretório de saída deve corresponder ao caminho acima
  VendorLogger.setPath("/home/systemcore/logs/");
  VendorLogger.start();
}
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

Baixe os arquivos [`VendorLogCapture.hpp`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/VendorLogCapture.hpp) e [`VendorLogCapture.cpp`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/VendorLogCapture.cpp) e coloque-os no seu projeto do robô. Essa classe captura automaticamente os dados dos logs de fabricantes para o `DataLog` ativo e deve ser configurada no construtor `Robot`, conforme mostrado abaixo. Você deve selecionar um diretório apropriado (recomendamos `/home/systemcore/logs/`) para armazenar temporariamente os logs de fabricantes durante a captura. Consulte a seção [Como funciona](#how-it-works) para obter detalhes.

```cpp
Robot::Robot() {
  // Inicia o DataLogManager da WPILib normalmente
  wpi::DataLogManager::Start();

  // Ativa a captura de logs de fabricantes a partir de um diretório temporário
  // Recomendamos armazenar temporariamente os logs de fabricantes no armazenamento interno
  // mesmo ao usar um pen drive USB (os logs de fabricantes não persistem após a captura)
  VendorLogCapture::Start(wpi::DataLogManager::GetLog(), "/home/systemcore/logs/");

  // Inicia o logger do fabricante APÓS a ativação da captura de logs
  // Se configurável, o diretório de saída deve corresponder ao caminho acima
  VendorLogger::SetPath("/home/systemcore/logs/");
  VendorLogger::Start();
}
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

Baixe o arquivo [`vendor_log_capture.py`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/vendor_log_capture.py) e coloque-o no seu projeto do robô. Esse auxiliar captura automaticamente os dados dos logs de fabricantes para o `DataLog` ativo e deve ser configurado em `robotInit`, conforme mostrado abaixo. Você deve selecionar um diretório apropriado (recomendamos `/home/systemcore/logs/`) para armazenar temporariamente os logs de fabricantes durante a captura. Consulte a seção [Como funciona](#how-it-works) para obter detalhes.

```python
class Robot(wpilib.TimedRobot):
    def robotInit(self):
        # Inicia o DataLogManager da WPILib normalmente
        wpilib.DataLogManager.start()

        # Ativa a captura de logs de fabricantes a partir de um diretório temporário
        # Recomendamos armazenar temporariamente os logs de fabricantes no armazenamento interno
        # mesmo ao usar um pen drive USB (os logs de fabricantes não persistem após a captura)
        VendorLogCapture.start(wpilib.DataLogManager.get_log(), "/home/systemcore/logs/")

        # Inicia o logger do fabricante APÓS a ativação da captura de logs
        # Se configurável, o diretório de saída deve corresponder ao caminho acima
        VendorLogger.set_path("/home/systemcore/logs/")
        VendorLogger.start()
```

</TabItem>
*/}
<TabItem value="wpilib" label="WPILib">

:::warning
A captura de logs de fabricantes via DataLogManager ainda não está disponível, pois depende de alterações upstream na WPILib. Compartilharemos mais informações em breve!
:::

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

:::note
Esse recurso requer o AdvantageKit v27.0.0-beta-1, que estará disponível em breve. Você pode verificar o status atual na [página de releases](https://github.com/Mechanical-Advantage/AdvantageKit/releases) do GitHub.
:::

A captura de logs de fabricantes é integrada ao AdvantageKit e pode ser ativada conforme mostrado abaixo. Você deve selecionar um diretório apropriado (recomendamos `/home/systemcore/logs/`) para armazenar temporariamente os logs de fabricantes durante a captura. Consulte a seção [Como funciona](#how-it-works) para obter detalhes.

```java
public Robot() {
  // Ativa a captura de logs de fabricantes a partir de um diretório temporário
  // Recomendamos armazenar temporariamente os logs de fabricantes no armazenamento interno
  // mesmo ao usar um pen drive USB (os logs de fabricantes não persistem após a captura)
  Logger.setVendorLogDirectory("/home/systemcore/logs/");

  // Inicia o AdvantageKit normalmente
  Logger.start();

  // Inicia o logger do fabricante APÓS o logger do AdvantageKit
  // Se configurável, o diretório de saída deve corresponder ao caminho acima
  VendorLogger.setPath("/home/systemcore/logs/");
  VendorLogger.start();
}
```

:::info
Independentemente dos receptores de dados de log selecionados, os logs de fabricantes só podem ser visualizados baixando um arquivo WPILOG. A transmissão ao vivo não é suportada devido à estrutura dos dados de log capturados.
:::

</TabItem>
</Tabs>

Observe que alguns loggers de fabricantes começam a gravar dados _imediatamente_ quando a classe do dispositivo correspondente (por exemplo, `SparkMax`) é instanciada. Recomendamos aguardar até o final do construtor `Robot` para instanciar os objetos de hardware, garantindo que os logs sejam capturados.

### Como funciona {#how-it-works}

1. **Captura:** O programa do robô executa o logging padrão da WPILib junto com os loggers de fabricantes. Um auxiliar leve lê periodicamente os novos dados gravados pelos loggers de fabricantes e empacota os blocos brutos diretamente no fluxo ativo do `DataLog`.
2. **Armazenamento:** Todo o log combinado é salvo em um único arquivo `.wpilog` (por exemplo, em um pen drive USB conectado ao Systemcore). Arquivos de log temporários de fabricantes criados no robô não persistem entre reinicializações, evitando acúmulo de armazenamento.
3. **Visualização:** Quando o AdvantageScope abre o `.wpilog`, ele descobre automaticamente todas as entradas de log incorporadas, decodifica o conteúdo e mescla todos os campos na árvore da barra lateral junto com a telemetria padrão.
4. **Extração:** Se você precisar abrir um log de fabricante para suporte ou diagnóstico avançado, os arquivos de log originais podem ser extraídos sem perdas do `.wpilog`, conforme descrito em [Exportando dados de fabricantes](#exporting-vendor-data).

Os dados de logs externos são salvos no formato WPILOG usando uma entrada bruta cujo tipo segue a convenção `log:<formato>`. Ao analisar um desses campos, o AdvantageScope concatena todos os registros binários dessa entrada em ordem cronológica e decodifica a carga resultante como um log independente no formato especificado. Os sinais decodificados são então mesclados na árvore principal de campos e sincronizados automaticamente com os dados existentes.

:::tip
O logging universal com WPILOG não se limita a logs de fabricantes; qualquer formato de log compatível com o AdvantageScope pode ser incorporado em um WPILOG usando a mesma convenção.
:::

### Exportando dados de fabricantes {#exporting-vendor-data}

Embora os dados dos logs de fabricantes possam ser explorados diretamente no AdvantageScope, às vezes pode ser necessário extrair o log original conforme produzido pela biblioteca original (por exemplo, para inspeção em utilitários específicos do fabricante).

Para exportar um log filho individual diretamente do AdvantageScope, clique com o botão direito na entrada do log filho na barra lateral e selecione **Exportar log original...**.

Para extração em lote, você também pode usar o script Python [`extract_vendor_logs.py`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/extract_vendor_logs.py), que procura em um ou mais arquivos `.wpilog` ou `.wpilogxz` todos os logs de fabricantes integrados e os exporta para arquivos separados:

```bash
pip3 install robotpy-wpiutil # Dependência obrigatória
python3 extract_vendor_logs.py path/to/source.wpilog
```
