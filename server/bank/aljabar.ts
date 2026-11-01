import { Generator, Retry, gcd, range, sum, fmt, rp, HARI, BULAN, NAMA, NAMA_L, NAMA_P, reduced } from './core';

const T = 'Aljabar & Pola Bilangan' as const;

export const aljabar: Generator[] = [
  // ============ KABUPATEN/KOTA ============
  {
    key: 'alj-pola-berikut', topic: T, sub: 'Menentukan Suku Berikutnya', level: 'Kabupaten/Kota', diff: 'Mudah', sec: 50,
    make(r) {
      const type = r.int(0, 5);
      let seq: number[] = [];
      let exp = '';
      if (type === 0) {
        const a = r.int(2, 20), d = r.int(3, 13);
        seq = range(0, 5).map((i) => a + i * d);
        exp = `Barisan bertambah ${d} setiap suku.`;
      } else if (type === 1) {
        const a = r.int(1, 9), d0 = r.int(1, 5), k = r.int(1, 4);
        seq = [a];
        for (let i = 0; i < 5; i++) seq.push(seq[i] + d0 + i * k);
        exp = `Selisihnya ${range(0, 3).map((i) => d0 + i * k).join(', ')}, ... (bertambah ${k}), jadi selisih berikutnya ${d0 + 4 * k}.`;
      } else if (type === 2) {
        const a = r.int(1, 5), q = r.int(2, 3);
        seq = range(0, 5).map((i) => a * q ** i);
        exp = `Setiap suku dikali ${q}.`;
      } else if (type === 3) {
        const a = r.int(1, 5), b = r.int(1, 6);
        seq = [a, b];
        for (let i = 2; i < 6; i++) seq.push(seq[i - 1] + seq[i - 2]);
        exp = 'Setiap suku adalah jumlah dua suku sebelumnya (pola Fibonacci).';
      } else if (type === 4) {
        const c = r.int(-1, 5);
        seq = range(1, 6).map((n) => n * n + c);
        exp = `Suku ke-n = n² ${c >= 0 ? '+ ' + c : '− ' + -c} (bilangan kuadrat ${c >= 0 ? 'ditambah ' + c : 'dikurangi ' + -c}).`;
      } else {
        const a = r.int(20, 40), u = r.int(5, 9), dn = r.int(2, 4);
        seq = [a];
        for (let i = 1; i < 6; i++) seq.push(seq[i - 1] + (i % 2 ? u : -dn));
        exp = `Polanya bergantian: +${u}, −${dn}, +${u}, −${dn}, ...`;
      }
      const ans = seq[5];
      return {
        q: `Suku berikutnya dari barisan ${seq.slice(0, 5).join(', ')}, ... adalah ...`,
        ans, wrong: [ans + 1, ans - 2, seq[4] + (seq[4] - seq[3]), ans + 3],
        exp: `${exp} Suku berikutnya = ${ans}.`,
        tip: 'Periksa selisih antarsuku dulu. Jika selisihnya tidak tetap, periksa selisih tingkat dua, rasio, atau jumlah dua suku sebelumnya.',
      };
    },
  },
  {
    key: 'alj-bilangan-berurutan', topic: T, sub: 'Bilangan Berurutan', level: 'Kabupaten/Kota', diff: 'Mudah', sec: 50,
    make(r) {
      const k = r.pick([3, 4, 5]);
      const kind = r.pick(['asli', 'ganjil', 'genap'] as const);
      const step = kind === 'asli' ? 1 : 2;
      let a = r.int(11, 120);
      if (kind === 'ganjil' && a % 2 === 0) a++;
      if (kind === 'genap' && a % 2 === 1) a++;
      const nums = range(0, k - 1).map((i) => a + i * step);
      const S = sum(nums);
      const big = r.chance(0.5);
      const ans = big ? nums[k - 1] : nums[0];
      return {
        q: `Jumlah ${k} bilangan ${kind} berurutan adalah ${S}. Bilangan yang ${big ? 'terbesar' : 'terkecil'} adalah ...`,
        ans, wrong: [big ? nums[0] : nums[k - 1], Math.round(S / k), ans + step],
        exp: `Nilai tengah (rata-rata) = ${S} ÷ ${k} = ${fmt(S / k)}. Bilangan-bilangannya ${nums.join(', ')}. Jadi yang ${big ? 'terbesar' : 'terkecil'} ${ans}.`,
        tip: 'Bagi jumlah dengan banyak bilangan untuk mendapat nilai tengah, lalu melangkah ke kiri/kanan.',
      };
    },
  },
  {
    key: 'alj-simbol', topic: T, sub: 'Persamaan Simbol', level: 'Kabupaten/Kota', diff: 'Mudah', sec: 60,
    make(r) {
      const [s1, s2, s3] = r.sample(['★', '▲', '●', '■', '♥', '◆'], 3);
      const x = r.int(2, 15), y = r.int(2, 15), z = r.int(2, 15);
      const form = r.int(0, 2);
      if (form === 0) {
        return {
          q: `Diketahui:\n${s1} + ${s2} = ${x + y}\n${s2} + ${s3} = ${y + z}\n${s1} + ${s3} = ${x + z}\nNilai ${s1} + ${s2} + ${s3} adalah ...`,
          ans: x + y + z, wrong: [2 * (x + y + z), x + y + z + 2, x + y],
          exp: `Jumlahkan ketiga persamaan: 2 × (${s1} + ${s2} + ${s3}) = ${x + y} + ${y + z} + ${x + z} = ${2 * (x + y + z)}. Jadi ${s1} + ${s2} + ${s3} = ${x + y + z}.`,
          tip: 'Jika tiap simbol muncul dua kali, jumlahkan semua lalu bagi 2.',
        };
      }
      if (form === 1) {
        return {
          q: `Diketahui:\n${s1} + ${s1} + ${s2} = ${2 * x + y}\n${s1} + ${s2} = ${x + y}\nNilai ${s1} × ${s2} adalah ...`,
          ans: x * y, wrong: [x + y, x * x, y * y, x * y + x],
          exp: `Kurangkan persamaan kedua dari yang pertama: ${s1} = ${2 * x + y} − ${x + y} = ${x}. Maka ${s2} = ${x + y} − ${x} = ${y}. Jadi ${s1} × ${s2} = ${x * y}.`,
          tip: 'Bandingkan dua persamaan yang hampir sama; selisihnya langsung memberi satu simbol.',
        };
      }
      return {
        q: `Diketahui:\n${s1} × 3 = ${3 * x}\n${s1} + ${s2} = ${x + y}\n${s2} − ${s3} = ${y - z}\nNilai ${s1} + ${s2} × ${s3} adalah ...`,
        ans: x + y * z, wrong: [(x + y) * z, x + y + z, x * y + z],
        exp: `${s1} = ${3 * x} ÷ 3 = ${x}. ${s2} = ${x + y} − ${x} = ${y}. ${s3} = ${y} − (${y - z}) = ${z}. Maka ${s1} + ${s2} × ${s3} = ${x} + ${y * z} = ${x + y * z} (perkalian dikerjakan dulu).`,
        tip: 'Selesaikan berantai dari persamaan yang hanya punya satu simbol. Ingat: kali dulu, baru tambah.',
      };
    },
  },
  {
    key: 'alj-harga-buah', topic: T, sub: 'Sistem Persamaan dalam Soal Cerita', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 90,
    make(r) {
      for (;;) {
        const pa = 500 * r.int(3, 16), pb = 500 * r.int(2, 14);
        const [a1, b1, a2, b2] = [r.int(1, 4), r.int(1, 4), r.int(1, 4), r.int(1, 4)];
        if (a1 * b2 - a2 * b1 === 0 || (a1 === a2 && b1 === b2)) continue;
        const [x, y] = r.sample(['apel', 'jeruk', 'mangga', 'salak', 'pir'], 2);
        const [n1, n2] = r.sample(NAMA, 2);
        const qa = r.int(1, 5), qb = r.int(1, 5);
        return {
          q: `${n1} membeli ${a1} ${x} dan ${b1} ${y} seharga ${rp(a1 * pa + b1 * pb)}. ${n2} membeli ${a2} ${x} dan ${b2} ${y} seharga ${rp(a2 * pa + b2 * pb)} di toko yang sama. Berapa harga ${qa} ${x} dan ${qb} ${y}?`,
          ans: qa * pa + qb * pb, prefix: 'Rp', wrong: [qa * pb + qb * pa, (qa + qb) * pa, qa * pa + qb * pb + 1000],
          exp: `Misal harga 1 ${x} = A dan 1 ${y} = B. ${a1}A + ${b1}B = ${a1 * pa + b1 * pb} dan ${a2}A + ${b2}B = ${a2 * pa + b2 * pb}. Dengan eliminasi diperoleh A = ${rp(pa)} dan B = ${rp(pb)}. Jadi ${qa} × ${rp(pa)} + ${qb} × ${rp(pb)} = ${rp(qa * pa + qb * pb)}.`,
          tip: 'Samakan banyak salah satu buah pada kedua belanjaan (kalikan), lalu kurangkan.',
        };
      }
    },
  },
  {
    key: 'alj-umur-jumlah-selisih', topic: T, sub: 'Jumlah & Selisih', level: 'Kabupaten/Kota', diff: 'Mudah', sec: 50,
    make(r) {
      const a = r.int(8, 45), b = a - r.int(2, 12);
      const [x, y] = r.sample(NAMA, 2);
      const ctx = r.pick([
        { what: 'umur', unit: 'tahun' },
        { what: 'berat badan', unit: 'kg' },
        { what: 'banyak buku', unit: 'buku' },
      ]);
      return {
        q: `Jumlah ${ctx.what} ${x} dan ${y} adalah ${a + b} ${ctx.unit}. ${x} ${a - b} ${ctx.unit} lebih ${ctx.what === 'berat badan' ? 'berat' : ctx.what === 'umur' ? 'tua' : 'banyak'} daripada ${y}. ${ctx.what[0].toUpperCase() + ctx.what.slice(1)} ${x} adalah ... ${ctx.unit}.`,
        ans: a, wrong: [b, (a + b) / 2, a + b - (a - b) / 2],
        exp: `${x} = (jumlah + selisih) ÷ 2 = (${a + b} + ${a - b}) ÷ 2 = ${a}. ${y} = ${a + b} − ${a} = ${b}.`,
        tip: 'Yang lebih besar = (jumlah + selisih) ÷ 2; yang lebih kecil = (jumlah − selisih) ÷ 2.',
      };
    },
  },
  {
    key: 'alj-operasi-baru', topic: T, sub: 'Operasi Baru (Definisi Simbol)', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 60,
    make(r) {
      const defs = [
        { s: '2a + b', f: (a: number, b: number) => 2 * a + b },
        { s: 'a × b − a − b', f: (a: number, b: number) => a * b - a - b },
        { s: 'a² − b', f: (a: number, b: number) => a * a - b },
        { s: 'a × b + a + b', f: (a: number, b: number) => a * b + a + b },
        { s: '3a − 2b', f: (a: number, b: number) => 3 * a - 2 * b },
        { s: '(a + b) × (a − b)', f: (a: number, b: number) => (a + b) * (a - b) },
      ];
      const d = r.pick(defs);
      const op = r.pick(['⊕', '⊗', '⊙', '#']);
      const x = r.int(2, 6), y = r.int(1, 5), z = r.int(1, 5);
      const inner = d.f(x, y);
      const ans = d.f(inner, z);
      return {
        q: `Operasi ${op} didefinisikan sebagai a ${op} b = ${d.s}. Nilai dari (${x} ${op} ${y}) ${op} ${z} adalah ...`,
        ans, wrong: [d.f(x, d.f(y, z)), inner, d.f(z, inner)],
        exp: `${x} ${op} ${y} = ${inner}. Lalu ${inner} ${op} ${z} = ${ans}.`,
        tip: 'Kerjakan yang di dalam kurung dulu, lalu hasilnya menjadi "a" pada langkah berikutnya.',
      };
    },
  },
  {
    key: 'alj-persamaan-linear', topic: T, sub: 'Persamaan Linear Satu Variabel', level: 'Kabupaten/Kota', diff: 'Mudah', sec: 60,
    make(r) {
      for (;;) {
        const x = r.int(-5, 20);
        const k = r.int(2, 6), a = r.int(1, 9), b = r.int(1, 20), m = r.int(1, 5);
        if (k === m) continue;
        const c = k * (x + a) - b - m * x;
        return {
          q: `Nilai x yang memenuhi ${k}(x + ${a}) − ${b} = ${m === 1 ? '' : m}x ${c >= 0 ? '+ ' + c : '− ' + -c} adalah ...`,
          ans: x, wrong: [x + 1, -x === x ? x + 2 : -x, x + a],
          exp: `${k}x + ${k * a} − ${b} = ${m === 1 ? '' : m}x ${c >= 0 ? '+ ' + c : '− ' + -c} → ${k - m === 1 ? '' : k - m}x = ${c - k * a + b} → x = ${x}.`,
          tip: 'Buka kurung, kumpulkan x di satu ruas, angka di ruas lain.',
        };
      }
    },
  },
  {
    key: 'alj-mundur', topic: T, sub: 'Bekerja Mundur', level: 'Kabupaten/Kota', diff: 'Mudah', sec: 60,
    make(r) {
      for (;;) {
        const x = r.int(3, 40), a = r.int(2, 6), b = r.int(1, 20), c = r.pick([2, 3, 4, 5]), d = r.int(1, 15);
        if ((x * a + b) % c !== 0) continue;
        const R = (x * a + b) / c - d;
        if (R <= 0) continue;
        const nm = r.pick(NAMA);
        return {
          q: `${nm} memikirkan sebuah bilangan. Bilangan itu dikalikan ${a}, ditambah ${b}, dibagi ${c}, lalu dikurangi ${d}. Hasil akhirnya ${R}. Bilangan yang dipikirkan ${nm} adalah ...`,
          ans: x, wrong: [((R - d) * c + b) / a, ((R + d) * c + b) / a, x + 1].filter(Number.isInteger),
          exp: `Kerjakan mundur dengan operasi kebalikannya: ${R} + ${d} = ${R + d}; × ${c} = ${(R + d) * c}; − ${b} = ${(R + d) * c - b}; ÷ ${a} = ${x}.`,
          tip: 'Mulai dari hasil akhir; tambah ↔ kurang, kali ↔ bagi, urutannya dibalik.',
        };
      }
    },
  },
  {
    key: 'alj-kaki-hewan', topic: T, sub: 'Masalah Kepala & Kaki', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 75,
    make(r) {
      const ctx = r.pick([
        { a: 'ayam', b: 'kambing', la: 2, lb: 4, part: 'kaki', head: 'kepala', place: 'di kandang Pak Hasan' },
        { a: 'sepeda', b: 'mobil', la: 2, lb: 4, part: 'roda', head: 'kendaraan', place: 'di tempat parkir' },
        { a: 'sepeda motor', b: 'becak', la: 2, lb: 3, part: 'roda', head: 'kendaraan', place: 'di halaman' },
        { a: 'bebek', b: 'sapi', la: 2, lb: 4, part: 'kaki', head: 'ekor hewan', place: 'di peternakan' },
        { a: 'meja kecil berkaki 3', b: 'meja besar berkaki 4', la: 3, lb: 4, part: 'kaki meja', head: 'meja', place: 'di aula' },
      ]);
      const na = r.int(5, 40), nb = r.int(3, 30);
      const askA = r.chance(0.5);
      const H = na + nb, L = na * ctx.la + nb * ctx.lb;
      return {
        q: `${ctx.place[0].toUpperCase() + ctx.place.slice(1)} terdapat ${ctx.a} dan ${ctx.b} sebanyak ${H} ${ctx.head}. Jumlah ${ctx.part} seluruhnya ${L}. Banyak ${askA ? ctx.a : ctx.b} adalah ...`,
        ans: askA ? na : nb, wrong: [askA ? nb : na, Math.round(L / (ctx.la + ctx.lb)), (askA ? na : nb) + 2],
        exp: `Andaikan semua ${ctx.a}: ${ctx.part} = ${H} × ${ctx.la} = ${H * ctx.la}. Kekurangan ${L} − ${H * ctx.la} = ${L - H * ctx.la}. Setiap ${ctx.b} menambah ${ctx.lb - ctx.la} ${ctx.part}, jadi ${ctx.b} = ${(L - H * ctx.la)} ÷ ${ctx.lb - ctx.la} = ${nb}, dan ${ctx.a} = ${H} − ${nb} = ${na}.`,
        tip: 'Metode "andaikan semua": anggap semuanya jenis yang kakinya sedikit, lalu hitung kekurangannya.',
      };
    },
  },
  {
    key: 'alj-kalender', topic: T, sub: 'Kalender & Hari', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 80,
    make(r) {
      const base = new Date(Date.UTC(r.int(2026, 2028), r.int(0, 11), r.int(1, 28)));
      const offset = r.int(40, 400);
      const target = new Date(base.getTime() + offset * 86400000);
      const fmtD = (d: Date) => `${d.getUTCDate()} ${BULAN[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
      const ans = HARI[target.getUTCDay()];
      const back = r.chance(0.3);
      if (back) {
        return {
          q: `Tanggal ${fmtD(target)} jatuh pada hari ${ans}. Tanggal ${fmtD(base)} jatuh pada hari ...`,
          ans: HARI[base.getUTCDay()], wrong: r.shuffle(HARI.filter((h) => h !== HARI[base.getUTCDay()])),
          exp: `Dari ${fmtD(base)} ke ${fmtD(target)} ada ${offset} hari. ${offset} = 7 × ${Math.floor(offset / 7)} + ${offset % 7}. Mundur ${offset % 7} hari dari ${ans} adalah ${HARI[base.getUTCDay()]}.`,
          tip: 'Hitung selisih hari (perhatikan banyak hari tiap bulan dan tahun kabisat), lalu ambil sisa bagi 7.',
        };
      }
      return {
        q: `Tanggal ${fmtD(base)} jatuh pada hari ${HARI[base.getUTCDay()]}. Tanggal ${fmtD(target)} jatuh pada hari ...`,
        ans, wrong: r.shuffle(HARI.filter((h) => h !== ans)),
        exp: `Dari ${fmtD(base)} ke ${fmtD(target)} ada ${offset} hari. ${offset} = 7 × ${Math.floor(offset / 7)} + ${offset % 7}. Maju ${offset % 7} hari dari ${HARI[base.getUTCDay()]} adalah ${ans}.`,
        tip: 'Hitung selisih hari (perhatikan banyak hari tiap bulan dan tahun kabisat), lalu ambil sisa bagi 7.',
      };
    },
  },
  {
    key: 'alj-bagi-uang', topic: T, sub: 'Pembagian Bersyarat', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 80,
    make(r) {
      const adik = 1000 * r.int(5, 40);
      const k = r.pick([2, 3]);
      const extra = 1000 * r.int(2, 15);
      const tengah = k * adik, kakak = tengah + extra;
      const total = adik + tengah + kakak;
      const [a, b, c] = r.sample(NAMA, 3);
      return {
        q: `Uang sebesar ${rp(total)} dibagikan kepada ${a}, ${b}, dan ${c}. ${b} mendapat ${k} kali bagian ${c}, sedangkan ${a} mendapat ${rp(extra)} lebih banyak daripada ${b}. Berapa bagian ${c}?`,
        ans: adik, prefix: 'Rp', wrong: [tengah, Math.round(total / 3 / 1000) * 1000, adik + extra],
        exp: `Misal bagian ${c} = 1 kotak. ${b} = ${k} kotak, ${a} = ${k} kotak + ${rp(extra)}. Total ${1 + 2 * k} kotak + ${rp(extra)} = ${rp(total)}, jadi ${1 + 2 * k} kotak = ${rp(total - extra)} dan 1 kotak = ${rp(adik)}.`,
        tip: 'Gunakan model kotak (bar model): nyatakan semua bagian dalam kotak milik orang dengan bagian terkecil.',
      };
    },
  },

  // ============ PROVINSI ============
  {
    key: 'alj-suku-ke-n', topic: T, sub: 'Suku ke-n Barisan Bertingkat', level: 'Provinsi', diff: 'Sedang', sec: 90,
    make(r) {
      const A = r.pick([0, 1, 1, 2, 3]);
      const B = r.int(-3, 6), Cc = r.int(-2, 8);
      const u = (n: number) => A * n * n + B * n + Cc;
      const seq = range(1, 5).map(u);
      if (new Set(seq).size < 5 || seq.some((v) => v <= 0)) throw new Retry();
      const k = r.int(20, 80);
      return {
        q: `Diketahui barisan ${seq.join(', ')}, ... Suku ke-${k} barisan tersebut adalah ...`,
        ans: u(k),
        exp: A === 0
          ? `Selisih tetap ${B}, jadi Uₙ = ${B}n ${Cc >= 0 ? '+ ' + Cc : '− ' + -Cc}. U${k} = ${B} × ${k} ${Cc >= 0 ? '+ ' + Cc : '− ' + -Cc} = ${u(k)}.`
          : `Selisih tingkat pertama: ${seq.slice(1).map((v, i) => v - seq[i]).join(', ')}; selisih tingkat dua tetap ${2 * A}. Jadi Uₙ = ${A}n² ${B >= 0 ? '+ ' + B : '− ' + -B}n ${Cc >= 0 ? '+ ' + Cc : '− ' + -Cc}. U${k} = ${u(k)}.`,
        tip: 'Selisih tingkat dua tetap = 2a pada Uₙ = an² + bn + c. Cari a dulu, lalu b dan c dari suku pertama.',
      };
    },
  },
  {
    key: 'alj-jumlah-deret', topic: T, sub: 'Jumlah Deret Aritmetika', level: 'Provinsi', diff: 'Sedang', sec: 80,
    make(r) {
      if (r.chance(0.5)) {
        const a = r.int(1, 30), d = r.int(2, 9), n = r.int(15, 60);
        const L = a + (n - 1) * d;
        return {
          q: `Hasil dari ${a} + ${a + d} + ${a + 2 * d} + ... + ${L} adalah ...`,
          ans: (n * (a + L)) / 2,
          exp: `Banyak suku = (${L} − ${a}) ÷ ${d} + 1 = ${n}. Jumlah = banyak suku × (suku pertama + suku terakhir) ÷ 2 = ${n} × ${a + L} ÷ 2 = ${(n * (a + L)) / 2}.`,
          tip: 'Cara Gauss: pasangkan suku pertama dan terakhir; semua pasangan sama besar.',
        };
      }
      const k = r.int(3, 13);
      const A = r.int(10, 200), B = A + r.int(150, 800);
      const first = Math.ceil(A / k) * k, last = Math.floor(B / k) * k;
      const n = (last - first) / k + 1;
      return {
        q: `Jumlah semua bilangan kelipatan ${k} yang terletak antara ${A} dan ${B} (termasuk ${A} dan ${B} jika kelipatan ${k}) adalah ...`,
        ans: (n * (first + last)) / 2,
        exp: `Kelipatan ${k} pertama: ${first}, terakhir: ${last}. Banyaknya (${last} − ${first}) ÷ ${k} + 1 = ${n}. Jumlah = ${n} × (${first} + ${last}) ÷ 2 = ${(n * (first + last)) / 2}.`,
        tip: 'Tentukan kelipatan pertama dan terakhir dalam rentang, lalu pakai rumus Gauss.',
      };
    },
  },
  {
    key: 'alj-korek-api', topic: T, sub: 'Pola Gambar Batang Korek Api', level: 'Provinsi', diff: 'Sedang', sec: 90,
    make(r) {
      const pats = [
        { d: 'persegi yang berjajar dalam satu baris', f: (n: number) => 3 * n + 1, rule: '3n + 1', seq: '4, 7, 10' },
        { d: 'segitiga yang berjajar dalam satu baris (segitiga atas-bawah bergantian)', f: (n: number) => 2 * n + 1, rule: '2n + 1', seq: '3, 5, 7' },
        { d: 'segi enam yang berjajar dalam satu baris', f: (n: number) => 5 * n + 1, rule: '5n + 1', seq: '6, 11, 16' },
        { d: 'persegi yang membentuk petak n × n', f: (n: number) => 2 * n * (n + 1), rule: '2n(n + 1)', seq: '4, 12, 24' },
        { d: 'persegi yang tersusun dua baris (2 × n petak)', f: (n: number) => 5 * n + 2, rule: '5n + 2', seq: '7, 12, 17' },
      ];
      const p = r.pick(pats);
      if (r.chance(0.6) || p.rule.includes('n(')) {
        const n = r.int(10, 60);
        return {
          q: `Batang korek api disusun membentuk ${p.d}. Pola ke-1, ke-2, dan ke-3 berturut-turut memerlukan ${p.seq} batang. Berapa batang korek api yang diperlukan untuk pola ke-${n}?`,
          ans: p.f(n),
          exp: `Rumus pola ke-n adalah ${p.rule} (cek: n = 1, 2, 3 menghasilkan ${p.seq}). Untuk n = ${n}: ${p.f(n)} batang.`,
          tip: 'Pikirkan batang yang dibutuhkan untuk bangun pertama, lalu berapa batang tambahan untuk setiap bangun baru.',
        };
      }
      const n = r.int(15, 90);
      return {
        q: `Batang korek api disusun membentuk ${p.d}. Pola ke-1, ke-2, dan ke-3 berturut-turut memerlukan ${p.seq} batang. Jika tersedia tepat ${p.f(n)} batang dan semuanya terpakai, pola ke berapa yang terbentuk?`,
        ans: n,
        exp: `Rumus pola ke-n: ${p.rule}. ${p.rule} = ${p.f(n)} → n = ${n}.`,
        tip: 'Susun rumusnya, lalu selesaikan persamaan untuk n.',
      };
    },
  },
  {
    key: 'alj-pola-ubin', topic: T, sub: 'Pola Bilangan Bergambar', level: 'Provinsi', diff: 'Sedang', sec: 80,
    make(r) {
      const pats = [
        { d: 'tangga (pola ke-1: 1 ubin, ke-2: 3 ubin, ke-3: 6 ubin)', f: (n: number) => (n * (n + 1)) / 2, rule: 'n(n + 1)/2' },
        { d: 'tanda tambah "+" (pola ke-1: 5 ubin, ke-2: 9 ubin, ke-3: 13 ubin)', f: (n: number) => 4 * n + 1, rule: '4n + 1' },
        { d: 'huruf L (pola ke-1: 3 ubin, ke-2: 5 ubin, ke-3: 7 ubin)', f: (n: number) => 2 * n + 1, rule: '2n + 1' },
        { d: 'persegi panjang n × (n + 1) (pola ke-1: 2 ubin, ke-2: 6 ubin, ke-3: 12 ubin)', f: (n: number) => n * (n + 1), rule: 'n(n + 1)' },
        { d: 'bingkai persegi berongga (pola ke-1: 8 ubin mengelilingi 1 petak kosong, ke-2: 12 ubin, ke-3: 16 ubin)', f: (n: number) => 4 * n + 4, rule: '4n + 4' },
        { d: 'persegi berlubang tengah: persegi (2n+1) × (2n+1) tanpa 1 ubin tengah (ke-1: 8, ke-2: 24, ke-3: 48)', f: (n: number) => (2 * n + 1) ** 2 - 1, rule: '(2n + 1)² − 1' },
      ];
      const p = r.pick(pats);
      const n = r.int(10, 50);
      return {
        q: `Ubin-ubin disusun membentuk pola ${p.d}. Berapa banyak ubin pada pola ke-${n}?`,
        ans: p.f(n),
        exp: `Rumus banyak ubin pola ke-n adalah ${p.rule}. Untuk n = ${n} diperoleh ${p.f(n)} ubin.`,
        tip: 'Gambar pola ke-4 sendiri, lalu temukan bagian yang tetap dan bagian yang bertambah.',
      };
    },
  },
  {
    key: 'alj-pola-huruf', topic: T, sub: 'Pola Berulang (Huruf & Warna)', level: 'Provinsi', diff: 'Sedang', sec: 80,
    make(r) {
      const w = r.pick(['OLIMPIADE', 'MATEMATIKA', 'INDONESIA', 'JUARASD', 'SAINSKU', 'BISMILLAH', 'PRESTASI']);
      const letters = [...new Set(w.split(''))];
      const L = r.pick(letters);
      const N = r.int(100, 2026);
      const full = Math.floor(N / w.length), rest = N % w.length;
      const per = w.split('').filter((c) => c === L).length;
      const extra = w.slice(0, rest).split('').filter((c) => c === L).length;
      const ans = full * per + extra;
      return {
        q: `Kata "${w}" ditulis berulang-ulang tanpa spasi: ${w}${w}${w}... Berapa banyak huruf ${L} pada ${N} huruf pertama?`,
        ans,
        exp: `Satu kata = ${w.length} huruf dan memuat ${per} huruf ${L}. ${N} = ${w.length} × ${full} + ${rest}. Dari ${full} kata lengkap ada ${full * per} huruf ${L}; dari ${rest} huruf sisa ("${w.slice(0, rest)}") ada ${extra}. Total ${ans}.`,
        tip: 'Bagi dengan panjang pola, kalikan hasil bagi, lalu periksa sisanya secara manual.',
      };
    },
  },
  {
    key: 'alj-pecahan-sisa', topic: T, sub: 'Pecahan dari Sisa', level: 'Provinsi', diff: 'Sedang', sec: 90,
    make(r) {
      for (;;) {
        const [a, b] = [r.pick([2, 3, 4, 5]), r.pick([2, 3, 4, 5, 6])];
        const unit = 1000 * r.int(1, 10);
        const M = a * b * unit * r.int(1, 4);
        const s1 = M / a, rem1 = M - s1, s2 = rem1 / b, left = rem1 - s2;
        if (!Number.isInteger(s2)) continue;
        const nm = r.pick(NAMA);
        return {
          q: `${nm} membelanjakan 1/${a} uangnya untuk membeli buku, lalu 1/${b} dari sisanya untuk membeli alat tulis. Sisa uangnya sekarang ${rp(left)}. Berapa uang ${nm} mula-mula? (tulis angkanya saja)`,
          ans: M,
          exp: `Setelah membeli buku, sisa ${a - 1}/${a} bagian. Setelah membeli alat tulis, sisa ${b - 1}/${b} × ${a - 1}/${a} = ${(a - 1) * (b - 1)}/${a * b} bagian. ${(a - 1) * (b - 1)}/${a * b} × uang = ${left}, jadi uang = ${left} × ${a * b}/${(a - 1) * (b - 1)} = ${M}.`,
          tip: 'Kerjakan mundur: sisa akhir adalah (b−1)/b dari sisa pertama, dan sisa pertama adalah (a−1)/a dari uang awal.',
        };
      }
    },
  },
  {
    key: 'alj-selang-seling', topic: T, sub: 'Deret Selang-seling', level: 'Provinsi', diff: 'Sedang', sec: 75,
    make(r) {
      const form = r.int(0, 2);
      if (form === 0) {
        const N = r.int(50, 2026);
        let s = 0;
        for (let k = 1; k <= N; k++) s += k % 2 ? k : -k;
        return {
          q: `Hasil dari 1 − 2 + 3 − 4 + 5 − 6 + ... ${N % 2 ? '+' : '−'} ${N} adalah ...`,
          ans: s,
          exp: `Pasangkan (1 − 2) + (3 − 4) + ... tiap pasangan bernilai −1. ${N % 2 === 0 ? `Ada ${N / 2} pasangan, jadi hasilnya −${N / 2}.` : `Ada ${(N - 1) / 2} pasangan (= −${(N - 1) / 2}) ditambah ${N}, hasilnya ${s}.`}`,
          tip: 'Kelompokkan berpasangan dan hitung banyak pasangan.',
        };
      }
      if (form === 1) {
        const n = r.int(10, 60);
        const N = 3 * n;
        let s = 0;
        for (let k = 1; k <= N; k++) s += k % 3 === 0 ? -k : k;
        return {
          q: `Hasil dari 1 + 2 − 3 + 4 + 5 − 6 + 7 + 8 − 9 + ... + ${N - 2} + ${N - 1} − ${N} adalah ...`,
          ans: s,
          exp: `Kelompokkan tiga-tiga: (3k−2) + (3k−1) − 3k = 3k − 3. Untuk k = 1..${n}: jumlahnya 3 × (0 + 1 + ... + ${n - 1}) = 3 × ${(n * (n - 1)) / 2} = ${s}.`,
          tip: 'Pola berulang setiap 3 suku, jadi kelompokkan per 3.',
        };
      }
      const top = 2 * r.int(30, 100);
      let s = 0, sign = 1;
      for (let k = top; k >= 2; k -= 2) { s += sign * k; sign = -sign; }
      return {
        q: `Hasil dari ${top} − ${top - 2} + ${top - 4} − ${top - 6} + ... ${(top / 2) % 2 === 0 ? '−' : '+'} 2 adalah ...`,
        ans: s,
        exp: `Pasangkan (${top} − ${top - 2}) + (${top - 4} − ${top - 6}) + ... setiap pasangan = 2. Banyak suku ${top / 2}, ${(top / 2) % 2 === 0 ? `jadi ada ${top / 4} pasangan, hasilnya ${s}.` : `jadi ada ${(top / 2 - 1) / 2} pasangan ditambah suku terakhir 2, hasilnya ${s}.`}`,
        tip: 'Pasangkan suku berurutan; perhatikan apakah ada suku yang tidak punya pasangan.',
      };
    },
  },
  {
    key: 'alj-persegi-ajaib', topic: T, sub: 'Persegi Ajaib', level: 'Provinsi', diff: 'Sedang', sec: 75,
    make(r) {
      const a = r.int(1, 30), d = r.int(1, 5);
      const nums = range(0, 8).map((i) => a + i * d);
      const askCenter = r.chance(0.5);
      return {
        q: `Bilangan-bilangan ${nums.join(', ')} akan diisikan ke dalam persegi 3 × 3 sehingga jumlah bilangan pada setiap baris, kolom, dan diagonal sama. ${askCenter ? 'Bilangan yang harus diletakkan di petak tengah adalah ...' : 'Jumlah bilangan pada setiap baris adalah ...'}`,
        ans: askCenter ? nums[4] : sum(nums) / 3,
        exp: `Jumlah semua bilangan = ${sum(nums)}. Ada 3 baris, jadi jumlah tiap baris = ${sum(nums)} ÷ 3 = ${sum(nums) / 3}. Petak tengah dilalui 4 garis (baris, kolom, 2 diagonal) dan nilainya selalu bilangan tengah = ${sum(nums) / 3} ÷ 3 = ${nums[4]}.`,
        tip: 'Bilangan ajaib = jumlah semua ÷ 3. Petak tengah = bilangan ajaib ÷ 3.',
      };
    },
  },
  {
    key: 'alj-umur-rasio', topic: T, sub: 'Perbandingan Umur', level: 'Provinsi', diff: 'Sedang', sec: 100,
    make(r) {
      for (;;) {
        const c = r.int(4, 15), p = c + r.int(20, 35), k = r.int(3, 12);
        const [a1, b1] = reduced(p, c), [a2, b2] = reduced(p + k, c + k);
        if (a1 > 9 || b1 > 9 || a2 > 9 || b2 > 9 || (a1 === a2 && b1 === b2)) continue;
        const nm = r.pick(NAMA);
        return {
          q: `Perbandingan umur ayah dan ${nm} sekarang ${a1} : ${b1}. ${k} tahun yang akan datang perbandingannya menjadi ${a2} : ${b2}. Umur ayah sekarang adalah ... tahun.`,
          ans: p,
          exp: `Selisih umur selalu tetap. Sekarang selisihnya ${a1 - b1} bagian, nanti ${a2 - b2} bagian. Samakan selisihnya: umur ayah sekarang ${p}, ${nm} ${c} (selisih ${p - c}); ${k} tahun lagi ${p + k} dan ${c + k} (${a2} : ${b2}). Jadi umur ayah ${p} tahun.`,
          tip: 'Selisih umur tidak berubah. Samakan "bagian selisih" pada kedua perbandingan.',
        };
      }
    },
  },
  {
    key: 'alj-dua-angka', topic: T, sub: 'Bilangan Dua Angka', level: 'Provinsi', diff: 'Sedang', sec: 90,
    make(r) {
      for (;;) {
        const t = r.int(1, 8), u = r.int(t + 1, 9);
        const S = t + u, D = 9 * (u - t);
        const sols = range(10, 99).filter((n) => Math.floor(n / 10) + (n % 10) === S && (n % 10) * 10 + Math.floor(n / 10) - n === D);
        if (sols.length !== 1) continue;
        return {
          q: `Jumlah angka-angka suatu bilangan dua angka adalah ${S}. Jika letak kedua angkanya ditukar, bilangan baru ${D} lebih besar dari bilangan semula. Bilangan semula adalah ...`,
          ans: sols[0],
          exp: `Misal bilangan = 10a + b. Ditukar: 10b + a. Selisih = 9(b − a) = ${D}, jadi b − a = ${u - t}. Dengan a + b = ${S}: a = ${t}, b = ${u}. Bilangannya ${sols[0]}.`,
          tip: 'Selisih bilangan dan kebalikannya selalu 9 × (selisih kedua angka).',
        };
      }
    },
  },
  {
    key: 'alj-tiga-harga', topic: T, sub: 'Sistem Tiga Persamaan', level: 'Provinsi', diff: 'Sedang', sec: 80,
    make(r) {
      const [x, y, z] = [500 * r.int(4, 30), 500 * r.int(2, 12), 500 * r.int(1, 8)];
      const items = r.pick([['buku', 'pensil', 'penghapus'], ['roti', 'susu', 'permen'], ['kaos', 'topi', 'kaus kaki']]);
      const ask = r.int(0, 2);
      return {
        q: `Harga 1 ${items[0]} dan 1 ${items[1]} ${rp(x + y)}. Harga 1 ${items[1]} dan 1 ${items[2]} ${rp(y + z)}. Harga 1 ${items[0]} dan 1 ${items[2]} ${rp(x + z)}. Berapa rupiah harga 1 ${items[ask]}? (tulis angkanya saja)`,
        ans: [x, y, z][ask],
        exp: `Jumlah ketiganya: 2 × (harga ketiga barang) = ${x + y + y + z + x + z}, jadi ketiga barang = ${x + y + z}. Harga ${items[ask]} = ${x + y + z} − (harga dua barang lainnya) = ${[x, y, z][ask]}.`,
        tip: 'Jumlahkan ketiga persamaan, bagi 2, lalu kurangi pasangan yang tidak memuat barang yang ditanya.',
      };
    },
  },
  {
    key: 'alj-bakteri', topic: T, sub: 'Barisan Geometri', level: 'Provinsi', diff: 'Sedang', sec: 75,
    make(r) {
      const n0 = r.int(2, 30), t = r.pick([10, 15, 20, 30]), q = r.pick([2, 3]);
      const steps = r.int(3, q === 2 ? 9 : 6);
      const ans = n0 * q ** steps;
      if (r.chance(0.6)) {
        return {
          q: `Sebuah bakteri membelah diri menjadi ${q} setiap ${t} menit. Mula-mula terdapat ${n0} bakteri. Berapa banyak bakteri setelah ${steps * t} menit?`,
          ans,
          exp: `${steps * t} menit = ${steps} kali pembelahan. Banyak bakteri = ${n0} × ${q}${'⁰¹²³⁴⁵⁶⁷⁸⁹'[steps]} = ${ans}.`,
          tip: 'Hitung dulu berapa kali membelah (waktu ÷ selang), lalu kalikan dengan rasio sebanyak itu.',
        };
      }
      return {
        q: `Sebuah bakteri membelah diri menjadi ${q} setiap ${t} menit. Mula-mula terdapat ${n0} bakteri. Setelah berapa menit banyaknya bakteri menjadi ${ans}?`,
        ans: steps * t,
        exp: `${ans} ÷ ${n0} = ${q ** steps} = ${q} pangkat ${steps}. Jadi terjadi ${steps} kali pembelahan = ${steps} × ${t} = ${steps * t} menit.`,
        tip: 'Bagi jumlah akhir dengan jumlah awal, lalu cari pangkatnya.',
      };
    },
  },

  // ============ NASIONAL ============
  {
    key: 'alj-ekspresi', topic: T, sub: 'Manipulasi Aljabar', level: 'Nasional', diff: 'HOTS', sec: 100,
    make(r) {
      const a = r.int(2, 15), b = r.int(1, 12);
      const form = r.int(0, 3);
      if (form === 0) return { q: `Jika a + b = ${a + b} dan a × b = ${a * b}, nilai a² + b² adalah ...`, ans: a * a + b * b, exp: `a² + b² = (a + b)² − 2ab = ${(a + b) ** 2} − ${2 * a * b} = ${a * a + b * b}.`, tip: '(a + b)² = a² + 2ab + b².' };
      if (form === 1) return { q: `Jika a − b = ${a - b} dan a × b = ${a * b}, nilai a² + b² adalah ...`, ans: a * a + b * b, exp: `a² + b² = (a − b)² + 2ab = ${(a - b) ** 2} + ${2 * a * b} = ${a * a + b * b}.`, tip: '(a − b)² = a² − 2ab + b².' };
      if (form === 2) return { q: `Jika a + b = ${a + b} dan a² + b² = ${a * a + b * b}, nilai a × b adalah ...`, ans: a * b, exp: `2ab = (a + b)² − (a² + b²) = ${(a + b) ** 2} − ${a * a + b * b} = ${2 * a * b}, jadi ab = ${a * b}.`, tip: 'Pakai identitas (a + b)² = a² + b² + 2ab.' };
      return { q: `Jika a + b = ${a + b} dan a − b = ${a - b}, nilai a² − b² adalah ...`, ans: a * a - b * b, exp: `a² − b² = (a + b)(a − b) = ${a + b} × ${a - b} = ${a * a - b * b}.`, tip: 'Selisih kuadrat = (a + b)(a − b).' };
    },
  },
  {
    key: 'alj-jumlah-perkalian', topic: T, sub: 'Deret Perkalian Berurutan', level: 'Nasional', diff: 'HOTS', sec: 130,
    make(r) {
      const n = r.int(8, 30);
      if (r.chance(0.5)) {
        const s = sum(range(1, n).map((k) => k * (k + 1)));
        return {
          q: `Hasil dari 1×2 + 2×3 + 3×4 + ... + ${n}×${n + 1} adalah ...`,
          ans: s,
          exp: `Rumus: 1×2 + 2×3 + ... + n(n+1) = n(n+1)(n+2)/3 = ${n}×${n + 1}×${n + 2}/3 = ${s}.`,
          tip: 'k(k+1) = [k(k+1)(k+2) − (k−1)k(k+1)]/3 — deret teleskopik versi perkalian.',
        };
      }
      const s = sum(range(1, n).map((k) => k * k));
      return {
        q: `Hasil dari 1² + 2² + 3² + ... + ${n}² adalah ...`,
        ans: s,
        exp: `Rumus jumlah kuadrat: n(n+1)(2n+1)/6 = ${n}×${n + 1}×${2 * n + 1}/6 = ${s}.`,
        tip: 'Hafalkan: 1² + ... + n² = n(n+1)(2n+1)/6.',
      };
    },
  },
  {
    key: 'alj-rekursif', topic: T, sub: 'Barisan Rekursif', level: 'Nasional', diff: 'HOTS', sec: 120,
    make(r) {
      const a = r.int(1, 6);
      const rules = [
        { s: 'f(n + 1) = f(n) + 2n', step: (v: number, n: number) => v + 2 * n },
        { s: 'f(n + 1) = 2 × f(n) − 1', step: (v: number) => 2 * v - 1 },
        { s: 'f(n + 1) = f(n) + n + 1', step: (v: number, n: number) => v + n + 1 },
        { s: 'f(n + 1) = 3 × f(n) − 2', step: (v: number) => 3 * v - 2 },
        { s: 'f(n + 1) = f(n) + 3n − 1', step: (v: number, n: number) => v + 3 * n - 1 },
      ];
      const rule = r.pick(rules);
      const k = rule.s.includes('×') ? r.int(6, 10) : r.int(15, 40);
      const vals = [a];
      for (let n = 1; n < k; n++) vals.push(rule.step(vals[n - 1], n));
      return {
        q: `Barisan f didefinisikan dengan f(1) = ${a} dan ${rule.s} untuk n ≥ 1. Nilai f(${k}) adalah ...`,
        ans: vals[k - 1],
        exp: `Hitung beberapa suku: f(1) = ${vals[0]}, f(2) = ${vals[1]}, f(3) = ${vals[2]}, f(4) = ${vals[3]}, ... Temukan polanya lalu lanjutkan hingga f(${k}) = ${vals[k - 1]}.`,
        tip: 'Tulis 4–5 suku pertama; biasanya terlihat pola (selisih, atau hubungan dengan 2ⁿ / 3ⁿ).',
      };
    },
  },
  {
    key: 'alj-desimal-berulang', topic: T, sub: 'Desimal Berulang', level: 'Nasional', diff: 'HOTS', sec: 110,
    make(r) {
      const q = r.pick([7, 13, 27, 37, 41, 11, 101]);
      const p = r.int(1, q - 1);
      if (gcd(p, q) !== 1) throw new Retry();
      const k = r.int(50, 2026);
      let rem = p, digits = '';
      for (let i = 0; i < k; i++) { rem *= 10; digits += Math.floor(rem / q); rem %= q; }
      let period = 1, rr = (10 * p) % q;
      while (rr !== p % q) { rr = (rr * 10) % q; period++; }
      return {
        q: `Angka ke-${k} di belakang koma dari bentuk desimal ${p}/${q} adalah ...`,
        ans: Number(digits[k - 1]),
        exp: `${p}/${q} = 0,${digits.slice(0, period)}${digits.slice(period, period * 2)}... dengan pola ${digits.slice(0, period)} berulang setiap ${period} angka. ${k} ÷ ${period} bersisa ${k % period}, sehingga angka ke-${k} sama dengan angka ke-${k % period || period}, yaitu ${digits[k - 1]}.`,
        tip: 'Cari panjang perulangannya, lalu pakai sisa pembagian.',
      };
    },
  },
  {
    key: 'alj-segitiga-ganjil', topic: T, sub: 'Segitiga Bilangan', level: 'Nasional', diff: 'HOTS', sec: 120,
    make(r) {
      const n = r.int(8, 40);
      const first = n * n - n + 1;
      const form = r.int(0, 2);
      const intro = 'Bilangan ganjil disusun membentuk segitiga:\nBaris 1: 1\nBaris 2: 3  5\nBaris 3: 7  9  11\nBaris 4: 13  15  17  19\n...';
      if (form === 0) return { q: `${intro}\nJumlah bilangan pada baris ke-${n} adalah ...`, ans: n ** 3, exp: `Jumlah baris 1, 2, 3, 4 adalah 1, 8, 27, 64 = 1³, 2³, 3³, 4³. Jadi baris ke-${n} berjumlah ${n}³ = ${n ** 3}.`, tip: 'Hitung jumlah 3–4 baris pertama; polanya pangkat tiga.' };
      if (form === 1) return { q: `${intro}\nBilangan pertama pada baris ke-${n} adalah ...`, ans: first, exp: `Sebelum baris ke-${n} ada 1 + 2 + ... + ${n - 1} = ${(n * (n - 1)) / 2} bilangan ganjil. Bilangan pertama baris ke-${n} adalah bilangan ganjil ke-${(n * (n - 1)) / 2 + 1} = 2 × ${(n * (n - 1)) / 2 + 1} − 1 = ${first}.`, tip: 'Bilangan pertama baris ke-n = n² − n + 1.' };
      const target = 2 * r.int(50, 600) - 1;
      let row = 1;
      while (row * row + row - 1 < target) row++;
      return { q: `${intro}\nBilangan ${target} terletak pada baris ke- ...`, ans: row, exp: `Bilangan terakhir baris ke-n adalah n² + n − 1. Baris ke-${row - 1} berakhir di ${(row - 1) ** 2 + row - 2}, baris ke-${row} berakhir di ${row * row + row - 1}. Jadi ${target} ada di baris ke-${row}.`, tip: 'Bilangan terakhir baris ke-n = n² + n − 1; cari n yang pas.' };
    },
  },
  {
    key: 'alj-josephus', topic: T, sub: 'Pola Melingkar (Eliminasi)', level: 'Nasional', diff: 'HOTS', sec: 140,
    make(r) {
      const N = r.int(10, 100);
      const people = range(1, N);
      let idx = 0;
      while (people.length > 1) {
        idx = (idx + 1) % people.length;
        people.splice(idx, 1);
      }
      const ans = people[0];
      let p = 1;
      while (p * 2 <= N) p *= 2;
      return {
        q: `${N} anak duduk melingkar dan diberi nomor 1 sampai ${N} searah jarum jam. Mulai dari anak nomor 1, anak nomor 2 keluar dari lingkaran, lalu anak nomor 4, dan seterusnya: setiap anak kedua yang tersisa keluar. Nomor anak yang tersisa paling akhir adalah ...`,
        ans,
        exp: `Jika banyak anak adalah 2ᵏ, yang tersisa selalu nomor 1. ${N} = ${p} + ${N - p}. Setelah ${N - p} anak keluar, tersisa ${p} anak dan giliran mulai dari nomor 2 × ${N - p} + 1 = ${ans}. Jadi yang tersisa nomor ${ans}.`,
        tip: 'Masalah Josephus: tulis N = 2ᵏ + m, jawabannya 2m + 1.',
      };
    },
  },
];
