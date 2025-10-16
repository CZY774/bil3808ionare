# Bil3808ionaire

Aplikasi PWA untuk manajemen iuran dan pembagian tagihan 8 teman sekamar secara transparan dan otomatis.

## 🚀 Fitur Utama

- **Bagi Tagihan Otomatis** - Sistem otomatis membagi tagihan ke semua anggota
- **Kelola 8 Anggota** - Dirancang khusus untuk 8 teman sekamar
- **Bukti Pembayaran** - Upload bukti transfer/cash untuk transparansi
- **Mode Admin** - Kelola status pembayaran dengan audit log
- **Reminder Otomatis** - Notifikasi email dan PWA sebelum deadline
- **PWA Ready** - Install seperti aplikasi native

## 🛠️ Tech Stack

- **Frontend**: SvelteKit + TypeScript + Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage, Functions)
- **UI Components**: shadcn/ui + Lucide Icons
- **Deployment**: Vercel + Supabase Cloud
- **Notifications**: PWA API + Email (Resend/Supabase)

## 📋 Prerequisites

- Node.js 18+
- npm atau pnpm
- Akun Supabase
- Akun Vercel (untuk deployment)

## 🔧 Setup Development

### 1. Clone & Install

```bash
git clone <repository-url>
cd bil3808ionare
npm install
```

### 2. Environment Variables

Buat file `.env` berdasarkan `.env.example`:

```bash
cp .env.example .env
```

Isi dengan kredensial Supabase Anda:

```env
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Setup Database

Jalankan migrasi Supabase:

```bash
npx supabase db reset
```

### 4. Run Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

## 📊 Database Schema

### Tables

- **users** - Data pengguna (email, nama, rekening bank, ewallet)
- **bills** - Data tagihan (judul, jumlah, deadline, pembuat)
- **bill_members** - Relasi tagihan-anggota (status, bukti bayar)
- **audit_logs** - Log aktivitas admin (tidak bisa dihapus)

### Key Features

- Row Level Security (RLS) aktif
- Audit trail untuk semua perubahan admin
- Storage bucket untuk bukti pembayaran
- Email notifications via Edge Functions

## 🔐 Authentication & Security

- **Login Biasa**: Email + Password
- **Mode Admin**: OTP via email (tanpa akun tetap)
- **RLS Policy**: User hanya bisa akses data yang relevan
- **Audit Log**: Semua aksi admin tercatat dan tidak bisa dihapus
- **File Security**: Bukti bayar di private bucket

## 📱 PWA Features

- Install ke home screen
- Offline capability
- Push notifications
- Service worker untuk caching

## 🚀 Deployment

### Vercel Deployment

```bash
npm run build
npx vercel --prod
```

### Environment Variables di Vercel

Set environment variables yang sama seperti di `.env` pada dashboard Vercel.

## 📖 Usage Guide

### Untuk Anggota Biasa

1. **Register** dengan email dan lengkapi profil
2. **Lihat tagihan** yang dibuat anggota lain
3. **Upload bukti bayar** → status otomatis "Lunas"
4. **Terima notifikasi** reminder sebelum deadline

### Untuk Admin

1. **Masuk Mode Admin** dengan OTP email
2. **Ubah status pembayaran** jika ada kesalahan
3. **Lihat audit log** semua perubahan
4. **Kelola tagihan** dan anggota

### Membuat Tagihan Baru

1. Klik "Create New Bill"
2. Isi detail tagihan (nama, jumlah, deadline)
3. Pilih anggota yang terlibat
4. Sistem otomatis hitung pembagian per orang

## 🧪 Testing

```bash
# Type checking
npm run check

# Build test
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
bil3808ionare/
├── src/
│   ├── lib/
│   │   ├── components/     # Svelte components
│   │   ├── database.types.ts
│   │   ├── stores.ts
│   │   ├── supabaseClient.ts
│   │   └── types.ts
│   ├── routes/
│   │   ├── +layout.svelte
│   │   ├── +page.svelte    # Landing page
│   │   ├── login/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── bills/
│   │   └── admin/
│   └── app.html
├── supabase/
│   ├── migrations/
│   └── functions/
├── static/
└── package.json
```

## 🔍 Key Components

- **BillCard.svelte** - Tampilan kartu tagihan
- **ProofUpload.svelte** - Upload bukti pembayaran
- **AuditLog.svelte** - Log aktivitas admin
- **ReminderToggle.svelte** - Pengaturan notifikasi

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Reset Supabase connection
npx supabase stop
npx supabase start
```

### Type Errors
```bash
# Regenerate types
npm run check
```

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .svelte-kit node_modules
npm install
npm run build
```

## 📝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - lihat file LICENSE untuk detail.

## 🤝 Support

Untuk pertanyaan atau bantuan:
- Buat issue di GitHub
- Email: [your-email]
- Documentation: [link-to-docs]

---

**Bil3808ionaire** - Kelola iuran kos jadi lebih mudah! 🏠💰
