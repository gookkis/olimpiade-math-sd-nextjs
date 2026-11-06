// Generators that fill the gaps of the "Olimpiade Obor Langit" Kategori C (SD/MI kelas 5–6)
// kisi-kisi: operasi bilangan bulat, bunga sederhana, rasio & skala, peluang sederhana.
// Answers are computed in code.
import { Generator, Retry, gcd, gcdAll, fmt, frac, isPrime, rp, range, NAMA } from './core';

const BIL = 'Bilangan & Aritmatika' as const;
const KOM = 'Kombinatorika & Peluang' as const;

/** Integer as it appears inside an expression: negatives in brackets, with a real minus sign. */
const term = (x: number) => (x < 0 ? `(−${-x})` : `${x}`);
const lead = (x: number) => (x < 0 ? `−${-x}` : `${x}`);
const nonZero = (r: { int(a: number, b: number): number; chance(p: number): boolean }, lo: number, hi: number) =>
  r.int(lo, hi) * (r.chance(0.5) ? -1 : 1);

export const obor: Generator[] = [
  // ================= BILANGAN BULAT =================
  {
    key: 'ob-bulat-operasi', topic: BIL, sub: 'Penjumlahan & Pengurangan Bilangan Bulat', level: 'Kabupaten/Kota', diff: 'Mudah', sec: 50,
    make(r) {
      const a = nonZero(r, 3, 40), b = nonZero(r, 3, 40), c = nonZero(r, 3, 40);
      if (b > 0 && c > 0) throw new Retry(); // at least one negative operand after the first
      const s1 = r.chance(0.5) ? 1 : -1, s2 = r.chance(0.5) ? 1 : -1;
      const ans = a + s1 * b + s2 * c;
      const op = (s: number) => (s > 0 ? '+' : '−');
      // Typical mistakes: dropping the sign inside the brackets, or slipping one operation.
      const dropSigns = a + s1 * Math.abs(b) + s2 * Math.abs(c);
      const flipB = a - s1 * b + s2 * c;
      const flipC = a + s1 * b - s2 * c;
      const mid = a + s1 * b;
      return {
        q: `Hasil dari ${lead(a)} ${op(s1)} ${term(b)} ${op(s2)} ${term(c)} adalah ...`,
        ans,
        wrong: [dropSigns, flipB, flipC, -ans],
        exp: `Ubah pengurangan menjadi penjumlahan lawannya: ${lead(a)} + ${term(s1 * b)} + ${term(s2 * c)}. Langkah 1: ${lead(a)} + ${term(s1 * b)} = ${lead(mid)}. Langkah 2: ${lead(mid)} + ${term(s2 * c)} = ${lead(ans)}.`,
        tip: 'Mengurangi bilangan negatif sama dengan menambah bilangan positifnya: a − (−b) = a + b.',
      };
    },
  },
  {
    key: 'ob-bulat-campuran', topic: BIL, sub: 'Operasi Campuran Bilangan Bulat', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 70,
    make(r) {
      const a = nonZero(r, 2, 12), b = nonZero(r, 2, 9), d = nonZero(r, 2, 9), k = nonZero(r, 2, 9);
      const c = d * k;
      if (a > 0 && b > 0 && c > 0 && d > 0) throw new Retry();
      const plus = r.chance(0.5);
      const ans = plus ? a * b + c / d : a * b - c / d;
      // Left-to-right (ignoring precedence) and sign slips.
      const ltr = (plus ? a * b + c : a * b - c) / d;
      return {
        q: `Hasil dari ${lead(a)} × ${term(b)} ${plus ? '+' : '−'} ${term(c)} : ${term(d)} adalah ...`,
        ans,
        wrong: [Number.isInteger(ltr) ? ltr : a * b, plus ? a * b - c / d : a * b + c / d, -a * b + (plus ? c / d : -c / d), -ans],
        exp: `Kerjakan perkalian dan pembagian lebih dulu. ${lead(a)} × ${term(b)} = ${lead(a * b)} dan ${term(c)} : ${term(d)} = ${lead(c / d)}. Jadi ${lead(a * b)} ${plus ? '+' : '−'} ${term(c / d)} = ${lead(ans)}.`,
        tip: 'Kali/bagi sebelum tambah/kurang. Tanda sama (−×− atau +×+) hasilnya positif; tanda beda hasilnya negatif.',
      };
    },
  },
  {
    key: 'ob-bulat-cerita', topic: BIL, sub: 'Bilangan Bulat dalam Soal Cerita', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 75,
    make(r) {
      if (r.chance(0.5)) {
        const t0 = -r.int(4, 24), t1 = r.int(18, 32), step = r.pick([2, 3, 4, 5, 6]);
        if ((t1 - t0) % step !== 0) throw new Retry();
        const ans = (t1 - t0) / step;
        return {
          q: `Suhu es batu di dalam freezer ${lead(t0)}°C. Setelah dikeluarkan, suhunya naik ${step}°C setiap menit. Berapa menit waktu yang diperlukan hingga suhunya sama dengan suhu ruangan ${t1}°C?`,
          ans, unit: 'menit', wrong: [(t1 + t0) / step, t1 - t0, Math.round(t1 / step)].filter((x) => Number.isInteger(x) && x > 0),
          exp: `Kenaikan suhu = ${t1} − (${lead(t0)}) = ${t1} + ${-t0} = ${t1 - t0}°C. Waktu = ${t1 - t0} ÷ ${step} = ${ans} menit.`,
          tip: 'Jarak dari bilangan negatif ke bilangan positif = jumlah keduanya tanpa tanda minus.',
        };
      }
      const depth = r.int(12, 60), up = r.int(5, depth - 2), down = r.int(4, 15), times = r.int(2, 4);
      const ans = -depth + up - down * times;
      const nm = r.pick(NAMA);
      return {
        q: `${nm} menyelam hingga ${depth} m di bawah permukaan laut. Ia lalu naik ${up} m, kemudian turun lagi ${times} kali, masing-masing ${down} m. Posisi akhir ${nm} adalah ... (tanda negatif berarti di bawah permukaan laut)`,
        ans, unit: 'm', wrong: [-depth - up - down * times, -depth + up - down, depth - up + down * times, -depth + up + down * times],
        exp: `Posisi awal −${depth} m. Naik ${up}: −${depth} + ${up} = ${lead(-depth + up)}. Turun ${times} × ${down} = ${down * times} m: ${lead(-depth + up)} − ${down * times} = ${lead(ans)} m.`,
        tip: 'Di bawah permukaan laut = negatif, naik = tambah, turun = kurang.',
      };
    },
  },

  // ================= PERSENTASE: BUNGA SEDERHANA =================
  {
    key: 'ob-bunga-tunggal', topic: BIL, sub: 'Persen: Bunga Sederhana (Tunggal)', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 80,
    make(r) {
      const M = 100000 * r.int(5, 60);
      const p = r.pick([6, 8, 9, 10, 12, 15, 18]);
      const n = r.pick([3, 4, 6, 8, 9, 10, 12, 18, 24]);
      const bunga = (M * p * n) / 1200;
      if (!Number.isInteger(bunga) || bunga % 100 !== 0) throw new Retry();
      const nm = r.pick(NAMA);
      const form = r.int(0, 2);
      const lamaStr = `${n} bulan`;
      if (form === 0) {
        return {
          q: `${nm} menabung di bank sebesar ${rp(M)} dengan bunga tunggal ${p}% per tahun. Jumlah tabungan ${nm} setelah ${lamaStr} adalah ...`,
          ans: M + bunga, prefix: 'Rp',
          wrong: [M + (M * p) / 100, bunga, M + (M * p * n) / 100, M - bunga],
          exp: `Bunga ${lamaStr} = ${n}/12 × ${p}% × ${rp(M)} = ${rp(bunga)}. Jumlah tabungan = ${rp(M)} + ${rp(bunga)} = ${rp(M + bunga)}.`,
          tip: 'Bunga per tahun ubah ke per bulan dengan membagi 12, baru kalikan lamanya.',
        };
      }
      if (form === 1) {
        return {
          q: `Pak ${r.pick(['Ahmad', 'Budi', 'Hasan', 'Umar', 'Yusuf'])} meminjam uang di koperasi sebesar ${rp(M)} dengan bunga tunggal ${p}% per tahun. Besar bunga yang harus dibayar selama ${lamaStr} adalah ...`,
          ans: bunga, prefix: 'Rp',
          wrong: [(M * p) / 100, (M * p * n) / 100, M + bunga, bunga / 2].filter((x) => Number.isInteger(x)),
          exp: `Bunga setahun = ${p}% × ${rp(M)} = ${rp((M * p) / 100)}. Bunga ${lamaStr} = ${n}/12 × ${rp((M * p) / 100)} = ${rp(bunga)}.`,
          tip: 'Bunga = lama (bulan)/12 × persen bunga × modal.',
        };
      }
      const perBulan = (M * p) / 1200;
      if (!Number.isInteger(perBulan)) throw new Retry();
      return {
        q: `${nm} menabung ${rp(M)} di bank dengan bunga tunggal ${p}% per tahun. Sekarang tabungannya menjadi ${rp(M + bunga)}. ${nm} sudah menabung selama ... bulan.`,
        ans: n, unit: 'bulan',
        wrong: [n + 3, n * 2, n - 1, 12, n + 6].filter((x) => x > 0 && x !== n),
        exp: `Bunga yang diterima = ${rp(M + bunga)} − ${rp(M)} = ${rp(bunga)}. Bunga per bulan = ${p}% × ${rp(M)} ÷ 12 = ${rp(perBulan)}. Lama = ${rp(bunga)} ÷ ${rp(perBulan)} = ${n} bulan.`,
        tip: 'Hitung bunga sebulan dulu, lalu bagi total bunga dengan bunga sebulan.',
      };
    },
  },

  // ================= PERBANDINGAN: RASIO & SKALA =================
  {
    key: 'ob-rasio-tiga', topic: BIL, sub: 'Perbandingan Tiga Besaran', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 85,
    make(r) {
      const a = r.int(1, 6), b = r.int(2, 7), c = r.int(1, 6), d = r.int(2, 7);
      if (gcd(a, b) !== 1 || gcd(c, d) !== 1 || a === b || c === d) throw new Retry();
      // A : B = a : b and B : C = c : d  →  A : B : C = a·c : b·c : b·d
      const raw = [a * c, b * c, b * d];
      const g = gcdAll(raw);
      const [x, y, z] = raw.map((v) => v / g);
      const k = r.int(2, 9);
      const total = (x + y + z) * k;
      const [n1, n2, n3] = r.sample(NAMA, 3);
      const target = r.int(0, 2);
      const names = [n1, n2, n3];
      const parts = [x, y, z];
      const ans = parts[target] * k;
      if (total > 300) throw new Retry();
      // Typical mistake: sharing the total by a+b+c+d with the raw ratio numbers.
      const naiveDen = a + b + c + d;
      const naive = total % naiveDen === 0 ? (total / naiveDen) * [a, b, d][target] : null;
      return {
        q: `Perbandingan kelereng ${n1} dan ${n2} adalah ${a} : ${b}, sedangkan perbandingan kelereng ${n2} dan ${n3} adalah ${c} : ${d}. Jika jumlah kelereng mereka bertiga ${total} butir, banyak kelereng ${names[target]} adalah ... butir.`,
        ans,
        wrong: [naive, ...parts.filter((_, i) => i !== target).map((v) => v * k), parts[target] * (k + 1)].filter((v): v is number => v !== null && v !== ans),
        exp: `Samakan bagian ${n2}: ${n1} : ${n2} = ${a * c} : ${b * c} dan ${n2} : ${n3} = ${b * c} : ${b * d}. Jadi ${n1} : ${n2} : ${n3} = ${x} : ${y} : ${z} (jumlah ${x + y + z} bagian). 1 bagian = ${total} ÷ ${x + y + z} = ${k}. ${names[target]} = ${parts[target]} × ${k} = ${ans} butir.`,
        tip: 'Samakan nilai besaran yang muncul di kedua perbandingan (kalikan silang), baru gabungkan.',
      };
    },
  },
  {
    key: 'ob-skala-denah', topic: BIL, sub: 'Skala Denah & Luas Sebenarnya', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 80,
    make(r) {
      if (r.chance(0.5)) {
        const S = r.pick([100, 200, 250, 400, 500]);
        const p = r.int(2, 8), l = r.int(2, 6);
        const P = (p * S) / 100, L = (l * S) / 100;
        const ans = P * L;
        if (!Number.isInteger(ans * 4)) throw new Retry();
        return {
          q: `Denah sebuah ruang kelas berbentuk persegi panjang berukuran ${p} cm × ${l} cm dengan skala 1 : ${fmt(S)}. Luas ruang kelas sebenarnya adalah ... m².`,
          ans, unit: 'm²', wrong: [(p * l * S) / 100, P + L, ans * 100, 2 * (P + L)].filter((v) => v !== ans),
          exp: `Panjang sebenarnya = ${p} × ${fmt(S)} cm = ${fmt(p * S)} cm = ${fmt(P)} m. Lebar sebenarnya = ${l} × ${fmt(S)} cm = ${fmt(l * S)} cm = ${fmt(L)} m. Luas = ${fmt(P)} × ${fmt(L)} = ${fmt(ans)} m².`,
          tip: 'Ubah dulu setiap ukuran ke ukuran sebenarnya, baru hitung luasnya. Jangan kalikan luas denah dengan skala!',
        };
      }
      const S = r.pick([100000, 200000, 250000, 300000, 400000, 500000, 1000000, 1500000]);
      const d = r.int(3, 15);
      const km = (d * S) / 100000;
      if (!Number.isInteger(km)) throw new Retry();
      return {
        q: `Jarak kota A ke kota B sebenarnya ${fmt(km)} km. Pada peta, jarak kedua kota tersebut ${d} cm. Skala peta tersebut adalah ...`,
        ans: `1 : ${fmt(S)}`,
        wrong: [`1 : ${fmt(S * 10)}`, `1 : ${fmt(S / 10)}`, `1 : ${fmt(S / 100)}`, `1 : ${fmt(S * 2)}`].filter((x) => x !== `1 : ${fmt(S)}`),
        exp: `${fmt(km)} km = ${fmt(km)} × 100.000 cm = ${fmt(km * 100000)} cm. Skala = jarak peta : jarak sebenarnya = ${d} : ${fmt(km * 100000)} = 1 : ${fmt(S)}.`,
        tip: 'Samakan satuan ke cm (1 km = 100.000 cm), lalu bagi jarak sebenarnya dengan jarak pada peta.',
      };
    },
  },

  // ================= PELUANG SEDERHANA =================
  {
    key: 'ob-peluang-kartu', topic: KOM, sub: 'Peluang Pengambilan Kartu Bernomor', level: 'Kabupaten/Kota', diff: 'Mudah', sec: 50,
    make(r) {
      const n = r.int(10, 30);
      const cards = range(1, n);
      const k = r.pick([3, 4, 5, 6]);
      const cond = r.pick([
        { d: 'bilangan prima', f: (x: number) => isPrime(x) },
        { d: `kelipatan ${k}`, f: (x: number) => x % k === 0 },
        { d: 'bilangan kuadrat (1, 4, 9, ...)', f: (x: number) => Number.isInteger(Math.sqrt(x)) },
        { d: `faktor dari ${n * 2}`, f: (x: number) => (n * 2) % x === 0 },
        { d: `bilangan ganjil lebih dari ${k}`, f: (x: number) => x % 2 === 1 && x > k },
      ]);
      const m = cards.filter(cond.f).length;
      if (m < 2 || m === n) throw new Retry();
      const ans = frac(m, n);
      return {
        q: `Terdapat ${n} kartu yang diberi nomor 1 sampai ${n}. Kartu dikocok, lalu diambil satu kartu secara acak. Peluang terambil kartu bernomor ${cond.d} adalah ...`,
        ans,
        wrong: [frac(m + 1, n), frac(m - 1, n), frac(n - m, n), frac(m, n - 1)].filter((x) => x !== ans && x !== '0' && x !== '1'),
        exp: `Kartu yang memenuhi: ${cards.filter(cond.f).join(', ')} → ada ${m} kartu. Peluang = ${m}/${n}${ans !== `${m}/${n}` ? ` = ${ans}` : ''}.`,
        tip: 'Tuliskan semua nomor yang memenuhi syarat agar tidak ada yang terlewat, lalu bagi dengan banyak kartu.',
      };
    },
  },
  {
    key: 'ob-frekuensi-harapan', topic: KOM, sub: 'Frekuensi Harapan', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 60,
    make(r) {
      const kind = r.int(0, 2);
      if (kind === 0) {
        const N = 6 * r.int(5, 40);
        const ev = r.pick([
          { d: 'mata dadu genap', m: 3 },
          { d: 'mata dadu prima', m: 3 },
          { d: 'mata dadu kurang dari 3', m: 2 },
          { d: 'mata dadu 6', m: 1 },
          { d: 'mata dadu kelipatan 3', m: 2 },
          { d: 'mata dadu lebih dari 2', m: 4 },
        ]);
        const ans = (N * ev.m) / 6;
        return {
          q: `Sebuah dadu dilempar sebanyak ${N} kali. Frekuensi harapan muncul ${ev.d} adalah ... kali.`,
          ans, unit: 'kali', wrong: [N / 6, N / 2, N - ans, (N * (ev.m + 1)) / 6].filter((v) => v !== ans && Number.isInteger(v)),
          exp: `Peluang ${ev.d} = ${ev.m}/6. Frekuensi harapan = ${ev.m}/6 × ${N} = ${ans} kali.`,
          tip: 'Frekuensi harapan = peluang × banyak percobaan.',
        };
      }
      if (kind === 1) {
        const N = 4 * r.int(10, 60);
        const both = r.chance(0.5);
        const ans = both ? N / 4 : N / 2;
        return {
          q: `Dua keping uang logam dilempar bersamaan sebanyak ${N} kali. Frekuensi harapan muncul ${both ? 'dua angka' : 'satu angka dan satu gambar'} adalah ... kali.`,
          ans, unit: 'kali', wrong: [both ? N / 2 : N / 4, N / 3 === Math.floor(N / 3) ? N / 3 : (3 * N) / 4, (3 * N) / 4, N].filter((v) => v !== ans),
          exp: `Ruang sampel: AA, AG, GA, GG (4 kemungkinan). ${both ? 'Dua angka hanya AA → peluang 1/4' : 'Satu angka satu gambar: AG, GA → peluang 2/4 = 1/2'}. Frekuensi harapan = ${both ? '1/4' : '1/2'} × ${N} = ${ans} kali.`,
          tip: 'Daftar ruang sampel dua koin: AA, AG, GA, GG. AG dan GA dihitung berbeda!',
        };
      }
      const [m, b, h] = [r.int(2, 8), r.int(2, 8), r.int(2, 8)];
      const tot = m + b + h;
      const N = tot * r.int(3, 20);
      const ans = (N * m) / tot;
      return {
        q: `Sebuah kotak berisi ${m} bola merah, ${b} bola biru, dan ${h} bola kuning. Diambil satu bola secara acak lalu dikembalikan, dan percobaan ini diulang ${N} kali. Frekuensi harapan terambil bola merah adalah ... kali.`,
        ans, unit: 'kali', wrong: [N / 3, (N * b) / tot, (N * (tot - m)) / tot, m * 10].filter((v) => v !== ans && Number.isInteger(v)),
        exp: `Peluang merah = ${m}/${tot}. Frekuensi harapan = ${m}/${tot} × ${N} = ${ans} kali.`,
        tip: 'Frekuensi harapan = peluang × banyak percobaan.',
      };
    },
  },
];
