# ⚙️ Mechanism

_[< Return to homepage](/docs/INDEX.md)_

The mechanism tab displays a a jointed mechanism created with one or more [Mechanism2d](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/mech2d-widget.html) objects.

> Note: To view the mechanism visualization alongside other tabs, click the "Add Window" icon just below the navigation/playback controls. To hide the controls at the bottom of the window, click the eye icon.

![Overview of mechanism tab](/docs/resources/mechanism/mechanism-1.png)

## Publishing Data

To publish mechanism data using WPILib, send a `Mechanism2d` object to NetworkTables (shown below). If data logging is enabled, the mechanisms can also be viewed based the generated WPILOG file.

```java
Mechanism2d mechanism = new Mechanism2d(3, 3);
SmartDashboard.putData("MyMechanism", mechanism);
```

To publish mechanism data using AdvantageKit, record a `Mechanism2d` as an output field (shown below). Note that this call only records the current state of the `Mechanism2d`, so it must be called every loop cycle after the object is updated.

```java
Mechanism2d mechanism = new Mechanism2d(3, 3);
Logger.getInstance().recordOutput("MyMechanism", mechanism);
```

## Configuration

To selected a mechanism, drag it to one of the labeled boxes. To remove a mechanism, right-click the box. Up to three mechanisms can be displayed simultaneously. For example, the setpoints and measured states can be logged separately and merged in AdvantageScope to allow for greater flexibility in visualization.
