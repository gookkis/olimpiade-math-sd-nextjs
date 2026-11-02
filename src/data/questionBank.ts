export interface SimilarPracticeQuestion {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  tipsTrik: string;
}

export interface OlympiadQuestion {
  id: string;
  topic: 'Bilangan & Aritmatika' | 'Aljabar & Pola Bilangan' | 'Geometri & Pengukuran' | 'Kombinatorika & Peluang' | 'Logika & Masalah HOTS';
  subtopic: string;
  difficulty: 'Mudah' | 'Sedang' | 'HOTS';
  /** Competition level the item is modelled on (OSN/KSN & IYF tiers). */
  level?: 'Kabupaten/Kota' | 'Provinsi' | 'Nasional';
  /** Kisi-kisi category of the "Lomba Matematika SD" (see KISI_LOMBA_SD). */
  kisi?: string;
  format: 'pilihan_ganda' | 'isian';
  question: string;
  visualDiagram?: string; // Optional ASCII or description
  options?: string[]; // A, B, C, D
  correctAnswer: string;
  explanation: string;
  tipsTrik: string;
  targetSeconds: number;
  similarQuestions: SimilarPracticeQuestion[];
}

export const OLYMPIAD_TOPICS = [
  'Bilangan & Aritmatika',
  'Aljabar & Pola Bilangan',
  'Geometri & Pengukuran',
  'Kombinatorika & Peluang',
  'Logika & Masalah HOTS',
] as const;

export const QUESTION_BANK: OlympiadQuestion[] = [
  // 1. Bilangan & Aritmatika - Keterbagian & Digit Terakhir
  {
    id: 'bil-01',
    topic: 'Bilangan & Aritmatika',
    subtopic: 'Digit Terakhir & Pola Pangkat',
    difficulty: 'Sedang',
    format: 'pilihan_ganda',
    question: 'Berapakah angka satuan (digit terakhir) dari hasil perhitungan 3²⁰²⁶ + 7²⁰²⁶?',
    options: [
      'A. 0',
      'B. 4',
      'C. 8',
      'D. 6',
    ],
    correctAnswer: 'C',
    explanation: `Mari kita amati pola angka satuan perpangkatan 3 dan 7:
1. Pola satuan dari 3ⁿ:
   - 3¹ = 3
   - 3² = 9
   - 3³ = 27 (satuan 7)
   - 3⁴ = 81 (satuan 1)
   Pola berulang setiap 4 kali: [3, 9, 7, 1].
   Pangkat 2026: 2026 ÷ 4 = 506 bersisa 2.
   Maka angka satuan dari 3²⁰²⁶ sama dengan 3², yaitu 9.

2. Pola satuan dari 7ⁿ:
   - 7¹ = 7
   - 7² = 49 (satuan 9)
   - 7³ = 343 (satuan 3)
   - 7⁴ = 2401 (satuan 1)
   Pola berulang setiap 4 kali: [7, 9, 3, 1].
   Pangkat 2026: 2026 ÷ 4 = 506 bersisa 2.
   Maka angka satuan dari 7²⁰²⁶ sama dengan 7², yaitu 9.

3. Jumlah angka satuan: 9 + 9 = 18.
   Angka satuannya adalah 8.`,
    tipsTrik: 'Trik Kilat: Cukup bagi 2 digit terakhir eksponen (26 ÷ 4 = sisa 2). Hitung 3² + 7² = 9 + 49 = 58 -> satuannya 8!',
    targetSeconds: 75,
    similarQuestions: [
      {
        id: 'bil-01-sim1',
        question: 'Berapakah angka satuan dari 2²⁰²⁵ + 3²⁰²⁵?',
        options: ['A. 5', 'B. 7', 'C. 1', 'D. 9'],
        correctAnswer: 'A',
        explanation: '2025 dibagi 4 bersisa 1. Satuan 2¹ adalah 2. Satuan 3¹ adalah 3. Maka satuannya 2 + 3 = 5.',
        tipsTrik: '25 mod 4 = 1. Langsung 2¹ + 3¹ = 5.',
      },
      {
        id: 'bil-01-sim2',
        question: 'Tentukan angka satuan dari 7¹⁰⁰ - 3¹⁰⁰!',
        options: ['A. 0', 'B. 2', 'C. 4', 'D. 6'],
        correctAnswer: 'A',
        explanation: '100 habis dibagi 4 (kelipatan 4). Satuan 7⁴ adalah 1, dan satuan 3⁴ adalah 1. Maka 1 - 1 = 0.',
        tipsTrik: 'Keduanya berujung pada digit 1 karena kelipatan 4 periodik. 1 - 1 = 0.',
      },
    ],
  },

  // 2. Bilangan & Aritmatika - Penjumlahan Deret Pecahan Cerdik (Telescoping)
  {
    id: 'bil-02',
    topic: 'Bilangan & Aritmatika',
    subtopic: 'Pecahan Berantai & Telescoping',
    difficulty: 'HOTS',
    format: 'pilihan_ganda',
    question: 'Hitunglah nilai penjumlahan pecahan berikut:\nS = 1/(1×2) + 1/(2×3) + 1/(3×4) + ... + 1/(99×100)',
    options: [
      'A. 99/100',
      'B. 100/101',
      'C. 98/99',
      'D. 1/100',
    ],
    correctAnswer: 'A',
    explanation: `Gunakan sifat pemecahan parsial (Telescoping Sum):
Rumus: 1 / [n × (n+1)] = 1/n - 1/(n+1)

Penerapan:
- 1/(1×2) = 1/1 - 1/2
- 1/(2×3) = 1/2 - 1/3
- 1/(3×4) = 1/3 - 1/4
...
- 1/(99×100) = 1/99 - 1/100

Jika dijumlahkan semua:
S = (1 - 1/2) + (1/2 - 1/3) + (1/3 - 1/4) + ... + (1/99 - 1/100)
Perhatikan suku tengah saling menghilangkan (-1/2 + 1/2 = 0, dst).
Yang tersisa hanya suku pertama dan suku terakhir:
S = 1 - 1/100 = 99/100.`,
    tipsTrik: 'Trik Telescoping: Pada bentuk 1/(1×2) + ... + 1/(n×(n+1)), hasilnya SELALU n/(n+1). Dengan n=99, langsung dapat 99/100!',
    targetSeconds: 60,
    similarQuestions: [
      {
        id: 'bil-02-sim1',
        question: 'Hitunglah: 1/(1×2) + 1/(2×3) + 1/(3×4) + ... + 1/(49×50)',
        options: ['A. 49/50', 'B. 50/51', 'C. 48/49', 'D. 1/50'],
        correctAnswer: 'A',
        explanation: 'Suku tersisa: 1 - 1/50 = 49/50.',
        tipsTrik: 'Rumus instan n/(n+1) -> 49/50 dalam 3 detik!',
      },
    ],
  },

  // 3. Bilangan & Aritmatika - FPB, KPK & Sisa Pembagian
  {
    id: 'bil-03',
    topic: 'Bilangan & Aritmatika',
    subtopic: 'FPB, KPK & Teorema Sisa',
    difficulty: 'Sedang',
    format: 'isian',
    question: 'Tentukan bilangan bulat positif terkecil yang jika dibagi 3 bersisa 2, jika dibagi 4 bersisa 3, dan jika dibagi 5 bersisa 4!',
    correctAnswer: '59',
    explanation: `Mari kita amati selisih antara pembagi dan sisanya:
- Dibagi 3 sisa 2 -> Kurang 1 agar habis dibagi 3 (karena 3 - 2 = 1)
- Dibagi 4 sisa 3 -> Kurang 1 agar habis dibagi 4 (karena 4 - 3 = 1)
- Dibagi 5 sisa 4 -> Kurang 1 agar habis dibagi 5 (karena 5 - 4 = 1)

Artinya, jika bilangan tersebut (kita sebut N) ditambah 1, maka (N + 1) akan HABIS dibagi 3, 4, dan 5 sekaligus!
Maka (N + 1) adalah KPK dari 3, 4, dan 5:
KPK(3, 4, 5) = 3 × 4 × 5 = 60.

Karena N + 1 = 60, maka:
N = 60 - 1 = 59.`,
    tipsTrik: 'Trik Sisa Negatif: Jika (Pembagi - Sisa) selalu sama (k=1), bilangan terkecil = KPK(semua pembagi) - k. KPK(3,4,5) - 1 = 60 - 1 = 59.',
    targetSeconds: 90,
    similarQuestions: [
      {
        id: 'bil-03-sim1',
        question: 'Bilangan terkecil yang dibagi 4 sisa 1, dibagi 5 sisa 2, dan dibagi 6 sisa 3 adalah...',
        options: ['A. 57', 'B. 58', 'C. 59', 'D. 61'],
        correctAnswer: 'A',
        explanation: 'Kekurangan sama: 4-1=3, 5-2=3, 6-3=3. KPK(4,5,6) = 60. Maka N = 60 - 3 = 57.',
        tipsTrik: 'KPK(4,5,6) - 3 = 60 - 3 = 57.',
      },
    ],
  },

  // 4. Geometri & Pengukuran - Luas Daerah Diarsir
  {
    id: 'geo-01',
    topic: 'Geometri & Pengukuran',
    subtopic: 'Luas Bangun Datar & Potongan Daun',
    difficulty: 'HOTS',
    format: 'pilihan_ganda',
    question: 'Di dalam sebuah persegi dengan panjang sisi 14 cm, terdapat dua buah busur lingkaran seperempat lingkaran berhadapan yang saling berpotongan membentuk daerah arsir mirip helai daun. Berapakah luas daerah arsir tersebut? (Gunakan π = 22/7)',
    options: [
      'A. 112 cm²',
      'B. 98 cm²',
      'C. 84 cm²',
      'D. 126 cm²',
    ],
    correctAnswer: 'A',
    explanation: `Bentuk arsiran adalah irisan dari dua buah seperempat lingkaran di dalam persegi.
Sisi persegi s = 14 cm, maka jari-jari r = 14 cm.

Luas 1 buah seperempat lingkaran = 1/4 × π × r²
= 1/4 × (22/7) × 14 × 14
= 1/4 × 22 × 2 × 14 = 154 cm²

Jika kita jumlahkan dua buah seperempat lingkaran:
Luas = 154 + 154 = 308 cm²

Perhatikan bahwa bagian yang diarsir (daun) terhitung DUA KALI saat menjumlahkan kedua seperempat lingkaran.
Maka:
Luas Daun = (Luas 2 Seperempat Lingkaran) - (Luas Persegi)
Luas Daun = 308 - (14 × 14)
Luas Daun = 308 - 196 = 112 cm².`,
    tipsTrik: 'Rumus Cepat Bentuk Daun Persegi: Luas Daun = (4/7) × s². Dengan s = 14, Luas = (4/7) × 196 = 4 × 28 = 112 cm²! Hafalkan rumus sakti 4/7 s²!',
    targetSeconds: 80,
    similarQuestions: [
      {
        id: 'geo-01-sim1',
        question: 'Sebuah persegi bersisi 7 cm memiliki dua seperempat lingkaran berhadapan membentuk daun. Berapa luas daun tersebut? (π = 22/7)',
        options: ['A. 28 cm²', 'B. 32 cm²', 'C. 14 cm²', 'D. 24 cm²'],
        correctAnswer: 'A',
        explanation: 'Gunakan rumus daun: (4/7) × s² = (4/7) × 49 = 28 cm².',
        tipsTrik: 'Rumus (4/7) × 7² = 28 cm² langsung dalam 5 detik!',
      },
    ],
  },

  // 5. Geometri & Pengukuran - Sudut Jarum Jam
  {
    id: 'geo-02',
    topic: 'Geometri & Pengukuran',
    subtopic: 'Sudut Jarum Jam',
    difficulty: 'Sedang',
    format: 'pilihan_ganda',
    question: 'Berapakah besar sudut terkecil yang dibentuk oleh kedua jarum jam pada pukul 03.40?',
    options: [
      'A. 130°',
      'B. 140°',
      'C. 120°',
      'D. 125°',
    ],
    correctAnswer: 'A',
    explanation: `Mari kita hitung posisi sudut masing-masing jarum dari angka 12 (0°):
1. Kecepatan jarum jam pendek: 30° per jam (360°/12) dan 0,5° per menit.
   Pada pukul 03.40:
   Posisi jarum jam = (3 × 30°) + (40 × 0,5°) = 90° + 20° = 110°.

2. Kecepatan jarum menit: 6° per menit (360°/60).
   Pada menit ke-40:
   Posisi jarum menit = 40 × 6° = 240°.

3. Selisih sudut antara kedua jarum:
   |240° - 110°| = 130°.
   Karena 130° ≤ 180°, ini adalah sudut terkecilnya.`,
    tipsTrik: 'Rumus Sakti Sudut Jam: Sudut = |(30 × Jam) - (5,5 × Menit)| = |(30 × 3) - (5,5 × 40)| = |90 - 220| = |-130| = 130°!',
    targetSeconds: 70,
    similarQuestions: [
      {
        id: 'geo-02-sim1',
        question: 'Berapa sudut terkecil kedua jarum jam pada pukul 04.30?',
        options: ['A. 45°', 'B. 60°', 'C. 75°', 'D. 30°'],
        correctAnswer: 'A',
        explanation: 'Sudut = |(30 × 4) - (5,5 × 30)| = |120 - 165| = 45°.',
        tipsTrik: 'Hitung cepat: |120 - 165| = 45°.',
      },
    ],
  },

  // 6. Aljabar & Pola Bilangan - Pola Bilangan Bertingkat
  {
    id: 'alj-01',
    topic: 'Aljabar & Pola Bilangan',
    subtopic: 'Barisan Bilangan Bertingkat',
    difficulty: 'Sedang',
    format: 'isian',
    question: 'Diberikan barisan bilangan: 3, 7, 13, 21, 31, ... Tentukan suku ke-10 dari barisan tersebut!',
    correctAnswer: '111',
    explanation: `Mari kita hitung selisih antar suku:
- 7 - 3 = +4
- 13 - 7 = +6
- 21 - 13 = +8
- 31 - 21 = +10
Selisih tingkat pertama membentuk barisan bilangan genap: 4, 6, 8, 10, ... (beda konstan +2).

Rumus suku ke-n barisan bertingkat dua:
Uₙ = an² + bn + c
Tingkat dua = 2a = 2 -> a = 1
3a + b = 4 -> 3(1) + b = 4 -> b = 1
a + b + c = 3 -> 1 + 1 + c = 3 -> c = 1

Maka rumus suku ke-n adalah: Uₙ = n² + n + 1
Untuk n = 10:
U₁₀ = 10² + 10 + 1 = 100 + 10 + 1 = 111.`,
    tipsTrik: 'Cek Pola: U₁=1×2+1=3, U₂=2×3+1=7, U₃=3×4+1=13. Maka U₁₀ = 10×11 + 1 = 110 + 1 = 111!',
    targetSeconds: 75,
    similarQuestions: [
      {
        id: 'alj-01-sim1',
        question: 'Diberikan barisan 1, 3, 7, 13, 21, ... Tentukan suku ke-8!',
        options: ['A. 57', 'B. 43', 'C. 65', 'D. 73'],
        correctAnswer: 'A',
        explanation: 'Pola: Uₙ = n² - n + 1. Untuk n=8: 8² - 8 + 1 = 64 - 8 + 1 = 57.',
        tipsTrik: '8×7 + 1 = 56 + 1 = 57.',
      },
    ],
  },

  // 7. Aljabar & Pola Bilangan - Sistem Persamaan Pengganti Simbol
  {
    id: 'alj-02',
    topic: 'Aljabar & Pola Bilangan',
    subtopic: 'Logika Persamaan Simbol & Hewan',
    difficulty: 'Mudah',
    format: 'pilihan_ganda',
    question: 'Diketahui:\n▲ + ■ = 18\n■ + ● = 24\n▲ + ● = 20\nBerapakah nilai dari ▲ + ■ + ●?',
    options: [
      'A. 31',
      'B. 62',
      'C. 30',
      'D. 28',
    ],
    correctAnswer: 'A',
    explanation: `Jumlahkan ketiga persamaan secara bersamaan:
(▲ + ■) + (■ + ●) + (▲ + ●) = 18 + 24 + 20
2▲ + 2■ + 2● = 62
2 × (▲ + ■ + ●) = 62

Bagi kedua ruas dengan 2:
▲ + ■ + ● = 62 ÷ 2 = 31.`,
    tipsTrik: 'Trik Cepat Olimpiade: Jumlahkan ketiga angka lalu langsung bagi 2! (18 + 24 + 20) ÷ 2 = 62 ÷ 2 = 31!',
    targetSeconds: 45,
    similarQuestions: [
      {
        id: 'alj-02-sim1',
        question: 'A + B = 15, B + C = 25, A + C = 20. Berapakah A + B + C?',
        options: ['A. 30', 'B. 60', 'C. 25', 'D. 35'],
        correctAnswer: 'A',
        explanation: '(15 + 25 + 20) ÷ 2 = 60 ÷ 2 = 30.',
        tipsTrik: 'Jumlahkan total lalu bagi 2.',
      },
    ],
  },

  // 8. Logika & Masalah HOTS - Berpapasan & Kecepatan
  {
    id: 'log-01',
    topic: 'Logika & Masalah HOTS',
    subtopic: 'Kecepatan & Jarak Berpapasan',
    difficulty: 'HOTS',
    format: 'pilihan_ganda',
    question: 'Jarak antara kota A dan kota B adalah 180 km. Aris berangkat dari kota A ke kota B dengan kecepatan rata-rata 40 km/jam pada pukul 08.00. Pada saat yang sama, Budi berangkat dari kota B menuju kota A dengan kecepatan rata-rata 50 km/jam. Pada pukul berapa mereka akan berpapasan di jalan?',
    options: [
      'A. Pukul 10.00',
      'B. Pukul 09.30',
      'C. Pukul 10.30',
      'D. Pukul 11.00',
    ],
    correctAnswer: 'A',
    explanation: `Karena Aris dan Budi saling mendekat dari arah berlawanan, maka kecepatan relatif mereka dijumlahkan:
Kecepatan gabungan = 40 km/jam + 50 km/jam = 90 km/jam.

Waktu tempuh hingga berpapasan:
Waktu = Jarak Total ÷ Kecepatan Gabungan
Waktu = 180 km ÷ 90 km/jam = 2 jam.

Waktu berpapasan:
Pukul 08.00 + 2 jam = Pukul 10.00.`,
    tipsTrik: 'Rumus Cepat Berpapasan: Waktu = Jarak ÷ (V₁ + V₂). 180 ÷ (40 + 50) = 180 ÷ 90 = 2 jam. 08.00 + 2 = 10.00!',
    targetSeconds: 70,
    similarQuestions: [
      {
        id: 'log-01-sim1',
        question: 'Jarak P ke Q adalah 210 km. Mobil X berkecepatan 60 km/jam dan mobil Y berkecepatan 45 km/jam bergerak saling mendekat pada pukul 07.00. Pukul berapa mereka berpapasan?',
        options: ['A. 09.00', 'B. 09.30', 'C. 10.00', 'D. 08.30'],
        correctAnswer: 'A',
        explanation: 'Waktu = 210 ÷ (60+45) = 210 ÷ 105 = 2 jam. 07.00 + 2 jam = 09.00.',
        tipsTrik: '210 / 105 = 2 jam.',
      },
    ],
  },

  // 9. Kombinatorika & Peluang - Kaidah Pencacahan & Rute
  {
    id: 'kom-01',
    topic: 'Kombinatorika & Peluang',
    subtopic: 'Kaidah Pencacahan & Kombinasi Jalur',
    difficulty: 'Sedang',
    format: 'isian',
    question: 'Dari kota A ke kota B terdapat 3 jalan yang berbeda. Dari kota B ke kota C terdapat 4 jalan yang berbeda. Seseorang ingin bepergian dari kota A ke kota C melalui kota B, kemudian kembali lagi ke kota A tanpa melalui jalan yang sama saat berangkat. Ada berapa banyak rute berbeda yang dapat ia lalui?',
    correctAnswer: '72',
    explanation: `1. Rute berangkat (A -> B -> C):
   - A ke B: 3 pilihan jalan
   - B ke C: 4 pilihan jalan
   Banyak rute berangkat = 3 × 4 = 12 pilihan.

2. Rute pulang (C -> B -> A) tanpa melalui jalan yang sama:
   - C ke B: tersisa 4 - 1 = 3 pilihan jalan (karena 1 jalan sudah dipakai)
   - B ke A: tersisa 3 - 1 = 2 pilihan jalan (karena 1 jalan sudah dipakai)
   Banyak rute pulang = 3 × 2 = 6 pilihan.

3. Total banyak rute pulang-pergi yang berbeda:
   Total = Rute Berangkat × Rute Pulang
   Total = 12 × 6 = 72 rute.`,
    tipsTrik: 'Aturan Perkalian Berkurang: (3 × 4) × ((4 - 1) × (3 - 1)) = 12 × (3 × 2) = 12 × 6 = 72 rute.',
    targetSeconds: 80,
    similarQuestions: [
      {
        id: 'kom-01-sim1',
        question: 'Kota X ke Y ada 4 jalan, Y ke Z ada 5 jalan. Berapa banyak cara pulang pergi tanpa menggunakan jalan yang sama?',
        options: ['A. 240', 'B. 400', 'C. 120', 'D. 360'],
        correctAnswer: 'A',
        explanation: 'Berangkat: 4 × 5 = 20. Pulang: 4 × 3 = 12. Total = 20 × 12 = 240.',
        tipsTrik: '20 × 12 = 240 cara.',
      },
    ],
  },

  // 10. Kombinatorika & Peluang - Prinsip Sarang Burung (Pigeonhole Principle)
  {
    id: 'kom-02',
    topic: 'Kombinatorika & Peluang',
    subtopic: 'Prinsip Rumah Burung (Pigeonhole)',
    difficulty: 'HOTS',
    format: 'pilihan_ganda',
    question: 'Dalam sebuah kotak gelap terdapat 10 kaos kaki merah, 8 kaos kaki biru, dan 6 kaos kaki putih yang bentuknya identik. Berapa jumlah minimum kaos kaki yang harus diambil secara acak tanpa melihat untuk memastikan kita PASTI mendapatkan setidaknya 1 pasang (2 kaos kaki) berwarna sama?',
    options: [
      'A. 4 kaos kaki',
      'B. 3 kaos kaki',
      'C. 7 kaos kaki',
      'D. 11 kaos kaki',
    ],
    correctAnswer: 'A',
    explanation: `Gunakan Prinsip Rumah Burung (Pigeonhole Principle):
Warna kaos kaki yang ada (wadah/lubang) ada 3 macam warna: Merah, Biru, Putih.

Skenario terburuk (worst-case scenario):
- Pengambilan 1: dapat kaos kaki Merah
- Pengambilan 2: dapat kaos kaki Biru (berbeda warna)
- Pengambilan 3: dapat kaos kaki Putih (ketiganya berbeda warna)

Pada pengambilan ke-4, apapun warna yang terambil (Merah, Biru, atau Putih), PASTI akan cocok dengan salah satu dari 3 warna yang sudah diambil sebelumnya, sehingga terbentuk 1 pasang warna yang sama!
Maka jumlah minimum yang harus diambil adalah 3 + 1 = 4 kaos kaki.`,
    tipsTrik: 'Prinsip Sarang Burung: Jika ada n macam warna, untuk menjamin 1 pasang warna sama, selalu ambil (n + 1) buah! Di sini ada 3 warna -> 3 + 1 = 4 buah!',
    targetSeconds: 50,
    similarQuestions: [
      {
        id: 'kom-02-sim1',
        question: 'Ada permen rasa cokelat, stroberi, vanila, dan mangga. Berapa permen minimal diambil agar pasti ada 2 permen rasa sama?',
        options: ['A. 5', 'B. 4', 'C. 8', 'D. 9'],
        correctAnswer: 'A',
        explanation: 'Ada 4 rasa. Skenario terburuk 4 rasa berbeda. Ambilan ke-5 pasti kembar. 4 + 1 = 5.',
        tipsTrik: 'n jenis rasa -> n + 1 = 4 + 1 = 5 buah.',
      },
    ],
  },

  // 11. Logika & Masalah HOTS - Teka-teki Timbangan Cerdas
  {
    id: 'log-02',
    topic: 'Logika & Masalah HOTS',
    subtopic: 'Timbangan & Eliminasi Ekstrem',
    difficulty: 'HOTS',
    format: 'pilihan_ganda',
    question: 'Terdapat 9 koin emas yang tampak serupa, namun ada 1 koin palsu yang beratnya lebih ringan daripada 8 koin lainnya. Berapakah jumlah penimbangan minimum menggunakan timbangan dua lengan (neraca) untuk memastikan kita dapat menemukan koin palsu tersebut?',
    options: [
      'A. 2 kali',
      'B. 3 kali',
      'C. 4 kali',
      'D. 1 kali',
    ],
    correctAnswer: 'A',
    explanation: `Gunakan metode pembagian 3 kelompok (Trinary Search):
Bagi 9 koin menjadi 3 kelompok sama banyak: Kelompok A (3 koin), Kelompok B (3 koin), Kelompok C (3 koin).

Penimbangan 1:
Timbang Kelompok A melawan Kelompok B.
- Kasus 1: Jika neraca seimbang, koin palsu pasti ada di Kelompok C.
- Kasus 2: Jika salah satu sisi lebih ringan (misal A lebih ringan), koin palsu pasti ada di kelompok A.
Hanya dengan 1 kali timbang, kita berhasil mempersempit sasaran menjadi 3 koin!

Penimbangan 2:
Dari 3 koin yang dicurigai (misal K1, K2, K3), ambil 2 koin dan timbang K1 melawan K2.
- Jika seimbang, koin palsu adalah K3.
- Jika ada yang lebih ringan, itulah koin palsunya!

Jadi cukup 2 kali penimbangan saja.`,
    tipsTrik: 'Kapasitas timbangan neraca adalah 3ⁿ koin dalam n penimbangan. Untuk 9 koin = 3² -> cukup 2 kali timbang!',
    targetSeconds: 65,
    similarQuestions: [
      {
        id: 'log-02-sim1',
        question: 'Berapa kali penimbangan minimum untuk mencari 1 koin palsu lebih ringan di antara 27 koin?',
        options: ['A. 3 kali', 'B. 4 kali', 'C. 5 kali', 'D. 2 kali'],
        correctAnswer: 'A',
        explanation: '27 = 3³. Cukup 3 kali penimbangan (27 -> 9 -> 3 -> 1).',
        tipsTrik: '3ⁿ = 27 -> n = 3 kali.',
      },
    ],
  },

  // 12. Geometri & Pengukuran - Keliling dan Luas Persegi Panjang Bertumpuk
  {
    id: 'geo-03',
    topic: 'Geometri & Pengukuran',
    subtopic: 'Manipulasi Geometri & Penggeseran Garis',
    difficulty: 'Sedang',
    format: 'isian',
    question: 'Sebuah persegi panjang besar berukuran 20 cm × 12 cm dipotong di salah satu sudutnya sehingga membentuk potongan persegi berukuran 4 cm × 4 cm yang hilang. Berapakah keliling bangun hasil potongan tersebut (dalam cm)?',
    correctAnswer: '64',
    explanation: `Mari kita amati perubahan keliling ketika sebuah sudut dipotong:
Jika sudut persegi panjang dipotong secara tegak lurus membentuk anak tangga (L-shape):
- Garis horizontal yang hilang digantikan dengan garis horizontal baru di bagian dalam dengan panjang yang sama persis.
- Garis vertikal yang hilang digantikan dengan garis vertikal baru di bagian dalam dengan panjang yang sama persis.

Dengan demikian, pemotongan sudut persegi panjang TIDAK MENGUBAH keliling sama sekali!
Keliling bangun baru = Keliling persegi panjang semula
= 2 × (Panjang + Lebar)
= 2 × (20 + 12)
= 2 × 32 = 64 cm.`,
    tipsTrik: 'Prinsip Proyeksi Garis: Sudut yang dipotong siku-siku memiliki keliling yang SAMA PERSIS dengan persegi panjang aslinya! 2 × (20 + 12) = 64 cm!',
    targetSeconds: 50,
    similarQuestions: [
      {
        id: 'geo-03-sim1',
        question: 'Persegi panjang 15 cm × 10 cm dipotong sudutnya 3 cm × 3 cm. Berapa kelilingnya?',
        options: ['A. 50 cm', 'B. 44 cm', 'C. 56 cm', 'D. 48 cm'],
        correctAnswer: 'A',
        explanation: 'Keliling tetap sama: 2 × (15 + 10) = 50 cm.',
        tipsTrik: 'Keliling tidak berubah jika potongan di sudut! 2 × 25 = 50 cm.',
      },
    ],
  },
];

export interface ExamPreset {
  id: string;
  name: string;
  badge: string;
  durationMinutes: number;
  questionCount: number;
  description: string;
  targetLevel: string;
  /** Restrict questions to one competition level; omitted = mixed. */
  level?: 'Kabupaten/Kota' | 'Provinsi' | 'Nasional';
  /** Server-side paper blueprint; 'lomba-sd' = 20 PG + 10 isian following the kisi-kisi. */
  blueprint?: 'lomba-sd';
  /** Kisi-kisi shown on the preset card. */
  kisiKisi?: readonly string[];
}

/** Kisi-kisi Lomba Matematika SD (individu). Keep in sync with server/bank/kisi.ts. */
export const KISI_LOMBA_SD = [
  'Operasi Hitung Pecahan & Persen',
  'Teori Bilangan (FPB, KPK, Sifat Keterbagian)',
  'Keliling & Luas Bangun Datar',
  'Bangun Ruang Sederhana',
  'Rata-rata, Median, Modus & Diagram',
  'Pola Bilangan & Kaidah Pencacahan',
] as const;

export const COMPETITION_LEVELS = ['Kabupaten/Kota', 'Provinsi', 'Nasional'] as const;

export const EXAM_PRESETS: ExamPreset[] = [
  {
    id: 'lomba-matematika-sd',
    name: 'Simulasi Lomba Matematika SD (Individu)',
    badge: 'Sesuai Kisi-kisi',
    durationMinutes: 90,
    questionCount: 30,
    description: 'Format lomba individu online: 20 soal pilihan ganda + 10 soal isian singkat dalam 90 menit. Setiap kisi-kisi muncul 5 soal: pecahan & persen, teori bilangan, bangun datar, bangun ruang, statistika & diagram, pola & pencacahan.',
    targetLevel: 'SD Kelas 4, 5, 6',
    blueprint: 'lomba-sd',
    kisiKisi: KISI_LOMBA_SD,
  },
  {
    id: 'osn-sd-kabupaten',
    name: 'Simulasi OSN-K / IYF Tingkat Daerah',
    badge: 'Kabupaten/Kota',
    durationMinutes: 60,
    questionCount: 30,
    description: 'Format OSN-K SD: 30 soal pilihan ganda (8 mudah, 14 sedang, 8 sukar) dalam 60 menit, skor berbobot tanpa nilai minus. Setara babak seleksi daerah IYF JSIT.',
    targetLevel: 'SD Kelas 4, 5, 6',
    level: 'Kabupaten/Kota',
  },
  {
    id: 'osn-sd-provinsi',
    name: 'Simulasi OSN-P / IYF Tingkat Wilayah',
    badge: 'Provinsi',
    durationMinutes: 60,
    questionCount: 20,
    description: 'Format OSN-P SD: 20 soal isian singkat (4 mudah, 8 sedang, 8 sukar) dalam 60 menit. Jawaban berupa bilangan bulat.',
    targetLevel: 'Lolos Kabupaten/Kota',
    level: 'Provinsi',
  },
  {
    id: 'osn-sd-nasional',
    name: 'Simulasi OSN Nasional (Teori I)',
    badge: 'Nasional',
    durationMinutes: 90,
    questionCount: 25,
    description: 'Latihan babak teori nasional: 25 soal isian singkat tingkat HOTS (teori bilangan, kombinatorika, geometri, logika).',
    targetLevel: 'Lolos Provinsi / Pelatnas',
    level: 'Nasional',
  },
  {
    id: 'campuran-semua-tingkat',
    name: 'Simulasi Campuran Semua Tingkat',
    badge: 'Campuran',
    durationMinutes: 45,
    questionCount: 15,
    description: 'Soal acak dari tingkat kabupaten hingga nasional untuk mengukur kesiapan secara menyeluruh.',
    targetLevel: 'Semua Tingkatan SD',
  },
  {
    id: 'latihan-kilat-15',
    name: 'Kuis Cepat Pemantapan Harian',
    badge: 'Latihan Rutin',
    durationMinutes: 15,
    questionCount: 5,
    description: 'Cocok untuk pemanasan harian menjaga konsistensi belajar dan mempertahankan streak harian.',
    targetLevel: 'Semua Tingkatan SD',
    level: 'Kabupaten/Kota',
  },
];
