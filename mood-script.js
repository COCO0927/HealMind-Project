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
    container.innerHTML = ""; 
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
    const todayStr = new Date().toISOString().split('T')[0];

    // 填充空白格子
    for(let i=0; i<first; i++) cal.appendChild(document.createElement("div"));

    // 渲染日期格子
    for(let d=1; d<=days; d++) {
        const dateStr = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const cell = document.createElement("div");
        cell.className = "calendar-day";
        
        const isFuture = dateStr > todayStr; 

        // --- 核心颜色逻辑 ---
        if (moodData[dateStr]) {
            if (isFuture) {
                // 未来日期有Note -> 紫色
                cell.classList.add("future-note-cell");
            } else {
                // 过去或今天 -> 根据压力值显示红黄绿
                const s = parseInt(moodData[dateStr].stress || 5);
                if (s <= 3) cell.classList.add("stress-low");
                else if (s <= 7) cell.classList.add("stress-mid");
                else cell.classList.add("stress-high");
            }
        }

        // 选中状态 (Active)
        if (dateStr === selectedDateStr) cell.classList.add("active");
        // 今天状态
        if (dateStr === todayStr) cell.classList.add("today");
        
        cell.innerHTML = `<span class="day-num">${d}</span>`;
        
        // 显示表情 (如果有)
        if (moodData[dateStr] && moodData[dateStr].emoji) {
            const mDiv = document.createElement("div");
            mDiv.className = "day-mood";
            mDiv.innerText = moodData[dateStr].emoji;
            cell.appendChild(mDiv);
        }

        // 点击事件
        cell.onclick = () => {
            selectedDateStr = dateStr;
            updateEditorUI(dateStr); 
            render(); // 关键：点击后立即重绘，显示 active 效果
        };
        cal.appendChild(cell);
    }
}

function updateEditorUI(dateStr) {
    document.getElementById("displayDate").innerText = dateStr;
    const data = moodData[dateStr] || {emoji:"", stress:5, note:""};
    
    const todayStr = new Date().toISOString().split('T')[0];
    const isFuture = dateStr > todayStr;

    document.getElementById("stressLevel").value = data.stress;
    document.getElementById("stressVal").innerText = data.stress;
    document.getElementById("dailyNote").value = data.note;

    const emojiArea = document.getElementById("emojiOptions");
    const stressArea = document.getElementById("stressLevel");
    
    if (isFuture) {
        emojiArea.classList.add("u-disabled");
        stressArea.disabled = true;
        stressArea.classList.add("u-disabled");
        selectedEmoji = ""; 
    } else {
        emojiArea.classList.remove("u-disabled");
        stressArea.disabled = false;
        stressArea.classList.remove("u-disabled");
        selectedEmoji = data.emoji;
    }
    
    // 更新左侧表情按钮的高亮状态
    Array.from(emojiArea.children).forEach(btn => {
        btn.style.borderColor = (btn.innerText === selectedEmoji && selectedEmoji !== "") ? "#f472b6" : "transparent";
    });
}

function save() {
    if(!selectedDateStr) return alert("Please select a date first!");
    
    const todayStr = new Date().toISOString().split('T')[0];
    const isFuture = selectedDateStr > todayStr;

    moodData[selectedDateStr] = {
        emoji: isFuture ? "" : selectedEmoji, 
        stress: isFuture ? 5 : document.getElementById("stressLevel").value, 
        note: document.getElementById("dailyNote").value
    };
    
    localStorage.setItem("moodData", JSON.stringify(moodData));
    render();
    alert(isFuture ? "Future Note Saved!" : "Mood Saved Successfully!");
}
