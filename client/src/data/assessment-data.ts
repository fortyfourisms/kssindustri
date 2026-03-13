import type { AssessmentData } from '@/types/assessment.types';

export const assessmentData: AssessmentData = {
    domains: [
        {
            id: 'identifikasi',
            name: 'IDENTIFIKASI',
            color: '#00a2e8',
            categories: [
                {
                    id: 'peran-tanggung-jawab',
                    domainId: 'identifikasi',
                    name: 'Peran dan Tanggung Jawab Organisasi',
                    subCategories: [
                        {
                            id: 'peran-keamanan',
                            categoryId: 'peran-tanggung-jawab',
                            name: 'Peran Keamanan Siber',
                            questions: [
                                {
                                    id: 'ID-PTJ-PK-001',
                                    categoryId: 'peran-tanggung-jawab',
                                    subCategoryId: 'peran-keamanan',
                                    text: 'Apakah organisasi telah menetapkan peran dan tanggung jawab keamanan siber secara formal?',
                                    scope: 'Tata Kelola',
                                    indexDescriptions: {
                                        0: 'Belum ada penetapan peran keamanan siber',
                                        1: 'Peran keamanan siber informal dan tidak terdokumentasi',
                                        2: 'Peran keamanan siber ada namun belum jelas pembagiannya',
                                        3: 'Peran dan tanggung jawab keamanan siber terdokumentasi dan dikomunikasikan',
                                        4: 'Peran keamanan siber dikelola aktif dengan evaluasi berkala',
                                        5: 'Peran keamanan siber terintegrasi dengan struktur organisasi dan best practice industri'
                                    }
                                },
                                {
                                    id: 'ID-PTJ-PK-002',
                                    categoryId: 'peran-tanggung-jawab',
                                    subCategoryId: 'peran-keamanan',
                                    text: 'Apakah terdapat pimpinan yang bertanggung jawab langsung atas keamanan siber (CISO/Security Officer)?',
                                    scope: 'Tata Kelola',
                                    indexDescriptions: {
                                        0: 'Tidak ada pimpinan keamanan siber',
                                        1: 'Keamanan siber ditangani secara ad-hoc oleh IT',
                                        2: 'Ada penunjukan informal untuk keamanan siber',
                                        3: 'Security Officer ditunjuk secara formal dengan job description jelas',
                                        4: 'CISO/Security Officer memiliki akses langsung ke pimpinan tertinggi',
                                        5: 'CISO/Security Officer terintegrasi dalam keputusan strategis organisasi'
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 'strategi-kebijakan',
                    domainId: 'identifikasi',
                    name: 'Strategi, Kebijakan, dan Prosedur Keamanan Siber',
                    subCategories: [
                        {
                            id: 'kebijakan-keamanan',
                            categoryId: 'strategi-kebijakan',
                            name: 'Kebijakan Keamanan',
                            questions: [
                                {
                                    id: 'ID-SK-KK-001',
                                    categoryId: 'strategi-kebijakan',
                                    subCategoryId: 'kebijakan-keamanan',
                                    text: 'Apakah organisasi memiliki kebijakan keamanan informasi yang terdokumentasi dan disetujui pimpinan?',
                                    scope: 'Tata Kelola',
                                    indexDescriptions: {
                                        0: 'Tidak ada kebijakan keamanan informasi',
                                        1: 'Kebijakan informal tanpa dokumentasi resmi',
                                        2: 'Kebijakan ada namun belum disetujui pimpinan',
                                        3: 'Kebijakan terdokumentasi, disetujui, dan dikomunikasikan',
                                        4: 'Kebijakan ditinjau dan diperbarui secara berkala',
                                        5: 'Kebijakan terintegrasi dengan standar internasional (ISO 27001, NIST)'
                                    }
                                },
                                {
                                    id: 'ID-SK-KK-002',
                                    categoryId: 'strategi-kebijakan',
                                    subCategoryId: 'kebijakan-keamanan',
                                    text: 'Apakah prosedur keamanan siber telah didokumentasikan dan disosialisasikan ke seluruh pegawai?',
                                    scope: 'Tata Kelola',
                                    indexDescriptions: {
                                        0: 'Tidak ada prosedur keamanan siber',
                                        1: 'Prosedur informal tidak tertulis',
                                        2: 'Prosedur terdokumentasi namun belum disosialisasikan',
                                        3: 'Prosedur terdokumentasi dan disosialisasikan ke seluruh pegawai',
                                        4: 'Prosedur diaudit dan diperbaharui secara berkala',
                                        5: 'Prosedur terintegrasi dengan sistem manajemen mutu organisasi'
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 'aset-informasi',
                    domainId: 'identifikasi',
                    name: 'Pengelolaan Aset Informasi',
                    subCategories: [
                        {
                            id: 'inventaris-aset',
                            categoryId: 'aset-informasi',
                            name: 'Inventaris Aset',
                            questions: [
                                {
                                    id: 'ID-AI-IA-001',
                                    categoryId: 'aset-informasi',
                                    subCategoryId: 'inventaris-aset',
                                    text: 'Apakah organisasi memiliki inventaris aset informasi yang lengkap dan terkini?',
                                    scope: 'Teknologi',
                                    indexDescriptions: {
                                        0: 'Tidak ada inventaris aset informasi',
                                        1: 'Inventaris aset tidak lengkap dan tidak terpelihara',
                                        2: 'Inventaris ada namun tidak lengkap atau tidak terkini',
                                        3: 'Inventaris aset lengkap dan diperbarui secara berkala',
                                        4: 'Inventaris dikelola dengan sistem otomatis',
                                        5: 'Inventaris terintegrasi dengan CMDB dan manajemen aset organisasi'
                                    }
                                },
                                {
                                    id: 'ID-AI-IA-002',
                                    categoryId: 'aset-informasi',
                                    subCategoryId: 'inventaris-aset',
                                    text: 'Apakah setiap aset informasi telah diklasifikasikan berdasarkan tingkat kritikalitasnya?',
                                    scope: 'Tata Kelola',
                                    indexDescriptions: {
                                        0: 'Tidak ada klasifikasi aset',
                                        1: 'Klasifikasi informal tanpa standar',
                                        2: 'Klasifikasi ada namun tidak konsisten diterapkan',
                                        3: 'Klasifikasi terdokumentasi dan diterapkan konsisten',
                                        4: 'Klasifikasi ditinjau berkala sesuai perubahan risiko',
                                        5: 'Klasifikasi terintegrasi dengan framework keamanan nasional'
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 'risiko-keamanan',
                    domainId: 'identifikasi',
                    name: 'Penilaian dan Pengelolaan Risiko Keamanan Siber',
                    subCategories: [
                        {
                            id: 'penilaian-risiko',
                            categoryId: 'risiko-keamanan',
                            name: 'Penilaian Risiko',
                            questions: [
                                {
                                    id: 'ID-RK-PR-001',
                                    categoryId: 'risiko-keamanan',
                                    subCategoryId: 'penilaian-risiko',
                                    text: 'Apakah organisasi melakukan penilaian risiko keamanan siber secara berkala?',
                                    scope: 'Tata Kelola',
                                    indexDescriptions: {
                                        0: 'Tidak ada penilaian risiko',
                                        1: 'Penilaian risiko ad-hoc tanpa metodologi',
                                        2: 'Penilaian risiko dengan metodologi namun tidak berkala',
                                        3: 'Penilaian risiko berkala dengan metodologi formal',
                                        4: 'Risiko dikelola dengan tools dan dashboard monitoring',
                                        5: 'Manajemen risiko terintegrasi dengan ERM organisasi'
                                    }
                                },
                                {
                                    id: 'ID-RK-PR-002',
                                    categoryId: 'risiko-keamanan',
                                    subCategoryId: 'penilaian-risiko',
                                    text: 'Apakah terdapat rencana mitigasi risiko yang terdokumentasi untuk setiap risiko yang teridentifikasi?',
                                    scope: 'Tata Kelola',
                                    indexDescriptions: {
                                        0: 'Tidak ada rencana mitigasi risiko',
                                        1: 'Mitigasi risiko dilakukan secara ad-hoc',
                                        2: 'Rencana mitigasi ada untuk sebagian risiko',
                                        3: 'Rencana mitigasi terdokumentasi untuk semua risiko utama',
                                        4: 'Mitigasi risiko dipantau dan dievaluasi berkala',
                                        5: 'Mitigasi risiko terintegrasi dengan kontrol keamanan otomatis'
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 'risiko-rantai-pasok',
                    domainId: 'identifikasi',
                    name: 'Pengelolaan Risiko Rantai Pasok',
                    subCategories: [
                        {
                            id: 'vendor-management',
                            categoryId: 'risiko-rantai-pasok',
                            name: 'Manajemen Vendor',
                            questions: [
                                {
                                    id: 'ID-RR-VM-001',
                                    categoryId: 'risiko-rantai-pasok',
                                    subCategoryId: 'vendor-management',
                                    text: 'Apakah organisasi menerapkan evaluasi keamanan siber terhadap vendor/pihak ketiga?',
                                    scope: 'Tata Kelola',
                                    indexDescriptions: {
                                        0: 'Tidak ada evaluasi keamanan vendor',
                                        1: 'Evaluasi informal tanpa kriteria jelas',
                                        2: 'Evaluasi ada namun tidak komprehensif',
                                        3: 'Evaluasi keamanan vendor terdokumentasi dan konsisten',
                                        4: 'Monitoring keamanan vendor secara berkala',
                                        5: 'Supply chain security terintegrasi dengan framework organisasi'
                                    }
                                },
                                {
                                    id: 'ID-RR-VM-002',
                                    categoryId: 'risiko-rantai-pasok',
                                    subCategoryId: 'vendor-management',
                                    text: 'Apakah kontrak dengan vendor mencakup persyaratan keamanan siber yang jelas?',
                                    scope: 'Tata Kelola',
                                    indexDescriptions: {
                                        0: 'Tidak ada persyaratan keamanan dalam kontrak',
                                        1: 'Persyaratan keamanan minimal dan tidak standar',
                                        2: 'Persyaratan keamanan ada namun tidak lengkap',
                                        3: 'Persyaratan keamanan standar dalam semua kontrak vendor',
                                        4: 'SLA keamanan dengan audit hak dan penalti',
                                        5: 'Kontrak terintegrasi dengan compliance framework (ISO, SOC2)'
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            id: 'proteksi',
            name: 'PROTEKSI',
            color: '#8e44ad',
            categories: [
                {
                    id: 'identitas-akses',
                    domainId: 'proteksi',
                    name: 'Pengelolaan Identitas, Autentikasi, dan Kendali Akses',
                    subCategories: [
                        {
                            id: 'autentikasi',
                            categoryId: 'identitas-akses',
                            name: 'Autentikasi',
                            questions: [
                                {
                                    id: 'PR-IA-AU-001',
                                    categoryId: 'identitas-akses',
                                    subCategoryId: 'autentikasi',
                                    text: 'Apakah organisasi menerapkan mekanisme autentikasi yang kuat untuk akses sistem?',
                                    scope: 'Teknologi',
                                    indexDescriptions: {
                                        0: 'Tidak ada mekanisme autentikasi',
                                        1: 'Autentikasi password sederhana',
                                        2: 'Autentikasi password dengan standar minimum',
                                        3: 'Multi-factor authentication untuk sistem kritis',
                                        4: 'MFA untuk seluruh sistem dengan monitoring aktif',
                                        5: 'Autentikasi adaptif berbasis risiko (zero-trust)'
                                    }
                                },
                                {
                                    id: 'PR-IA-AU-002',
                                    categoryId: 'identitas-akses',
                                    subCategoryId: 'autentikasi',
                                    text: 'Apakah terdapat kebijakan pengelolaan akses berbasis prinsip least privilege?',
                                    scope: 'Tata Kelola',
                                    indexDescriptions: {
                                        0: 'Tidak ada pembatasan akses',
                                        1: 'Pembatasan akses minimal',
                                        2: 'Prinsip least privilege diterapkan sebagian',
                                        3: 'Least privilege diterapkan konsisten',
                                        4: 'Review akses berkala dengan sistem otomatis',
                                        5: 'Zero-trust architecture terimplementasi penuh'
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 'aset-fisik',
                    domainId: 'proteksi',
                    name: 'Perlindungan Aset Fisik',
                    subCategories: [
                        {
                            id: 'keamanan-fisik',
                            categoryId: 'aset-fisik',
                            name: 'Keamanan Fisik',
                            questions: [
                                {
                                    id: 'PR-AF-KF-001',
                                    categoryId: 'aset-fisik',
                                    subCategoryId: 'keamanan-fisik',
                                    text: 'Apakah data center dan ruang server dilindungi dengan kontrol akses fisik?',
                                    scope: 'Teknologi',
                                    indexDescriptions: {
                                        0: 'Tidak ada kontrol akses fisik',
                                        1: 'Kontrol akses fisik minimal (kunci biasa)',
                                        2: 'Kontrol akses dengan kartu akses',
                                        3: 'Kontrol akses biometrik dan CCTV',
                                        4: 'Kontrol akses terintegrasi dengan monitoring 24/7',
                                        5: 'Physical security terintegrasi dengan SOC'
                                    }
                                },
                                {
                                    id: 'PR-AF-KF-002',
                                    categoryId: 'aset-fisik',
                                    subCategoryId: 'keamanan-fisik',
                                    text: 'Apakah terdapat prosedur pengelolaan pengunjung dan akses tamu ke area sensitif?',
                                    scope: 'Tata Kelola',
                                    indexDescriptions: {
                                        0: 'Tidak ada prosedur pengelolaan pengunjung',
                                        1: 'Pengelolaan pengunjung informal',
                                        2: 'Prosedur registrasi pengunjung dasar',
                                        3: 'Prosedur pengunjung dengan pendampingan wajib',
                                        4: 'Sistem visitor management terintegrasi',
                                        5: 'Visitor management dengan background check dan NDA'
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 'perlindungan-data',
                    domainId: 'proteksi',
                    name: 'Perlindungan Data',
                    subCategories: [
                        {
                            id: 'enkripsi-data',
                            categoryId: 'perlindungan-data',
                            name: 'Enkripsi Data',
                            questions: [
                                {
                                    id: 'PR-PD-ED-001',
                                    categoryId: 'perlindungan-data',
                                    subCategoryId: 'enkripsi-data',
                                    text: 'Apakah data sensitif dienkripsi saat penyimpanan (at rest) dan transmisi (in transit)?',
                                    scope: 'Teknologi',
                                    indexDescriptions: {
                                        0: 'Tidak ada enkripsi data',
                                        1: 'Enkripsi diterapkan sebagian',
                                        2: 'Enkripsi untuk data sensitif tertentu',
                                        3: 'Enkripsi at rest dan in transit untuk semua data sensitif',
                                        4: 'Enkripsi dengan key management system',
                                        5: 'End-to-end encryption dengan HSM'
                                    }
                                },
                                {
                                    id: 'PR-PD-ED-002',
                                    categoryId: 'perlindungan-data',
                                    subCategoryId: 'enkripsi-data',
                                    text: 'Apakah terdapat prosedur backup dan recovery data yang terdokumentasi?',
                                    scope: 'Teknologi',
                                    indexDescriptions: {
                                        0: 'Tidak ada backup data',
                                        1: 'Backup ad-hoc tanpa jadwal',
                                        2: 'Backup terjadwal namun belum diuji',
                                        3: 'Backup terjadwal dengan pengujian recovery berkala',
                                        4: 'Backup otomatis dengan monitoring integritas',
                                        5: 'Backup dengan geo-redundancy dan DR testing rutin'
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 'perlindungan-aplikasi',
                    domainId: 'proteksi',
                    name: 'Perlindungan Aplikasi',
                    subCategories: [
                        {
                            id: 'keamanan-aplikasi',
                            categoryId: 'perlindungan-aplikasi',
                            name: 'Keamanan Aplikasi',
                            questions: [
                                {
                                    id: 'PR-PA-KA-001',
                                    categoryId: 'perlindungan-aplikasi',
                                    subCategoryId: 'keamanan-aplikasi',
                                    text: 'Apakah aplikasi menjalani pengujian keamanan (security testing) sebelum deployment?',
                                    scope: 'Teknologi',
                                    indexDescriptions: {
                                        0: 'Tidak ada pengujian keamanan',
                                        1: 'Pengujian keamanan ad-hoc',
                                        2: 'Pengujian keamanan untuk aplikasi kritis',
                                        3: 'Security testing terintegrasi dalam SDLC',
                                        4: 'SAST dan DAST otomatis dalam CI/CD pipeline',
                                        5: 'DevSecOps dengan continuous security monitoring'
                                    }
                                },
                                {
                                    id: 'PR-PA-KA-002',
                                    categoryId: 'perlindungan-aplikasi',
                                    subCategoryId: 'keamanan-aplikasi',
                                    text: 'Apakah terdapat proses patch management untuk aplikasi dan sistem operasi?',
                                    scope: 'Teknologi',
                                    indexDescriptions: {
                                        0: 'Tidak ada patch management',
                                        1: 'Patching dilakukan secara ad-hoc',
                                        2: 'Patching terjadwal namun tidak konsisten',
                                        3: 'Patch management terdokumentasi dengan prioritas',
                                        4: 'Automated patch management dengan testing',
                                        5: 'Zero-day response dengan virtual patching'
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 'perlindungan-jaringan',
                    domainId: 'proteksi',
                    name: 'Perlindungan Jaringan',
                    subCategories: [
                        {
                            id: 'keamanan-jaringan',
                            categoryId: 'perlindungan-jaringan',
                            name: 'Keamanan Jaringan',
                            questions: [
                                {
                                    id: 'PR-PJ-KJ-001',
                                    categoryId: 'perlindungan-jaringan',
                                    subCategoryId: 'keamanan-jaringan',
                                    text: 'Apakah jaringan dilindungi dengan firewall dan sistem deteksi intrusi (IDS/IPS)?',
                                    scope: 'Teknologi',
                                    indexDescriptions: {
                                        0: 'Tidak ada proteksi jaringan',
                                        1: 'Firewall dasar tanpa konfigurasi optimal',
                                        2: 'Firewall dengan rule yang terdefinisi',
                                        3: 'Firewall dan IDS/IPS terimplementasi',
                                        4: 'Next-gen firewall dengan threat intelligence',
                                        5: 'Network security terintegrasi dengan SOC dan SIEM'
                                    }
                                },
                                {
                                    id: 'PR-PJ-KJ-002',
                                    categoryId: 'perlindungan-jaringan',
                                    subCategoryId: 'keamanan-jaringan',
                                    text: 'Apakah jaringan disegmentasi untuk memisahkan zona keamanan yang berbeda?',
                                    scope: 'Teknologi',
                                    indexDescriptions: {
                                        0: 'Tidak ada segmentasi jaringan',
                                        1: 'Segmentasi minimal (DMZ saja)',
                                        2: 'Segmentasi dasar antar departemen',
                                        3: 'Segmentasi berdasarkan klasifikasi data',
                                        4: 'Micro-segmentation untuk sistem kritis',
                                        5: 'Software-defined segmentation dengan zero-trust'
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 'sdm-keamanan',
                    domainId: 'proteksi',
                    name: 'Perlindungan Sumber Daya Manusia',
                    subCategories: [
                        {
                            id: 'awareness-training',
                            categoryId: 'sdm-keamanan',
                            name: 'Awareness dan Training',
                            questions: [
                                {
                                    id: 'PR-SDM-AT-001',
                                    categoryId: 'sdm-keamanan',
                                    subCategoryId: 'awareness-training',
                                    text: 'Apakah organisasi menyelenggarakan program awareness keamanan siber untuk seluruh pegawai?',
                                    scope: 'Sumber Daya Manusia',
                                    indexDescriptions: {
                                        0: 'Tidak ada program awareness',
                                        1: 'Awareness informal dan tidak terstruktur',
                                        2: 'Awareness dilakukan sesekali',
                                        3: 'Program awareness tahunan untuk seluruh pegawai',
                                        4: 'Awareness berkala dengan simulasi (phishing test)',
                                        5: 'Security culture program terintegrasi dengan HR'
                                    }
                                },
                                {
                                    id: 'PR-SDM-AT-002',
                                    categoryId: 'sdm-keamanan',
                                    subCategoryId: 'awareness-training',
                                    text: 'Apakah tim IT dan keamanan mendapatkan pelatihan keamanan siber secara berkala?',
                                    scope: 'Sumber Daya Manusia',
                                    indexDescriptions: {
                                        0: 'Tidak ada pelatihan keamanan',
                                        1: 'Pelatihan ad-hoc tanpa kurikulum',
                                        2: 'Pelatihan dasar untuk tim IT',
                                        3: 'Pelatihan reguler dengan sertifikasi',
                                        4: 'Program pengembangan berkelanjutan',
                                        5: 'Pelatihan advanced dengan CTF dan red team exercise'
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            id: 'deteksi',
            name: 'DETEKSI',
            color: '#f1c40f',
            categories: [
                {
                    id: 'deteksi-peristiwa',
                    domainId: 'deteksi',
                    name: 'Pengelolaan Deteksi Peristiwa Siber',
                    subCategories: [
                        {
                            id: 'sistem-deteksi',
                            categoryId: 'deteksi-peristiwa',
                            name: 'Sistem Deteksi',
                            questions: [
                                {
                                    id: 'DE-DP-SD-001',
                                    categoryId: 'deteksi-peristiwa',
                                    subCategoryId: 'sistem-deteksi',
                                    text: 'Apakah organisasi memiliki sistem untuk mendeteksi peristiwa keamanan siber?',
                                    scope: 'Teknologi',
                                    indexDescriptions: {
                                        0: 'Tidak ada sistem deteksi',
                                        1: 'Deteksi manual melalui log review',
                                        2: 'Sistem deteksi dasar (antivirus, firewall log)',
                                        3: 'SIEM terimplementasi untuk korelasi event',
                                        4: 'SIEM dengan use case dan alerting otomatis',
                                        5: 'SOC 24/7 dengan threat intelligence integration'
                                    }
                                },
                                {
                                    id: 'DE-DP-SD-002',
                                    categoryId: 'deteksi-peristiwa',
                                    subCategoryId: 'sistem-deteksi',
                                    text: 'Apakah terdapat prosedur eskalasi ketika terdeteksi peristiwa keamanan?',
                                    scope: 'Tata Kelola',
                                    indexDescriptions: {
                                        0: 'Tidak ada prosedur eskalasi',
                                        1: 'Eskalasi informal tanpa dokumentasi',
                                        2: 'Prosedur eskalasi ada namun tidak lengkap',
                                        3: 'Prosedur eskalasi terdokumentasi dan dikomunikasikan',
                                        4: 'Eskalasi otomatis dengan integrasi ticketing',
                                        5: 'Playbook eskalasi terintegrasi dengan SOAR'
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 'analisis-anomali',
                    domainId: 'deteksi',
                    name: 'Analisis Anomali dan Peristiwa Siber',
                    subCategories: [
                        {
                            id: 'analisis-peristiwa',
                            categoryId: 'analisis-anomali',
                            name: 'Analisis Peristiwa',
                            questions: [
                                {
                                    id: 'DE-AA-AP-001',
                                    categoryId: 'analisis-anomali',
                                    subCategoryId: 'analisis-peristiwa',
                                    text: 'Apakah organisasi memiliki kemampuan untuk menganalisis anomali dan mengidentifikasi potensi ancaman?',
                                    scope: 'Teknologi',
                                    indexDescriptions: {
                                        0: 'Tidak ada kemampuan analisis',
                                        1: 'Analisis manual dan reaktif',
                                        2: 'Analisis dasar dengan rule-based detection',
                                        3: 'Analisis dengan behavioral analytics',
                                        4: 'Machine learning untuk deteksi anomali',
                                        5: 'AI-driven threat detection dengan predictive analytics'
                                    }
                                },
                                {
                                    id: 'DE-AA-AP-002',
                                    categoryId: 'analisis-anomali',
                                    subCategoryId: 'analisis-peristiwa',
                                    text: 'Apakah terdapat proses triase dan prioritisasi insiden berdasarkan tingkat keparahan?',
                                    scope: 'Tata Kelola',
                                    indexDescriptions: {
                                        0: 'Tidak ada proses triase',
                                        1: 'Triase informal tanpa kriteria',
                                        2: 'Kriteria prioritas ada namun tidak konsisten',
                                        3: 'Proses triase dengan severity classification',
                                        4: 'Triase otomatis dengan scoring system',
                                        5: 'AI-assisted triage dengan threat intelligence'
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 'pemantauan-berkelanjutan',
                    domainId: 'deteksi',
                    name: 'Pemantauan Peristiwa Siber Berkelanjutan',
                    subCategories: [
                        {
                            id: 'monitoring-kontinyu',
                            categoryId: 'pemantauan-berkelanjutan',
                            name: 'Monitoring Berkelanjutan',
                            questions: [
                                {
                                    id: 'DE-PB-MK-001',
                                    categoryId: 'pemantauan-berkelanjutan',
                                    subCategoryId: 'monitoring-kontinyu',
                                    text: 'Apakah monitoring keamanan dilakukan secara berkelanjutan (24/7)?',
                                    scope: 'Teknologi',
                                    indexDescriptions: {
                                        0: 'Tidak ada monitoring',
                                        1: 'Monitoring hanya jam kerja',
                                        2: 'Monitoring dengan cakupan terbatas',
                                        3: 'Monitoring 24/7 untuk sistem kritis',
                                        4: 'Monitoring 24/7 untuk seluruh sistem',
                                        5: 'SOC 24/7 dengan dedicated security team'
                                    }
                                },
                                {
                                    id: 'DE-PB-MK-002',
                                    categoryId: 'pemantauan-berkelanjutan',
                                    subCategoryId: 'monitoring-kontinyu',
                                    text: 'Apakah log keamanan dikumpulkan dan diarsipkan sesuai kebijakan retensi?',
                                    scope: 'Teknologi',
                                    indexDescriptions: {
                                        0: 'Tidak ada pengumpulan log',
                                        1: 'Log dikumpulkan namun tidak dikelola',
                                        2: 'Log dikumpulkan dengan retensi tidak konsisten',
                                        3: 'Log dikumpulkan dengan kebijakan retensi jelas',
                                        4: 'Log management terpusat dengan analisis otomatis',
                                        5: 'Log terintegrasi dengan SIEM dan forensik readiness'
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            id: 'tanggulih',
            name: 'PENANGGULANGAN & PEMULIHAN',
            color: '#27ae60',
            categories: [
                {
                    id: 'perencanaan-tanggulih',
                    domainId: 'tanggulih',
                    name: 'Perencanaan Penanggulangan dan Pemulihan Insiden Siber',
                    subCategories: [
                        {
                            id: 'rencana-response',
                            categoryId: 'perencanaan-tanggulih',
                            name: 'Rencana Response',
                            questions: [
                                {
                                    id: 'TP-PT-RR-001',
                                    categoryId: 'perencanaan-tanggulih',
                                    subCategoryId: 'rencana-response',
                                    text: 'Apakah organisasi memiliki Incident Response Plan (IRP) yang terdokumentasi?',
                                    scope: 'Tata Kelola',
                                    indexDescriptions: {
                                        0: 'Tidak ada IRP',
                                        1: 'IRP informal tanpa dokumentasi',
                                        2: 'IRP ada namun tidak lengkap',
                                        3: 'IRP komprehensif dan dikomunikasikan',
                                        4: 'IRP diuji melalui tabletop exercise berkala',
                                        5: 'IRP terintegrasi dengan BCP/DRP dan dilatih rutin'
                                    }
                                },
                                {
                                    id: 'TP-PT-RR-002',
                                    categoryId: 'perencanaan-tanggulih',
                                    subCategoryId: 'rencana-response',
                                    text: 'Apakah terdapat Tim Response Insiden (CSIRT/IRT) yang dibentuk secara formal?',
                                    scope: 'Sumber Daya Manusia',
                                    indexDescriptions: {
                                        0: 'Tidak ada tim response',
                                        1: 'Tim response informal',
                                        2: 'Tim response ada namun peran tidak jelas',
                                        3: 'CSIRT formal dengan peran dan prosedur jelas',
                                        4: 'CSIRT terlatih dengan koordinasi eksternal',
                                        5: 'CSIRT tersertifikasi dengan integrasi BSSN/ID-SIRTII'
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 'analisis-pelaporan',
                    domainId: 'tanggulih',
                    name: 'Analisis dan Pelaporan Insiden Siber',
                    subCategories: [
                        {
                            id: 'pelaporan-insiden',
                            categoryId: 'analisis-pelaporan',
                            name: 'Pelaporan Insiden',
                            questions: [
                                {
                                    id: 'TP-AP-PI-001',
                                    categoryId: 'analisis-pelaporan',
                                    subCategoryId: 'pelaporan-insiden',
                                    text: 'Apakah terdapat prosedur pelaporan insiden keamanan siber yang terdokumentasi?',
                                    scope: 'Tata Kelola',
                                    indexDescriptions: {
                                        0: 'Tidak ada prosedur pelaporan',
                                        1: 'Pelaporan informal',
                                        2: 'Prosedur pelaporan ada namun tidak konsisten',
                                        3: 'Prosedur pelaporan terdokumentasi dan diterapkan',
                                        4: 'Pelaporan otomatis dengan sistem ticketing',
                                        5: 'Pelaporan terintegrasi dengan regulasi (BSSN, OJK, BI)'
                                    }
                                },
                                {
                                    id: 'TP-AP-PI-002',
                                    categoryId: 'analisis-pelaporan',
                                    subCategoryId: 'pelaporan-insiden',
                                    text: 'Apakah dilakukan analisis forensik untuk insiden keamanan yang signifikan?',
                                    scope: 'Teknologi',
                                    indexDescriptions: {
                                        0: 'Tidak ada kemampuan forensik',
                                        1: 'Analisis forensik ad-hoc tanpa tools',
                                        2: 'Forensik dasar dengan tools gratis',
                                        3: 'Tim forensik dengan tools profesional',
                                        4: 'Forensik terintegrasi dengan chain of custody',
                                        5: 'Digital forensics lab dengan akreditasi'
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 'pelaksanaan-tanggulih',
                    domainId: 'tanggulih',
                    name: 'Pelaksanaan Penanggulangan dan Pemulihan Insiden Siber',
                    subCategories: [
                        {
                            id: 'containment-recovery',
                            categoryId: 'pelaksanaan-tanggulih',
                            name: 'Containment dan Recovery',
                            questions: [
                                {
                                    id: 'TP-PL-CR-001',
                                    categoryId: 'pelaksanaan-tanggulih',
                                    subCategoryId: 'containment-recovery',
                                    text: 'Apakah organisasi memiliki kemampuan untuk melakukan containment dan eradikasi insiden?',
                                    scope: 'Teknologi',
                                    indexDescriptions: {
                                        0: 'Tidak ada kemampuan containment',
                                        1: 'Containment manual dan reaktif',
                                        2: 'Kemampuan containment dasar',
                                        3: 'Prosedur containment dan eradikasi terdefinisi',
                                        4: 'Containment otomatis dengan playbook',
                                        5: 'SOAR terimplementasi dengan automated response'
                                    }
                                },
                                {
                                    id: 'TP-PL-CR-002',
                                    categoryId: 'pelaksanaan-tanggulih',
                                    subCategoryId: 'containment-recovery',
                                    text: 'Apakah organisasi memiliki Disaster Recovery Plan (DRP) yang teruji?',
                                    scope: 'Tata Kelola',
                                    indexDescriptions: {
                                        0: 'Tidak ada DRP',
                                        1: 'DRP informal tanpa dokumentasi',
                                        2: 'DRP terdokumentasi namun belum diuji',
                                        3: 'DRP komprehensif dengan pengujian tahunan',
                                        4: 'DRP terintegrasi dengan sistem failover',
                                        5: 'Automated failover dengan continuous replication'
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 'peningkatan-keamanan',
                    domainId: 'tanggulih',
                    name: 'Peningkatan Keamanan Setelah Terjadi Insiden Siber',
                    subCategories: [
                        {
                            id: 'lessons-learned',
                            categoryId: 'peningkatan-keamanan',
                            name: 'Lessons Learned',
                            questions: [
                                {
                                    id: 'TP-PK-LL-001',
                                    categoryId: 'peningkatan-keamanan',
                                    subCategoryId: 'lessons-learned',
                                    text: 'Apakah dilakukan evaluasi post-incident (lessons learned) setelah penanganan insiden?',
                                    scope: 'Tata Kelola',
                                    indexDescriptions: {
                                        0: 'Tidak ada evaluasi post-incident',
                                        1: 'Evaluasi ad-hoc tanpa dokumentasi',
                                        2: 'Evaluasi hanya untuk insiden major',
                                        3: 'Post-incident review terstruktur dan terdokumentasi',
                                        4: 'Lessons learned diintegrasikan ke IRP',
                                        5: 'Lessons learned di-share ke industri/sharing platform'
                                    }
                                },
                                {
                                    id: 'TP-PK-LL-002',
                                    categoryId: 'peningkatan-keamanan',
                                    subCategoryId: 'lessons-learned',
                                    text: 'Apakah rekomendasi dari evaluasi insiden diimplementasikan untuk meningkatkan keamanan?',
                                    scope: 'Tata Kelola',
                                    indexDescriptions: {
                                        0: 'Tidak ada implementasi rekomendasi',
                                        1: 'Implementasi rekomendasi tidak konsisten',
                                        2: 'Implementasi hanya untuk kelemahan kritikal',
                                        3: 'Rekomendasi dilacak dan diimplementasikan',
                                        4: 'Continuous improvement process terintegrasi',
                                        5: 'Maturity model assessment berbasis hasil insiden'
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};
