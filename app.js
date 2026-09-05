// Simulasi Data Awal (Nanti bisa dihubungkan ke Database Cloud/API Anda)
document.addEventListener("DOMContentLoaded", () => {
    loadDashboardData();
});

function loadDashboardData() {
    // Contoh data dummy keuangan masuk & keluar
    document.getElementById("total-masuk").innerText = "Rp 45.250.000";
    document.getElementById("total-keluar").innerText = "Rp 18.100.000";

    // Contoh data tabel withdrawal
    const dummyData = [
        { ticket: "WD-9921", member: "Budi Santoso", amount: "500.000", bank: "BCA - 12345678", status: "Cek Mutasi" },
        { ticket: "WD-9922", member: "Siti Rahma", amount: "1.200.000", bank: "DANA - 0812345678", status: "Success" }
    ];

    const tbody = document.getElementById("table-wd-body");
    tbody.innerHTML = "";

    dummyData.forEach(item => {
        let statusBadge = item.status === "Success" 
            ? `<span class="px-2.5 py-1 text-xs rounded-full bg-green-900 text-green-300 font-semibold">Success</span>`
            : `<span class="px-2.5 py-1 text-xs rounded-full bg-yellow-900 text-yellow-300 font-semibold">Cek Mutasi</span>`;

        let tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="p-4 font-mono text-gray-300">${item.ticket}</td>
            <td class="p-4">${item.member}</td>
            <td class="p-4 font-semibold text-gray-100">Rp ${item.amount}</td>
            <td class="p-4 text-gray-300">${item.bank}</td>
            <td class="p-4">${statusBadge}</td>
            <td class="p-4 text-center">
                <button onclick="triggerRetry('${item.ticket}')" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg shadow transition">
                    Retry
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Fungsi tombol Retry ketika diklik CS
function triggerRetry(ticketNo) {
    alert(`Perintah Retry dikirim untuk Tiket: ${ticketNo}. Bot akan mencoba ulang proses transfer.`);
    // Di sini nanti kita sambungkan ke endpoint API bot Anda di PC lokal / server
}
