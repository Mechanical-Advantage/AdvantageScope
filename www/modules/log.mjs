// Represents all of the data in a log file
export class Log {
  /*
  Standard field structure:
  {
    key: "/ExampleSubsystem/ExampleArray",
    type: "IntegerArray",
    arrayLength: 3, <-- arrays only, used to keep track of array item fields
    resolutions: {
      0: { <-- min separation between changes in seconds
        timestampIndexes: [0, 1, 5], <-- indexes in "timestamps" for field updates
        values: [[1, 2, 3], [2, 3, 4], [4, 5, 6]], <-- values from field (or nulls) associated with timestamp
      }
    }
    displayKey: "/ExampleSubsystem/ExampleArray[IntegerArray]" <-- in case of a conflict, used to distinguish fields with the same key but different types
  }

  Array item structure:
  {
    arrayParent: 0, <-- field index of parent
    arrayIndex: 2,
    displayKey: "/ExampleSubsystem/ExampleArray[IntegerArray]/2"
  }

  */

  static resolutions = [0.1, 0.2, 0.4, 0.6, 0.8, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] // Min time between changes (seconds)
  #timestamps = []
  #fields = []

  // Gets all data that can be serialized
  get rawData() {
    return {
      timestamps: this.#timestamps,
      fields: this.#fields
    }
  }

  // Sets all data that can be serialized
  set rawData(value) {
    this.#timestamps = value.timestamps
    this.#fields = value.fields
  }

  // Gets a list of valid timestamps
  getTimestamps() {
    return this.#timestamps
  }

  // Gets the number of fields, use this to find all possible indexes
  getFieldCount() {
    return this.#fields.length
  }

  // Gets info for a field based on its index
  getFieldInfo(index) {
    var field = this.#fields[index]
    return {
      displayKey: field.displayKey,
      type: "arrayParent" in field ? this.#fields[field.arrayParent].type.slice(0, -5) : field.type
    }
  }

  // Organizes fields into a tree structure
  getFieldTree() {
    var root = {}
    for (let i in this.#fields) {
      var tableNames = this.#fields[i].displayKey.slice(1).split("/")
      var pos = { children: root }
      for (let x in tableNames) {
        var tableName = tableNames[x]
        if (!(tableName in pos.children)) {
          pos.children[tableName] = { field: null, children: {} }
        }
        pos = pos.children[tableName]
      }
      pos.field = Number(i)
    }
    return root
  }

  // Gets all data from a field in the given range
  getDataInRange(fieldIndex, startTime, endTime, resolution) {
    var field = this.#fields[fieldIndex]

    // Array item, get data from parent
    if ("arrayParent" in field) {
      var parentData = this.getDataInRange(field.arrayParent, startTime, endTime, resolution)
      return {
        timestamps: parentData.timestamps,
        values: parentData.values.map((value) => field.arrayIndex >= value.length ? null : value[field.arrayIndex])
      }
    }

    // Not an array item
    var timestamps = []
    var values = []

    var startValueIndex = field.resolutions[resolution].timestampIndexes.findIndex((timestampIndex) => this.#timestamps[timestampIndex] > startTime)
    if (startValueIndex == -1) {
      startValueIndex = field.resolutions[resolution].timestampIndexes.length - 1
    } else if (startValueIndex != 0) {
      startValueIndex -= 1
    }

    var endValueIndex = field.resolutions[resolution].timestampIndexes.findIndex((timestampIndex) => this.#timestamps[timestampIndex] >= endTime)
    if (endValueIndex == -1 || endValueIndex == field.resolutions[resolution].timestampIndexes.length - 1) { // Extend to end of timestamps
      timestamps = field.resolutions[resolution].timestampIndexes.slice(startValueIndex)
      values = field.resolutions[resolution].values.slice(startValueIndex)
    } else {
      timestamps = field.resolutions[resolution].timestampIndexes.slice(startValueIndex, endValueIndex + 1)
      values = field.resolutions[resolution].values.slice(startValueIndex, endValueIndex + 1)
    }

    return {
      timestamps: timestamps.map((i) => this.#timestamps[i]),
      values: values,
      startValueIndex: startValueIndex
    }
  }

  // Returns the field indexes matching the key (and type)
  #find(key, type, matchType) {
    var results = []
    for (let i in this.#fields) {
      if (this.#fields[i].key == key) {
        if (type == null) {
          results.push(i)
          continue
        }

        if (matchType) {
          if (this.#fields[i].type == type) results.push(i)
        } else {
          if (this.#fields[i].type != type) results.push(i)
        }
      }
    }
    return results
  }

  // Adds a series of array item fields
  #createArrayFields(parentIndex, originalLength, newLength) {
    for (let i = originalLength; i < newLength; i++) {
      this.#fields.push({
        arrayParent: parentIndex,
        arrayIndex: i
      })
    }
  }

  // Adds a new entry. Always call updateDisplayKeys() after adding new entries.
  add(entry) {
    this.#timestamps.push(entry.timestamp)
    var entryIndex = this.#timestamps.length - 1

    // Update/add fields
    for (let i in entry.data) {
      if (entry.data[i].type == "null") { // Set all types if null
        this.#fields.forEach(function (_, index, arr) {
          if (arr[index].key == entry.data[i].key) {
            arr[index].resolutions[0].timestampIndexes.push(entryIndex)
            arr[index].resolutions[0].values.push(null)
          }
        })

      } else { // Not null, update the data normally
        var fieldIndex = this.#fields.find(field => field.key == entry.data[i].key && field.type == entry.data[i].type)
        fieldIndex = this.#fields.indexOf(fieldIndex)
        if (fieldIndex > -1) { // Field already exists, add to it
          this.#fields[fieldIndex].resolutions[0].timestampIndexes.push(entryIndex)
          this.#fields[fieldIndex].resolutions[0].values.push(entry.data[i].value)
          if (entry.data[i].type.endsWith("Array")) {
            var originalLength = this.#fields[fieldIndex].arrayLength
            var newLength = entry.data[i].value.length
            if (newLength > originalLength) {
              this.#fields[fieldIndex].arrayLength = newLength
              this.#createArrayFields(fieldIndex, originalLength, newLength)
            }
          }

        } else { // Create new field
          var field = {
            key: entry.data[i].key,
            type: entry.data[i].type,
            resolutions: {
              0: {
                timestampIndexes: [entryIndex],
                values: [entry.data[i].value]
              }
            }
          }
          this.#fields.push(field)
          if (entry.data[i].type.endsWith("Array")) {
            this.#fields[this.#fields.length - 1].arrayLength = entry.data[i].value.length
            this.#createArrayFields(this.#fields.length - 1, 0, entry.data[i].value.length)
          }
        }

        // Find fields of a different type to fill
        this.#fields.forEach(function (_, index, arr) {
          if ("key" in arr[index] && arr[index].key == entry.data[i].key && arr[index].type != entry.data[i].type) {
            if (arr[index].resolutions[0].values[arr[index].values.length - 1] != null) {
              arr[index].resolutions[0].timestampIndexes.push(entryIndex)
              arr[index].resolutions[0].values.push(null)
            }
          }
        })
      }
    }
  }

  // Update field display keys. Call after adding entries.
  updateDisplayKeys() {
    // Update normal fields (not array items)
    var allKeys = []
    for (let i in this.#fields) {
      if ("arrayParent" in this.#fields[i]) {
        continue
      }

      if (!allKeys.includes(this.#fields[i].key)) {
        allKeys.push(this.#fields[i].key)
        var duplicateIndexes = this.#find(this.#fields[i].key, null, null)
        if (duplicateIndexes.length > 1) { // Duplicate key, use type identifier
          for (let x in duplicateIndexes) {
            this.#fields[duplicateIndexes[x]].displayKey = this.#fields[duplicateIndexes[x]].key + "[" + this.#fields[duplicateIndexes[x]].type + "]"
          }
        } else { // Unique key
          this.#fields[i].displayKey = this.#fields[i].key
        }
      }
    }

    // Update array items
    for (let i in this.#fields) {
      if ("arrayParent" in this.#fields[i]) {
        var arrayParent = this.#fields[this.#fields[i].arrayParent]
        this.#fields[i].displayKey = arrayParent.displayKey + "/" + this.#fields[i].arrayIndex.toString()
      }
    }
  }

  // Generates lower resolutions of data for faster visualization
  generateResolutions() {
    this.#fields.forEach(field => {
      if (!("arrayParent" in field)) {
        var originalData = field.resolutions[0]
        Log.resolutions.forEach(resolution => {
          var data = { timestampIndexes: [], values: [] }
          var i = originalData.timestampIndexes.length - 1
          var lastTimestamp = Infinity
          while (i >= 0) {
            var currentTimestamp = this.#timestamps[originalData.timestampIndexes[i]]
            if (lastTimestamp - currentTimestamp > resolution) {
              data.timestampIndexes.splice(0, 0, originalData.timestampIndexes[i])
              data.values.splice(0, 0, originalData.values[i])
              lastTimestamp = currentTimestamp
            }
            i--
          }
          field.resolutions[resolution] = data
        })
      }
    })
  }
}