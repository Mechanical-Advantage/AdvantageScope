# 📉 Line Graph

_[< Return to homepage](/docs/INDEX.md)_

The line graph is the default view in Advantage Scope. It supports both continuous (numerical) and discrete fields. To get started, drag a field to one of the three legends. Delete a field using the "X" button or hide it temporarily by clicking the colored circle.

To zoom, place the cursor over the main graph and scroll up or down. Move left and right by scrolling horizontally (on supported devices), or by clicking and dragging on the graph.

Clicking on the graph selects a time, and right-clicking deselects it. The value of each field at that time is displayed in the legend.

> Note: The selected time is synchronized across all tabs, making it easy to quickly find this location in other views.

![Line graph demo](/docs/img/line-graph-1.gif)

## Adjusting Axes

By default, each axis adjusts its range based on the visible data. To disable auto-ranging and lock the range to its current min and max, click the three dots near the axis title and then "Lock Axis". To manually adjust the range, choose "Edit Range..." and enter your desired values.

![Editing axis range](/docs/img/line-graph-2.png)

## Unit Conversion

To adjust the units for an axis, click the three dots near the axis title and then "Unit Conversion...". Select the type of unit and the conversion you would like to perform. Each value is also multiplied by the "Extra Factor", allowing for custom conversions (like gear ratios, angular to linear conversions, or other units not provided by Advantage Scope).

> Note: The "Extra Factor" accepts mathematical expressions such as "(50/14)\*(17/27)\*(45/15)" or "1.5\*pi". This often useful when expressing gear ratios or custom units.

![Editing unit conversion](/docs/img/line-graph-3.png)
