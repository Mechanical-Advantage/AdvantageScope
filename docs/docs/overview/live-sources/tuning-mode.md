---
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Tuning Mode

Some live sources support live tuning of numeric and boolean values. For example, this feature can be used to [tune controller gains](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/introduction/tutorial-intro.html) when connected to a NetworkTables source. Note that the robot code must support receiving gains via NetworkTables.

By default, all values in AdvantageScope are read-only. To toggle tuning mode, **click the slider icon** to the right of the search bar when connected to a supported live source. When the icon is purple, tuning mode is active and field editing is enabled.

- To edit a **numeric field**, enter a new value using the text box to the right of the field in the sidebar. The value is published after the input is deselected or the "Enter" key is pressed. Leave the text box blank to use the robot-published value.
- To toggle a **boolean field**, click the red or green circle to the right of the field in the sidebar.
- To copy all published values to the clipboard, **right-click the slider icon** and select **"Copy Tuned Values"**.

:::tip
For users on iPhone and iPad, **AdvantageTune** is an alternative option created by the AdvantageScope developers for tuning NetworkTables values from mobile devices.

[![App Store](../../img/app-store.svg)](https://apps.apple.com/us/app/advantagetune/id6811453643)
:::

## WPILib Tunables

In WPILib, values such as numbers and booleans can be configured using the Tunable API, allowing them to be adjusted from AdvantageScope in real time. Tunable values are registered once and can be read periodically in robot code:

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
import org.wpilib.tunable.TunableBoolean;
import org.wpilib.tunable.TunableDouble;
import org.wpilib.tunable.Tunables;

TunableDouble tunableNumber = Tunables.addDouble("MyTunableNumber", 0.0);
TunableBoolean tunableBoolean = Tunables.addBoolean("MyTunableBoolean", false);

// Read the values periodically
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

// Read the values periodically
double num = tunableNumber.Get();
bool boolVal = tunableBoolean.Get();
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
import tunables

tunable_number = tunables.add_double("MyTunableNumber", 0.0)
tunable_boolean = tunables.add_boolean("MyTunableBoolean", False)

# Read the values periodically
num = tunable_number.get()
bool_val = tunable_boolean.get()
```

</TabItem>
</Tabs>

## Tuning With AdvantageKit

Fields published by AdvantageKit to the `AdvantageKit` subtable are output-only and cannot be edited. However, users can publish fields from user code that are tunable from AdvantageScope. **Any fields published to the "/Tuning" table on NetworkTables will appear under the "Tuning" table when using the "NetworkTables (AdvantageKit)" live source.**

For example, a tunable number can be published using the [`LoggedNetworkNumber`](https://docs.advantagekit.org/data-flow/recording-inputs/dashboard-inputs) class:

```java
LoggedNetworkNumber tunableNumber = new LoggedNetworkNumber("/Tuning/MyTunableNumber", 0.0);
```

:::warning
The `NetworkInputs` subtable **cannot be edited**, since it is used by AdvantageKit to record network values for logging and replay. Use the `Tuning` table to interact with network inputs in real time.
:::
