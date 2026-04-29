import type { EventItem } from "@/types/event.types";

export const industrySectorOptions = [
  "IKFT",
  "ILMATE",
  "AGRO",
  "Kawasan Industri",
] as const;

export const eventItems: EventItem[] = [
  {
    id: "fortyfour-cyber-workshop-2026",
    title: "FortyFour Cyber Readiness Workshop 2026",
    shortDescription: "Workshop intensif untuk menyusun baseline kesiapan siber dan peta aksi 90 hari.",
    fullDescription:
      "Sesi ini dirancang untuk tim keamanan, GRC, dan operasional TI yang ingin menyelaraskan risk posture, control gap, dan prioritas implementasi. Peserta akan mendapatkan contoh playbook, diskusi studi kasus, dan sesi clinic singkat bersama fasilitator.",
    eventDate: "2026-05-21T09:00:00+07:00",
    location: "Jakarta",
    format: "offline",
    coverLabel: "Workshop Utama",
    status: "upcoming",
  },
  {
    id: "tabletop-incident-drill-q2",
    title: "Tabletop Incident Drill Q2",
    shortDescription: "Simulasi tabletop untuk memperkuat koordinasi respons insiden lintas fungsi.",
    fullDescription:
      "Event ini memfasilitasi simulasi insiden dengan skenario serangan ransomware, eskalasi manajemen, dan pengambilan keputusan komunikasi krisis. Fokus utama ada pada keterhubungan antara SOC, legal, compliance, PR, dan pimpinan organisasi.",
    eventDate: "2026-06-05T13:30:00+07:00",
    location: "Bandung",
    format: "hybrid",
    coverLabel: "Simulation Lab",
    status: "upcoming",
  },
  {
    id: "sectoral-ransomware-defense-briefing",
    title: "Sectoral Ransomware Defense Briefing",
    shortDescription: "Briefing strategis mengenai pola serangan dan penguatan kontrol pertahanan prioritas.",
    fullDescription:
      "Forum briefing ini membahas tren serangan ransomware sektor industri, pola initial access, dan rekomendasi hardening yang bisa dieksekusi cepat. Sesi diakhiri dengan tanya jawab dan networking antarpeserta.",
    eventDate: "2026-06-18T10:00:00+07:00",
    location: "Online",
    format: "online",
    coverLabel: "Executive Briefing",
    status: "upcoming",
  },
  {
    id: "ikas-readout-2025",
    title: "IKAS Readout 2025",
    shortDescription: "Rangkuman temuan umum pengukuran maturitas dan peluang peningkatan per domain.",
    fullDescription:
      "Sesi arsip ini membahas hasil agregat evaluasi maturitas, area perbaikan prioritas, dan pendekatan bertahap untuk meningkatkan kesiapan organisasi.",
    eventDate: "2025-11-14T09:30:00+07:00",
    location: "Jakarta",
    format: "offline",
    coverLabel: "Past Session",
    status: "past",
  },
  {
    id: "secure-supply-chain-forum",
    title: "Secure Supply Chain Forum",
    shortDescription: "Forum diskusi praktik mitigasi risiko pada vendor dan rantai pasok digital.",
    fullDescription:
      "Forum ini mempertemukan perwakilan keamanan, procurement, dan governance untuk membahas due diligence keamanan, third-party risk, dan model monitoring yang lebih efektif.",
    eventDate: "2025-09-10T14:00:00+07:00",
    location: "Surabaya",
    format: "hybrid",
    coverLabel: "Forum",
    status: "past",
  },
  {
    id: "csirt-collaboration-session",
    title: "CSIRT Collaboration Session",
    shortDescription: "Pertemuan kolaboratif antar praktisi untuk berbagi pola koordinasi penanganan insiden.",
    fullDescription:
      "Agenda meliputi sharing pengalaman pembentukan alur koordinasi, pemanfaatan kontak eskalasi, dan pembelajaran dari insiden aktual yang telah dianonimkan.",
    eventDate: "2025-07-03T10:30:00+07:00",
    location: "Online",
    format: "online",
    coverLabel: "Collaboration",
    status: "past",
  },
];
