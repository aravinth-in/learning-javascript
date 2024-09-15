document.addEventListener('DOMContentLoaded', (event) => {
    loadTasks();
});

function addTask() {
    let taskInput = document.getElementById('taskInput');
    let task = taskInput.value;

    if (task === "") {
        alert("Please enter a task!");
        return;
    }

    let taskItem = createTaskItem(task, false);
    let taskList = document.getElementById('taskList');
    taskList.appendChild(taskItem);

    taskInput.value = "";
    saveTasks();
}

function createTaskItem(taskText, isCompleted) {
    let taskItem = document.createElement('li');
    taskItem.textContent = taskText;

    if (isCompleted) {
        taskItem.classList.add('completed');
    }

    let editBtn = createButton('Edit', () => {
        let newTask = prompt("Edit your task:", taskItem.textContent.replace("EditDeleteComplete", "").trim());
        if (newTask !== null && newTask !== "") {
            taskItem.firstChild.textContent = newTask;
            saveTasks();
        }
    });

    let deleteBtn = createButton('Delete', () => {
        taskItem.remove();
        saveTasks();
    });

    let completeBtn = createButton('Complete', () => {
        taskItem.classList.toggle('completed');
        saveTasks();
    });

    taskItem.appendChild(editBtn);
    taskItem.appendChild(deleteBtn);
    taskItem.appendChild(completeBtn);

    return taskItem;
}

function createButton(text, onClick) {
    let button = document.createElement('button');
    button.textContent = text;
    button.onclick = onClick;
    return button;
}

function saveTasks() {
    let taskList = document.getElementById('taskList');
    let tasks = [];
    for (let i = 0; i < taskList.children.length; i++) {
        let taskItem = taskList.children[i];
        let task = {
            text: taskItem.firstChild.textContent,
            completed: taskItem.classList.contains('completed')
        };
        tasks.push(task);
    }
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    let tasks = JSON.parse(localStorage.getItem('tasks'));
    if (tasks) {
        let taskList = document.getElementById('taskList');
        for (let i = 0; i < tasks.length; i++) {
            let task = tasks[i];
            let taskItem = createTaskItem(task.text, task.completed);
            taskList.appendChild(taskItem);
        }
    }
}