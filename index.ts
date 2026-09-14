import 'dotenv/config'; // Memastikan Node.js membaca fail .env
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// ---------------------------------------------------------
// PENTING: Konfigurasi Driver Adapter untuk Postgres Cloud
// ---------------------------------------------------------
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();

// Setkan had saiz body kepada 10MB supaya boleh terima gambar Base64
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ==========================================
// LALUAN API UNTUK ASET ICT
// ==========================================

// 1. GET: Ambil senarai aset
app.get('/api/aset', async (req, res) => {
    try {
        const senarai = await prisma.asetICT.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(senarai);
    } catch (error) {
        res.status(500).json({ error: "Gagal mengambil data." });
    }
});

// 2. POST: Simpan data aset baharu
app.post('/api/aset', async (req, res) => {
    try {
        const b = req.body || {};
        const asetBaru = await prisma.asetICT.create({
            data: {
                sekolah: String(b.sekolah ?? ''),
                kodSekolah: String(b.kodSekolah ?? ''),
                kategori: String(b.kategori ?? ''),
                jenisTag: String(b.jenisTag ?? ''),
                jenamaModel: String(b.jenamaModel ?? ''),
                fasa: String(b.fasa ?? ''),
                noSiri: String(b.noSiri ?? ''),
                noKontrak: String(b.noKontrak ?? ''),
                noKewPa: String(b.noKewPa ?? ''),
                namaPembekal: String(b.namaPembekal ?? ''),
                namaPegawai: String(b.namaPegawai ?? ''),
                penempatan: String(b.penempatan ?? ''),
                noTelefon: String(b.noTelefon ?? ''),
                emailPeribadi: String(b.emailPeribadi ?? ''),
                emailM365: String(b.emailM365 ?? ''),
                kataLaluanM365: String(b.kataLaluanM365 ?? ''),
                idLogMasuk: String(b.idLogMasuk ?? ''),
                kataLaluanPeranti: String(b.kataLaluanPeranti ?? ''),
            }
        });
        console.log("✅ Data penuh ditambah:", asetBaru.noSiri);
        res.status(201).json(asetBaru);
    } catch (error: any) {
        console.error("❌ Ralat Tambah:", error);
        res.status(500).json({ error: "Gagal menyimpan data." });
    }
});

// 3. PUT: Kemaskini (Edit) aset
app.put('/api/aset/:id', async (req, res) => {
    try {
        const idAset = Number(req.params.id);
        const b = req.body || {};

        const asetDikemaskini = await prisma.asetICT.update({
            where: { id: idAset },
            data: {
                sekolah: String(b.sekolah ?? ''),
                kodSekolah: String(b.kodSekolah ?? ''),
                kategori: String(b.kategori ?? ''),
                jenisTag: String(b.jenisTag ?? ''),
                jenamaModel: String(b.jenamaModel ?? ''),
                fasa: String(b.fasa ?? ''),
                noSiri: String(b.noSiri ?? ''),
                noKontrak: String(b.noKontrak ?? ''),
                noKewPa: String(b.noKewPa ?? ''),
                namaPembekal: String(b.namaPembekal ?? ''),
                namaPegawai: String(b.namaPegawai ?? ''),
                penempatan: String(b.penempatan ?? ''),
                noTelefon: String(b.noTelefon ?? ''),
                emailPeribadi: String(b.emailPeribadi ?? ''),
                emailM365: String(b.emailM365 ?? ''),
                kataLaluanM365: String(b.kataLaluanM365 ?? ''),
                idLogMasuk: String(b.idLogMasuk ?? ''),
                kataLaluanPeranti: String(b.kataLaluanPeranti ?? ''),
            }
        });

        console.log(`✏️ Data penuh ID ${idAset} berjaya dikemaskini.`);
        res.json(asetDikemaskini);
    } catch (error) {
        console.error("❌ Ralat Kemaskini:", error);
        res.status(500).json({ error: "Gagal mengemaskini data." });
    }
});

// 4. DELETE: Padam aset mengikut ID
app.delete('/api/aset/:id', async (req, res) => {
    try {
        const idAset = Number(req.params.id);
        await prisma.asetICT.delete({
            where: { id: idAset }
        });
        console.log(`🗑️ Data ID ${idAset} berjaya dipadam.`);
        res.json({ message: "Data berjaya dipadam." });
    } catch (error) {
        console.error("❌ Ralat Padam:", error);
        res.status(500).json({ error: "Gagal memadam data dari database." });
    }
});

// ==========================================
// LALUAN API UNTUK PROFIL PENGGUNA (BARU)
// ==========================================

// 5. GET: Ambil profil dan gambar pengguna berdasarkan E-mel
app.get('/api/users/:email', async (req, res) => {
    try {
        const userEmail = req.params.email;
        const pengguna = await prisma.pengguna.findUnique({
            where: { email: userEmail }
        });

        if (pengguna) {
            res.json(pengguna);
        } else {
            res.status(404).json({ message: "Pengguna tidak dijumpai." });
        }
    } catch (error) {
        console.error("❌ Ralat Ambil Profil:", error);
        res.status(500).json({ error: "Gagal memuat turun profil." });
    }
});

// 6. POST: Simpan atau Kemaskini Profil Pengguna (Upsert)
app.post('/api/users', async (req, res) => {
    try {
        const b = req.body;

        if (!b.email) {
            return res.status(400).json({ error: "E-mel diperlukan untuk menyimpan profil." });
        }

        // Upsert akan semak: Kalau e-mel wujud, dia 'update'. Kalau tak, dia 'create' baru.
        const penggunaDisimpan = await prisma.pengguna.upsert({
            where: { email: b.email },
            update: {
                nama: String(b.nama ?? ''),
                gambarProfil: b.gambarProfil ? String(b.gambarProfil) : null,
            },
            create: {
                email: String(b.email),
                nama: String(b.nama ?? b.email.split('@')[0]), // Default nama ikut emel jika kosong
                gambarProfil: b.gambarProfil ? String(b.gambarProfil) : null,
                peranan: 'admin'
            }
        });

        console.log(`👤 Profil ${b.email} berjaya disimpan.`);
        res.status(200).json(penggunaDisimpan);
    } catch (error) {
        console.error("❌ Ralat Simpan Profil:", error);
        res.status(500).json({ error: "Gagal menyimpan profil pengguna." });
    }
});

// Hidupkan Server secara tempatan (Local Testing)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server Backend berjalan di port ${PORT}`);
});

// Eksport Express app untuk Vercel Serverless
export default app;