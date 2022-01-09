Lots of feature enhancements to the odometry tab:
* Pose is now stored in a single double array, reducing the number of fields to drag around. This also simplifies some internal logic.
* The "ghost" field allows the robot code to send a supplemental pose that represents a position setpoint or vision measurement.
* The "vision" field allows for drawing a line between the robot and an active vision target.