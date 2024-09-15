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

    // Create a new list item for the task
    let taskItem = document.createElement('li');
    taskItem.textContent = task;

    // Create a delete button for each task
    let deleteBtn = document.createElement('button');
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = function() {
        taskItem.remove();
        saveTasks();
    };

    // Create a complete button for each task
    let completeBtn = document.createElement('button');
    completeBtn.textContent = "Complete";
    completeBtn.onclick = function() {
        taskItem.classList.toggle('completed');
        saveTasks();
    };

    // Create an edit button for each task
    let editBtn = document.createElement('button');
    editBtn.textContent = "Edit";
    editBtn.onclick = function() {
        let newTask = prompt("Edit your task:", taskItem.textContent.replace("EditDeleteComplete", "").trim());
        if (newTask !== null && newTask !== "") {
            taskItem.firstChild.textContent = newTask;
            saveTasks();
        }
    };

    // Add the buttons to the task item
    taskItem.appendChild(editBtn);
    taskItem.appendChild(deleteBtn);
    taskItem.appendChild(completeBtn);

    // Add the task item to the task list
    let taskList = document.getElementById('taskList');
    taskList.appendChild(taskItem);

    // Clear the input field for the next task
    taskInput.value = "";

    // Save tasks to localStorage
    saveTasks();
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
        for (let i = 0; i < tasks.length; i++) {
            let task = tasks[i];

            // Create a new list item for the task
            let taskItem = document.createElement('li');
            taskItem.textContent = task.text;

            if (task.completed) {
                taskItem.classList.add('completed');
            }

            // Create a delete button for each task
            let deleteBtn = document.createElement('button');
            deleteBtn.textContent = "Delete";
            deleteBtn.onclick = function() {
                taskItem.remove();
                saveTasks();
            };

            // Create a complete button for each task
            let completeBtn = document.createElement('button');
            completeBtn.textContent = "Complete";
            completeBtn.onclick = function() {
                taskItem.classList.toggle('completed');
                saveTasks();
            };

            // Create an edit button for each task
            let editBtn = document.createElement('button');
            editBtn.textContent = "Edit";
            editBtn.onclick = function() {
                let newTask = prompt("Edit your task:", taskItem.textContent.replace("EditDeleteComplete", "").trim());
                if (newTask !== null && newTask !== "") {
                    taskItem.firstChild.textContent = newTask;
                    saveTasks();
                }
            };

            // Add the buttons to the task item
            taskItem.appendChild(editBtn);
            taskItem.appendChild(deleteBtn);
            taskItem.appendChild(completeBtn);

            // Add the task item to the task list
            let taskList = document.getElementById('taskList');
            taskList.appendChild(taskItem);
        }
    }
}