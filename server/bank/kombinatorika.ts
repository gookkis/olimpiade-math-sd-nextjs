import { Generator, Retry, C, fact, frac, reduced, range, sum, permutations, digitSum, isPrime, NAMA, fmt } from './core';

const T = 'Kombinatorika & Peluang' as const;

const dice = () => range(1, 6).flatMap((a) => range(1, 6).map((b) => [a, b] as [number, number]));

export const kombinatorika: Generator[] = [
  // ============ KABUPATEN/KOTA ============
  {
    key: 'kom-pakaian', topic: T, sub: 'Aturan Perkalian', level: 'Kabupaten/Kota', diff: 'Mudah', sec: 40,
    make(r) {
      const [a, b, c] = [r.int(2, 7), r.int(2, 6), r.int(2, 5)];
      const nm = r.pick(NAMA);
      const three = r.chance(0.6);
      return {
        q: `${nm} memiliki ${a} kemeja, ${b} celana${three ? `, dan ${c} pasang sepatu` : ''} yang berbeda. Berapa banyak pasangan pakaian berbeda yang dapat dipakai ${nm}${three ? ' (kemeja, celana, dan sepatu)' : ' (kemeja dan celana)'}?`,
        ans: three ? a * b * c : a * b, wrong: three ? [a + b + c, a * b + c, a * b] : [a + b, a * b + 1, 2 * (a + b)],
        exp: `Setiap pilihan kemeja dapat dipasangkan dengan setiap celana${three ? ' dan setiap sepatu' : ''}: ${three ? `${a} × ${b} × ${c} = ${a * b * c}` : `${a} × ${b} = ${a * b}`}.`,
        tip: 'Kata "dan" (memilih semuanya) → kalikan.',
      };
    },
  },
  {
    key: 'kom-jabat-tangan', topic: T, sub: 'Jabat Tangan', level: 'Kabupaten/Kota', diff: 'Mudah', sec: 45,
    make(r) {
      const n = r.int(6, 40);
      const H = (n * (n - 1)) / 2;
      if (r.chance(0.6)) return { q: `Dalam sebuah pertemuan hadir ${n} orang. Setiap orang berjabat tangan tepat satu kali dengan setiap orang lainnya. Banyak jabat tangan yang terjadi adalah ...`, ans: H, wrong: [n * (n - 1), H + n, n * n], exp: `Setiap orang berjabat tangan dengan ${n - 1} orang. ${n} × ${n - 1} = ${n * (n - 1)}, tetapi setiap jabat tangan terhitung dua kali, jadi ${H}.`, tip: 'Jabat tangan n orang = n(n − 1)/2.' };
      return { q: `Dalam sebuah acara, setiap peserta berjabat tangan tepat satu kali dengan setiap peserta lainnya. Jika terjadi ${H} jabat tangan, banyak peserta adalah ...`, ans: n, wrong: [n - 1, n + 1, Math.round(Math.sqrt(H))], exp: `n(n − 1)/2 = ${H} → n(n − 1) = ${2 * H} = ${n} × ${n - 1}. Jadi n = ${n}.`, tip: 'Kalikan 2, lalu cari dua bilangan berurutan yang hasil kalinya cocok.' };
    },
  },
  {
    key: 'kom-turnamen', topic: T, sub: 'Banyak Pertandingan', level: 'Kabupaten/Kota', diff: 'Mudah', sec: 50,
    make(r) {
      const n = r.int(5, 20);
      const form = r.int(0, 2);
      if (form === 0) return { q: `Sebanyak ${n} tim mengikuti kompetisi sepak bola. Setiap tim bertanding satu kali melawan setiap tim lain. Banyak pertandingan seluruhnya adalah ...`, ans: (n * (n - 1)) / 2, wrong: [n * (n - 1), n - 1, n * 2], exp: `Sistem setengah kompetisi: C(${n}, 2) = ${n} × ${n - 1} ÷ 2 = ${(n * (n - 1)) / 2}.`, tip: 'Sama dengan masalah jabat tangan.' };
      if (form === 1) return { q: `Sebanyak ${n} tim mengikuti kompetisi dengan sistem kandang-tandang: setiap dua tim bertemu dua kali. Banyak pertandingan seluruhnya adalah ...`, ans: n * (n - 1), wrong: [(n * (n - 1)) / 2, n * n, 2 * n], exp: `Setiap pasangan tim bertanding dua kali: 2 × C(${n}, 2) = ${n * (n - 1)}.`, tip: 'Kandang-tandang = 2 × jabat tangan.' };
      const N = r.pick([8, 16, 32, 12, 20, 24, 64, 25, 30]);
      return { q: `Turnamen bulu tangkis diikuti ${N} pemain dengan sistem gugur (yang kalah langsung tersingkir, tidak ada pertandingan perebutan juara 3). Berapa banyak pertandingan sampai juara diperoleh?`, ans: N - 1, wrong: [N / 2, N, Math.log2(N) % 1 === 0 ? Math.log2(N) : N - 2], exp: `Setiap pertandingan menyingkirkan tepat 1 pemain. Agar tersisa 1 juara, ${N - 1} pemain harus tersingkir, jadi ada ${N - 1} pertandingan.`, tip: 'Sistem gugur: banyak pertandingan = banyak peserta − 1.' };
    },
  },
  {
    key: 'kom-peluang-dadu', topic: T, sub: 'Peluang Dua Dadu', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 70,
    make(r) {
      const all = dice();
      const conds = [
        (() => { const k = r.int(3, 11); return { d: `berjumlah ${k}`, f: ([a, b]: number[]) => a + b === k }; })(),
        { d: 'bermata sama (kembar)', f: ([a, b]: number[]) => a === b },
        (() => { const k = r.int(7, 10); return { d: `berjumlah lebih dari ${k}`, f: ([a, b]: number[]) => a + b > k }; })(),
        { d: 'berjumlah bilangan prima', f: ([a, b]: number[]) => isPrime(a + b) },
        (() => { const k = r.int(1, 3); return { d: `selisihnya ${k}`, f: ([a, b]: number[]) => Math.abs(a - b) === k }; })(),
      ];
      const c = r.pick(conds);
      const n = all.filter(c.f).length;
      return {
        q: `Dua buah dadu dilempar bersamaan satu kali. Peluang muncul mata dadu yang ${c.d} adalah ...`,
        ans: frac(n, 36), wrong: [frac(n + 1, 36), frac(Math.max(1, n - 1), 36), frac(n, 12), frac(n, 6)],
        exp: `Ruang sampel 6 × 6 = 36. Pasangan yang ${c.d}: ${all.filter(c.f).map(([a, b]) => `(${a},${b})`).join(', ')} — ada ${n}. Peluang = ${n}/36 = ${frac(n, 36)}.`,
        tip: 'Buat tabel 6 × 6; (2,3) dan (3,2) dihitung sebagai dua kejadian berbeda.',
      };
    },
  },
  {
    key: 'kom-peluang-kelereng', topic: T, sub: 'Peluang Kejadian Sederhana', level: 'Kabupaten/Kota', diff: 'Mudah', sec: 45,
    make(r) {
      const [m, b, h] = [r.int(2, 12), r.int(2, 12), r.int(1, 10)];
      const tot = m + b + h;
      const not = r.chance(0.4);
      const nm = r.pick(NAMA);
      const ans = not ? frac(tot - b, tot) : frac(m, tot);
      return {
        q: `Dalam sebuah kantong terdapat ${m} kelereng merah, ${b} kelereng biru, dan ${h} kelereng hijau. ${nm} mengambil satu kelereng secara acak. Peluang terambil kelereng ${not ? 'yang BUKAN biru' : 'merah'} adalah ...`,
        ans, wrong: not ? [frac(b, tot), frac(tot - b, b), frac(m, tot)] : [frac(m, m + b), frac(1, 3), frac(b, tot), frac(m, tot - m)],
        exp: not ? `Kelereng bukan biru = ${m} + ${h} = ${tot - b} dari ${tot}. Peluang = ${frac(tot - b, tot)}.` : `Peluang = banyak merah ÷ seluruh kelereng = ${m}/${tot} = ${ans}.`,
        tip: 'Peluang = banyak kejadian yang diinginkan ÷ banyak semua kemungkinan. Sederhanakan pecahannya.',
      };
    },
  },
  {
    key: 'kom-susun-angka', topic: T, sub: 'Menyusun Bilangan dari Angka', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 80,
    make(r) {
      const hasZero = r.chance(0.5);
      const digits = r.sample(range(1, 9), hasZero ? 4 : 5).sort((a, b) => a - b);
      if (hasZero) digits.unshift(0);
      const cond = r.pick([
        { d: '', f: (_: number) => true },
        { d: 'genap ', f: (n: number) => n % 2 === 0 },
        { d: 'ganjil ', f: (n: number) => n % 2 === 1 },
        { d: 'lebih dari 500 ', f: (n: number) => n > 500 },
      ]);
      const nums = new Set<number>();
      for (const a of digits) for (const b of digits) for (const c of digits) {
        if (a === 0 || a === b || b === c || a === c) continue;
        const v = a * 100 + b * 10 + c;
        if (cond.f(v)) nums.add(v);
      }
      if (nums.size === 0) throw new Retry();
      return {
        q: `Dari angka-angka ${digits.join(', ')} akan dibuat bilangan tiga angka ${cond.d}dengan angka-angka yang berbeda (tidak boleh berulang). Banyak bilangan yang dapat dibuat adalah ...`,
        ans: nums.size, wrong: [nums.size + digits.length, digits.length ** 3, Math.round(nums.size / 2), nums.size - 2],
        exp: `Isi posisi yang paling bersyarat lebih dulu${hasZero ? ' (ratusan tidak boleh 0)' : ''}${cond.d ? ` (syarat ${cond.d.trim()})` : ''}, lalu posisi lainnya dengan angka yang tersisa. Banyaknya ${nums.size}.`,
        tip: 'Mulai dari tempat yang punya syarat (satuan untuk genap/ganjil, ratusan untuk "> 500" atau angka 0).',
      };
    },
  },
  {
    key: 'kom-pilih-tim', topic: T, sub: 'Kombinasi & Permutasi Sederhana', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 60,
    make(r) {
      const n = r.int(4, 10);
      const form = r.int(0, 2);
      if (form === 0) {
        const k = r.int(2, Math.min(4, n - 1));
        return { q: `Dari ${n} siswa akan dipilih ${k} orang untuk mewakili sekolah dalam lomba cerdas cermat (tanpa jabatan). Banyak cara memilih adalah ...`, ans: C(n, k), wrong: [C(n, k) * fact(k), n * k, C(n, k) + n], exp: `Urutan tidak penting, jadi pakai kombinasi C(${n}, ${k}) = ${C(n, k)}.`, tip: 'Tanpa jabatan/urutan → kombinasi.' };
      }
      if (form === 1) return { q: `Dari ${n} siswa akan dipilih seorang ketua dan seorang wakil ketua kelas. Banyak cara memilih adalah ...`, ans: n * (n - 1), wrong: [C(n, 2), n * n, 2 * n], exp: `Ketua: ${n} pilihan; wakil: ${n - 1} pilihan. Total ${n} × ${n - 1} = ${n * (n - 1)}.`, tip: 'Ada jabatan berbeda → urutan penting → permutasi.' };
      return { q: `Dari ${n} pelari, akan ditentukan juara 1, juara 2, dan juara 3. Banyak susunan juara yang mungkin adalah ...`, ans: n * (n - 1) * (n - 2), wrong: [C(n, 3), n * 3, n ** 3], exp: `${n} × ${n - 1} × ${n - 2} = ${n * (n - 1) * (n - 2)} (urutan juara berbeda dihitung berbeda).`, tip: 'Juara 1, 2, 3 berbeda → permutasi P(n, 3).' };
    },
  },
  {
    key: 'kom-rute-kota', topic: T, sub: 'Rute Perjalanan', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 70,
    make(r) {
      const a = r.int(2, 5), b = r.int(2, 5);
      if (r.chance(0.5)) {
        const ans = a * b * (a - 1) * (b - 1);
        return { q: `Dari kota A ke kota B ada ${a} jalan, dan dari kota B ke kota C ada ${b} jalan. Seseorang pergi dari A ke C melalui B, lalu pulang kembali ke A melalui B tanpa melewati jalan yang sama dengan saat berangkat. Banyak rute pulang-pergi yang mungkin adalah ...`, ans, wrong: [a * b * a * b, a * b * 2, (a * b) ** 2 - 1], exp: `Berangkat: ${a} × ${b} = ${a * b}. Pulang (jalan yang dipakai berangkat tidak boleh dipakai): ${b - 1} × ${a - 1} = ${(a - 1) * (b - 1)}. Total ${a * b} × ${(a - 1) * (b - 1)} = ${ans}.`, tip: 'Pisahkan perjalanan berangkat dan pulang, lalu kalikan.' };
      }
      const d = r.int(1, 4);
      return { q: `Dari kota A ke kota B ada ${a} jalan, dari kota B ke kota C ada ${b} jalan, dan ada ${d} jalan langsung dari A ke C tanpa melalui B. Banyak cara bepergian dari A ke C adalah ...`, ans: a * b + d, wrong: [a * b * d, a + b + d, a * b], exp: `Melalui B: ${a} × ${b} = ${a * b}. Langsung: ${d}. Total (pilih salah satu) ${a * b} + ${d} = ${a * b + d}.`, tip: '"Atau" (pilihan terpisah) → jumlahkan; "lalu" (berurutan) → kalikan.' };
    },
  },
  {
    key: 'kom-pigeonhole', topic: T, sub: 'Prinsip Sarang Merpati', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 75,
    make(r) {
      const cols = r.sample(['merah', 'biru', 'hijau', 'kuning', 'putih', 'hitam'], r.int(3, 5));
      const cnt = cols.map(() => r.int(4, 12));
      const form = r.int(0, 3);
      const list = cols.map((c, i) => `${cnt[i]} kaos kaki ${c}`).join(', ');
      if (form === 0) return { q: `Dalam laci yang gelap terdapat ${list}. Berapa kaos kaki paling sedikit yang harus diambil (tanpa melihat) agar PASTI mendapatkan sepasang kaos kaki berwarna sama?`, ans: cols.length + 1, wrong: [2, cols.length, sum(cnt) / 2 | 0], exp: `Kemungkinan terburuk: ${cols.length} kaos kaki pertama berbeda warna semua. Kaos kaki berikutnya pasti sama dengan salah satunya. Jadi ${cols.length} + 1 = ${cols.length + 1}.`, tip: 'Pikirkan kemungkinan paling sial, lalu tambah 1.' };
      if (form === 1) {
        const k = r.int(3, Math.min(...cnt));
        return { q: `Dalam laci yang gelap terdapat ${list}. Berapa kaos kaki paling sedikit yang harus diambil agar PASTI mendapatkan ${k} kaos kaki berwarna sama?`, ans: cols.length * (k - 1) + 1, wrong: [cols.length * k, k + cols.length, cols.length * (k - 1)], exp: `Terburuk: setiap warna terambil ${k - 1} buah = ${cols.length} × ${k - 1} = ${cols.length * (k - 1)}. Satu lagi pasti membuat salah satu warna menjadi ${k}. Jawab ${cols.length * (k - 1) + 1}.`, tip: 'Rumus: (banyak warna) × (k − 1) + 1, asalkan setiap warna punya cukup kaos kaki.' };
      }
      if (form === 2) {
        const i = r.int(0, cols.length - 1);
        const ans = sum(cnt) - cnt[i] + 2;
        return { q: `Dalam laci yang gelap terdapat ${list}. Berapa kaos kaki paling sedikit yang harus diambil agar PASTI mendapatkan 2 kaos kaki berwarna ${cols[i]}?`, ans, wrong: [cols.length + 1, ans - 1, cnt[i] + 2], exp: `Terburuk: semua kaos kaki selain ${cols[i]} terambil dulu (${sum(cnt) - cnt[i]} buah), baru 2 kaos kaki ${cols[i]}. Total ${ans}.`, tip: 'Untuk warna tertentu, habiskan dulu semua warna lain dalam skenario terburuk.' };
      }
      const ans = sum(cnt) - Math.min(...cnt) + 1;
      return { q: `Dalam laci yang gelap terdapat ${list}. Berapa kaos kaki paling sedikit yang harus diambil agar PASTI mendapatkan setiap warna paling sedikit satu?`, ans, wrong: [cols.length, sum(cnt) - Math.max(...cnt) + 1, ans - 1], exp: `Terburuk: warna yang paling sedikit (${Math.min(...cnt)} buah) belum terambil, sementara semua warna lain sudah habis: ${sum(cnt) - Math.min(...cnt)} buah. Ambil satu lagi. Total ${ans}.`, tip: 'Sisakan warna dengan jumlah paling sedikit dalam skenario terburuk.' };
    },
  },
  {
    key: 'kom-koin', topic: T, sub: 'Peluang Pelemparan Koin', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 60,
    make(r) {
      const n = r.int(2, 5);
      const tot = 2 ** n;
      if (r.chance(0.5)) {
        const k = r.int(0, n);
        return { q: `${n} keping uang logam dilempar bersamaan. Peluang muncul tepat ${k} sisi gambar adalah ...`, ans: frac(C(n, k), tot), wrong: [frac(1, n + 1), frac(k, n), frac(C(n, k) + 1, tot), frac(1, tot)], exp: `Banyak hasil = 2${'⁰¹²³⁴⁵'[n]} = ${tot}. Tepat ${k} gambar: C(${n}, ${k}) = ${C(n, k)}. Peluang = ${C(n, k)}/${tot} = ${frac(C(n, k), tot)}.`, tip: 'Banyak susunan tepat k gambar dari n koin = C(n, k).' };
      }
      return { q: `${n} keping uang logam dilempar bersamaan. Peluang muncul paling sedikit satu sisi angka adalah ...`, ans: frac(tot - 1, tot), wrong: [frac(1, tot), frac(n, tot), frac(1, 2)], exp: `Komplemen dari "paling sedikit satu angka" adalah "semua gambar" (1 kemungkinan). Peluang = 1 − 1/${tot} = ${frac(tot - 1, tot)}.`, tip: '"Paling sedikit satu" → hitung 1 − peluang "tidak ada sama sekali".' };
    },
  },
  {
    key: 'kom-venn', topic: T, sub: 'Diagram Venn', level: 'Kabupaten/Kota', diff: 'Sedang', sec: 70,
    make(r) {
      const both = r.int(2, 12), onlyA = r.int(3, 20), onlyB = r.int(3, 20), none = r.int(0, 8);
      const tot = both + onlyA + onlyB + none;
      const [A, B] = r.pick([['matematika', 'IPA'], ['sepak bola', 'bulu tangkis'], ['membaca', 'menggambar'], ['futsal', 'renang']]);
      const ask = r.int(0, 2);
      const base = `Dari ${tot} siswa, ${onlyA + both} siswa menyukai ${A}, ${onlyB + both} siswa menyukai ${B}`;
      if (ask === 0) return { q: `${base}, dan ${none} siswa tidak menyukai keduanya. Banyak siswa yang menyukai keduanya adalah ...`, ans: both, wrong: [both + none, onlyA, tot - onlyA - onlyB], exp: `Yang menyukai minimal satu = ${tot} − ${none} = ${tot - none}. Keduanya = ${onlyA + both} + ${onlyB + both} − ${tot - none} = ${both}.`, tip: 'n(A ∩ B) = n(A) + n(B) − n(A ∪ B).' };
      if (ask === 1) return { q: `${base}, dan ${both} siswa menyukai keduanya. Banyak siswa yang tidak menyukai keduanya adalah ...`, ans: none, wrong: [none + both, tot - onlyA - onlyB, Math.max(0, none - both)], exp: `Minimal satu = ${onlyA + both} + ${onlyB + both} − ${both} = ${tot - none}. Tidak keduanya = ${tot} − ${tot - none} = ${none}.`, tip: 'Hitung gabungannya dulu, lalu kurangkan dari total.' };
      return { q: `${base}, dan ${both} siswa menyukai keduanya. Banyak siswa yang HANYA menyukai ${A} adalah ...`, ans: onlyA, wrong: [onlyA + both, onlyB, onlyA - both > 0 ? onlyA - both : onlyA + 2], exp: `Hanya ${A} = ${onlyA + both} − ${both} = ${onlyA}.`, tip: 'Kurangi irisan dari himpunannya.' };
    },
  },

  // ============ PROVINSI ============
  {
    key: 'kom-foto-berjajar', topic: T, sub: 'Permutasi dengan Syarat', level: 'Provinsi', diff: 'Sedang', sec: 90,
    make(r) {
      const n = r.int(4, 7);
      const names = r.sample(NAMA, n);
      const [x, y] = names;
      const perms = permutations(range(0, n - 1));
      const form = r.int(0, 2);
      if (form === 0) {
        const cnt = perms.filter((p) => Math.abs(p.indexOf(0) - p.indexOf(1)) === 1).length;
        return { q: `${n} anak (${names.join(', ')}) akan berfoto berjajar dalam satu baris. Jika ${x} dan ${y} harus selalu berdampingan, banyak susunan yang mungkin adalah ...`, ans: cnt, exp: `Anggap ${x} dan ${y} satu kesatuan: ada ${n - 1} "objek" → ${n - 1}! = ${fact(n - 1)} susunan. ${x}–${y} bisa bertukar tempat (2 cara). Total ${fact(n - 1)} × 2 = ${cnt}.`, tip: 'Gabungkan yang harus berdampingan menjadi satu blok, lalu kalikan dengan susunan di dalam blok.' };
      }
      if (form === 1) {
        const cnt = perms.filter((p) => Math.abs(p.indexOf(0) - p.indexOf(1)) !== 1).length;
        return { q: `${n} anak (${names.join(', ')}) akan berfoto berjajar dalam satu baris. Jika ${x} dan ${y} TIDAK boleh berdampingan, banyak susunan yang mungkin adalah ...`, ans: cnt, exp: `Semua susunan ${n}! = ${fact(n)}. Yang berdampingan: 2 × ${n - 1}! = ${2 * fact(n - 1)}. Tidak berdampingan = ${fact(n)} − ${2 * fact(n - 1)} = ${cnt}.`, tip: 'Hitung semua dikurangi yang dilarang.' };
      }
      const cnt = perms.filter((p) => (p[0] === 0 && p[n - 1] === 1) || (p[0] === 1 && p[n - 1] === 0)).length;
      return { q: `${n} anak (${names.join(', ')}) akan berfoto berjajar dalam satu baris. Jika ${x} dan ${y} harus berada di kedua ujung barisan, banyak susunan yang mungkin adalah ...`, ans: cnt, exp: `${x} dan ${y} di ujung dapat bertukar (2 cara). ${n - 2} anak lainnya di tengah: ${n - 2}! = ${fact(n - 2)}. Total ${cnt}.`, tip: 'Tempatkan yang bersyarat lebih dulu.' };
    },
  },
  {
    key: 'kom-rute-grid', topic: T, sub: 'Lintasan Terpendek pada Petak', level: 'Provinsi', diff: 'Sedang', sec: 100,
    make(r) {
      const m = r.int(2, 7), n = r.int(2, 6);
      const form = r.int(0, 2);
      if (form === 0) return { q: `Jalan-jalan di sebuah kota membentuk petak ${m} blok ke timur dan ${n} blok ke utara. Berapa banyak lintasan terpendek dari pojok barat daya ke pojok timur laut (hanya bergerak ke timur atau ke utara)?`, ans: C(m + n, m), exp: `Setiap lintasan terdiri dari ${m} langkah timur dan ${n} langkah utara dalam urutan apa pun: C(${m + n}, ${m}) = ${C(m + n, m)}.`, tip: 'Atau isi angka di setiap titik: jumlah dari titik kiri + titik bawah (segitiga Pascal).' };
      const px = r.int(1, m - 1), py = r.int(1, n - 1);
      const via = C(px + py, px) * C(m - px + n - py, m - px);
      if (form === 1) return { q: `Jalan-jalan di sebuah kota membentuk petak ${m} blok ke timur dan ${n} blok ke utara. Berapa banyak lintasan terpendek dari pojok barat daya ke pojok timur laut yang HARUS melewati persimpangan yang berjarak ${px} blok ke timur dan ${py} blok ke utara dari titik awal?`, ans: via, exp: `Awal → persimpangan: C(${px + py}, ${px}) = ${C(px + py, px)}. Persimpangan → akhir: C(${m - px + n - py}, ${m - px}) = ${C(m - px + n - py, m - px)}. Total ${via}.`, tip: 'Pecah menjadi dua perjalanan dan kalikan.' };
      return { q: `Jalan-jalan di sebuah kota membentuk petak ${m} blok ke timur dan ${n} blok ke utara. Persimpangan yang berjarak ${px} blok ke timur dan ${py} blok ke utara dari titik awal sedang ditutup. Berapa banyak lintasan terpendek dari pojok barat daya ke pojok timur laut yang TIDAK melewati persimpangan itu?`, ans: C(m + n, m) - via, exp: `Semua lintasan: C(${m + n}, ${m}) = ${C(m + n, m)}. Yang melewati persimpangan tertutup: ${via}. Jadi ${C(m + n, m) - via}.`, tip: 'Semua lintasan dikurangi yang melewati titik terlarang.' };
    },
  },
  {
    key: 'kom-digit-syarat', topic: T, sub: 'Mencacah Bilangan Bersyarat', level: 'Provinsi', diff: 'HOTS', sec: 110,
    make(r) {
      const N = r.pick([100, 200, 300, 500, 999, 1000]);
      const d = r.int(1, 9);
      const form = r.int(0, 2);
      const all = range(1, N);
      if (form === 0) return { q: `Banyaknya bilangan dari 1 sampai ${N} yang memuat angka ${d} (paling sedikit satu kali) adalah ...`, ans: all.filter((x) => String(x).includes(String(d))).length, exp: `Lebih mudah menghitung yang TIDAK memuat angka ${d}, lalu kurangkan dari ${N}. Hasilnya ${all.filter((x) => String(x).includes(String(d))).length}.`, tip: 'Pakai komplemen: hitung bilangan tanpa angka tersebut (9 pilihan per posisi).' };
      if (form === 1) {
        const S = r.int(5, 15);
        const cnt = all.filter((x) => digitSum(x) === S).length;
        if (!cnt) throw new Retry();
        return { q: `Banyaknya bilangan dari 1 sampai ${N} yang jumlah angka-angkanya sama dengan ${S} adalah ...`, ans: cnt, exp: `Daftar secara teratur berdasarkan angka ratusan, lalu puluhan; angka satuan ditentukan otomatis. Banyaknya ${cnt}.`, tip: 'Tetapkan angka depan satu per satu, lalu hitung berapa pasangan angka belakang yang cocok.' };
      }
      const cnt = all.filter((x) => String(x).split('').every((c, i, arr) => i === 0 || c !== arr[i - 1])).length;
      return { q: `Banyaknya bilangan dari 1 sampai ${N} yang tidak memiliki dua angka sama yang bersebelahan (contoh: 121 boleh, 112 tidak) adalah ...`, ans: cnt, exp: `Bilangan 1 angka: semuanya boleh. Untuk yang lebih panjang, setiap angka berikutnya punya 9 pilihan (asal tidak sama dengan angka sebelumnya). Dengan menghitung hingga ${N} diperoleh ${cnt}.`, tip: 'Isi dari kiri: angka pertama 9 pilihan (bukan 0), setiap angka berikutnya 9 pilihan.' };
    },
  },
  {
    key: 'kom-susun-huruf', topic: T, sub: 'Susunan Huruf (Permutasi Berulang)', level: 'Provinsi', diff: 'Sedang', sec: 90,
    make(r) {
      const w = r.pick(['KAKAK', 'SALSA', 'AMANAH', 'IBADAH', 'JUARA', 'BUKUKU', 'MASJID', 'SEKOLAH', 'TAKWA', 'HAFIDZ', 'ADZAN', 'LOMBA', 'BELAJAR', 'PINTAR']);
      const cnt = new Map<string, number>();
      w.split('').forEach((c) => cnt.set(c, (cnt.get(c) ?? 0) + 1));
      const total = fact(w.length) / [...cnt.values()].reduce((p, c) => p * fact(c), 1);
      const reps = [...cnt.entries()].filter(([, c]) => c > 1);
      return {
        q: `Banyak susunan huruf berbeda (tidak harus bermakna) yang dapat dibuat dari semua huruf pada kata "${w}" adalah ...`,
        ans: total,
        exp: `Ada ${w.length} huruf${reps.length ? ` dengan huruf berulang ${reps.map(([c, n]) => `${c} (${n} kali)`).join(', ')}` : ' yang semuanya berbeda'}. Banyak susunan = ${w.length}!${reps.length ? ' ÷ (' + reps.map(([, n]) => `${n}!`).join(' × ') + ')' : ''} = ${total}.`,
        tip: 'Huruf yang sama bila ditukar tidak menghasilkan susunan baru, jadi bagi dengan faktorial banyak ulangannya.',
      };
    },
  },
  {
    key: 'kom-melingkar', topic: T, sub: 'Permutasi Melingkar', level: 'Provinsi', diff: 'Sedang', sec: 75,
    make(r) {
      const n = r.int(4, 8);
      if (r.chance(0.5)) return { q: `${n} orang duduk mengelilingi meja bundar. Banyak susunan duduk yang berbeda (susunan yang hanya diputar dianggap sama) adalah ...`, ans: fact(n - 1), exp: `Tetapkan satu orang sebagai patokan, sisanya ${n - 1} orang disusun: ${n - 1}! = ${fact(n - 1)}.`, tip: 'Permutasi melingkar n objek = (n − 1)!.' };
      return { q: `${n} anak duduk mengelilingi meja bundar. Jika dua anak kembar harus selalu duduk berdampingan, banyak susunan duduk yang berbeda adalah ...`, ans: 2 * fact(n - 2), exp: `Gabungkan si kembar menjadi satu blok: ${n - 1} objek melingkar → ${n - 2}! = ${fact(n - 2)}. Si kembar dapat bertukar tempat (× 2). Total ${2 * fact(n - 2)}.`, tip: 'Blok dulu, baru permutasi melingkar.' };
    },
  },
  {
    key: 'kom-panitia', topic: T, sub: 'Kombinasi Bersyarat', level: 'Provinsi', diff: 'Sedang', sec: 90,
    make(r) {
      const m = r.int(4, 9), f = r.int(3, 8);
      if (r.chance(0.5)) {
        const a = r.int(1, 3), b = r.int(1, 3);
        return { q: `Dari ${m} siswa putra dan ${f} siswi putri akan dibentuk tim yang terdiri dari ${a} putra dan ${b} putri. Banyak cara membentuk tim adalah ...`, ans: C(m, a) * C(f, b), exp: `Pilih putra: C(${m}, ${a}) = ${C(m, a)}. Pilih putri: C(${f}, ${b}) = ${C(f, b)}. Total ${C(m, a)} × ${C(f, b)} = ${C(m, a) * C(f, b)}.`, tip: 'Pilih tiap kelompok secara terpisah lalu kalikan.' };
      }
      const k = r.int(3, 4);
      return { q: `Dari ${m} siswa putra dan ${f} siswi putri akan dipilih ${k} orang sebagai pengurus. Jika paling sedikit satu putri harus terpilih, banyak cara memilih adalah ...`, ans: C(m + f, k) - C(m, k), exp: `Semua cara: C(${m + f}, ${k}) = ${C(m + f, k)}. Tanpa putri sama sekali: C(${m}, ${k}) = ${C(m, k)}. Jadi ${C(m + f, k) - C(m, k)}.`, tip: '"Paling sedikit satu" → semua dikurangi "tidak ada sama sekali".' };
    },
  },
  {
    key: 'kom-peluang-pq', topic: T, sub: 'Peluang (Bentuk p/q)', level: 'Provinsi', diff: 'HOTS', sec: 100,
    make(r) {
      const all = dice();
      const c = r.pick([
        { d: 'hasil kali kedua mata dadu genap', f: ([a, b]: number[]) => (a * b) % 2 === 0 },
        { d: 'hasil kali kedua mata dadu kelipatan 3', f: ([a, b]: number[]) => (a * b) % 3 === 0 },
        { d: 'jumlah kedua mata dadu bilangan prima', f: ([a, b]: number[]) => isPrime(a + b) },
        { d: 'mata dadu pertama lebih besar dari mata dadu kedua', f: ([a, b]: number[]) => a > b },
        { d: 'selisih kedua mata dadu paling banyak 1', f: ([a, b]: number[]) => Math.abs(a - b) <= 1 },
        { d: 'jumlah kedua mata dadu habis dibagi 4', f: ([a, b]: number[]) => (a + b) % 4 === 0 },
        { d: 'hasil kali kedua mata dadu bilangan kuadrat', f: ([a, b]: number[]) => Number.isInteger(Math.sqrt(a * b)) },
      ]);
      const n = all.filter(c.f).length;
      const [p, q] = reduced(n, 36);
      return {
        q: `Dua dadu dilempar bersamaan. Peluang ${c.d} dapat ditulis sebagai pecahan paling sederhana p/q. Nilai p + q adalah ...`,
        ans: p + q,
        exp: `Dari 36 pasangan, yang memenuhi ada ${n}: ${all.filter(c.f).map(([a, b]) => `(${a},${b})`).join(' ')}. Peluang = ${n}/36 = ${p}/${q}, jadi p + q = ${p + q}.`,
        tip: 'Untuk syarat "genap"/"kelipatan", sering lebih cepat menghitung komplemennya.',
      };
    },
  },
  {
    key: 'kom-tangga', topic: T, sub: 'Rekursi: Naik Tangga', level: 'Provinsi', diff: 'HOTS', sec: 110,
    make(r) {
      const three = r.chance(0.35);
      const n = three ? r.int(5, 10) : r.int(5, 14);
      const w = [1];
      for (let i = 1; i <= n; i++) w[i] = (w[i - 1] ?? 0) + (w[i - 2] ?? 0) + (three ? w[i - 3] ?? 0 : 0);
      const nm = r.pick(NAMA);
      return {
        q: `${nm} menaiki tangga yang memiliki ${n} anak tangga. Setiap langkah, ${nm} dapat naik 1 atau 2${three ? ' atau 3' : ''} anak tangga. Banyak cara berbeda untuk sampai di anak tangga paling atas adalah ...`,
        ans: w[n],
        exp: `Misal W(k) = banyak cara sampai anak tangga ke-k. Langkah terakhir dari k−1${three ? ', k−2, atau k−3' : ' atau k−2'}, sehingga W(k) = W(k−1) + W(k−2)${three ? ' + W(k−3)' : ''}. Barisannya: ${w.slice(1).join(', ')}. Jadi W(${n}) = ${w[n]}.`,
        tip: three ? 'Pola "Tribonacci": jumlah tiga suku sebelumnya.' : 'Pola Fibonacci: 1, 2, 3, 5, 8, 13, ...',
      };
    },
  },
  {
    key: 'kom-titik-garis', topic: T, sub: 'Garis & Segitiga dari Titik', level: 'Provinsi', diff: 'Sedang', sec: 80,
    make(r) {
      const n = r.int(6, 15);
      const form = r.int(0, 3);
      if (form === 0) return { q: `Terdapat ${n} titik pada bidang dan tidak ada tiga titik yang segaris. Banyak garis lurus berbeda yang dapat dibuat dengan menghubungkan dua titik adalah ...`, ans: C(n, 2), exp: `Setiap garis ditentukan 2 titik: C(${n}, 2) = ${C(n, 2)}.`, tip: 'Sama seperti jabat tangan.' };
      if (form === 1) return { q: `Terdapat ${n} titik pada bidang dan tidak ada tiga titik yang segaris. Banyak segitiga yang titik-titik sudutnya dipilih dari titik-titik tersebut adalah ...`, ans: C(n, 3), exp: `Setiap 3 titik membentuk segitiga: C(${n}, 3) = ${C(n, 3)}.`, tip: 'C(n, 3) = n(n−1)(n−2)/6.' };
      const k = r.int(3, n - 2);
      if (form === 2) return { q: `Terdapat ${n} titik pada bidang. ${k} titik di antaranya terletak pada satu garis lurus, dan tidak ada tiga titik lain yang segaris. Banyak garis lurus berbeda yang dapat dibuat adalah ...`, ans: C(n, 2) - C(k, 2) + 1, exp: `Jika tidak ada yang segaris: C(${n}, 2) = ${C(n, 2)}. ${k} titik segaris hanya membentuk 1 garis, bukan C(${k}, 2) = ${C(k, 2)}. Jadi ${C(n, 2)} − ${C(k, 2)} + 1 = ${C(n, 2) - C(k, 2) + 1}.`, tip: 'Kurangi garis yang "dobel", lalu tambahkan 1 garis bersama.' };
      return { q: `Terdapat ${n} titik pada bidang. ${k} titik di antaranya terletak pada satu garis lurus, dan tidak ada tiga titik lain yang segaris. Banyak segitiga yang dapat dibentuk dari titik-titik tersebut adalah ...`, ans: C(n, 3) - C(k, 3), exp: `Semua pilihan 3 titik: C(${n}, 3) = ${C(n, 3)}. Tiga titik yang segaris tidak membentuk segitiga: C(${k}, 3) = ${C(k, 3)}. Jadi ${C(n, 3) - C(k, 3)}.`, tip: 'Kurangi pilihan tiga titik yang segaris.' };
    },
  },
  {
    key: 'kom-pigeon-bulan', topic: T, sub: 'Prinsip Sarang Merpati (Umum)', level: 'Provinsi', diff: 'Sedang', sec: 70,
    make(r) {
      const form = r.int(0, 2);
      if (form === 0) {
        const N = r.int(30, 200);
        return { q: `Di sebuah sekolah terdapat ${N} siswa. Paling sedikit berapa siswa yang PASTI lahir pada bulan yang sama?`, ans: Math.ceil(N / 12), exp: `Ada 12 bulan (sarang). ${N} ÷ 12 = ${fmt(N / 12)}, dibulatkan ke atas = ${Math.ceil(N / 12)}.`, tip: 'Banyak benda ÷ banyak sarang, dibulatkan ke atas.' };
      }
      if (form === 1) {
        const k = r.int(3, 10);
        return { q: `Paling sedikit berapa siswa yang harus dikumpulkan agar PASTI ada ${k} siswa yang lahir pada bulan yang sama?`, ans: 12 * (k - 1) + 1, exp: `Terburuk: setiap bulan diisi ${k - 1} siswa = ${12 * (k - 1)}. Siswa berikutnya membuat salah satu bulan berisi ${k}. Jawab ${12 * (k - 1) + 1}.`, tip: '12 × (k − 1) + 1.' };
      }
      const k = r.int(3, 9);
      return { q: `Paling sedikit berapa orang yang harus dikumpulkan agar PASTI ada ${k} orang yang lahir pada hari (Senin–Minggu) yang sama?`, ans: 7 * (k - 1) + 1, exp: `Terburuk: setiap hari diisi ${k - 1} orang = ${7 * (k - 1)}. Ditambah 1 menjadi ${7 * (k - 1) + 1}.`, tip: '7 × (k − 1) + 1.' };
    },
  },
  {
    key: 'kom-pasangan-jumlah', topic: T, sub: 'Mencacah Pasangan Bilangan', level: 'Provinsi', diff: 'HOTS', sec: 100,
    make(r) {
      const N = r.int(10, 30), k = r.pick([2, 3, 4, 5]);
      let cnt = 0;
      for (let a = 1; a <= N; a++) for (let b = a + 1; b <= N; b++) if ((a + b) % k === 0) cnt++;
      return {
        q: `Dua bilangan berbeda dipilih dari 1, 2, 3, ..., ${N}. Banyak pasangan yang jumlahnya habis dibagi ${k} adalah ... (pasangan {a, b} sama dengan {b, a})`,
        ans: cnt,
        exp: `Kelompokkan bilangan berdasarkan sisa pembagian oleh ${k}. Jumlah dua bilangan habis dibagi ${k} jika sisa-sisanya berjumlah 0 atau ${k}. Hitung pasangan dari kelompok-kelompok yang cocok; hasilnya ${cnt}.`,
        tip: 'Kelompokkan berdasarkan sisa bagi, lalu pasangkan kelompok yang sisanya saling melengkapi.',
      };
    },
  },
  {
    key: 'kom-jabat-pasangan', topic: T, sub: 'Jabat Tangan Bersyarat', level: 'Provinsi', diff: 'HOTS', sec: 90,
    make(r) {
      const n = r.int(3, 12);
      if (r.chance(0.5)) return { q: `Dalam sebuah pesta hadir ${n} pasang suami istri. Setiap orang berjabat tangan dengan semua orang lain kecuali dengan pasangannya sendiri. Banyak jabat tangan yang terjadi adalah ...`, ans: C(2 * n, 2) - n, exp: `Seandainya semua saling berjabat tangan: C(${2 * n}, 2) = ${C(2 * n, 2)}. Kurangi ${n} jabat tangan suami-istri: ${C(2 * n, 2) - n}.`, tip: 'Hitung semua, kurangi yang tidak terjadi.' };
      const m = r.int(3, 10), f = r.int(3, 10);
      return { q: `Dalam sebuah acara hadir ${m} bapak dan ${f} ibu. Setiap bapak berjabat tangan dengan semua orang yang hadir, sedangkan sesama ibu tidak saling berjabat tangan. Banyak jabat tangan seluruhnya adalah ...`, ans: C(m, 2) + m * f, exp: `Sesama bapak: C(${m}, 2) = ${C(m, 2)}. Bapak dengan ibu: ${m} × ${f} = ${m * f}. Total ${C(m, 2) + m * f}.`, tip: 'Pisahkan menurut jenis pasangan yang berjabat tangan.' };
    },
  },
  {
    key: 'kom-ambil-dua', topic: T, sub: 'Peluang Pengambilan Tanpa Pengembalian', level: 'Provinsi', diff: 'HOTS', sec: 100,
    make(r) {
      const a = r.int(2, 8), b = r.int(2, 8);
      const tot = C(a + b, 2);
      const form = r.int(0, 1);
      const n = form === 0 ? C(a, 2) + C(b, 2) : a * b;
      const [p, q] = reduced(n, tot);
      return {
        q: `Sebuah kotak berisi ${a} bola merah dan ${b} bola putih. Dua bola diambil sekaligus secara acak. Peluang terambil dua bola yang warnanya ${form === 0 ? 'sama' : 'berbeda'} dapat ditulis sebagai pecahan paling sederhana p/q. Nilai p + q adalah ...`,
        ans: p + q,
        exp: `Banyak cara mengambil 2 bola: C(${a + b}, 2) = ${tot}. ${form === 0 ? `Sama warna: C(${a}, 2) + C(${b}, 2) = ${C(a, 2)} + ${C(b, 2)} = ${n}.` : `Beda warna: ${a} × ${b} = ${n}.`} Peluang = ${n}/${tot} = ${p}/${q}. Jadi p + q = ${p + q}.`,
        tip: 'Mengambil "sekaligus" → pakai kombinasi.',
      };
    },
  },

  // ============ NASIONAL ============
  {
    key: 'kom-bayar-koin', topic: T, sub: 'Banyak Cara Membayar', level: 'Nasional', diff: 'HOTS', sec: 130,
    make(r) {
      const coins = r.pick([[500, 1000, 2000], [1000, 2000, 5000], [500, 1000, 2000, 5000], [100, 200, 500]]);
      const X = coins[0] * r.int(8, 24);
      const ways = (amt: number, idx: number): number => {
        if (amt === 0) return 1;
        if (idx < 0) return 0;
        let s = 0;
        for (let k = 0; k * coins[idx] <= amt; k++) s += ways(amt - k * coins[idx], idx - 1);
        return s;
      };
      const ans = ways(X, coins.length - 1);
      return {
        q: `Tersedia banyak koin/uang pecahan Rp${coins.map((c) => fmt(c)).join(', Rp')}. Ada berapa cara berbeda untuk membayar tepat Rp${fmt(X)} (urutan tidak diperhatikan)?`,
        ans,
        exp: `Tetapkan banyak pecahan terbesar dulu (0, 1, 2, ...), lalu untuk setiap pilihan hitung cara membayar sisanya dengan pecahan yang lebih kecil. Jumlah semua kemungkinan = ${ans}.`,
        tip: 'Buat tabel bertingkat: mulai dari pecahan terbesar, lalu turun ke yang lebih kecil.',
      };
    },
  },
  {
    key: 'kom-warna-daerah', topic: T, sub: 'Pewarnaan Daerah', level: 'Nasional', diff: 'HOTS', sec: 120,
    make(r) {
      const k = r.int(3, 5);
      const ring = r.chance(0.5);
      const n = ring ? r.int(4, 6) : r.int(4, 7);
      let cnt = 0;
      const total = k ** n;
      for (let code = 0; code < total; code++) {
        const cs: number[] = [];
        let c = code;
        for (let i = 0; i < n; i++) { cs.push(c % k); c = Math.floor(c / k); }
        let ok = true;
        for (let i = 0; i < n - 1; i++) if (cs[i] === cs[i + 1]) ok = false;
        if (ring && cs[0] === cs[n - 1]) ok = false;
        if (ok) cnt++;
      }
      return {
        q: ring
          ? `Sebuah taman berbentuk lingkaran dibagi menjadi ${n} petak seperti potongan kue (petak pertama bersebelahan dengan petak terakhir). Setiap petak ditanami bunga dengan salah satu dari ${k} warna, dan dua petak yang bersebelahan harus berbeda warna. Banyak cara mewarnai adalah ...`
          : `${n} petak tanah berjajar dalam satu baris akan ditanami bunga dengan salah satu dari ${k} warna. Dua petak yang bersebelahan harus berbeda warna. Banyak cara mewarnai adalah ...`,
        ans: cnt,
        exp: ring
          ? `Untuk lingkaran, rumusnya (k − 1)ⁿ + (−1)ⁿ(k − 1) = ${k - 1}${'⁰¹²³⁴⁵⁶⁷'[n]} ${n % 2 ? '−' : '+'} ${k - 1} = ${cnt}.`
          : `Petak pertama ${k} pilihan, setiap petak berikutnya ${k - 1} pilihan (asal beda dari sebelumnya). Total ${k} × ${k - 1}${'⁰¹²³⁴⁵⁶⁷'[n - 1]} = ${cnt}.`,
        tip: ring ? 'Hati-hati: pada lingkaran, petak terakhir juga bertetangga dengan petak pertama.' : 'k × (k − 1)ⁿ⁻¹.',
      };
    },
  },
  {
    key: 'kom-digit-naik', topic: T, sub: 'Bilangan dengan Angka Naik/Turun', level: 'Nasional', diff: 'HOTS', sec: 110,
    make(r) {
      const len = r.int(3, 4);
      const type = r.pick(['naik', 'turun', 'tidak turun'] as const);
      const lo = 10 ** (len - 1), hi = 10 ** len - 1;
      let cnt = 0;
      for (let n = lo; n <= hi; n++) {
        const d = String(n).split('').map(Number);
        let ok = true;
        for (let i = 1; i < d.length; i++) {
          if (type === 'naik' && !(d[i] > d[i - 1])) ok = false;
          if (type === 'turun' && !(d[i] < d[i - 1])) ok = false;
          if (type === 'tidak turun' && !(d[i] >= d[i - 1])) ok = false;
        }
        if (ok) cnt++;
      }
      const ex = type === 'naik' ? ['358', '1358'] : type === 'turun' ? ['830', '8530'] : ['229', '1229'];
      const desc = (type === 'naik' ? 'angka-angkanya naik tegas dari kiri ke kanan' : type === 'turun' ? 'angka-angkanya turun tegas dari kiri ke kanan' : 'setiap angka tidak lebih kecil dari angka di kirinya') + ` (contoh: ${ex[len - 3]})`;
      return {
        q: `Banyaknya bilangan ${len} angka yang ${desc} adalah ...`,
        ans: cnt,
        exp: type === 'naik' ? `Pilih ${len} angka berbeda dari 1–9 (angka 0 tidak bisa dipakai karena tidak bisa di depan), urutannya pasti satu cara: C(9, ${len}) = ${cnt}.` : type === 'turun' ? `Pilih ${len} angka berbeda dari 0–9, susun menurun (0 pasti di belakang): C(10, ${len}) = ${cnt}.` : `Memilih ${len} angka dari 1–9 boleh berulang (kombinasi dengan pengulangan): C(9 + ${len} − 1, ${len}) = ${cnt}.`,
        tip: 'Memilih himpunan angka sudah menentukan urutannya, jadi cukup gunakan kombinasi.',
      };
    },
  },
  {
    key: 'kom-kartu-pigeon', topic: T, sub: 'Sarang Merpati: Pasangan Berjumlah Tetap', level: 'Nasional', diff: 'HOTS', sec: 130,
    make(r) {
      const N = r.int(10, 30);
      const S = r.int(N - 4, N + 6);
      let pairs = 0, singles = 0;
      for (let a = 1; a <= N; a++) {
        const b = S - a;
        if (b >= 1 && b <= N && b !== a) { if (a < b) pairs++; } else singles++;
      }
      if (pairs === 0) throw new Retry();
      const ans = pairs + singles + 1;
      return {
        q: `Terdapat ${N} kartu bernomor 1 sampai ${N}. Berapa kartu paling sedikit yang harus diambil (tanpa melihat) agar PASTI terdapat dua kartu yang jumlah nomornya ${S}?`,
        ans,
        exp: `Pasangan yang berjumlah ${S}: ada ${pairs} pasang (seperti {${Math.max(1, S - N)}, ${S - Math.max(1, S - N)}}). Kartu yang tidak punya pasangan: ${singles}. Terburuk: ambil semua kartu tanpa pasangan dan satu kartu dari setiap pasang = ${singles} + ${pairs} = ${pairs + singles}. Kartu berikutnya pasti melengkapi sebuah pasangan. Jawab ${ans}.`,
        tip: 'Bentuk "sarang" berupa pasangan berjumlah S; kartu tanpa pasangan bisa diambil semua di skenario terburuk.',
      };
    },
  },
  {
    key: 'kom-jumlah-permutasi', topic: T, sub: 'Jumlah Semua Susunan Bilangan', level: 'Nasional', diff: 'HOTS', sec: 120,
    make(r) {
      const k = r.int(3, 4);
      const digits = r.sample(range(1, 9), k);
      const take = 3;
      let s = 0, c = 0;
      for (const p of permutations(digits)) {
        if (k === 4) continue;
        s += Number(p.join('')); c++;
      }
      if (k === 4) {
        for (const a of digits) for (const b of digits) for (const d of digits) if (a !== b && b !== d && a !== d) { s += a * 100 + b * 10 + d; c++; }
      }
      return {
        q: `Dari angka-angka ${digits.join(', ')} dibuat semua bilangan ${take} angka dengan angka-angka berbeda. Jumlah semua bilangan tersebut adalah ...`,
        ans: s,
        exp: `Ada ${c} bilangan. Setiap angka muncul ${c / k} kali di setiap posisi (ratusan, puluhan, satuan). Jumlah = ${c / k} × (${digits.join(' + ')}) × 111 = ${c / k} × ${sum(digits)} × 111 = ${s}.`,
        tip: 'Hitung berapa kali setiap angka muncul di satu posisi, lalu kalikan 111.',
      };
    },
  },
  {
    key: 'kom-bagi-permen', topic: T, sub: 'Membagi Benda Identik', level: 'Nasional', diff: 'HOTS', sec: 120,
    make(r) {
      const n = r.int(6, 20), kids = r.int(3, 4), m = r.int(0, 2);
      let cnt = 0;
      if (kids === 3) { for (let a = m; a <= n; a++) for (let b = m; a + b <= n; b++) if (n - a - b >= m) cnt++; }
      else { for (let a = m; a <= n; a++) for (let b = m; a + b <= n; b++) for (let c = m; a + b + c <= n; c++) if (n - a - b - c >= m) cnt++; }
      if (!cnt) throw new Retry();
      const nm = r.sample(NAMA, kids);
      return {
        q: `${n} permen yang sama akan dibagikan seluruhnya kepada ${nm.join(', ')}. ${m === 0 ? 'Boleh ada anak yang tidak mendapat permen. Banyak cara membagi adalah ...' : `Jika setiap anak mendapat paling sedikit ${m} permen, banyak cara membagi adalah ...`}`,
        ans: cnt,
        exp: `${m ? `Berikan dulu ${m} permen ke setiap anak, tersisa ${n - kids * m}. ` : ''}Membagi ${n - kids * m} permen identik ke ${kids} anak (boleh 0) = C(${n - kids * m} + ${kids - 1}, ${kids - 1}) = ${cnt} (metode bintang dan garis).`,
        tip: 'Metode "bintang dan garis": n benda ke k orang (boleh 0) = C(n + k − 1, k − 1).',
      };
    },
  },
];

