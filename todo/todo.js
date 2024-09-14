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
    };

    // Add the delete button to the task item
    taskItem.appendChild(deleteBtn);

    // Add the task item to the task list
    let taskList = document.getElementById('taskList');
    taskList.appendChild(taskItem);

    // Clear the input field for the next task
    taskInput.value = "";
}
