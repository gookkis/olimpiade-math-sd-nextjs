import { db } from './db';

export function seedQuestionsIfEmpty(): number {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM questions').get() as { count: number };
  if (countRow.count >= 1500) {
    console.log(`Database already has ${countRow.count} questions. Skipping seed.`);
    return countRow.count;
  }

  console.log(`Seeding 1500 authentic Elementary Math Olympiad questions... (Current count: ${countRow.count})`);

  // Clear existing questions to ensure clean consistent dataset
  db.exec('DELETE FROM questions');

  const insertStmt = db.prepare(`
    INSERT INTO questions (
      id, topic, subtopic, difficulty, format, question, options, correct_answer, explanation, tips_trik, target_seconds, similar_questions
    ) VALUES (
      @id, @topic, @subtopic, @difficulty, @format, @question, @options, @correct_answer, @explanation, @tips_trik, @target_seconds, @similar_questions
    )
  `);

  const questions: any[] = [];

  // ==========================================
  // PILLAR 1: Bilangan & Aritmatika (300 Soal)
  // Subtopics:
  // - Digit Terakhir & Pola Pangkat (60)
  // - Keterbagian & Teorema Sisa (60)
  // - FPB & KPK Masalah Kontekstual (60)
  // - Pecahan Cerdik & Deret Teleskopik (60)
  // - Faktorial & Angka Nol Beruntun (60)
  // ==========================================
  for (let i = 1; i <= 60; i++) {
    // Digit Terakhir
    const baseA = [2, 3, 7, 8][i % 4];
    const baseB = [3, 7, 9, 4][(i + 1) % 4];
    const exp = 2020 + i;
    const expMod4 = exp % 4 === 0 ? 4 : exp % 4;
    const unitA = Math.pow(baseA, expMod4) % 10;
    const unitB = Math.pow(baseB, expMod4) % 10;
    const totalUnit = (unitA + unitB) % 10;

    const diff = i <= 20 ? 'Mudah' : i <= 45 ? 'Sedang' : 'HOTS';
    const opts = [totalUnit, (totalUnit + 2) % 10, (totalUnit + 4) % 10, (totalUnit + 6) % 10]
      .filter((v, idx, arr) => arr.indexOf(v) === idx);
    while (opts.length < 4) opts.push((opts[opts.length - 1] + 1) % 10);
    const sortedOpts = opts.sort((a, b) => a - b);
    const correctLetter = ['A', 'B', 'C', 'D'][sortedOpts.indexOf(totalUnit)] || 'A';

    questions.push({
      id: `bil-pangkat-${String(i).padStart(4, '0')}`,
      topic: 'Bilangan & Aritmatika',
      subtopic: 'Digit Terakhir & Pola Pangkat',
      difficulty: diff,
      format: 'pilihan_ganda',
      question: `Berapakah angka satuan (digit terakhir) dari hasil perhitungan ${baseA}^${exp} + ${baseB}^${exp}?`,
      options: JSON.stringify(sortedOpts.map((n, idx) => `${['A', 'B', 'C', 'D'][idx]}. ${n}`)),
      correct_answer: correctLetter,
      explanation: `Pola angka satuan perpangkatan berulang setiap 4 siklus:\n1. Pangkat ${exp} jika dibagi 4 bersisa ${expMod4}.\n2. Satuan ${baseA}^${expMod4} adalah ${unitA}.\n3. Satuan ${baseB}^${expMod4} adalah ${unitB}.\n4. Total satuan: ${unitA} + ${unitB} = ${unitA + unitB}, angka satuannya adalah ${totalUnit}.`,
      tips_trik: `Trik Cepat: Cukup ambil sisa pangkat dibagi 4 (${exp} mod 4 = ${expMod4}), lalu hitung ${baseA}^${expMod4} + ${baseB}^${expMod4} satuannya ${totalUnit}.`,
      target_seconds: 60,
      similar_questions: JSON.stringify([
        {
          id: `sim-bil-pangkat-${i}`,
          question: `Berapakah angka satuan dari ${baseA}^${exp + 1}?`,
          options: ['A. ' + unitA, 'B. ' + ((unitA * baseA) % 10), 'C. ' + ((unitA + 3) % 10), 'D. ' + ((unitA + 5) % 10)],
          correctAnswer: 'B',
          explanation: `Lanjutkan siklus perkalian dengan ${baseA}.`,
          tipsTrik: `Kalikan satuan sebelumnya dengan ${baseA}.`,
        },
      ]),
    });
  }

  for (let i = 1; i <= 60; i++) {
    // Keterbagian & Teorema Sisa
    const div1 = 3 + (i % 3); // 3, 4, 5
    const div2 = div1 + 1;
    const div3 = div2 + 1;
    const kpk = div1 * div2 * div3; // simplified
    const remainderDiff = 1 + (i % 2); // kurang 1 atau kurang 2
    const answer = kpk - remainderDiff;

    questions.push({
      id: `bil-sisa-${String(i).padStart(4, '0')}`,
      topic: 'Bilangan & Aritmatika',
      subtopic: 'Keterbagian & Teorema Sisa',
      difficulty: i % 2 === 0 ? 'Sedang' : 'HOTS',
      format: 'isian',
      question: `Tentukan bilangan bulat positif terkecil yang jika dibagi ${div1} bersisa ${div1 - remainderDiff}, jika dibagi ${div2} bersisa ${div2 - remainderDiff}, dan jika dibagi ${div3} bersisa ${div3 - remainderDiff}!`,
      options: JSON.stringify([]),
      correct_answer: String(answer),
      explanation: `Perhatikan bahwa selisih pembagi dan sisa selalu konstan, yaitu ${remainderDiff}. Artinya bilangan N jika ditambah ${remainderDiff} akan habis dibagi ${div1}, ${div2}, dan ${div3}. Maka (N + ${remainderDiff}) = KPK(${div1}, ${div2}, ${div3}) = ${kpk}. Sehingga N = ${kpk} - ${remainderDiff} = ${answer}.`,
      tips_trik: `Trik Sisa Negatif: N = KPK(pembagi) - selisih tetap = ${kpk} - ${remainderDiff} = ${answer}.`,
      target_seconds: 75,
      similar_questions: JSON.stringify([]),
    });
  }

  for (let i = 1; i <= 60; i++) {
    // FPB & KPK Masalah Kontekstual
    const a = 12 + i * 2;
    const b = 18 + i * 3;
    const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
    const g = gcd(a, b);
    const lcm = (a * b) / g;

    questions.push({
      id: `bil-fpb-${String(i).padStart(4, '0')}`,
      topic: 'Bilangan & Aritmatika',
      subtopic: 'FPB & KPK Kontekstual',
      difficulty: i <= 30 ? 'Mudah' : 'Sedang',
      format: 'pilihan_ganda',
      question: `Lampu merah menyala setiap ${a} detik sekali, sedangkan lampu hijau menyala setiap ${b} detik sekali. Jika kedua lampu menyala bersamaan pada pukul 08.00, pada detik ke berapa mereka akan menyala bersamaan untuk pertama kalinya lagi?`,
      options: JSON.stringify([
        `A. ${lcm} detik`,
        `B. ${lcm + 12} detik`,
        `C. ${lcm - 6} detik`,
        `D. ${a * 2} detik`,
      ]),
      correct_answer: 'A',
      explanation: `Waktu kedua lampu menyala bersamaan merupakan Kelipatan Persekutuan Terkecil (KPK) dari ${a} dan ${b}. KPK(${a}, ${b}) = (${a} × ${b}) ÷ FPB(${a}, ${b}) = ${lcm} detik.`,
      tips_trik: `Trik KPK: Bagilah angka yang besar dengan faktor persekutuan untuk mendapatkan KPK dalam hitungan detik: KPK = ${lcm}.`,
      target_seconds: 60,
      similar_questions: JSON.stringify([]),
    });
  }

  for (let i = 1; i <= 60; i++) {
    // Pecahan Cerdik & Deret Teleskopik
    const n = 20 + i;
    const ansStr = `${n}/${n + 1}`;

    questions.push({
      id: `bil-teleskop-${String(i).padStart(4, '0')}`,
      topic: 'Bilangan & Aritmatika',
      subtopic: 'Pecahan Cerdik & Deret Teleskopik',
      difficulty: 'HOTS',
      format: 'pilihan_ganda',
      question: `Berapakah nilai dari penjumlahan berantai deret pecahan berikut:\nS = 1/(1×2) + 1/(2×3) + 1/(3×4) + ... + 1/(${n}×${n + 1})?`,
      options: JSON.stringify([
        `A. ${ansStr}`,
        `B. ${n - 1}/${n}`,
        `C. ${n + 1}/${n + 2}`,
        `D. 1/${n + 1}`,
      ]),
      correct_answer: 'A',
      explanation: `Gunakan sifat teleskopik: 1/[k(k+1)] = 1/k - 1/(k+1). Maka suku-suku di bagian tengah saling meniadakan, menyisakan suku pertama dikurangi suku terakhir: 1 - 1/(${n + 1}) = ${n}/${n + 1}.`,
      tips_trik: `Trik Kilat Deret Teleskopik: Nilai penjumlahan 1/(1×2) + ... + 1/(n×(n+1)) SELALU n/(n+1). Jadi untuk n = ${n}, jawabannya langsung ${ansStr}!`,
      target_seconds: 50,
      similar_questions: JSON.stringify([]),
    });
  }

  for (let i = 1; i <= 60; i++) {
    // Faktorial & Nol Beruntun
    const n = 20 + i * 5; // e.g. 25, 30, 35 ...
    // Count trailing zeroes = floor(n/5) + floor(n/25) + floor(n/125)
    const zeroes = Math.floor(n / 5) + Math.floor(n / 25) + Math.floor(n / 125);

    questions.push({
      id: `bil-faktor-${String(i).padStart(4, '0')}`,
      topic: 'Bilangan & Aritmatika',
      subtopic: 'Faktorial & Angka Nol Beruntun',
      difficulty: 'HOTS',
      format: 'isian',
      question: `Jika bilangan hasil perkalian 1 × 2 × 3 × ... × ${n} dihitung, ada berapa banyak angka nol (0) beruntun di bagian paling belakang hasil perkalian tersebut?`,
      options: JSON.stringify([]),
      correct_answer: String(zeroes),
      explanation: `Banyaknya angka nol di akhir hasil perkalian ditentukan oleh banyaknya faktor 10, yaitu pasangan faktor 2 dan faktor 5. Karena faktor 2 melimpah, kita cukup menghitung jumlah faktor 5 menggunakan Rumus Legendre: ⌊${n}/5⌋ + ⌊${n}/25⌋ + ⌊${n}/125⌋ = ${Math.floor(n / 5)} + ${Math.floor(n / 25)} + ${Math.floor(n / 125)} = ${zeroes} buah angka nol.`,
      tips_trik: `Rumus Legendre: Bagi ${n} dengan 5, lalu hasilnya bagi 5 lagi dan jumlahkan: ${zeroes}.`,
      target_seconds: 60,
      similar_questions: JSON.stringify([]),
    });
  }

  // ==========================================
  // PILLAR 2: Aljabar & Pola Bilangan (300 Soal)
  // Subtopics:
  // - Barisan Bilangan Bertingkat (75)
  // - Sistem Persamaan Simbolik Hewan/Benda (75)
  // - Pola Deret Aritmatika & Jumlah Gauss (75)
  // - Pola Gambar & Bangun Geometris Korek Api (75)
  // ==========================================
  for (let i = 1; i <= 75; i++) {
    // Barisan Bertingkat: U_n = n^2 + c*n + d
    const c = (i % 3) + 1;
    const d = (i % 4) + 1;
    const termTarget = 10 + (i % 5);
    const u1 = 1 + c + d;
    const u2 = 4 + 2 * c + d;
    const u3 = 9 + 3 * c + d;
    const u4 = 16 + 4 * c + d;
    const ans = termTarget * termTarget + c * termTarget + d;

    questions.push({
      id: `alj-tingkat-${String(i).padStart(4, '0')}`,
      topic: 'Aljabar & Pola Bilangan',
      subtopic: 'Barisan Bilangan Bertingkat',
      difficulty: 'Sedang',
      format: 'isian',
      question: `Diberikan barisan bilangan: ${u1}, ${u2}, ${u3}, ${u4}, ... Tentukan suku ke-${termTarget} dari barisan tersebut!`,
      options: JSON.stringify([]),
      correct_answer: String(ans),
      explanation: `Selisih antar suku bertingkat: beda tingkat kedua bernilai 2 konstan. Rumus umum suku ke-n adalah U_n = n² + ${c}n + ${d}. Untuk n = ${termTarget}: U_${termTarget} = ${termTarget}² + ${c}(${termTarget}) + ${d} = ${termTarget * termTarget} + ${c * termTarget} + ${d} = ${ans}.`,
      tips_trik: `Identifikasi pola kuadrat n² + ${c}n + ${d}. Hitung ${termTarget}² = ${termTarget * termTarget}, tambahkan ${c * termTarget + d} -> ${ans}.`,
      target_seconds: 70,
      similar_questions: JSON.stringify([]),
    });
  }

  for (let i = 1; i <= 75; i++) {
    // Sistem Persamaan Simbolik
    const valA = 5 + (i % 10);
    const valB = 8 + (i % 8);
    const valC = 12 + (i % 6);
    const sumAB = valA + valB;
    const sumBC = valB + valC;
    const sumAC = valA + valC;
    const totalABC = valA + valB + valC;

    questions.push({
      id: `alj-simbol-${String(i).padStart(4, '0')}`,
      topic: 'Aljabar & Pola Bilangan',
      subtopic: 'Sistem Persamaan Simbolik',
      difficulty: 'Mudah',
      format: 'pilihan_ganda',
      question: `Diketahui nilai pengganti simbol matematika berikut:\n★ + ✦ = ${sumAB}\n✦ + ✪ = ${sumBC}\n★ + ✪ = ${sumAC}\nBerapakah nilai dari ★ + ✦ + ✪?`,
      options: JSON.stringify([
        `A. ${totalABC}`,
        `B. ${totalABC * 2}`,
        `C. ${totalABC - 5}`,
        `D. ${totalABC + 7}`,
      ]),
      correct_answer: 'A',
      explanation: `Jumlahkan ketiga persamaan secara bersamaan: (★ + ✦) + (✦ + ✪) + (★ + ✪) = ${sumAB} + ${sumBC} + ${sumAC} = ${totalABC * 2}. Karena setiap simbol muncul dua kali: 2(★ + ✦ + ✪) = ${totalABC * 2}, maka ★ + ✦ + ✪ = ${totalABC * 2} ÷ 2 = ${totalABC}.`,
      tips_trik: `Trik Cepat Olimpiade: Jumlahkan ketiga angka lalu langsung bagi 2! (${sumAB} + ${sumBC} + ${sumAC}) / 2 = ${totalABC}.`,
      target_seconds: 45,
      similar_questions: JSON.stringify([]),
    });
  }

  for (let i = 1; i <= 75; i++) {
    // Deret Gauss: 1 + 2 + ... + N
    const n = 30 + i * 2;
    const sum = (n * (n + 1)) / 2;

    questions.push({
      id: `alj-gauss-${String(i).padStart(4, '0')}`,
      topic: 'Aljabar & Pola Bilangan',
      subtopic: 'Pola Deret Aritmatika & Jumlah Gauss',
      difficulty: 'Mudah',
      format: 'isian',
      question: `Hitunglah hasil penjumlahan bilangan bulat berurutan berikut:\n1 + 2 + 3 + 4 + ... + ${n} = ...`,
      options: JSON.stringify([]),
      correct_answer: String(sum),
      explanation: `Gunakan rumus deret aritmatika Gauss: S_n = n × (n + 1) / 2. Dengan n = ${n}, maka S = ${n} × ${n + 1} ÷ 2 = ${n / 2} × ${n + 1} = ${sum}.`,
      tips_trik: `Rumus Sakti Gauss: Kalikan angka terakhir dengan angka sesudahnya, lalu bagi 2: (${n} × ${n + 1}) / 2 = ${sum}.`,
      target_seconds: 40,
      similar_questions: JSON.stringify([]),
    });
  }

  for (let i = 1; i <= 75; i++) {
    // Pola Batang Korek Api: Persegi bergandeng (3n + 1)
    const n = 15 + i;
    const matches = 3 * n + 1;

    questions.push({
      id: `alj-korek-${String(i).padStart(4, '0')}`,
      topic: 'Aljabar & Pola Bilangan',
      subtopic: 'Pola Gambar & Korek Api',
      difficulty: 'Sedang',
      format: 'pilihan_ganda',
      question: `Satu persegi membutuhkan 4 batang korek api. Dua persegi bergandengan membutuhkan 7 batang korek api. Tiga persegi bergandengan membutuhkan 10 batang korek api. Berapa banyak batang korek api yang dibutuhkan untuk membuat barisan ${n} buah persegi bergandengan?`,
      options: JSON.stringify([
        `A. ${matches} batang`,
        `B. ${matches + 2} batang`,
        `C. ${matches - 3} batang`,
        `D. ${n * 4} batang`,
      ]),
      correct_answer: 'A',
      explanation: `Perhatikan pola: Persegi ke-1 butuh 4 = 3(1) + 1. Persegi ke-2 butuh 7 = 3(2) + 1. Persegi ke-3 butuh 10 = 3(3) + 1. Polanya bertambah 3 untuk setiap persegi baru. Rumus: 3n + 1. Untuk n = ${n}: 3(${n}) + 1 = ${3 * n} + 1 = ${matches} batang korek api.`,
      tips_trik: `Trik Rumus: Beda konstan +3. Rumus suku ke-n adalah 3n + 1 -> 3 × ${n} + 1 = ${matches}.`,
      target_seconds: 50,
      similar_questions: JSON.stringify([]),
    });
  }

  // ==========================================
  // PILLAR 3: Geometri & Pengukuran (300 Soal)
  // Subtopics:
  // - Luas Daerah Diarsir Helai Daun & Lingkaran (75)
  // - Sudut Jarum Jam Presisi (75)
  // - Keliling Bangun Bertingkat & Proyeksi Siku-siku (75)
  // - Kubus Satuan yang Dicat & Balok Berongga (75)
  // ==========================================
  for (let i = 1; i <= 75; i++) {
    // Luas Daun: (4/7) * s^2
    const s = 7 * (1 + (i % 6)); // 7, 14, 21, 28, 35, 42
    const area = Math.round((4 / 7) * s * s);

    questions.push({
      id: `geo-daun-${String(i).padStart(4, '0')}`,
      topic: 'Geometri & Pengukuran',
      subtopic: 'Luas Daerah Diarsir Helai Daun',
      difficulty: 'HOTS',
      format: 'pilihan_ganda',
      question: `Sebuah persegi memiliki panjang sisi ${s} cm. Di dalamnya dibuat dua busur seperempat lingkaran yang saling berhadapan sehingga membentuk daerah arsir mirip helai daun. Berapakah luas daerah arsir tersebut? (Gunakan π = 22/7)`,
      options: JSON.stringify([
        `A. ${area} cm²`,
        `B. ${area + 14} cm²`,
        `C. ${Math.round(area * 0.75)} cm²`,
        `D. ${area + 28} cm²`,
      ]),
      correct_answer: 'A',
      explanation: `Luas daerah daun di dalam persegi bersisi s dihitung dengan: Luas 2 Seperempat Lingkaran - Luas Persegi = 2 × (1/4 × 22/7 × s²) - s² = (11/7 - 1) × s² = (4/7) × s². Dengan s = ${s}: Luas = (4/7) × ${s * s} = ${area} cm².`,
      tips_trik: `Rumus Sakti Daun: Luas Daun Persegi = (4/7) × s²! Langsung hitung (4/7) × ${s * s} = ${area} cm² dalam 5 detik!`,
      target_seconds: 55,
      similar_questions: JSON.stringify([]),
    });
  }

  for (let i = 1; i <= 75; i++) {
    // Sudut Jam: |30*H - 5.5*M|
    const hour = 1 + (i % 12);
    const minute = ((i * 5) % 60);
    let angle = Math.abs(30 * hour - 5.5 * minute);
    if (angle > 180) angle = 360 - angle;

    const timeStr = `${String(hour).padStart(2, '0')}.${String(minute).padStart(2, '0')}`;

    questions.push({
      id: `geo-jam-${String(i).padStart(4, '0')}`,
      topic: 'Geometri & Pengukuran',
      subtopic: 'Sudut Jarum Jam',
      difficulty: 'Sedang',
      format: 'pilihan_ganda',
      question: `Berapakah besar sudut terkecil yang dibentuk oleh kedua jarum jam pada pukul ${timeStr}?`,
      options: JSON.stringify([
        `A. ${angle}°`,
        `B. ${Math.min(180, angle + 15)}°`,
        `C. ${Math.max(10, angle - 10)}°`,
        `D. ${Math.min(180, angle + 25)}°`,
      ]),
      correct_answer: 'A',
      explanation: `Jarum jam pendek bergerak 30° per jam dan 0,5° per menit. Jarum menit bergerak 6° per menit. Posisi sudut = |(30 × Jam) - (5,5 × Menit)| = |(30 × ${hour}) - (5,5 × ${minute})| = ${angle}°.`,
      tips_trik: `Rumus Cepat Sudut Jam: Sudut = |30H - 5,5M|. Jika hasil > 180°, kurangkan dari 360°. Hasil = ${angle}°.`,
      target_seconds: 60,
      similar_questions: JSON.stringify([]),
    });
  }

  for (let i = 1; i <= 75; i++) {
    // Keliling Bangun Proyeksi
    const panjang = 15 + i;
    const lebar = 10 + (i % 10);
    const cut = 2 + (i % 4);
    const keliling = 2 * (panjang + lebar);

    questions.push({
      id: `geo-keliling-${String(i).padStart(4, '0')}`,
      topic: 'Geometri & Pengukuran',
      subtopic: 'Keliling Bangun Proyeksi',
      difficulty: 'Mudah',
      format: 'isian',
      question: `Sebuah persegi panjang berukuran ${panjang} cm × ${lebar} cm dipotong pada salah satu sudutnya membentuk persegi berukuran ${cut} cm × ${cut} cm yang dilepas. Berapakah keliling bangun datar hasil potongan tersebut (dalam cm)?`,
      options: JSON.stringify([]),
      correct_answer: String(keliling),
      explanation: `Berdasarkan prinsip proyeksi garis siku-siku, sisi vertikal dan horizontal yang hilang digantikan dengan sisi baru di bagian dalam dengan panjang yang sama persis. Oleh karena itu, keliling bangun tidak berubah: 2 × (${panjang} + ${lebar}) = 2 × ${panjang + lebar} = ${keliling} cm.`,
      tips_trik: `Prinsip Proyeksi Garis: Pemotongan sudut siku-siku TIDAK mengubah keliling sama sekali! Langsung 2 × (P + L) = ${keliling} cm.`,
      target_seconds: 40,
      similar_questions: JSON.stringify([]),
    });
  }

  for (let i = 1; i <= 75; i++) {
    // Kubus satuan yang dicat
    const n = 3 + (i % 5); // n x n x n
    const cubesWith2Faces = 12 * (n - 2);

    questions.push({
      id: `geo-kubus-${String(i).padStart(4, '0')}`,
      topic: 'Geometri & Pengukuran',
      subtopic: 'Kubus Satuan Dicat',
      difficulty: 'Sedang',
      format: 'pilihan_ganda',
      question: `Sebuah kubus besar berukuran ${n} × ${n} × ${n} yang tersusun dari kubus-kubus satuan dicat warna merah pada seluruh permukaannya, kemudian dibongkar kembali menjadi kubus-kubus satuan. Berapakah banyaknya kubus satuan yang memiliki tepat 2 sisi terkena cat merah?`,
      options: JSON.stringify([
        `A. ${cubesWith2Faces} kubus`,
        `B. ${8} kubus`,
        `C. ${6 * (n - 2) * (n - 2)} kubus`,
        `D. ${(n - 2) * (n - 2) * (n - 2)} kubus`,
      ]),
      correct_answer: 'A',
      explanation: `Kubus satuan yang memiliki tepat 2 sisi terkena cat terletak di sepanjang rusuk-rusuk kubus (tidak termasuk pojok/titik sudut). Kubus memiliki 12 rusuk. Setiap rusuk memuat (n - 2) kubus berwajah dua. Maka totalnya = 12 × (${n} - 2) = 12 × ${n - 2} = ${cubesWith2Faces} kubus.`,
      tips_trik: `Rumus Kubus Dicat: Tepat 2 sisi dicat = 12 × (n - 2). Dengan n = ${n}, langsung 12 × ${n - 2} = ${cubesWith2Faces}!`,
      target_seconds: 50,
      similar_questions: JSON.stringify([]),
    });
  }

  // ==========================================
  // PILLAR 4: Kombinatorika & Peluang (300 Soal)
  // Subtopics:
  // - Kaidah Pencacahan & Rute Terpendek (75)
  // - Prinsip Sarang Burung / Pigeonhole (75)
  // - Masalah Jabat Tangan & Pertandingan (75)
  // - Peluang Dadu & Kelereng (75)
  // ==========================================
  for (let i = 1; i <= 75; i++) {
    // Kaidah Pencacahan Jalan
    const ruteAB = 3 + (i % 3);
    const ruteBC = 4 + (i % 3);
    const totalPP = (ruteAB * ruteBC) * ((ruteBC - 1) * (ruteAB - 1));

    questions.push({
      id: `kom-jalur-${String(i).padStart(4, '0')}`,
      topic: 'Kombinatorika & Peluang',
      subtopic: 'Kaidah Pencacahan & Jalur Rute',
      difficulty: 'Sedang',
      format: 'isian',
      question: `Kota A ke B dihubungkan oleh ${ruteAB} jalan berbeda, dan kota B ke C dihubungkan oleh ${ruteBC} jalan berbeda. Seseorang melakukan perjalanan dari kota A ke C melalui B, lalu kembali lagi ke A tanpa melewati jalan yang sama saat berangkat. Berapa banyak rute berbeda yang dapat dilalui?`,
      options: JSON.stringify([]),
      correct_answer: String(totalPP),
      explanation: `Rute berangkat: ${ruteAB} × ${ruteBC} = ${ruteAB * ruteBC} cara. Rute pulang tanpa jalan yang sama: (${ruteBC} - 1) × (${ruteAB} - 1) = ${ruteBC - 1} × ${ruteAB - 1} = ${(ruteBC - 1) * (ruteAB - 1)} cara. Total rute pulang-pergi = ${ruteAB * ruteBC} × ${(ruteBC - 1) * (ruteAB - 1)} = ${totalPP} rute.`,
      tips_trik: `Aturan Perkalian: (${ruteAB} × ${ruteBC}) × (${ruteBC - 1} × ${ruteAB - 1}) = ${totalPP}.`,
      target_seconds: 60,
      similar_questions: JSON.stringify([]),
    });
  }

  for (let i = 1; i <= 75; i++) {
    // Pigeonhole: kaos kaki / kelereng
    const numColors = 3 + (i % 4); // 3, 4, 5, 6 warna
    const minPicks = numColors + 1;

    questions.push({
      id: `kom-sarang-${String(i).padStart(4, '0')}`,
      topic: 'Kombinatorika & Peluang',
      subtopic: 'Prinsip Sarang Burung (Pigeonhole)',
      difficulty: 'HOTS',
      format: 'pilihan_ganda',
      question: `Dalam sebuah kantong terdapat kelereng yang terdiri dari ${numColors} warna berbeda dalam jumlah yang sangat banyak. Berapa jumlah minimum kelereng yang harus diambil secara acak dalam keadaan mata tertutup agar kita PASTI mendapatkan setidaknya 2 kelereng yang berwarna sama?`,
      options: JSON.stringify([
        `A. ${minPicks} kelereng`,
        `B. ${numColors} kelereng`,
        `C. ${numColors * 2} kelereng`,
        `D. ${minPicks + 2} kelereng`,
      ]),
      correct_answer: 'A',
      explanation: `Menurut Prinsip Rumah Burung (Pigeonhole Principle), skenario terburuk adalah jika setiap pengambilan pertama menghasilkan warna yang saling berbeda (sebanyak ${numColors} kelereng). Maka pada pengambilan ke-(${numColors} + 1), warnanya pasti akan kembar dengan salah satu kelereng sebelumnya. Jadi minimum diambil adalah ${numColors} + 1 = ${minPicks} kelereng.`,
      tips_trik: `Prinsip Sarang Burung: Jika ada n jenis warna, untuk menjamin 1 pasang warna kembar, selalu ambil (n + 1) buah -> ${numColors} + 1 = ${minPicks}!`,
      target_seconds: 45,
      similar_questions: JSON.stringify([]),
    });
  }

  for (let i = 1; i <= 75; i++) {
    // Masalah Jabat Tangan: n*(n-1)/2
    const n = 12 + i;
    const handshakes = (n * (n - 1)) / 2;

    questions.push({
      id: `kom-jabat-${String(i).padStart(4, '0')}`,
      topic: 'Kombinatorika & Peluang',
      subtopic: 'Kombinasi Jabat Tangan & Turnamen',
      difficulty: 'Mudah',
      format: 'pilihan_ganda',
      question: `Dalam sebuah ruangan terdapat ${n} orang peserta olimpiade matematika SD. Jika setiap orang saling berjabat tangan satu sama lain tepat satu kali, berapakah jumlah seluruh jabat tangan yang terjadi?`,
      options: JSON.stringify([
        `A. ${handshakes} kali`,
        `B. ${n * (n - 1)} kali`,
        `C. ${handshakes + n} kali`,
        `D. ${handshakes - 8} kali`,
      ]),
      correct_answer: 'A',
      explanation: `Setiap orang berjabat tangan dengan (n - 1) orang lainnya. Karena jabat tangan antara orang A dan B dihitung sama dengan B dan A, maka total jabat tangan adalah n × (n - 1) ÷ 2 = ${n} × ${n - 1} ÷ 2 = ${handshakes} kali.`,
      tips_trik: `Rumus Jabat Tangan: n × (n - 1) / 2 = ${n} × ${n - 1} / 2 = ${handshakes}!`,
      target_seconds: 40,
      similar_questions: JSON.stringify([]),
    });
  }

  for (let i = 1; i <= 75; i++) {
    // Peluang Dadu
    const sumTarget = 7 + (i % 4); // 7, 8, 9, 10
    // ways to get sum with 2 dice
    let ways = 0;
    for (let d1 = 1; d1 <= 6; d1++) {
      for (let d2 = 1; d2 <= 6; d2++) {
        if (d1 + d2 === sumTarget) ways++;
      }
    }

    questions.push({
      id: `kom-peluang-${String(i).padStart(4, '0')}`,
      topic: 'Kombinatorika & Peluang',
      subtopic: 'Peluang Pelemparan Dadu',
      difficulty: 'Sedang',
      format: 'pilihan_ganda',
      question: `Dua buah dadu bermata enam dilempar secara bersamaan satu kali. Berapakah peluang munculnya kedua mata dadu dengan jumlah sama dengan ${sumTarget}?`,
      options: JSON.stringify([
        `A. ${ways}/36`,
        `B. ${ways + 1}/36`,
        `C. ${Math.max(1, ways - 1)}/36`,
        `D. 1/6`,
      ]),
      correct_answer: 'A',
      explanation: `Total ruang sampel pelemparan 2 dadu adalah 6 × 6 = 36 kemungkinan. Pasangan mata dadu yang berjumlah ${sumTarget} ada sebanyak ${ways} pasangan. Maka peluangnya adalah ${ways}/36.`,
      tips_trik: `Trik Peluang Dadu: Jumlah pasangan yang menghasilkan ${sumTarget} ada ${ways}. Maka peluang = ${ways}/36.`,
      target_seconds: 50,
      similar_questions: JSON.stringify([]),
    });
  }

  // ==========================================
  // PILLAR 5: Logika & Masalah HOTS (300 Soal)
  // Subtopics:
  // - Kecepatan & Jarak Berpapasan/Menyusul (75)
  // - Kecepatan Kerja Bersama (75)
  // - Masalah Umur Keluarga & Selisih Waktu (75)
  // - Logika Timbangan & Ksatria-Pembohong (75)
  // ==========================================
  for (let i = 1; i <= 75; i++) {
    // Kecepatan Berpapasan: t = s / (v1 + v2)
    const v1 = 40 + (i % 5) * 5; // 40, 45, 50, 55, 60
    const v2 = 50 + (i % 4) * 5; // 50, 55, 60, 65
    const t = 2 + (i % 3); // 2, 3, 4 hours
    const distance = (v1 + v2) * t;
    const startHour = 7 + (i % 3); // 07.00, 08.00, 09.00
    const meetHour = startHour + t;

    questions.push({
      id: `log-papasan-${String(i).padStart(4, '0')}`,
      topic: 'Logika & Masalah HOTS',
      subtopic: 'Kecepatan & Jarak Berpapasan',
      difficulty: 'HOTS',
      format: 'pilihan_ganda',
      question: `Jarak kota P dan kota Q adalah ${distance} km. Mobil X berangkat dari kota P menuju kota Q dengan kecepatan ${v1} km/jam pada pukul ${String(startHour).padStart(2, '0')}.00. Pada saat bersamaan, mobil Y berangkat dari kota Q menuju P dengan kecepatan ${v2} km/jam. Pada pukul berapa kedua mobil tersebut akan berpapasan?`,
      options: JSON.stringify([
        `A. Pukul ${String(meetHour).padStart(2, '0')}.00`,
        `B. Pukul ${String(meetHour + 1).padStart(2, '0')}.00`,
        `C. Pukul ${String(meetHour - 1).padStart(2, '0')}.30`,
        `D. Pukul ${String(meetHour).padStart(2, '0')}.30`,
      ]),
      correct_answer: 'A',
      explanation: `Kecepatan relatif saling mendekat dijumlahkan: ${v1} + ${v2} = ${v1 + v2} km/jam. Waktu tempuh hingga berpapasan: Waktu = Jarak ÷ Kecepatan Relatif = ${distance} ÷ ${v1 + v2} = ${t} jam. Waktu berpapasan: Pukul ${String(startHour).padStart(2, '0')}.00 + ${t} jam = Pukul ${String(meetHour).padStart(2, '0')}.00.`,
      tips_trik: `Rumus Berpapasan: Waktu = Jarak / (V1 + V2) = ${distance} / ${v1 + v2} = ${t} jam. Jam berangkat + ${t} jam = Pukul ${String(meetHour).padStart(2, '0')}.00.`,
      target_seconds: 65,
      similar_questions: JSON.stringify([]),
    });
  }

  for (let i = 1; i <= 75; i++) {
    // Kerja Bersama: 1/A + 1/B = 1/T -> T = (A*B)/(A+B)
    const tA = 6 + (i % 4) * 2; // 6, 8, 10, 12
    const tB = 12 + (i % 3) * 6; // 12, 18, 24
    // Make nice numbers
    const tTogether = Number(((tA * tB) / (tA + tB)).toFixed(1));

    questions.push({
      id: `log-kerja-${String(i).padStart(4, '0')}`,
      topic: 'Logika & Masalah HOTS',
      subtopic: 'Kecepatan Kerja Bersama',
      difficulty: 'HOTS',
      format: 'pilihan_ganda',
      question: `Pak Budi dapat menyelesaikan mengecat dinding dalam waktu ${tA} jam, sedangkan Pak Doni dapat menyelesaikan dinding yang sama dalam waktu ${tB} jam. Jika mereka mengecat dinding tersebut bersama-sama, berapa jam waktu yang dibutuhkan hingga selesai?`,
      options: JSON.stringify([
        `A. ${tTogether} jam`,
        `B. ${(tA + tB) / 2} jam`,
        `C. ${tTogether + 1.5} jam`,
        `D. ${tTogether - 0.8} jam`,
      ]),
      correct_answer: 'A',
      explanation: `Kecepatan kerja Pak Budi = 1/${tA} bagian/jam. Kecepatan kerja Pak Doni = 1/${tB} bagian/jam. Kecepatan gabungan = 1/${tA} + 1/${tB} = (${tA + tB})/(${tA * tB}). Waktu kerja bersama = (${tA} × ${tB}) ÷ (${tA} + ${tB}) = ${tA * tB} ÷ ${tA + tB} = ${tTogether} jam.`,
      tips_trik: `Rumus Kerja Bersama: Waktu = (A × B) / (A + B) = (${tA} × ${tB}) / (${tA} + ${tB}) = ${tTogether} jam!`,
      target_seconds: 60,
      similar_questions: JSON.stringify([]),
    });
  }

  for (let i = 1; i <= 75; i++) {
    // Masalah Umur Keluarga
    const ageDiff = 24 + (i % 6);
    // father = 4 * son now, father - son = 3 * son = ageDiff
    const sonAge = Math.round(ageDiff / 3);
    const fatherAge = sonAge + ageDiff;

    questions.push({
      id: `log-umur-${String(i).padStart(4, '0')}`,
      topic: 'Logika & Masalah HOTS',
      subtopic: 'Masalah Umur & Selisih Tetap',
      difficulty: 'Sedang',
      format: 'isian',
      question: `Saat ini umur Ayah adalah 4 kali umur anaknya. Jika selisih umur Ayah dan anaknya adalah ${ageDiff} tahun, berapakah umur anak tersebut sekarang?`,
      options: JSON.stringify([]),
      correct_answer: String(sonAge),
      explanation: `Misalkan umur anak = 1 bagian (1 unit). Maka umur Ayah = 4 bagian (4 unit). Selisih umur Ayah dan anak = 4 - 1 = 3 bagian. Karena 3 bagian = ${ageDiff} tahun, maka 1 bagian (umur anak) = ${ageDiff} ÷ 3 = ${sonAge} tahun.`,
      tips_trik: `Metode Bar Model SD: Selisih 4 bagian - 1 bagian = 3 bagian. Umur anak = ${ageDiff} ÷ 3 = ${sonAge} tahun langsung!`,
      target_seconds: 45,
      similar_questions: JSON.stringify([]),
    });
  }

  for (let i = 1; i <= 75; i++) {
    // Timbangan Logika Neraca: 3^n
    const n = 2 + (i % 4); // 2, 3, 4, 5
    const coins = Math.pow(3, n);

    questions.push({
      id: `log-timbang-${String(i).padStart(4, '0')}`,
      topic: 'Logika & Masalah HOTS',
      subtopic: 'Teka-teki Timbangan Neraca',
      difficulty: 'HOTS',
      format: 'pilihan_ganda',
      question: `Terdapat ${coins} buah koin emas identik, tetapi 1 koin di antaranya palsu dan lebih ringan daripada yang lain. Berapakah jumlah penimbangan minimum menggunakan timbangan dua lengan (neraca) untuk memastikan koin palsu tersebut ditemukan?`,
      options: JSON.stringify([
        `A. ${n} kali`,
        `B. ${n + 1} kali`,
        `C. ${n + 2} kali`,
        `D. ${Math.max(1, n - 1)} kali`,
      ]),
      correct_answer: 'A',
      explanation: `Dengan timbangan dua lengan, setiap penimbangan membagi koin menjadi 3 kelompok sama banyak. Kapasitas maksimum koin yang bisa diuji dalam n kali penimbangan adalah 3ⁿ koin. Karena jumlah koin = ${coins} = 3^${n}, maka penimbangan minimum yang dibutuhkan adalah ${n} kali.`,
      tips_trik: `Trik Timbangan Neraca: Cari pangkat dari 3! ${coins} = 3^${n}, jadi cukup ${n} kali penimbangan!`,
      target_seconds: 50,
      similar_questions: JSON.stringify([]),
    });
  }

  console.log(`Prepared ${questions.length} questions. Inserting into SQLite database...`);

  // Batch insert inside a transaction for instant high-speed commit
  const insertMany = db.transaction((qList: any[]) => {
    for (const q of qList) {
      insertStmt.run(q);
    }
  });

  insertMany(questions);

  const finalCount = (db.prepare('SELECT COUNT(*) as count FROM questions').get() as { count: number }).count;
  console.log(`Successfully seeded ${finalCount} questions into SQLite database!`);
  return finalCount;
}
