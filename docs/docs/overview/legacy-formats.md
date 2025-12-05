---
sidebar_position: 6
---

# ⚠️ Legacy Format Deprecation

WPILib supports the type-safe and unit-safe **struct format** for publishing complex data types such as geometry objects, swerve states, and more! AdvantageScope takes advantage of the struct format to streamline the process of configuring fields for visualization. For example, 2D and 3D poses can now be used side-by-side on the [🗺 2D Field](/tab-reference/2d-field) and [👀 3D Field](/tab-reference/3d-field) tabs with **no manual configuration** and **no unit errors**.

Before 2025, AdvantageScope supported both structs and the legacy "number array" format for geometry types. The legacy format packed structured data into a format like `double[]` (e.g. a pose would be represented by the array `[x, y, rotation]`).

:::info
For more information on the design of structs and their advantages, check out [this post](https://www.chiefdelphi.com/t/introducing-monologue-annotation-based-telemetry-and-data-logging-for-java-teams/443917/5).
:::

## What's Changing?

In 2025 and 2026, AdvantageScope continues to support both the modern struct format and the legacy number array format. However, **the legacy number array format is now <u>deprecated</u> and will be removed in 2027**. AdvantageScope will present a warning when the legacy format is used, and additional information must be manually provided to specify the packing format and units.

|                  | Modern Struct Format | Legacy Number Array Format |
| ---------------- | -------------------- | -------------------------- |
| **2024** (v3.x)  | ✅ Recommended       | ✅ Supported               |
| **2025** (v4.x)  | ✅ Recommended       | ⚠️ Deprecated              |
| **2026** (v26.x) | ✅ Recommended       | ⚠️ Deprecated              |
| **2027** (v27.x) | ✅ Recommended       | ❌ Removed                 |

:::warning
While the legacy format can still be used, additional information must be provided about the packing format and units of each field. After adding an array field to a tab, the format can be configured by clicking the icon to the left of the field name.
:::

## How Do I Update?

Most major tools and libraries already support the modern struct format (check the documentation of each library for details). Below, you can see how to upgrade to the modern format for several common libraries. The struct format supports both single objects and object arrays (such as `Pose2d[]`).

:::tip
If you rely on a library that hasn't upgraded to the new format, reach out the developers for details.
:::

<details>
<summary>NetworkTables</summary>

To publish struct data to NetworkTables, create a `StructPublisher` with the desired type and call `set()` as shown below.

```java
StructPublisher<Pose2d> publisher = NetworkTableInstance.getDefault()
  .getStructTopic("MyPose", Pose2d.struct).publish();
publisher.set(new Pose2d());
```

:::tip
WPILib will support a struct alternative to the [`SmartDashboard`](https://github.wpilib.org/allwpilib/docs/release/java/edu/wpi/first/wpilibj/smartdashboard/SmartDashboard.html) style `put` methods in 2027. In the meantime, consider using another logging library such as Monologue that supports an imperative API.
:::

</details>

<details>
<summary>Field2d</summary>

WPILib's `Field2d` class does not support the modern struct format, but will be superseded by an improved telemetry API in 2027. In the meantime, users who wish to try the modern format can publish pose data using the NetworkTables API shown above.

</details>

<details>
<summary>Epilogue</summary>

To publish struct data using Epilogue, simply return a supported object type from a logged method:

```java
@Logged
public class MyClass {
  public Pose2d getPose() {
    return new Pose2d();
  }
}
```

</details>

<details>
<summary>AdvantageKit</summary>

To log and replay struct data using AdvantageKit, simply pass a supported object type to the `recordOutput` method, return it from a method/field tagged with `@AutoLogOutput`, or include it in an inputs class tagged with `@AutoLog`.

```java
// Standard output logging
Logger.recordOutput("MyPose", new Pose2d());

// Annotation output logging
public class MyClass {
  @AutoLogOutput
  public Pose2d getPose() {
    return new Pose2d();
  }

  @AutoLogOutput
  public Pose2d myPose = new Pose2d();
}

// Inputs class
@AutoLog
public class Inputs {
  public Pose2d myPose = new Pose2d();
}
```

</details>

<details>
<summary>DogLog</summary>

To publish struct data using DogLog, simply pass a supported object type to the `log` method:

```java
DogLog.log("MyPose", new Pose2d());
```

</details>

<details>
<summary>DataLog</summary>

To append struct data to a raw `DataLog`, create a `StructLogEntry` with the desired type and call `set()` as shown below.

```java
StructLogEntry<Pose2d> logEntry =
        StructLogEntry.create(DataLogManager.getLog(), "MyPose", Pose2d.struct);
logEntry.append(new Pose2d());
```

</details>

<details>
<summary>Phoenix Signal Logger (Hoot)</summary>

To write struct data to a Hoot file, pass a supported object to the `writeStruct` method along with the associated struct object.

```java
SignalLogger.writeStruct("MyPose", Pose2d.struct, new Pose2d());
```

</details>
