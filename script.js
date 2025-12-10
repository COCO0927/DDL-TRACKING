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
    const color = document.getElementById("taskColor").value; 

    if (!name || !date) {
        alert("Please enter both task name and deadline date.");
        return;
    }

    taskList.push({ name, date, color, completed: false });
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

// ====== 计算剩余天数和过期状态 ======
function calculateDaysLeft(deadlineDate) {
    const today = new Date();
    const deadline = new Date(deadlineDate);
    deadline.setHours(0, 0, 0, 0); 
    today.setHours(0, 0, 0, 0);

    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return { text: "Today!", isOverdue: false };
    if (diffDays < 0) return { text: `${Math.abs(diffDays)} days ago (Expired)`, isOverdue: true };
    return { text: `${diffDays} days left`, isOverdue: false };
}


// ====== 渲染左侧任务列表 ======
function renderTasks() {
    const list = document.getElementById("taskList");
    list.innerHTML = "";

    taskList.forEach((task, index) => {
        const li = document.createElement("li");
        li.className = "task-item";
        
        const { text: daysLeft, isOverdue } = calculateDaysLeft(task.date);

        // 过期任务高亮
        if (isOverdue && !task.completed) {
            li.classList.add('overdue');
        }

        // 使用任务的颜色设置边框
        li.style.borderLeft = `5px solid ${task.color}`;

        li.innerHTML = `
            <span class="${task.completed ? "completed" : ""}">
                ${task.name} — ${task.date}
                <br><small>Deadline: <strong>${daysLeft}</strong></small>
            </span>
            <div class="task-actions">
                <button class="edit-btn" onclick="openEditModal(${index})">Edit</button>
                <button onclick="deleteTask(${index})">X</button>
            </div>
        `;
        list.appendChild(li);
    });
}

// ====== 打开编辑弹窗 (简化为 prompt) ======
function openEditModal(index) {
    const task = taskList[index];

    // 提示用户输入新的任务名称
    let newName = prompt("Enter new task name:", task.name);
    if (newName === null || newName.trim() === "") {
        return; // 用户取消或输入为空
    }
    newName = newName.trim();

    // 提示用户输入新的颜色（由于 prompt 不支持颜色选择器，我们使用文本输入）
    // 提示用户输入新的颜色代码，默认使用当前颜色
    let newColor = prompt("Enter new task color (e.g., #ff0000 or red):", task.color);
    if (newColor === null || newColor.trim() === "") {
        newColor = task.color; // 使用旧颜色
    }

    // 更新任务
    taskList[index].name = newName;
    taskList[index].color = newColor.trim();
    
    saveTasks();
    alert("Task updated successfully!");
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
    
    calendarContainer.innerHTML = ""; 

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); 
    
    const today = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];
    monthTitleElement.innerText = `${monthNames[month]} ${year}`;


    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const offset = (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1);

    // 1. 添加星期的头部
    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    weekDays.forEach(dayName => {
        const dayHeader = document.createElement("div");
        dayHeader.className = "calendar-header";
        dayHeader.innerText = dayName;
        calendarContainer.appendChild(dayHeader);
    });

    // 2. 插入空格子
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

        // 查找当天所有的任务
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

        // 渲染任务标记（多任务堆叠显示）
        if (tasksOnDay.length > 0) {
            const maxMarkers = Math.min(tasksOnDay.length, 3); // 最多显示 3 个堆叠标记
            const taskMarkersContainer = document.createElement("div");
            taskMarkersContainer.className = "task-markers-container";

            // 从后往前渲染，以实现堆叠效果
            for (let i = 0; i < maxMarkers; i++) {
                const task = tasksOnDay[i];
                const marker = document.createElement("div");
                marker.className = "task-marker-stacked";
                marker.style.backgroundColor = task.color;
                // 堆叠偏移
                marker.style.transform = `translate(calc(-50% + ${i * 2}px), calc(-50% + ${i * 2}px))`; 
                taskMarkersContainer.appendChild(marker);
            }

            // 如果任务超过 3 个，显示数量
            if (tasksOnDay.length > maxMarkers) {
                 const count = document.createElement("span");
                 count.className = "task-count";
                 count.innerText = `+${tasksOnDay.length - maxMarkers}`;
                 taskMarkersContainer.appendChild(count);
            }
            
            cell.appendChild(taskMarkersContainer);
        }

        calendarContainer.appendChild(cell);
    }
}
