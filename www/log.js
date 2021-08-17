// Represents all of the data in a log file
class Log {
  #entryCount = 0
  #timestamps = []
  #fields = []

  getFields() {
    return this.#fields
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

  // Adds a new entry. Always call updateDisplayKeys() after adding new entries.
  add(entry) {
    var entryIndex = this.#entryCount
    this.#entryCount += 1
    this.#timestamps.push(entry.timestamp)

    // Update/add fields
    for (let i in entry.data) {
      if (entry.data[i].type == "null") { // Set all types if null
        this.#fields.forEach(function (_, index, arr) {
          if (arr[index].key == entry.data[i].key) {
            arr[index].timestampIndexes.push(entryIndex)
            arr[index].values.push(null)
          }
        })

      } else { // Not null, update the data normally
        var fieldIndex = this.#fields.find(field => field.key == entry.data[i].key && field.type == entry.data[i].type)
        fieldIndex = this.#fields.indexOf(fieldIndex)
        if (fieldIndex > -1) { // Field already exists, add to it
          this.#fields[fieldIndex].timestampIndexes.push(entryIndex)
          this.#fields[fieldIndex].values.push(entry.data[i].value)
        } else { // Create new field
          this.#fields.push({
            key: entry.data[i].key,
            type: entry.data[i].type,
            timestampIndexes: [entryIndex],
            values: [entry.data[i].value]
          })
        }

        // Find fields of a different type to fill
        this.#fields.forEach(function (_, index, arr) {
          if (arr[index].key == entry.data[i].key && arr[index].type != entry.data[i].type) {
            arr[index].timestampIndexes.push(entryIndex)
            arr[index].values.push(null)
          }
        })
      }
    }
  }

  // Update field display keys. Call after adding entries.
  updateDisplayKeys() {
    var allKeys = []
    for (let i in this.#fields) {
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
  }
}