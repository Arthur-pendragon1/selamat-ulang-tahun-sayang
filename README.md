# Luxury Cinematic Birthday

Website ulang tahun statis berbasis HTML, CSS, dan JavaScript murni. Tidak perlu Node.js, npm, backend, ataupun proses build; dapat dipublikasikan langsung dengan GitHub Pages.

## Struktur

```text
index.html
css/style.css
js/config.js
js/script.js
images/foto1.jpg
images/foto2.jpg
images/foto3.jpg
music/background.mp3  (opsional, tambahkan sendiri)
```

## Menjalankan secara lokal

1. Buka folder proyek.
2. Klik dua kali `index.html` atau buka file tersebut dari browser.
3. Jika browser membatasi file lokal, gunakan ekstensi Live Server di Visual Studio Code, lalu pilih **Open with Live Server**. Tidak ada proses instalasi dependensi.

## Mengubah isi

Buka `js/config.js`, lalu ubah:

- `name` untuk nama penerima.
- `date` untuk teks tanggal/perayaan.
- `openingTitle` dan `openingSubtitle` untuk tulisan pembuka.
- `photos` untuk caption atau path foto. Galeri sengaja dibatasi paling banyak tiga foto.
- `letter` untuk isi surat; paragraf dipisahkan dengan satu baris kosong.
- `letterSignoff` untuk kalimat penutup surat.
- `closingTitle` dan `closingSubtitle` untuk ucapan akhir.

Ganti foto dengan foto milik sendiri dan pertahankan nama berkas `foto1.jpg`, `foto2.jpg`, dan `foto3.jpg` di dalam `images/`. Bila mengubah nama atau lokasi, perbarui `src` yang sesuai di `js/config.js`. Foto yang gagal dimuat menampilkan placeholder, bukan ikon gambar rusak.

## Musik opsional

Situs tidak memutar musik otomatis. Untuk mengaktifkannya, tambahkan berkas audio yang dapat digunakan ke `music/background.mp3` dan pertahankan nilai `music` pada `js/config.js`. Tombol musik baru akan berfungsi setelah berkas tersedia; situs tetap dapat digunakan tanpa musik.

## Publikasi di GitHub Pages

1. Buat repository GitHub baru.
2. Unggah seluruh isi folder proyek ke root repository (pastikan `index.html` berada di root).
3. Buka **Settings → Pages**.
4. Pada **Build and deployment**, pilih **Deploy from a branch**, pilih branch `main` dan folder `/(root)`, lalu simpan.
5. Setelah proses deployment selesai, buka URL yang ditampilkan di halaman Pages. Biasanya berbentuk `https://USERNAME.github.io/NAMA-REPOSITORY/`.

Semua referensi aset menggunakan path relatif (`./css/`, `./js/`, `./images/`, dan `./music/`) agar tetap berfungsi pada subpath repository GitHub Pages.

## Fitur

- Opening sinematik dan navigasi ke perjalanan ulang tahun.
- Galeri maksimal tiga foto dengan lightbox, caption, navigasi tombol, dan tombol panah keyboard.
- Ilustrasi kue ulang tahun SVG dua tingkat dengan lilin interaktif, efek asap saat ditiup, dan confetti.
- Amplop dan surat digital.
- Kontrol musik opsional, animasi responsif, serta dukungan `prefers-reduced-motion`.
