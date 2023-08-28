import { SIM_ADDRESS, USB_ADDRESS } from "../../shared/IPAddresses";
import { filterFieldByPrefixes, getOrDefault, logValuesEqual } from "../../shared/log/LogUtil";
import LoggableType from "../../shared/log/LoggableType";
import { NT4_Client } from "./NT4";

/** Publishes the current values of every field to an NT server. */
export class NT4Publisher {
  private PERIOD = 0.02;

  private GLOW: HTMLElement;
  private client: NT4_Client;
  private interval: number | null = null;
  private publishedTopics: { [key: string]: any } = {};

  constructor(isSim: boolean) {
    this.GLOW = document.getElementsByClassName("publishing-glow")[0] as HTMLElement;

    // Get address
    let address = "";
    if (isSim) {
      address = SIM_ADDRESS;
    } else if (window.preferences?.usb) {
      address = USB_ADDRESS;
    } else {
      if (window.preferences) {
        address = window.preferences.rioAddress;
      }
    }

    // Create client
    this.GLOW.classList.remove("connected");
    this.client = new NT4_Client(
      address,
      "AdvantageScope",
      () => {},
      () => {},
      () => {},
      () => {
        this.GLOW.classList.add("connected");
      },
      () => {
        this.GLOW.classList.remove("connected");
      }
    );

    // Start
    document.documentElement.style.setProperty("--show-publishing-glow", "1");
    this.client.connect();
    this.interval = window.setInterval(() => this.periodic(), this.PERIOD * 1000);
  }

  stop() {
    document.documentElement.style.setProperty("--show-publishing-glow", "0");
    this.client.disconnect();
    if (this.interval !== null) window.clearInterval(this.interval);
  }

  private periodic() {
    let serverTime = this.client.getServerTime_us();
    if (serverTime === null) serverTime = 0;

    // Update published topics
    if (!window.preferences) return;
    let topicsToPublish = filterFieldByPrefixes(
      window.log.getFieldKeys(),
      window.preferences.publishFilter,
      true
    ).filter((topic) => !topic.startsWith("$") && !window.log.isArrayField(topic));
    topicsToPublish.forEach((topic) => {
      if (!(topic in this.publishedTopics)) {
        // Publish new topic
        let type = "";
        switch (window.log.getType(topic)) {
          case LoggableType.Raw:
            type = "raw";
            break;
          case LoggableType.Boolean:
            type = "boolean";
            break;
          case LoggableType.Number:
            type = "double";
            break;
          case LoggableType.String:
            type = "string";
            break;
          case LoggableType.BooleanArray:
            type = "boolean[]";
            break;
          case LoggableType.NumberArray:
            type = "double[]";
            break;
          case LoggableType.StringArray:
            type = "string[]";
            break;
        }
        this.client.publishTopic(topic.slice(3), type);
        this.publishedTopics[topic] = null;
      }
    });
    Object.keys(this.publishedTopics).forEach((topic) => {
      if (!topicsToPublish.includes(topic)) {
        // Unpublish old topic
        this.client.unpublishTopic(topic.slice(3));
        delete this.publishedTopics[topic];
      }
    });

    // Get publishing timestamp
    let time: number;
    let hoveredTime = window.selection.getHoveredTime();
    let selectedTime = window.selection.getSelectedTime();
    if (selectedTime !== null) {
      time = selectedTime;
    } else if (hoveredTime !== null) {
      time = hoveredTime;
    } else {
      time = window.log.getTimestampRange()[0];
    }

    // Add samples
    Object.keys(this.publishedTopics).forEach((topic) => {
      let lastValue = this.publishedTopics[topic];
      let value = null;
      let type = window.log.getType(topic)!;
      switch (type) {
        case LoggableType.Raw:
          value = getOrDefault(window.log, topic, LoggableType.Raw, time, new Uint8Array());
          break;
        case LoggableType.Boolean:
          value = getOrDefault(window.log, topic, LoggableType.Boolean, time, false);
          break;
        case LoggableType.Number:
          value = getOrDefault(window.log, topic, LoggableType.Number, time, 0);
          break;
        case LoggableType.String:
          value = getOrDefault(window.log, topic, LoggableType.String, time, "");
          break;
        case LoggableType.BooleanArray:
          value = getOrDefault(window.log, topic, LoggableType.Boolean, time, []);
          break;
        case LoggableType.NumberArray:
          value = getOrDefault(window.log, topic, LoggableType.Number, time, []);
          break;
        case LoggableType.StringArray:
          value = getOrDefault(window.log, topic, LoggableType.String, time, []);
          break;
      }
      let hasChanged = lastValue === null || !logValuesEqual(type, value, lastValue);
      if (hasChanged) {
        this.publishedTopics[topic] = value;
        this.client.addTimestampedSample(topic.slice(3), serverTime!, value);
      }
    });
  }
}
