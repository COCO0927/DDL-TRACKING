// ====== 全局任务列表 ======
let taskList = JSON.parse(localStorage.getItem("tasks") || "[]");

// ====== 初始化 ======
document.addEventListener("DOMContentLoaded", () => {
    renderTasks();
    renderCalendar();

    document.getElementById("addTaskBtn").addEventListener("click", addTask);
});

// ====== 添加任务 ======
function addTask() {
    const name = document.getElementById("taskName").value;
    const date = document.getElementById("taskDate").value;

    if (!name || !date) {
        alert("Please enter both name and date.");
        return;
    }

    taskList.push({ name, date, completed: false });
    saveTasks();

    document.getElementById("taskName").value = "";
    document.getElementById("taskDate").value = "";
}

// ====== 保存并重新渲染 ======
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTasks();
    renderCalendar();
}

// ====== 渲染左侧任务列表 ======
function renderTasks() {
    const list = document.getElementById("taskList");
    list.innerHTML = "";

    taskList.forEach((task, index) => {
        const li = document.createElement("li");
        li.className = "task-item";

        li.innerHTML = `
            <span class="${task.completed ? "completed" : ""}">
                ${task.name} — ${task.date}
            </span>
            <button onclick="deleteTask(${index})">X</button>
        `;
        list.appendChild(li);
    });
}

// ====== 删除任务 ======
function deleteTask(i) {
    taskList.splice(i, 1);
    saveTasks();
}

// ====== 渲染日历 ======
function renderCalendar() {
    const calendar = document.getElementById("calendar");
    calendar.innerHTML = "";

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // 本月第一天星期几（0=周日）
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // 为了让周一起始，我们重新调整
    const offset = (firstDay === 0 ? 6 : firstDay - 1);

    // 空格子
    for (let i = 0; i < offset; i++) {
        const empty = document.createElement("div");
        calendar.appendChild(empty);
    }

    // 日期格子
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement("div");
        cell.className = "calendar-day";
        cell.innerText = day;

        // 如果任务日期是此日期 → 显示红点
        const hasTask = taskList.some(task => {
            const d = new Date(task.date);
            return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
        });

        if (hasTask) {
            const dot = document.createElement("div");
            dot.className = "task-dot";
            cell.appendChild(dot);
        }

        calendar.appendChild(cell);
    }
}
