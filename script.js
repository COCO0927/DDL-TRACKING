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
    const color = document.getElementById("taskColor").value; // 获取颜色

    if (!name || !date) {
        alert("Please enter both task name and deadline date.");
        return;
    }

    // 将颜色添加到任务对象中
    taskList.push({ name, date, color, completed: false });
    saveTasks();

    // 清空输入框，保留颜色
    document.getElementById("taskName").value = "";
    document.getElementById("taskDate").value = "";
}

// ====== 保存并重新渲染 ======
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTasks();
    renderCalendar();
}

// ====== 计算剩余天数 ======
function calculateDaysLeft(deadlineDate) {
    const today = new Date();
    // 确保日期对象只包含 YYYY-MM-DD，并将其时间设置为午夜，防止时区影响计算
    const deadline = new Date(deadlineDate);
    deadline.setHours(0, 0, 0, 0); 
    today.setHours(0, 0, 0, 0);

    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today!";
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago (Expired)`;
    return `${diffDays} days left`;
}


// ====== 渲染左侧任务列表 ======
function renderTasks() {
    const list = document.getElementById("taskList");
    list.innerHTML = "";

    taskList.forEach((task, index) => {
        const li = document.createElement("li");
        li.className = "task-item";
        
        // 使用任务的颜色设置边框
        li.style.borderLeft = `5px solid ${task.color}`;

        const daysLeft = calculateDaysLeft(task.date);

        li.innerHTML = `
            <span class="${task.completed ? "completed" : ""}">
                ${task.name} — ${task.date}
                <br><small>Deadline: **${daysLeft}**</small>
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
    const calendarContainer = document.getElementById("calendar");
    const monthTitleElement = document.getElementById("monthTitle");
    
    calendarContainer.innerHTML = ""; // 清空日历内容

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); 
    
    // 获取今天的日期 (用于高亮)
    const today = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 更新月份标题
    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];
    monthTitleElement.innerText = `${monthNames[month]} ${year}`;


    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // 周一到周日对齐的偏移量
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
        
        // 高亮今天 (粉色)
        if (day === today && month === currentMonth && year === currentYear) {
            cell.classList.add('today-highlight');
        }

        // 检查当天是否有任务，并找出任务颜色
        const tasksOnDay = taskList.filter(task => {
            const dateParts = task.date.split('-'); 
            if (dateParts.length === 3) {
                const taskYear = parseInt(dateParts[0]);
                const taskMonth = parseInt(dateParts[1]) - 1; 
                const taskDay = parseInt(dateParts[2]);

                return taskYear === year && taskMonth === month && taskDay === day;
            }
            return false;
        });

        if (tasksOnDay.length > 0) {
            // 只取第一个任务的颜色作为标记颜色
            const markerColor = tasksOnDay[0].color;
            
            const dot = document.createElement("div");
            dot.className = "task-marker"; // 样式已改为更居中、更大的标记
            dot.style.backgroundColor = markerColor; // 使用任务的颜色
            
            cell.appendChild(dot);
        }

        calendarContainer.appendChild(cell);
    }
}
