import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck, Smartphone, Copy, CheckCheck, RefreshCw, ArrowLeft } from "lucide-react";
import QRCode from "react-qr-code";
import { useAuthStore, readMfaSetupToken, readMfaVerifyToken } from "@/stores/auth.store";
import { authService } from "@/services/auth.service";
import { useToast } from "@/hooks/use-toast";
import { OTPInput, SlotProps } from "input-otp";
import { cn } from "@/lib/utils";
import { useLocation, Link } from "wouter";

// ─── OTP Slot ────────────────────────────────────────────────────────────────

function OtpSlot({ char, hasFakeCaret, isActive }: SlotProps) {
    return (
        <div
            className={cn(
                "relative w-12 h-14 flex items-center justify-center rounded-xl border-2 text-2xl font-bold transition-all",
                isActive
                    ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-200"
                    : char
                        ? "border-slate-300 bg-white text-slate-900"
                        : "border-slate-200 bg-slate-50/50 text-slate-400"
            )}
        >
            {char}
            {hasFakeCaret && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="h-6 w-[2px] animate-caret-blink bg-blue-500" />
                </div>
            )}
        </div>
    );
}

// ─── MfaVerify Component ─────────────────────────────────────────────────────

/**
 * Mirrors D:\Magang BSSN\vuefront\src\components\pages\authentication\two-step-verification\basic.vue
 *
 * Route: /mfa?mode=setup  → first-time MFA setup (shows QR code first)
 * Route: /mfa?mode=verify → returning user verification (just OTP input)
 *
 * Uses the Zustand auth store tokens directly (same as Vue Pinia).
 * sessionStorage used as fallback for page reload edge cases.
 */
export default function MfaVerify() {
    const [, navigate] = useLocation();
    const { toast } = useToast();

    // Read mode from URL query — same as Vue's route.query.mode
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode") || "verify";
    const isSetupMode = mode === "setup";

    // Tokens: Zustand first, sessionStorage fallback
    const setupToken = useAuthStore((s) => s.setupToken) || readMfaSetupToken();
    const mfaToken = useAuthStore((s) => s.mfaToken) || readMfaVerifyToken();
    const completeMfaSetup = useAuthStore((s) => s.completeMfaSetup);
    const completeMfaVerify = useAuthStore((s) => s.completeMfaVerify);
    const clearMfaState = useAuthStore((s) => s.clearMfaState);

    // Setup mode state
    const [otpauthUrl, setOtpauthUrl] = useState("");
    const [secret, setSecret] = useState("");
    const [setupLoading, setSetupLoading] = useState(false);
    const [setupError, setSetupError] = useState("");

    // Verification state
    const [otpValue, setOtpValue] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState("");
    const [copied, setCopied] = useState(false);

    // TOTP countdown timer (same as Vue)
    const [timeLeft, setTimeLeft] = useState(30);

    useEffect(() => {
        const updateTimer = () => {
            const epoch = Math.floor(Date.now() / 1000);
            setTimeLeft(30 - (epoch % 30));
        };
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, []);

    // Guard: validate tokens on mount (same as Vue onMounted)
    useEffect(() => {
        if (isSetupMode) {
            if (!setupToken) {
                navigate("/login");
                return;
            }
            fetchMfaSetup();
        } else {
            if (!mfaToken) {
                navigate("/login");
                return;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch QR code + secret from /api/mfa/setup — uses provisioning_uri field (same as Vue)
    const fetchMfaSetup = async () => {
        if (!setupToken) return;
        setSetupLoading(true);
        setSetupError("");
        try {
            const res = await authService.mfaSetup(setupToken);
            // Vue reads `provisioning_uri` first (fallback to `otpauth_url`)
            setOtpauthUrl((res as any).provisioning_uri?.trim() || res.otpauth_url?.trim() || "");
            setSecret(res.secret || "");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Gagal memuat setup MFA. Silakan coba lagi.";
            setSetupError(msg);
        } finally {
            setSetupLoading(false);
        }
    };

    // Verify code — same logic as Vue's verifyCode()
    const handleComplete = async (code: string) => {
        if (verifying) return;
        setVerifying(true);
        setVerifyError("");

        try {
            if (isSetupMode && setupToken) {
                const res = await authService.mfaEnable(setupToken, code);
                completeMfaSetup(res);
                toast({ title: "MFA aktif", description: "Autentikasi dua faktor berhasil diaktifkan." });
            } else if (!isSetupMode && mfaToken) {
                const res = await authService.mfaVerify(mfaToken, code);
                completeMfaVerify(res);
            } else {
                throw new Error("Token tidak ditemukan. Silakan login kembali.");
            }
            navigate("/dashboard");
        } catch (err: unknown) {
            const axiosError = err as any;
            const apiMsg = axiosError?.response?.data?.message || axiosError?.response?.data?.error;
            const status = axiosError?.status ?? axiosError?.response?.status;

            if (status === 400 || status === 401 || status === 403) {
                setVerifyError("Kode verifikasi salah atau kedaluwarsa. Silakan coba lagi.");
            } else if (apiMsg) {
                setVerifyError(apiMsg);
            } else {
                setVerifyError("Terjadi kesalahan sistem. Silakan coba lagi beberapa saat lagi.");
            }
            setOtpValue("");
        } finally {
            setVerifying(false);
        }
    };

    const copySecret = () => {
        if (secret) {
            navigator.clipboard.writeText(secret);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const retrySetup = async () => {
        setOtpValue("");
        setVerifyError("");
        await fetchMfaSetup();
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#f8faff]">
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `
                        radial-gradient(80% 60% at 10% 10%, rgba(89,92,255,0.12) 0%, transparent 60%),
                        radial-gradient(70% 60% at 90% 90%, rgba(0,97,255,0.10) 0%, transparent 60%)
                    `,
                }}
            />
            <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 w-full max-w-md mx-4"
            >
                <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl shadow-blue-500/10 p-8">

                    {/* Header */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
                            <ShieldCheck className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            {isSetupMode ? "Setup Two-Factor Authentication" : "Verifikasi Dua Langkah"}
                        </h1>
                        <p className="text-slate-500 text-sm mt-1 text-center">
                            {isSetupMode
                                ? "Scan QR Code dengan Google Authenticator atau Authy"
                                : "Masukkan kode 6 digit dari aplikasi autentikator Anda"}
                        </p>
                    </div>

                    {/* ── Setup: Loading ── */}
                    {isSetupMode && setupLoading && (
                        <div className="flex flex-col items-center gap-3 py-8 text-slate-500">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            <p className="text-sm">Memuat setup MFA...</p>
                        </div>
                    )}

                    {/* ── Setup: Error ── */}
                    {isSetupMode && setupError && !setupLoading && (
                        <div className="flex flex-col items-center gap-3 py-6">
                            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 text-center w-full">
                                {setupError}
                            </div>
                            <button
                                type="button"
                                onClick={retrySetup}
                                className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition"
                            >
                                <RefreshCw className="w-4 h-4" /> Coba Lagi
                            </button>
                        </div>
                    )}

                    {/* ── Main content (not loading, no setup error) ── */}
                    {!(isSetupMode && (setupLoading || setupError)) && (
                        <>
                            {/* QR Code section — setup mode only */}
                            {isSetupMode && otpauthUrl && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-6 p-4 rounded-2xl bg-blue-50/80 border border-blue-100"
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <Smartphone className="w-4 h-4 text-blue-600" />
                                        <p className="text-sm font-semibold text-blue-800">Scan QR Code</p>
                                    </div>

                                    <div className="flex justify-center mb-3">
                                        <div className="p-3 bg-white rounded-xl shadow-md">
                                            <QRCode value={otpauthUrl} size={160} level="M" />
                                        </div>
                                    </div>

                                    {secret && (
                                        <>
                                            <p className="text-xs text-blue-700 text-center mb-2">
                                                Atau masukkan kode manual:
                                            </p>
                                            <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-blue-200">
                                                <code className="text-xs font-mono text-slate-700 flex-1 break-all select-all">
                                                    {secret}
                                                </code>
                                                <button
                                                    type="button"
                                                    onClick={copySecret}
                                                    className="text-blue-500 hover:text-blue-700 transition flex-shrink-0"
                                                >
                                                    {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            )}

                            {/* OTP Input */}
                            <div className="flex flex-col items-center gap-4">
                                <p className="text-sm text-slate-500">
                                    Masukkan kode 6 digit dari aplikasi autentikator
                                </p>

                                <OTPInput
                                    autoFocus
                                    value={otpValue}
                                    onChange={(v) => { setOtpValue(v); setVerifyError(""); }}
                                    onComplete={handleComplete}
                                    maxLength={6}
                                    disabled={verifying}
                                    render={({ slots }) => (
                                        <div className="flex gap-2">
                                            {slots.map((slot, idx) => (
                                                <OtpSlot key={idx} {...slot} />
                                            ))}
                                        </div>
                                    )}
                                />

                                {/* Countdown */}
                                <p className="text-xs text-slate-400">
                                    Kode diperbarui dalam <span className="font-semibold text-blue-500">{timeLeft}s</span>
                                </p>

                                {/* Error */}
                                {verifyError && (
                                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 text-center w-full">
                                        {verifyError}
                                    </div>
                                )}

                                {/* Verifying spinner */}
                                {verifying && (
                                    <div className="flex items-center gap-2 text-blue-600 text-sm">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Memverifikasi...
                                    </div>
                                )}
                            </div>

                            {/* Retry Setup (setup mode only) */}
                            {isSetupMode && (
                                <div className="text-center mt-4">
                                    <p className="text-xs text-slate-400">
                                        Ada masalah?{" "}
                                        <button
                                            type="button"
                                            onClick={retrySetup}
                                            className="font-semibold text-blue-600 hover:text-blue-800 transition"
                                        >
                                            Ulangi Setup
                                        </button>
                                    </p>
                                </div>
                            )}

                            {/* Back to Login */}
                            <div className="text-center mt-4">
                                <Link
                                    href="/login"
                                    onClick={() => clearMfaState()}
                                    className="flex items-center justify-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition"
                                >
                                    <ArrowLeft className="w-3 h-3" /> Kembali ke Login
                                </Link>
                            </div>

                            {/* Security notice */}
                            <p className="text-center text-xs text-red-500 font-medium mt-3">
                                {isSetupMode
                                    ? "🔒 Jangan bagikan secret key Anda kepada siapapun!"
                                    : "🔒 Jangan bagikan kode verifikasi Anda kepada siapapun!"}
                            </p>
                        </>
                    )}

                </div>
            </motion.div>
        </div>
    );
}
