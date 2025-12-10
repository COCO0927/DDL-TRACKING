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

// ======== CALENDAR RENDERING ========

function renderCalendar() {
    const calendar = document.getElementById("calendar");
    calendar.innerHTML = "";

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // 本月第一天
    const firstDay = new Date(year, month, 1).getDay(); 
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // 空白填充
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");
        calendar.appendChild(empty);
    }

    // 日期格子
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement("div");
        cell.className = "calendar-day";
        cell.innerText = day;

        // 如果这天有任务 → 显示红点
        const hasTask = taskList.some(t => t.date.endsWith(-${String(day).padStart(2, "0")}));
        if (hasTask) {
            const dot = document.createElement("div");
            dot.className = "task-dot";
            cell.appendChild(dot);
        }

        calendar.appendChild(cell);
    }
}

renderCalendar();

// 在任务变动时刷新日历
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTasks();
    renderCalendar();
}
