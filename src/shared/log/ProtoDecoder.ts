// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import protobuf from "protobufjs";
import descriptor from "protobufjs/ext/descriptor";

type ProtoPostProcessor = (
  data: Record<string, unknown>,
  schemaTypes: { [key: string]: string },
  prefix: string
) => void;

/** Class to manage decoding protobufs. */
export default class ProtoDecoder {
  private static readonly postProcessors = new Map<string, ProtoPostProcessor>([
    ["mrc.proto.ProtobufControlData", ProtoDecoder.postProcessControlData]
  ]);

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
        filePackage.add(protobuf.Type.fromDescriptor(fileDescriptor.messageType[i], fileDescriptor.syntax));
      }
    }
    if (fileDescriptor.enumType) {
      for (let i = 0; i < fileDescriptor.enumType.length; i++) {
        filePackage.add(protobuf.Enum.fromDescriptor(fileDescriptor.enumType[i]));
      }
    }
    if (fileDescriptor.extension) {
      for (let i = 0; i < fileDescriptor.extension.length; i++) {
        filePackage.add(protobuf.Field.fromDescriptor(fileDescriptor.extension[i]));
      }
    }
    if (fileDescriptor.service) {
      for (let i = 0; i < fileDescriptor.service.length; i++) {
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
    let objectData = type.toObject(decodedData, { defaults: true }) as Record<string, unknown>;
    ProtoDecoder.applyPostProcessors(type, objectData, schemaTypes);
    return {
      data: objectData,
      schemaTypes: schemaTypes
    };
  }

  /** Runs any registered post-processors for the given message type and nested message fields. */
  private static applyPostProcessors(
    type: protobuf.Type,
    data: Record<string, unknown>,
    schemaTypes: { [key: string]: string },
    prefix = ""
  ): void {
    let fullName = type.fullName.startsWith(".") ? type.fullName.slice(1) : type.fullName;
    ProtoDecoder.postProcessors.get(fullName)?.(data, schemaTypes, prefix);

    for (let field of type.fieldsArray) {
      if (!(field.resolvedType instanceof protobuf.Type)) continue;
      let value = data[field.name];
      if (value === null || typeof value !== "object") continue;
      let childPrefix = prefix ? `${prefix}/${field.name}` : field.name;
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (item !== null && typeof item === "object") {
            ProtoDecoder.applyPostProcessors(
              field.resolvedType as protobuf.Type,
              item as Record<string, unknown>,
              schemaTypes,
              `${childPrefix}/${index}`
            );
          }
        });
      } else {
        ProtoDecoder.applyPostProcessors(
          field.resolvedType,
          value as Record<string, unknown>,
          schemaTypes,
          childPrefix
        );
      }
    }
  }

  private static CONTROL_WORD_ROBOT_MODES = ["Unknown", "Autonomous", "Teleoperated", "Utility"] as const;
  private static CONTROL_WORD_ALLIANCE_STATIONS = ["Red 1", "Red 2", "Red 3", "Blue 1", "Blue 2", "Blue 3"] as const;

  /** Expands the packed control word integer in mrc.proto.ProtobufControlData into structured fields. */
  private static postProcessControlData(
    data: Record<string, unknown>,
    schemaTypes: { [key: string]: string },
    prefix: string
  ): void {
    let fieldKey = "ControlWord" in data ? "ControlWord" : null;
    if (fieldKey === null || typeof data[fieldKey] !== "number") return;
    let word = data[fieldKey] as number;
    data[fieldKey] = {
      enabled: (word & 1) !== 0,
      robotMode: ProtoDecoder.CONTROL_WORD_ROBOT_MODES[(word >> 1) & 3],
      eStop: ((word >> 3) & 1) !== 0,
      fmsConnected: ((word >> 4) & 1) !== 0,
      dsConnected: ((word >> 5) & 1) !== 0,
      allianceStation: ProtoDecoder.CONTROL_WORD_ALLIANCE_STATIONS[(word >> 8) & 15] ?? "Unknown",
      timedMatch: ((word >> 13) & 1) !== 0
    };
    schemaTypes[prefix ? `${prefix}/${fieldKey}` : fieldKey] = "ControlWord";
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
