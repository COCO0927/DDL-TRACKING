let taskList = JSON.parse(localStorage.getItem("tasks")) || [];

const taskListElement = document.getElementById("taskList");
const addTaskBtn = document.getElementById("addTaskBtn");

function renderTasks() {
    taskListElement.innerHTML = "";

    taskList.forEach((task, index) => {
        const li = document.createElement("li");
        li.className = "task-item";

        if (task.completed) li.classList.add("completed");

        li.innerHTML = `
            <span>${task.name} — <small>${task.date}</small></span>
            <div>
                <button onclick="toggleTask(${index})">Done</button>
                <button onclick="deleteTask(${index})">Delete</button>
            </div>
        `;

        taskListElement.appendChild(li);
    });
}

function addTask() {
    const name = document.getElementById("taskName").value;
    const date = document.getElementById("taskDate").value;

    if (name.trim() === "" || date === "") {
        alert("Please enter a task name and date.");
        return;
    }

    taskList.push({
        name,
        date,
        completed: false,
    });

    saveTasks();
    renderTasks();

    document.getElementById("taskName").value = "";
    document.getElementById("taskDate").value = "";
}

function toggleTask(index) {
    taskList[index].completed = !taskList[index].completed;
    saveTasks();
    renderTasks();
}

function deleteTask(index) {
    taskList.splice(index, 1);
    saveTasks();
    renderTasks();
}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(taskList));
}

addTaskBtn.addEventListener("click", addTask);

renderTasks();
