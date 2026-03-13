import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ikasDataStatic } from "@/data/ikas-data";

interface Props {
    ikasDataDynamic: any;
}

export function RadarChartIkas({ ikasDataDynamic }: Props) {
    // 1. Data untuk "PER KATEGORI" (18 Subdomain)
    const perKategoriData = [
        // Identifikasi (5)
        {
            subject: 'Peran & Tanggung Jawab',
            target: ikasDataStatic.identifikasi.peran_tanggung_jawab,
            nilai: ikasDataDynamic.identifikasi.nilai_subdomain1,
            fullSubject: 'Mengidentifikasi Peran dan tanggung jawab organisasi'
        },
        {
            subject: 'Strategi & Kebijakan',
            target: ikasDataStatic.identifikasi.strategi_kebijakan,
            nilai: ikasDataDynamic.identifikasi.nilai_subdomain2,
            fullSubject: 'Menyusun strategi, kebijakan, dan prosedur Keamanan Siber'
        },
        {
            subject: 'Aset Informasi',
            target: ikasDataStatic.identifikasi.aset_informasi,
            nilai: ikasDataDynamic.identifikasi.nilai_subdomain3,
            fullSubject: 'Mengelola aset informasi'
        },
        {
            subject: 'Risiko Keamanan',
            target: ikasDataStatic.identifikasi.risiko_keamanan,
            nilai: ikasDataDynamic.identifikasi.nilai_subdomain4,
            fullSubject: 'Menilai dan mengelola risiko Keamanan Siber'
        },
        {
            subject: 'Risiko Rantai Pasok',
            target: ikasDataStatic.identifikasi.rantai_pasok,
            nilai: ikasDataDynamic.identifikasi.nilai_subdomain5,
            fullSubject: 'Mengelola risiko rantai pasok'
        },

        // Proteksi (6)
        {
            subject: 'Identitas & Autentikasi',
            target: ikasDataStatic.proteksi.identitas_autentikasi,
            nilai: ikasDataDynamic.proteksi.nilai_subdomain1,
            fullSubject: 'Mengelola identitas, autentikasi, dan kendali akses'
        },
        {
            subject: 'Aset Fisik',
            target: ikasDataStatic.proteksi.aset_fisik,
            nilai: ikasDataDynamic.proteksi.nilai_subdomain2,
            fullSubject: 'Melindungi aset fisik'
        },
        {
            subject: 'Data',
            target: ikasDataStatic.proteksi.data,
            nilai: ikasDataDynamic.proteksi.nilai_subdomain3,
            fullSubject: 'Melindungi data'
        },
        {
            subject: 'Aplikasi',
            target: ikasDataStatic.proteksi.aplikasi,
            nilai: ikasDataDynamic.proteksi.nilai_subdomain4,
            fullSubject: 'Melindungi aplikasi'
        },
        {
            subject: 'Jaringan',
            target: ikasDataStatic.proteksi.jaringan,
            nilai: ikasDataDynamic.proteksi.nilai_subdomain5,
            fullSubject: 'Melindungi jaringan'
        },
        {
            subject: 'SDM',
            target: ikasDataStatic.proteksi.sdm,
            nilai: ikasDataDynamic.proteksi.nilai_subdomain6,
            fullSubject: 'Melindungi sumber daya manusia'
        },

        // Deteksi (3)
        {
            subject: 'Deteksi Peristiwa',
            target: ikasDataStatic.deteksi.deteksi_peristiwa,
            nilai: ikasDataDynamic.deteksi.nilai_subdomain1,
            fullSubject: 'Mengelola deteksi Peristiwa Siber'
        },
        {
            subject: 'Anomali Peristiwa',
            target: ikasDataStatic.deteksi.anomali_peristiwa,
            nilai: ikasDataDynamic.deteksi.nilai_subdomain2,
            fullSubject: 'Menganalisis anomali dan Peristiwa Siber'
        },
        {
            subject: 'Pemantauan Berkelanjutan',
            target: ikasDataStatic.deteksi.pemantauan_berkelanjutan,
            nilai: ikasDataDynamic.deteksi.nilai_subdomain3,
            fullSubject: 'Memantau Peristiwa Siber berkelanjutan'
        },

        // Tanggulih (4)
        {
            subject: 'Perencanaan Penanggulangan',
            target: ikasDataStatic.tanggulih.perencanaan_pemulihan,
            nilai: ikasDataDynamic.tanggulih.nilai_subdomain1,
            fullSubject: 'Menyusun perencanaan penanggulangan dan pemulihan Insiden Siber'
        },
        {
            subject: 'Analisis & Pelaporan',
            target: ikasDataStatic.tanggulih.analisis_pelaporan,
            nilai: ikasDataDynamic.tanggulih.nilai_subdomain2,
            fullSubject: 'Menganalisis dan melaporkan Insiden Siber'
        },
        {
            subject: 'Pelaksanaan Penanggulangan',
            target: ikasDataStatic.tanggulih.pelaksanaan_pemulihan,
            nilai: ikasDataDynamic.tanggulih.nilai_subdomain3,
            fullSubject: 'Melaksanakan penanggulangan dan pemulihan Insiden Siber'
        },
        {
            subject: 'Peningkatan Keamanan',
            target: ikasDataStatic.tanggulih.peningkatan_keamanan,
            nilai: ikasDataDynamic.tanggulih.nilai_subdomain4,
            fullSubject: 'Meningkatkan keamanan setelah terjadinya Insiden Siber'
        },
    ];

    // 2. Data untuk "PER DOMAIN" (4 Domain Besar)
    const perDomainData = [
        {
            subject: 'IDENTIFIKASI',
            target: 2.51,
            nilai: ikasDataDynamic.identifikasi.nilai_identifikasi || 0
        },
        {
            subject: 'PROTEKSI',
            target: 2.51,
            nilai: ikasDataDynamic.proteksi.nilai_proteksi || 0
        },
        {
            subject: 'DETEKSI',
            target: 2.51,
            nilai: ikasDataDynamic.deteksi.nilai_deteksi || 0
        },
        {
            subject: 'PENANGGULANGAN DAN PEMULIHAN',
            target: 2.51,
            nilai: ikasDataDynamic.tanggulih.nilai_tanggulih || 0
        }
    ];

    // Custom Legend
    const renderLegend = (props: any) => {
        const { payload } = props;
        return (
            <ul className="flex justify-center gap-6 mt-4 list-none p-0 text-sm font-medium">
                {payload.map((entry: any, index: number) => (
                    <li key={`item-${index}`} className="flex items-center gap-2">
                        {entry.dataKey === 'nilai' ? (
                            <div className="w-3 h-3 rotate-45 bg-[#4285F4]"></div>
                        ) : (
                            <div className="w-3 h-3 bg-[#EA4335]"></div>
                        )}
                        <span className="text-slate-700">{entry.value === 'nilai' ? 'Nilai Kematangan' : 'Target Nilai Kematangan'}</span>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">

            {/* Chart Kiri: PER KATEGORI */}
            <div className="p-6 border-b xl:border-b-0 xl:border-r border-slate-200 relative flex flex-col">
                <div className="absolute top-6 right-6 px-4 py-2 bg-gradient-to-r from-[#e8f5e9] to-[#c8e6c9] border border-[#a5d6a7] shadow-sm rounded font-bold text-[#2e7d32] tracking-widest text-sm z-10">
                    PER KATEGORI
                </div>
                <div className="w-full aspect-square sm:aspect-video xl:aspect-square min-h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={perKategoriData}>
                            <PolarGrid stroke="#ccc" />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 500 }}
                            />
                            <PolarRadiusAxis
                                angle={90}
                                domain={[0, 5]}
                                tick={{ fill: '#6b7280', fontSize: 10 }}
                                tickCount={6}
                            />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        // Cari original item dari perKategoriData untuk fullSubject
                                        const origItem = perKategoriData.find(item => item.subject === label);
                                        return (
                                            <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg max-w-xs">
                                                <p className="font-bold text-slate-800 text-sm mb-2 leading-tight">{origItem?.fullSubject || label}</p>
                                                {payload.map((entry, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                                                        <div className={`w-2 h-2 ${entry.dataKey === 'nilai' ? 'bg-[#4285F4] rotate-45' : 'bg-[#EA4335]'}`}></div>
                                                        <span className="font-medium">{entry.name === 'nilai' ? 'Nilai Kematangan' : 'Target Nilai Kematangan'}:</span>
                                                        <span className="font-bold">{entry.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            {/* Garis Merah (Target) */}
                            <Radar
                                name="target"
                                dataKey="target"
                                stroke="#EA4335"
                                strokeWidth={2}
                                fill="transparent"
                                activeDot={{ r: 4, fill: '#EA4335' }}
                                dot={{ r: 3, fill: '#EA4335', strokeWidth: 0 }}
                            />
                            {/* Garis Biru (Nilai) */}
                            <Radar
                                name="nilai"
                                dataKey="nilai"
                                stroke="#4285F4"
                                strokeWidth={2}
                                fill="transparent"
                                activeDot={{ r: 4, fill: '#4285F4' }}
                                dot={(props: any) => {
                                    const { cx, cy, key } = props;
                                    return (
                                        <rect key={key} x={cx - 3} y={cy - 3} width={6} height={6} fill="#4285F4" transform={`rotate(45 ${cx} ${cy})`} />
                                    );
                                }}
                            />
                            <Legend content={renderLegend} verticalAlign="bottom" />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Chart Kanan: PER DOMAIN */}
            <div className="p-6 relative flex flex-col">
                <div className="absolute top-6 right-6 px-4 py-2 bg-gradient-to-r from-[#e8f5e9] to-[#c8e6c9] border border-[#a5d6a7] shadow-sm rounded font-bold text-[#2e7d32] tracking-widest text-sm z-10">
                    PER DOMAIN
                </div>
                <div className="w-full flex-grow aspect-square sm:aspect-video xl:aspect-square min-h-[400px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={perDomainData}>
                            <PolarGrid stroke="#ccc" />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={{ fill: '#4b5563', fontSize: 11, fontWeight: 700 }}
                            />
                            <PolarRadiusAxis
                                angle={90}
                                domain={[0, 5]}
                                tick={{ fill: '#6b7280', fontSize: 10 }}
                                tickCount={6}
                            />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg max-w-xs">
                                                <p className="font-bold text-slate-800 text-sm mb-2">{label}</p>
                                                {payload.map((entry, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                                                        <div className={`w-2 h-2 ${entry.dataKey === 'nilai' ? 'bg-[#4285F4] rotate-45' : 'bg-[#EA4335]'}`}></div>
                                                        <span className="font-medium">{entry.name === 'nilai' ? 'Nilai Kematangan' : 'Target Nilai Kematangan'}:</span>
                                                        <span className="font-bold">{entry.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            {/* Garis Hijau Lebar di 5.0 layaknya border (sesuai gambar: background border bentuk ketupat) */}
                            <Radar
                                dataKey={() => 5}
                                stroke="#7cb342"
                                strokeWidth={2}
                                fill="transparent"
                                activeDot={false}
                                dot={false}
                                isAnimationActive={false}
                            />
                            {/* Garis Merah (Target) */}
                            <Radar
                                name="target"
                                dataKey="target"
                                stroke="#EA4335"
                                strokeWidth={2}
                                fill="transparent"
                                activeDot={{ r: 4, fill: '#EA4335' }}
                                dot={{ r: 3, fill: '#EA4335', strokeWidth: 0 }}
                            />
                            {/* Garis Biru (Nilai) */}
                            <Radar
                                name="nilai"
                                dataKey="nilai"
                                stroke="#4285F4"
                                strokeWidth={2}
                                fill="transparent"
                                activeDot={{ r: 4, fill: '#4285F4' }}
                                dot={(props: any) => {
                                    const { cx, cy, key } = props;
                                    return (
                                        <rect key={key} x={cx - 3} y={cy - 3} width={6} height={6} fill="#4285F4" transform={`rotate(45 ${cx} ${cy})`} />
                                    );
                                }}
                            />
                            <Legend content={renderLegend} verticalAlign="bottom" />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
}
