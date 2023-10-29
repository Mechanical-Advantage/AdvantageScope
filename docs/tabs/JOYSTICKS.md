# 🎮 Joysticks

_[< Return to homepage](/docs/INDEX.md)_

The joysticks tab shows the state of up to three connected controllers. The video below shows an example layout, with two Xbox controller and a generic joystick. Each button highlights when it is being pressed. The timeline shows when the robot is enabled and can be used to navigate through the log data.

> Note: To view the joystick visualization alongside other tabs, click the "Add Window" icon just below the navigation/playback controls. To hide the controls at the bottom of the window, click the eye icon.

![Overview of joystick tab](/docs/resources/joysticks/joysticks-1.png)

## Configuration

Select the joysticks IDs and types in the table at the bottom of the tab. Joystick IDs range from 0 to 5, and match the IDs in the Driver Station and WPILib. More information about joysticks can be found in the [WPILib documentation](https://docs.wpilib.org/en/stable/docs/software/basic-programming/joystick.html).

AdvantageScope includes a set of common joysticks, including a "Generic Joystick" with all buttons, axes, and POVs in a grid format (seen above). To add a custom joystick, see [Custom Assets](/docs/CUSTOM-ASSETS.md). An example of a custom joystick is shown below (the overrides on 6328's operator console).

> Note: The source fields are automatically selected from the log data. WPILib logs (with [joystick logging enabled](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html#logging-joystick-data)), AdvantageKit logs, and AdvantageKit streaming are supported. **Joystick data is NOT available via an NT4 connection with stock WPILib.**

![Custom joystick](/docs/resources/joysticks/joysticks-2.png)
