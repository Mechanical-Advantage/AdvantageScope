# 🦾 Mechanism

_[< Return to homepage](/docs/INDEX.md)_

The mechanism tab displays a a jointed mechanism created with a [`Mechanism2d`](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/mech2d-widget.html) object.

> Note: To view the mechanism visualization alongside other tabs, click the "Add Window" icon just below the navigation/playback controls.

![Overview of mechanism tab](/docs/resources/mechanism/mechanism-1.png)

## Publishing Data

To publish mechanism data using WPILib, send the `Mechanism2d` object to NetworkTables (shown below). If data logging is enabled, the mechanism can also be viewed based the generated WPILOG file.

```java
Mechanism2d mechanism = new Mechanism2d(3, 3);
SmartDashboard.putData("MyMechanism", mechanism);
```

To publish mechanism data using AdvantageKit, record the `Mechanism2d` as an output field (shown below). Note that this call only records the current state of the `Mechanism2d`, so it must be called every loop cycle after the object is updated.

```java
Mechanism2d mechanism = new Mechanism2d(3, 3);
Logger.getInstance().recordOutput("MyMechanism", mechanism);
```

## Configuration

All `Mechanism2d` fields in the log data are automatically identified. Use the drop-down at the bottom of the window to select which mechanism to display when multiple are available.
