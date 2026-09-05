// Data Simulasi Transaksi Berdasarkan Tanggal
let dbTransactions = {
    deposit: [
        { id: 1, ticket: "DEP-101", member: "Rian Pratama", amount: 1500000, bank: "BCA", status: "Success", date: "2026-09-05" },
        { id: 2, ticket: "DEP-102", member: "Dewi Lestari", amount: 750000, bank: "BCA", status: "Success", date: "2026-09-05" }
    ],
    withdrawal: [
        { id: 1, ticket: "WD-501", member: "Joko Anwar", amount: 500000, bank: "DANA - 08123455", status: "Failed", retryCount: 2, date: "2026-09-05" },
        { id: 2, ticket: "WD-502", member: "Siti Badriah", amount: 1200000, bank: "Seabank - 987654", status: "Override", formName: "Siti Badriah", bankName: "Siti Badriah A.", retryCount: 0, date: "2026-09-05" },
        { id: 3, ticket: "WD-503", member: "Budi Setiawan", amount: 2000000, bank: "BSI - 11223344", status: "Success", retryCount: 0, date: "2026-09-05" }
    ]
};

let activeOverrideId = null;

// Fungsi Login
function handleLogin() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    if(user && pass) {
        document.getElementById("login-section").classList.add("hidden");
        document.getElementById("main-panel").classList.remove("hidden");
        initDashboard();
    } else {
        alert("Masukkan username dan password dengan benar!");
    }
}

function handleLogout() {
    document.getElementById("main-panel").classList.add("hidden");
    document.getElementById("login-section").classList.remove("hidden");
}

// Navigasi Menu & Tab
function switchTab(tabName) {
    ['dashboard', 'deposit', 'withdrawal', 'devices'].forEach(t => {
        document.getElementById(`content-${t}`).classList.add("hidden");
        document.getElementById(`nav-${t}`).classList.remove("bg-gray-700", "text-green-300");
        document.getElementById(`nav-${t}`).classList.add("text-gray-300");
    });
    
    document.getElementById(`content-${tabName}`).classList.remove("hidden");
    document.getElementById(`nav-${tabName}`).classList.add("bg-gray-700", "text-green-300");
    document.getElementById("current-menu-title").innerText = tabName.toUpperCase() + " MANAGEMENT";
}

// Inisialisasi & Kalkulasi Keuangan Sesuai Data & Filter Tanggal
function initDashboard() {
    // Set default filter tanggal hari ini (2026-09-05)
    document.getElementById("filter-date").value = "2026-09-05";
    applyDateFilter();
}

function applyDateFilter() {
    const selectedDate = document.getElementById("filter-date").value;
    
    let totalMasuk = 0;
    let totalKeluar = 0;

    // Filter Deposit Success
    const filteredDep = dbTransactions.deposit.filter(item => item.date === selectedDate);
    filteredDep.forEach(d => {
        if(d.status === "Success") totalMasuk += d.amount;
    });

    // Filter Withdrawal Success
    const filteredWd = dbTransactions.withdrawal.filter(item => item.date === selectedDate);
    filteredWd.forEach(w => {
        if(w.status === "Success") totalKeluar += w.amount;
    });

    // Update UI Dashboard
    document.getElementById("stat-uang-masuk").innerText = `Rp ${totalMasuk.toLocaleString('id-ID')}`;
    document.getElementById("stat-uang-keluar").innerText = `Rp ${totalKeluar.toLocaleString('id-ID')}`;

    renderTables(filteredDep, filteredWd);
}

// Render Tabel Deposit & Withdrawal
function renderTables(depList, wdList) {
    // Render Deposit
    const tbodyDep = document.getElementById("table-deposit-body");
    tbodyDep.innerHTML = "";
    depList.forEach(d => {
        tbodyDep.innerHTML += `
            <tr class="hover:bg-gray-750">
                <td class="p-4 font-mono">${d.ticket}</td>
                <td class="p-4">${d.member}</td>
                <td class="p-4 text-green-400 font-semibold">Rp ${d.amount.toLocaleString('id-ID')}</td>
                <td class="p-4">${d.bank}</td>
                <td class="p-4"><span class="px-2 py-1 text-xs rounded bg-green-900 text-green-300">${d.status}</span></td>
            </tr>
        `;
    });

    // Render Withdrawal
    const tbodyWd = document.getElementById("table-withdrawal-body");
    tbodyWd.innerHTML = "";
    wdList.forEach(w => {
        let actionButton = "";

        if (w.status === "Override") {
            actionButton = `<button onclick="openOverrideModal(${w.id})" class="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 text-white text-xs rounded font-semibold animate-pulse">Review Override</button>`;
        } else if (w.status === "Failed" || w.status === "Check Account Mutation") {
            if (w.retryCount < 2) {
                actionButton = `<button onclick="doRetry(${w.id})" class="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded font-semibold">Retry (${w.retryCount}/2)</button>`;
            } else {
                actionButton = `<span class="text-xs text-red-400 font-semibold">Max Retry - Manual Only</span>`;
            }
        } else if (w.status === "Success" || w.status === "Rejected") {
            actionButton = `<span class="text-xs text-gray-400 italic">Locked (${w.status})</span>`;
        }

        tbodyWd.innerHTML += `
            <tr class="hover:bg-gray-750">
                <td class="p-4 font-mono">${w.id}</td>
                <td class="p-4">${w.member}</td>
                <td class="p-4 text-red-400 font-semibold">Rp ${w.amount.toLocaleString('id-ID')}</td>
                <td class="p-4">${w.bank}</td>
                <td class="p-4"><span class="px-2 py-1 text-xs rounded bg-gray-700 text-yellow-300 font-semibold">${w.status}</span></td>
                <td class="p-4 text-center">${actionButton}</td>
            </tr>
        `;
    });
}

// Logika Tombol Retry (Maksimal 2 Kali)
function doRetry(id) {
    let item = dbTransactions.withdrawal.find(w => w.id === id);
    if(item && item.retryCount < 2) {
        item.retryCount++;
        alert(`Perintah Retry ke-${item.retryCount} dikirim ke Bot.`);
        applyDateFilter();
    }
}

// Logika Pop-Up Override
function openOverrideModal(id) {
    activeOverrideId = id;
    let item = dbTransactions.withdrawal.find(w => w.id === id);
    if(item) {
        document.getElementById("override-form-name").innerText = item.formName;
        document.getElementById("override-bank-name").innerText = item.bankName;
        document.getElementById("modal-override").classList.remove("hidden");
    }
}

function resolveOverride(action) {
    let item = dbTransactions.withdrawal.find(w => w.id === activeOverrideId);
    if(item) {
        if(action === 'Accept') {
            item.status = "Success";
            alert("Override diterima. Bot melanjutkan transfer dan status dikunci permanen.");
        } else {
            item.status = "Rejected";
            alert("Override ditolak. Form diabaikan permanen.");
        }
    }
    document.getElementById("modal-override").classList.add("hidden");
    applyDateFilter();
}
