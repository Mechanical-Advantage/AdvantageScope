export class NT4_ValReq {
  prefixes: Set<string>;
  toGetValsObj(): any;
}

export class NT4_Subscription {
  prefixes: Set<string>;
  options: NT4_SubscriptionOptions;
  uid: number;
  toSubscribeObj(): any;
  toUnSubscribeObj(): any;
}

export class NT4_SubscriptionOptions {
  immediate: boolean;
  logging: boolean;
  periodicRate_s: number;
  toObj(): any;
}

export class NT4_Topic {
  name: string;
  type: string;
  id: number;
  properties: NT4_TopicProperties;
  toPublishObj(): any;
  toUnPublishObj(): any;
  toPropertiesObj(): any;
  getTypeIdx(): number;
}

export class NT4_TopicProperties {
  isPersistent: boolean;
  toUpdateObj(): any;
}

export class NT4_Client {
  constructor(
    serverAddr: string,
    onTopicAnnounce_in: (topic: NT4_Topic) => void,
    onTopicUnAnnounce_in: (topic: NT4_Topic) => void,
    onNewTopicData_in: (topic: NT4_Topic, timestamp_us: number, value: unknown) => void,
    onConnect_in: () => void,
    onDisconnect_in: () => void
  );

  /** Starts the connection. */
  connect(): void;

  /** Terminates the connection. */
  disconnect(): void;

  /** Add a new subscription. */
  subscribeImmediate(topicPatterns: string[]): NT4_Subscription;

  /** Add a new subscription. */
  subscribePeriodic(topicPatterns: string[], period: number): NT4_Subscription;

  /** Add a new subscription. */
  subscribeLogging(topicPatterns: string[]): NT4_Subscription;

  /** Requests latest value of a set of topics. */
  getValues(topicPatterns: string[]): void;

  /** Given an existing subscription, unsubscribe from it. */
  unSubscribe(sub: NT4_Subscription): void;

  /** Unsubscribe from all current subscriptions. */
  clearAllSubscriptions(): void;

  /** Set the properties of a particular topic. */
  setProperties(topic: NT4_Topic, isPersistent: boolean): void;

  /** Publish a new topic from this client with the provided name and type. */
  publishNewTopic(name: string, type: string): NT4_Topic;

  /** UnPublish a previously-published topic from this client. */
  unPublishTopic(oldTopic: NT4_Topic): void;

  /** Send some new value to the server. */
  addSample(topic: NT4_Topic | string, value: any);

  /** Send some new timestamped value to the server. */
  addSample(topic: NT4_Topic | string, timestamp: number, value: any);

  /** Gets the current time on the client in microseconds. */
  getClientTime_us(): number;

  /** Gets the current time on the server in microseconds. */
  getServerTime_us(): number;
}
