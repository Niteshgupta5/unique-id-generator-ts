# Unique ID Generator

![npm](https://img.shields.io/npm/v/unique-id-generator-ts?color=blue) ![build](https://img.shields.io/badge/build-passing-brightgreen) ![license](https://img.shields.io/npm/l/unique-id-generator-ts)

A high-performance, timestamp-based **64-bit unique ID generator** inspired by Twitter's Snowflake architecture. Suitable for distributed systems, supporting up to **4096 unique IDs per millisecond per machine**.

## ✨ Features

- ✅ 64-bit globally unique ID generation
- 🕒 Based on timestamp, with millisecond precision
- ⚙️ Uses `os` module to generate unique machine ID
- ⚡️ 4096 IDs per millisecond per node
- 🧩 `decodeId()` support to reverse-engineer timestamp, machineId, sequence
- 📦 Lightweight, TypeScript-first implementation

---

## 📦 Installation

```bash
npm install unique-id-generator-ts
```

NPM package: [unique-id-generator-ts](https://www.npmjs.com/package/unique-id-generator-ts)

## 🚀 Usage

```bash
import { UniqueIdGenerator } from 'unique-id-generator-ts';

const generator = new UniqueIdGenerator({ machineId: 1 });

const id = generator.generateUniqueId();
console.log(id); // e.g., 1308924728312342528

// Decode the ID
const decoded = generator.decodeId(id);
console.log("Decoded Info:", decoded);

```

## 📤 Output of decodeId(id)

```bash
{
  timestamp: 1728012388123,
  machineId: 43,
  sequence: 212
}
```

## 🧠 ID Structure: 64-bit Snowflake-Inspired Format

Each ID is a **64-bit integer**, structured as follows:

| Bits | Field      | Description                              |
| ---- | ---------- | ---------------------------------------- |
| 41   | Timestamp  | Milliseconds since custom epoch          |
| 10   | Machine ID | Supports 1024 unique nodes               |
| 12   | Sequence   | Allows 4096 IDs per millisecond per node |

## ⚠️ Important Note

- To ensure ID uniqueness and efficient performance, always create only one instance of UniqueIdGenerator per process.
- Creating multiple instances can lead to duplicated sequence numbers, especially within the same millisecond, and may result in non-unique IDs.

## ✅ Recommended:

```bash
// Instantiate once at app startup
const generator = new UniqueIdGenerator();

// Use the same instance throughout your app
const id = generator.generateUniqueId();
```

## ✅ Pros

- 📏 Compact: Fits in a 64-bit integer (unlike UUIDs)
- ⏱ Time-ordered: Great for databases or event logs
- ⚡️ Fast: Uses simple bitwise operations for performance

## ⚠️ Cons

- 🧩 Slightly more complex than concatenation
- 🔐 Requires machine ID coordination (to avoid collisions)
- 🔁 Sequence limit of 4096 per ms per machine
