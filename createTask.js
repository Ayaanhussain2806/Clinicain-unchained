// Utility function to create a task object

export const createTask = (title, description = "") => {
  return {
    id: Date.now(), // unique ID
    title: title.trim(),
    description: description.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };
};