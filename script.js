// ====== 全局任务列表 ======
// 初始化时尝试从 localStorage 加载任务列表
let taskList = JSON.parse(localStorage.getItem("tasks") || "[]");

// ====== 初始化 ======
document.addEventListener("DOMContentLoaded", () => {
    // 确保在 DOM 加载完成后执行渲染和事件监听
    renderTasks();
    renderCalendar();

    // 绑定添加任务按钮的点击事件
    document.getElementById("addTaskBtn").addEventListener("click", addTask);
});

// ====== 添加任务 ======
function addTask() {
    const name = document.getElementById("taskName").value;
    const date = document.getElementById("taskDate").value;

    if (!name || !date) {
        alert("Please enter both task name and deadline date.");
        return;
    }

    // 将新任务添加到列表
    taskList.push({ name, date, completed: false });
    
    // 保存并重新渲染列表和日历
    saveTasks();

    // 清空输入框
    document.getElementById("taskName").value = "";
    document.getElementById("taskDate").value = "";
}

// ====== 保存并重新渲染 ======
function saveTasks() {
    // 保存到本地存储
    localStorage.setItem("tasks", JSON.stringify(taskList));
    // 重新渲染左侧列表
    renderTasks();
    // 重新渲染日历
    renderCalendar();
}

// ====== 渲染左侧任务列表 ======
function renderTasks() {
    const list = document.getElementById("taskList");
    list.innerHTML = "";

    taskList.forEach((task, index) => {
        const li = document.createElement("li");
        li.className = "task-item";

        // 任务内容的 HTML 结构，包含删除按钮
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
    // 从列表中删除指定索引的任务
    taskList.splice(i, 1);
    // 保存并重新渲染
    saveTasks();
}

// ====== 渲染日历 ======
function renderCalendar() {
    const calendarContainer = document.getElementById("calendar");
    calendarContainer.innerHTML = ""; // 清空日历内容

    // 获取当前月份信息
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // JS月份从 0 开始 (0=一月)

    // 获取本月第一天是星期几 (0=周日, 1=周一, ...)
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    // 获取本月总天数
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // 为了让日历从周一开始，计算偏移量
    // 如果 firstDayOfWeek 是 0 (周日)，偏移量为 6；否则为 firstDayOfWeek - 1
    const offset = (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1);

    // 1. 添加星期的头部（周一到周日）
    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    weekDays.forEach(dayName => {
        const dayHeader = document.createElement("div");
        dayHeader.className = "calendar-header";
        dayHeader.innerText = dayName;
        calendarContainer.appendChild(dayHeader);
    });

    // 2. 插入空格子以对齐第一天
    for (let i = 0; i < offset; i++) {
        const empty = document.createElement("div");
        empty.className = "calendar-day empty";
        calendarContainer.appendChild(empty);
    }

    // 3. 渲染日期格子
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement("div");
        cell.className = "calendar-day";
        cell.innerText = day;

        // 【关键修复点】：安全解析任务日期，避免时区问题
        const hasTask = taskList.some(task => {
            const dateParts = task.date.split('-'); // 任务日期格式 YYYY-MM-DD
            if (dateParts.length === 3) {
                const taskYear = parseInt(dateParts[0]);
                const taskMonth = parseInt(dateParts[1]) - 1; // 转换为 JS 0-11 月份
                const taskDay = parseInt(dateParts[2]);

                // 比较任务的年、月、日是否与当前日历单元格匹配
                return taskYear === year && taskMonth === month && taskDay === day;
            }
            return false;
        });

        if (hasTask) {
            // 如果当天有任务，添加红点
            const dot = document.createElement("div");
            dot.className = "task-dot";
            cell.appendChild(dot);
        }

        calendarContainer.appendChild(cell);
    }
}
