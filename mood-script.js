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

    for(let d=1; d<=days; d++) {
        const dateStr = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const cell = document.createElement("div");
        cell.className = "calendar-day";
        if (dateStr === selectedDateStr) cell.classList.add("active");
        
        cell.innerHTML = `<span class="day-num">${d}</span>`;
        if (moodData[dateStr]) {
            const mDiv = document.createElement("div");
            mDiv.className = "day-mood";
            mDiv.innerText = moodData[dateStr].emoji;
            cell.appendChild(mDiv);
        }
        cell.onclick = () => {
            selectedDateStr = dateStr;
            document.getElementById("displayDate").innerText = dateStr;
            const data = moodData[dateStr] || {emoji:"", stress:5, note:""};
            document.getElementById("stressLevel").value = data.stress;
            document.getElementById("stressVal").innerText = data.stress;
            document.getElementById("dailyNote").value = data.note;
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
