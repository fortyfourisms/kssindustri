import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getDefaultAuthenticatedRoute } from "@/lib/access-control";
import Logo from "@/assets/d44.svg";
import { TurnstileWidget, type TurnstileWidgetHandle } from "@/components/TurnstileWidget";

const LoginSchema = z.object({
    username: z.string().min(1, "Username or email is required"),
    password: z.string().min(1, "Password is required"),
});
type LoginForm = z.infer<typeof LoginSchema>;

export default function Login() {
    const [showPass, setShowPass] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState("");
    const [turnstileVerified, setTurnstileVerified] = useState(false);
    const { login, loading, isAuthenticated } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const turnstileRef = useRef<TurnstileWidgetHandle>(null);
    const turnstileSiteKey =
        window._env_?.TURNSTILE_SITE_KEY || import.meta.env.VITE_TURNSTILE_SITE_KEY || "";

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        containerRef.current.style.setProperty('--mouse-x', `${x}px`);
        containerRef.current.style.setProperty('--mouse-y', `${y}px`);
    };

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<LoginForm>({ resolver: zodResolver(LoginSchema) });
    const identifierValue = watch("username", "");
    const passwordValue = watch("password", "");
    const hasIdentifier = identifierValue.trim().length > 0;
    const hasPassword = passwordValue.trim().length > 0;
    const isLoginEnabled = hasIdentifier && hasPassword && turnstileVerified && turnstileToken.trim().length > 0;

    const clearTurnstileState = () => {
        setTurnstileToken("");
        setTurnstileVerified(false);
    };

    const onSubmit = async (data: LoginForm) => {
        if (!turnstileSiteKey) {
            toast({
                title: "Turnstile unavailable",
                description: "Login is temporarily unavailable. Please try again later.",
                variant: "destructive",
            });
            return;
        }

        if (!isLoginEnabled) {
            toast({
                title: "Verification required",
                description: "Complete Turnstile verification and fill in your credentials before logging in.",
                variant: "destructive",
            });
            return;
        }

        const result = await login({
            identifier: data.username,
            password: data.password,
            turnstileToken: turnstileToken || undefined,
        });

        if (result.error) {
            clearTurnstileState();
            turnstileRef.current?.reset();
            toast({ title: "Login failed", description: result.error, variant: "destructive" });
            return;
        }

        if (result.mfaSetup) {
            navigate("/mfa?mode=setup");
            return;
        }

        if (result.mfaVerify) {
            navigate("/mfa?mode=verify");
            return;
        }

        if (result.authenticated) {
            navigate(getDefaultAuthenticatedRoute(result.user ?? null));
        }
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="min-h-screen grid lg:grid-cols-2 relative selection:bg-blue-100 font-sans overflow-hidden bg-white"
        >
            {/* Interactive Mouse-Following Gradient Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {/* Dynamic Interactive Cursor Glows */}
                <div
                    className="absolute inset-0 z-10 transition-opacity duration-300 mix-blend-overlay"
                    style={{
                        background: `radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(59, 130, 246, 0.12), transparent 60%)`
                    }}
                />
                <div
                    className="absolute inset-0 z-10 transition-opacity duration-300 pointer-events-none"
                    style={{
                        background: `radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.85), transparent 80%)`
                    }}
                />

                {/* Base Mesh Gradient (Animated Background Elements) */}
                {/* @keyframes blob-float-1 / blob-float-2 are defined in base.css */}
                <div className="absolute top-[20%] left-[-20%] w-[100%] h-[100%] bg-[#DBEAFE] rounded-full blur-[120px] opacity-90" style={{ animation: 'blob-float-1 15s ease-in-out infinite' }} />
                <div className="absolute top-[10%] right-[-10%] w-[80%] h-[90%] bg-[#FFFFFF] rounded-full blur-[100px] opacity-95" style={{ animation: 'blob-float-2 18s ease-in-out infinite' }} />
                <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-[#BFDBFE] rounded-full blur-[80px] opacity-70" style={{ animation: 'blob-float-1 22s ease-in-out infinite reverse' }} />
                <div className="absolute bottom-[-20%] right-[10%] w-[70%] h-[60%] bg-[#93C5FD] rounded-full blur-[110px] opacity-65" style={{ animation: 'blob-float-2 16s ease-in-out infinite reverse' }} />

                {/* Noise/Texture Overlay */}
                <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] mix-blend-overlay z-20" />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/50 via-transparent to-white/80 z-20" />
            </div>

            {/* Left Side */}
            <div className="hidden lg:flex flex-col relative z-10 p-12 xl:p-20 overflow-hidden group">

                {/* Content Container */}
                <div className="relative z-10 flex flex-col h-full">
                    {/* Top Section: Logo */}
                    <div className="mb-auto w-fit">
                        <Link to="/">
                            <div className="flex items-center gap-2 cursor-pointer group/logo w-fit">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-2xl shadow-black/10 group-hover/logo:scale-110 transition-all duration-500">
                                    <img src={Logo} alt="Logo" className="w-6 h-6 object-contain" />
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Bottom Section: Text Content */}
                    <div className="mt-auto max-w-lg text-slate-900">
                        <div className="bg-white/80 backdrop-blur-md border border-blue-100 p-6 rounded-2xl mb-8 shadow-lg shadow-blue-100/50">
                            <p className="text-slate-700 text-sm leading-relaxed italic">
                                "Cybersecurity is not just about protecting your devices. It's about protecting yourself." - Anonymous
                            </p>
                        </div>
                        {/* <h2 className="text-5xl xl:text-6xl font-black leading-[1.1] tracking-tight mb-4">
                            Uncompromised<br />Security
                        </h2>
                        <p className="text-white/80 font-medium tracking-wide text-lg">
                            Secure authentication for your dashboard access.
                        </p> */}
                    </div>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16 relative z-10 bg-white lg:rounded-l-[3rem] lg:shadow-[-20px_0_40px_rgba(0,0,0,0.3)]">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full max-w-md mx-auto relative z-10"
                >
                    {/* Mobile Logo */}
                    <div className="mb-10 lg:hidden flex justify-center">
                        <Link to="/">
                            <div className="flex items-center gap-2 cursor-pointer group">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
                                    <img src={Logo} alt="Logo" className="w-6 h-6 object-contain" />
                                </div>
                                <span className="text-xl font-display font-black tracking-tight text-slate-900">
                                    FortyFour
                                </span>
                            </div>
                        </Link>
                    </div>

                    <div className="mb-10 text-center lg:text-left">
                        <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-2">Log In</h1>
                        <p className="text-slate-500 text-sm">Enter your username and password to access the dashboard.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Username */}
                        <div>
                            <input
                                {...register("username")}
                                type="text"
                                placeholder="Username or email"
                                className="w-full px-5 py-4 rounded-2xl bg-[#f8fafc] border border-transparent text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all shadow-sm"
                            />
                            {errors.username && (
                                <p className="text-red-500 text-xs font-semibold mt-1 ml-1">{errors.username.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <input
                                {...register("password")}
                                type={showPass ? "text" : "password"}
                                placeholder="Password"
                                className="w-full pl-5 pr-12 py-4 rounded-2xl bg-[#f8fafc] border border-transparent text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all shadow-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass((v) => !v)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                            {errors.password && (
                                <p className="text-red-500 text-xs font-semibold mt-1 ml-1">{errors.password.message}</p>
                            )}
                        </div>

                        <TurnstileWidget
                            ref={turnstileRef}
                            siteKey={turnstileSiteKey}
                            onVerify={(token) => {
                                setTurnstileToken(token);
                                setTurnstileVerified(true);
                            }}
                            onExpire={clearTurnstileState}
                            onError={clearTurnstileState}
                            onTimeout={clearTurnstileState}
                            theme="light"
                            size="flexible"
                            retry="auto"
                            retryInterval={8000}
                        />

                        {!turnstileVerified && (
                            <p className="text-xs text-slate-500">
                                Complete the Cloudflare Turnstile check before login is enabled.
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !isLoginEnabled}
                            className="w-full py-4 mt-6 rounded-2xl bg-blue-600 text-white font-bold text-sm shadow-xl shadow-blue-600/20 hover:shadow-blue-600/30 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-blue-600 disabled:hover:shadow-blue-600/20 flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                "Log In"
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-slate-100">
                        <p className="text-slate-500 text-sm font-medium">
                            Don't have an account?{" "}
                            <Link to="/register" className="text-slate-900 font-bold hover:text-blue-600 transition-colors inline-flex items-center gap-1 ml-1">
                                Sign Up <span aria-hidden="true">&rarr;</span>
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
