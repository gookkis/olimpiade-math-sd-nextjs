import { Generator, Retry, gcd, range, sum, fmt, clock, NAMA } from './core';

const T = 'Geometri & Pengukuran' as const;

export const geometri: Generator[] = [
  // ============ KABUPATEN/KOTA ============
  {
    key: 'geo-persegi', topic: T, sub: 'Keliling & Luas Persegi', level: 'Kabupaten/Kota', diff: 'Mudah', sec: 45,
    make(r) {
      const s = r.int(5, 40);
      if (r.chance(0.5)) {
        return {
          q: `Keliling sebuah persegi adalah ${4 * s} cm. Luas persegi tersebut adalah ...`,
          ans: s * s, unit: 'cm²', wrong: [4 * s * 4 * s / 4, (4 * s) ** 2 / 2, 4 * s * 2, s * s * 2].map(Math.round),
          exp: `Sisi = ${4 * s} ÷ 4 = ${s} cm. Luas = ${s} × ${s} = ${s * s} cm².`,
          tip: 'Keliling ÷ 4 = sisi; sisi × sisi = luas.',
        };
      }
      return {
        q: `Luas sebuah persegi adalah ${s * s} cm². Keliling persegi tersebut adalah ...`,
        ans: 4 * s, unit: 'cm', wrong: [2 * s, s * s / 2, 4 * s + 4],
        exp: `Sisi = √${s * s} = ${s} cm. Keliling = 4 × ${s} = ${4 * s} cm.`,
        tip: 'Hafalkan kuadrat 1–30 agar akar cepat ditemukan.',
      };
    },
  },
  {
    key: 'geo-persegi-panjang', topic: T, sub: 'Keliling & Luas Persegi Panjang', level: 'Kabupaten/Kota', diff: 'Mudah', sec: 50,
    make(r) {
      const p = r.int(8, 40), l = r.int(3, p - 1);
      const ctx = r.pick(['sebuah kebun', 'sebuah lapangan', 'selembar karton', 'sebuah kolam']);
      if (r.chance(0.5)) {
        return {
          q: `Luas ${ctx} berbentuk persegi panjang adalah ${p * l} m². Jika panjangnya ${p} m, kelilingnya adalah ...`,
          ans: 2 * (p + l), unit: 'm', wrong: [p + l, 2 * p + l, p * l / 2].map((v) => Math.round(v)),
          exp: `Lebar = ${p * l} ÷ ${p} = ${l} m. Keliling = 2 × (${p} + ${l}) = ${2 * (p + l)} m.`,
          tip: 'Cari ukuran yang hilang dari luas, lalu hitung keliling.',
        };
      }
      return {
        q: `Keliling ${ctx} berbentuk persegi panjang adalah ${2 * (p + l)} m. Jika lebarnya ${l} m, luasnya adalah ...`,
        ans: p * l, unit: 'm²', wrong: [(2 * (p + l) - l) * l, (p + l) * l, p * l + l],
        exp: `Panjang + lebar = ${2 * (p + l)} ÷ 2 = ${p + l}, jadi panjang = ${p} m. Luas = ${p} × ${l} = ${p * l} m².`,
        tip: 'Keliling ÷ 2 = panjang + lebar.',
      };
    },
  },
  {
    key: 'geo-segitiga-trapesium', topic: T, sub: 'Luas Segitiga, Trapesium & Layang-layang', level: 'Kabupaten/Kota', diff: 'Mudah', sec: 55,
    make(r) {
      const form = r.int(0, 3);
      if (form === 0) {
        const a = 2 * r.int(3, 20), t = r.int(4, 25);
        return { q: `Sebuah segitiga memiliki alas ${a} cm dan tinggi ${t} cm. Luasnya adalah ...`, ans: (a * t) / 2, unit: 'cm²', wrong: [a * t, a + t, (a * t) / 2 + a], exp: `Luas = ½ × ${a} × ${t} = ${(a * t) / 2} cm².`, tip: 'Luas segitiga = ½ × alas × tinggi.' };
      }
      if (form === 1) {
        const a = r.int(4, 20), t = 2 * r.int(3, 15), L = (a * t) / 2;
        return { q: `Luas sebuah segitiga ${L} cm² dan alasnya ${a} cm. Tingginya adalah ...`, ans: t, unit: 'cm', wrong: [t / 2, L / a, t + 2], exp: `Tinggi = 2 × Luas ÷ alas = 2 × ${L} ÷ ${a} = ${t} cm.`, tip: 'Jangan lupa dikali 2 saat mencari tinggi dari luas.' };
      }
      if (form === 2) {
        const a = r.int(5, 25), b = a + 2 * r.int(1, 8), t = r.int(4, 16);
        return { q: `Sebuah trapesium memiliki sisi sejajar ${a} cm dan ${b} cm, serta tinggi ${t} cm. Luasnya adalah ...`, ans: ((a + b) * t) / 2, unit: 'cm²', wrong: [(a + b) * t, a * b, ((a + b) * t) / 2 + t], exp: `Luas = (${a} + ${b}) × ${t} ÷ 2 = ${((a + b) * t) / 2} cm².`, tip: 'Luas trapesium = jumlah sisi sejajar × tinggi ÷ 2.' };
      }
      const d1 = 2 * r.int(3, 15), d2 = r.int(5, 30);
      return { q: `Sebuah layang-layang memiliki diagonal ${d1} cm dan ${d2} cm. Luasnya adalah ...`, ans: (d1 * d2) / 2, unit: 'cm²', wrong: [d1 * d2, 2 * (d1 + d2), (d1 * d2) / 4], exp: `Luas = ½ × ${d1} × ${d2} = ${(d1 * d2) / 2} cm².`, tip: 'Luas layang-layang dan belah ketupat = ½ × d₁ × d₂.' };
    },
  },
  {
    key: 'geo-lingkaran', topic: T, sub: 'Keliling & Luas Lingkaran', level: 'Kabupaten/Kota', diff: 'Mudah', sec: 60,
    make(r) {
      const use7 = r.chance(0.6);
      const rad = use7 ? 7 * r.int(1, 6) : 10 * r.int(1, 5);
      const pi = use7 ? 22 / 7 : 3.14;
      const piS = use7 ? '22/7' : '3,14';
      const form = r.int(0, 2);
      const L = Math.round(pi * rad * rad * 100) / 100, K = Math.round(2 * pi * rad * 100) / 100;
      if (form === 0) return { q: `Luas lingkaran yang berjari-jari ${rad} cm adalah ... (π = ${piS})`, ans: L, unit: 'cm²', wrong: [K, Math.round(pi * 4 * rad * rad * 100) / 100, Math.round(pi * rad * 100) / 100], exp: `L = π × r² = ${piS} × ${rad} × ${rad} = ${fmt(L)} cm².`, tip: 'Luas pakai r², keliling pakai 2r. Jangan tertukar!' };
      if (form === 1) return { q: `Keliling lingkaran yang berdiameter ${2 * rad} cm adalah ... (π = ${piS})`, ans: K, unit: 'cm', wrong: [L, Math.round(pi * 4 * rad * 100) / 100, Math.round(pi * rad * 100) / 100], exp: `K = π × d = ${piS} × ${2 * rad} = ${fmt(K)} cm.`, tip: 'Keliling = π × diameter.' };
      const half = Math.round((pi * rad + 2 * rad) * 100) / 100;
      return { q: `Keliling setengah lingkaran (termasuk garis tengahnya) yang berjari-jari ${rad} cm adalah ... (π = ${piS})`, ans: half, unit: 'cm', wrong: [Math.round(pi * rad * 100) / 100, K, Math.round((pi * rad + rad) * 100) / 100], exp: `Busur = ½ × 2πr = ${piS} × ${rad} = ${fmt(Math.round(pi * rad * 100) / 100)} cm. Ditambah diameter ${2 * rad} cm, jadi ${fmt(half)} cm.`, tip: 'Keliling setengah lingkaran = busur + diameter. Diameter sering terlupa!' };
    },
  },
  {
    key: 'geo-volume', topic: T, sub: 'Volume Kubus & Balok', level: 'Kabupaten/Kota', diff: 'Mudah', sec: 55,
    make(r) {
      const form = r.int(0, 2);
      if (form === 0) {
        const p = r.int(5, 30), l = r.int(3, 20), t = r.int(2, 15);
        return { q: `Sebuah balok berukuran panjang ${p} cm, lebar ${l} cm, dan tinggi ${t} cm. Volumenya adalah ...`, ans: p * l * t, unit: 'cm³', wrong: [2 * (p * l + l * t + p * t), p * l * t + p * l, p + l + t], exp: `V = ${p} × ${l} × ${t} = ${p * l * t} cm³.`, tip: 'Volume balok = p × l × t.' };
      }
      if (form === 1) {
        const s = r.int(3, 15);
        return { q: `Luas permukaan sebuah kubus adalah ${6 * s * s} cm². Volume kubus tersebut adalah ...`, ans: s ** 3, unit: 'cm³', wrong: [s * s, 6 * s ** 3, s ** 3 + s * s], exp: `Luas satu sisi = ${6 * s * s} ÷ 6 = ${s * s}, sehingga rusuk = ${s} cm. V = ${s}³ = ${s ** 3} cm³.`, tip: 'Kubus punya 6 sisi persegi yang sama.' };
      }
      const k = r.int(2, 5);
      return { q: `Panjang rusuk sebuah kubus diperbesar menjadi ${k} kali semula. Volumenya menjadi ... kali volume semula.`, ans: k ** 3, wrong: [k, k * k, 3 * k], exp: `V baru = (${k}s)³ = ${k ** 3}s³, jadi ${k ** 3} kali.`, tip: 'Rusuk × k ⇒ luas × k² ⇒ volume × k³.' };
    },
  },
  {
    key: 'geo-sudut-segitiga', topic: T, sub: 'Sudut Segitiga', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 60,
    make(r) {
      const form = r.int(0, 2);
      if (form === 0) {
        for (;;) {
          const [a, b, c] = [r.int(1, 7), r.int(1, 7), r.int(1, 7)];
          if (180 % (a + b + c) !== 0 || new Set([a, b, c]).size < 2) continue;
          const k = 180 / (a + b + c);
          return { q: `Perbandingan besar sudut-sudut sebuah segitiga adalah ${a} : ${b} : ${c}. Besar sudut terbesarnya adalah ...`, ans: Math.max(a, b, c) * k, unit: '°', wrong: [Math.min(a, b, c) * k, 180 / 3, Math.max(a, b, c) * 10], exp: `Jumlah sudut 180°. 1 bagian = 180° ÷ ${a + b + c} = ${k}°. Sudut terbesar = ${Math.max(a, b, c)} × ${k}° = ${Math.max(a, b, c) * k}°.`, tip: 'Jumlah sudut segitiga selalu 180°.' };
        }
      }
      if (form === 1) {
        const top = 2 * r.int(10, 70);
        return { q: `Sudut puncak sebuah segitiga sama kaki adalah ${top}°. Besar salah satu sudut alasnya adalah ...`, ans: (180 - top) / 2, unit: '°', wrong: [180 - top, top / 2, 90 - top / 4].map((v) => Math.round(v)), exp: `Dua sudut alas sama besar: (180° − ${top}°) ÷ 2 = ${(180 - top) / 2}°.`, tip: 'Segitiga sama kaki: dua sudut alas sama besar.' };
      }
      const a = r.int(30, 80), b = r.int(30, 80);
      return { q: `Dua sudut dalam sebuah segitiga besarnya ${a}° dan ${b}°. Besar sudut luar pada titik sudut ketiga adalah ...`, ans: a + b, unit: '°', wrong: [180 - a - b, 360 - a - b, Math.abs(a - b)], exp: `Sudut ketiga = 180° − ${a}° − ${b}° = ${180 - a - b}°. Sudut luarnya = 180° − ${180 - a - b}° = ${a + b}° (sama dengan jumlah dua sudut dalam yang tidak bersebelahan).`, tip: 'Sudut luar = jumlah dua sudut dalam yang tidak bersisian.' };
    },
  },
  {
    key: 'geo-sudut-jam', topic: T, sub: 'Sudut Jarum Jam', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 70,
    make(r) {
      const h = r.int(1, 12), m = r.pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 12, 24, 36, 48]);
      let ang = Math.abs(30 * h - 5.5 * m);
      if (ang > 180) ang = 360 - ang;
      let naive = Math.abs(30 * h - 6 * m);
      if (naive > 180) naive = 360 - naive;
      return {
        q: `Besar sudut terkecil yang dibentuk jarum pendek dan jarum panjang jam pada pukul ${String(h).padStart(2, '0')}.${String(m).padStart(2, '0')} adalah ...`,
        ans: ang, unit: '°', wrong: [naive, 360 - ang, ang + 15, Math.abs(ang - 30)],
        exp: `Jarum panjang di ${6 * m}° (6° per menit). Jarum pendek di ${30 * h} + ${m} × 0,5 = ${fmt(30 * (h % 12) + 0.5 * m)}° (0,5° per menit). Selisihnya ${fmt(Math.abs(30 * (h % 12) + 0.5 * m - 6 * m))}°${Math.abs(30 * (h % 12) + 0.5 * m - 6 * m) > 180 ? `, sudut terkecilnya 360° − itu = ${fmt(ang)}°` : ''}. Jadi ${fmt(ang)}°.`,
        tip: 'Rumus: |30H − 5,5M|. Jarum pendek juga bergerak 0,5° setiap menit; itu jebakan utamanya.',
      };
    },
  },
  {
    key: 'geo-satuan', topic: T, sub: 'Konversi Satuan Pengukuran', level: 'Kabupaten/Kota', diff: 'Mudah', sec: 60,
    make(r) {
      const form = r.int(0, 3);
      if (form === 0) {
        const km = r.int(1, 5) + r.pick([0, 0.5, 0.25]), m = r.int(50, 900), dam = r.int(1, 30);
        const ans = km * 1000 + m + dam * 10;
        return { q: `${fmt(km)} km + ${m} m + ${dam} dam = ... m`, ans, unit: 'm', wrong: [km * 1000 + m + dam, km * 100 + m + dam * 10, ans + 90 * dam], exp: `${fmt(km)} km = ${km * 1000} m; ${dam} dam = ${dam * 10} m. Total ${km * 1000} + ${m} + ${dam * 10} = ${ans} m.`, tip: 'Tangga satuan panjang: km-hm-dam-m, tiap turun satu anak tangga dikali 10.' };
      }
      if (form === 1) {
        const [h1, m1, h2, m2] = [r.int(1, 4), r.int(10, 55), r.int(1, 4), r.int(10, 55)];
        const ans = (h1 + h2) * 60 + m1 + m2;
        return { q: `${h1} jam ${m1} menit + ${h2} jam ${m2} menit = ... menit`, ans, unit: 'menit', wrong: [(h1 + h2) * 100 + m1 + m2, ans - 60, ans + 40], exp: `${h1 + h2} jam = ${(h1 + h2) * 60} menit, ditambah ${m1 + m2} menit = ${ans} menit.`, tip: '1 jam = 60 menit, BUKAN 100.' };
      }
      if (form === 2) {
        const t = r.int(1, 4) + r.pick([0, 0.2, 0.5, 0.75]), kg = r.int(50, 900), kw = r.int(1, 9);
        const ans = t * 1000 + kg + kw * 100;
        return { q: `${fmt(t)} ton + ${kw} kuintal + ${kg} kg = ... kg`, ans, unit: 'kg', wrong: [t * 1000 + kg + kw * 10, t * 100 + kg + kw * 100, ans - 100], exp: `${fmt(t)} ton = ${t * 1000} kg; ${kw} kuintal = ${kw * 100} kg. Total ${ans} kg.`, tip: '1 ton = 10 kuintal = 1.000 kg; 1 kuintal = 100 kg.' };
      }
      const L = r.int(1, 6), ml = r.int(50, 900), dl = r.int(1, 9);
      const ans = L * 1000 + ml + dl * 100;
      return { q: `${L} liter + ${dl} dl + ${ml} ml = ... ml`, ans, unit: 'ml', wrong: [L * 1000 + ml + dl * 10, L * 100 + ml + dl * 100, ans + 900], exp: `${L} liter = ${L * 1000} ml; ${dl} dl = ${dl * 100} ml. Total ${ans} ml.`, tip: '1 liter = 10 dl = 1.000 ml.' };
    },
  },
  {
    key: 'geo-waktu', topic: T, sub: 'Pengukuran Waktu', level: 'Kabupaten/Kota', diff: 'Mudah', sec: 55,
    make(r) {
      const start = r.int(5 * 60, 15 * 60);
      const dur = r.int(35, 300);
      const nm = r.pick(NAMA);
      if (r.chance(0.5)) {
        const ans = clock(start + dur);
        return {
          q: `${nm} berangkat dari rumah pukul ${clock(start)}. Perjalanan memakan waktu ${Math.floor(dur / 60)} jam ${dur % 60} menit. Pukul berapa ${nm} tiba?`,
          ans, wrong: [clock(start + dur + 40), clock(start + dur - 20), clock(start + dur + 60), clock(start + dur - 60)],
          exp: `${clock(start)} + ${Math.floor(dur / 60)} jam = ${clock(start + Math.floor(dur / 60) * 60)}, ditambah ${dur % 60} menit = ${ans}.`,
          tip: 'Tambahkan jam dulu, baru menit. Jika menit ≥ 60, naikkan satu jam.',
        };
      }
      return {
        q: `Sebuah pertandingan dimulai pukul ${clock(start)} dan berakhir pukul ${clock(start + dur)}. Berapa menit lamanya pertandingan tersebut?`,
        ans: dur, unit: 'menit', wrong: [dur + 40, dur - 40, Math.floor(dur / 60) * 100 + (dur % 60)],
        exp: `Dari ${clock(start)} ke ${clock(start + dur)} = ${Math.floor(dur / 60)} jam ${dur % 60} menit = ${dur} menit.`,
        tip: 'Hitung dari menit awal ke jam bulat berikutnya, lalu tambahkan sisanya.',
      };
    },
  },
  {
    key: 'geo-debit', topic: T, sub: 'Debit Air', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 70,
    make(r) {
      const p = 10 * r.int(4, 15), l = 10 * r.int(3, 10), t = 10 * r.int(3, 10);
      const vol = (p * l * t) / 1000;
      const deb = r.pick([2, 4, 5, 8, 10, 12, 15, 20, 25]);
      if (!Number.isInteger(vol / deb)) throw new Retry();
      return {
        q: `Sebuah bak mandi berbentuk balok berukuran ${p} cm × ${l} cm × ${t} cm. Bak itu diisi air dari keran dengan debit ${deb} liter/menit. Berapa menit waktu yang diperlukan hingga bak penuh?`,
        ans: vol / deb, unit: 'menit', wrong: [vol, (p * l * t) / deb / 100, vol / deb + deb],
        exp: `Volume bak = ${p} × ${l} × ${t} = ${fmt(p * l * t)} cm³ = ${vol} liter (1 liter = 1.000 cm³). Waktu = ${vol} ÷ ${deb} = ${vol / deb} menit.`,
        tip: 'Ubah cm³ ke liter dulu (bagi 1.000), lalu waktu = volume ÷ debit.',
      };
    },
  },
  {
    key: 'geo-diagonal-poligon', topic: T, sub: 'Diagonal Segi Banyak', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 60,
    make(r) {
      const n = r.int(5, 20);
      const D = (n * (n - 3)) / 2;
      if (r.chance(0.6)) return { q: `Banyaknya diagonal pada segi-${n} adalah ...`, ans: D, wrong: [n * (n - 3), (n * (n - 1)) / 2, n - 3], exp: `Setiap titik sudut terhubung ke ${n - 3} titik lain melalui diagonal. Total ${n} × ${n - 3} ÷ 2 = ${D} (dibagi 2 karena tiap diagonal terhitung dua kali).`, tip: 'Rumus diagonal: n(n − 3)/2.' };
      return { q: `Sebuah segi banyak beraturan memiliki ${D} diagonal. Banyak sisinya adalah ...`, ans: n, wrong: [n + 1, n - 1, n + 3], exp: `n(n − 3)/2 = ${D} → n(n − 3) = ${2 * D} = ${n} × ${n - 3}. Jadi n = ${n}.`, tip: 'Kalikan banyak diagonal dengan 2 lalu cari dua bilangan yang selisihnya 3.' };
    },
  },
  {
    key: 'geo-euler', topic: T, sub: 'Unsur Bangun Ruang (Prisma & Limas)', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 55,
    make(r) {
      const n = r.int(3, 12);
      const prism = r.chance(0.5);
      const V = prism ? 2 * n : n + 1, E = prism ? 3 * n : 2 * n, F = prism ? n + 2 : n + 1;
      const what = r.pick(['titik sudut', 'rusuk', 'sisi', 'jumlah titik sudut, rusuk, dan sisi'] as const);
      const ans = what === 'titik sudut' ? V : what === 'rusuk' ? E : what === 'sisi' ? F : V + E + F;
      return {
        q: `Sebuah ${prism ? 'prisma' : 'limas'} memiliki alas berbentuk segi-${n}. Banyak ${what} ${prism ? 'prisma' : 'limas'} tersebut adalah ...`,
        ans, wrong: [V, E, F, V + E + F, ans + 2].filter((v) => v !== ans),
        exp: `${prism ? `Prisma segi-${n}: titik sudut 2 × ${n} = ${V}, rusuk 3 × ${n} = ${E}, sisi ${n} + 2 = ${F}.` : `Limas segi-${n}: titik sudut ${n} + 1 = ${V}, rusuk 2 × ${n} = ${E}, sisi ${n} + 1 = ${F}.`} Cek rumus Euler: ${V} + ${F} − ${E} = 2.`,
        tip: 'Rumus Euler: titik sudut + sisi − rusuk = 2.',
      };
    },
  },

  // ============ PROVINSI ============
  {
    key: 'geo-kubus-dicat', topic: T, sub: 'Kubus Satuan yang Dicat', level: 'Provinsi', diff: 'Sedang', sec: 100,
    make(r) {
      const cube = r.chance(0.5);
      const a = r.int(3, 9), b = cube ? a : r.int(3, 9), c = cube ? a : r.int(2, 7);
      const k = r.int(0, 3);
      let cnt = 0;
      for (let x = 0; x < a; x++) for (let y = 0; y < b; y++) for (let z = 0; z < c; z++) {
        const f = (x === 0 ? 1 : 0) + (x === a - 1 ? 1 : 0) + (y === 0 ? 1 : 0) + (y === b - 1 ? 1 : 0) + (z === 0 ? 1 : 0) + (z === c - 1 ? 1 : 0);
        if (f === k) cnt++;
      }
      if (cnt === 0) throw new Retry();
      const desc = cube ? `kubus ${a} × ${a} × ${a}` : `balok ${a} × ${b} × ${c}`;
      return {
        q: `Sebuah ${desc} disusun dari kubus-kubus satuan. Seluruh permukaan luarnya dicat merah, lalu dibongkar kembali menjadi kubus satuan. Banyak kubus satuan yang ${k === 0 ? 'tidak terkena cat sama sekali' : `tepat ${k} sisinya terkena cat`} adalah ...`,
        ans: cnt,
        exp: k === 3 ? 'Kubus dengan 3 sisi bercat hanya di 8 pojok.' : k === 2 ? `Kubus 2 sisi bercat berada di rusuk tanpa pojok: 4 × [(${a} − 2) + (${b} − 2) + (${c} − 2)] = ${cnt}.` : k === 1 ? `Kubus 1 sisi bercat berada di tengah tiap sisi: 2 × [(${a}−2)(${b}−2) + (${b}−2)(${c}−2) + (${a}−2)(${c}−2)] = ${cnt}.` : `Kubus tanpa cat berada di bagian dalam: (${a} − 2)(${b} − 2)(${c} − 2) = ${cnt}.`,
        tip: 'Pojok = 3 sisi, rusuk = 2 sisi, muka = 1 sisi, dalam = 0 sisi. Kurangi 2 dari setiap ukuran untuk membuang pojok.',
      };
    },
  },
  {
    key: 'geo-luas-permukaan-susun', topic: T, sub: 'Luas Permukaan Susunan Kubus', level: 'Provinsi', diff: 'Sedang', sec: 100,
    make(r) {
      const s = r.int(1, 4);
      const form = r.int(0, 2);
      let cubes: [number, number, number][] = [];
      let desc = '';
      if (form === 0) {
        const n = r.int(4, 20);
        cubes = range(0, n - 1).map((i) => [i, 0, 0]);
        desc = `${n} kubus berukuran ${s} cm disusun berjajar dalam satu baris (membentuk balok)`;
      } else if (form === 1) {
        const k = r.int(3, 7);
        for (let col = 0; col < k; col++) for (let h = 0; h <= col; h++) cubes.push([col, 0, h]);
        desc = `Kubus-kubus berukuran ${s} cm disusun membentuk tangga satu baris: kolom pertama 1 kubus, kolom kedua 2 kubus, ..., kolom ke-${k} ${k} kubus (total ${cubes.length} kubus)`;
      } else {
        const a = r.int(2, 5), b = r.int(2, 5), c = r.int(1, 4);
        for (let x = 0; x < a; x++) for (let y = 0; y < b; y++) for (let z = 0; z < c; z++) cubes.push([x, y, z]);
        desc = `${a * b * c} kubus berukuran ${s} cm disusun menjadi balok ${a} × ${b} × ${c} kubus`;
      }
      const set = new Set(cubes.map((c) => c.join(',')));
      let faces = 0;
      for (const [x, y, z] of cubes) for (const [dx, dy, dz] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) if (!set.has(`${x + dx},${y + dy},${z + dz}`)) faces++;
      return {
        q: `${desc}. Luas permukaan bangun yang terbentuk adalah ... cm².`,
        ans: faces * s * s,
        exp: `Hitung sisi-sisi kubus yang terlihat dari luar (depan, belakang, kiri, kanan, atas, bawah): ada ${faces} persegi kecil. Setiap persegi luasnya ${s * s} cm², jadi luas permukaan = ${faces} × ${s * s} = ${faces * s * s} cm².`,
        tip: 'Lihat bangun dari 6 arah dan hitung persegi yang tampak (pandangan berlawanan sama banyak, kecuali ada rongga).',
      };
    },
  },
  {
    key: 'geo-keliling-potong', topic: T, sub: 'Keliling Bangun Terpotong', level: 'Provinsi', diff: 'Sedang', sec: 80,
    make(r) {
      const p = r.int(15, 50), l = r.int(10, p - 2), s = r.int(2, Math.min(8, l - 4));
      const corner = r.chance(0.5);
      const ans = corner ? 2 * (p + l) : 2 * (p + l) + 2 * s;
      return {
        q: corner
          ? `Selembar kertas berbentuk persegi panjang ${p} cm × ${l} cm. Pada salah satu pojoknya dipotong sebuah persegi bersisi ${s} cm. Keliling kertas setelah dipotong adalah ... cm.`
          : `Selembar kertas berbentuk persegi panjang ${p} cm × ${l} cm. Di tengah sisi panjangnya dipotong sebuah persegi bersisi ${s} cm (membentuk lekukan, bukan di pojok). Keliling kertas setelah dipotong adalah ... cm.`,
        ans,
        exp: corner
          ? `Dua sisi yang hilang (masing-masing ${s} cm) diganti oleh dua sisi baru yang sama panjang. Keliling tetap = 2 × (${p} + ${l}) = ${ans} cm.`
          : `Sisi bawah lekukan menggantikan bagian sisi yang hilang (${s} cm), tetapi muncul dua sisi tegak tambahan masing-masing ${s} cm. Keliling = 2 × (${p} + ${l}) + 2 × ${s} = ${ans} cm.`,
        tip: 'Potongan di pojok tidak mengubah keliling. Lekukan di tengah sisi menambah 2 × kedalamannya.',
      };
    },
  },
  {
    key: 'geo-arsiran', topic: T, sub: 'Luas Daerah Arsiran', level: 'Provinsi', diff: 'HOTS', sec: 110,
    make(r) {
      const form = r.int(0, 3);
      if (form === 0) {
        const s = 7 * r.int(1, 6);
        return { q: `Di dalam persegi bersisi ${s} cm digambar dua busur seperempat lingkaran berjari-jari ${s} cm, masing-masing berpusat di dua pojok yang berhadapan. Kedua busur membentuk daerah seperti daun. Luas daerah "daun" itu adalah ... cm². (π = 22/7)`, ans: (4 * s * s) / 7, exp: `Luas daun = 2 × luas seperempat lingkaran − luas persegi = 2 × ¼ × 22/7 × ${s * s} − ${s * s} = ${(11 * s * s) / 7} − ${s * s} = ${(4 * s * s) / 7} cm².`, tip: 'Luas daun dalam persegi bersisi s = 4/7 × s² (dengan π = 22/7).' };
      }
      if (form === 1) {
        const s = 14 * r.int(1, 4);
        return { q: `Sebuah lingkaran terbesar digambar di dalam persegi bersisi ${s} cm (menyinggung keempat sisinya). Luas daerah persegi di luar lingkaran adalah ... cm². (π = 22/7)`, ans: (3 * s * s) / 14, exp: `Jari-jari = ${s / 2} cm. Luas lingkaran = 22/7 × ${s / 2} × ${s / 2} = ${(11 * s * s) / 14}. Luas di luar = ${s * s} − ${(11 * s * s) / 14} = ${(3 * s * s) / 14} cm².`, tip: 'Luas persegi − luas lingkaran dalam = 3/14 × s².' };
      }
      if (form === 2) {
        const rad = 7 * r.int(1, 5);
        return { q: `Sebuah persegi digambar di dalam lingkaran berjari-jari ${rad} cm sehingga keempat titik sudutnya terletak pada lingkaran. Luas daerah lingkaran di luar persegi adalah ... cm². (π = 22/7)`, ans: (8 * rad * rad) / 7, exp: `Diagonal persegi = diameter = ${2 * rad} cm, jadi luas persegi = ½ × ${2 * rad} × ${2 * rad} = ${2 * rad * rad}. Luas lingkaran = 22/7 × ${rad * rad} = ${(22 * rad * rad) / 7}. Selisihnya ${(8 * rad * rad) / 7} cm².`, tip: 'Luas persegi dari diagonal = ½ × d × d.' };
      }
      const rad = 7 * r.int(1, 4);
      return { q: `Pada seperempat lingkaran berjari-jari ${rad} cm, kedua ujung busurnya dihubungkan dengan garis lurus. Luas tembereng (daerah antara busur dan garis tersebut) adalah ... cm². (π = 22/7)`, ans: (2 * rad * rad) / 7, exp: `Luas seperempat lingkaran = ¼ × 22/7 × ${rad * rad} = ${(11 * rad * rad) / 14}. Luas segitiga siku-siku = ½ × ${rad} × ${rad} = ${(rad * rad) / 2}. Tembereng = ${(11 * rad * rad) / 14} − ${(rad * rad) / 2} = ${(2 * rad * rad) / 7} cm².`, tip: 'Tembereng = juring − segitiga.' };
    },
  },
  {
    key: 'geo-hitung-persegi', topic: T, sub: 'Menghitung Banyak Persegi & Persegi Panjang', level: 'Provinsi', diff: 'Sedang', sec: 100,
    make(r) {
      if (r.chance(0.5)) {
        const n = r.int(3, 10);
        const ans = sum(range(1, n).map((k) => (n - k + 1) ** 2));
        return { q: `Sebuah papan catur berukuran ${n} × ${n} petak. Berapa banyak persegi (dari semua ukuran) yang terdapat pada papan itu?`, ans, exp: `Persegi k × k ada (${n} − k + 1)² buah. Total = ${range(1, n).map((k) => (n - k + 1) ** 2).join(' + ')} = ${ans}.`, tip: 'Jumlah persegi pada papan n × n = 1² + 2² + ... + n².' };
      }
      const m = r.int(2, 8), n = r.int(2, 8);
      const ans = ((m * (m + 1)) / 2) * ((n * (n + 1)) / 2);
      return { q: `Sebuah petak berukuran ${m} × ${n} kotak satuan. Berapa banyak persegi panjang (termasuk persegi) yang dapat ditemukan pada petak itu?`, ans, exp: `Pilih 2 dari ${m + 1} garis mendatar: ${(m * (m + 1)) / 2} cara; pilih 2 dari ${n + 1} garis tegak: ${(n * (n + 1)) / 2} cara. Total ${(m * (m + 1)) / 2} × ${(n * (n + 1)) / 2} = ${ans}.`, tip: 'Setiap persegi panjang ditentukan oleh 2 garis mendatar dan 2 garis tegak.' };
    },
  },
  {
    key: 'geo-hitung-segitiga', topic: T, sub: 'Menghitung Banyak Segitiga', level: 'Provinsi', diff: 'HOTS', sec: 100,
    make(r) {
      const k = r.int(1, 8);
      const base = ((k + 2) * (k + 1)) / 2;
      if (r.chance(0.5)) return { q: `Pada segitiga ABC, dari titik A ditarik ${k} garis lurus ke sisi BC (titik-titik ujungnya berbeda dan terletak di antara B dan C). Berapa banyak segitiga yang terdapat pada gambar tersebut?`, ans: base, exp: `Sisi BC kini memuat ${k + 2} titik. Setiap segitiga terbentuk dari A dan 2 titik pada BC: C(${k + 2}, 2) = ${base}.`, tip: 'Pilih 2 titik di alas, sambungkan ke puncak.' };
      const h = r.int(1, 3);
      return { q: `Pada segitiga ABC, dari titik A ditarik ${k} garis lurus ke sisi BC. Kemudian ditarik ${h} garis sejajar BC yang memotong semua garis dari A. Berapa banyak segitiga pada gambar tersebut?`, ans: base * (h + 1), exp: `Setiap garis mendatar (termasuk BC) membentuk C(${k + 2}, 2) = ${base} segitiga bersama titik A. Ada ${h + 1} garis mendatar, jadi ${base} × ${h + 1} = ${base * (h + 1)}.`, tip: 'Hitung segitiga per "lapis" garis mendatar, lalu kalikan.' };
    },
  },
  {
    key: 'geo-sudut-poligon', topic: T, sub: 'Sudut Segi Banyak Beraturan', level: 'Provinsi', diff: 'Sedang', sec: 70,
    make(r) {
      const n = r.pick([5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36]);
      const form = r.int(0, 2);
      if (form === 0) return { q: `Besar setiap sudut dalam segi-${n} beraturan adalah ... derajat.`, ans: 180 - 360 / n, exp: `Sudut luar = 360° ÷ ${n} = ${360 / n}°. Sudut dalam = 180° − ${360 / n}° = ${180 - 360 / n}°.`, tip: 'Sudut luar segi-n beraturan = 360°/n.' };
      if (form === 1) return { q: `Jumlah semua sudut dalam segi-${n} adalah ... derajat.`, ans: (n - 2) * 180, exp: `Segi-${n} dapat dibagi menjadi ${n - 2} segitiga dari satu titik sudut. Jumlah = ${n - 2} × 180° = ${(n - 2) * 180}°.`, tip: 'Jumlah sudut dalam = (n − 2) × 180°.' };
      return { q: `Setiap sudut dalam suatu segi banyak beraturan besarnya ${180 - 360 / n}°. Banyak sisinya adalah ...`, ans: n, exp: `Sudut luar = 180° − ${180 - 360 / n}° = ${360 / n}°. Banyak sisi = 360° ÷ ${360 / n}° = ${n}.`, tip: 'Ubah ke sudut luar, lalu 360 ÷ sudut luar.' };
    },
  },
  {
    key: 'geo-air-naik', topic: T, sub: 'Volume & Kenaikan Air', level: 'Provinsi', diff: 'HOTS', sec: 110,
    make(r) {
      for (;;) {
        const p = 10 * r.int(3, 10), l = 10 * r.int(2, 8), s = r.int(5, 20);
        const rise = (s ** 3) / (p * l);
        if (!Number.isInteger(rise * 10) || rise < 0.5) continue;
        if (r.chance(0.5) && Number.isInteger(rise)) {
          return { q: `Sebuah akuarium berbentuk balok dengan alas ${p} cm × ${l} cm berisi air. Sebuah kubus besi berusuk ${s} cm dimasukkan hingga tenggelam seluruhnya (air tidak tumpah). Tinggi permukaan air naik ... cm.`, ans: rise, exp: `Volume air yang terdesak = volume kubus = ${s ** 3} cm³. Kenaikan = ${s ** 3} ÷ (${p} × ${l}) = ${fmt(rise)} cm.`, tip: 'Kenaikan air = volume benda ÷ luas alas wadah.' };
        }
        const h = r.int(2, 9);
        return { q: `Sebuah akuarium berbentuk balok dengan alas ${p} cm × ${l} cm berisi air. Setelah sebuah batu dimasukkan dan tenggelam seluruhnya, permukaan air naik ${h} mm. Volume batu tersebut adalah ... cm³.`, ans: (p * l * h) / 10, exp: `${h} mm = ${fmt(h / 10)} cm. Volume batu = ${p} × ${l} × ${fmt(h / 10)} = ${fmt((p * l * h) / 10)} cm³.`, tip: 'Samakan satuan dulu: mm → cm dibagi 10.' };
      }
    },
  },
  {
    key: 'geo-pythagoras', topic: T, sub: 'Teorema Pythagoras', level: 'Provinsi', diff: 'Sedang', sec: 80,
    make(r) {
      const [a0, b0, c0] = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]]);
      const k = r.int(1, a0 === 3 ? 8 : 3);
      const [a, b, c] = [a0 * k, b0 * k, c0 * k];
      const form = r.int(0, 2);
      if (form === 0) return { q: `Sebuah tangga sepanjang ${c} dm disandarkan pada tembok. Jarak kaki tangga ke tembok ${a} dm. Tinggi ujung atas tangga dari lantai adalah ... dm.`, ans: b, exp: `Tinggi = √(${c}² − ${a}²) = √(${c * c} − ${a * a}) = √${b * b} = ${b} dm.`, tip: `Kenali tripel Pythagoras ${a0}-${b0}-${c0} dan kelipatannya.` };
      if (form === 1) return { q: `Sisi-sisi siku-siku sebuah segitiga panjangnya ${a} cm dan ${b} cm. Keliling segitiga tersebut adalah ... cm.`, ans: a + b + c, exp: `Sisi miring = √(${a * a} + ${b * b}) = √${c * c} = ${c}. Keliling = ${a} + ${b} + ${c} = ${a + b + c} cm.`, tip: 'Cari sisi miring dengan Pythagoras, lalu jumlahkan ketiga sisi.' };
      return { q: `Sebuah persegi panjang memiliki panjang ${b} cm dan diagonal ${c} cm. Luas persegi panjang tersebut adalah ... cm².`, ans: a * b, exp: `Lebar = √(${c * c} − ${b * b}) = ${a}. Luas = ${b} × ${a} = ${a * b} cm².`, tip: 'Diagonal persegi panjang adalah sisi miring segitiga siku-siku.' };
    },
  },
  {
    key: 'geo-persen-luas', topic: T, sub: 'Perubahan Luas (Persen)', level: 'Provinsi', diff: 'HOTS', sec: 90,
    make(r) {
      if (r.chance(0.5)) {
        const p = r.pick([10, 20, 30, 40, 50, 60, 100]);
        const ans = (100 + p) ** 2 / 100 - 100;
        return { q: `Panjang sisi sebuah persegi diperpanjang ${p}%. Luasnya bertambah ... %.`, ans, exp: `Sisi baru = ${(100 + p) / 100} × sisi lama. Luas baru = (${fmt((100 + p) / 100)})² = ${fmt((100 + p) ** 2 / 10000)} × luas lama. Pertambahan = ${fmt(ans)}%.`, tip: 'Luas berubah dengan kuadrat faktor perubahan sisi, BUKAN 2 × persen.' };
      }
      const a = r.pick([10, 20, 25, 50]), b = r.pick([10, 20, 25, 40]);
      const change = ((100 + a) * (100 - b)) / 100 - 100;
      if (change === 0 || !Number.isInteger(change)) throw new Retry();
      return {
        q: `Panjang sebuah persegi panjang ditambah ${a}% dan lebarnya dikurangi ${b}%. Luasnya ${change > 0 ? 'bertambah' : 'berkurang'} ... %.`,
        ans: Math.abs(change),
        exp: `Luas baru = ${fmt((100 + a) / 100)} × ${fmt((100 - b) / 100)} = ${fmt(((100 + a) * (100 - b)) / 10000)} × luas lama, jadi ${change > 0 ? 'bertambah' : 'berkurang'} ${Math.abs(change)}%.`,
        tip: 'Kalikan faktor perubahan masing-masing ukuran.',
      };
    },
  },
  {
    key: 'geo-kardus', topic: T, sub: 'Mengisi Kotak dengan Kotak Kecil', level: 'Provinsi', diff: 'Sedang', sec: 80,
    make(r) {
      const [a, b, c] = [r.int(2, 6), r.int(2, 6), r.int(1, 5)];
      const [x, y, z] = [r.int(2, 6), r.int(2, 6), r.int(2, 6)];
      const ans = x * y * z;
      return {
        q: `Sebuah kardus besar berukuran ${a * x} cm × ${b * y} cm × ${c * z} cm akan diisi kotak sabun berukuran ${a} cm × ${b} cm × ${c} cm dengan posisi yang sama (sejajar sisi kardus). Paling banyak berapa kotak sabun yang dapat dimasukkan?`,
        ans,
        exp: `Sepanjang tiap ukuran muat ${a * x} ÷ ${a} = ${x}, ${b * y} ÷ ${b} = ${y}, dan ${c * z} ÷ ${c} = ${z} kotak. Total ${x} × ${y} × ${z} = ${ans} kotak.`,
        tip: 'Bagi tiap ukuran kardus dengan ukuran kotak yang sejajar, lalu kalikan.',
      };
    },
  },
  {
    key: 'geo-jalan-taman', topic: T, sub: 'Luas Jalan di Taman', level: 'Provinsi', diff: 'Sedang', sec: 90,
    make(r) {
      const p = r.int(15, 60), l = r.int(10, p), w = r.int(1, 4);
      if (r.chance(0.5)) {
        const ans = w * (p + l) - w * w;
        return { q: `Sebuah taman berbentuk persegi panjang ${p} m × ${l} m. Di tengahnya dibuat dua jalan selebar ${w} m yang saling tegak lurus, masing-masing sejajar dengan sisi taman dan memotong dari ujung ke ujung. Luas jalan seluruhnya adalah ... m².`, ans, exp: `Jalan memanjang = ${p} × ${w} = ${p * w}. Jalan melebar = ${l} × ${w} = ${l * w}. Bagian persilangan terhitung dua kali (${w} × ${w} = ${w * w}). Luas = ${p * w} + ${l * w} − ${w * w} = ${ans} m².`, tip: 'Jangan lupa mengurangi petak persilangan yang terhitung dua kali.' };
      }
      const ans = (p + 2 * w) * (l + 2 * w) - p * l;
      return { q: `Sebuah kolam berbentuk persegi panjang ${p} m × ${l} m. Di sekeliling kolam dibuat jalan selebar ${w} m. Luas jalan tersebut adalah ... m².`, ans, exp: `Luas kolam beserta jalan = (${p} + ${2 * w}) × (${l} + ${2 * w}) = ${(p + 2 * w) * (l + 2 * w)}. Dikurangi luas kolam ${p * l}, luas jalan = ${ans} m².`, tip: 'Jalan di sekeliling menambah 2 × lebar jalan pada setiap ukuran.' };
    },
  },
  {
    key: 'geo-kerangka', topic: T, sub: 'Kerangka Bangun Ruang', level: 'Provinsi', diff: 'Sedang', sec: 75,
    make(r) {
      if (r.chance(0.5)) {
        const s = r.int(5, 25), n = r.int(2, 9);
        const extra = r.int(0, 11 * s - 1);
        const L = 12 * s * n + extra;
        return { q: `Seutas kawat panjangnya ${fmt(L)} cm akan dibuat kerangka kubus dengan rusuk ${s} cm. Paling banyak berapa kerangka kubus yang dapat dibuat?`, ans: Math.floor(L / (12 * s)), exp: `Satu kerangka kubus membutuhkan 12 × ${s} = ${12 * s} cm. ${fmt(L)} ÷ ${12 * s} = ${n} sisa ${extra}. Jadi paling banyak ${n} kerangka.`, tip: 'Kubus memiliki 12 rusuk.' };
      }
      const [p, l, t] = [r.int(10, 40), r.int(5, 30), r.int(5, 25)];
      return { q: `Panjang kawat yang diperlukan untuk membuat sebuah kerangka balok berukuran ${p} cm × ${l} cm × ${t} cm adalah ... cm.`, ans: 4 * (p + l + t), exp: `Balok memiliki 4 rusuk panjang, 4 rusuk lebar, dan 4 rusuk tinggi. Kawat = 4 × (${p} + ${l} + ${t}) = ${4 * (p + l + t)} cm.`, tip: 'Kerangka balok = 4 × (p + l + t).' };
    },
  },

  // ============ NASIONAL ============
  {
    key: 'geo-ubin-diagonal', topic: T, sub: 'Diagonal Melewati Petak', level: 'Nasional', diff: 'HOTS', sec: 120,
    make(r) {
      const m = r.int(6, 60), n = r.int(4, 48);
      if (m === n) throw new Retry();
      const ans = m + n - gcd(m, n);
      return {
        q: `Lantai sebuah ruangan berukuran ${m} × ${n} ubin persegi. Sebuah garis lurus ditarik dari satu pojok ruangan ke pojok yang berhadapan. Berapa banyak ubin yang dilalui (dipotong bagian dalamnya) oleh garis tersebut?`,
        ans,
        exp: `Garis melintasi ${m - 1} garis tegak dan ${n - 1} garis mendatar; setiap lintasan masuk ke ubin baru, kecuali saat melewati titik potong garis-garis (terjadi FPB(${m}, ${n}) − 1 = ${gcd(m, n) - 1} kali). Banyak ubin = ${m} + ${n} − FPB(${m}, ${n}) = ${ans}.`,
        tip: 'Rumus: m + n − FPB(m, n).',
      };
    },
  },
  {
    key: 'geo-segitiga-bulat', topic: T, sub: 'Segitiga dengan Sisi Bilangan Bulat', level: 'Nasional', diff: 'HOTS', sec: 140,
    make(r) {
      const P = r.int(9, 40);
      const tri: number[][] = [];
      for (let a = 1; a <= P; a++) for (let b = a; b <= P; b++) {
        const c = P - a - b;
        if (c >= b && a + b > c) tri.push([a, b, c]);
      }
      if (!tri.length) throw new Retry();
      const iso = r.chance(0.3);
      const ans = iso ? tri.filter(([a, b, c]) => a === b || b === c).length : tri.length;
      if (ans === 0) throw new Retry();
      return {
        q: `Banyaknya segitiga ${iso ? 'sama kaki (termasuk sama sisi) ' : ''}berbeda yang panjang ketiga sisinya bilangan asli dan kelilingnya ${P} adalah ...`,
        ans,
        exp: `Misal a ≤ b ≤ c dengan a + b + c = ${P} dan a + b > c (ketaksamaan segitiga), sehingga c < ${P / 2}. Segitiga yang memenuhi: ${tri.filter(([a, b, c]) => !iso || a === b || b === c).map((t) => `(${t.join(', ')})`).join(', ')}. Banyaknya ${ans}.`,
        tip: 'Sisi terpanjang harus kurang dari setengah keliling. Daftar secara teratur dari sisi terpanjang.',
      };
    },
  },
  {
    key: 'geo-persegi-tengah', topic: T, sub: 'Persegi dalam Persegi', level: 'Nasional', diff: 'HOTS', sec: 100,
    make(r) {
      const k = r.int(2, 6);
      const A = 2 ** k * r.int(1, 12) * (r.chance(0.5) ? 25 : 9);
      return {
        q: `Sebuah persegi luasnya ${fmt(A)} cm². Titik-titik tengah keempat sisinya dihubungkan sehingga terbentuk persegi kedua. Dengan cara yang sama dari persegi kedua dibuat persegi ketiga, dan seterusnya. Luas persegi ke-${k + 1} adalah ... cm².`,
        ans: A / 2 ** k,
        exp: `Menghubungkan titik tengah selalu menghasilkan persegi yang luasnya ½ persegi sebelumnya (4 segitiga pojok bisa dilipat ke dalam). Persegi ke-${k + 1} = ${fmt(A)} × (½)${'⁰¹²³⁴⁵⁶⁷⁸⁹'[k]} = ${fmt(A / 2 ** k)} cm².`,
        tip: 'Setiap langkah, luas menjadi setengahnya.',
      };
    },
  },
  {
    key: 'geo-skala-luas', topic: T, sub: 'Skala & Luas Sebenarnya', level: 'Nasional', diff: 'HOTS', sec: 110,
    make(r) {
      const S = r.pick([10000, 20000, 5000, 50000, 2000]);
      const a = r.int(2, 30);
      const m2 = a * (S / 100) ** 2;
      const ha = m2 / 10000;
      if (!Number.isInteger(ha)) throw new Retry();
      return {
        q: `Pada peta berskala 1 : ${fmt(S)}, sebuah kebun digambarkan dengan luas ${a} cm². Luas kebun sebenarnya adalah ... hektare.`,
        ans: ha,
        exp: `1 cm pada peta = ${fmt(S)} cm = ${fmt(S / 100)} m. Jadi 1 cm² pada peta = ${fmt(S / 100)} × ${fmt(S / 100)} = ${fmt((S / 100) ** 2)} m². Luas kebun = ${a} × ${fmt((S / 100) ** 2)} = ${fmt(m2)} m² = ${fmt(ha)} ha (1 ha = 10.000 m²).`,
        tip: 'Skala berlaku untuk panjang. Untuk luas, faktor skalanya dikuadratkan!',
      };
    },
  },
  {
    key: 'geo-jarak-titik-grid', topic: T, sub: 'Luas pada Bidang Berpetak', level: 'Nasional', diff: 'HOTS', sec: 120,
    make(r) {
      const pts = [[0, 0], [r.int(3, 12), r.int(0, 3)], [r.int(1, 10), r.int(4, 12)]];
      const [[x1, y1], [x2, y2], [x3, y3]] = pts;
      const twice = Math.abs(x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2));
      if (twice === 0 || twice % 2) throw new Retry();
      const minX = Math.min(x1, x2, x3), maxX = Math.max(x1, x2, x3), minY = Math.min(y1, y2, y3), maxY = Math.max(y1, y2, y3);
      return {
        q: `Pada kertas berpetak (setiap petak berukuran 1 cm × 1 cm), titik A, B, dan C berturut-turut terletak pada koordinat (${x1}, ${y1}), (${x2}, ${y2}), dan (${x3}, ${y3}). Luas segitiga ABC adalah ... cm².`,
        ans: twice / 2,
        exp: `Buat persegi panjang yang membungkus segitiga: ${maxX - minX} × ${maxY - minY} = ${(maxX - minX) * (maxY - minY)} cm². Kurangi tiga segitiga siku-siku di sekelilingnya. Hasilnya ${twice / 2} cm².`,
        tip: 'Metode "bungkus": luas persegi panjang pembungkus dikurangi segitiga-segitiga siku-siku di pojok.',
      };
    },
  },
  {
    key: 'geo-kubus-rusuk-terpotong', topic: T, sub: 'Bangun Ruang Terpotong', level: 'Nasional', diff: 'HOTS', sec: 110,
    make(r) {
      const n = r.int(3, 9);
      const form = r.int(0, 1);
      if (form === 0) {
        // remove one unit cube from a corner of n×n×n: surface unchanged
        const s = r.int(1, 3);
        const k = r.int(1, n - 1);
        return {
          q: `Sebuah kubus berusuk ${n * s} cm. Dari salah satu pojoknya dipotong (dibuang) sebuah kubus kecil berusuk ${k * s} cm. Luas permukaan bangun yang tersisa adalah ... cm².`,
          ans: 6 * (n * s) ** 2,
          exp: `Tiga persegi kecil yang hilang dari permukaan luar diganti oleh tiga persegi kecil baru di bagian lekukan, dengan luas yang sama. Jadi luas permukaan tetap 6 × ${n * s}² = ${6 * (n * s) ** 2} cm².`,
          tip: 'Memotong kubus di pojok tidak mengubah luas permukaan (mirip keliling bangun datar yang dipotong pojok).',
        };
      }
      if (n % 2 === 0) throw new Retry();
      const ans = 6 * n * n - 2 + 4 * n; // 1x1 tunnel through the centre of a face to the opposite face
      return {
        q: `Sebuah kubus ${n} × ${n} × ${n} tersusun dari kubus satuan berusuk 1 cm. Sebuah lubang berpenampang persegi 1 cm × 1 cm dibuat tembus lurus dari tengah satu sisi ke tengah sisi di hadapannya (kubus-kubus satuan yang dilalui dibuang). Luas permukaan bangun itu (termasuk dinding lubang) adalah ... cm².`,
        ans,
        exp: `Permukaan luar mula-mula 6 × ${n}² = ${6 * n * n}. Dua lubang di permukaan mengurangi 2 cm². Dinding lubang menambah 4 × ${n} = ${4 * n} cm². Total ${6 * n * n} − 2 + ${4 * n} = ${ans} cm².`,
        tip: 'Hitung yang hilang (mulut lubang) dan yang bertambah (dinding lubang).',
      };
    },
  },
];

