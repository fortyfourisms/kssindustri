export type CourseActivityItem = {
  title: string;
  type: "Video" | "Kuis" | "PDF" | "Lab";
  duration: string;
};

export type CourseActivityGroup = {
  title: string;
  summary: string;
  items: CourseActivityItem[];
};

export type CourseShowcaseItem = {
  slug: string;
  title: string;
  category: string;
  provider: string;
  duration: string;
  level: string;
  accent: string;
  glow: string;
  summary: string;
  overview: string[];
  participantCategories: string[];
  innovationCategories: string[];
  requirements: Array<{ label: string; value: string }>;
  includes: string[];
  activities: CourseActivityGroup[];
  partnerDescription: string;
};

export const courseShowcaseItems: CourseShowcaseItem[] = [
  {
    slug: "fundamental-keamanan-siber",
    title: "Fundamental Keamanan Siber untuk Tim Operasional",
    category: "Kelas Siber",
    provider: "Pusat Edukasi Keamanan Siber",
    duration: "4 JP",
    level: "Dasar",
    accent: "from-[#1f3c88] via-[#0061ff] to-[#60efff]",
    glow: "from-[#1f3c88]/20 via-[#0061ff]/15 to-transparent",
    summary: "Pengantar terstruktur untuk memahami prinsip dasar keamanan siber, ancaman umum, dan praktik aman yang relevan untuk tim operasional di lingkungan kerja digital.",
    overview: [
      "Kelas ini membantu peserta memahami lanskap ancaman siber, pola serangan yang umum terjadi, dan langkah pencegahan yang dapat diterapkan di aktivitas kerja sehari-hari.",
      "Materi difokuskan pada awareness, kebiasaan kerja aman, pengelolaan akses, serta respons awal ketika menemukan indikasi insiden keamanan informasi.",
    ],
    participantCategories: ["ASN", "Non ASN", "Operator Sistem"],
    innovationCategories: ["Cyber Awareness", "Operational Security"],
    requirements: [
      { label: "Kelengkapan Profil", value: "Minimal data dasar terisi" },
      { label: "Latar Belakang", value: "Terbuka untuk semua unit" },
      { label: "Pengalaman Teknis", value: "Tidak wajib" },
    ],
    includes: ["Sertifikat kelulusan", "4 video pembelajaran", "2 kuis evaluasi", "1 lembar panduan PDF", "Akses materi selamanya"],
    activities: [
      {
        title: "Overview Keamanan Siber",
        summary: "2 aktivitas • 20 menit",
        items: [
          { title: "Memahami ancaman siber modern", type: "Video", duration: "10 menit" },
          { title: "Kuis awareness dasar", type: "Kuis", duration: "10 menit" },
        ],
      },
      {
        title: "Perilaku Aman di Lingkungan Kerja",
        summary: "2 aktivitas • 25 menit",
        items: [
          { title: "Kebiasaan aman saat bekerja daring", type: "Video", duration: "15 menit" },
          { title: "Checklist perilaku aman", type: "PDF", duration: "10 menit" },
        ],
      },
    ],
    partnerDescription: "Program ini disusun untuk memperkuat literasi keamanan siber dasar pada pegawai dan operator sehingga mampu mengenali risiko, menjaga akses, dan bekerja lebih aman dalam ekosistem digital organisasi.",
  },
  {
    slug: "keamanan-jaringan-dan-hardening",
    title: "Keamanan Jaringan dan Hardening Infrastruktur",
    category: "Kelas Siber",
    provider: "FortyFour Cyber Academy",
    duration: "5 JP",
    level: "Menengah",
    accent: "from-[#0f2f6b] via-[#1d4ed8] to-[#22d3ee]",
    glow: "from-[#0f2f6b]/20 via-[#1d4ed8]/15 to-transparent",
    summary: "Pembelajaran teknis mengenai segmentasi jaringan, pengamanan layanan, dan langkah hardening untuk menurunkan permukaan serangan pada infrastruktur digital.",
    overview: [
      "Peserta akan mempelajari cara mengidentifikasi titik lemah pada infrastruktur, menerapkan kontrol dasar, dan membangun konfigurasi yang lebih aman.",
      "Materi menekankan praktik hardening yang realistis untuk server, jaringan internal, dan layanan yang menghadap publik.",
    ],
    participantCategories: ["Tim TI", "Administrator Sistem", "Engineer Infrastruktur"],
    innovationCategories: ["Network Security", "Infrastructure Hardening"],
    requirements: [
      { label: "Kelengkapan Profil", value: "Minimal data teknis terisi" },
      { label: "Pemahaman Dasar", value: "Memahami konsep jaringan" },
      { label: "Akses Lab", value: "Disarankan menggunakan laptop pribadi" },
    ],
    includes: ["Sertifikat penyelesaian", "3 video teknis", "1 lab simulasi", "3 kuis", "Template checklist hardening"],
    activities: [
      {
        title: "Pemetaan Permukaan Serangan",
        summary: "2 aktivitas • 25 menit",
        items: [
          { title: "Eksposur jaringan dan layanan", type: "Video", duration: "15 menit" },
          { title: "Audit cepat permukaan serangan", type: "Lab", duration: "10 menit" },
        ],
      },
      {
        title: "Hardening Praktis",
        summary: "3 aktivitas • 35 menit",
        items: [
          { title: "Baseline konfigurasi aman", type: "Video", duration: "10 menit" },
          { title: "Checklist implementasi", type: "PDF", duration: "10 menit" },
          { title: "Kuis validasi kontrol", type: "Kuis", duration: "15 menit" },
        ],
      },
    ],
    partnerDescription: "Kelas ini dirancang untuk membantu tim teknis menurunkan risiko dari salah konfigurasi dan memperkuat infrastruktur melalui pendekatan hardening yang dapat langsung diterapkan.",
  },
  {
    slug: "manajemen-risiko-siber",
    title: "Manajemen Risiko Siber untuk Industri Strategis",
    category: "Kelas Siber",
    provider: "Direktorat Ketahanan Siber Industri",
    duration: "3 JP",
    level: "Strategis",
    accent: "from-[#173b7a] via-[#2563eb] to-[#67e8f9]",
    glow: "from-[#173b7a]/20 via-[#2563eb]/15 to-transparent",
    summary: "Kelas strategis untuk mengelola risiko siber secara terukur melalui identifikasi aset kritikal, evaluasi dampak, dan prioritisasi kontrol.",
    overview: [
      "Peserta diajak menyusun kerangka kerja sederhana untuk mengenali aset penting, ancaman utama, dan peluang mitigasi yang berdampak tinggi.",
      "Pendekatan pembelajaran disusun agar mudah diterapkan oleh pimpinan unit, pemilik proses bisnis, dan pengelola risiko organisasi.",
    ],
    participantCategories: ["Pimpinan Unit", "Manajer Risiko", "Koordinator TI"],
    innovationCategories: ["Risk Governance", "Cyber Resilience"],
    requirements: [
      { label: "Kelengkapan Profil", value: "Lengkap" },
      { label: "Latar Belakang", value: "Disarankan memahami proses bisnis" },
      { label: "Pengalaman", value: "Minimal pernah terlibat evaluasi risiko" },
    ],
    includes: ["Sertifikat kelulusan", "2 video utama", "2 kuis", "1 template risk register", "Akses arsip materi"],
    activities: [
      {
        title: "Kerangka Risiko Siber",
        summary: "2 aktivitas • 20 menit",
        items: [
          { title: "Dasar identifikasi risiko", type: "Video", duration: "10 menit" },
          { title: "Kuis penilaian dampak", type: "Kuis", duration: "10 menit" },
        ],
      },
      {
        title: "Prioritas Mitigasi",
        summary: "2 aktivitas • 25 menit",
        items: [
          { title: "Menentukan prioritas kontrol", type: "Video", duration: "15 menit" },
          { title: "Template pencatatan risiko", type: "PDF", duration: "10 menit" },
        ],
      },
    ],
    partnerDescription: "Program ini membantu organisasi strategis menghubungkan keputusan bisnis dengan prioritas pengamanan siber sehingga mitigasi lebih fokus, terukur, dan relevan.",
  },
  {
    slug: "deteksi-ancaman-dan-respons-insiden",
    title: "Deteksi Ancaman dan Respons Insiden Digital",
    category: "Kelas Siber",
    provider: "Cyber Incident Response Lab",
    duration: "4 JP",
    level: "Teknis",
    accent: "from-[#102a5c] via-[#0057d9] to-[#38bdf8]",
    glow: "from-[#102a5c]/20 via-[#0057d9]/15 to-transparent",
    summary: "Pelatihan teknis untuk mengenali indikator ancaman, memahami alur triase insiden, dan menjalankan respons awal yang efektif.",
    overview: [
      "Peserta mempelajari alur kerja deteksi, eskalasi, dan dokumentasi insiden agar organisasi mampu merespons lebih cepat dan terkoordinasi.",
      "Materi menekankan praktik operasional seperti validasi alert, triase, containment awal, dan komunikasi insiden.",
    ],
    participantCategories: ["SOC Analyst", "Tim CSIRT", "Administrator TI"],
    innovationCategories: ["Threat Detection", "Incident Response"],
    requirements: [
      { label: "Kelengkapan Profil", value: "Lengkap" },
      { label: "Pemahaman Dasar", value: "Memahami log dan alert" },
      { label: "Prasyarat", value: "Disarankan pernah menggunakan SIEM" },
    ],
    includes: ["Sertifikat teknis", "3 video", "1 lab investigasi", "3 kuis", "Template incident note"],
    activities: [
      {
        title: "Pengenalan Deteksi Ancaman",
        summary: "2 aktivitas • 20 menit",
        items: [
          { title: "Indikator kompromi dan alert", type: "Video", duration: "10 menit" },
          { title: "Mini kuis triase insiden", type: "Kuis", duration: "10 menit" },
        ],
      },
      {
        title: "Respons Awal Insiden",
        summary: "2 aktivitas • 30 menit",
        items: [
          { title: "Containment dan eskalasi", type: "Video", duration: "15 menit" },
          { title: "Simulasi pencatatan insiden", type: "Lab", duration: "15 menit" },
        ],
      },
    ],
    partnerDescription: "Kelas ini mendorong kesiapan operasional tim keamanan dalam mendeteksi dan merespons insiden dengan disiplin proses yang lebih matang.",
  },
  {
    slug: "keamanan-data-dan-privasi",
    title: "Keamanan Data, Privasi, dan Tata Kelola Akses",
    category: "Kelas Siber",
    provider: "National Cyber Learning Hub",
    duration: "3 JP",
    level: "Governance",
    accent: "from-[#203a82] via-[#0f6adf] to-[#5eead4]",
    glow: "from-[#203a82]/20 via-[#0f6adf]/15 to-transparent",
    summary: "Program untuk memahami klasifikasi data, perlindungan privasi, dan pengelolaan hak akses secara tertib dan akuntabel.",
    overview: [
      "Materi membantu peserta memetakan jenis data, mengatur akses berdasarkan kebutuhan, dan menjaga tata kelola yang sesuai dengan prinsip perlindungan informasi.",
      "Kelas ini cocok untuk unit pengelola data, pemilik sistem, maupun tim kepatuhan yang membutuhkan fondasi pengendalian akses yang kuat.",
    ],
    participantCategories: ["Pengelola Data", "PIC Sistem", "Tim Kepatuhan"],
    innovationCategories: ["Data Protection", "Access Governance"],
    requirements: [
      { label: "Kelengkapan Profil", value: "Minimal lengkap" },
      { label: "Latar Belakang", value: "Terbuka untuk semua fungsi" },
      { label: "Pengetahuan Awal", value: "Tidak wajib" },
    ],
    includes: ["Sertifikat kelulusan", "2 video", "1 PDF panduan", "2 kuis", "Template akses berbasis peran"],
    activities: [
      {
        title: "Klasifikasi dan Perlindungan Data",
        summary: "2 aktivitas • 20 menit",
        items: [
          { title: "Memahami klasifikasi informasi", type: "Video", duration: "10 menit" },
          { title: "Panduan label dan kontrol data", type: "PDF", duration: "10 menit" },
        ],
      },
      {
        title: "Akses dan Akuntabilitas",
        summary: "2 aktivitas • 20 menit",
        items: [
          { title: "Prinsip least privilege", type: "Video", duration: "10 menit" },
          { title: "Kuis tata kelola akses", type: "Kuis", duration: "10 menit" },
        ],
      },
    ],
    partnerDescription: "Program ini membantu organisasi membangun disiplin pengelolaan data dan akses sehingga perlindungan informasi berjalan lebih konsisten dan dapat diaudit.",
  },
  {
    slug: "secure-coding-dan-devsecops",
    title: "Secure Coding dan DevSecOps untuk Aplikasi Modern",
    category: "Kelas Siber",
    provider: "FortyFour Secure Engineering",
    duration: "5 JP",
    level: "Lanjutan",
    accent: "from-[#16356f] via-[#2563eb] to-[#22c55e]",
    glow: "from-[#16356f]/20 via-[#2563eb]/15 to-transparent",
    summary: "Kelas lanjutan untuk pengembang dan engineer yang ingin mengintegrasikan keamanan ke dalam siklus pengembangan aplikasi modern.",
    overview: [
      "Peserta akan memahami risiko umum pada aplikasi, praktik secure coding, dan pendekatan DevSecOps untuk deteksi dini kerentanan.",
      "Materi disusun untuk membantu tim engineering membangun pipeline yang lebih aman tanpa mengorbankan kecepatan delivery.",
    ],
    participantCategories: ["Developer", "QA Engineer", "DevOps Engineer"],
    innovationCategories: ["Secure SDLC", "DevSecOps"],
    requirements: [
      { label: "Kelengkapan Profil", value: "Lengkap" },
      { label: "Kemampuan Dasar", value: "Pernah terlibat pengembangan aplikasi" },
      { label: "Prasyarat", value: "Memahami alur CI/CD dasar" },
    ],
    includes: ["Sertifikat penyelesaian", "3 video", "1 lab praktik", "3 kuis", "Checklist secure coding"],
    activities: [
      {
        title: "Secure Coding Essentials",
        summary: "2 aktivitas • 25 menit",
        items: [
          { title: "Kerentanan umum pada aplikasi", type: "Video", duration: "15 menit" },
          { title: "Kuis validasi secure coding", type: "Kuis", duration: "10 menit" },
        ],
      },
      {
        title: "Integrasi DevSecOps",
        summary: "2 aktivitas • 30 menit",
        items: [
          { title: "Pipeline keamanan berkelanjutan", type: "Video", duration: "15 menit" },
          { title: "Lab review pipeline", type: "Lab", duration: "15 menit" },
        ],
      },
    ],
    partnerDescription: "Kelas ini membantu tim engineering menggeser praktik keamanan lebih awal ke siklus pengembangan sehingga kualitas dan keamanan aplikasi meningkat bersama.",
  },
];

export function getCourseShowcaseBySlug(slug: string) {
  return courseShowcaseItems.find((course) => course.slug === slug);
}
