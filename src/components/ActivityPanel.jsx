import React from "react";
import { logger } from "../utils/activityLogger";

const ActivityPanel = () => {
  const logs = logger.getLogs();

  return (
    <div>
      <h3>System Activity</h3>
      {logs.map((log) => (
        <div key={log.id}>
          {log.action} - {new Date(log.time).toLocaleTimeString()}
        </div>
      ))}
    </div>
  );
};

export default ActivityPanel;