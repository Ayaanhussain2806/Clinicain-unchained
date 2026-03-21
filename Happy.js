// File: taskManager.js

class Task {
    constructor(id, title, priority, dueDate) {
        this.id = id;
        this.title = title;
        this.priority = priority;
        this.dueDate = new Date(dueDate);
        this.completed = false;
        this.createdAt = new Date();
    }

    markComplete() {
        this.completed = true;
    }

    toString() {
        return `[${this.completed ? "✓" : "✗"}] (${this.id}) ${this.title} | Priority: ${this.priority} | Due: ${this.dueDate.toDateString()}`;
    }
}

class TaskManager {
    constructor() {
        this.tasks = [];
        this.nextId = 1;
    }

    addTask(title, priority = "Medium", dueDate = new Date()) {
        const task = new Task(this.nextId++, title, priority, dueDate);
        this.tasks.push(task);
        return task;
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
    }

    markTaskComplete(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.markComplete();
        }
    }

    getAllTasks() {
        return this.tasks;
    }

    getCompletedTasks() {
        return this.tasks.filter(task => task.completed);
    }

    getPendingTasks() {
        return this.tasks.filter(task => !task.completed);
    }

    getTasksByPriority(priority) {
        return this.tasks.filter(task => task.priority === priority);
    }

    sortByDueDate() {
        return this.tasks.sort((a, b) => a.dueDate - b.dueDate);
    }

    sortByPriority() {
        const order = { High: 1, Medium: 2, Low: 3 };
        return this.tasks.sort((a, b) => order[a.priority] - order[b.priority]);
    }

    printTasks(tasks = this.tasks) {
        if (tasks.length === 0) {
            console.log("No tasks available.");
            return;
        }
        tasks.forEach(task => console.log(task.toString()));
    }
}

// Utility functions
function generateSampleTasks(manager) {
    manager.addTask("Learn JavaScript", "High", "2026-04-01");
    manager.addTask("Practice DSA", "High", "2026-03-25");
    manager.addTask("Workout", "Medium", "2026-03-22");
    manager.addTask("Read a book", "Low", "2026-04-10");
    manager.addTask("Build project", "High", "2026-03-30");
    manager.addTask("Meditation", "Low", "2026-03-23");
}

function simulateCLI() {
    const manager = new TaskManager();

    console.log("=== Generating Sample Tasks ===");
    generateSampleTasks(manager);

    console.log("\n=== All Tasks ===");
    manager.printTasks();

    console.log("\n=== Mark Task 2 as Complete ===");
    manager.markTaskComplete(2);
    manager.printTasks();

    console.log("\n=== Pending Tasks ===");
    manager.printTasks(manager.getPendingTasks());

    console.log("\n=== Completed Tasks ===");
    manager.printTasks(manager.getCompletedTasks());

    console.log("\n=== High Priority Tasks ===");
    manager.printTasks(manager.getTasksByPriority("High"));

    console.log("\n=== Sorted by Due Date ===");
    manager.printTasks(manager.sortByDueDate());

    console.log("\n=== Sorted by Priority ===");
    manager.printTasks(manager.sortByPriority());

    console.log("\n=== Delete Task 3 ===");
    manager.deleteTask(3);
    manager.printTasks();
}

// Advanced features
class Analytics {
    static getTaskStats(tasks) {
        let completed = 0;
        let pending = 0;

        tasks.forEach(task => {
            if (task.completed) completed++;
            else pending++;
        });

        return {
            total: tasks.length,
            completed,
            pending
        };
    }

    static getOverdueTasks(tasks) {
        const today = new Date();
        return tasks.filter(task => !task.completed && task.dueDate < today);
    }
}

// Run simulation
simulateCLI();

// Analytics Demo
const manager = new TaskManager();
generateSampleTasks(manager);
manager.markTaskComplete(1);
manager.markTaskComplete(4);

console.log("\n=== Analytics ===");
const stats = Analytics.getTaskStats(manager.getAllTasks());
console.log(`Total: ${stats.total}, Completed: ${stats.completed}, Pending: ${stats.pending}`);

console.log("\n=== Overdue Tasks ===");
const overdue = Analytics.getOverdueTasks(manager.getAllTasks());
overdue.forEach(task => console.log(task.toString()));

// Extra: Async Simulation
function fetchTasksFromServer() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { title: "Server Task 1", priority: "Medium", dueDate: "2026-04-05" },
                { title: "Server Task 2", priority: "High", dueDate: "2026-03-28" }
            ]);
        }, 1000);
    });
}

async function loadExternalTasks(manager) {
    console.log("\n=== Loading External Tasks ===");
    const data = await fetchTasksFromServer();
    data.forEach(item => {
        manager.addTask(item.title, item.priority, item.dueDate);
    });
    manager.printTasks();
}

loadExternalTasks(manager);