// Represents all of the data in a log file
export default class Log {
  /*
  Standard field structure:
  {
    key: "/ExampleSubsystem/ExampleArray",
    type: "IntegerArray",
    arrayLength: 3, <-- arrays only, used to keep track of array item fields
    timestampIndexes: [0, 1, 5], <-- indexes in "timestamps" for field updates
    values: [[1, 2, 3], [2, 3, 4], [4, 5, 6]], <-- values from field (or nulls) associated with timestamp
    displayKey: "/ExampleSubsystem/ExampleArray[IntegerArray]" <-- in case of a conflict, used to distinguish fields with the same key but different types
  }

  Array item structure:
  {
    arrayParent: 0, <-- field index of parent
    arrayIndex: 2,
    displayKey: "/ExampleSubsystem/ExampleArray[IntegerArray]/2"
  }

  */

  #timestamps = [];
  #fields = [];

  // Gets all data that can be serialized
  get rawData() {
    return {
      timestamps: this.#timestamps,
      fields: this.#fields
    };
  }

  // Sets all data that can be serialized
  set rawData(value) {
    this.#timestamps = value.timestamps;
    this.#fields = value.fields;
  }
}
