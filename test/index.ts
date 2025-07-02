import { UniqueIdGenerator } from "../src";

const generator = new UniqueIdGenerator(); // machineId auto-generated using os module

const id = generator.generateUniqueId();
console.log(id); // e.g., 185703470885761025
