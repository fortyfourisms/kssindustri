export type BlogSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type BlogCta = {
  title: string;
  description: string;
  label: string;
  href: string;
};

export type BlogArticle = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  coverLabel: string;
  publishedAt: string;
  readingTime: string;
  author: string;
  tags: string[];
  highlight: string;
  sections: BlogSection[];
  cta?: BlogCta;
};

export const blogArticles: BlogArticle[] = [
  {
    slug: "membangun-budaya-keamanan-siber-di-perusahaan",
    title: "Membangun Budaya Keamanan Siber yang Hidup di Perusahaan",
    category: "Awareness",
    excerpt:
      "Budaya keamanan siber bukan hanya soal kebijakan, tetapi kebiasaan harian yang dipahami seluruh tim dari level operasional sampai pimpinan.",
    coverLabel: "Security Culture",
    publishedAt: "18 April 2026",
    readingTime: "6 menit",
    author: "Tim FortyFour",
    tags: ["Awareness", "Governance", "People"],
    highlight:
      "Ketika keamanan dipahami sebagai bagian dari cara kerja, organisasi lebih siap mencegah insiden sebelum menjadi krisis.",
    sections: [
      {
        heading: "Mengapa budaya lebih penting daripada sekadar aturan",
        paragraphs: [
          "Banyak organisasi sudah memiliki pedoman keamanan, namun implementasinya sering berhenti di dokumen. Budaya keamanan siber hadir ketika pegawai memahami alasan di balik aturan dan mampu menerapkannya di pekerjaan sehari-hari.",
          "Perubahan perilaku tidak lahir dari satu sesi sosialisasi. Ia dibangun melalui komunikasi yang konsisten, contoh dari pimpinan, dan ruang belajar yang mudah diakses kapan pun dibutuhkan.",
        ],
      },
      {
        heading: "Tanda budaya keamanan mulai tumbuh",
        paragraphs: [
          "Budaya yang sehat biasanya terlihat dari perilaku kecil yang dilakukan secara konsisten. Tim mulai terbiasa memverifikasi permintaan sensitif, menjaga kredensial, dan melaporkan anomali tanpa rasa takut disalahkan.",
        ],
        bullets: [
          "Pegawai aktif bertanya ketika menerima email atau tautan yang meragukan.",
          "Tim operasional memahami prosedur eskalasi insiden dan tahu harus menghubungi siapa.",
          "Pimpinan memberi ruang bagi pelatihan dan evaluasi keamanan secara berkala.",
        ],
      },
      {
        heading: "Peran program belajar yang berkelanjutan",
        paragraphs: [
          "Program belajar yang berkelanjutan membantu organisasi menjaga ritme peningkatan kapasitas. Materi singkat, evaluasi, dan praktik kontekstual memudahkan pegawai menghubungkan teori dengan risiko nyata yang mereka hadapi.",
          "Dengan pendekatan ini, keamanan tidak terasa sebagai beban tambahan, melainkan keterampilan inti yang mendukung performa kerja dan kepercayaan pelanggan.",
        ],
      },
    ],
    cta: {
      title: "Lanjutkan pembelajaran di LMS FortyFour",
      description:
        "Arahkan tim Anda ke materi awareness dan governance agar budaya keamanan siber bisa dibangun secara bertahap dan terukur.",
      label: "Buka LMS",
      href: "/lms",
    },
  },
  {
    slug: "langkah-awal-menyusun-roadmap-kematangan-keamanan-siber",
    title: "Langkah Awal Menyusun Roadmap Kematangan Keamanan Siber",
    category: "Strategy",
    excerpt:
      "Roadmap yang baik membantu organisasi memprioritaskan inisiatif keamanan berdasarkan risiko, kesiapan sumber daya, dan target bisnis.",
    coverLabel: "Cyber Roadmap",
    publishedAt: "15 April 2026",
    readingTime: "7 menit",
    author: "Tim FortyFour",
    tags: ["Strategy", "Assessment", "Roadmap"],
    highlight:
      "Roadmap keamanan yang realistis dimulai dari pemahaman kondisi saat ini, bukan dari daftar teknologi yang ingin dibeli.",
    sections: [
      {
        heading: "Mulai dari baseline yang jelas",
        paragraphs: [
          "Sebelum menyusun target tahunan, organisasi perlu memetakan kondisi awalnya. Baseline ini bisa berasal dari hasil asesmen, audit internal, atau evaluasi proses yang sudah berjalan.",
          "Tanpa baseline, roadmap cenderung berisi daftar inisiatif yang menarik secara teknis tetapi belum tentu menjawab risiko paling kritis.",
        ],
      },
      {
        heading: "Hubungkan prioritas keamanan dengan tujuan bisnis",
        paragraphs: [
          "Roadmap akan lebih mudah dijalankan ketika setiap inisiatif bisa dijelaskan manfaatnya terhadap keberlangsungan bisnis, kepatuhan, atau efisiensi operasi.",
        ],
        bullets: [
          "Tentukan risiko yang paling berdampak pada layanan inti organisasi.",
          "Pisahkan kebutuhan jangka pendek, menengah, dan jangka panjang.",
          "Pastikan ada indikator capaian yang dapat dipantau oleh manajemen.",
        ],
      },
      {
        heading: "Bangun ritme evaluasi dan peningkatan",
        paragraphs: [
          "Roadmap bukan dokumen statis. Evaluasi berkala membantu organisasi menyesuaikan prioritas saat ancaman, regulasi, atau kapasitas tim berubah.",
          "Siklus belajar, pengukuran, dan perbaikan akan membuat roadmap tetap relevan dan benar-benar menjadi alat eksekusi.",
        ],
      },
    ],
    cta: {
      title: "Pelajari materi assessment dan tata kelola di LMS",
      description:
        "Gunakan LMS untuk mendukung penyusunan roadmap melalui materi yang membantu memahami baseline, prioritas, dan evaluasi berkelanjutan.",
      label: "Masuk ke LMS",
      href: "/lms",
    },
  },
  {
    slug: "cara-menyiapkan-tim-respons-insiden-yang-siap-bertindak",
    title: "Cara Menyiapkan Tim Respons Insiden yang Siap Bertindak",
    category: "Incident Response",
    excerpt:
      "Kesiapan respons insiden ditentukan oleh kejelasan peran, jalur komunikasi, dan latihan yang membuat tim mampu bergerak cepat saat tekanan tinggi.",
    coverLabel: "Incident Readiness",
    publishedAt: "10 April 2026",
    readingTime: "5 menit",
    author: "Tim FortyFour",
    tags: ["Incident Response", "Playbook", "Operations"],
    highlight:
      "Saat insiden terjadi, kecepatan respons lahir dari latihan yang terstruktur, bukan improvisasi mendadak.",
    sections: [
      {
        heading: "Definisikan peran sebelum insiden terjadi",
        paragraphs: [
          "Tim respons insiden membutuhkan pembagian peran yang jelas sejak awal. Siapa yang melakukan triase, siapa yang mengomunikasikan status, dan siapa yang mengambil keputusan eskalasi harus disepakati lebih dulu.",
          "Kejelasan ini mengurangi kebingungan ketika tekanan meningkat dan mempercepat proses penanganan.",
        ],
      },
      {
        heading: "Gunakan playbook yang praktis",
        paragraphs: [
          "Playbook yang efektif tidak harus rumit. Yang paling penting adalah langkah-langkah inti mudah dipahami, mudah ditemukan, dan sesuai dengan kondisi organisasi.",
        ],
        bullets: [
          "Sediakan alur untuk deteksi, isolasi, investigasi, pemulihan, dan dokumentasi.",
          "Cantumkan PIC, jalur eskalasi, dan daftar sistem prioritas.",
          "Perbarui playbook setelah latihan atau insiden nyata berlangsung.",
        ],
      },
      {
        heading: "Latihan kecil lebih baik daripada menunggu sempurna",
        paragraphs: [
          "Tabletop exercise, simulasi phishing, atau drill komunikasi internal bisa menjadi langkah awal yang efektif. Latihan rutin membantu tim menemukan celah koordinasi sebelum situasi nyata muncul.",
          "Semakin sering tim berlatih, semakin besar peluang mereka merespons dengan tenang dan terukur.",
        ],
      },
    ],
  },
];

export function getBlogArticleBySlug(slug: string) {
  return blogArticles.find((article) => article.slug === slug);
}
