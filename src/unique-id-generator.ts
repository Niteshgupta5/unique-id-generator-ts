/**
 * UniqueIdGenerator
 * 
 * A high-performance unique ID generator based on Snowflake architecture.
 * Generates a 64-bit numeric ID composed of:
 * 
 *   - 41 bits for timestamp (in milliseconds since a custom epoch)
 *   - 10 bits for machine ID (auto-generated from OS network interface)
 *   - 12 bits for sequence number (increments within the same millisecond)
 * 
 * Features:
 * - Generates up to 4096 unique IDs per millisecond per machine
 * - Ensures time-ordered and compact identifiers
 * - Automatically derives a consistent machine ID using Node.js `os` module
 * - Includes decoding method to extract timestamp, machine ID, and sequence
 * 
 * Example ID structure:
 *   (timestamp << 22) | (machineId << 12) | sequence
 * 
 * Suitable for distributed systems where unique, sortable, and compact IDs are needed.
 */

import * as os from "os";
import { IDecodedIdResponse } from "./domain";

export class UniqueIdGenerator {
  private epoch: number;
  private machineId: number;
  private sequence: number;
  private lastTimestamp: number;

  constructor(epoch = 1700000000000) {
    this.epoch = epoch;
    this.machineId = this.generateUniqueMachineId(); // 10 bits for machineId (0-1023)
    this.sequence = 1;
    this.lastTimestamp = -1;
  }

  /**
 * Generates a unique 64-bit ID based on timestamp, machine ID, and sequence.
 * Returns a `bigint` ID.
 */
  public generateUniqueId(): string {
    let timestamp = this.currentTimestamp();

    if (timestamp < this.lastTimestamp) {
      throw new Error("Clock moved backwards. Refusing to generate ID.");
    }

    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1) & 0xfff; // 12 bits for sequence
      if (this.sequence === 1) {
        while (timestamp <= this.lastTimestamp) {
          timestamp = this.currentTimestamp();
        }
      }
    } else {
      this.sequence = 1;
    }

    this.lastTimestamp = timestamp;

    // Combine parts to create a unique ID
    return (
      (BigInt(timestamp) << BigInt(22)) |
      (BigInt(this.machineId) << BigInt(12)) | // 10 bits for machineId (shifted to the appropriate position)
      BigInt(this.sequence)
    ).toString();
  }

  /**
 * Decodes a 64-bit ID into timestamp, machine ID, and sequence.
 * @param id - The ID to decode
 * @param epoch - (Optional) Custom epoch used during ID generation. Defaults to the instance's epoch.
 * @returns An object with timestamp, machineId, and sequence
 */

  public decodeId(id: string, epoch?: number): IDecodedIdResponse {
    if (!epoch) {
      epoch = 1700000000000;
    }
    // Convert the ID to a BigInt
    const bigIntId = BigInt(id);

    // 41 bits for timestamp, shift the ID by 22 to get the timestamp
    const timestamp = Number(bigIntId >> BigInt(22));

    // Extract the machineId (next 10 bits), shift the ID by 12 bits (timestamp + sequence) and mask with 0x3FF (10 bits)
    const machineId = Number((bigIntId >> BigInt(12)) & BigInt(0x3ff));

    // Extract the sequence (last 12 bits), mask with 0xFFF (12 bits)
    const sequence = Number(bigIntId & BigInt(0xfff));

    // Calculate the actual timestamp by adding the epoch back
    const actualTimestamp = epoch + timestamp;

    return {
      timestamp: actualTimestamp,
      machineId: machineId,
      sequence: sequence,
    };
  }

  private currentTimestamp() {
    return Date.now() - this.epoch;
  }

  private generateUniqueMachineId(): number {
    // Step 1: Get the MAC address of the first non-internal network interface
    const networkInterfaces = os.networkInterfaces();
    let macAddress = null;

    for (const interfaceName in networkInterfaces) {
      const interfaces = networkInterfaces[interfaceName];
      if (!interfaces) continue;
      for (const net of interfaces) {
        if (!net.internal && net.mac !== "00:00:00:00:00:00") {
          macAddress = net.mac;
          break;
        }
      }
      if (macAddress) break;
    }
    if (!macAddress) {
      throw new Error("Unable to find a valid MAC address.");
    }

    // Step 2: Convert MAC address to a number
    const macAsNumber = parseInt(macAddress.replace(/:/g, ""), 16); // Convert MAC address to a number
    const uniqueId = macAsNumber % 1024; // 10-bit range

    return uniqueId;
  }
}
