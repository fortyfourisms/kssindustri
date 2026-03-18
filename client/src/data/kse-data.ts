// data/kse-data.ts
// Data struktur untuk Kategorisasi Sistem Elektronik (KSE)

export interface KseOption {
  value: 'A' | 'B' | 'C' | null;
  label: string;
  bobot: number;
}

export interface KseQuestion {
  no: string;
  pertanyaan: string;
  dataDukung: string;
  options: {
    A: { label: string; bobot: number };
    B: { label: string; bobot: number };
    C: { label: string; bobot: number };
  };
}

export interface KseCategory {
  id: string;
  title: string;
  color: string;
  questions: KseQuestion[];
}

export const kseCategories: KseCategory[] = [
  {
    id: 'karakteristik_instansi',
    title: 'Karakteristik Instansi',
    color: '#084696',
    questions: [
      {
        no: '1.1',
        pertanyaan: 'Nilai investasi sistem elektronik yang terpasang',
        dataDukung: 'Daftar jumlah aset TI (hardware/infra, software) dan harga aset saat pengadaan/pembelian',
        options: {
          A: { label: 'Lebih dari Rp.30 Miliar', bobot: 5 },
          B: { label: 'Lebih dari Rp.3 Miliar s/d Rp.30 Miliar', bobot: 2 },
          C: { label: 'Kurang dari Rp.3 Miliar', bobot: 1 },
        },
      },
      {
        no: '1.2',
        pertanyaan: 'Total anggaran operasional tahunan yang dialokasikan untuk pengelolaan Sistem Elektronik',
        dataDukung: 'Budget tahunan untuk perawatan, dan pengembangan SE',
        options: {
          A: { label: 'Lebih dari Rp.10 Miliar', bobot: 5 },
          B: { label: 'Lebih dari Rp.1 Miliar s/d Rp.10 Miliar', bobot: 2 },
          C: { label: 'Kurang dari Rp.1 Miliar', bobot: 1 },
        },
      },
      {
        no: '1.3',
        pertanyaan: 'Memiliki kewajiban kepatuhan terhadap Peraturan atau Standar tertentu',
        dataDukung: 'Daftar undang-undang dan peraturan/regulasi yang harus dipatuhi, khususnya terkait tata kelola IT dan kerahasiaan data/informasi, baik untuk instansi pemerintah, BUMN, swasta.\nBUMN – Permen BUMN\nPemerintah – PP SPIP 60/2008\nMisal PBI/POJK – untuk fintech',
        options: {
          A: { label: 'Peraturan atau Standar nasional dan internasional', bobot: 5 },
          B: { label: 'Peraturan atau Standar nasional', bobot: 2 },
          C: { label: 'Tidak ada Peraturan khusus', bobot: 1 },
        },
      },
      {
        no: '1.4',
        pertanyaan: 'Menggunakan teknik kriptografi khusus untuk keamanan informasi dalam Sistem Elektronik',
        dataDukung: 'Teknologi enkripsi yang digunakan dan Kebijakan/prosedur terkait',
        options: {
          A: { label: 'Teknik kriptografi khusus yang disertifikasi oleh Negara', bobot: 5 },
          B: { label: 'Teknik kriptografi sesuai standar industri, tersedia secara publik atau dikembangkan sendiri', bobot: 2 },
          C: { label: 'Tidak ada penggunaan teknik kriptografi', bobot: 1 },
        },
      },
      {
        no: '1.5',
        pertanyaan: 'Jumlah pengguna Sistem Elektronik',
        dataDukung: 'Daftar pengguna',
        options: {
          A: { label: 'Lebih dari 5.000 pengguna', bobot: 5 },
          B: { label: '1.000 sampai dengan 5.000 pengguna', bobot: 2 },
          C: { label: 'Kurang dari 1.000 pengguna', bobot: 1 },
        },
      },
      {
        no: '1.6',
        pertanyaan: 'Data pribadi yang dikelola Sistem Elektronik',
        dataDukung: 'Daftar informasi / data pribadi yang diproses',
        options: {
          A: { label: 'Data pribadi yang memiliki hubungan dengan Data Pribadi lainnya', bobot: 5 },
          B: { label: 'Data pribadi yang bersifat individu dan/atau data pribadi yang terkait dengan kepemilikan badan usaha', bobot: 2 },
          C: { label: 'Tidak ada data pribadi', bobot: 1 },
        },
      },
      {
        no: '1.7',
        pertanyaan: 'Tingkat klasifikasi/kekritisan Data yang ada dalam Sistem Elektronik, relatif terhadap ancaman upaya penyerangan atau penerobosan keamanan informasi',
        dataDukung: 'Kebijakan/pedoman klasifikasi informasi dan contoh data sesuai klasifikasi',
        options: {
          A: { label: 'Sangat Rahasia', bobot: 5 },
          B: { label: 'Rahasia dan/atau Terbatas', bobot: 2 },
          C: { label: 'Biasa', bobot: 1 },
        },
      },
      {
        no: '1.8',
        pertanyaan: 'Tingkat kekritisan proses yang ada dalam Sistem Elektronik, relatif terhadap ancaman upaya penyerangan atau penerobosan keamanan informasi',
        dataDukung: 'Undang-undang atau regulasi terkait yang menyatakan kekritisan Atau dokumen Business Impact Analysis (BIA) tentang SE',
        options: {
          A: { label: 'Proses yang berisiko mengganggu hajat hidup orang banyak dan memberi dampak langsung pada layanan publik', bobot: 5 },
          B: { label: 'Proses yang berisiko mengganggu hajat hidup orang banyak dan memberi dampak tidak langsung', bobot: 2 },
          C: { label: 'Proses yang hanya berdampak pada bisnis perusahaan', bobot: 1 },
        },
      },
      {
        no: '1.9',
        pertanyaan: 'Dampak dari kegagalan Sistem Elektronik',
        dataDukung: 'Dokumen BIA dan/atau risk register',
        options: {
          A: { label: 'Tidak tersedianya layanan publik berskala nasional atau membahayakan pertahanan keamanan negara', bobot: 5 },
          B: { label: 'Tidak tersedianya layanan publik dalam 1 propinsi atau lebih', bobot: 2 },
          C: { label: 'Tidak tersedianya layanan publik dalam 1 kabupaten/kota atau lebih', bobot: 1 },
        },
      },
      {
        no: '1.10',
        pertanyaan: 'Potensi kerugian atau dampak negatif dari insiden ditembusnya keamanan informasi Sistem Elektronik (sabotase, terorisme)',
        dataDukung: 'Dokumen BIA dan/atau risk register',
        options: {
          A: { label: 'Menimbulkan korban jiwa', bobot: 5 },
          B: { label: 'Terbatas pada kerugian finansial', bobot: 2 },
          C: { label: 'Mengakibatkan gangguan operasional sementara (tidak membahayakan dan merugikan finansial)', bobot: 1 },
        },
      }
    ],
  },
];

// Get total max score
export const getMaxTotalBobot = (): number => {
  let total = 0;
  kseCategories.forEach(cat => {
    cat.questions.forEach(q => {
      total += q.options.A.bobot;
    });
  });
  return total;
};

export const getKategoriSE = (totalBobot: number): { kategori: string; color: string } => {
  if (totalBobot >= 35) {
    return { kategori: 'Strategis', color: '#e74c3c' };
  } else if (totalBobot >= 16) {
    return { kategori: 'Tinggi', color: '#f39c12' };
  } else if (totalBobot >= 10) {
    return { kategori: 'Rendah', color: '#2ecc71' };
  } else {
    return { kategori: 'Belum Lengkap', color: '#6c757d' };
  }
};
