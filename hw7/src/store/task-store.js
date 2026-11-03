import fs from 'node:fs';
import path from 'node:path';

export class TaskStore {
  #tasks;
  #filePath;

  constructor({ filePath = null, seed = [] } = {}) {
    if (!Array.isArray(seed)) {
      throw new TypeError('seed must be an array');
    }
    this.#filePath = filePath;
    this.#tasks = this.#load(seed);
  }

  #load(seed) {
    if (!this.#filePath || !fs.existsSync(this.#filePath)) {
      return structuredClone(seed);
    }

    const raw = fs.readFileSync(this.#filePath, 'utf8');
    if (raw.trim() === '') return [];

    const data = JSON.parse(raw);
    if (!Array.isArray(data)) {
      throw new Error('Task data file must contain a JSON array');
    }
    return data;
  }

  #persist() {
    if (!this.#filePath) return;

    fs.mkdirSync(path.dirname(this.#filePath), { recursive: true });
    const tempPath = `${this.#filePath}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(tempPath, `${JSON.stringify(this.#tasks, null, 2)}\n`, 'utf8');
    fs.renameSync(tempPath, this.#filePath);
  }

  list() {
    return structuredClone(this.#tasks);
  }

  get(id) {
    const task = this.#tasks.find((item) => item.id === id);
    return task ? structuredClone(task) : null;
  }

  create(task) {
    this.#tasks.push(structuredClone(task));
    this.#persist();
    return structuredClone(task);
  }

  update(id, task) {
    const index = this.#tasks.findIndex((item) => item.id === id);
    if (index === -1) return null;

    this.#tasks[index] = structuredClone(task);
    this.#persist();
    return structuredClone(task);
  }

  delete(id) {
    const index = this.#tasks.findIndex((item) => item.id === id);
    if (index === -1) return false;

    this.#tasks.splice(index, 1);
    this.#persist();
    return true;
  }

  clear() {
    this.#tasks = [];
    this.#persist();
  }
}
