// Database Transaksi QQTURBO (Data baru akan otomatis masuk ke indeks pertama/atas)
let dbTransactions = {
    deposit: [
        { id: 2, ticket: "DEP-102", member: "Dewi Lestari", amount: 750000, bank: "BCA", endingBalance: "Rp 15.600.000", createdTime: "2026-09-05 22:15:30", status: "Success", date: "2026-09-05" },
        { id: 1, ticket: "DEP-101", member: "Rian Pratama", amount: 1500000, bank: "BCA", endingBalance: "Rp 14.850.000", createdTime: "2026-09-05 22:10:15", status: "Success", date: "2026-09-05" }
    ],
    withdrawal: [
        { id: 3, ticket: "WD-503", member: "Budi Setiawan", amount: 2000000, targetBank: "BSI - 11223344", sourceBank: "Mandiri Utama", endingBalance: "Rp 25.000.000", createdTime: "2026-09-05 22:00:00", finishedTime: "2026-09-05 22:06:36", status: "SELESAI OLEH CS", date: "2026-09-05" },
        { id: 2, ticket: "WD-502", member: "HJS2800", amount: 1200000, targetBank: "Seabank - 987654", sourceBank: "BCA Utama", endingBalance: "Rp 13.900.000", createdTime: "2026-09-05 22:09:10", finishedTime: "2026-09-05 22:11:38", status: "SELESAI OLEH BOT", date: "2026-09-05" },
        { id: 1, ticket: "WD-501", member: "oweeeee17", amount: 500000, targetBank: "DANA - 08123455", sourceBank: "BCA Utama", endingBalance: "Rp 15.100.000", createdTime: "2026-09-05 22:10:00", finishedTime: "2026-09-05 22:12:18", status: "SELESAI OLEH BOT", date: "2026-09-05" }
    ]
};

let defaultUsername = "rjbotqq";
let currentPassword = "admin1139";
let activeEditId = null;

function handleLogin() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    
    if(user === defaultUsername && pass === currentPassword) {
        document.getElementById("login-section").classList.add("hidden");
        document.getElementById("main-panel").classList.remove("hidden");
        initDashboard();
    } else {
        alert("Username atau Password salah! Gunakan: rjbotqq / admin1139");
    }
}

function handleLogout() {
    document.getElementById("main-panel").classList.add("hidden");
    document.getElementById("login-section").classList.remove("hidden");
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
}

function switchTab(tabName) {
    ['dashboard', 'deposit', 'withdrawal', 'password'].forEach(t => {
        document.getElementById(`content-${t}`).classList.add("hidden");
        document.getElementById(`nav-${t}`).classList.remove("bg-blue-600", "text-white");
        document.getElementById(`nav-${t}`).classList.add("text-gray-300");
    });
    
    document.getElementById(`content-${tabName}`).classList.remove("hidden");
    document.getElementById(`nav-${tabName}`).classList.add("bg-blue-600", "text-white");
    
    if(tabName === 'password') {
        document.getElementById("current-menu-title").innerText = "CHANGE PASSWORD SETTINGS";
        document.getElementById("date-filter-container").classList.add("hidden");
    } else {
        document.getElementById("current-menu-title").innerText = "QQTURBO " + tabName.toUpperCase() + " MANAGEMENT";
        document.getElementById("date-filter-container").classList.remove("hidden");
    }
}

function initDashboard() {
    document.getElementById("filter-date").value = "2026-09-05";
    applyDateFilter();
}

function applyDateFilter() {
    const selectedDate = document.getElementById("filter-date").value;
    
    let totalMasuk = 0;
    let totalKeluar = 0;

    const filteredDep = dbTransactions.deposit.filter(item => item.date === selectedDate);
    filteredDep.forEach(d => {
        if(d.status === "Success" || d.status === "SELESAI OLEH BOT" || d.status === "SELESAI OLEH CS") totalMasuk += d.amount;
    });

    const filteredWd = dbTransactions.withdrawal.filter(item => item.date === selectedDate);
    filteredWd.forEach(w => {
        if(w.status.includes("SELESAI") || w.status === "Success") totalKeluar += w.amount;
    });

    document.getElementById("stat-uang-masuk").innerText = `Rp ${totalMasuk.toLocaleString('id-ID')}`;
    document.getElementById("stat-uang-keluar").innerText = `Rp ${totalKeluar.toLocaleString('id-ID')}`;

    renderTables(filteredDep, filteredWd);
}

function renderTables(depList, wdList) {
    const tbodyDep = document.getElementById("table-deposit-body");
    tbodyDep.innerHTML = "";
    
    // Mengurutkan dari yang terbaru (berdasarkan waktu dibuat / ID terbesar)
    depList.sort((a, b) => b.id - a.id).forEach(d => {
        tbodyDep.innerHTML += `
            <tr class="hover:bg-gray-750">
                <td class="p-3 font-mono">${d.ticket}</td>
                <td class="p-3">${d.member}</td>
                <td class="p-3 text-blue-400 font-semibold">Rp ${d.amount.toLocaleString('id-ID')}</td>
                <td class="p-3">${d.bank}</td>
                <td class="p-3 text-gray-300 font-mono">${d.endingBalance}</td>
                <td class="p-3 text-gray-400">${d.createdTime}</td>
                <td class="p-3"><span class="px-2 py-0.5 text-[10px] rounded bg-blue-900 text-blue-300 font-semibold">SUCCESS</span></td>
            </tr>
        `;
    });

    const tbodyWd = document.getElementById("table-withdrawal-body");
    tbodyWd.innerHTML = "";
    
    // Mengurutkan dari yang terbaru (berdasarkan waktu dibuat / ID terbesar)
    wdList.sort((a, b) => b.id - a.id).forEach(w => {
        let badgeColor = "bg-teal-700 text-white";
        if(w.status === "SELESAI OLEH CS") badgeColor = "bg-amber-700 text-white";
        if(w.status === "REJECT") badgeColor = "bg-red-700 text-white";

        tbodyWd.innerHTML += `
            <tr class="hover:bg-gray-750">
                <td class="p-3 font-mono">${w.ticket}</td>
                <td class="p-3 font-medium text-blue-300">${w.member}</td>
                <td class="p-3 text-red-400 font-semibold">Rp ${w.amount.toLocaleString('id-ID')}</td>
                <td class="p-3">${w.targetBank}</td>
                <td class="p-3 text-gray-300">${w.sourceBank}</td>
                <td class="p-3 font-mono text-gray-200">${w.endingBalance}</td>
                <td class="p-3 text-gray-400">${w.createdTime}</td>
                <td class="p-3 text-gray-300">${w.finishedTime}</td>
                <td class="p-3"><span class="px-2.5 py-1 text-[10px] rounded font-bold ${badgeColor}">${w.status}</span></td>
                <td class="p-3 text-center">
                    <button onclick="openEditModal(${w.id})" class="p-1.5 bg-gray-700 hover:bg-blue-600 rounded text-white transition" title="Edit ID Member">
                        ✏️
                    </button>
                </td>
            </tr>
        `;
    });
}

function openEditModal(id) {
    activeEditId = id;
    let item = dbTransactions.withdrawal.find(w => w.id === id);
    if(item) {
        document.getElementById("input-edit-member").value = item.member;
        document.getElementById("modal-edit-id").classList.remove("hidden");
    }
}

function closeModalEdit() {
    document.getElementById("modal-edit-id").classList.add("hidden");
}

function saveEditedMember() {
    const newName = document.getElementById("input-edit-member").value;
    if(!newName) {
        alert("Nama/ID member tidak boleh kosong!");
        return;
    }
    let item = dbTransactions.withdrawal.find(w => w.id === activeEditId);
    if(item) {
        item.member = newName;
        item.status = "SELESAI OLEH CS"; 
        item.finishedTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
        alert(`ID Member berhasil diperbarui menjadi "${newName}" dan diproses manual oleh CS.`);
    }
    closeModalEdit();
    applyDateFilter();
}

function handleChangePassword() {
    const oldPass = document.getElementById("old-pass").value;
    const newPass = document.getElementById("new-pass").value;
    const confirmPass = document.getElementById("confirm-pass").value;

    if (!oldPass || !newPass || !confirmPass) {
        alert("Semua kolom form password wajib diisi!");
        return;
    }
    if (oldPass !== currentPassword) {
        alert("Password lama salah!");
        return;
    }
    if (newPass !== confirmPass) {
        alert("Konfirmasi password baru tidak cocok!");
        return;
    }

    currentPassword = newPass;
    alert("Password panel berhasil diubah!");
    document.getElementById("old-pass").value = "";
    document.getElementById("new-pass").value = "";
    document.getElementById("confirm-pass").value = "";
}
