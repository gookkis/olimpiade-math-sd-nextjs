// Generators that fill the gaps of the "Lomba Matematika SD" kisi-kisi
// (operasi hitung pecahan, bangun ruang, diagram & statistik). Answers are computed in code.
import { Generator, Retry, gcd, lcm, fmt, rp, sum, NAMA, NAMA_L, NAMA_P, HARI } from './core';

const BIL = 'Bilangan & Aritmatika' as const;
const GEO = 'Geometri & Pengukuran' as const;

// ---------- fraction helpers ----------
type Q = [number, number]; // numerator, denominator (denominator > 0)
const norm = ([p, q]: Q): Q => {
  const g = gcd(Math.abs(p), Math.abs(q)) || 1;
  return q < 0 ? [-p / g, -q / g] : [p / g, q / g];
};
const add = (a: Q, b: Q): Q => norm([a[0] * b[1] + b[0] * a[1], a[1] * b[1]]);
const subQ = (a: Q, b: Q): Q => add(a, [-b[0], b[1]]);
const mul = (a: Q, b: Q): Q => norm([a[0] * b[0], a[1] * b[1]]);
const div = (a: Q, b: Q): Q => norm([a[0] * b[1], a[1] * b[0]]);
/** "2 3/4", "3/4" or "5" (positive values only). */
function mixed(x: Q): string {
  const [p, q] = norm(x);
  if (p <= 0) throw new Retry();
  if (q === 1) return `${p}`;
  const w = Math.floor(p / q);
  return w === 0 ? `${p}/${q}` : `${w} ${p - w * q}/${q}`;
}
const mixedOrNull = (x: Q) => {
  try {
    return mixed(x);
  } catch {
    return null;
  }
};
const showMixed = (w: number, n: number, d: number) => (w ? `${w} ${n}/${d}` : `${n}/${d}`);

/** Unicode bar for text diagrams. */
const bar = (n: number, ch = '█') => ch.repeat(n);
const padEnd = (s: string, n: number) => s + ' '.repeat(Math.max(0, n - s.length));

export const lomba: Generator[] = [
  // ================= OPERASI HITUNG PECAHAN & PERSEN =================
  {
    key: 'pec-jumlah-campuran', topic: BIL, sub: 'Penjumlahan & Pengurangan Pecahan Campuran', level: 'Kabupaten/Kota', diff: 'Mudah', sec: 60,
    make(r) {
      const dens = [2, 3, 4, 5, 6, 8, 10, 12];
      const d1 = r.pick(dens), d2 = r.pick(dens);
      if (d1 === d2 || lcm(d1, d2) > 24) throw new Retry();
      const n1 = r.int(1, d1 - 1), n2 = r.int(1, d2 - 1);
      if (gcd(n1, d1) !== 1 || gcd(n2, d2) !== 1) throw new Retry();
      const w1 = r.int(1, 6), w2 = r.int(1, 5);
      const A: Q = [w1 * d1 + n1, d1], B: Q = [w2 * d2 + n2, d2];
      const minus = r.chance(0.5);
      if (minus && A[0] / A[1] <= B[0] / B[1]) throw new Retry();
      const res = minus ? subQ(A, B) : add(A, B);
      const ans = mixed(res);
      const L = lcm(d1, d2);
      // Typical mistake: operate on numerators and denominators separately.
      const naive = minus
        ? d1 === d2 ? null : mixedOrNull(add([w1 - w2, 1], [Math.abs(n1 - n2), Math.abs(d1 - d2)]))
        : mixedOrNull(add([w1 + w2, 1], [n1 + n2, d1 + d2]));
      const wrong = [
        naive,
        mixedOrNull(add(res, [1, 1])),
        mixedOrNull(subQ(res, [1, 1])),
        mixedOrNull(add(res, [1, L])),
        mixedOrNull(subQ(res, [1, L])),
        mixedOrNull(add(res, [1, 2])),
      ].filter((x): x is string => !!x && x !== ans);
      return {
        q: `Hasil dari ${showMixed(w1, n1, d1)} ${minus ? '−' : '+'} ${showMixed(w2, n2, d2)} adalah ...`,
        ans,
        wrong,
        exp: `Samakan penyebut menjadi KPK(${d1}, ${d2}) = ${L}. Ubah ke pecahan biasa: ${showMixed(w1, n1, d1)} = ${A[0] * (L / d1)}/${L} dan ${showMixed(w2, n2, d2)} = ${B[0] * (L / d2)}/${L}. ${minus ? 'Selisihnya' : 'Jumlahnya'} = ${minus ? A[0] * (L / d1) - B[0] * (L / d2) : A[0] * (L / d1) + B[0] * (L / d2)}/${L} = ${ans}.`,
        tip: 'Bisa juga hitung bilangan bulat dan pecahannya terpisah, lalu gabungkan. Jangan menjumlahkan penyebut!',
      };
    },
  },
  {
    key: 'pec-kali-bagi', topic: BIL, sub: 'Perkalian & Pembagian Pecahan', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 75,
    make(r) {
      const d1 = r.pick([2, 3, 4, 5]), n1 = r.int(1, d1 - 1), w1 = r.int(1, 3);
      const d2 = r.pick([3, 4, 5, 6, 7, 8, 9]), n2 = r.int(1, d2 - 1);
      const d3 = r.pick([2, 3, 4, 5, 6, 8]), n3 = r.int(1, d3 - 1);
      if (gcd(n1, d1) !== 1 || gcd(n2, d2) !== 1 || gcd(n3, d3) !== 1 || n2 * d3 === n3 * d2) throw new Retry();
      const A: Q = [w1 * d1 + n1, d1], B: Q = [n2, d2], C: Q = [n3, d3];
      const res = div(mul(A, B), C);
      if (res[1] > 12 || res[0] > 80) throw new Retry();
      const ans = mixed(res);
      const wrong = [
        mixedOrNull(mul(mul(A, B), C)), // multiplied instead of divided
        mixedOrNull(div(mul([w1 * n1, d1], B), C)), // mixed number converted wrongly
        mixedOrNull(div(C, mul(A, B))), // flipped the wrong fraction
        mixedOrNull(add(res, [1, 1])),
        mixedOrNull(add(res, [1, res[1] === 1 ? 2 : res[1]])),
      ].filter((x): x is string => !!x && x !== ans);
      return {
        q: `Hasil dari ${showMixed(w1, n1, d1)} × ${n2}/${d2} : ${n3}/${d3} adalah ...`,
        ans,
        wrong,
        exp: `Ubah pecahan campuran: ${showMixed(w1, n1, d1)} = ${A[0]}/${d1}. Membagi dengan ${n3}/${d3} sama dengan mengalikan kebalikannya ${d3}/${n3}. Jadi ${A[0]}/${d1} × ${n2}/${d2} × ${d3}/${n3} = ${A[0] * n2 * d3}/${d1 * d2 * n3} = ${ans}.`,
        tip: 'Bagi pecahan = kali kebalikan. Sederhanakan (coret) pembilang dan penyebut sebelum mengalikan supaya angkanya kecil.',
      };
    },
  },
  {
    key: 'pec-desimal-persen', topic: BIL, sub: 'Operasi Campuran Pecahan, Desimal & Persen', level: 'Kabupaten/Kota', diff: 'Mudah', sec: 60,
    make(r) {
      const [n, d] = r.pick([[1, 2], [1, 4], [3, 4], [2, 5], [3, 5], [4, 5], [1, 8], [3, 8], [5, 8], [7, 10], [9, 20], [7, 20], [6, 25]] as Q[]);
      const fracK = (n * 1000) / d; // in thousandths
      const decK = r.int(1, 19) * 50; // 0,05 .. 0,95
      const pct = r.pick([5, 10, 15, 20, 25, 30, 35, 40, 45, 60, 75]);
      const pctK = pct * 10;
      const form = r.int(0, 1);
      const totK = form === 0 ? fracK + decK - pctK : fracK - decK + pctK;
      if (totK <= 0) throw new Retry();
      const v = (k: number) => k / 1000;
      const ans = v(totK);
      const wrongSign = form === 0 ? fracK + decK + pctK : fracK + decK + pctK;
      return {
        q: form === 0
          ? `Hasil dari ${n}/${d} + ${fmt(v(decK))} − ${pct}% adalah ...`
          : `Hasil dari ${n}/${d} − ${fmt(v(decK))} + ${pct}% adalah ...`,
        ans,
        wrong: [v(wrongSign), v(totK + 100), v(Math.abs(totK - 100)) || v(totK + 200), v(totK + 50), v(totK + pctK * 9)],
        exp: `Ubah semuanya ke desimal: ${n}/${d} = ${fmt(v(fracK))}, ${pct}% = ${fmt(v(pctK))}. Maka ${form === 0 ? `${fmt(v(fracK))} + ${fmt(v(decK))} − ${fmt(v(pctK))}` : `${fmt(v(fracK))} − ${fmt(v(decK))} + ${fmt(v(pctK))}`} = ${fmt(ans)}.`,
        tip: 'Ubah semua ke bentuk yang sama (desimal paling cepat). Persen berarti dibagi 100: 35% = 0,35.',
      };
    },
  },
  {
    key: 'pec-persen-cerita', topic: BIL, sub: 'Pecahan & Persen dalam Soal Cerita', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 80,
    make(r) {
      const N = r.pick([40, 60, 80, 120, 160, 200, 240, 300, 360, 400]);
      const p = r.pick([10, 15, 20, 25, 30, 35, 40, 45, 50, 60]);
      const A = (N * p) / 100;
      if (!Number.isInteger(A)) throw new Retry();
      const rest = N - A;
      const [fn, fd] = r.pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [1, 5], [3, 8], [5, 8]] as Q[]);
      const B = (rest * fn) / fd;
      if (!Number.isInteger(B) || B === 0) throw new Retry();
      const Cc = rest - B;
      if (Cc <= 0) throw new Retry();
      const sekolah = r.pick(['SD Harapan', 'SD Cendekia', 'SD Al-Falah', 'SD Nusantara']);
      const [ka, kb, kc] = r.sample(['pramuka', 'futsal', 'tari', 'robotik', 'menggambar', 'tahfiz', 'catur', 'renang'], 3);
      const naive = N - A - (N * fn) / fd;
      return {
        q: `Siswa kelas 5 ${sekolah} ada ${N} anak. Sebanyak ${p}% siswa mengikuti ekstrakurikuler ${ka}, ${fn}/${fd} dari sisanya mengikuti ${kb}, dan sisanya mengikuti ${kc}. Berapa banyak siswa yang mengikuti ${kc}?`,
        ans: Cc,
        wrong: [Number.isInteger(naive) && naive > 0 ? naive : Cc + 10, B, A, Cc + A, rest],
        exp: `${ka[0].toUpperCase() + ka.slice(1)}: ${p}% × ${N} = ${A} siswa. Sisanya ${N} − ${A} = ${rest} siswa. ${kb[0].toUpperCase() + kb.slice(1)}: ${fn}/${fd} × ${rest} = ${B} siswa. Jadi ${kc}: ${rest} − ${B} = ${Cc} siswa.`,
        tip: 'Perhatikan kata "dari sisanya": pecahan dihitung dari sisa, bukan dari jumlah awal.',
      };
    },
  },
  {
    key: 'pec-harga-awal', topic: BIL, sub: 'Persen: Diskon, Untung & Rugi', level: 'Provinsi', diff: 'Sedang', sec: 90,
    make(r) {
      const form = r.int(0, 2);
      if (form === 0) {
        const d = r.pick([10, 15, 20, 25, 30, 40]);
        const awal = r.int(4, 40) * 5000;
        const akhir = (awal * (100 - d)) / 100;
        if (!Number.isInteger(akhir)) throw new Retry();
        const barang = r.pick(['sepatu', 'tas sekolah', 'jaket', 'sepeda mini', 'kotak pensil']);
        return {
          q: `Sebuah ${barang} dijual dengan diskon ${d}%. ${r.pick(NAMA)} membayar ${rp(akhir)}. Berapa rupiah harga ${barang} sebelum diskon?`,
          ans: awal, prefix: 'Rp',
          wrong: [Math.round(akhir * (100 + d) / 100), akhir + d * 1000, awal + 5000],
          exp: `Harga setelah diskon = ${100 - d}% × harga awal. Harga awal = ${rp(akhir)} × 100/${100 - d} = ${rp(awal)}.`,
          tip: `Jangan menambah ${d}% dari harga bayar! Harga bayar itu ${100 - d}% dari harga awal.`,
        };
      }
      if (form === 1) {
        const up = r.pick([10, 20, 25, 50]);
        const down = r.pick([10, 20, 25, 40]);
        const awal = r.int(2, 20) * 10000;
        const akhir = (awal * (100 + up) * (100 - down)) / 10000;
        if (!Number.isInteger(akhir) || akhir === awal) throw new Retry();
        return {
          q: `Harga sebuah barang semula ${rp(awal)}. Harga itu naik ${up}%, kemudian harga barunya turun ${down}%. Berapa rupiah harga barang sekarang?`,
          ans: akhir, prefix: 'Rp',
          wrong: [(awal * (100 + up - down)) / 100, awal, akhir + 1000],
          exp: `Setelah naik ${up}%: ${rp(awal)} × ${100 + up}/100 = ${rp((awal * (100 + up)) / 100)}. Setelah turun ${down}%: × ${100 - down}/100 = ${rp(akhir)}.`,
          tip: 'Persen kedua dihitung dari harga baru, bukan dari harga awal. Jadi naik-turun tidak bisa langsung dijumlahkan.',
        };
      }
      const beli = r.int(5, 40) * 10000;
      const untung = r.pick([10, 15, 20, 25, 30, 40]);
      const jual = (beli * (100 + untung)) / 100;
      if (!Number.isInteger(jual)) throw new Retry();
      return {
        q: `Pak ${r.pick(NAMA_L)} menjual sepeda dengan harga ${rp(jual)} dan mendapat untung ${untung}% dari harga beli. Berapa rupiah harga beli sepeda itu?`,
        ans: beli, prefix: 'Rp',
        wrong: [(jual * (100 - untung)) / 100, jual - untung * 1000, beli + 10000],
        exp: `Harga jual = ${100 + untung}% × harga beli. Harga beli = ${rp(jual)} × 100/${100 + untung} = ${rp(beli)}.`,
        tip: 'Persen untung/rugi selalu dihitung dari harga BELI.',
      };
    },
  },
  {
    key: 'pec-perkalian-berantai', topic: BIL, sub: 'Operasi Hitung Pecahan Berantai', level: 'Provinsi', diff: 'Sedang', sec: 80,
    make(r) {
      const plus = r.chance(0.5);
      const n = r.int(6, 30);
      if (plus) {
        // (1 + 1/2)(1 + 1/3)...(1 + 1/n) = (n+1)/2
        const k = r.int(1, 12) * 2;
        const ans = ((n + 1) * k) / 2;
        return {
          q: `Hasil dari ${k} × (1 + 1/2) × (1 + 1/3) × (1 + 1/4) × ... × (1 + 1/${n}) adalah ...`,
          ans,
          wrong: [ans + k / 2, (n * k) / 2, ans - k / 2],
          exp: `Setiap kurung: 1 + 1/m = (m+1)/m, sehingga hasil kali = 3/2 × 4/3 × 5/4 × ... × ${n + 1}/${n}. Pembilang dan penyebut saling mencoret, tersisa ${n + 1}/2. Jadi ${k} × ${n + 1}/2 = ${ans}.`,
          tip: 'Tulis beberapa suku pertama sebagai pecahan biasa — pola "coret-coretan" langsung terlihat.',
        };
      }
      // (1 - 1/2)(1 - 1/3)...(1 - 1/n) = 1/n
      const k = n * r.int(2, 15);
      const ans = k / n;
      return {
        q: `Hasil dari ${k} × (1 − 1/2) × (1 − 1/3) × (1 − 1/4) × ... × (1 − 1/${n}) adalah ...`,
        ans,
        wrong: [k / n + 1, k / (n - 1) === Math.floor(k / (n - 1)) ? k / (n - 1) : ans * 2, ans * 2],
        exp: `Setiap kurung: 1 − 1/m = (m−1)/m, sehingga hasil kali = 1/2 × 2/3 × 3/4 × ... × ${n - 1}/${n} = 1/${n}. Jadi ${k} × 1/${n} = ${ans}.`,
        tip: 'Pembilang tiap pecahan mencoret penyebut pecahan sebelumnya (teleskopik).',
      };
    },
  },
  {
    key: 'pec-pecahan-bagian', topic: BIL, sub: 'Pecahan Senilai & Bagian dari Keseluruhan', level: 'Provinsi', diff: 'HOTS', sec: 110,
    make(r) {
      // a/b of the water is drunk, then c/d of the rest; X liters remain -> initial?
      const [a, b] = r.pick([[1, 3], [1, 4], [2, 5], [1, 5], [3, 8], [1, 6], [2, 7]] as Q[]);
      const [c, d] = r.pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5]] as Q[]);
      const unit = b * d;
      const total = unit * r.int(1, 6) * (r.chance(0.5) ? 2 : 1);
      const after1 = (total * (b - a)) / b;
      const after2 = (after1 * (d - c)) / d;
      if (!Number.isInteger(after2) || after2 <= 0 || total > 400) throw new Retry();
      const nama = r.pick(NAMA_P);
      return {
        q: `${nama} memiliki sejumlah kelereng. Sebanyak ${a}/${b} bagian diberikan kepada adiknya, lalu ${c}/${d} dari sisanya diberikan kepada temannya. Ternyata kelereng ${nama} tinggal ${after2} butir. Berapa banyak kelereng ${nama} mula-mula?`,
        ans: total,
        wrong: [total + after2, Math.round(after2 * (1 + a / b + c / d)), total - unit],
        exp: `Setelah diberi ke adik tersisa ${b - a}/${b}. Setelah diberi ke teman tersisa ${d - c}/${d} × ${b - a}/${b} = ${(b - a) * (d - c)}/${b * d} bagian. Jadi ${(b - a) * (d - c)}/${b * d} × mula-mula = ${after2}, sehingga mula-mula = ${after2} × ${b * d}/${(b - a) * (d - c)} = ${total}.`,
        tip: `Bekerja mundur: ${after2} butir adalah bagian sisa terakhir. Kalikan dengan kebalikan pecahan sisanya satu per satu.`,
      };
    },
  },

  // ================= KELILING & LUAS BANGUN DATAR =================
  {
    key: 'bd-gabungan', topic: GEO, sub: 'Keliling & Luas Bangun Gabungan', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 90,
    make(r) {
      const form = r.int(0, 2);
      if (form === 0) {
        // L-shape: W×H rectangle with a×b removed from one corner
        const W = r.int(10, 30), H = r.int(8, 24);
        const a = r.int(3, W - 4), b = r.int(3, H - 3);
        const askLuas = r.chance(0.5);
        const L = W * H - a * b, K = 2 * (W + H);
        return {
          q: `Sebuah taman berbentuk huruf L diperoleh dari persegi panjang berukuran ${W} m × ${H} m yang salah satu pojoknya dipotong berbentuk persegi panjang berukuran ${a} m × ${b} m. ${askLuas ? 'Berapa m² luas taman itu?' : 'Berapa meter keliling taman itu?'}`,
          ans: askLuas ? L : K, unit: askLuas ? 'm²' : 'm',
          wrong: askLuas ? [W * H, L - a * b, K, W * H + a * b] : [K - 2 * a, K - a - b, K + 2 * (a + b), L],
          exp: askLuas
            ? `Luas = luas persegi panjang besar − luas potongan = ${W} × ${H} − ${a} × ${b} = ${W * H} − ${a * b} = ${L} m².`
            : `Memotong pojok tidak mengubah keliling: sisi-sisi yang "masuk" sama panjang dengan sisi yang hilang. Keliling = 2 × (${W} + ${H}) = ${K} m.`,
          tip: askLuas ? 'Luas bangun L = persegi panjang besar dikurangi potongannya.' : 'Pojok yang dipotong berbentuk persegi panjang tidak mengubah keliling!',
        };
      }
      // rectangle p × d with a half circle on one side d (π = 22/7)
      const d = r.pick([14, 28, 42]);
      const p = r.int(5, 30);
      const rad = d / 2;
      const halfL = (22 * rad * rad) / 7 / 2;
      const halfK = (22 * d) / 7 / 2;
      if (form === 1) {
        const L = p * d + halfL;
        return {
          q: `Sebuah bangun terdiri atas persegi panjang berukuran ${p} cm × ${d} cm dan setengah lingkaran yang menempel pada sisi ${d} cm. Luas bangun tersebut adalah ... (π = 22/7)`,
          ans: L, unit: 'cm²',
          wrong: [p * d + halfL * 2, p * d + halfK, p * d + (22 * d * d) / 7 / 2, L - halfL / 2],
          exp: `Luas persegi panjang = ${p} × ${d} = ${p * d} cm². Setengah lingkaran berjari-jari ${rad} cm: ½ × 22/7 × ${rad} × ${rad} = ${halfL} cm². Total = ${L} cm².`,
          tip: 'Jari-jari = setengah dari sisi tempat setengah lingkaran menempel.',
        };
      }
      const K = 2 * p + d + halfK;
      return {
        q: `Sebuah bangun terdiri atas persegi panjang berukuran ${p} cm × ${d} cm dan setengah lingkaran yang menempel pada salah satu sisi ${d} cm. Keliling bangun tersebut adalah ... (π = 22/7)`,
        ans: K, unit: 'cm',
        wrong: [2 * p + 2 * d + halfK, 2 * p + d + halfK * 2, 2 * (p + d), K + d],
        exp: `Keliling = 2 sisi panjang + 1 sisi lebar + busur setengah lingkaran = ${p} + ${p} + ${d} + ½ × 22/7 × ${d} = ${2 * p + d} + ${halfK} = ${K} cm. Sisi tempat menempel tidak dihitung.`,
        tip: 'Sisi yang tertutup (tempat setengah lingkaran menempel) bukan bagian keliling.',
      };
    },
  },
  {
    key: 'bd-ubin-lantai', topic: GEO, sub: 'Luas: Menutup Lantai dengan Ubin', level: 'Kabupaten/Kota', diff: 'Mudah', sec: 60,
    make(r) {
      const s = r.pick([20, 25, 30, 40, 50]);
      const p = s * r.int(8, 25), l = s * r.int(6, 20);
      const n = (p / s) * (l / s);
      const harga = r.pick([5000, 7500, 10000, 12000, 15000]);
      const askCost = r.chance(0.4);
      const P = p / 100, Lm = l / 100;
      return {
        q: `Lantai sebuah kamar berukuran ${fmt(P)} m × ${fmt(Lm)} m akan ditutup ubin persegi berukuran ${s} cm × ${s} cm. ${askCost ? `Jika harga satu ubin ${rp(harga)}, berapa biaya membeli ubin tersebut?` : 'Berapa banyak ubin yang diperlukan?'}`,
        ans: askCost ? n * harga : n, prefix: askCost ? 'Rp' : undefined, unit: askCost ? undefined : 'buah',
        wrong: askCost ? [n * harga + harga * 10, (n / 2) * harga, (2 * (p + l) / s) * harga] : [(2 * (p + l)) / s, n * 2, n + p / s],
        exp: `Ubin sepanjang ${fmt(P)} m = ${p} ÷ ${s} = ${p / s} buah, sepanjang ${fmt(Lm)} m = ${l} ÷ ${s} = ${l / s} buah. Banyak ubin = ${p / s} × ${l / s} = ${n}.${askCost ? ` Biaya = ${n} × ${rp(harga)} = ${rp(n * harga)}.` : ''}`,
        tip: 'Ubah ke satuan yang sama (cm) dulu, lalu hitung berapa ubin per baris dan per kolom.',
      };
    },
  },

  // ================= BANGUN RUANG SEDERHANA =================
  {
    key: 'br-luas-permukaan', topic: GEO, sub: 'Luas Permukaan Kubus & Balok', level: 'Kabupaten/Kota', diff: 'Mudah', sec: 60,
    make(r) {
      if (r.chance(0.4)) {
        const s = r.int(3, 20);
        return {
          q: `Sebuah kubus memiliki panjang rusuk ${s} cm. Luas permukaan kubus tersebut adalah ...`,
          ans: 6 * s * s, unit: 'cm²',
          wrong: [s ** 3, 4 * s * s, 12 * s, 6 * s],
          exp: `Kubus memiliki 6 sisi persegi. Luas permukaan = 6 × ${s} × ${s} = ${6 * s * s} cm².`,
          tip: 'Luas permukaan kubus = 6 × s². Volume = s³. Jangan tertukar!',
        };
      }
      const p = r.int(5, 25), l = r.int(3, 15), t = r.int(2, 12);
      if (p === l || l === t || p === t) throw new Retry();
      const LP = 2 * (p * l + p * t + l * t);
      const tanpaTutup = r.chance(0.35);
      const ans = tanpaTutup ? LP - p * l : LP;
      return {
        q: tanpaTutup
          ? `Sebuah kotak berbentuk balok tanpa tutup berukuran panjang ${p} cm, lebar ${l} cm, dan tinggi ${t} cm. Luas karton yang diperlukan untuk membuat kotak itu adalah ...`
          : `Sebuah balok berukuran panjang ${p} cm, lebar ${l} cm, dan tinggi ${t} cm. Luas permukaan balok tersebut adalah ...`,
        ans, unit: 'cm²',
        wrong: [LP / 2, p * l * t, tanpaTutup ? LP : LP - p * l, 4 * (p + l + t)],
        exp: `Luas permukaan = 2 × (p×l + p×t + l×t) = 2 × (${p * l} + ${p * t} + ${l * t}) = ${LP} cm².${tanpaTutup ? ` Tanpa tutup, kurangi satu sisi atas ${p} × ${l} = ${p * l}: ${LP} − ${p * l} = ${ans} cm².` : ''}`,
        tip: 'Balok punya 3 pasang sisi yang sama. Kotak tanpa tutup = luas permukaan − 1 alas.',
      };
    },
  },
  {
    key: 'br-tabung', topic: GEO, sub: 'Volume Tabung & Kerucut', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 75,
    make(r) {
      const rad = 7 * r.int(1, 3);
      const kerucut = r.chance(0.35);
      const t = kerucut ? 3 * r.int(2, 10) : r.int(5, 30);
      const base = (22 * rad * rad) / 7;
      const V = kerucut ? (base * t) / 3 : base * t;
      const liter = !kerucut && r.chance(0.3) && V % 1000 === 0;
      return {
        q: kerucut
          ? `Sebuah kerucut memiliki jari-jari alas ${rad} cm dan tinggi ${t} cm. Volume kerucut tersebut adalah ... (π = 22/7)`
          : `Sebuah drum berbentuk tabung memiliki diameter ${2 * rad} cm dan tinggi ${t} cm. Volume drum tersebut adalah ... (π = 22/7)`,
        ans: liter ? V / 1000 : V, unit: liter ? 'liter' : 'cm³',
        wrong: liter ? [V / 100, (V * 4) / 1000, V / 2000] : kerucut ? [base * t, (base * t) / 2, ((22 * 2 * rad) / 7) * t] : [base * 4 * t, ((22 * 2 * rad) / 7) * t, base * (t + 1), (base * t) / 2],
        exp: kerucut
          ? `V kerucut = ⅓ × π × r² × t = ⅓ × 22/7 × ${rad} × ${rad} × ${t} = ⅓ × ${base} × ${t} = ${V} cm³.`
          : `Jari-jari = ${2 * rad} ÷ 2 = ${rad} cm. V = π × r² × t = 22/7 × ${rad} × ${rad} × ${t} = ${base} × ${t} = ${V} cm³${liter ? ` = ${V / 1000} liter (1 liter = 1.000 cm³)` : ''}.`,
        tip: kerucut ? 'Volume kerucut = ⅓ volume tabung dengan alas dan tinggi yang sama.' : 'Perhatikan: yang diketahui diameter, jadi bagi 2 dulu untuk mendapat jari-jari.',
      };
    },
  },
  {
    key: 'br-volume-balik', topic: GEO, sub: 'Volume Kubus & Balok (Mencari Ukuran)', level: 'Provinsi', diff: 'Sedang', sec: 80,
    make(r) {
      const form = r.int(0, 2);
      if (form === 0) {
        const s = r.int(4, 25);
        return {
          q: `Sebuah bak mandi berbentuk kubus dapat menampung air sebanyak ${fmt(s ** 3)} liter jika penuh. Berapa dm panjang rusuk bagian dalam bak mandi itu?`,
          ans: s, unit: 'dm', wrong: [s * s, s + 1, 3 * s],
          exp: `1 liter = 1 dm³, jadi volume = ${fmt(s ** 3)} dm³. Rusuk = ∛${fmt(s ** 3)} = ${s} dm, karena ${s} × ${s} × ${s} = ${fmt(s ** 3)}.`,
          tip: 'Hafalkan bilangan kubik 1³ sampai 20³ — sering keluar di lomba.',
        };
      }
      if (form === 1) {
        const p = r.int(8, 40), l = r.int(5, 25), t = r.int(4, 20);
        return {
          q: `Sebuah akuarium berbentuk balok bervolume ${fmt(p * l * t)} cm³. Panjangnya ${p} cm dan lebarnya ${l} cm. Berapa cm tinggi akuarium tersebut?`,
          ans: t, unit: 'cm', wrong: [t + 2, Math.round((p * l * t) / (p + l)), p * l],
          exp: `t = V ÷ (p × l) = ${fmt(p * l * t)} ÷ (${p} × ${l}) = ${fmt(p * l * t)} ÷ ${p * l} = ${t} cm.`,
          tip: 'Volume balok = luas alas × tinggi, jadi tinggi = volume ÷ luas alas.',
        };
      }
      const p = r.int(5, 15) * 2, l = r.int(4, 12) * 2, t = r.int(3, 10) * 2;
      const [a, b] = r.pick([[1, 2], [1, 4], [3, 4], [2, 5], [3, 5], [1, 3], [2, 3]] as Q[]);
      const V = p * l * t;
      const isi = (V * a) / b;
      const tambah = V - isi;
      if (!Number.isInteger(tambah)) throw new Retry();
      return {
        q: `Sebuah bak air berbentuk balok berukuran ${p} dm × ${l} dm × ${t} dm baru terisi ${a}/${b} bagian. Berapa liter air yang harus ditambahkan agar bak terisi penuh?`,
        ans: tambah, unit: 'liter', wrong: [isi, V, tambah + p * l],
        exp: `Volume bak = ${p} × ${l} × ${t} = ${fmt(V)} dm³ = ${fmt(V)} liter. Sudah terisi ${a}/${b} × ${fmt(V)} = ${fmt(isi)} liter. Kekurangan = ${fmt(V)} − ${fmt(isi)} = ${fmt(tambah)} liter.`,
        tip: `Bagian yang kosong = 1 − ${a}/${b} = ${b - a}/${b}. Langsung hitung ${b - a}/${b} × volume.`,
      };
    },
  },
  {
    key: 'br-kubus-satuan', topic: GEO, sub: 'Menghitung Kubus Satuan', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 75,
    make(r) {
      const form = r.int(0, 1);
      if (form === 0) {
        const S = r.int(4, 8), s = r.int(2, 3);
        if (S % s !== 0 && r.chance(0.5)) throw new Retry();
        const k = Math.floor(S / s) ** 3;
        return {
          q: `Sebuah kardus berbentuk kubus dengan panjang rusuk bagian dalam ${S * 10} cm. Berapa banyak kubus kecil berusuk ${s * 10} cm yang dapat dimasukkan ke dalam kardus itu paling banyak (tanpa dipotong)?`,
          ans: k, unit: 'buah', wrong: [Math.round((S / s) ** 3), Math.floor(S / s) ** 2, Math.floor((S * S * S) / (s * s * s)) + 1],
          exp: `Sepanjang satu rusuk muat ${S * 10} ÷ ${s * 10} = ${Math.floor(S / s)} kubus${S % s ? ` (dibulatkan ke bawah karena sisa ${(S % s) * 10} cm tidak cukup)` : ''}. Banyak kubus = ${Math.floor(S / s)} × ${Math.floor(S / s)} × ${Math.floor(S / s)} = ${k}.`,
          tip: 'Hitung per rusuk lalu kalikan. Jika ada sisa, bulatkan ke bawah — membagi volume bisa menipu!',
        };
      }
      const a = r.int(2, 5), b = r.int(2, 5), c = r.int(2, 5);
      const n = a * b * c;
      const hilang = r.int(1, Math.min(6, n - 1));
      return {
        q: `Sebuah balok disusun dari kubus-kubus kecil sebanyak ${a} kubus memanjang, ${b} kubus melebar, dan ${c} kubus ke atas. Jika ${hilang} kubus kecil diambil, berapa kubus kecil yang tersisa?`,
        ans: n - hilang, unit: 'buah', wrong: [n, a + b + c - hilang, n - 2 * hilang + 1 === n - hilang ? n + hilang : n - 2 * hilang + 1],
        exp: `Banyak kubus = ${a} × ${b} × ${c} = ${n}. Setelah diambil ${hilang}: ${n} − ${hilang} = ${n - hilang} kubus.`,
        tip: 'Banyak kubus satuan pada balok = panjang × lebar × tinggi (dalam satuan kubus).',
      };
    },
  },

  // ================= RATA-RATA, MEDIAN, MODUS & DIAGRAM =================
  {
    key: 'stat-diagram-gambar', topic: BIL, sub: 'Membaca Diagram Gambar (Piktogram)', level: 'Kabupaten/Kota', diff: 'Mudah', sec: 60,
    make(r) {
      const k = r.pick([2, 4, 5, 10]);
      const days = HARI.slice(1, 6);
      const icons = days.map(() => r.int(2, 9));
      const vals = icons.map((i) => i * k);
      const maxV = Math.max(...vals), minV = Math.min(...vals);
      if (vals.filter((v) => v === maxV).length > 1 || vals.filter((v) => v === minV).length > 1) throw new Retry();
      const obj = r.pick([{ n: 'buku yang dipinjam di perpustakaan', u: 'buku' }, { n: 'botol plastik yang dikumpulkan kelas 5', u: 'botol' }, { n: 'roti yang terjual di kantin', u: 'roti' }]);
      const chart = days.map((d, i) => `${padEnd(d, 7)}: ${'■ '.repeat(icons[i]).trim()}`).join('\n');
      const form = r.int(0, 2);
      const head = `Diagram gambar banyak ${obj.n} selama 5 hari:\n\n${chart}\n\nKeterangan: ■ = ${k} ${obj.u}\n\n`;
      if (form === 0) {
        return {
          q: `${head}Berapa ${obj.u} jumlah seluruhnya selama 5 hari?`,
          ans: sum(vals), unit: obj.u, wrong: [sum(icons), sum(vals) + k, sum(vals) - k * 2],
          exp: `Jumlah gambar = ${icons.join(' + ')} = ${sum(icons)}. Karena 1 gambar = ${k} ${obj.u}, jumlahnya ${sum(icons)} × ${k} = ${sum(vals)} ${obj.u}.`,
          tip: 'Jumlahkan dulu banyak gambarnya, baru kalikan sekali dengan nilai satu gambar.',
        };
      }
      if (form === 1) {
        return {
          q: `${head}Berapa selisih antara hari terbanyak dan hari paling sedikit?`,
          ans: maxV - minV, unit: obj.u, wrong: [Math.max(...icons) - Math.min(...icons), maxV, maxV + minV],
          exp: `Terbanyak: hari ${days[vals.indexOf(maxV)]} = ${maxV / k} × ${k} = ${maxV}. Paling sedikit: hari ${days[vals.indexOf(minV)]} = ${minV / k} × ${k} = ${minV}. Selisih = ${maxV} − ${minV} = ${maxV - minV} ${obj.u}.`,
          tip: 'Jangan lupa mengalikan banyak gambar dengan keterangannya.',
        };
      }
      if (sum(vals) % 5 !== 0) throw new Retry();
      const mean = sum(vals) / 5;
      return {
        q: `${head}Rata-rata banyak ${obj.u} per hari adalah ...`,
        ans: mean, unit: obj.u, wrong: [sum(icons) / 5, mean + k, vals[2]],
        exp: `Jumlah = (${icons.join(' + ')}) × ${k} = ${sum(vals)}. Rata-rata = ${sum(vals)} ÷ 5 = ${fmt(mean)} ${obj.u}.`,
        tip: 'Rata-rata = jumlah data ÷ banyak data.',
      };
    },
  },
  {
    key: 'stat-diagram-batang', topic: BIL, sub: 'Membaca Diagram Batang', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 75,
    make(r) {
      const labels = r.pick([
        { t: 'Banyak siswa yang menyukai buah', xs: ['Apel', 'Jeruk', 'Mangga', 'Pisang', 'Salak'] },
        { t: 'Hasil panen padi (kuintal) per tahun', xs: ['2021', '2022', '2023', '2024', '2025'] },
        { t: 'Banyak pengunjung taman baca per bulan', xs: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei'] },
      ]);
      const step = r.pick([2, 5, 10]);
      const vals = labels.xs.map(() => step * r.int(2, 12));
      if (new Set(vals).size < vals.length) throw new Retry();
      const w = Math.max(...labels.xs.map((x) => x.length));
      const chart = labels.xs.map((x, i) => `${padEnd(x, w)} | ${bar(vals[i] / step)} ${vals[i]}`).join('\n');
      const head = `${labels.t} ditunjukkan diagram batang berikut (panjang batang sebanding dengan nilainya):\n\n${chart}\n\n`;
      const form = r.int(0, 2);
      if (form === 0) {
        const s = [...vals].sort((a, b) => a - b);
        const med = s[2];
        return {
          q: `${head}Median data tersebut adalah ...`,
          ans: med, wrong: [vals[2], sum(vals) / 5 === Math.floor(sum(vals) / 5) ? sum(vals) / 5 : med + step, s[3], s[1]],
          exp: `Urutkan nilainya: ${s.join(', ')}. Data ke-3 (tengah) adalah ${med}.`,
          tip: 'Median diambil setelah data diurutkan, bukan batang yang ada di tengah gambar.',
        };
      }
      if (form === 1) {
        const i = r.int(1, 4);
        const pct = ((vals[i] - vals[i - 1]) / vals[i - 1]) * 100;
        if (!Number.isInteger(pct) || pct <= 0) throw new Retry();
        return {
          q: `${head}Berapa persen kenaikan dari ${labels.xs[i - 1]} ke ${labels.xs[i]}?`,
          ans: pct, unit: '%', wrong: [vals[i] - vals[i - 1], Math.round(((vals[i] - vals[i - 1]) / vals[i]) * 100), pct + 10],
          exp: `Kenaikan = ${vals[i]} − ${vals[i - 1]} = ${vals[i] - vals[i - 1]}. Persen kenaikan = ${vals[i] - vals[i - 1]} ÷ ${vals[i - 1]} × 100% = ${pct}%.`,
          tip: 'Persen kenaikan dibandingkan dengan nilai AWAL (sebelum naik).',
        };
      }
      const tot = sum(vals);
      const i = r.int(0, 4);
      const pct = (vals[i] / tot) * 100;
      if (!Number.isInteger(pct)) throw new Retry();
      return {
        q: `${head}Berapa persen bagian ${labels.xs[i]} dari jumlah seluruhnya?`,
        ans: pct, unit: '%', wrong: [vals[i], pct + 5, Math.round((vals[i] / Math.max(...vals)) * 100)],
        exp: `Jumlah seluruh = ${vals.join(' + ')} = ${tot}. Bagian ${labels.xs[i]} = ${vals[i]} ÷ ${tot} × 100% = ${pct}%.`,
        tip: 'Persen bagian = nilai bagian ÷ jumlah semua × 100%.',
      };
    },
  },
  {
    key: 'stat-diagram-lingkaran', topic: BIL, sub: 'Diagram Lingkaran', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 90,
    make(r) {
      const N = r.pick([120, 180, 240, 360, 480, 600, 720]);
      const cats = r.sample(['Sepak bola', 'Bulu tangkis', 'Renang', 'Basket', 'Voli', 'Catur', 'Panahan'], 4);
      const deg1 = r.pick([30, 45, 60, 72, 90, 108, 120]);
      const pct2 = r.pick([10, 15, 20, 25, 30, 40]);
      const deg3 = r.pick([36, 45, 54, 60, 90]);
      const deg2 = (pct2 * 360) / 100;
      const deg4 = 360 - deg1 - deg2 - deg3;
      if (deg4 <= 20) throw new Retry();
      const cnt = (d: number) => (N * d) / 360;
      if (![deg1, deg2, deg3, deg4].every((d) => Number.isInteger(cnt(d)))) throw new Retry();
      const ans = cnt(deg4);
      return {
        q: `Diagram lingkaran berikut menunjukkan olahraga kegemaran ${N} siswa:\n• ${cats[0]}: ${deg1}°\n• ${cats[1]}: ${pct2}%\n• ${cats[2]}: ${deg3}°\n• ${cats[3]}: sisanya\n\nBerapa banyak siswa yang gemar ${cats[3]}?`,
        ans, unit: 'siswa',
        wrong: [deg4, N - cnt(deg1) - pct2 - cnt(deg3), cnt(360 - deg1 - deg3) - ans > 0 ? cnt(360 - deg1 - deg3) : ans + 10, ans + cnt(deg3)],
        exp: `${pct2}% = ${pct2}/100 × 360° = ${deg2}°. Sudut ${cats[3]} = 360° − ${deg1}° − ${deg2}° − ${deg3}° = ${deg4}°. Banyak siswa = ${deg4}/360 × ${N} = ${ans} siswa.`,
        tip: 'Satu lingkaran penuh = 360° = 100%. Ubah semua ke derajat (atau semua ke persen) dulu.',
      };
    },
  },
  {
    key: 'stat-rata-gabungan', topic: BIL, sub: 'Rata-rata Gabungan', level: 'Provinsi', diff: 'Sedang', sec: 90,
    make(r) {
      const n1 = r.int(10, 30), n2 = r.int(10, 30);
      const m1 = r.int(60, 90), m2 = r.int(60, 90);
      if (m1 === m2) throw new Retry();
      const tot = n1 * m1 + n2 * m2;
      if (tot % (n1 + n2) !== 0) throw new Retry();
      const mg = tot / (n1 + n2);
      const [ka, kb] = r.pick([['5A', '5B'], ['putra', 'putri'], ['pagi', 'siang']]);
      const askB = r.chance(0.5);
      return {
        q: askB
          ? `Rata-rata nilai ${n1} siswa kelas ${ka} adalah ${m1}. Jika digabung dengan ${n2} siswa kelas ${kb}, rata-rata nilai seluruhnya menjadi ${mg}. Berapakah rata-rata nilai siswa kelas ${kb}?`
          : `Rata-rata nilai ${n1} siswa kelas ${ka} adalah ${m1}, sedangkan rata-rata nilai ${n2} siswa kelas ${kb} adalah ${m2}. Berapakah rata-rata nilai gabungan kedua kelas?`,
        ans: askB ? m2 : mg,
        wrong: askB ? [2 * mg - m1, m2 + 2, mg] : [(m1 + m2) / 2 === Math.floor((m1 + m2) / 2) ? (m1 + m2) / 2 : mg + 1, mg + 2, Math.max(m1, m2)],
        exp: askB
          ? `Jumlah nilai seluruh = ${n1 + n2} × ${mg} = ${tot}. Jumlah nilai kelas ${ka} = ${n1} × ${m1} = ${n1 * m1}. Kelas ${kb}: ${tot} − ${n1 * m1} = ${n2 * m2}, rata-rata = ${n2 * m2} ÷ ${n2} = ${m2}.`
          : `Jumlah nilai = ${n1} × ${m1} + ${n2} × ${m2} = ${n1 * m1} + ${n2 * m2} = ${tot}. Rata-rata gabungan = ${tot} ÷ ${n1 + n2} = ${mg}.`,
        tip: 'Rata-rata gabungan BUKAN rata-rata dari dua rata-rata (kecuali banyak siswanya sama). Selalu lewat jumlah nilai.',
      };
    },
  },
  {
    key: 'stat-median-tabel', topic: BIL, sub: 'Median & Modus dari Tabel Frekuensi', level: 'Provinsi', diff: 'Sedang', sec: 90,
    make(r) {
      const nilai = [5, 6, 7, 8, 9, 10];
      const f = nilai.map(() => r.int(1, 9));
      const n = sum(f);
      const sorted: number[] = [];
      nilai.forEach((v, i) => { for (let k = 0; k < f[i]; k++) sorted.push(v); });
      const med = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
      const maxF = Math.max(...f);
      if (f.filter((x) => x === maxF).length > 1) throw new Retry();
      const modus = nilai[f.indexOf(maxF)];
      if (!Number.isInteger(med)) throw new Retry();
      const table = nilai.map((v, i) => `• Nilai ${v}: ${f[i]} siswa`).join('\n');
      const form = r.int(0, 1);
      if (form === 0) {
        return {
          q: `Tabel nilai ulangan matematika suatu kelas:\n\n${table}\n\nBerapakah hasil penjumlahan median dan modus data tersebut?`,
          ans: med + modus, wrong: [med + maxF, modus * 2, med * 2],
          exp: `Banyak data = ${n}. ${n % 2 ? `Median = data ke-${(n + 1) / 2}` : `Median = rata-rata data ke-${n / 2} dan ke-${n / 2 + 1}`} = ${med}. Modus = nilai dengan frekuensi terbesar (${maxF}) = ${modus}. Jumlah = ${med} + ${modus} = ${med + modus}.`,
          tip: 'Untuk median dari tabel, hitung frekuensi kumulatif sampai melewati posisi tengah.',
        };
      }
      const above = sum(nilai.map((v, i) => (v > med ? f[i] : 0)));
      return {
        q: `Tabel nilai ulangan matematika suatu kelas:\n\n${table}\n\nSiswa yang nilainya lebih dari median mendapat hadiah. Berapa banyak siswa yang mendapat hadiah?`,
        ans: above, wrong: [n - above, above + f[nilai.indexOf(med)], Math.floor(n / 2)],
        exp: `Banyak data = ${n}, median = ${med}. Siswa dengan nilai lebih dari ${med}: ${nilai.filter((v) => v > med).map((v) => `${f[nilai.indexOf(v)]} (nilai ${v})`).join(' + ') || '0'} = ${above} siswa.`,
        tip: 'Cari median dulu dari posisi tengah, lalu jumlahkan frekuensi nilai di atasnya.',
      };
    },
  },
  {
    key: 'stat-data-hilang-diagram', topic: BIL, sub: 'Rata-rata dari Diagram (Data Hilang)', level: 'Provinsi', diff: 'HOTS', sec: 100,
    make(r) {
      const step = r.pick([5, 10]);
      const days = HARI.slice(1, 7);
      const vals = days.map(() => step * r.int(3, 12));
      const hidden = r.int(0, 5);
      const mean = sum(vals) / 6;
      if (!Number.isInteger(mean)) throw new Retry();
      const chart = days.map((d, i) => `${padEnd(d, 7)}| ${i === hidden ? '?' : `${bar(vals[i] / step)} ${vals[i]}`}`).join('\n');
      const toko = r.pick(['Toko Kue Bu ' + r.pick(NAMA_P), 'Koperasi sekolah', 'Warung buah Pak ' + r.pick(NAMA_L)]);
      return {
        q: `Diagram batang penjualan ${toko} selama 6 hari (dalam bungkus). Batang hari ${days[hidden]} terkena tumpahan tinta:\n\n${chart}\n\nJika rata-rata penjualan selama 6 hari adalah ${mean} bungkus, berapa bungkus penjualan pada hari ${days[hidden]}?`,
        ans: vals[hidden], unit: 'bungkus',
        wrong: [mean, 6 * mean - sum(vals) + vals[hidden] + step, Math.round((sum(vals) - vals[hidden]) / 5)],
        exp: `Jumlah penjualan 6 hari = 6 × ${mean} = ${6 * mean}. Jumlah 5 hari yang terlihat = ${vals.filter((_, i) => i !== hidden).join(' + ')} = ${sum(vals) - vals[hidden]}. Hari ${days[hidden]} = ${6 * mean} − ${sum(vals) - vals[hidden]} = ${vals[hidden]} bungkus.`,
        tip: 'Rata-rata × banyak hari = total. Total dikurangi yang terlihat = yang hilang.',
      };
    },
  },
];
