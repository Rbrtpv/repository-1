const STORAGE_KEY = "task-app-items";

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const taskTemplate = document.querySelector("#task-item-template");
const emptyState = document.querySelector("#empty-state");
const taskCount = document.querySelector("#task-count");
const completionCount = document.querySelector("#completion-count");
const clearCompletedButton = document.querySelector("#clear-completed");
const filterButtons = document.querySelectorAll(".filter-button");

let currentFilter = "all";
let tasks = loadTasks();

function loadTasks() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function createTask(text) {
  return {
    id: crypto.randomUUID(),
    text,
    completed: false,
    createdAt: Date.now(),
  };
}

function getVisibleTasks() {
  if (currentFilter === "active") {
    return tasks.filter((task) => !task.completed);
  }

  if (currentFilter === "completed") {
    return tasks.filter((task) => task.completed);
  }

  return tasks;
}

function updateSummary() {
  const total = tasks.length;
  const complete = tasks.filter((task) => task.completed).length;
  taskCount.textContent = `${total} task${total === 1 ? "" : "s"}`;
  completionCount.textContent = `${complete} complete`;
}

function renderTasks() {
  taskList.innerHTML = "";

  const visibleTasks = getVisibleTasks();
  emptyState.hidden = visibleTasks.length > 0;

  visibleTasks.forEach((task) => {
    const fragment = taskTemplate.content.cloneNode(true);
    const taskItem = fragment.querySelector(".task-item");
    const toggle = fragment.querySelector(".task-toggle");
    const text = fragment.querySelector(".task-text");
    const deleteButton = fragment.querySelector(".delete-button");

    taskItem.dataset.id = task.id;
    taskItem.classList.toggle("completed", task.completed);
    toggle.checked = task.completed;
    text.textContent = task.text;

    toggle.addEventListener("change", () => {
      tasks = tasks.map((entry) =>
        entry.id === task.id ? { ...entry, completed: toggle.checked } : entry,
      );
      saveTasks();
      updateSummary();
      renderTasks();
    });

    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter((entry) => entry.id !== task.id);
      saveTasks();
      updateSummary();
      renderTasks();
    });

    taskList.appendChild(fragment);
  });

  updateSummary();
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = taskInput.value.trim();
  if (!text) {
    taskInput.focus();
    return;
  }

  tasks = [createTask(text), ...tasks];
  saveTasks();
  taskForm.reset();
  taskInput.focus();
  renderTasks();
});

clearCompletedButton.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((entry) => {
      entry.classList.toggle("active", entry === button);
    });
    renderTasks();
  });
});

renderTasks();
