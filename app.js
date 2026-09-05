// Konfigurasi Endpoint Cloudflare Worker Anda
const WORKER_URL = "https://rjtx-api.trbmaster.workers.dev";

let defaultUsername = "rjbotqq";
let currentPassword = "admin1139";
let activeEditTicket = null;

// Variabel penampung data global dari Worker
let globalTransactions = {
    deposit: [],
    withdrawal: []
};

// Cek status login saat halaman dimuat
window.onload = function() {
    if (localStorage.getItem("rjtx_logged_in") === "true") {
        document.getElementById("login-section").classList.add("hidden");
        document.getElementById("main-panel").classList.remove("hidden");
        initDashboard();
    }
};

function handleLogin() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    
    if(user === defaultUsername && pass === currentPassword) {
        localStorage.setItem("rjtx_logged_in", "true");
        document.getElementById("login-section").classList.add("hidden");
        document.getElementById("main-panel").classList.remove("hidden");
        initDashboard();
    } else {
        alert("Username atau Password salah! Gunakan: rjbotqq / admin1139");
    }
}

function handleLogout() {
    localStorage.removeItem("rjtx_logged_in");
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
    // Set tanggal hari ini secara otomatis pada filter
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("filter-date").value = today;
    
    fetchDataFromWorker();
    // Auto-refresh data setiap 5 detik agar sinkron dengan bot
    setInterval(fetchDataFromWorker, 5000);
}

// Mengambil Data Asli dari Cloudflare Worker (KV Database)
async function fetchDataFromWorker() {
    try {
        let response = await fetch(`${WORKER_URL}/api/get-withdraw`);
        if (response.ok) {
            let data = await response.json();
            // Format data dari worker agar sesuai dengan struktur tabel panel
            globalTransactions.withdrawal = data.map((item, index) => ({
                id: item.ticket || index,
                ticket: item.ticket || "-",
                member: item.member || "Belum Ada ID",
                amount: Number(item.nominal || 0),
                targetBank: item.tujuan || "-",
                sourceBank: item.sumber_bank || "-",
                endingBalance: item.saldo_akhir || "Rp 0",
                createdTime: item.tanggal_dibuat || "-",
                finishedTime: item.tanggal_selesai || "-",
                status: item.status || "Pending",
                date: item.tanggal_dibuat ? item.tanggal_dibuat.split(' ')[0] : new Date().toISOString().split('T')[0]
            }));
        }

        // Jika Anda memiliki endpoint deposit di worker, ambil juga di sini
        let resDep = await fetch(`${WORKER_URL}/api/get-deposit`).catch(() => null);
        if (resDep && resDep.ok) {
            let depData = await resDep.json();
            globalTransactions.deposit = depData;
        }

        applyDateFilter();
    } catch (error) {
        console.error("Gagal menarik data dari Cloudflare Worker:", error);
    }
}

function applyDateFilter() {
    const selectedDate = document.getElementById("filter-date").value;
    
    let totalMasuk = 0;
    let totalKeluar = 0;

    const filteredDep = globalTransactions.deposit.filter(item => item.date === selectedDate);
    filteredDep.forEach(d => {
        if(d.status === "Success" || d.status === "SELESAI OLEH BOT" || d.status === "SELESAI OLEH CS") totalMasuk += d.amount;
    });

    const filteredWd = globalTransactions.withdrawal.filter(item => !selectedDate || item.date === selectedDate);
    filteredWd.forEach(w => {
        if(w.status.includes("SELESAI") || w.status === "Success" || w.status === "Updated by CS") totalKeluar += w.amount;
    });

    document.getElementById("stat-uang-masuk").innerText = `Rp ${totalMasuk.toLocaleString('id-ID')}`;
    document.getElementById("stat-uang-keluar").innerText = `Rp ${totalKeluar.toLocaleString('id-ID')}`;

    renderTables(filteredDep, filteredWd);
}

function renderTables(depList, wdList) {
    const tbodyDep = document.getElementById("table-deposit-body");
    tbodyDep.innerHTML = "";
    
    if (depList.length === 0) {
        tbodyDep.innerHTML = `<tr><td colspan="7" class="p-4 text-center text-gray-400">Belum ada data deposit.</td></tr>`;
    } else {
        depList.forEach(d => {
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
    }

    const tbodyWd = document.getElementById("table-withdrawal-body");
    tbodyWd.innerHTML = "";
    
    if (wdList.length === 0) {
        tbodyWd.innerHTML = `<tr><td colspan="10" class="p-4 text-center text-gray-400">Belum ada data withdrawal dari bot.</td></tr>`;
        return;
    }

    wdList.forEach(w => {
        let badgeColor = "bg-teal-700 text-white";
        if(w.status === "SELESAI OLEH CS" || w.status === "Updated by CS") badgeColor = "bg-amber-700 text-white";
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
                    <button onclick="openEditModal('${w.ticket}')" class="p-1.5 bg-gray-700 hover:bg-blue-600 rounded text-white transition" title="Edit ID Member">
                        ✏️
                    </button>
                </td>
            </tr>
        `;
    });
}

function openEditModal(ticket) {
    activeEditTicket = ticket;
    let item = globalTransactions.withdrawal.find(w => w.ticket === ticket);
    if(item) {
        document.getElementById("input-edit-member").value = item.member === "Belum Ada ID" ? "" : item.member;
        document.getElementById("modal-edit-id").classList.remove("hidden");
    }
}

function closeModalEdit() {
    document.getElementById("modal-edit-id").classList.add("hidden");
    activeEditTicket = null;
}

// Menyimpan Edit ID Member dan mengirimkannya kembali ke Worker
async function saveEditedMember() {
    const newName = document.getElementById("input-edit-member").value;
    if(!newName) {
        alert("Nama/ID member tidak boleh kosong!");
        return;
    }

    let item = globalTransactions.withdrawal.find(w => w.ticket === activeEditTicket);
    if(!item) {
        alert("Data tiket tidak ditemukan!");
        closeModalEdit();
        return;
    }

    // Payload data yang dikirim ke Worker
    let updatedData = {
        ticket: item.ticket,
        member: newName,
        nominal: item.amount,
        tujuan: item.targetBank,
        sumber_bank: item.sourceBank,
        saldo_akhir: item.endingBalance,
        tanggal_dibuat: item.createdTime,
        tanggal_selesai: new Date().toISOString().slice(0, 19).replace('T', ' '),
        status: "SELESAI OLEH CS"
    };

    try {
        let response = await fetch(`${WORKER_URL}/api/withdraw`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData)
        });

        if (response.ok) {
            alert(`ID Member berhasil diperbarui menjadi "${newName}"!`);
            closeModalEdit();
            fetchDataFromWorker(); // Refresh data dari server
        } else {
            alert("Gagal menyimpan perubahan ke server Worker.");
        }
    } catch (err) {
        console.error("Error updating member:", err);
        alert("Terjadi kesalahan koneksi jaringan.");
    }
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
