import { Generator, Retry, gcd, range, sum, fmt, rp, clock, HARI, NAMA, NAMA_L } from './core';

const T = 'Logika & Masalah HOTS' as const;

export const logika: Generator[] = [
  // ============ KABUPATEN/KOTA ============
  {
    key: 'log-papasan', topic: T, sub: 'Kecepatan: Berpapasan', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 90,
    make(r) {
      const v1 = 10 * r.int(4, 8), v2 = 5 * r.int(8, 16);
      const head = r.pick([0, 0, 30, 60]);
      const Tm = 12 * r.int(5, 20);
      const D = (v1 * head) / 60 + ((v1 + v2) * Tm) / 60;
      if (!Number.isInteger(D)) throw new Retry();
      const start = 60 * r.int(6, 9) + r.pick([0, 15, 30]);
      const meet = start + head + Tm;
      const [a, b] = r.sample(NAMA_L, 2);
      return {
        q: `Jarak kota P dan Q adalah ${D} km. Pak ${a} berangkat dari P menuju Q pukul ${clock(start)} dengan kecepatan ${v1} km/jam. ${head ? `Pak ${b} berangkat dari Q menuju P pukul ${clock(start + head)}` : `Pada saat yang sama Pak ${b} berangkat dari Q menuju P`} dengan kecepatan ${v2} km/jam. Pukul berapa mereka berpapasan?`,
        ans: clock(meet), wrong: [clock(start + Math.round((D / (v1 + v2)) * 60)), clock(meet + 30), clock(meet - 24), clock(meet + 12)],
        exp: `${head ? `Dalam ${head} menit pertama Pak ${a} menempuh ${(v1 * head) / 60} km, sisa jarak ${D - (v1 * head) / 60} km. ` : ''}Keduanya saling mendekat dengan kecepatan ${v1} + ${v2} = ${v1 + v2} km/jam. Waktu = ${D - (v1 * head) / 60} ÷ ${v1 + v2} jam = ${Tm} menit. Berpapasan pukul ${clock(start + head)} + ${Tm} menit = ${clock(meet)}.`,
        tip: 'Berpapasan: kecepatan dijumlahkan. Jika berangkat tidak bersamaan, kurangi dulu jarak yang sudah ditempuh orang pertama.',
      };
    },
  },
  {
    key: 'log-menyusul', topic: T, sub: 'Kecepatan: Menyusul', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 90,
    make(r) {
      for (;;) {
        const v1 = r.pick([4, 5, 6, 10, 12, 15, 20, 30, 40]);
        const k = r.pick([10, 15, 20, 30, 45, 60]);
        const Tm = r.pick([10, 15, 20, 30, 40, 45, 60, 90]);
        const v2 = (v1 * (k + Tm)) / Tm;
        if (!Number.isInteger(v2) || v2 > 100) continue;
        const start = 60 * r.int(6, 14) + r.pick([0, 10, 20, 30]);
        const [a, b] = r.sample(NAMA, 2);
        const veh = v1 <= 6 ? 'berjalan kaki' : v1 <= 20 ? 'bersepeda' : 'naik motor';
        return {
          q: `${a} ${veh} dari rumah pukul ${clock(start)} dengan kecepatan ${v1} km/jam. ${k} menit kemudian ${b} menyusul melalui jalan yang sama dengan kecepatan ${v2} km/jam. Pukul berapa ${b} menyusul ${a}?`,
          ans: clock(start + k + Tm), wrong: [clock(start + Tm), clock(start + k + Tm + 15), clock(start + k + Math.round(Tm / 2)), clock(start + 2 * k + Tm)],
          exp: `Saat ${b} berangkat, ${a} sudah ${fmt((v1 * k) / 60)} km di depan. Selisih kecepatan ${v2} − ${v1} = ${v2 - v1} km/jam. Waktu menyusul = ${fmt((v1 * k) / 60)} ÷ ${v2 - v1} jam = ${Tm} menit. Pukul ${clock(start + k)} + ${Tm} menit = ${clock(start + k + Tm)}.`,
          tip: 'Menyusul: kecepatan dikurangkan. Waktu = jarak awal ÷ selisih kecepatan.',
        };
      }
    },
  },
  {
    key: 'log-kerja-bersama', topic: T, sub: 'Kerja Bersama', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 80,
    make(r) {
      if (r.chance(0.7)) {
        const [a, b] = r.pick([[3, 6], [4, 12], [6, 12], [10, 15], [12, 24], [20, 30], [5, 20], [10, 40], [9, 18], [8, 24], [6, 30], [12, 36], [15, 30], [14, 35]]);
        const t = (a * b) / (a + b);
        const [x, y] = r.sample(NAMA_L, 2);
        const job = r.pick(['mengecat pagar', 'memanen padi di sawah', 'menyusun buku perpustakaan', 'membersihkan masjid']);
        return {
          q: `Pak ${x} dapat ${job} sendirian dalam ${a} hari, sedangkan Pak ${y} dapat menyelesaikan pekerjaan yang sama sendirian dalam ${b} hari. Jika mereka bekerja bersama-sama, pekerjaan itu selesai dalam ... hari.`,
          ans: t, wrong: [(a + b) / 2, a + b, Math.abs(b - a)],
          exp: `Dalam 1 hari Pak ${x} menyelesaikan 1/${a} bagian, Pak ${y} 1/${b} bagian. Bersama: 1/${a} + 1/${b} = ${(a + b) / gcd(a + b, a * b)}/${(a * b) / gcd(a + b, a * b)} bagian per hari. Waktu = ${a} × ${b} ÷ (${a} + ${b}) = ${t} hari.`,
          tip: 'Rumus cepat untuk dua orang: (A × B) ÷ (A + B).',
        };
      }
      const [a, b, c] = r.pick([[6, 12, 4], [10, 15, 30], [4, 6, 12], [3, 6, 2], [12, 24, 8], [5, 20, 4]]);
      const t = 1 / (1 / a + 1 / b + 1 / c);
      return {
        q: `Tiga keran masing-masing dapat memenuhi sebuah kolam dalam ${a} jam, ${b} jam, dan ${c} jam. Jika ketiganya dibuka bersamaan, kolam penuh dalam ... jam.`,
        ans: Math.round(t * 100) / 100, wrong: [Math.round(((a + b + c) / 3) * 100) / 100, Math.min(a, b, c), Math.round(t * 2 * 100) / 100],
        exp: `Per jam: 1/${a} + 1/${b} + 1/${c} = ${fmt(Math.round((1 / t) * 1000) / 1000)} bagian. Waktu = 1 ÷ itu = ${fmt(t)} jam.`,
        tip: 'Jumlahkan bagian pekerjaan per jam, lalu balikkan.',
      };
    },
  },
  {
    key: 'log-umur-kelipatan', topic: T, sub: 'Masalah Umur', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 90,
    make(r) {
      for (;;) {
        const k = r.int(3, 6), m = r.int(2, k - 1), n = r.int(2, 20);
        const S = (n * (m - 1)) / (k - m);
        if (!Number.isInteger(S) || S < 3 || S > 15) continue;
        const nm = r.pick(NAMA);
        const askF = r.chance(0.5);
        return {
          q: `Umur ayah sekarang ${k} kali umur ${nm}. ${n} tahun lagi, umur ayah menjadi ${m} kali umur ${nm}. Umur ${askF ? 'ayah' : nm} sekarang adalah ... tahun.`,
          ans: askF ? k * S : S, wrong: askF ? [S, k * S + n, m * S] : [k * S, S + n, S + 2],
          exp: `Misal umur ${nm} = x, ayah = ${k}x. ${k}x + ${n} = ${m}(x + ${n}) → ${k - m}x = ${m * n - n} → x = ${S}. Ayah = ${k * S} tahun. (Cek: ${n} tahun lagi ${k * S + n} = ${m} × ${S + n}.)`,
          tip: 'Selisih umur tetap: (k − 1) bagian sekarang = (m − 1) bagian nanti.',
        };
      }
    },
  },
  {
    key: 'log-hari-ke', topic: T, sub: 'Penalaran Hari', level: 'Kabupaten/Kota', diff: 'Mudah', sec: 50,
    make(r) {
      const today = r.int(0, 6);
      const N = r.int(20, 1000);
      const form = r.int(0, 2);
      if (form === 0) {
        const ans = HARI[(today + N) % 7];
        return { q: `Hari ini hari ${HARI[today]}. ${N} hari lagi adalah hari ...`, ans, wrong: r.shuffle(HARI.filter((h) => h !== ans)), exp: `${N} = 7 × ${Math.floor(N / 7)} + ${N % 7}. Setiap 7 hari kembali ke hari yang sama, jadi cukup maju ${N % 7} hari dari ${HARI[today]}: ${ans}.`, tip: 'Ambil sisa pembagian dengan 7.' };
      }
      if (form === 1) {
        const ans = HARI[(((today - N) % 7) + 7) % 7];
        return { q: `Hari ini hari ${HARI[today]}. ${N} hari yang lalu adalah hari ...`, ans, wrong: r.shuffle(HARI.filter((h) => h !== ans)), exp: `${N} = 7 × ${Math.floor(N / 7)} + ${N % 7}. Mundur ${N % 7} hari dari ${HARI[today]}: ${ans}.`, tip: 'Sisa bagi 7, lalu hitung mundur.' };
      }
      const ans = HARI[(today + 2) % 7];
      return { q: `Jika kemarin lusa adalah hari ${HARI[(today + 5) % 7]}, maka besok lusa adalah hari ...`, ans, wrong: r.shuffle(HARI.filter((h) => h !== ans)), exp: `Kemarin lusa = 2 hari lalu = ${HARI[(today + 5) % 7]}, jadi hari ini ${HARI[today]}. Besok lusa = 2 hari lagi = ${ans}.`, tip: 'Tentukan dulu "hari ini", baru melangkah.' };
    },
  },
  {
    key: 'log-urutan', topic: T, sub: 'Logika Urutan', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 90,
    make(r) {
      const n = r.int(4, 5);
      const ppl = r.sample(NAMA, n);
      const order = r.shuffle(ppl); // order[0] tallest
      const attr = r.pick([
        { more: 'lebih tinggi daripada', less: 'lebih pendek daripada', top: 'paling tinggi', bottom: 'paling pendek' },
        { more: 'lebih tua daripada', less: 'lebih muda daripada', top: 'paling tua', bottom: 'paling muda' },
        { more: 'lebih berat daripada', less: 'lebih ringan daripada', top: 'paling berat', bottom: 'paling ringan' },
      ]);
      const clues = range(0, n - 2).map((i) => (r.chance(0.5) ? `${order[i]} ${attr.more} ${order[i + 1]}` : `${order[i + 1]} ${attr.less} ${order[i]}`));
      const rank = r.int(0, n - 1);
      const askText = rank === 0 ? attr.top : rank === n - 1 ? attr.bottom : `${attr.top.replace('paling ', '')} ke-${rank + 1} (urutan ke-${rank + 1} dari yang ${attr.top})`;
      return {
        q: `Diketahui:\n${r.shuffle(clues).map((c) => `• ${c}.`).join('\n')}\nSiapakah yang ${askText}?`,
        ans: order[rank], wrong: ppl.filter((p) => p !== order[rank]),
        exp: `Susun dari keterangan-keterangan itu: ${order.join(' > ')} (dari yang ${attr.top} ke yang ${attr.bottom}). Jadi jawabannya ${order[rank]}.`,
        tip: 'Ubah semua kalimat ke bentuk yang sama ("lebih ... daripada"), lalu susun dalam satu garis.',
      };
    },
  },
  {
    key: 'log-untung-rugi', topic: T, sub: 'Untung & Rugi', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 75,
    make(r) {
      const buy = 1000 * r.int(20, 200);
      const p = r.pick([5, 10, 15, 20, 25, 30, 40]);
      const profit = r.chance(0.7);
      const sell = (buy * (100 + (profit ? p : -p))) / 100;
      if (!Number.isInteger(sell)) throw new Retry();
      if (r.chance(0.5)) {
        return { q: `Pak Umar membeli sepeda bekas seharga ${rp(buy)} lalu menjualnya seharga ${rp(sell)}. Persentase ${profit ? 'keuntungan' : 'kerugian'} Pak Umar adalah ...`, ans: p, unit: '%', wrong: [Math.round((Math.abs(sell - buy) / sell) * 100), p + 5, p * 2], exp: `${profit ? 'Untung' : 'Rugi'} = ${rp(Math.abs(sell - buy))}. Persentase terhadap harga beli = ${fmt(Math.abs(sell - buy))} ÷ ${fmt(buy)} × 100% = ${p}%.`, tip: 'Persentase untung/rugi selalu dibandingkan dengan HARGA BELI.' };
      }
      return { q: `Seorang pedagang menjual barang seharga ${rp(sell)} dan ${profit ? 'memperoleh untung' : 'menderita rugi'} ${p}%. Harga beli barang tersebut adalah ...`, ans: buy, prefix: 'Rp', wrong: [Math.round((sell * (100 - (profit ? p : -p))) / 100), sell + (profit ? -1 : 1) * Math.round((sell * p) / 100) + 1000, buy + 5000], exp: `Harga jual = ${profit ? 100 + p : 100 - p}% × harga beli. Harga beli = ${fmt(sell)} × 100/${profit ? 100 + p : 100 - p} = ${rp(buy)}.`, tip: `Jangan langsung mengurangi ${p}% dari harga jual; harga jual itu ${profit ? 100 + p : 100 - p}% dari harga beli.` };
    },
  },
  {
    key: 'log-tabungan', topic: T, sub: 'Pola Tabungan', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 75,
    make(r) {
      const a = 500 * r.int(2, 10), d = 500 * r.int(1, 4), n = r.int(10, 30);
      const nm = r.pick(NAMA);
      const total = (n * (2 * a + (n - 1) * d)) / 2;
      if (r.chance(0.5)) return { q: `${nm} menabung setiap hari. Hari pertama ${rp(a)}, dan setiap hari berikutnya ${rp(d)} lebih banyak daripada hari sebelumnya. Jumlah tabungan ${nm} setelah ${n} hari adalah ...`, ans: total, prefix: 'Rp', wrong: [a + (n - 1) * d, n * a + n * d, total - a], exp: `Hari ke-${n}: ${rp(a)} + ${n - 1} × ${rp(d)} = ${rp(a + (n - 1) * d)}. Jumlah = ${n} × (${fmt(a)} + ${fmt(a + (n - 1) * d)}) ÷ 2 = ${rp(total)}.`, tip: 'Deret aritmetika: (suku pertama + suku terakhir) × banyak hari ÷ 2.' };
      return { q: `${nm} menabung setiap hari. Hari pertama ${rp(a)}, dan setiap hari berikutnya ${rp(d)} lebih banyak daripada hari sebelumnya. Berapa rupiah yang ditabung ${nm} pada hari ke-${n}?`, ans: a + (n - 1) * d, prefix: 'Rp', wrong: [a + n * d, total, a * n], exp: `Hari ke-${n} = ${rp(a)} + (${n} − 1) × ${rp(d)} = ${rp(a + (n - 1) * d)}.`, tip: 'Hari ke-n bertambah (n − 1) kali, bukan n kali.' };
    },
  },
  {
    key: 'log-antrian', topic: T, sub: 'Posisi dalam Barisan', level: 'Kabupaten/Kota', diff: 'Mudah', sec: 50,
    make(r) {
      const nm = r.pick(NAMA);
      if (r.chance(0.5)) {
        const a = r.int(5, 30), b = r.int(5, 30);
        return { q: `Dalam sebuah antrean, ${nm} berada di urutan ke-${a} dari depan dan urutan ke-${b} dari belakang. Banyak orang dalam antrean itu adalah ...`, ans: a + b - 1, wrong: [a + b, a + b + 1, Math.abs(a - b)], exp: `${nm} terhitung dua kali (dari depan dan dari belakang), jadi ${a} + ${b} − 1 = ${a + b - 1} orang.`, tip: 'Jangan lupa dikurangi 1 karena orang itu dihitung dua kali.' };
      }
      const [f, b, le, ri] = [r.int(2, 8), r.int(2, 8), r.int(2, 8), r.int(2, 8)];
      const rows = f + b - 1, cols = le + ri - 1;
      return { q: `Siswa-siswa berbaris membentuk persegi panjang untuk upacara. ${nm} berada di barisan ke-${f} dari depan, ke-${b} dari belakang, ke-${le} dari kiri, dan ke-${ri} dari kanan. Banyak siswa yang berbaris adalah ...`, ans: rows * cols, wrong: [(f + b) * (le + ri), f + b + le + ri - 2, rows + cols], exp: `Banyak baris = ${f} + ${b} − 1 = ${rows}. Banyak kolom = ${le} + ${ri} − 1 = ${cols}. Total ${rows} × ${cols} = ${rows * cols} siswa.`, tip: 'Hitung baris dan kolom terpisah, masing-masing dikurangi 1.' };
    },
  },
  {
    key: 'log-kalender-kotak', topic: T, sub: 'Penalaran Kalender', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 70,
    make(r) {
      if (r.chance(0.5)) {
        const c = r.int(9, 22);
        const S = 9 * c;
        return { q: `Pada sebuah kalender bulanan, sembilan tanggal yang membentuk kotak 3 × 3 dijumlahkan dan hasilnya ${S}. Tanggal terbesar di kotak itu adalah ...`, ans: c + 8, wrong: [c, c + 7, c + 6], exp: `Dalam kotak 3 × 3, tanggal tengah = c, dan sembilan tanggal itu simetris terhadap c, sehingga jumlahnya 9c. c = ${S} ÷ 9 = ${c}. Pojok kanan bawah = c + 7 + 1 = ${c + 8}.`, tip: 'Jumlah kotak 3 × 3 pada kalender = 9 × tanggal tengah.' };
      }
      const a = r.int(1, 20);
      const S = 4 * a + 16;
      return { q: `Pada sebuah kalender bulanan, empat tanggal yang membentuk kotak 2 × 2 dijumlahkan dan hasilnya ${S}. Tanggal terkecil di kotak itu adalah ...`, ans: a, wrong: [a + 1, S / 4, a + 4], exp: `Kotak 2 × 2: a, a + 1, a + 7, a + 8. Jumlahnya 4a + 16 = ${S}, jadi a = ${a}.`, tip: 'Baris berikutnya pada kalender bertambah 7.' };
    },
  },
  {
    key: 'log-kecepatan-dasar', topic: T, sub: 'Jarak, Waktu & Kecepatan', level: 'Kabupaten/Kota', diff: 'Mudah', sec: 55,
    make(r) {
      const v = 5 * r.int(6, 18), tm = r.pick([15, 20, 30, 40, 45, 75, 90, 105, 120, 150]);
      const d = (v * tm) / 60;
      if (!Number.isInteger(d)) throw new Retry();
      const form = r.int(0, 2);
      const nm = r.pick(NAMA_L);
      if (form === 0) return { q: `Sebuah bus melaju dengan kecepatan rata-rata ${v} km/jam selama ${Math.floor(tm / 60) ? `${Math.floor(tm / 60)} jam ` : ''}${tm % 60 ? `${tm % 60} menit` : ''}. Jarak yang ditempuh adalah ...`, ans: d, unit: 'km', wrong: [v * tm, v + tm, Math.round(d * 1.5)], exp: `${tm} menit = ${fmt(tm / 60)} jam. Jarak = ${v} × ${fmt(tm / 60)} = ${d} km.`, tip: 'Ubah menit ke jam (bagi 60) sebelum dikalikan.' };
      if (form === 1) return { q: `Pak ${nm} mengendarai mobil sejauh ${d} km dengan kecepatan ${v} km/jam. Waktu yang diperlukan adalah ... menit.`, ans: tm, unit: 'menit', wrong: [tm + 15, Math.round((d / v) * 100), tm - 10], exp: `Waktu = ${d} ÷ ${v} = ${fmt(tm / 60)} jam = ${tm} menit.`, tip: 'Waktu = jarak ÷ kecepatan.' };
      return { q: `Seorang pengendara motor menempuh jarak ${d} km dalam waktu ${tm} menit. Kecepatan rata-ratanya adalah ...`, ans: v, unit: 'km/jam', wrong: [Math.round((d / tm) * 100), v + 10, Math.round(v / 2)], exp: `${tm} menit = ${fmt(tm / 60)} jam. Kecepatan = ${d} ÷ ${fmt(tm / 60)} = ${v} km/jam.`, tip: 'Kecepatan dalam km/jam: waktu harus dalam jam.' };
    },
  },

  // ============ PROVINSI ============
  {
    key: 'log-kecepatan-rata', topic: T, sub: 'Kecepatan Rata-rata Pulang-Pergi', level: 'Provinsi', diff: 'HOTS', sec: 100,
    make(r) {
      const [a, b] = r.pick([[30, 60], [40, 60], [60, 90], [20, 30], [45, 90], [36, 45], [50, 75], [60, 120], [15, 30], [12, 24], [42, 84], [30, 70], [60, 40], [80, 120]]);
      const avg = (2 * a * b) / (a + b);
      if (!Number.isInteger(avg)) throw new Retry();
      const nm = r.pick(NAMA_L);
      return {
        q: `Pak ${nm} pergi dari rumah ke kantor dengan kecepatan ${a} km/jam dan pulang melalui jalan yang sama dengan kecepatan ${b} km/jam. Kecepatan rata-rata Pak ${nm} untuk seluruh perjalanan pulang-pergi adalah ... km/jam.`,
        ans: avg,
        exp: `Misalkan jaraknya ${(a * b) / gcd(a, b)} km (kelipatan ${a} dan ${b}). Pergi: ${(a * b) / gcd(a, b) / a} jam, pulang: ${(a * b) / gcd(a, b) / b} jam. Kecepatan rata-rata = total jarak ÷ total waktu = ${(2 * a * b) / gcd(a, b)} ÷ ${(a * b) / gcd(a, b) / a + (a * b) / gcd(a, b) / b} = ${avg} km/jam. (Bukan (${a} + ${b}) ÷ 2 = ${(a + b) / 2}!)`,
        tip: 'Rumus: 2ab ÷ (a + b). Jebakannya: rata-rata kecepatan BUKAN rata-rata biasa.',
      };
    },
  },
  {
    key: 'log-kolam-keran', topic: T, sub: 'Mengisi & Menguras', level: 'Provinsi', diff: 'HOTS', sec: 110,
    make(r) {
      for (;;) {
        const [a, b] = r.sample([2, 3, 4, 5, 6, 8, 10, 12, 15], 2);
        const c = r.pick([3, 4, 5, 6, 8, 10, 12, 15, 20, 24, 30]);
        const rate = 1 / a + 1 / b - 1 / c;
        if (rate <= 0) continue;
        const t = 1 / rate;
        if (Math.abs(t - Math.round(t)) > 1e-9 || Math.round(t) > 30) continue;
        return {
          q: `Keran A dapat mengisi penuh sebuah bak dalam ${a} jam, keran B dalam ${b} jam, sedangkan lubang C dapat menguras bak penuh dalam ${c} jam. Jika bak kosong lalu keran A, keran B, dan lubang C dibuka bersamaan, bak akan penuh dalam ... jam.`,
          ans: Math.round(t),
          exp: `Per jam: A mengisi 1/${a}, B mengisi 1/${b}, C menguras 1/${c}. Bersih per jam = 1/${a} + 1/${b} − 1/${c} = 1/${Math.round(t)}. Jadi penuh dalam ${Math.round(t)} jam.`,
          tip: 'Pengisian dijumlahkan, pengurasan dikurangkan. Samakan penyebut dengan KPK.',
        };
      }
    },
  },
  {
    key: 'log-kereta', topic: T, sub: 'Kereta Melewati Terowongan', level: 'Provinsi', diff: 'Sedang', sec: 90,
    make(r) {
      const v = r.pick([36, 54, 72, 90, 108]);
      const ms = v / 3.6;
      const L = 10 * r.int(8, 30);
      const tunnel = r.chance(0.6);
      const Tl = tunnel ? 10 * r.int(10, 80) : 0;
      const t = (L + Tl) / ms;
      if (!Number.isInteger(t)) throw new Retry();
      return {
        q: tunnel
          ? `Sebuah kereta api yang panjangnya ${L} m melaju dengan kecepatan tetap ${v} km/jam melewati terowongan sepanjang ${Tl} m. Waktu yang diperlukan dari saat ujung depan kereta masuk terowongan sampai ujung belakang kereta keluar dari terowongan adalah ... detik.`
          : `Sebuah kereta api yang panjangnya ${L} m melaju dengan kecepatan tetap ${v} km/jam melewati sebuah tiang listrik. Waktu yang diperlukan kereta untuk melewati tiang itu adalah ... detik.`,
        ans: t,
        exp: `${v} km/jam = ${v} × 1000 ÷ 3600 = ${ms} m/detik. Jarak yang ditempuh = ${tunnel ? `panjang kereta + panjang terowongan = ${L} + ${Tl} = ${L + Tl}` : `panjang kereta = ${L}`} m. Waktu = ${L + Tl} ÷ ${ms} = ${t} detik.`,
        tip: 'Untuk melewati terowongan, kereta harus menempuh panjang terowongan DITAMBAH panjang dirinya sendiri. km/jam → m/detik: bagi 3,6.',
      };
    },
  },
  {
    key: 'log-pohon', topic: T, sub: 'Masalah Jarak Tanam (Pagar & Pohon)', level: 'Provinsi', diff: 'Sedang', sec: 80,
    make(r) {
      const d = r.pick([4, 5, 6, 8, 10, 12, 15, 20, 25]);
      const n = r.int(10, 60);
      const L = d * n;
      const form = r.int(0, 2);
      if (form === 0) return { q: `Di sepanjang kedua sisi jalan yang panjangnya ${L} m akan ditanami pohon dengan jarak ${d} m. Di setiap ujung jalan juga ditanami pohon. Banyak pohon yang diperlukan adalah ...`, ans: 2 * (n + 1), exp: `Satu sisi: ${L} ÷ ${d} + 1 = ${n + 1} pohon. Dua sisi: 2 × ${n + 1} = ${2 * (n + 1)} pohon.`, tip: 'Garis lurus dengan kedua ujung ditanami: (panjang ÷ jarak) + 1.' };
      if (form === 1) return { q: `Di sekeliling taman berbentuk lingkaran dengan keliling ${L} m akan dipasang lampu taman setiap ${d} m. Banyak lampu yang diperlukan adalah ...`, ans: n, exp: `Pada lintasan tertutup, titik awal = titik akhir, jadi banyak lampu = ${L} ÷ ${d} = ${n}.`, tip: 'Lintasan tertutup (keliling): keliling ÷ jarak, tanpa + 1.' };
      return { q: `Di sepanjang satu sisi jalan yang panjangnya ${L} m akan dipasang tiang bendera setiap ${d} m, tetapi kedua ujung jalan TIDAK dipasangi tiang. Banyak tiang yang diperlukan adalah ...`, ans: n - 1, exp: `Jika kedua ujung dipasang: ${n + 1} tiang. Tanpa kedua ujung: ${n + 1} − 2 = ${n - 1} tiang.`, tip: 'Tanpa kedua ujung: (panjang ÷ jarak) − 1.' };
    },
  },
  {
    key: 'log-potong-lantai', topic: T, sub: 'Masalah Selang (Potong & Lantai)', level: 'Provinsi', diff: 'Sedang', sec: 75,
    make(r) {
      if (r.chance(0.5)) {
        const k = r.int(3, 15), t = r.int(2, 9);
        return { q: `Untuk memotong sebatang kayu menjadi 2 bagian diperlukan waktu ${t} menit. Berapa menit waktu yang diperlukan untuk memotong kayu yang sama menjadi ${k} bagian?`, ans: (k - 1) * t, exp: `Untuk ${k} bagian diperlukan ${k - 1} kali potong. Waktu = ${k - 1} × ${t} = ${(k - 1) * t} menit.`, tip: 'Banyak potongan = banyak bagian − 1.' };
      }
      const a = r.int(2, 4), t = r.int(2, 6) * (a - 1), n = r.int(6, 20);
      const per = t / (a - 1);
      return { q: `${r.pick(NAMA)} menaiki tangga gedung dari lantai 1 ke lantai ${a} dalam waktu ${t} detik. Dengan kecepatan yang sama, berapa detik waktu yang diperlukan dari lantai 1 ke lantai ${n}?`, ans: per * (n - 1), exp: `Dari lantai 1 ke lantai ${a} melewati ${a - 1} tangga antarlantai, jadi satu tangga = ${t} ÷ ${a - 1} = ${per} detik. Ke lantai ${n}: ${n - 1} tangga × ${per} = ${per * (n - 1)} detik.`, tip: 'Yang dihitung adalah "jarak antarlantai", bukan banyak lantai.' };
    },
  },
  {
    key: 'log-jam-rusak', topic: T, sub: 'Jam Tidak Tepat', level: 'Provinsi', diff: 'HOTS', sec: 110, pg: true,
    make(r) {
      const g = r.pick([2, 3, 4, 5, 6]);
      const fast = r.chance(0.5);
      const rate = fast ? 60 + g : 60 - g;
      const realH = r.int(3, 12);
      const shown = realH * rate;
      const start = 60 * r.int(5, 8);
      return {
        q: `Sebuah jam ${fast ? 'terlalu cepat' : 'terlambat'} ${g} menit setiap jam. Jam itu disetel tepat pada pukul ${clock(start)}. Ketika jam tersebut menunjukkan pukul ${clock(start + shown)}, waktu yang sebenarnya adalah pukul ...`,
        ans: clock(start + realH * 60), wrong: [clock(start + shown + (fast ? -1 : 1) * Math.round((g * shown) / 60)), clock(start + shown), clock(start + realH * 60 + (fast ? 1 : -1) * g * realH)],
        exp: `Setiap 1 jam sebenarnya, jam itu bergerak ${rate} menit. Jam menunjukkan ${shown} menit berlalu, jadi waktu sebenarnya = ${shown} ÷ ${rate} = ${realH} jam. Pukul ${clock(start)} + ${realH} jam = ${clock(start + realH * 60)}.`,
        tip: `Bandingkan laju: 60 menit nyata ↔ ${rate} menit di jam rusak.`,
      };
    },
  },
  {
    key: 'log-timbangan-koin', topic: T, sub: 'Teka-teki Timbangan', level: 'Provinsi', diff: 'HOTS', sec: 90,
    make(r) {
      const n = r.int(5, 300);
      let k = 0;
      while (3 ** k < n) k++;
      return {
        q: `Terdapat ${n} koin yang tampak sama. Satu koin palsu dan lebih ringan daripada yang lain. Dengan timbangan dua lengan (tanpa anak timbangan), berapa kali penimbangan paling sedikit yang menjamin koin palsu pasti ditemukan?`,
        ans: k,
        exp: `Setiap penimbangan memiliki 3 kemungkinan hasil (kiri berat, kanan berat, seimbang), sehingga koin dapat dibagi 3 kelompok. Dengan k penimbangan dapat diselesaikan paling banyak 3ᵏ koin. 3${'⁰¹²³⁴⁵⁶'[k - 1]} = ${3 ** (k - 1)} < ${n} ≤ 3${'⁰¹²³⁴⁵⁶'[k]} = ${3 ** k}, jadi diperlukan ${k} kali.`,
        tip: 'Cari pangkat 3 terkecil yang ≥ banyak koin.',
      };
    },
  },
  {
    key: 'log-campuran', topic: T, sub: 'Campuran & Konsentrasi', level: 'Provinsi', diff: 'HOTS', sec: 110,
    make(r) {
      if (r.chance(0.5)) {
        for (;;) {
          const a = 100 * r.int(1, 6), b = 100 * r.int(1, 6), p = r.pick([5, 10, 15, 20, 25, 30]), q = r.pick([10, 20, 30, 40, 50]);
          if (p === q) continue;
          const res = (a * p + b * q) / (a + b);
          if (!Number.isInteger(res)) continue;
          return { q: `${a} gram larutan gula berkadar ${p}% dicampur dengan ${b} gram larutan gula berkadar ${q}%. Kadar gula larutan campuran adalah ... %.`, ans: res, exp: `Gula: ${p}% × ${a} = ${(a * p) / 100} g dan ${q}% × ${b} = ${(b * q) / 100} g, total ${(a * p + b * q) / 100} g dalam ${a + b} g larutan. Kadar = ${(a * p + b * q) / 100} ÷ ${a + b} × 100% = ${res}%.`, tip: 'Hitung massa zat (gula) dulu, bukan rata-rata persennya.' };
        }
      }
      for (;;) {
        const a = 100 * r.int(1, 8), p = r.pick([10, 15, 20, 25, 30, 40]), q = r.pick([5, 8, 10, 12, 15, 20]);
        if (q >= p) continue;
        const water = (a * p) / q - a;
        if (!Number.isInteger(water)) continue;
        return { q: `${a} gram larutan garam berkadar ${p}% akan diencerkan menjadi berkadar ${q}% dengan menambahkan air murni. Banyak air yang harus ditambahkan adalah ... gram.`, ans: water, exp: `Garam = ${p}% × ${a} = ${(a * p) / 100} g (tetap). Agar kadarnya ${q}%, massa larutan = ${(a * p) / 100} ÷ ${q}% = ${(a * p) / q} g. Air tambahan = ${(a * p) / q} − ${a} = ${water} g.`, tip: 'Saat diencerkan, banyak zat terlarut tidak berubah.' };
      }
    },
  },
  {
    key: 'log-skor-osn', topic: T, sub: 'Sistem Penilaian Lomba', level: 'Provinsi', diff: 'Sedang', sec: 80,
    make(r) {
      const N = r.pick([20, 25, 30, 40, 50]);
      const [pc, pw] = r.pick([[4, 1], [3, 1], [5, 2], [4, 2]]);
      const c = r.int(Math.floor(N / 3), N - 2);
      const w = r.int(0, N - c);
      const blank = N - c - w;
      const S = pc * c - pw * w;
      const nm = r.pick(NAMA);
      if (blank === 0 || r.chance(0.5)) {
        return { q: `Dalam sebuah lomba terdapat ${N} soal. Jawaban benar diberi nilai ${pc}, salah diberi nilai −${pw}, dan tidak dijawab 0. ${nm} menjawab ${c + w} soal dan memperoleh nilai ${S}. Banyak soal yang dijawab benar oleh ${nm} adalah ...`, ans: c, exp: `Misal benar = b, salah = ${c + w} − b. ${pc}b − ${pw}(${c + w} − b) = ${S} → ${pc + pw}b = ${S + pw * (c + w)} → b = ${c}.`, tip: 'Andaikan semua yang dijawab benar, lalu setiap jawaban salah mengurangi (nilai benar + nilai salah).' };
      }
      return { q: `Dalam sebuah lomba terdapat ${N} soal. Jawaban benar diberi nilai ${pc}, salah −${pw}, dan tidak dijawab 0. ${nm} tidak menjawab ${blank} soal dan memperoleh nilai ${S}. Banyak soal yang dijawab salah oleh ${nm} adalah ...`, ans: w, exp: `Soal yang dijawab = ${N} − ${blank} = ${c + w}. Jika semua benar, nilainya ${pc * (c + w)}. Selisih ${pc * (c + w)} − ${S} = ${pc * (c + w) - S}; setiap jawaban salah mengurangi ${pc + pw}. Salah = ${pc * (c + w) - S} ÷ ${pc + pw} = ${w}.`, tip: 'Metode andaikan: anggap semua benar, lalu hitung kekurangannya.' };
    },
  },
  {
    key: 'log-pembohong', topic: T, sub: 'Logika Jujur & Bohong', level: 'Provinsi', diff: 'HOTS', sec: 150, pg: true,
    make(r) {
      const ppl = r.sample(NAMA, 4);
      const oneLiar = r.chance(0.6);
      type St = { kind: 'accuse' | 'deny' | 'not' | 'liar'; t: number };
      for (let attempt = 0; attempt < 200; attempt++) {
        const sts: St[] = ppl.map((_, i) => {
          const kind = r.pick(['accuse', 'deny', 'not', 'accuse', 'liar'] as const);
          let t = r.int(0, 3);
          while (t === i) t = r.int(0, 3);
          return { kind, t };
        });
        // a "liar" statement must point to a non-"liar" statement
        if (sts.some((s) => s.kind === 'liar' && sts[s.t].kind === 'liar')) continue;
        const truth = (culprit: number) => {
          const base = sts.map((s, i) => (s.kind === 'accuse' ? culprit === s.t : s.kind === 'deny' ? culprit !== i : s.kind === 'not' ? culprit !== s.t : null));
          return base.map((v, i) => (v === null ? !base[sts[i].t] : v));
        };
        const sols = range(0, 3).filter((c) => {
          const tv = truth(c);
          const liars = tv.filter((x) => !x).length;
          return oneLiar ? liars === 1 : liars === 3;
        });
        if (sols.length !== 1) continue;
        const sol = sols[0];
        const say = (s: St) => (s.kind === 'accuse' ? `"${ppl[s.t]} yang memecahkannya."` : s.kind === 'deny' ? '"Bukan saya yang memecahkannya."' : s.kind === 'not' ? `"Bukan ${ppl[s.t]} yang memecahkannya."` : `"${ppl[s.t]} berbohong."`);
        const tv = truth(sol);
        return {
          q: `Sebuah vas bunga di kelas pecah. Empat anak memberikan pernyataan:\n${ppl.map((p, i) => `• ${p}: ${say(sts[i])}`).join('\n')}\nJika hanya ${oneLiar ? 'satu anak yang berbohong' : 'satu anak yang berkata jujur'}, siapakah yang memecahkan vas tersebut?`,
          ans: ppl[sol], wrong: ppl.filter((_, i) => i !== sol),
          exp: `Uji setiap kemungkinan pelaku. Jika pelakunya ${ppl[sol]}, maka yang ${oneLiar ? 'berbohong hanya' : 'jujur hanya'} ${ppl.filter((_, i) => (oneLiar ? !tv[i] : tv[i])).join(', ')} — sesuai syarat. Untuk pelaku lain, banyak anak yang ${oneLiar ? 'berbohong' : 'jujur'} tidak tepat satu. Jadi pelakunya ${ppl[sol]}.`,
          tip: 'Andaikan satu per satu anak sebagai pelaku, lalu hitung berapa pernyataan yang salah.',
        };
      }
      throw new Retry();
    },
  },
  {
    key: 'log-botol', topic: T, sub: 'Penukaran Botol Kosong', level: 'Provinsi', diff: 'HOTS', sec: 100,
    make(r) {
      const e = r.int(2, 5), N = r.int(10, 80);
      let drunk = 0, full = N, empty = 0;
      while (full > 0) { drunk += full; empty += full; full = Math.floor(empty / e); empty %= e; }
      return {
        q: `Sebuah toko menukar setiap ${e} botol kosong dengan 1 botol minuman penuh. ${r.pick(NAMA)} membeli ${N} botol minuman. Jika semua botol kosong selalu ditukarkan, paling banyak berapa botol minuman yang dapat diminum (tanpa meminjam botol)?`,
        ans: drunk,
        exp: `Minum ${N}, dapat ${N} botol kosong → tukar ${Math.floor(N / e)} botol, sisa ${N % e} kosong. Ulangi terus selama botol kosong ≥ ${e}. Total yang diminum = ${drunk}.`,
        tip: 'Simulasikan bertahap dan jangan lupa sisa botol kosong yang terbawa ke tahap berikutnya.',
      };
    },
  },
  {
    key: 'log-tebak-bilangan', topic: T, sub: 'Menebak Bilangan dari Petunjuk', level: 'Provinsi', diff: 'Sedang', sec: 90,
    make(r) {
      for (let att = 0; att < 100; att++) {
        const d1 = r.pick([3, 4, 5, 6]), d2 = r.pick([7, 8, 9]);
        const r1 = r.int(1, d1 - 1), r2 = r.int(1, d2 - 1);
        const S = r.int(5, 16);
        const sols = range(10, 99).filter((n) => n % d1 === r1 && n % d2 === r2 && Math.floor(n / 10) + (n % 10) === S);
        if (sols.length !== 1) continue;
        return {
          q: `Aku adalah bilangan dua angka. Jika aku dibagi ${d1}, sisanya ${r1}. Jika aku dibagi ${d2}, sisanya ${r2}. Jumlah angka-angkaku adalah ${S}. Siapakah aku?`,
          ans: sols[0],
          exp: `Daftar bilangan dua angka yang bersisa ${r2} jika dibagi ${d2}: ${range(10, 99).filter((n) => n % d2 === r2).join(', ')}. Yang juga bersisa ${r1} jika dibagi ${d1} dan jumlah angkanya ${S} hanya ${sols[0]}.`,
          tip: 'Mulai dari syarat dengan pembagi terbesar (kandidatnya paling sedikit).',
        };
      }
      throw new Retry();
    },
  },
  {
    key: 'log-rata-umur-keluarga', topic: T, sub: 'Rata-rata Umur', level: 'Provinsi', diff: 'Sedang', sec: 80,
    make(r) {
      const ayah = r.int(32, 50), ibu = r.int(28, ayah), anak = r.int(5, 15);
      if ((ayah + ibu + anak) % 3 || (ibu + anak) % 2) throw new Retry();
      return {
        q: `Rata-rata umur ayah, ibu, dan seorang anak adalah ${(ayah + ibu + anak) / 3} tahun. Rata-rata umur ibu dan anak adalah ${(ibu + anak) / 2} tahun. Umur ayah adalah ... tahun.`,
        ans: ayah,
        exp: `Jumlah umur ketiganya = 3 × ${(ayah + ibu + anak) / 3} = ${ayah + ibu + anak}. Jumlah umur ibu dan anak = 2 × ${(ibu + anak) / 2} = ${ibu + anak}. Umur ayah = ${ayah + ibu + anak} − ${ibu + anak} = ${ayah}.`,
        tip: 'Ubah setiap rata-rata menjadi jumlah, lalu kurangkan.',
      };
    },
  },

  // ============ NASIONAL ============
  {
    key: 'log-halaman-hilang', topic: T, sub: 'Halaman Buku yang Hilang', level: 'Nasional', diff: 'HOTS', sec: 140,
    make(r) {
      const N = 2 * r.int(20, 60);
      const k = r.int(1, N / 2);
      const missing = [2 * k - 1, 2 * k];
      const S = (N * (N + 1)) / 2 - sum(missing);
      const askSum = r.chance(0.4);
      return {
        q: `Sebuah buku memiliki halaman bernomor 1 sampai ${N}. Satu lembar kertas (berisi dua halaman bernomor berurutan: ganjil di depan, genap di belakang) terlepas dan hilang. Jumlah nomor halaman yang tersisa adalah ${S}. ${askSum ? 'Jumlah kedua nomor halaman yang hilang adalah ...' : 'Nomor halaman ganjil pada lembar yang hilang adalah ...'}`,
        ans: askSum ? sum(missing) : missing[0],
        exp: `Jumlah semua halaman = ${N} × ${N + 1} ÷ 2 = ${(N * (N + 1)) / 2}. Yang hilang berjumlah ${(N * (N + 1)) / 2} − ${S} = ${sum(missing)}. Dua bilangan berurutan berjumlah ${sum(missing)} adalah ${missing[0]} dan ${missing[1]}.`,
        tip: 'Hitung jumlah seharusnya dengan rumus Gauss, lalu selisihnya adalah halaman yang hilang.',
      };
    },
  },
  {
    key: 'log-lomba-lari', topic: T, sub: 'Perbandingan Kecepatan Lomba Lari', level: 'Nasional', diff: 'HOTS', sec: 130,
    make(r) {
      for (;;) {
        const D = r.pick([100, 200, 400, 1000]);
        const x = r.int(1, D / 5), y = r.int(1, D / 5);
        const lead = D - ((D - x) * (D - y)) / D;
        if (!Number.isInteger(lead)) continue;
        const [a, b, c] = r.sample(NAMA, 3);
        return {
          q: `Dalam lomba lari ${D} m, ketika ${a} mencapai garis finis, ${b} masih tertinggal ${x} m. Dalam lomba lain sejauh ${D} m, ketika ${b} mencapai finis, ${c} tertinggal ${y} m. Jika ${a} dan ${c} berlomba ${D} m dengan kecepatan yang sama seperti sebelumnya, ${c} akan tertinggal ... m ketika ${a} mencapai finis.`,
          ans: lead,
          exp: `Saat ${a} berlari ${D} m, ${b} berlari ${D - x} m. Saat ${b} berlari ${D} m, ${c} berlari ${D - y} m, jadi saat ${b} berlari ${D - x} m, ${c} berlari ${D - y} × ${D - x}/${D} = ${((D - x) * (D - y)) / D} m. ${c} tertinggal ${D} − ${((D - x) * (D - y)) / D} = ${lead} m. (Bukan ${x} + ${y} = ${x + y}!)`,
          tip: 'Gunakan perbandingan kecepatan, jangan langsung menjumlahkan selisihnya.',
        };
      }
    },
  },
  {
    key: 'log-eskalator', topic: T, sub: 'Kecepatan Relatif (Eskalator & Arus)', level: 'Nasional', diff: 'HOTS', sec: 120,
    make(r) {
      if (r.chance(0.5)) {
        const [a, b] = r.pick([[60, 40], [30, 60], [40, 120], [36, 45], [90, 60], [20, 30], [45, 90], [72, 24]]);
        const t = (a * b) / (a + b);
        if (!Number.isInteger(t)) throw new Retry();
        const nm = r.pick(NAMA);
        return { q: `Jika ${nm} hanya berdiri di eskalator yang bergerak, ia sampai di atas dalam ${a} detik. Jika ${nm} berjalan di eskalator yang mati (diam), ia sampai di atas dalam ${b} detik. Jika ${nm} berjalan di eskalator yang sedang bergerak, berapa detik ia sampai di atas?`, ans: t, exp: `Per detik, eskalator menempuh 1/${a} panjang dan ${nm} 1/${b} panjang. Bersama: 1/${a} + 1/${b} = 1/${t}. Jadi ${t} detik.`, tip: 'Sama seperti kerja bersama: (a × b) ÷ (a + b).' };
      }
      for (;;) {
        const v = r.int(8, 20), w = r.int(1, 5), D = r.pick([24, 30, 36, 48, 60, 72, 84, 90, 96, 120]);
        const t1 = D / (v + w), t2 = D / (v - w);
        if (!Number.isInteger(t1) || !Number.isInteger(t2)) continue;
        return { q: `Sebuah perahu dapat melaju ${v} km/jam di air tenang. Kecepatan arus sungai ${w} km/jam. Perahu pergi ke hilir sejauh ${D} km lalu kembali ke hulu ke tempat semula. Waktu perjalanan pulang-pergi adalah ... jam.`, ans: t1 + t2, exp: `Ke hilir (searah arus): ${v} + ${w} = ${v + w} km/jam, waktu ${D} ÷ ${v + w} = ${t1} jam. Ke hulu (melawan arus): ${v} − ${w} = ${v - w} km/jam, waktu ${D} ÷ ${v - w} = ${t2} jam. Total ${t1 + t2} jam.`, tip: 'Searah arus: kecepatan dijumlah; melawan arus: dikurangi.' };
      }
    },
  },
  {
    key: 'log-jam-digital', topic: T, sub: 'Mencacah pada Jam Digital', level: 'Nasional', diff: 'HOTS', sec: 130,
    make(r) {
      const form = r.int(0, 2);
      const times: string[] = [];
      for (let h = 0; h < 24; h++) for (let m = 0; m < 60; m++) times.push(`${String(h).padStart(2, '0')}${String(m).padStart(2, '0')}`);
      if (form === 0) {
        const d = r.int(1, 9);
        const cnt = times.filter((t) => t.includes(String(d))).length;
        return { q: `Sebuah jam digital menampilkan waktu dalam format 24 jam dari 00:00 sampai 23:59. Dalam sehari, berapa menit tampilan jam itu memuat paling sedikit satu angka ${d}?`, ans: cnt, exp: `Hitung komplemennya: tampilan yang sama sekali tidak memuat angka ${d}, lalu kurangkan dari 1.440 menit. Hasilnya ${cnt} menit.`, tip: 'Hitung pilihan setiap digit (jam puluhan, jam satuan, menit puluhan, menit satuan) yang bukan angka tersebut.' };
      }
      if (form === 1) {
        const S = r.int(15, 23);
        const cnt = times.filter((t) => t.split('').reduce((s, c) => s + Number(c), 0) === S).length;
        if (!cnt) throw new Retry();
        return { q: `Sebuah jam digital menampilkan waktu dalam format 24 jam dari 00:00 sampai 23:59. Dalam sehari, berapa kali jumlah keempat angka yang tampil sama dengan ${S}?`, ans: cnt, exp: `Untuk setiap jam (00–23), hitung pasangan menit (00–59) yang membuat jumlah angkanya ${S}. Totalnya ${cnt} kali.`, tip: 'Jam dengan jumlah angka besar (misalnya 19) menyisakan sedikit pilihan menit; daftar per jam.' };
      }
      const cnt = times.filter((t) => t === t.split('').reverse().join('')).length;
      const cnt3 = times.filter((t) => new Set(t.split('')).size === 4).length;
      if (r.chance(0.5)) return { q: `Sebuah jam digital menampilkan waktu dalam format 24 jam dari 00:00 sampai 23:59. Berapa kali dalam sehari tampilannya berupa palindrom (sama jika dibaca dari kiri atau kanan, contoh 12:21)?`, ans: cnt, exp: `Tampilan AB:CD palindrom jika C = B dan D = A. Jam AB menentukan menit BA, dan menit BA harus ≤ 59, sehingga angka B ≤ 5. Jam yang memenuhi: ${cnt} buah.`, tip: 'Jam menentukan menitnya; cek apakah menit hasil pembalikan valid.' };
      return { q: `Sebuah jam digital menampilkan waktu dalam format 24 jam dari 00:00 sampai 23:59. Berapa menit dalam sehari keempat angka yang tampil semuanya berbeda?`, ans: cnt3, exp: `Hitung per jam: jika dua angka jam berbeda, pilih angka puluhan menit (0–5) dan satuan menit yang belum dipakai. Totalnya ${cnt3} menit.`, tip: 'Pisahkan kasus berdasarkan angka jam yang sudah terpakai.' };
    },
  },
  {
    key: 'log-lampu-saklar', topic: T, sub: 'Lampu & Saklar', level: 'Nasional', diff: 'HOTS', sec: 130,
    make(r) {
      const N = r.int(30, 300);
      if (r.chance(0.5)) {
        const on = Array(N + 1).fill(false);
        for (let k = 1; k <= N; k++) for (let j = k; j <= N; j += k) on[j] = !on[j];
        const cnt = on.filter(Boolean).length;
        return { q: `Ada ${N} lampu bernomor 1 sampai ${N}, semuanya mati. Siswa ke-1 menekan saklar semua lampu, siswa ke-2 menekan saklar lampu kelipatan 2, siswa ke-3 lampu kelipatan 3, dan seterusnya sampai siswa ke-${N}. (Menekan saklar mengubah lampu mati → nyala atau nyala → mati.) Berapa lampu yang menyala di akhir?`, ans: cnt, exp: `Lampu nomor n ditekan sebanyak banyak faktornya. Lampu menyala jika ditekan ganjil kali, yaitu jika n kuadrat sempurna. Kuadrat ≤ ${N}: 1, 4, 9, ..., ${Math.floor(Math.sqrt(N)) ** 2} → ${cnt} lampu.`, tip: 'Banyak faktor ganjil hanya pada bilangan kuadrat.' };
      }
      const [a, b] = r.pick([[2, 3], [2, 5], [3, 4], [3, 5], [2, 7]]);
      const cnt = range(1, N).filter((n) => ((n % a === 0 ? 1 : 0) + (n % b === 0 ? 1 : 0)) % 2 === 0).length;
      return { q: `Ada ${N} lampu bernomor 1 sampai ${N}, semuanya menyala. Ahmad menekan saklar semua lampu bernomor kelipatan ${a}, lalu Budi menekan saklar semua lampu bernomor kelipatan ${b}. Berapa lampu yang masih menyala?`, ans: cnt, exp: `Lampu mati jika ditekan tepat sekali: kelipatan ${a} atau ${b} tetapi bukan keduanya. Kelipatan ${a}: ${Math.floor(N / a)}, kelipatan ${b}: ${Math.floor(N / b)}, kelipatan ${a * b}: ${Math.floor(N / (a * b))}. Yang mati = ${Math.floor(N / a)} + ${Math.floor(N / b)} − 2 × ${Math.floor(N / (a * b))} = ${N - cnt}. Yang menyala = ${cnt}.`, tip: 'Ditekan dua kali = kembali seperti semula.' };
    },
  },
  {
    key: 'log-lintasan-melingkar', topic: T, sub: 'Bertemu pada Lintasan Melingkar', level: 'Nasional', diff: 'HOTS', sec: 130,
    make(r) {
      for (;;) {
        const K = r.pick([300, 400, 600, 800, 1000, 1200]);
        const a = 10 * r.int(8, 25), b = 10 * r.int(8, 25);
        if (a === b) continue;
        const same = r.chance(0.5);
        const rel = same ? Math.abs(a - b) : a + b;
        const t = K / rel;
        const [x, y] = r.sample(NAMA, 2);
        if (r.chance(0.5)) {
          if (!Number.isInteger(t)) continue;
          return { q: `${x} dan ${y} berlari di lintasan melingkar sepanjang ${K} m, mulai dari titik yang sama pada waktu yang sama, ${same ? 'dengan arah yang sama' : 'dengan arah berlawanan'}. Kecepatan ${x} ${a} m/menit dan ${y} ${b} m/menit. Setelah berapa menit mereka pertama kali bertemu lagi?`, ans: t, exp: `${same ? `Searah: pelari yang lebih cepat harus unggul satu putaran penuh. Kecepatan relatif = ${Math.max(a, b)} − ${Math.min(a, b)} = ${rel} m/menit.` : `Berlawanan arah: jumlah jarak keduanya satu putaran. Kecepatan relatif = ${a} + ${b} = ${rel} m/menit.`} Waktu = ${K} ÷ ${rel} = ${t} menit.`, tip: 'Searah → selisih kecepatan; berlawanan → jumlah kecepatan; jaraknya satu keliling.' };
        }
        const T2 = r.pick([30, 45, 60, 90]);
        const meets = Math.floor((T2 * rel) / K);
        if (meets < 1) continue;
        return { q: `${x} dan ${y} berlari di lintasan melingkar sepanjang ${K} m, mulai dari titik yang sama pada waktu yang sama, ${same ? 'dengan arah yang sama' : 'dengan arah berlawanan'}. Kecepatan ${x} ${a} m/menit dan ${y} ${b} m/menit. Berapa kali mereka bertemu (tidak termasuk saat start) dalam ${T2} menit pertama?`, ans: meets, exp: `Mereka bertemu setiap kali selisih (atau jumlah) jarak tempuhnya bertambah ${K} m. Dalam ${T2} menit, ${same ? 'selisih' : 'jumlah'} jarak = ${rel} × ${T2} = ${rel * T2} m. Banyak pertemuan = ⌊${rel * T2} ÷ ${K}⌋ = ${meets}.`, tip: 'Hitung total jarak relatif, lalu bagi dengan keliling (bulatkan ke bawah).' };
      }
    },
  },
  {
    key: 'log-umur-teka-teki', topic: T, sub: 'Teka-teki Umur Lanjut', level: 'Nasional', diff: 'HOTS', sec: 140,
    make(r) {
      for (;;) {
        const n = r.int(3, 4);
        const ages = Array.from({ length: n }, () => r.int(2, 14)).sort((a, b) => b - a);
        if (new Set(ages).size < n) continue;
        const p = r.int(30, 45);
        const nowSum = sum(ages);
        // years until father's age equals sum of children's ages
        const years = (p - nowSum) / (n - 1);
        if (!Number.isInteger(years) || years <= 0 || years > 30) continue;
        return {
          q: `Umur seorang ayah sekarang ${p} tahun. Ia mempunyai ${n} anak yang berumur ${ages.join(', ')} tahun. Berapa tahun lagi umur ayah sama dengan jumlah umur ${n} anaknya?`,
          ans: years,
          exp: `Setiap tahun umur ayah bertambah 1, sedangkan jumlah umur ${n} anak bertambah ${n}. Selisihnya mengecil ${n - 1} tiap tahun. Selisih sekarang ${p} − ${nowSum} = ${p - nowSum}. Waktu = ${p - nowSum} ÷ ${n - 1} = ${years} tahun.`,
          tip: 'Perhatikan laju pertambahan: jumlah umur n orang bertambah n setiap tahun.',
        };
      }
    },
  },
];

