# Panduan Deploy ke Vercel

## Langkah-langkah Deploy:

### 1. Persiapan Repository
```bash
# Push semua file ke GitHub/GitLab termasuk:
# - vercel.json
# - api/index.ts 
# - client/dist/ (hasil build)
```

### 2. Import Project di Vercel
1. Masuk ke [vercel.com](https://vercel.com)
2. Klik "New Project"
3. Import repository Anda
4. Framework preset akan otomatis terdeteksi

### 3. Konfigurasi Build Settings
```
Build Command: npm run build
Output Directory: client/dist
Install Command: npm install
```

### 4. Environment Variables (Opsional)
Jika API membutuhkan environment variables, tambahkan di Vercel dashboard.

### 5. Deploy
Klik "Deploy" - Vercel akan:
- Install dependencies
- Build React frontend 
- Setup serverless API di `/api/`

## Struktur URL Setelah Deploy:

```
https://your-app.vercel.app/         -> React frontend
https://your-app.vercel.app/api/     -> API info
https://your-app.vercel.app/api/search?q=naruto
https://your-app.vercel.app/api/detail?url=...
https://your-app.vercel.app/api/chapter?url=...
https://your-app.vercel.app/api/popular?page=1
https://your-app.vercel.app/api/genre/action?page=1
```

## Troubleshooting:

### Jika muncul error "Module not found":
- Pastikan semua dependencies ada di `package.json`
- Periksa import path di `api/index.ts`

### Jika API tidak response:
- Cek function logs di Vercel dashboard
- Pastikan timeout tidak terlampaui (max 30 detik)

### Jika frontend tidak load:
- Pastikan build berhasil dengan `npm run build` 
- Cek `client/dist/` folder ada dan berisi file HTML/JS/CSS