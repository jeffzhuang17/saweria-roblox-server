const express = require('express');
const cors = require('cors');
const app = express();

// Izinkan request dari mana saja (termasuk Roblox)
app.use(cors());
app.use(express.json());

// ===== PENYIMPANAN DONASI =====
// Disimpan di RAM sementara (reset kalau server restart)
let donations = [];
let idCounter = 1;

// ===== ROUTE 1: Saweria kirim donasi ke sini =====
app.post('/webhook', (req, res) => {
    console.log('=== DONASI MASUK ===');
    console.log(JSON.stringify(req.body, null, 2));

    const body = req.body;

    // Ambil data dari format Saweria
    // (Saweria mengirim field: donatur_name, amount, message)
    const donasi = {
        id: idCounter++,
        name:    body.donatur_name || body.name || 'Anonim',
        amount:  body.amount       || 0,
        message: body.message      || '',
        time:    new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
    };

    // Simpan ke list (max 100 donasi terakhir)
    donations.unshift(donasi);
    if (donations.length > 100) donations.pop();

    console.log('Tersimpan:', donasi);
    res.status(200).json({ status: 'ok', data: donasi });
});

// ===== ROUTE 2: Roblox ambil donasi baru =====
// Roblox kirim ?since=ID → server balas donasi setelah ID tsb
app.get('/donations', (req, res) => {
    const since = parseInt(req.query.since) || 0;
    const hasil = donations.filter(d => d.id > since);
    res.json(hasil);
});

// ===== ROUTE 3: Cek apakah server hidup =====
app.get('/', (req, res) => {
    res.send('Server Saweria-Roblox aktif! Total donasi: ' + donations.length);
});

// ===== ROUTE 4: Lihat semua donasi (untuk testing) =====
app.get('/all', (req, res) => {
    res.json(donations);
});

// ===== ROUTE 5: Test manual kirim donasi =====
app.get('/test', (req, res) => {
    const testDonasi = {
        id: idCounter++,
        name:    'Tester',
        amount:  10000,
        message: 'Ini donasi test!',
        time:    new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
    };
    donations.unshift(testDonasi);
    res.json({ status: 'ok', data: testDonasi });
});

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Server jalan di port ' + PORT);
});
