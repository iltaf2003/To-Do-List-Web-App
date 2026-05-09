// DOM Elements
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const themeToggle = document.getElementById('theme-toggle');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clear-completed');
const progressFill = document.getElementById('progress-fill');
const totalTasksEl = document.getElementById('total-tasks');
const completedTasksEl = document.getElementById('completed-tasks');
const remainingTasksEl = document.getElementById('remaining-tasks');

// Global Variables
let tasks = [];
let currentFilter = 'all';

// Load tasks from Local Storage
function loadTasks() {
    const savedTasks = localStorage.getItem('todo-tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
    renderTasks();
    updateProgress();
}

// Save tasks to Local Storage
function saveTasks() {
    localStorage.setItem('todo-tasks', JSON.stringify(tasks));
}

// Add new task
function addTask(text) {
    if (!text.trim()) {
        alert('Please enter a task!');
        return;
    }
    
    const task = {
        id: Date.now(),
        text: text.trim(),
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(task);
    saveTasks();
    renderTasks();
    updateProgress();
    taskInput.value = '';
    taskInput.focus();
}

// Edit task
function editTask(id, newText) {
    const task = tasks.find(t => t.id === id);
    if (task && newText.trim()) {
        task.text = newText.trim();
        saveTasks();
        renderTasks();
    }
}

// Delete task
function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
        updateProgress();
    }
}

// Toggle task completion
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        updateProgress();
    }
}

// Clear completed tasks
function clearCompleted() {
    if (confirm('Are you sure you want to clear all completed tasks?')) {
        tasks = tasks.filter(t => !t.completed);
        saveTasks();
        renderTasks();
        updateProgress();
    }
}

// Filter tasks
function filterTasks(filter) {
    currentFilter = filter;
    filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    renderTasks();
}

// Update progress bar and counters
function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const remaining = total - completed;
    
    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    remainingTasksEl.textContent = remaining;
    
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    progressFill.style.width = `${percentage}%`;
}

// Render tasks based on current filter
function renderTasks() {
    const filteredTasks = tasks.filter(task => {
        switch (currentFilter) {
            case 'active':
                return !task.completed;
            case 'completed':
                return task.completed;
            default:
                return true;
        }
    });
    
    taskList.innerHTML = '';
    
    if (filteredTasks.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    filteredTasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskItem.dataset.id = task.id;
        
        taskItem.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${task.text}</span>
            <input type="text" class="task-edit-input" value="${task.text}" maxlength="100">
            <div class="task-actions">
                <button class="task-edit-btn">Edit</button>
                <button class="task-delete-btn">Delete</button>
            </div>
        `;
        
        // Event listeners for task item
        const checkbox = taskItem.querySelector('.task-checkbox');
        const editBtn = taskItem.querySelector('.task-edit-btn');
        const deleteBtn = taskItem.querySelector('.task-delete-btn');
        const taskText = taskItem.querySelector('.task-text');
        const editInput = taskItem.querySelector('.task-edit-input');
        
        checkbox.addEventListener('change', () => toggleTask(task.id));
        
        editBtn.addEventListener('click', () => {
            if (editBtn.textContent === 'Edit') {
                taskText.classList.add('editing');
                editInput.classList.add('editing');
                editInput.focus();
                editInput.select();
                editBtn.textContent = 'Save';
            } else {
                editTask(task.id, editInput.value);
                taskText.classList.remove('editing');
                editInput.classList.remove('editing');
                editBtn.textContent = 'Edit';
            }
        });
        
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        editInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                editBtn.click();
            } else if (e.key === 'Escape') {
                editInput.value = task.text;
                editBtn.click();
            }
        });
        
        taskList.appendChild(taskItem);
    });
}

// Theme toggle
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('todo-theme', newTheme);
}

// Load theme from Local Storage
function loadTheme() {
    const savedTheme = localStorage.getItem('todo-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

// Event Listeners
addTaskBtn.addEventListener('click', () => addTask(taskInput.value));

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask(taskInput.value);
    }
});

themeToggle.addEventListener('click', toggleTheme);

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => filterTasks(btn.dataset.filter));
});

clearCompletedBtn.addEventListener('click', clearCompleted);

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    loadTasks();
});
