---
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Modo de ajuste (tuning) {#tuning-mode}

Algumas fontes ao vivo permitem ajustar valores numéricos e booleanos em tempo real. Você pode usar esse recurso, por exemplo, para [ajustar ganhos de controladores](https://docs.wpilib.org/pt/stable/docs/software/advanced-controls/introduction/tutorial-intro.html) quando estiver conectado a uma fonte NetworkTables. Lembre-se de que o código do robô precisa estar preparado para receber esses ganhos via NetworkTables.

Por padrão, todos os valores no AdvantageScope são somente leitura. Para ativar ou desativar o modo de ajuste, **clique no ícone de controles deslizantes** à direita da barra de pesquisa quando estiver conectado a uma fonte ao vivo compatível. Quando o ícone ficar roxo, o modo de ajuste está ativo e a edição dos campos fica liberada.

- Para editar um **campo numérico**, digite o novo valor na caixa de texto à direita do campo na barra lateral. O valor é publicado assim que você sai da caixa ou pressiona a tecla "Enter". Deixe a caixa em branco para voltar a usar o valor publicado pelo robô.
- Para alternar um **campo booleano**, clique no círculo vermelho ou verde à direita do campo na barra lateral.
- Para copiar todos os valores publicados para a área de transferência, **clique com o botão direito no ícone de controles deslizantes** e selecione **"Copiar valores ajustados"**.

:::tip
Para usuários de iPhone e iPad, o **AdvantageTune** é uma opção alternativa criada pelos desenvolvedores do AdvantageScope para ajustar valores do NetworkTables em dispositivos móveis.

[<img src="/img/app-store_pt-BR.svg" alt="App Store" />](https://apps.apple.com/br/app/advantagetune/id6811453643)
:::

## Tunables da WPILib {#wpilib-tunables}

Na WPILib, valores como números e booleanos podem ser configurados usando a API Tunable, permitindo que sejam ajustados pelo AdvantageScope em tempo real. Os valores ajustáveis são registrados uma vez e podem ser lidos periodicamente no código do robô:

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
import org.wpilib.tunable.TunableBoolean;
import org.wpilib.tunable.TunableDouble;
import org.wpilib.tunable.Tunables;

TunableDouble tunableNumber = Tunables.addDouble("MyTunableNumber", 0.0);
TunableBoolean tunableBoolean = Tunables.addBoolean("MyTunableBoolean", false);

// Leia os valores periodicamente
double num = tunableNumber.get();
boolean bool = tunableBoolean.get();
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

```cpp
#include <wpi/tunables/Tunables.hpp>

wpi::tunables::TunableDouble tunableNumber =
    wpi::tunables::Add<double>("MyTunableNumber", 0.0);
wpi::tunables::TunableBool tunableBoolean =
    wpi::tunables::Add<bool>("MyTunableBoolean", false);

// Leia os valores periodicamente
double num = tunableNumber.Get();
bool boolVal = tunableBoolean.Get();
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
import tunables

tunable_number = tunables.add_double("MyTunableNumber", 0.0)
tunable_boolean = tunables.add_boolean("MyTunableBoolean", False)

# Leia os valores periodicamente
num = tunable_number.get()
bool_val = tunable_boolean.get()
```

</TabItem>
</Tabs>

## Ajuste com o AdvantageKit {#tuning-with-advantagekit}

Os campos publicados pelo AdvantageKit na subtabela `AdvantageKit` são apenas de saída e não podem ser editados. Mesmo assim, você pode publicar no seu código campos que podem ser ajustados pelo AdvantageScope. **Qualquer campo publicado na tabela "/Tuning" do NetworkTables aparecerá na tabela "Tuning" ao usar a fonte ao vivo "NetworkTables (AdvantageKit)".**

Por exemplo, você pode publicar um número ajustável usando a classe [`LoggedNetworkNumber`](https://docs.advantagekit.org/data-flow/recording-inputs/dashboard-inputs):

```java
LoggedNetworkNumber tunableNumber = new LoggedNetworkNumber("/Tuning/MyTunableNumber", 0.0);
```

:::warning
A subtabela `NetworkInputs` **não pode ser editada**, pois o AdvantageKit a utiliza para registrar entradas de rede para log e replay. Use a tabela `Tuning` para interagir com entradas de rede em tempo real.
:::
