class ActivityLogger {
  constructor() {
    this.logs = [];
  }

  log(action, metadata = {}) {
    const entry = {
      id: crypto.randomUUID(),
      action,
      metadata,
      time: new Date().toISOString()
    };
    this.logs.push(entry);
    console.log("[Activity Log]:", entry);
  }

  getLogs() {
    return this.logs;
  }
}

export const logger = new ActivityLogger();