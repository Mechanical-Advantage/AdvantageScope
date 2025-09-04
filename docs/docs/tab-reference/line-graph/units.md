import Image2 from './img/units-2.png';

# Unit Support

The line graph tab is unit-aware, which means that numeric values can be easily converted between compatible unit types. When unit information is available, all numeric values are also accurately labeled when displayed in the axes or legends. See [here](#supported-formats) for more information on publishing unit information. AdvantageScope provides several tools to quickly convert between units:

- When adding **fields on the same axis with compatible unit types**, AdvantageScope automatically converts both fields to the same unit. This is reflected in the labeling of the Y axis and legend.
- Click the three dots near the axis title to **quickly switch to alternative units**. This list includes the most common units that are compatible with the selected fields.
- Enable **integration or differentiation** ([docs](/tab-reference/line-graph/#integration--differentiation)) to see the accurate integral or derivative units. The base unit can be adjusted using the menu to support filtering in non-native units.

![Unit-aware graphing](./img/units-1.png)

## Supported Formats

AdvantageScope supports several methods to provide unit information about each field. Most common units are supported; for a complete list, check the popup menu when configuring [manual conversion](#manual-conversion).

For (2) and (3), unit types are parsed using strings. AdvantageScope supports a wide variety of common names for each unit, including multiple variations (e.g. `ft` and `feet` are both OK). If a unit name is not being parsed as expected, please [open an issue](https://github.com/Mechanical-Advantage/AdvantageScope/issues) to let us know.

:::tip
Not sure whether units are being parsed correctly? Check whether a unit type is displayed on the Y axis when adding a field to the line graph.
:::

### 🥇 Struct Units

AdvantageScope automatically uses the native units for common structured data types like `Rotation2d` and `Translation3d`. Publishing applicable values using these formats is **always the best way to publish data** and ensures maximum compatibility when visualizing geometry data (see [here](/overview/legacy-formats) for details).

### 🥈 Field Metadata

The WPILOG and NetworkTables formats support publishing additional "metadata" for each field. AdvantageScope looks for JSON fields named "unit" or "units" containing a string name for the unit type (using spaces, camel-case, pascal-case, or snake-case). To check the metadata for each field, hover the cursor over the field name in the sidebar.

:::info
Expect integrated support for unit metadata to improve over time in future releases of WPILib, AdvantageKit, and other logging frameworks.
:::

### 🥉 Field Naming

As a fallback, AdvantageScope attempts to determine the correct unit type by parsing the name of each field. **The unit type must be included as a suffix.** AdvantageScope supports a variety of naming schemes. Some valid options are listed below:

- **Camel/pascal-case**, such as `PositionMeters`, `velocityRadPerSec`, and `TimestampS`
- **Snake-case**, such as `position_meters`, `velocity_rad_per_sec`, and `timestamp_s`
- **Space separators**, such as `position meters`, `velocity rad per sec`, and `timestamp s`

Naming is _not_ case-sensitive when using snake-case or space separators.

:::tip
If units are parsed incorrectly, click `Manual Units` > `Disable Automatic Units` to ignore unit information. Manual conversion can then be used to switch to alternative units.
:::

## Manual Conversion

When unit metadata is unavailable or inaccurate, axes can also be manually configured to convert between units (or ignore unit metadata entirely).

To configure manual conversion, click the three dots near the axis title and then `Manual Units` > `Edit Conversion...`. Select the type of unit, source unit, and target unit. Each value is also multiplied by the "Extra Factor", allowing for custom conversions (like gear ratios, angular to linear conversions, or other units not provided by AdvantageScope). The factor can also be entered using a mathematical expression such as `1.5*pi`.

:::tip
To quickly enable or disable unit conversion, click the three dots near the axis title and choose `Recent Presets` or `Reset Units`.
:::

<img src={Image2} alt="Editing unit conversion" height="250" />
