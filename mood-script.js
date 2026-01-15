let moodData = JSON.parse(localStorage.getItem("moodData") || "{}");
let currentViewDate = new Date();
let selectedDateStr = "";
const emojis = ['😊', '😐', '☹️', '😡', '😴', '💪'];
let selectedEmoji = "";

document.addEventListener("DOMContentLoaded", () => {
    initEmoji();
    render();
    document.getElementById("prevBtn").onclick = () => { currentViewDate.setMonth(currentViewDate.getMonth() - 1); render(); };
    document.getElementById("nextBtn").onclick = () => { currentViewDate.setMonth(currentViewDate.getMonth() + 1); render(); };
    document.getElementById("todayBtn").onclick = () => { currentViewDate = new Date(); render(); };
    document.getElementById("stressLevel").oninput = (e) => document.getElementById("stressVal").innerText = e.target.value;
    document.getElementById("saveBtn").onclick = save;
});

function initEmoji() {
    const container = document.getElementById("emojiOptions");
    emojis.forEach(e => {
        const btn = document.createElement("button");
        btn.className = "bg-slate-800 p-2 rounded-lg text-xl hover:bg-slate-700 transition border-2 border-transparent";
        btn.innerText = e;
        btn.onclick = () => {
            selectedEmoji = e;
            Array.from(container.children).forEach(c => c.style.borderColor = "transparent");
            btn.style.borderColor = "#f472b6";
        };
        container.appendChild(btn);
    });
}

function render() {
    const cal = document.getElementById("calendar");
    cal.innerHTML = "";
    const y = currentViewDate.getFullYear(), m = currentViewDate.getMonth();
    document.getElementById("monthDisplay").innerText = currentViewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const first = new Date(y, m, 1).getDay();
    const days = new Date(y, m + 1, 0).getDate();

    for(let i=0; i<first; i++) cal.appendChild(document.createElement("div"));

  //改了这个函数
    for(let d=1; d<=days; d++) {
        const dateStr = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const cell = document.createElement("div");
        cell.className = "calendar-day";
        
        // --- 新增：根据压力值改变颜色 ---
        if (moodData[dateStr]) {
            const s = parseInt(moodData[dateStr].stress);
            if (s <= 3) cell.classList.add("stress-low");
            else if (s <= 7) cell.classList.add("stress-mid");
            else cell.classList.add("stress-high");
        }

        if (dateStr === selectedDateStr) cell.classList.add("active");
        
        cell.innerHTML = `<span class="day-num">${d}</span>`;
        if (moodData[dateStr] && moodData[dateStr].emoji) {
            const mDiv = document.createElement("div");
            mDiv.className = "day-mood";
            mDiv.innerText = moodData[dateStr].emoji;
            cell.appendChild(mDiv);
        }

        cell.onclick = () => {
            selectedDateStr = dateStr;
            updateEditorUI(dateStr); // 调用新封装的 UI 更新函数
            render();
        };
        cal.appendChild(cell);
    }
}

function save() {
    if(!selectedDateStr) return alert("Select a date!");
    moodData[selectedDateStr] = {
        emoji: selectedEmoji,
        stress: document.getElementById("stressLevel").value,
        note: document.getElementById("dailyNote").value
    };
    localStorage.setItem("moodData", JSON.stringify(moodData));
    render();
    alert("Mood Saved!");
}

//新增函数
function updateEditorUI(dateStr) {
    document.getElementById("displayDate").innerText = dateStr;
    const data = moodData[dateStr] || {emoji:"", stress:5, note:""};
    
    // 获取当前日期字符串进行比较
    const todayStr = new Date().toISOString().split('T')[0];
    const isFuture = dateStr > todayStr;

    // 1. 设置数值
    document.getElementById("stressLevel").value = data.stress;
    document.getElementById("stressVal").innerText = data.stress;
    document.getElementById("dailyNote").value = data.note;

    // 2. 控制权限：如果是未来日期，禁用心情和压力选择
    const emojiArea = document.getElementById("emojiOptions");
    const stressArea = document.getElementById("stressLevel");
    
    if (isFuture) {
        emojiArea.classList.add("u-disabled");
        stressArea.disabled = true;
        stressArea.classList.add("u-disabled");
    } else {
        emojiArea.classList.remove("u-disabled");
        stressArea.disabled = false;
        stressArea.classList.remove("u-disabled");
    }
    
    // 更新选中的表情高亮
    selectedEmoji = data.emoji;
    Array.from(emojiArea.children).forEach(btn => {
        btn.style.borderColor = (btn.innerText === selectedEmoji) ? "#f472b6" : "transparent";
    });
}

// 修改原来的 save 函数，增加对未来日期的安全过滤
function save() {
    if(!selectedDateStr) return alert("Select a date!");
    
    const todayStr = new Date().toISOString().split('T')[0];
    const isFuture = selectedDateStr > todayStr;

    moodData[selectedDateStr] = {
        // 如果是未来日期，强制表情为空，压力为默认5（或者保持原样）
        emoji: isFuture ? "" : selectedEmoji,
        stress: isFuture ? 5 : document.getElementById("stressLevel").value,
        note: document.getElementById("dailyNote").value
    };
    
    localStorage.setItem("moodData", JSON.stringify(moodData));
    render();
    alert(isFuture ? "Note saved for future!" : "Mood & Note saved!");
}
