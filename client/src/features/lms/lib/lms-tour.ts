import type { GuidedTourStep } from "@/components/tour/GuidedTour";

export const LMS_DASHBOARD_TOUR_STEPS: GuidedTourStep[] = [
    {
        id: "sidebar",
        target: '[data-tour-id="lms-sidebar-home"]',
        title: "Navigasi Utama",
        description:
            "Di sini Anda dapat berpindah antar halaman seperti kelas, progress belajar, dan pengaturan akun.",
        placement: "right",
    },
    {
        id: "hero",
        target: '[data-tour-id="lms-dashboard-hero"]',
        title: "Dashboard Belajar",
        description:
            "Ini adalah halaman utama untuk melihat kelas aktif dan rekomendasi pembelajaran Anda.",
        placement: "bottom",
    },
    {
        id: "categories",
        target: '[data-tour-id="lms-dashboard-categories"]',
        title: "Filter Kategori Kelas",
        description:
            "Gunakan filter ini untuk menampilkan kelas berdasarkan kategori tertentu.",
        placement: "bottom",
    },
    {
        id: "course-card",
        target: '[data-tour-id="lms-dashboard-course-card"]',
        title: "Kartu Kelas",
        description:
            "Setiap kartu menampilkan jumlah materi, progres belajar, dan status kelas Anda.",
        placement: "bottom",
    },
    {
        id: "recommendation",
        target: '[data-tour-id="lms-dashboard-recommendation"]',
        title: "Rekomendasi Kelas",
        description:
            "Kami merekomendasikan kelas berdasarkan aktivitas dan minat belajar Anda.",
        placement: "left",
    },
    {
        id: "progress",
        target: '[data-tour-id="lms-dashboard-progress"]',
        title: "Progress Belajar",
        description:
            "Progress akan muncul setelah Anda mulai mempelajari kelas.",
        placement: "left",
    },
    {
        id: "table",
        target: '[data-tour-id="lms-dashboard-materials"]',
        title: "Daftar Materi Anda",
        description:
            "Di sini Anda dapat melihat semua kelas yang sedang Anda ikuti beserta progresnya.",
        placement: "top",
    },
    {
        id: "done",
        title: "Anda Siap Belajar 🎉",
        description: "Sekarang Anda sudah mengenal dashboard. Yuk mulai belajar!",
        placement: "center",
        doneLabel: "Mulai Belajar",
    },
];
