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
  {
    slug: "mengurangi-risiko-phishing-dengan-kebiasaan-sederhana",
    title: "Mengurangi Risiko Phishing dengan Kebiasaan Sederhana yang Konsisten",
    category: "Awareness",
    excerpt:
      "Sebagian besar serangan phishing berhasil bukan karena teknologinya canggih, tetapi karena proses verifikasi di lapangan belum menjadi kebiasaan tim.",
    coverLabel: "Phishing Defense",
    publishedAt: "22 April 2026",
    readingTime: "6 menit",
    author: "Tim FortyFour",
    tags: ["Phishing", "Awareness", "Email Security"],
    highlight:
      "Pertahanan terhadap phishing dimulai dari perilaku kecil yang dilakukan berulang, bukan hanya dari filter email.",
    sections: [
      {
        heading: "Phishing memanfaatkan momen lengah",
        paragraphs: [
          "Pelaku phishing biasanya memanfaatkan situasi yang terasa mendesak, seperti permintaan reset password, konfirmasi pembayaran, atau dokumen yang tampak penting. Dalam kondisi sibuk, orang cenderung mengambil keputusan cepat tanpa memeriksa konteks secara menyeluruh.",
          "Karena itu, penguatan pertahanan tidak cukup hanya mengandalkan teknologi. Organisasi perlu membentuk refleks verifikasi agar setiap pengguna terbiasa berhenti sejenak sebelum membuka tautan, mengunduh lampiran, atau membagikan informasi sensitif.",
        ],
      },
      {
        heading: "Bangun daftar cek yang mudah diingat",
        paragraphs: [
          "Tim akan lebih mudah menerapkan kebiasaan aman jika panduannya singkat dan relevan. Daftar cek sederhana membantu pegawai mengenali tanda bahaya tanpa perlu menghafal kebijakan yang panjang.",
        ],
        bullets: [
          "Periksa alamat pengirim secara utuh, bukan hanya nama tampilannya.",
          "Konfirmasi permintaan sensitif melalui kanal lain jika terasa mendesak atau tidak biasa.",
          "Hindari mengklik tautan langsung dari email bila bisa membuka sistem melalui bookmark resmi.",
        ],
      },
      {
        heading: "Latihan rutin mempercepat pengenalan ancaman",
        paragraphs: [
          "Simulasi phishing, pembahasan contoh kasus, dan umpan balik singkat setelah insiden kecil membantu tim belajar dari situasi nyata. Frekuensi latihan yang konsisten akan meningkatkan kepekaan tanpa membuat program awareness terasa membebani.",
          "Ketika pelatihan dikaitkan dengan aktivitas kerja sehari-hari, pengguna lebih mudah memahami bahwa keamanan bukan tugas tambahan, melainkan bagian dari kualitas kerja.",
        ],
      },
    ],
    cta: {
      title: "Perkuat awareness tim melalui LMS",
      description:
        "Gunakan materi pembelajaran dan evaluasi di LMS untuk membangun kebiasaan verifikasi yang lebih konsisten di seluruh organisasi.",
      label: "Lihat LMS",
      href: "/lms",
    },
  },
  {
    slug: "menata-akses-pengguna-agar-lebih-aman-dan-terkendali",
    title: "Menata Akses Pengguna agar Lebih Aman dan Terkendali",
    category: "Access Control",
    excerpt:
      "Hak akses yang terlalu luas sering menjadi sumber risiko tersembunyi. Penataan akses yang rapi membantu organisasi membatasi dampak ketika terjadi kesalahan atau insiden.",
    coverLabel: "Access Governance",
    publishedAt: "25 April 2026",
    readingTime: "7 menit",
    author: "Tim FortyFour",
    tags: ["IAM", "Governance", "Least Privilege"],
    highlight:
      "Akses yang tepat bukan soal membatasi pekerjaan, tetapi memastikan setiap orang hanya memiliki kewenangan yang benar-benar diperlukan.",
    sections: [
      {
        heading: "Mulai dari pemetaan peran yang nyata",
        paragraphs: [
          "Banyak organisasi mewarisi struktur akses yang tumbuh tanpa desain yang jelas. Akibatnya, pengguna baru sering menerima hak akses berdasarkan kebiasaan lama, bukan berdasarkan kebutuhan pekerjaannya.",
          "Pemetaan peran yang nyata membantu menyusun paket akses yang sesuai fungsi. Dengan begitu, proses onboarding lebih rapi dan risiko privilege berlebih dapat ditekan sejak awal.",
        ],
      },
      {
        heading: "Terapkan prinsip least privilege secara bertahap",
        paragraphs: [
          "Tidak semua pembenahan akses harus dilakukan sekaligus. Pendekatan bertahap justru lebih aman karena memberi ruang validasi bersama pemilik proses dan pengguna bisnis.",
        ],
        bullets: [
          "Identifikasi akun dengan akses administratif atau akses ke data sensitif terlebih dahulu.",
          "Tinjau akun bersama atasan atau pemilik aplikasi untuk memastikan relevansi akses.",
          "Tetapkan proses persetujuan dan pencabutan akses yang jelas saat ada mutasi peran.",
        ],
      },
      {
        heading: "Jadikan review akses sebagai rutinitas",
        paragraphs: [
          "Review akses berkala membantu organisasi mendeteksi akun lama, akses yang tidak lagi dibutuhkan, atau pengecualian yang terlupakan. Rutinitas ini penting terutama untuk aplikasi kritikal dan sistem yang menyimpan data strategis.",
          "Ketika review akses menjadi bagian dari tata kelola, organisasi akan lebih siap menjaga keseimbangan antara kelancaran operasional dan pengendalian risiko.",
        ],
      },
    ],
    cta: {
      title: "Pelajari kontrol akses dan governance lebih lanjut",
      description:
        "Akses materi terkait tata kelola, peran, dan kontrol keamanan di LMS untuk membantu penyusunan kebijakan yang lebih matang.",
      label: "Buka Materi",
      href: "/lms",
    },
  },
  {
    slug: "membangun-kebiasaan-backup-yang-siap-digunakan-saat-dibutuhkan",
    title: "Membangun Kebiasaan Backup yang Siap Digunakan Saat Dibutuhkan",
    category: "Resilience",
    excerpt:
      "Backup yang baik bukan sekadar ada, tetapi bisa dipulihkan dengan cepat dan telah diuji sesuai prioritas layanan organisasi.",
    coverLabel: "Data Resilience",
    publishedAt: "28 April 2026",
    readingTime: "6 menit",
    author: "Tim FortyFour",
    tags: ["Backup", "Recovery", "Business Continuity"],
    highlight:
      "Nilai backup baru terasa ketika organisasi mampu memulihkan layanan dengan tenang, cepat, dan terukur.",
    sections: [
      {
        heading: "Backup harus mengikuti prioritas bisnis",
        paragraphs: [
          "Tidak semua sistem memiliki tingkat kritikalitas yang sama. Karena itu, strategi backup perlu disusun berdasarkan prioritas layanan, sensitivitas data, dan toleransi gangguan yang disepakati organisasi.",
          "Pendekatan ini membantu tim menentukan frekuensi backup, lokasi penyimpanan, dan target waktu pemulihan yang realistis untuk tiap sistem penting.",
        ],
      },
      {
        heading: "Pisahkan antara menyimpan dan siap memulihkan",
        paragraphs: [
          "Banyak organisasi merasa aman karena backup berjalan otomatis, padahal belum pernah menguji hasil pemulihannya. Backup yang tidak diuji bisa menyimpan kejutan saat dibutuhkan dalam kondisi darurat.",
        ],
        bullets: [
          "Lakukan uji restore berkala untuk memastikan file dan sistem benar-benar dapat dipulihkan.",
          "Dokumentasikan langkah pemulihan agar tidak bergantung pada satu orang saja.",
          "Simpan salinan cadangan dengan kontrol akses dan perlindungan yang memadai.",
        ],
      },
      {
        heading: "Latihan recovery meningkatkan kepercayaan tim",
        paragraphs: [
          "Tabletop exercise dan simulasi pemulihan sederhana membantu tim memahami urutan tindakan saat terjadi gangguan. Selain menguji teknologi, latihan ini juga menguji koordinasi, komunikasi, dan pengambilan keputusan.",
          "Semakin sering proses recovery diuji, semakin besar peluang organisasi menjaga layanan tetap berjalan meski menghadapi insiden yang tidak direncanakan.",
        ],
      },
    ],
    cta: {
      title: "Perdalam topik resilience di LMS FortyFour",
      description:
        "Gunakan materi pembelajaran untuk membantu tim memahami backup, recovery, dan kesinambungan layanan secara lebih terstruktur.",
      label: "Masuk LMS",
      href: "/lms",
    },
  },
];

export function getBlogArticleBySlug(slug: string) {
  return blogArticles.find((article) => article.slug === slug);
}
