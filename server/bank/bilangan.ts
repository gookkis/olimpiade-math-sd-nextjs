import {
  Generator, Rng, gcd, lcm, lcmAll, isPrime, divisors, factorize, factorStr, digitSum, range, sum,
  modPow, frac, reduced, fmt, rp, HARI, NAMA, NAMA_L, NAMA_P, sup,
} from './core';

const T = 'Bilangan & Aritmatika' as const;
const dec = (v: number) => fmt(v);

export const bilangan: Generator[] = [
  // ============ KABUPATEN/KOTA ============
  {
    key: 'bil-banding-pecahan', topic: T, sub: 'Membandingkan Pecahan, Desimal & Persen', level: 'Kabupaten/Kota', diff: 'Mudah', sec: 60,
    make(r) {
      const fr: [number, number][] = [[1, 2], [2, 3], [3, 4], [3, 5], [4, 5], [5, 8], [7, 10], [5, 6], [7, 8], [2, 5], [3, 8], [7, 12], [5, 12], [4, 7], [5, 9], [7, 9]];
      for (;;) {
        const [f1, f2] = r.sample(fr, 2);
        const p = r.int(30, 90);
        const d = r.int(300, 900) / 1000;
        const items = [
          { s: `${f1[0]}/${f1[1]}`, v: f1[0] / f1[1] },
          { s: `${f2[0]}/${f2[1]}`, v: f2[0] / f2[1] },
          { s: `${p}%`, v: p / 100 },
          { s: dec(d), v: d },
        ];
        const vs = items.map((x) => x.v).sort((a, b) => a - b);
        if (vs.some((v, i) => i > 0 && v - vs[i - 1] < 0.005)) continue;
        const big = r.chance(0.5);
        const target = items.reduce((best, x) => ((big ? x.v > best.v : x.v < best.v) ? x : best));
        const sh = r.shuffle(items);
        return {
          q: `Di antara bilangan ${sh.map((x) => x.s).join('; ')}, manakah yang paling ${big ? 'besar' : 'kecil'}?`,
          ans: target.s,
          wrong: items.filter((x) => x !== target).map((x) => x.s),
          exp: `Ubah semua ke bentuk desimal: ${items.map((x) => `${x.s} = ${dec(Math.round(x.v * 1000) / 1000)}`).join(', ')}. Yang paling ${big ? 'besar' : 'kecil'} adalah ${target.s}.`,
          tip: 'Samakan bentuknya dulu (semua jadi desimal 3 angka di belakang koma), baru bandingkan.',
        };
      }
    },
  },
  {
    key: 'bil-hitung-cerdik', topic: T, sub: 'Berhitung Cerdik (Sifat Distributif)', level: 'Kabupaten/Kota', diff: 'Mudah', sec: 45,
    make(r) {
      const form = r.int(0, 3);
      if (form === 0) {
        const k = r.int(3, 40);
        const n = 8 * k;
        return {
          q: `Hasil dari ${n} × 125 adalah ...`, ans: n * 125, wrong: [n * 125 + 1000, n * 120, k * 100],
          exp: `${n} = ${k} × 8, dan 8 × 125 = 1000. Jadi ${n} × 125 = ${k} × 1000 = ${fmt(n * 125)}.`,
          tip: 'Cari pasangan "ajaib": 8 × 125 = 1000, 4 × 25 = 100, 2 × 5 = 10.',
        };
      }
      if (form === 1) {
        const n = r.int(12, 99);
        return {
          q: `Hasil dari 999 × ${n} + ${n} adalah ...`, ans: 1000 * n, wrong: [999 * n, 1000 * n + n, 1000 * n - n],
          exp: `999 × ${n} + ${n} = ${n} × (999 + 1) = ${n} × 1000 = ${fmt(1000 * n)}.`,
          tip: `Keluarkan ${n} sebagai faktor bersama: a × b + a = a × (b + 1).`,
        };
      }
      if (form === 2) {
        const a = r.int(13, 89);
        const b = r.int(11, 89);
        const c = 100 - b;
        return {
          q: `Hasil dari ${a} × ${b} + ${a} × ${c} adalah ...`, ans: a * 100, wrong: [a * 100 + a, a * 10, a * 101],
          exp: `${a} × ${b} + ${a} × ${c} = ${a} × (${b} + ${c}) = ${a} × 100 = ${fmt(a * 100)}.`,
          tip: 'Sifat distributif: a × b + a × c = a × (b + c). Perhatikan b + c = 100.',
        };
      }
      const k = r.int(2, 9);
      const m = r.int(11, 49);
      return {
        q: `Hasil dari ${4 * m} × ${25 * k} adalah ...`, ans: 4 * m * 25 * k, wrong: [4 * m * 25 * k + 100, m * k * 10, m * k * 1000],
        exp: `${4 * m} × ${25 * k} = (${m} × 4) × (25 × ${k}) = ${m} × ${k} × 100 = ${fmt(m * k * 100)}.`,
        tip: '4 × 25 = 100, jadi pisahkan faktor 4 dan 25 lebih dulu.',
      };
    },
  },
  {
    key: 'bil-persen-bilangan', topic: T, sub: 'Persentase', level: 'Kabupaten/Kota', diff: 'Mudah', sec: 50,
    make(r) {
      const N = 20 * r.int(5, 60);
      const [p, q] = r.sample([5, 10, 15, 20, 25, 30, 35, 40, 45, 55, 60, 65, 75, 80], 2);
      const X = (N * p) / 100;
      const Y = (N * q) / 100;
      return {
        q: `${p}% dari suatu bilangan adalah ${fmt(X)}. Berapakah ${q}% dari bilangan tersebut?`,
        ans: Y, wrong: [N, (X * q) / 100, X + (q - p)],
        exp: `Bilangan = ${fmt(X)} ÷ ${p}% = ${fmt(X)} × 100/${p} = ${fmt(N)}. Maka ${q}% × ${fmt(N)} = ${fmt(Y)}.`,
        tip: `Cara cepat: ${q}% bilangan = ${fmt(X)} × ${q}/${p} = ${fmt(Y)}.`,
      };
    },
  },
  {
    key: 'bil-fpb-bingkisan', topic: T, sub: 'FPB dalam Soal Cerita', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 75,
    make(r) {
      for (;;) {
        const g = r.int(4, 16);
        const ks = [r.int(2, 9), r.int(2, 9), r.int(2, 9)];
        if (gcd(gcd(ks[0], ks[1]), ks[2]) !== 1 || new Set(ks).size < 3) continue;
        const [a, b, c] = ks.map((k) => k * g);
        const nama = r.pick(NAMA_P);
        const askBags = r.chance(0.5);
        return {
          q: `Bu ${nama} mempunyai ${a} apel, ${b} jeruk, dan ${c} salak. Buah-buahan itu akan dimasukkan ke dalam kantong sehingga setiap kantong berisi apel, jeruk, dan salak yang sama banyak. ${askBags ? 'Berapa banyak kantong paling banyak yang dapat dibuat?' : 'Jika banyak kantong dibuat sebanyak-banyaknya, berapa buah jeruk di setiap kantong?'}`,
          ans: askBags ? g : ks[1],
          wrong: askBags ? [lcm(lcm(a, b), c) > 500 ? g * 2 : lcm(lcm(a, b), c), g / 2 === Math.floor(g / 2) ? g / 2 : g + 1, ks[0], g * 2] : [g, ks[0], ks[2], ks[1] + 1],
          exp: `Banyak kantong terbanyak = FPB(${a}, ${b}, ${c}). ${a} = ${factorStr(a)}, ${b} = ${factorStr(b)}, ${c} = ${factorStr(c)}, sehingga FPB = ${g}. Setiap kantong berisi ${ks[0]} apel, ${ks[1]} jeruk, dan ${ks[2]} salak.`,
          tip: 'Kata kunci "sebanyak-banyaknya" dan "sama banyak" pada pembagian benda menandakan FPB.',
        };
      }
    },
  },
  {
    key: 'bil-kpk-hari', topic: T, sub: 'KPK & Hari', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 80,
    make(r) {
      for (;;) {
        const ds = r.sample([2, 3, 4, 5, 6, 8, 9, 10, 12, 15], 3).sort((a, b) => a - b);
        const L = lcmAll(ds);
        if (L > 120 || L % 7 === 0) continue;
        const start = r.int(0, 6);
        const ans = HARI[(start + L) % 7];
        const [a, b, c] = r.sample(NAMA, 3);
        return {
          q: `${a} pergi ke perpustakaan setiap ${ds[0]} hari sekali, ${b} setiap ${ds[1]} hari sekali, dan ${c} setiap ${ds[2]} hari sekali. Mereka bertemu di perpustakaan pada hari ${HARI[start]}. Pada hari apa mereka akan bertemu bersama lagi untuk pertama kalinya?`,
          ans, wrong: r.shuffle(HARI.filter((h) => h !== ans)),
          exp: `Mereka bertemu lagi setelah KPK(${ds.join(', ')}) = ${L} hari. ${L} = 7 × ${Math.floor(L / 7)} + ${L % 7}, artinya hari bergeser ${L % 7} hari dari ${HARI[start]}, yaitu hari ${ans}.`,
          tip: 'Hitung KPK, lalu ambil sisa pembagiannya dengan 7 untuk menggeser nama hari.',
        };
      }
    },
  },
  {
    key: 'bil-prima-antara', topic: T, sub: 'Bilangan Prima', level: 'Kabupaten/Kota', diff: 'Mudah', sec: 60,
    make(r) {
      const a = r.int(10, 70);
      const b = a + r.int(15, 30);
      const ps = range(a + 1, b - 1).filter(isPrime);
      return {
        q: `Banyaknya bilangan prima yang terletak di antara ${a} dan ${b} adalah ...`,
        ans: ps.length, wrong: [ps.length + 1, ps.length - 1, ps.length + 2],
        exp: `Bilangan prima di antara ${a} dan ${b}: ${ps.join(', ')}. Banyaknya ${ps.length}.`,
        tip: 'Coret kelipatan 2, 3, 5, dan 7. Untuk bilangan di bawah 121, sisa yang tidak tercoret pasti prima.',
      };
    },
  },
  {
    key: 'bil-banyak-faktor', topic: T, sub: 'Faktor & Faktorisasi Prima', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 70,
    make(r) {
      const n = r.pick([24, 36, 48, 60, 72, 84, 90, 96, 100, 108, 120, 126, 144, 150, 180, 196, 200, 210, 225, 240]);
      const f = factorize(n);
      const cnt = divisors(n).length;
      return {
        q: `Banyaknya faktor dari ${n} adalah ...`,
        ans: cnt, wrong: [cnt - 2, cnt + 2, f.length + 1, cnt - 1],
        exp: `${n} = ${factorStr(n)}. Banyak faktor = ${f.map(([, e]) => `(${e} + 1)`).join(' × ')} = ${cnt}.`,
        tip: 'Tulis faktorisasi prima, tambahkan 1 pada setiap pangkat, lalu kalikan.',
      };
    },
  },
  {
    key: 'bil-suhu', topic: T, sub: 'Bilangan Bulat (Suhu)', level: 'Kabupaten/Kota', diff: 'Mudah', sec: 50,
    make(r) {
      const t0 = r.int(-15, 12);
      const steps = [r.int(3, 12), -r.int(5, 18), r.int(2, 10), -r.int(3, 9)].slice(0, r.int(3, 4));
      const final = t0 + sum(steps);
      const kota = r.pick(['puncak Jayawijaya', 'sebuah kota di Eropa', 'kutub selatan', 'sebuah gudang pendingin']);
      const words = steps.map((s) => (s > 0 ? `naik ${s}°C` : `turun ${-s}°C`)).join(', kemudian ');
      return {
        q: `Suhu di ${kota} pada pagi hari ${t0}°C. Siang hari suhu ${words}. Berapakah suhu akhirnya?`,
        ans: final, unit: '°C', wrong: [final + 2 * steps[1], -final === final ? final + 4 : -final, t0 - sum(steps)],
        exp: `${t0} ${steps.map((s) => (s > 0 ? `+ ${s}` : `− ${-s}`)).join(' ')} = ${final}°C.`,
        tip: 'Naik berarti ditambah, turun berarti dikurangi. Bayangkan garis bilangan.',
      };
    },
  },
  {
    key: 'bil-diskon', topic: T, sub: 'Diskon & Uang Kembalian', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 75,
    make(r) {
      if (r.chance(0.5)) {
        const price = 1000 * r.int(20, 150);
        const d = r.pick([10, 20, 25, 30, 40, 50]);
        const n = r.int(2, 4);
        const pay = (price * n * (100 - d)) / 100;
        const money = Math.ceil(pay / 50000) * 50000 + (r.chance(0.5) ? 50000 : 0);
        const ans = money - pay;
        const nm = r.pick(NAMA);
        return {
          q: `Harga sebuah tas ${rp(price)}. Toko memberi diskon ${d}%. ${nm} membeli ${n} tas dan membayar dengan uang ${rp(money)}. Berapa uang kembalian yang diterima ${nm}?`,
          ans, prefix: 'Rp', wrong: [money - price * n, money - (price * (100 - d)) / 100, ans + (price * d) / 100],
          exp: `Harga setelah diskon = ${100 - d}% × ${rp(price)} = ${rp((price * (100 - d)) / 100)}. Untuk ${n} tas: ${rp(pay)}. Kembalian = ${rp(money)} − ${rp(pay)} = ${rp(ans)}.`,
          tip: `Diskon ${d}% berarti yang dibayar ${100 - d}% dari harga.`,
        };
      }
      const [d1, d2] = [r.pick([10, 20, 25, 30, 40, 50]), r.pick([10, 20, 25, 50])];
      const total = 100 - ((100 - d1) * (100 - d2)) / 100;
      return {
        q: `Sebuah toko memberi diskon ${d1}%, lalu ditambah diskon lagi ${d2}% dari harga setelah diskon pertama. Diskon total yang sebenarnya adalah ... %`,
        ans: total, unit: '%', wrong: [d1 + d2, (d1 * d2) / 10, total + 5],
        exp: `Setelah diskon ${d1}%, harga tinggal ${100 - d1}%. Setelah diskon ${d2}%, tinggal ${100 - d2}% × ${100 - d1}% = ${fmt(((100 - d1) * (100 - d2)) / 100)}%. Diskon total = 100% − ${fmt(((100 - d1) * (100 - d2)) / 100)}% = ${fmt(total)}%.`,
        tip: 'Diskon bertingkat TIDAK dijumlahkan. Kalikan sisa persentasenya.',
      };
    },
  },
  {
    key: 'bil-rata-hilang', topic: T, sub: 'Statistika: Rata-rata', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 70,
    make(r) {
      for (;;) {
        const n = r.int(4, 6);
        const vals = Array.from({ length: n - 1 }, () => r.int(60, 98));
        const mean = r.int(70, 90);
        const last = mean * n - sum(vals);
        if (last < 55 || last > 100) continue;
        return {
          q: `Rata-rata nilai ulangan ${n} siswa adalah ${mean}. Nilai ${n - 1} siswa di antaranya adalah ${vals.join(', ')}. Berapakah nilai siswa yang terakhir?`,
          ans: last, wrong: [Math.round(sum(vals) / (n - 1)), mean, last + n],
          exp: `Jumlah nilai semua siswa = ${n} × ${mean} = ${mean * n}. Jumlah ${n - 1} nilai yang diketahui = ${sum(vals)}. Nilai siswa terakhir = ${mean * n} − ${sum(vals)} = ${last}.`,
          tip: 'Rata-rata × banyak data = jumlah data. Kurangi dengan jumlah yang sudah diketahui.',
        };
      }
    },
  },
  {
    key: 'bil-median-modus', topic: T, sub: 'Statistika: Median & Modus', level: 'Kabupaten/Kota', diff: 'Mudah', sec: 60,
    make(r) {
      const n = r.pick([7, 8, 9, 10]);
      const vals = Array.from({ length: n }, () => r.int(5, 10));
      const s = [...vals].sort((a, b) => a - b);
      const askMedian = r.chance(0.6);
      if (askMedian) {
        const med = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
        const mean = Math.round((sum(vals) / n) * 10) / 10;
        return {
          q: `Data nilai kuis matematika: ${vals.join(', ')}. Median dari data tersebut adalah ...`,
          ans: med, wrong: [vals[Math.floor(n / 2)], mean, med + 0.5, med - 1],
          exp: `Urutkan data: ${s.join(', ')}. ${n % 2 ? `Data ke-${(n + 1) / 2} adalah ${med}.` : `Median = (data ke-${n / 2} + data ke-${n / 2 + 1}) ÷ 2 = (${s[n / 2 - 1]} + ${s[n / 2]}) ÷ 2 = ${fmt(med)}.`}`,
          tip: 'Median adalah nilai tengah SETELAH data diurutkan. Jangan lupa mengurutkan!',
        };
      }
      const freq = new Map<number, number>();
      vals.forEach((v) => freq.set(v, (freq.get(v) ?? 0) + 1));
      const maxF = Math.max(...freq.values());
      const modes = [...freq.entries()].filter(([, f]) => f === maxF).map(([v]) => v);
      if (modes.length > 1) {
        // make the mode unique by turning one occurrence of another top value into modes[0]
        const idx = vals.indexOf(modes[1]);
        vals[idx] = modes[0];
        freq.set(modes[1], freq.get(modes[1])! - 1);
        freq.set(modes[0], freq.get(modes[0])! + 1);
        s.splice(0, s.length, ...[...vals].sort((a, b) => a - b));
      }
      return {
        q: `Data nilai kuis matematika: ${vals.join(', ')}. Modus dari data tersebut adalah ...`,
        ans: modes[0], wrong: [s[Math.floor(n / 2)], Math.max(...vals), Math.min(...vals), modes[0] + 1],
        exp: `Hitung frekuensi tiap nilai: ${[...freq.entries()].sort((a, b) => a[0] - b[0]).map(([v, f]) => `${v} muncul ${f} kali`).join(', ')}. Yang paling sering muncul adalah ${modes[0]}.`,
        tip: 'Modus = nilai yang paling sering muncul.',
      };
    },
  },
  {
    key: 'bil-perbandingan', topic: T, sub: 'Perbandingan', level: 'Kabupaten/Kota', diff: 'Mudah', sec: 55,
    make(r) {
      for (;;) {
        const a = r.int(2, 9);
        const b = r.int(2, 9);
        if (a === b || gcd(a, b) !== 1) continue;
        const k = r.int(3, 15);
        const [x, y] = r.sample(NAMA, 2);
        const form = r.int(0, 2);
        if (form === 0) {
          return {
            q: `Perbandingan kelereng ${x} dan ${y} adalah ${a} : ${b}. Jumlah kelereng mereka ${(a + b) * k} butir. Selisih kelereng mereka adalah ... butir.`,
            ans: Math.abs(a - b) * k, wrong: [a * k, b * k, Math.abs(a - b)],
            exp: `1 bagian = ${(a + b) * k} ÷ (${a} + ${b}) = ${k}. Selisih = |${a} − ${b}| × ${k} = ${Math.abs(a - b) * k} butir.`,
            tip: 'Cari nilai 1 bagian dulu: jumlah ÷ jumlah perbandingan.',
          };
        }
        if (form === 1) {
          return {
            q: `Perbandingan uang ${x} dan ${y} adalah ${a} : ${b}. Jika selisih uang mereka ${rp(Math.abs(a - b) * k * 1000)}, berapakah jumlah uang mereka?`,
            ans: (a + b) * k * 1000, prefix: 'Rp', wrong: [a * k * 1000, b * k * 1000, (a + b) * k * 100],
            exp: `Selisih ${Math.abs(a - b)} bagian = ${rp(Math.abs(a - b) * k * 1000)}, jadi 1 bagian = ${rp(k * 1000)}. Jumlah = ${a + b} bagian = ${rp((a + b) * k * 1000)}.`,
            tip: 'Selisih bagian ↔ selisih nilai, lalu kalikan dengan jumlah bagian.',
          };
        }
        return {
          q: `Perbandingan banyak siswa laki-laki dan perempuan di kelas adalah ${a} : ${b}. Jika banyak siswa perempuan ${b * k} orang, berapa banyak seluruh siswa?`,
          ans: (a + b) * k, wrong: [a * k, b * k + a, (a + b) * k + k],
          exp: `${b} bagian = ${b * k}, jadi 1 bagian = ${k}. Seluruh siswa = ${a + b} × ${k} = ${(a + b) * k} orang.`,
          tip: 'Bandingkan bagian dengan nilai yang diketahui untuk menemukan 1 bagian.',
        };
      }
    },
  },
  {
    key: 'bil-skala', topic: T, sub: 'Skala Peta', level: 'Kabupaten/Kota', diff: 'Mudah', sec: 50,
    make(r) {
      const S = r.pick([100000, 200000, 250000, 400000, 500000, 1500000, 2000000]);
      const kmPerCm = S / 100000;
      let d = r.int(2, 18);
      if (!Number.isInteger(d * kmPerCm)) d = d * 2;
      const real = d * kmPerCm;
      return {
        q: `Jarak dua kota pada peta adalah ${d} cm. Skala peta 1 : ${fmt(S)}. Jarak sebenarnya kedua kota adalah ... km.`,
        ans: real, unit: 'km', wrong: [real * 10, real / 10, d * S / 1000, real + kmPerCm],
        exp: `Jarak sebenarnya = ${d} × ${fmt(S)} cm = ${fmt(d * S)} cm. Karena 1 km = 100.000 cm, jaraknya ${fmt(d * S)} ÷ 100.000 = ${fmt(real)} km.`,
        tip: `Skala 1 : ${fmt(S)} artinya 1 cm di peta = ${fmt(kmPerCm)} km. Langsung ${d} × ${fmt(kmPerCm)}.`,
      };
    },
  },
  {
    key: 'bil-frekuensi-rata', topic: T, sub: 'Statistika: Tabel Frekuensi', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 80,
    make(r) {
      for (;;) {
        const nilai = [6, 7, 8, 9, 10];
        const f = nilai.map(() => r.int(1, 8));
        const n = sum(f);
        const tot = sum(nilai.map((v, i) => v * f[i]));
        const mean = tot / n;
        if (!Number.isInteger(mean * 10)) continue;
        const ask = r.int(0, 1);
        const table = nilai.map((v, i) => `nilai ${v}: ${f[i]} siswa`).join('; ');
        if (ask === 0) {
          return {
            q: `Hasil ulangan matematika suatu kelas: ${table}. Rata-rata nilai kelas tersebut adalah ...`,
            ans: mean, wrong: [8, Math.round(mean * 10 + 3) / 10, tot / 5, Math.round(mean)],
            exp: `Jumlah nilai = ${nilai.map((v, i) => `${v}×${f[i]}`).join(' + ')} = ${tot}. Banyak siswa = ${n}. Rata-rata = ${tot} ÷ ${n} = ${fmt(mean)}.`,
            tip: 'Kalikan setiap nilai dengan frekuensinya sebelum dijumlahkan.',
          };
        }
        const above = sum(nilai.map((v, i) => (v > mean ? f[i] : 0)));
        return {
          q: `Hasil ulangan matematika suatu kelas: ${table}. Siswa dinyatakan lulus jika nilainya lebih dari rata-rata kelas. Berapa banyak siswa yang lulus?`,
          ans: above, wrong: [n - above, above + f[2], Math.max(0, above - f[3])],
          exp: `Rata-rata = ${tot} ÷ ${n} = ${fmt(mean)}. Nilai di atas ${fmt(mean)}: ${nilai.filter((v) => v > mean).join(', ')}, banyak siswanya ${above}.`,
          tip: 'Hitung rata-rata dulu, lalu jumlahkan frekuensi nilai yang lebih besar.',
        };
      }
    },
  },

  // ============ PROVINSI ============
  {
    key: 'bil-angka-satuan', topic: T, sub: 'Angka Satuan Perpangkatan', level: 'Provinsi', diff: 'Sedang', sec: 75,
    make(r) {
      const a = r.pick([2, 3, 7, 8, 4, 9, 13, 17, 12]);
      const b = r.pick([3, 7, 9, 2, 6, 8]);
      const m = r.int(2020, 2030);
      const n = r.int(2020, 2030);
      const op = r.pick(['+', '×']);
      const ua = modPow(a, m, 10);
      const ub = modPow(b, n, 10);
      const ans = op === '+' ? (ua + ub) % 10 : (ua * ub) % 10;
      return {
        q: `Angka satuan dari ${a}${sup(m)} ${op} ${b}${sup(n)} adalah ...`,
        ans, wrong: [(ans + 2) % 10, (ua + 1) % 10, ub],
        exp: `Angka satuan ${a % 10} berpola setiap 4 pangkat. ${m} ÷ 4 sisa ${m % 4} → satuan ${a}${sup(m)} adalah ${ua}. ${n} ÷ 4 sisa ${n % 4} → satuan ${b}${sup(n)} adalah ${ub}. Satuan hasil: ${ua} ${op} ${ub} → ${ans}.`,
        tip: 'Hanya angka satuan yang menentukan angka satuan hasil. Pakai sisa pangkat dibagi 4 (sisa 0 berarti pangkat 4).',
      };
    },
  },
  {
    key: 'bil-sisa-pangkat', topic: T, sub: 'Sisa Pembagian Bilangan Berpangkat', level: 'Provinsi', diff: 'HOTS', sec: 100,
    make(r) {
      let a = r.int(2, 9);
      const k = r.pick([3, 5, 7, 9, 11, 13]);
      while (gcd(a, k) !== 1 || a % k === 1) a = r.int(2, 9);
      const n = r.int(50, 2030);
      const ans = modPow(a, n, k);
      let period = 1;
      while (modPow(a, period, k) !== 1) period++;
      const seq = range(1, period).map((i) => modPow(a, i, k));
      return {
        q: `Sisa pembagian ${a}${sup(n)} oleh ${k} adalah ...`,
        ans,
        exp: `Sisa ${a}ⁿ dibagi ${k} untuk n = 1, 2, 3, ...: ${seq.join(', ')}, lalu berulang setiap ${period}. ${n} ÷ ${period} bersisa ${n % period}${n % period === 0 ? ` (artinya posisi ke-${period})` : ''}, sehingga sisanya ${ans}.`,
        tip: 'Tulis sisa beberapa pangkat pertama sampai ketemu sisa 1. Pola akan berulang dari situ.',
      };
    },
  },
  {
    key: 'bil-digit-hilang', topic: T, sub: 'Ciri Habis Dibagi', level: 'Provinsi', diff: 'Sedang', sec: 90,
    make(r) {
      for (;;) {
        const d1 = r.int(1, 9);
        const d2 = r.int(0, 9);
        const div = r.pick([12, 15, 18, 36, 45, 24, 72]);
        const nums: number[] = [];
        for (let A = 0; A <= 9; A++) for (let B = 0; B <= 9; B++) {
          const v = d1 * 1000 + A * 100 + d2 * 10 + B;
          if (v % div === 0) nums.push(v);
        }
        if (nums.length < 1) continue;
        const ask = r.chance(0.5);
        if (ask) {
          return {
            q: `Bilangan empat angka ${d1}A${d2}B habis dibagi ${div}, dengan A dan B angka (0–9). Ada berapa banyak bilangan seperti itu?`,
            ans: nums.length,
            exp: `Bilangan yang memenuhi: ${nums.join(', ')}. Banyaknya ${nums.length}. (Gunakan ciri habis dibagi ${factorStr(div)}.)`,
            tip: `${div} = ${div === 12 ? '3 × 4' : div === 15 ? '3 × 5' : div === 18 ? '2 × 9' : div === 36 ? '4 × 9' : div === 45 ? '5 × 9' : div === 24 ? '3 × 8' : '8 × 9'}. Pakai ciri habis dibagi kedua faktor itu sekaligus.`,
          };
        }
        const best = Math.max(...nums);
        return {
          q: `Bilangan empat angka ${d1}A${d2}B habis dibagi ${div}, dengan A dan B angka (0–9). Bilangan terbesar yang memenuhi adalah ...`,
          ans: best,
          exp: `Bilangan yang memenuhi: ${nums.join(', ')}. Yang terbesar ${best}.`,
          tip: 'Coba B dulu (ciri pembagian 4, 5, atau 8 hanya bergantung pada angka belakang), lalu pilih A terbesar yang membuat jumlah angkanya cocok.',
        };
      }
    },
  },
  {
    key: 'bil-sisa-konstan', topic: T, sub: 'Teorema Sisa & KPK', level: 'Provinsi', diff: 'Sedang', sec: 90,
    make(r) {
      for (;;) {
        const ds = r.sample([3, 4, 5, 6, 7, 8, 9, 10, 12], 3).sort((a, b) => a - b);
        const c = r.int(1, ds[0] - 1);
        const L = lcmAll(ds);
        if (L > 600) continue;
        const big = r.chance(0.4);
        let ans: number;
        if (big) {
          ans = Math.floor((999 + c) / L) * L - c;
          if (ans < 100) continue;
        } else ans = L - c;
        // brute check
        if (!ds.every((d) => ans % d === d - c)) continue;
        return {
          q: `${big ? 'Bilangan tiga angka terbesar' : 'Bilangan asli terkecil'} yang jika dibagi ${ds[0]} bersisa ${ds[0] - c}, dibagi ${ds[1]} bersisa ${ds[1] - c}, dan dibagi ${ds[2]} bersisa ${ds[2] - c} adalah ...`,
          ans,
          exp: `Setiap sisa kurang ${c} dari pembaginya, jadi N + ${c} habis dibagi ${ds.join(', ')}. N + ${c} adalah kelipatan KPK(${ds.join(', ')}) = ${L}. ${big ? `Kelipatan ${L} terbesar yang dikurangi ${c} masih tiga angka: ${ans + c}, sehingga N = ${ans}.` : `N = ${L} − ${c} = ${ans}.`}`,
          tip: 'Jika (pembagi − sisa) selalu sama, bilangannya = kelipatan KPK dikurangi selisih itu. Hati-hati: KPK, bukan hasil kali!',
        };
      }
    },
  },
  {
    key: 'bil-nol-faktorial', topic: T, sub: 'Faktorial & Angka Nol di Belakang', level: 'Provinsi', diff: 'Sedang', sec: 80,
    make(r) {
      const z = (n: number) => { let c = 0; for (let p = 5; p <= n; p *= 5) c += Math.floor(n / p); return c; };
      if (r.chance(0.65)) {
        const n = r.int(26, 400);
        return {
          q: `Banyaknya angka nol berurutan di bagian paling belakang hasil perkalian 1 × 2 × 3 × ... × ${n} adalah ...`,
          ans: z(n),
          exp: `Angka nol di belakang berasal dari pasangan 2 × 5. Faktor 2 selalu lebih banyak, jadi cukup hitung faktor 5: ${[5, 25, 125].filter((p) => p <= n).map((p) => `⌊${n}/${p}⌋ = ${Math.floor(n / p)}`).join(', ')}. Jumlah = ${z(n)}.`,
          tip: 'Bagi n dengan 5 berulang kali (buang sisanya) dan jumlahkan semua hasil baginya.',
        };
      }
      for (;;) {
        const k = r.int(6, 60);
        let n = 1;
        while (z(n) < k) n++;
        if (z(n) !== k) continue;
        return {
          q: `Bilangan asli terkecil n sehingga hasil kali 1 × 2 × 3 × ... × n diakhiri tepat ${k} angka nol adalah ...`,
          ans: n,
          exp: `Banyak nol = ⌊n/5⌋ + ⌊n/25⌋ + ... Untuk n = ${n}: ${z(n)} nol, sedangkan n = ${n - 1} hanya ${z(n - 1)} nol. Jadi n = ${n}.`,
          tip: 'Tebak n ≈ 4k (karena setiap 25 menyumbang nol ekstra), lalu sesuaikan ke kelipatan 5.',
        };
      }
    },
  },
  {
    key: 'bil-angka-halaman', topic: T, sub: 'Banyak Angka Penomoran Halaman', level: 'Provinsi', diff: 'Sedang', sec: 90,
    make(r) {
      const digits = (n: number) => { let s = 0; for (let i = 1; i <= n; i++) s += String(i).length; return s; };
      const N = r.int(60, 999);
      if (r.chance(0.5)) {
        return {
          q: `Sebuah buku tebalnya ${N} halaman. Setiap halaman diberi nomor mulai dari 1. Berapa banyak angka (digit) yang diperlukan untuk menomori seluruh halaman?`,
          ans: digits(N),
          exp: `Halaman 1–9: 9 angka. Halaman 10–${Math.min(99, N)}: ${(Math.min(99, N) - 9) * 2} angka.${N > 99 ? ` Halaman 100–${N}: ${(N - 99) * 3} angka.` : ''} Total = ${digits(N)}.`,
          tip: 'Kelompokkan: halaman 1 angka, 2 angka, dan 3 angka. Hitung masing-masing.',
        };
      }
      return {
        q: `Untuk menomori halaman sebuah buku (mulai dari 1) diperlukan ${digits(N)} angka. Berapa banyak halaman buku tersebut?`,
        ans: N,
        exp: `Halaman 1–9 memakai 9 angka, halaman 10–99 memakai 180 angka (total 189). ${N > 99 ? `Sisa ${digits(N)} − 189 = ${digits(N) - 189} angka untuk halaman 3 angka, yaitu ${(digits(N) - 189) / 3} halaman. Jadi halaman terakhir = 99 + ${(digits(N) - 189) / 3} = ${N}.` : `Sisa ${digits(N)} − 9 = ${digits(N) - 9} angka untuk halaman 2 angka, yaitu ${(digits(N) - 9) / 2} halaman. Jadi halaman terakhir = 9 + ${(digits(N) - 9) / 2} = ${N}.`}`,
        tip: 'Kurangi 9 dan 180 dulu, sisanya dibagi 3.',
      };
    },
  },
  {
    key: 'bil-kelipatan-inklusi', topic: T, sub: 'Banyak Kelipatan (Inklusi-Eksklusi)', level: 'Provinsi', diff: 'Sedang', sec: 90,
    make(r) {
      for (;;) {
        const [a, b] = r.sample([2, 3, 4, 5, 6, 7, 8, 9], 2).sort((x, y) => x - y);
        if (b % a === 0) continue;
        const N = r.int(100, 1000);
        const form = r.int(0, 2);
        const all = range(1, N);
        const A = (x: number) => x % a === 0;
        const B = (x: number) => x % b === 0;
        const L = lcm(a, b);
        const nA = Math.floor(N / a), nB = Math.floor(N / b), nAB = Math.floor(N / L);
        if (form === 0) {
          const ans = all.filter((x) => A(x) || B(x)).length;
          return {
            q: `Banyaknya bilangan bulat dari 1 sampai ${N} yang habis dibagi ${a} atau ${b} adalah ...`, ans,
            exp: `Kelipatan ${a}: ${nA}. Kelipatan ${b}: ${nB}. Kelipatan keduanya (kelipatan ${L}): ${nAB}. Banyaknya = ${nA} + ${nB} − ${nAB} = ${ans}.`,
            tip: 'Jumlahkan, lalu kurangi yang terhitung dua kali (kelipatan KPK).',
          };
        }
        if (form === 1) {
          const ans = all.filter((x) => A(x) && !B(x)).length;
          return {
            q: `Banyaknya bilangan bulat dari 1 sampai ${N} yang habis dibagi ${a} tetapi tidak habis dibagi ${b} adalah ...`, ans,
            exp: `Kelipatan ${a}: ${nA}. Yang juga kelipatan ${b} (kelipatan ${L}): ${nAB}. Banyaknya = ${nA} − ${nAB} = ${ans}.`,
            tip: 'Ambil semua kelipatan a, buang yang juga kelipatan KPK(a, b).',
          };
        }
        const ans = all.filter((x) => !A(x) && !B(x)).length;
        return {
          q: `Banyaknya bilangan bulat dari 1 sampai ${N} yang tidak habis dibagi ${a} maupun ${b} adalah ...`, ans,
          exp: `Yang habis dibagi ${a} atau ${b}: ${nA} + ${nB} − ${nAB} = ${nA + nB - nAB}. Yang tidak: ${N} − ${nA + nB - nAB} = ${ans}.`,
          tip: 'Hitung komplemennya: total dikurangi yang habis dibagi salah satunya.',
        };
      }
    },
  },
  {
    key: 'bil-teleskopik', topic: T, sub: 'Deret Pecahan Teleskopik', level: 'Provinsi', diff: 'HOTS', sec: 100,
    make(r) {
      const form = r.int(0, 2);
      if (form === 0) {
        const a = r.int(1, 12);
        const b = a + r.int(8, 80);
        const [p, q] = reduced(b + 1 - a, a * (b + 1));
        return {
          q: `Nilai 1/(${a}×${a + 1}) + 1/(${a + 1}×${a + 2}) + ... + 1/(${b}×${b + 1}) dapat ditulis sebagai pecahan paling sederhana p/q. Nilai p + q adalah ...`,
          ans: p + q,
          exp: `1/(k(k+1)) = 1/k − 1/(k+1). Suku tengah saling menghapus, tersisa 1/${a} − 1/${b + 1} = ${b + 1 - a}/${a * (b + 1)} = ${p}/${q}. Jadi p + q = ${p + q}.`,
          tip: 'Pecahan 1/(k(k+1)) selalu bisa dipecah jadi 1/k − 1/(k+1).',
        };
      }
      if (form === 1) {
        const n = r.int(5, 60);
        const [p, q] = reduced(n, 2 * n + 1);
        return {
          q: `Nilai 1/(1×3) + 1/(3×5) + 1/(5×7) + ... + 1/(${2 * n - 1}×${2 * n + 1}) dapat ditulis sebagai pecahan paling sederhana p/q. Nilai p + q adalah ...`,
          ans: p + q,
          exp: `1/(k(k+2)) = ½ × (1/k − 1/(k+2)). Jumlahnya = ½ × (1 − 1/${2 * n + 1}) = ½ × ${2 * n}/${2 * n + 1} = ${p}/${q}. Jadi p + q = ${p + q}.`,
          tip: 'Jika selisih dua faktor penyebut adalah 2, kalikan dengan ½ setelah dipecah.',
        };
      }
      const n = r.int(4, 40);
      const [p, q] = reduced(n, n + 1);
      const terms = range(1, n).map((k) => (k * (k + 1)) / 2);
      // 1/1 + 1/3 + 1/6 ... = 2n/(n+1); ask half
      return {
        q: `Nilai 1/2 × (1 + 1/3 + 1/6 + 1/10 + ... + 1/${terms[n - 1]}) dapat ditulis sebagai pecahan paling sederhana p/q. Nilai p + q adalah ...`,
        ans: p + q,
        exp: `Penyebutnya bilangan segitiga k(k+1)/2, sehingga 1/(k(k+1)/2) = 2/(k(k+1)). Jumlah dalam kurung = 2 × (1 − 1/${n + 1}) = ${2 * n}/${n + 1}. Dikali ½ menjadi ${n}/${n + 1} = ${p}/${q}. Jadi p + q = ${p + q}.`,
        tip: 'Kenali 1, 3, 6, 10, ... sebagai bilangan segitiga k(k+1)/2.',
      };
    },
  },
  {
    key: 'bil-perkalian-pecahan', topic: T, sub: 'Perkalian Pecahan Berantai', level: 'Provinsi', diff: 'Sedang', sec: 80,
    make(r) {
      const form = r.int(0, 2);
      if (form === 0) {
        const n = r.int(8, 60);
        const M = n * r.int(2, 30);
        return {
          q: `Hasil dari ${M} × (1 − 1/2) × (1 − 1/3) × (1 − 1/4) × ... × (1 − 1/${n}) adalah ...`,
          ans: M / n,
          exp: `(1 − 1/2)(1 − 1/3)...(1 − 1/${n}) = 1/2 × 2/3 × 3/4 × ... × ${n - 1}/${n} = 1/${n} (pembilang dan penyebut saling coret). Jadi hasilnya ${M} ÷ ${n} = ${M / n}.`,
          tip: 'Tulis setiap kurung sebagai pecahan, lalu coret silang.',
        };
      }
      if (form === 1) {
        const n = 2 * r.int(4, 40) + 1;
        return {
          q: `Hasil dari (1 + 1/2) × (1 + 1/3) × (1 + 1/4) × ... × (1 + 1/${n}) adalah ...`,
          ans: (n + 1) / 2,
          exp: `= 3/2 × 4/3 × 5/4 × ... × ${n + 1}/${n} = ${n + 1}/2 = ${(n + 1) / 2}.`,
          tip: 'Setiap pembilang tercoret oleh penyebut pecahan berikutnya.',
        };
      }
      const n = r.int(5, 50);
      const den = 2 * n;
      const M = den / gcd(n + 1, den) * r.int(1, 6);
      return {
        q: `Hasil dari ${M} × (1 − 1/2²) × (1 − 1/3²) × (1 − 1/4²) × ... × (1 − 1/${n}²) adalah ...`,
        ans: (M * (n + 1)) / den,
        exp: `1 − 1/k² = (k−1)(k+1)/k². Hasil kali semuanya = (n+1)/(2n) = ${n + 1}/${den}. Jadi ${M} × ${n + 1}/${den} = ${(M * (n + 1)) / den}.`,
        tip: 'Pecah 1 − 1/k² menjadi (k−1)/k × (k+1)/k, lalu kelompokkan dua barisan coret-coretan.',
      };
    },
  },
  {
    key: 'bil-selisih-kuadrat', topic: T, sub: 'Selisih Kuadrat', level: 'Provinsi', diff: 'Sedang', sec: 75,
    make(r) {
      const form = r.int(0, 2);
      if (form === 0) {
        const a = r.int(1010, 2099);
        const b = a - r.int(1, 5);
        return {
          q: `Nilai dari ${a}² − ${b}² adalah ...`,
          ans: a * a - b * b,
          exp: `a² − b² = (a − b)(a + b) = (${a - b}) × (${a + b}) = ${a * a - b * b}.`,
          tip: 'Jangan kuadratkan! Pakai (a − b)(a + b).',
        };
      }
      if (form === 1) {
        const N = 2 * r.int(10, 60);
        let s = 0;
        for (let k = N; k >= 1; k--) s += (k % 2 === 0 ? 1 : -1) * k * k;
        return {
          q: `Nilai dari ${N}² − ${N - 1}² + ${N - 2}² − ${N - 3}² + ... + 2² − 1² adalah ...`,
          ans: s,
          exp: `Setiap pasangan (k)² − (k−1)² = (k + (k−1)) × 1 = 2k − 1. Jadi jumlahnya = ${N} + ${N - 1} + ... + 2 + 1 = ${N}×${N + 1}/2 = ${s}.`,
          tip: 'Pasangkan dua-dua; tiap pasangan sama dengan jumlah kedua bilangannya.',
        };
      }
      const x = r.int(21, 99);
      const y = r.int(1, 9);
      return {
        q: `Nilai dari ${x + y} × ${x - y} + ${y * y} adalah ...`,
        ans: x * x,
        exp: `(${x} + ${y})(${x} − ${y}) = ${x}² − ${y}² = ${x * x - y * y}. Ditambah ${y * y} menjadi ${x * x}.`,
        tip: `Perhatikan ${x + y} dan ${x - y} simetris terhadap ${x}.`,
      };
    },
  },
  {
    key: 'bil-fpb-kpk-balik', topic: T, sub: 'Hubungan FPB & KPK', level: 'Provinsi', diff: 'Sedang', sec: 75,
    make(r) {
      for (;;) {
        const g = r.int(2, 15);
        const x = r.int(2, 12), y = r.int(2, 12);
        if (x === y || gcd(x, y) !== 1) continue;
        const a = g * x, b = g * y, L = g * x * y;
        if (r.chance(0.6)) {
          return {
            q: `FPB dua bilangan adalah ${g} dan KPK-nya ${L}. Jika salah satu bilangan adalah ${a}, bilangan yang lain adalah ...`,
            ans: b,
            exp: `Hasil kali dua bilangan = FPB × KPK = ${g} × ${L} = ${g * L}. Bilangan lain = ${g * L} ÷ ${a} = ${b}.`,
            tip: 'Sifat penting: a × b = FPB(a, b) × KPK(a, b).',
          };
        }
        return {
          q: `Dua bilangan mempunyai hasil kali ${a * b} dan FPB ${g}. KPK kedua bilangan itu adalah ...`,
          ans: L,
          exp: `KPK = hasil kali ÷ FPB = ${a * b} ÷ ${g} = ${L}.`,
          tip: 'a × b = FPB × KPK.',
        };
      }
    },
  },
  {
    key: 'bil-palindrom', topic: T, sub: 'Bilangan Palindrom', level: 'Provinsi', diff: 'Sedang', sec: 90,
    make(r) {
      const pal = (n: number) => { const s = String(n); return s === s.split('').reverse().join(''); };
      if (r.chance(0.5)) {
        const A = r.int(100, 5000);
        const B = A + r.int(300, 4000);
        const ans = range(A, B).filter(pal).length;
        return {
          q: `Bilangan palindrom adalah bilangan yang sama jika dibaca dari depan atau belakang, misalnya 343. Banyaknya bilangan palindrom dari ${A} sampai ${B} adalah ...`,
          ans,
          exp: `Bilangan palindrom 3 angka berbentuk aba (10 untuk tiap a), 4 angka berbentuk abba (10 untuk tiap a). Dengan mendaftar yang berada di antara ${A} dan ${B}, diperoleh ${ans} bilangan.`,
          tip: 'Palindrom 3 dan 4 angka masing-masing ada 10 untuk setiap angka depan.',
        };
      }
      const k = r.pick([3, 4, 5, 6, 9, 11]);
      const ans = range(100, 999).filter((n) => pal(n) && n % k === 0).length;
      return {
        q: `Banyaknya bilangan palindrom tiga angka (contoh: 151) yang habis dibagi ${k} adalah ...`,
        ans,
        exp: `Palindrom tiga angka berbentuk aba = 101a + 10b dengan a = 1..9, b = 0..9 (ada 90). Dengan memeriksa syarat habis dibagi ${k}, diperoleh ${ans} bilangan.`,
        tip: k === 11 ? 'aba habis dibagi 11 jika a − b + a = 2a − b kelipatan 11.' : k === 9 || k === 3 ? `Pakai ciri jumlah angka: 2a + b habis dibagi ${k}.` : 'Tulis aba = 101a + 10b lalu periksa sisa pembagiannya.',
      };
    },
  },
  {
    key: 'bil-rata-berubah', topic: T, sub: 'Statistika: Perubahan Rata-rata', level: 'Provinsi', diff: 'Sedang', sec: 80,
    make(r) {
      for (;;) {
        const n = r.int(8, 30);
        const m = r.int(65, 85);
        const delta = r.pick([1, 2, -1, -2, 0.5]);
        const m2 = m + delta;
        const nw = (n + 1) * m2 - n * m;
        if (!Number.isInteger(nw) || nw < 30 || nw > 100) continue;
        const join = r.chance(0.5);
        if (join) {
          return {
            q: `Rata-rata nilai ${n} siswa adalah ${fmt(m)}. Setelah nilai seorang siswa baru ditambahkan, rata-ratanya menjadi ${fmt(m2)}. Nilai siswa baru tersebut adalah ...`,
            ans: nw,
            exp: `Jumlah awal = ${n} × ${m} = ${n * m}. Jumlah baru = ${n + 1} × ${fmt(m2)} = ${fmt((n + 1) * m2)}. Nilai siswa baru = ${fmt((n + 1) * m2)} − ${n * m} = ${nw}.`,
            tip: `Cara cepat: nilai baru = rata-rata baru + n × (perubahan rata-rata) = ${fmt(m2)} + ${n} × ${fmt(delta)} = ${nw}.`,
          };
        }
        return {
          q: `Rata-rata nilai ${n + 1} siswa adalah ${fmt(m2)}. Jika nilai ${r.pick(NAMA)} tidak diikutkan, rata-ratanya menjadi ${fmt(m)}. Berapakah nilai siswa tersebut?`,
          ans: nw,
          exp: `Jumlah ${n + 1} nilai = ${fmt((n + 1) * m2)}. Jumlah ${n} nilai = ${n * m}. Selisihnya = ${nw}.`,
          tip: 'Ubah rata-rata menjadi jumlah, lalu kurangkan.',
        };
      }
    },
  },

  // ============ NASIONAL ============
  {
    key: 'bil-crt-umum', topic: T, sub: 'Sistem Sisa Pembagian', level: 'Nasional', diff: 'HOTS', sec: 150,
    make(r) {
      for (;;) {
        const ds = r.sample([3, 4, 5, 7, 8, 9, 11], 3);
        if (gcd(ds[0], ds[1]) !== 1 || gcd(ds[1], ds[2]) !== 1 || gcd(ds[0], ds[2]) !== 1) continue;
        const rs = ds.map((d) => r.int(1, d - 1));
        if (ds.every((d, i) => d - rs[i] === ds[0] - rs[0])) continue;
        const ok = (n: number) => ds.every((d, i) => n % d === rs[i]);
        const L = lcmAll(ds);
        const first = range(1, L).find(ok)!;
        if (first <= Math.max(...ds)) continue;
        if (r.chance(0.5)) {
          return {
            q: `Bilangan asli terkecil yang jika dibagi ${ds[0]} bersisa ${rs[0]}, dibagi ${ds[1]} bersisa ${rs[1]}, dan dibagi ${ds[2]} bersisa ${rs[2]} adalah ...`,
            ans: first,
            exp: `Daftar bilangan bersisa ${rs[2]} jika dibagi ${ds[2]}: ${rs[2]}, ${rs[2] + ds[2]}, ${rs[2] + 2 * ds[2]}, ... Saring yang juga memenuhi syarat ${ds[1]} lalu ${ds[0]}. Bilangan terkecil yang lolos semua syarat: ${first}. (Selanjutnya berulang setiap KPK = ${L}.)`,
            tip: 'Mulai dari pembagi terbesar, daftar kandidatnya, lalu uji syarat lainnya satu per satu.',
          };
        }
        const N = r.pick([500, 1000, 2000]);
        const cnt = range(1, N).filter(ok).length;
        return {
          q: `Banyaknya bilangan asli kurang dari atau sama dengan ${N} yang jika dibagi ${ds[0]} bersisa ${rs[0]}, dibagi ${ds[1]} bersisa ${rs[1]}, dan dibagi ${ds[2]} bersisa ${rs[2]} adalah ...`,
          ans: cnt,
          exp: `Bilangan terkecil yang memenuhi adalah ${first}, dan solusi berulang setiap KPK(${ds.join(', ')}) = ${L}. Bilangannya ${first}, ${first + L}, ${first + 2 * L}, ... ≤ ${N}. Banyaknya ⌊(${N} − ${first}) / ${L}⌋ + 1 = ${cnt}.`,
          tip: 'Temukan solusi terkecil, lalu loncat-loncat dengan langkah KPK.',
        };
      }
    },
  },
  {
    key: 'bil-jumlah-digit-besar', topic: T, sub: 'Jumlah Angka Bilangan Besar', level: 'Nasional', diff: 'HOTS', sec: 110,
    make(r) {
      const n = r.int(10, 40);
      if (r.chance(0.5)) {
        const k = r.pick([1, 7, 23, 2026, 99, 365, 1000]);
        const v = 10n ** BigInt(n) - BigInt(k);
        return {
          q: `Jumlah angka-angka penyusun bilangan 10${sup(n)} − ${k} adalah ...`,
          ans: digitSum(v),
          exp: `10${sup(n)} − ${k} = ${String(v).length > 20 ? String(v).slice(0, 6) + '...' + String(v).slice(-6) : String(v)}, yaitu deretan angka 9 diakhiri ${String(10 ** String(k).length - k).padStart(String(k).length, '0')}. Jumlah angkanya = ${digitSum(v)}.`,
          tip: 'Coba pola kecil dulu: 10³ − 7 = 993, 10⁴ − 7 = 9993. Angka 9-nya bertambah satu setiap pangkat naik.',
        };
      }
      const d = r.int(2, 9);
      const v = (10n ** BigInt(n) - 1n) * BigInt(d);
      return {
        q: `Jumlah angka-angka penyusun hasil perkalian 99...9 (${n} angka sembilan) × ${d} adalah ...`,
        ans: digitSum(v),
        exp: `99...9 × ${d} = ${d} × 10${sup(n)} − ${d} = ${d - 1} diikuti ${n - 1} angka 9 lalu ${10 - d}. Jumlah angkanya = ${d - 1} + 9 × ${n - 1} + ${10 - d} = ${digitSum(v)}.`,
        tip: 'Tulis 99...9 sebagai 10ⁿ − 1.',
      };
    },
  },
  {
    key: 'bil-tiga-faktor', topic: T, sub: 'Banyak Faktor Istimewa', level: 'Nasional', diff: 'HOTS', sec: 120,
    make(r) {
      const N = r.int(100, 2000);
      const form = r.int(0, 2);
      const nd = (n: number) => { let c = 0; for (let i = 1; i * i <= n; i++) if (n % i === 0) c += i * i === n ? 1 : 2; return c; };
      if (form === 0) {
        const ans = range(1, N).filter((n) => nd(n) === 3).length;
        return {
          q: `Banyaknya bilangan asli tidak lebih dari ${N} yang mempunyai tepat 3 faktor adalah ...`,
          ans,
          exp: `Bilangan dengan tepat 3 faktor adalah kuadrat bilangan prima (p² punya faktor 1, p, p²). Prima p dengan p² ≤ ${N}: ${range(2, Math.floor(Math.sqrt(N))).filter(isPrime).join(', ')}. Banyaknya ${ans}.`,
          tip: 'Banyak faktor ganjil ⇒ kuadrat sempurna. Tepat 3 ⇒ kuadrat prima.',
        };
      }
      if (form === 1) {
        const ans = range(1, N).filter((n) => nd(n) % 2 === 1).length;
        return {
          q: `Banyaknya bilangan asli tidak lebih dari ${N} yang banyak faktornya ganjil adalah ...`,
          ans,
          exp: `Faktor selalu berpasangan (d dan n/d), kecuali jika d = n/d, yaitu n kuadrat sempurna. Jadi yang dicari adalah kuadrat sempurna ≤ ${N}: 1², 2², ..., ${Math.floor(Math.sqrt(N))}². Banyaknya ${ans}.`,
          tip: 'Banyak faktor ganjil hanya terjadi pada kuadrat sempurna.',
        };
      }
      const M = r.int(100, 400);
      const ans = range(1, M).filter((n) => nd(n) === 4).length;
      return {
        q: `Banyaknya bilangan asli tidak lebih dari ${M} yang mempunyai tepat 4 faktor adalah ...`,
        ans,
        exp: `Bilangan dengan tepat 4 faktor berbentuk p × q (dua prima berbeda) atau p³. Dengan mendaftar semuanya hingga ${M}, diperoleh ${ans} bilangan.`,
        tip: 'Ingat rumus banyak faktor: (e₁+1)(e₂+1)... = 4 hanya mungkin 4 = 4 atau 2 × 2.',
      };
    },
  },
  {
    key: 'bil-digit-ke-n', topic: T, sub: 'Angka ke-n pada Barisan Angka', level: 'Nasional', diff: 'HOTS', sec: 130,
    make(r) {
      let s = '';
      for (let i = 1; s.length < 4000; i++) s += String(i);
      const k = r.int(200, 2900);
      const ans = Number(s[k - 1]);
      let pos = 9, num = 9;
      let rem = k - 9;
      let exp = `Angka 1–9 memakai 9 angka. `;
      if (rem <= 180) {
        const idx = Math.ceil(rem / 2);
        exp += `Sisa ${rem} angka berada di bilangan 2 angka: bilangan ke-${idx} sesudah 9, yaitu ${9 + idx}, angka ke-${rem - (idx - 1) * 2}-nya adalah ${ans}.`;
      } else {
        rem -= 180;
        const idx = Math.ceil(rem / 3);
        exp += `Angka 10–99 memakai 180 angka (total 189). Sisa ${rem} angka berada di bilangan 3 angka: bilangan ke-${idx} sesudah 99, yaitu ${99 + idx}, angka ke-${rem - (idx - 1) * 3}-nya adalah ${ans}.`;
      }
      void pos; void num;
      return {
        q: `Bilangan asli ditulis berurutan tanpa spasi: 123456789101112131415... Angka yang menempati urutan ke-${k} adalah ...`,
        ans,
        exp,
        tip: 'Kurangi blok 1-angka (9) dan 2-angka (180), lalu bagi sisanya dengan 3.',
      };
    },
  },
  {
    key: 'bil-jumlah-semua-digit', topic: T, sub: 'Jumlah Seluruh Angka Penyusun', level: 'Nasional', diff: 'HOTS', sec: 130,
    make(r) {
      const N = r.pick([99, 199, 299, 100, 120, 150, 200, 250, 500, 999, 1000, 365, 2026]);
      const ans = sum(range(1, N).map((x) => digitSum(x)));
      return {
        q: `Jumlah semua angka penyusun bilangan-bilangan 1, 2, 3, ..., ${N} adalah ...`,
        ans,
        exp: `Untuk 0–99, setiap angka 0–9 muncul 10 kali di satuan dan 10 kali di puluhan, sehingga jumlahnya 2 × 10 × 45 = 900. Gunakan pola ini per blok ratusan, lalu tambahkan sisanya. Hasilnya ${ans}.`,
        tip: 'Pikirkan per posisi (satuan, puluhan, ratusan): setiap angka 0–9 muncul sama sering dalam satu blok lengkap.',
      };
    },
  },
  {
    key: 'bil-hasil-kali-digit', topic: T, sub: 'Hasil Kali Angka-angka', level: 'Nasional', diff: 'HOTS', sec: 120,
    make(r) {
      const P = r.pick([72, 120, 210, 360, 600, 1008, 252, 378, 840, 96, 162, 280, 448, 1260, 2016]);
      // brute force smallest number with digit product P
      let ans = 0;
      for (let n = 1; n < 10_000_000; n++) {
        let p = 1, m = n;
        while (m > 0) { p *= m % 10; m = Math.floor(m / 10); if (p === 0) break; }
        if (p === P) { ans = n; break; }
      }
      return {
        q: `Bilangan asli terkecil yang hasil kali angka-angka penyusunnya sama dengan ${P} adalah ...`,
        ans,
        exp: `Agar bilangannya kecil, banyak angkanya harus sesedikit mungkin, jadi pakai angka sebesar mungkin (9, 8, 7, ...) sebagai faktor. ${P} = ${String(ans).split('').join(' × ')}. Susun dari angka terkecil di depan: ${ans}.`,
        tip: 'Bagi P dengan 9, 8, 7, ..., 2 sebanyak mungkin, lalu urutkan angkanya dari kecil ke besar.',
      };
    },
  },
];
