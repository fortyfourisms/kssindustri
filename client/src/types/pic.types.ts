export interface PICPerusahaan {
    id: string;
    nama: string;
    email: string;
    telepon: string;
    perusahaan: {
        id: string;
        nama_perusahaan: string;
    };
    created_at: string;
    updated_at: string;
}
