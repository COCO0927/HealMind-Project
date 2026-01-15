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
    container.innerHTML = ""; // 清空防止重复生成
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

    const todayStr = new Date().toISOString().split('T')[0];

    for(let d=1; d<=days; d++) {
        const dateStr = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const cell = document.createElement("div");
        cell.className = "calendar-day";
        
        // 渲染压力颜色
        if (moodData[dateStr]) {
            const s = parseInt(moodData[dateStr].stress);
            if (s <= 3) cell.classList.add("stress-low");
            else if (s <= 7) cell.classList.add("stress-mid");
            else cell.classList.add("stress-high");
        }

        // 选中状态
        if (dateStr === selectedDateStr) cell.classList.add("active");
        if (dateStr === todayStr) cell.classList.add("today");
        
        cell.innerHTML = `<span class="day-num">${d}</span>`;
        if (moodData[dateStr] && moodData[dateStr].emoji) {
            const mDiv = document.createElement("div");
            mDiv.className = "day-mood";
            mDiv.innerText = moodData[dateStr].emoji;
            cell.appendChild(mDiv);
        }

        cell.onclick = () => {
            selectedDateStr = dateStr;
            updateEditorUI(dateStr); 
            render(); // 重新渲染以更新 active 状态
        };
        cal.appendChild(cell);
    }
}

function updateEditorUI(dateStr) {
    document.getElementById("displayDate").innerText = dateStr;
    const data = moodData[dateStr] || {emoji:"", stress:5, note:""};
    
    const todayStr = new Date().toISOString().split('T')[0];
    const isFuture = dateStr > todayStr;

    // 更新编辑器的值
    document.getElementById("stressLevel").value = data.stress;
    document.getElementById("stressVal").innerText = data.stress;
    document.getElementById("dailyNote").value = data.note;

    const emojiArea = document.getElementById("emojiOptions");
    const stressArea = document.getElementById("stressLevel");
    
    if (isFuture) {
        // 未来日期：禁用表情和压力条
        emojiArea.classList.add("u-disabled");
        stressArea.disabled = true;
        stressArea.classList.add("u-disabled");
        selectedEmoji = ""; // 清空选中
    } else {
        // 过去/现在：启用
        emojiArea.classList.remove("u-disabled");
        stressArea.disabled = false;
        stressArea.classList.remove("u-disabled");
        selectedEmoji = data.emoji;
    }
    
    // 更新表情按钮的高亮
    Array.from(emojiArea.children).forEach(btn => {
        btn.style.borderColor = (btn.innerText === selectedEmoji && selectedEmoji !== "") ? "#f472b6" : "transparent";
    });
}

function save() {
    if(!selectedDateStr) return alert("Please select a date first!");
    
    const todayStr = new Date().toISOString().split('T')[0];
    const isFuture = selectedDateStr > todayStr;

    // 存储数据
    moodData[selectedDateStr] = {
        emoji: isFuture ? "" : selectedEmoji, // 未来日期不存表情
        stress: isFuture ? 5 : document.getElementById("stressLevel").value, // 未来日期存默认压力
        note: document.getElementById("dailyNote").value
    };
    
    localStorage.setItem("moodData", JSON.stringify(moodData));
    render();
    
    // 成功反馈
    const msg = isFuture ? "Future Note Saved!" : "Mood & Notes Saved Successfully!";
    alert(msg);
}
