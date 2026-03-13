// Static target values (tetap global untuk semua stakeholder)
export const ikasDataStatic = {
    identifikasi: {
        peran_tanggung_jawab: 2.51,
        strategi_kebijakan: 2.51,
        aset_informasi: 2.51,
        risiko_keamanan: 2.51,
        rantai_pasok: 2.51,
    },
    proteksi: {
        identitas_autentikasi: 2.51,
        aset_fisik: 2.51,
        data: 2.51,
        aplikasi: 2.51,
        jaringan: 2.51,
        sdm: 2.51,
    },
    deteksi: {
        deteksi_peristiwa: 2.51,
        anomali_peristiwa: 2.51,
        pemantauan_berkelanjutan: 2.51,
    },
    tanggulih: {
        perencanaan_pemulihan: 2.51,
        analisis_pelaporan: 2.51,
        pelaksanaan_pemulihan: 2.51,
        peningkatan_keamanan: 2.51,
    }
};

export const getMaturityLabel = (score: number): string => {
    if (score <= 0) return "INPUT BELUM LENGKAP";
    if (score < 1.50) return "Level 1 - Awal";
    if (score < 2.50) return "Level 2 - Berulang";
    if (score < 3.50) return "Level 3 - Terdefinisi";
    if (score < 4.50) return "Level 4 - Terkelola";
    return "Level 5 - Inovatif";
};
