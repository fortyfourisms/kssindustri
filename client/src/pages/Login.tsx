import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AnimatedPadlock } from "@/components/AnimatedPadlock";
import Logo from "@/assets/d44.svg";

const LoginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
});
type LoginForm = z.infer<typeof LoginSchema>;

export default function Login() {
    const [showPass, setShowPass] = useState(false);
    const { login, loading } = useAuth();
    const { toast } = useToast();
    const [, navigate] = useLocation();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({ resolver: zodResolver(LoginSchema) });

    const onSubmit = async (data: LoginForm) => {
        const result = await login({ email: data.username, password: data.password });

        if (result.error) {
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
            navigate("/dashboard");
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2 relative selection:bg-blue-100 font-sans overflow-hidden">
            {/* Mesh Gradient Background - Moved to Parent for Full Screen Coverage */}
            <div className="absolute inset-0 z-0 bg-[#5046e5]">
                {/* Deep Blue Core (Left) */}
                <div className="absolute top-[20%] left-[-20%] w-[100%] h-[100%] bg-[#0000FF] rounded-full blur-[120px] opacity-90" />
                
                {/* Bright Light Blue / White (Right Center) */}
                <div className="absolute top-[10%] right-[-10%] w-[80%] h-[90%] bg-[#E0F2FE] rounded-full blur-[100px] opacity-80" />
                
                {/* Purple / Lavender Accent (Top Right) */}
                <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-[#C084FC] rounded-full blur-[80px] opacity-60" />
                
                {/* Soft Purple Glow (Bottom) */}
                <div className="absolute bottom-[-20%] right-[10%] w-[70%] h-[60%] bg-[#818CF8] rounded-full blur-[110px] opacity-70" />
                
                {/* Noise/Texture Overlay */}
                <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/10" />
            </div>

            {/* Left Side */}
            <div className="hidden lg:flex flex-col relative z-10 p-12 xl:p-20 overflow-hidden group">

                {/* Content Container */}
                <div className="relative z-10 flex flex-col h-full">
                    {/* Top Section: Logo */}
                    <div className="mb-auto">
                        <Link href="/">
                            <div className="flex items-center gap-2 cursor-pointer group/logo w-fit">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-2xl shadow-black/10 group-hover/logo:scale-110 transition-all duration-500">
                                    <img src={Logo} alt="Logo" className="w-6 h-6 object-contain" />
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Bottom Section: Text Content */}
                    <div className="mt-auto max-w-lg text-white">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl mb-8">
                            <p className="text-white/90 text-sm leading-relaxed italic">
                                "Cybersecurity is not just about protecting your devices. It's about protecting yourself."
                            </p>
                        </div>
                        <h2 className="text-5xl xl:text-6xl font-black leading-[1.1] tracking-tight mb-4">
                            Uncompromised<br />Security
                        </h2>
                        <p className="text-white/80 font-medium tracking-wide text-lg">
                            Secure authentication for your dashboard access.
                        </p>
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
                        <Link href="/">
                            <div className="flex items-center gap-2 cursor-pointer group">
                                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
                                    <ShieldCheck className="w-6 h-6 text-white" />
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
                                placeholder="Username"
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

                        <div className="flex items-center justify-between text-xs font-semibold px-1 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" className="rounded bg-slate-200 border-none text-blue-600 focus:ring-blue-500/20 w-4 h-4 cursor-pointer" />
                                <span className="text-slate-500 group-hover:text-slate-700 transition-colors tracking-wide">
                                    Remember me
                                </span>
                            </label>
                            <Link href="#" className="text-slate-500 hover:text-slate-900 transition-colors tracking-wide">
                                Forgot Password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 mt-6 rounded-2xl bg-blue-600 text-white font-bold text-sm shadow-xl shadow-blue-600/20 hover:shadow-blue-600/30 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
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
                            <Link href="/register" className="text-slate-900 font-bold hover:text-blue-600 transition-colors inline-flex items-center gap-1 ml-1">
                                Sign Up <span aria-hidden="true">&rarr;</span>
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
