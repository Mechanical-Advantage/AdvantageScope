# PhotonVision Integration

_[< Return to homepage](/docs/INDEX.md)_

[PhotonVision](https://photonvision.org) is a popular open-source vision system, which can integrate with AdvantageScope to enable debugging on and off the field. PhotonVision publishes data to the roboRIO using NetworkTables, with the API documented [here](https://docs.photonvision.org/en/latest/docs/programming/nt-api.html). This data can also be saved to a log file using WPILib's [built-in data logging](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html).

PhotonVision publishes targeting data using a byte-packed format. AdvantageScope can decode a subset of fields from this format, allowing individual measurements and poses to be viewed on the line graph, 3D field, etc. **For full functionality with AprilTags, configure PhotonVision to publish to [protobuf](https://protobuf.dev) in additional to its default format. This option can be found under the "Networking" page of the PhotonVision web UI:**

![Screenshot of PhotonVision settings page](/docs/resources/photonvision.png)
