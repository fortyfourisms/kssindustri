export interface StaticSurveyRiskItem {
    id: number;
    nama_risiko: string;
    deskripsi: string;
}

export interface StaticSurveySectorItem {
    id: string;
    nama_sub_sektor: string;
}

export const STATIC_SURVEY_SECTORS: StaticSurveySectorItem[] = [
    { id: "manufaktur-umum", nama_sub_sektor: "Manufaktur Umum" },
    { id: "makanan-minuman", nama_sub_sektor: "Manufaktur Makanan dan Minuman" },
    { id: "otomotif", nama_sub_sektor: "Manufaktur Otomotif" },
    { id: "farmasi", nama_sub_sektor: "Manufaktur Farmasi" },
    { id: "tekstil", nama_sub_sektor: "Manufaktur Tekstil" },
    { id: "elektronik", nama_sub_sektor: "Manufaktur Elektronik" },
];

export const STATIC_SURVEY_RISKS: StaticSurveyRiskItem[] = [
    {
        id: 1,
        nama_risiko: "Pencurian Intellectual Property Perusahaan",
        deskripsi:
            "Intellectual Property atau Hak Kekayaan Intelektual mencakup paten, hak cipta, merek dagang, desain industri, rahasia dagang, serta inovasi lain yang menjadi aset strategis bagi perusahaan. Dalam era Industri 4.0, semakin banyak perusahaan mengandalkan teknologi digital untuk menyimpan, mengelola, dan berbagi informasi terkait HAKI mereka. Namun, hal ini juga meningkatkan risiko pencurian HAKI oleh pihak tidak bertanggung jawab, baik melalui serangan siber, insider threat, maupun kebocoran data yang tidak disengaja.",
    },
    {
        id: 2,
        nama_risiko: "Kebocoran Data",
        deskripsi:
            "Kebocoran data atau data breach merupakan risiko ketika informasi penting atau data sensitif milik perusahaan, pelanggan, atau pihak ketiga tersebar secara tidak sah. Insiden ini dapat terjadi karena peretasan, kelalaian karyawan, kegagalan sistem keamanan, maupun kesalahan manusia lainnya.",
    },
    {
        id: 3,
        nama_risiko: "Kerusakan Perangkat Fisik Pada Fasilitas Manufaktur",
        deskripsi:
            "Kerusakan perangkat fisik pada fasilitas manufaktur mencakup kerusakan atau kegagalan pada mesin, peralatan, atau infrastruktur fisik yang digunakan dalam proses produksi atau operasional. Penyebabnya dapat berasal dari pemeliharaan yang tidak memadai, kelalaian operasional, kesalahan teknis, kecelakaan, maupun gangguan tak terduga lainnya.",
    },
    {
        id: 4,
        nama_risiko: "Kehilangan Peralatan Fisik Fasilitas Manufaktur yang Mengganggu Proses Produksi",
        deskripsi:
            "Kehilangan peralatan fisik pada fasilitas manufaktur mencakup hilangnya mesin, alat produksi, atau perangkat pendukung penting dalam operasional perusahaan. Kehilangan ini dapat disebabkan oleh pencurian, kelalaian dalam manajemen inventaris, kesalahan logistik, atau bencana yang menyebabkan aset tidak lagi dapat digunakan.",
    },
    {
        id: 5,
        nama_risiko: "Human Error",
        deskripsi:
            "Human error merujuk pada kesalahan yang dilakukan oleh tenaga kerja dalam operasional fasilitas manufaktur, baik yang disengaja maupun tidak disengaja. Kesalahan dapat terjadi dalam pengaturan mesin, proses perakitan, pemrosesan data, ataupun prosedur keselamatan kerja akibat kurangnya keterampilan, kelelahan, atau tekanan kerja yang tinggi.",
    },
    {
        id: 6,
        nama_risiko: "Pelanggaran Keamanan oleh Pihak Ketiga",
        deskripsi:
            "Pelanggaran keamanan oleh pihak ketiga terjadi ketika vendor, kontraktor, pemasok, atau mitra bisnis melanggar kebijakan keamanan perusahaan, baik secara sengaja maupun tidak sengaja. Insiden ini dapat mencakup akses tidak sah, kebocoran data, sabotase operasional, atau kelalaian dalam menjaga keamanan informasi dan aset fisik.",
    },
    {
        id: 7,
        nama_risiko: "Kurangnya Inisiatif Manajemen Terkait Implementasi Teknologi yang Sesuai",
        deskripsi:
            "Dalam era Industri 4.0, implementasi teknologi menjadi faktor penting dalam efisiensi dan daya saing perusahaan. Kurangnya dukungan manajemen dalam mengadopsi atau mengimplementasikan teknologi yang tepat dapat menimbulkan risiko serius bagi keberlangsungan bisnis, terutama ketika kebutuhan teknologi, alokasi sumber daya, dan kesiapan perubahan tidak dipahami dengan baik.",
    },
    {
        id: 8,
        nama_risiko: "Serangan Virus dan Malware",
        deskripsi:
            "Serangan virus dan malware merupakan salah satu ancaman siber yang paling umum di industri. Malware mencakup berbagai jenis perangkat lunak berbahaya seperti virus, worm, trojan, ransomware, spyware, dan adware yang dirancang untuk merusak, mencuri, atau mengganggu sistem serta data perusahaan.",
    },
    {
        id: 9,
        nama_risiko: "Serangan DDoS (Distributed Denial-of-Service)",
        deskripsi:
            "Serangan Distributed Denial of Service (DDoS) bertujuan membuat sistem, server, atau jaringan tidak dapat diakses dengan cara membanjiri lalu lintas secara berlebihan. Serangan ini biasanya dilakukan menggunakan botnet untuk mengirimkan permintaan masif ke satu target sehingga layanan menjadi lambat atau lumpuh.",
    },
    {
        id: 10,
        nama_risiko: "Serangan Phishing",
        deskripsi:
            "Phishing adalah metode serangan siber yang bertujuan menipu individu agar memberikan informasi sensitif seperti kata sandi, data keuangan, atau kredensial akses sistem. Serangan ini lazim dilakukan melalui email, pesan teks, atau situs web palsu yang dibuat menyerupai sumber resmi atau terpercaya.",
    },
    {
        id: 11,
        nama_risiko: "Serangan Zero Days",
        deskripsi:
            "Serangan zero-day mengeksploitasi kerentanan keamanan pada perangkat lunak, sistem operasi, atau perangkat keras yang belum diketahui oleh pengembang atau belum tersedia patch perbaikannya. Karena celah belum ditangani, organisasi yang terdampak belum memiliki perlindungan memadai terhadap ancaman ini.",
    },
    {
        id: 12,
        nama_risiko: "Serangan Ransomware",
        deskripsi:
            "Ransomware adalah ancaman siber yang mengenkripsi data atau sistem penting perusahaan sehingga korban tidak dapat mengaksesnya. Setelah itu pelaku meminta tebusan agar data atau sistem dapat dipulihkan. Jika tidak ditangani dengan baik, data dapat tetap terkunci, dicuri, atau diperjualbelikan.",
    },
    {
        id: 13,
        nama_risiko: "Serangan Brute Force",
        deskripsi:
            "Serangan brute force adalah metode serangan siber di mana pelaku mencoba menebak kredensial login seperti username dan password melalui berbagai kombinasi secara terus-menerus hingga menemukan yang benar. Serangan ini sering terjadi akibat lemahnya keamanan autentikasi dan tidak diterapkannya pembatasan percobaan login atau MFA.",
    },
    {
        id: 14,
        nama_risiko: "Lainnya",
        deskripsi:
            "Gunakan bagian ini untuk menilai risiko lain yang tidak tercakup pada daftar sebelumnya. Mohon berikan jawaban yang mencerminkan kondisi aktual perusahaan Anda terhadap risiko tambahan tersebut.",
    },
];
