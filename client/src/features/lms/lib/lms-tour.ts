import type { GuidedTourStep } from "@/components/tour/GuidedTour";

export const LMS_DASHBOARD_TOUR_STEPS: GuidedTourStep[] = [
   {
    id: "sidebar",
    target: '[data-tour-id="lms-sidebar-home"]',
    title: "Menu Navigasi",
    description:
        "Gunakan menu ini untuk berpindah ke halaman kelas, melihat progress belajar, atau mengatur akun Anda.",
    placement: "right",
    },
    {
        id: "hero",
        target: '[data-tour-id="lms-dashboard-hero"]',
        title: "Dashboard Utama",
        description:
            "Ini adalah halaman utama Anda. Di sini Anda bisa melihat kelas yang sedang diikuti dan rekomendasi pembelajaran.",
        placement: "bottom",
    },
    {
        id: "categories",
        target: '[data-tour-id="lms-dashboard-categories"]',
        title: "Filter Kategori",
        description:
            "Pilih kategori untuk menampilkan kelas sesuai minat atau kebutuhan belajar Anda.",
        placement: "bottom",
    },
    {
        id: "course-card",
        target: '[data-tour-id="lms-dashboard-course-card"]',
        title: "Kartu Kelas",
        description:
            "Setiap kartu menampilkan ringkasan kelas seperti jumlah materi, progres belajar, dan status kelas.",
        placement: "bottom",
    },
    {
        id: "recommendation",
        target: '[data-tour-id="lms-dashboard-recommendation"]',
        title: "Rekomendasi Untuk Anda",
        description:
            "Kami menampilkan kelas yang mungkin cocok berdasarkan aktivitas belajar Anda.",
        placement: "left",
    },
    {
        id: "progress",
        target: '[data-tour-id="lms-dashboard-progress"]',
        title: "Progress Belajar",
        description:
            "Progress akan terlihat setelah Anda mulai mengikuti kelas.",
        placement: "left",
    },
    {
        id: "table",
        target: '[data-tour-id="lms-dashboard-materials"]',
        title: "Daftar Kelas Anda",
        description:
            "Di sini Anda bisa melihat semua kelas yang sedang diikuti beserta progresnya.",
        placement: "top",
    },
    {
        id: "done",
        title: "Siap Mulai Belajar 🎉",
        description: "Sekarang Anda sudah mengenal dashboard. Yuk mulai belajar!",
        placement: "center",
        doneLabel: "Mulai Belajar",
    },
];
