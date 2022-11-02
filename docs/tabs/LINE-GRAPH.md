# 📉 Line Graph

_[< Return to homepage](/docs/INDEX.md)_

The line graph is the default view in Advantage Scope. It supports both continuous (numerical) and discrete fields. To get started, drag a field to one of the three legends. You can delete a field using the "X" button or hide it temporarily by clicking the colored circle.

To zoom, place your cursor over the main graph and scroll up or down. You can move left and right by scrolling horizontally (on supported devices), or by clicking and dragging on the graph.

Clicking on the graph will select a time, and right-clicking will deselect it. The value of each field at that time will be displayed in the legend.

> Note: The selected time is synchronized across all tabs, allowing you to quickly find this location in other views.

![Line graph demo](/docs/img/line-graph-1.gif)

## Adjusting Axes

By default, each axis will adjust its range based on the visible data. You can lock the range to its current min and max by clicking the three dots near the axis title and then "Lock Axis". To manually adjust the range, choose "Edit Range..." and enter your desired values.

![Editing axis range](/docs/img/line-graph-2.png)

## Unit Conversion

To adjust the units for an axis, click the three dots near the axis title and then "Unit Conversion...". You can select the type of unit and the conversion you would like to perform. The "Extra Factor" is also multiplied by each value, allowing for custom conversions (like gear ratios, angular to linear conversions, or other units not provided by Advantage Scope).

> Note: You can enter mathematical expressions as an "Extra Factor", like "(50/14)\*(17/27)\*(45/15)" or "1.5\*pi". This often useful when expressing gear ratios or custom units.

![Editing unit conversion](/docs/img/line-graph-3.png)
