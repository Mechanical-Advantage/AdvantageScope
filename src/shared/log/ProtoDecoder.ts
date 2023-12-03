import protobuf from "protobufjs";
import descriptor from "protobufjs/ext/descriptor";

/** Class to manage decoding protobufs. */
export default class ProtoDecoder {
  private root = new protobuf.Root();
  private rawDescriptors: Uint8Array[] = [];

  /** Registers a new descriptor. */
  addDescriptor(data: Uint8Array): void {
    let fileDescriptor: any = descriptor.FileDescriptorProto.decode(data);
    if (this.root.files.includes(fileDescriptor.name)) return; // Duplicate filename
    this.rawDescriptors.push(data);
    let filePackage: any = this.root;
    if (fileDescriptor.package && fileDescriptor.package.length > 0) {
      filePackage = this.root.define(fileDescriptor.package);
    }
    if (fileDescriptor.name && fileDescriptor.name.length > 0) {
      filePackage.filename = fileDescriptor.name;
      this.root.files.push(fileDescriptor.name);
    }
    if (fileDescriptor.messageType) {
      for (let i = 0; i < fileDescriptor.messageType.length; i++) {
        // @ts-expect-error
        filePackage.add(protobuf.Type.fromDescriptor(fileDescriptor.messageType[i], fileDescriptor.syntax));
      }
    }
    if (fileDescriptor.enumType) {
      for (let i = 0; i < fileDescriptor.enumType.length; i++) {
        // @ts-expect-error
        filePackage.add(protobuf.Enum.fromDescriptor(fileDescriptor.enumType[i]));
      }
    }
    if (fileDescriptor.extension) {
      for (let i = 0; i < fileDescriptor.extension.length; i++) {
        // @ts-expect-error
        filePackage.add(protobuf.Field.fromDescriptor(fileDescriptor.extension[i]));
      }
    }
    if (fileDescriptor.service) {
      for (let i = 0; i < fileDescriptor.service.length; i++) {
        // @ts-expect-error
        filePackage.add(protobuf.Service.fromDescriptor(fileDescriptor.service[i]));
      }
    }
  }

  /** Decodes protobuf data to a JS object. */
  decode(name: string, data: Uint8Array): { data: unknown; schemaTypes: { [key: string]: string } } {
    let type = this.root.lookupType(name); // Throws if not found
    let decodedData = type.decode(data) as any;
    let schemaTypes: { [key: string]: string } = {};
    let findSchemaTypes = (root: any, key: string) => {
      if (typeof root === "object") {
        if (Array.isArray(root)) {
          let arrayTypes: Set<string> = new Set();
          root.forEach((object, index) => {
            findSchemaTypes(object, key + "/" + index.toString());
            if (object.$type) {
              arrayTypes.add(ProtoDecoder.getFriendlySchemaType(root[0].$type.name));
            }
          });
          if (arrayTypes.size === 1) {
            arrayTypes.forEach((arrayType) => {
              schemaTypes[key] = arrayType + "[]";
            });
          }
        } else if (root.$type) {
          schemaTypes[key] = ProtoDecoder.getFriendlySchemaType(root.$type.name);
          Object.keys(root).forEach((childKey) => {
            findSchemaTypes(root[childKey], key + "/" + childKey);
          });
        }
      }
    };
    Object.keys(decodedData).forEach((key) => {
      findSchemaTypes(decodedData[key], key);
    });
    return {
      data: decodedData.toJSON(),
      schemaTypes: schemaTypes
    };
  }

  /** Converts a schema type with full package name to a friendly version. */
  static getFriendlySchemaType(schemaType: string): string {
    let result = schemaType;
    if (schemaType.includes(".")) {
      let splitType = schemaType.split(".");
      result = splitType[splitType.length - 1];
    }
    if (result.startsWith("Protobuf")) {
      result = result.slice("Protobuf".length);
    }
    return result;
  }

  /** Returns a serialized version of the data from this decoder. */
  toSerialized(): any {
    return this.rawDescriptors;
  }

  /** Creates a new decoder based on the data from `toSerialized()` */
  static fromSerialized(serializedData: any) {
    let decoder = new ProtoDecoder();
    serializedData.forEach((descriptor: Uint8Array) => {
      decoder.addDescriptor(descriptor);
    });
    return decoder;
  }
}
