import { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, ShieldCheck, ShieldAlert, XCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { PerusahaanSelector, PERUSAHAAN_NEW } from "@/components/PerusahaanSelector";
import { AnimatedPadlock } from "@/components/AnimatedPadlock";
import Logo from "@/assets/d44.svg";

const RegisterSchema = z
    .object({
        username: z.string().min(3, "Username must be at least 3 characters"),
        email: z.string().email("Invalid email format"),
        password: z.string()
            .min(8, "Password does not meet requirements")
            .regex(/[a-z]/, "Password does not meet requirements")
            .regex(/[A-Z]/, "Password does not meet requirements")
            .regex(/[0-9]/, "Password does not meet requirements")
            .regex(/[^a-zA-Z0-9]/, "Password does not meet requirements"),
        confirmPassword: z.string(),
        perusahaanId: z.string().min(1, "Institution/company is required"),
    })
    .refine((v) => {
        if (!v.password) return true;
        const passLower = v.password.toLowerCase();
        if (v.username && v.username.length >= 3 && passLower.includes(v.username.toLowerCase())) {
            return false;
        }
        if (v.email) {
            const emailPrefix = v.email.split('@')[0];
            if (emailPrefix && emailPrefix.length >= 3 && passLower.includes(emailPrefix.toLowerCase())) {
                return false;
            }
        }
        return true;
    }, {
        message: "Password does not meet requirements",
        path: ["password"],
    })
    .refine((v) => v.password === v.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type RegisterForm = z.infer<typeof RegisterSchema>;

export default function Register() {
    const [showPass, setShowPass] = useState(false);
    const [newCompanyName, setNewCompanyName] = useState("");
    const { register: registerUser, loading } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);

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
        control,
        watch,
        setError,
        formState: { errors },
    } = useForm<RegisterForm>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: { perusahaanId: "" },
    });

    const perusahaanId = watch("perusahaanId");
    const isNewCompany = perusahaanId === PERUSAHAAN_NEW;
    
    // Password Strength Logic
    const usernameValue = watch("username") || "";
    const emailValue = watch("email") || "";
    const passwordValue = watch("password") || "";
    
    const hasMinLen = passwordValue.length >= 8;
    const hasLower = /[a-z]/.test(passwordValue);
    const hasUpper = /[A-Z]/.test(passwordValue);
    const hasNumber = /[0-9]/.test(passwordValue);
    const hasSymbol = /[^a-zA-Z0-9]/.test(passwordValue);
    
    const hasUsernameError = usernameValue.length >= 3 && passwordValue.toLowerCase().includes(usernameValue.toLowerCase());
    const emailPrefix = emailValue.split('@')[0];
    const hasEmailError = emailPrefix.length >= 3 && passwordValue.toLowerCase().includes(emailPrefix.toLowerCase());
    const doesNotContainUserOrEmail = !hasUsernameError && !hasEmailError && passwordValue.length > 0;

    const strengthScore = [hasMinLen, hasLower, hasUpper, hasNumber, hasSymbol, doesNotContainUserOrEmail].filter(Boolean).length;
    let strengthLabel = "Very Weak";
    let strengthColor = "text-red-500";
    let StrengthIcon = ShieldAlert;

    if (strengthScore === 6) {
        strengthLabel = "Very Strong";
        strengthColor = "text-emerald-500";
        StrengthIcon = ShieldCheck;
    } else if (strengthScore >= 4) {
        strengthLabel = "Strong";
        strengthColor = "text-emerald-500";
        StrengthIcon = ShieldCheck;
    } else if (strengthScore >= 3) {
        strengthLabel = "Medium";
        strengthColor = "text-yellow-500";
        StrengthIcon = ShieldAlert;
    } else if (strengthScore >= 2) {
        strengthLabel = "Weak";
        strengthColor = "text-orange-500";
        StrengthIcon = ShieldAlert;
    }

    const onSubmit = async (data: RegisterForm) => {
        // Validate new company name if "NEW" was selected
        if (isNewCompany && !newCompanyName.trim()) {
            toast({ title: "Company name is required", description: "Please fill in the new company name.", variant: "destructive" });
            return;
        }

        // Build payload: either id_perusahaan OR nama_perusahaan — mirrors Vue behaviour
        const payload: Parameters<typeof registerUser>[0] = isNewCompany
            ? {
                username: data.username,
                email: data.email,
                password: data.password,
                nama_perusahaan: newCompanyName.trim(),
            }
            : {
                username: data.username,
                email: data.email,
                password: data.password,
                id_perusahaan: data.perusahaanId,
            };

        const result = await registerUser(payload);

        if (result.success) {
            toast({ title: "Registration successful", description: "Please log in with your new account." });
            navigate("/login");
        } else {
            toast({ title: "Registration failed", description: result.error, variant: "destructive" });
        }
    };

    return (
        <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="min-h-screen grid lg:grid-cols-2 relative selection:bg-blue-100 font-sans overflow-hidden bg-[#5046e5]"
        >
            {/* Interactive Mouse-Following Gradient Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {/* Dynamic Interactive Cursor Glows */}
                <div 
                    className="absolute inset-0 z-10 transition-opacity duration-300 mix-blend-overlay"
                    style={{
                        background: `radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.4), transparent 60%)`
                    }}
                />
                <div 
                    className="absolute inset-0 z-10 transition-opacity duration-300 pointer-events-none"
                    style={{
                        background: `radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.6), transparent 80%)`
                    }}
                />

                {/* Base Mesh Gradient (Animated Background Elements) */}
                <style>
                    {`
                    @keyframes blob-float-1 {
                        0%, 100% { transform: translate(0px, 0px) scale(1); }
                        33% { transform: translate(40px, -60px) scale(1.1); }
                        66% { transform: translate(-30px, 30px) scale(0.9); }
                    }
                    @keyframes blob-float-2 {
                        0%, 100% { transform: translate(0px, 0px) scale(1); }
                        33% { transform: translate(-40px, 50px) scale(1.15); }
                        66% { transform: translate(30px, -40px) scale(0.85); }
                    }
                    `}
                </style>
                <div className="absolute top-[20%] left-[-20%] w-[100%] h-[100%] bg-[#0000FF] rounded-full blur-[120px] opacity-90" style={{ animation: 'blob-float-1 15s ease-in-out infinite' }} />
                <div className="absolute top-[10%] right-[-10%] w-[80%] h-[90%] bg-[#E0F2FE] rounded-full blur-[100px] opacity-80" style={{ animation: 'blob-float-2 18s ease-in-out infinite' }} />
                <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-[#C084FC] rounded-full blur-[80px] opacity-60" style={{ animation: 'blob-float-1 22s ease-in-out infinite reverse' }} />
                <div className="absolute bottom-[-20%] right-[10%] w-[70%] h-[60%] bg-[#818CF8] rounded-full blur-[110px] opacity-70" style={{ animation: 'blob-float-2 16s ease-in-out infinite reverse' }} />

                {/* Noise/Texture Overlay */}
                <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] mix-blend-overlay z-20" />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/10 z-20" />
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
                    <div className="mt-auto max-w-lg text-white">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl mb-8">
                            <p className="text-white/90 text-sm leading-relaxed italic">
                                "Cybersecurity is not just about protecting your devices. It's about protecting yourself." - Anonymous
                            </p>
                        </div>
                        {/* <h2 className="text-5xl xl:text-6xl font-black leading-[1.1] tracking-tight mb-4">
                            Easy<br />Registration
                        </h2>
                        <p className="text-white/80 font-medium tracking-wide text-lg">
                            Join and secure your data with us.
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
                                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
                                    <ShieldCheck className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xl font-display font-black tracking-tight text-slate-900">
                                    FortyFour
                                </span>
                            </div>
                        </Link>
                    </div>

                    <div className="mb-8 text-center lg:text-left">
                        <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-2">
                            Create Account
                        </h1>
                        <p className="text-slate-500 text-sm">
                            Join and start managing your dashboard securely.
                        </p>
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

                        {/* Email */}
                        <div>
                            <input
                                {...register("email")}
                                type="email"
                                placeholder="Email"
                                className="w-full px-5 py-4 rounded-2xl bg-[#f8fafc] border border-transparent text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all shadow-sm"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs font-semibold mt-1 ml-1">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Perusahaan selector — "Add New Company" shows an inline text input,
                            the name is sent as nama_perusahaan in the register payload (no separate POST needed) */}
                        <Controller
                            control={control}
                            name="perusahaanId"
                            render={({ field }) => (
                                <PerusahaanSelector
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={errors.perusahaanId?.message}
                                    onNewName={setNewCompanyName}
                                    newName={newCompanyName}
                                />
                            )}
                        />

                        {/* Password */}
                        <div className="relative">
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
                            </div>
                            
                            {/* Password Strength Indicator */}
                            {passwordValue && (
                                <div className="mt-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className={`flex items-center gap-1.5 text-sm font-semibold ${strengthColor}`}>
                                            <StrengthIcon className="w-4 h-4" />
                                            <span>{strengthLabel}</span>
                                        </div>
                                        <span className="text-slate-500 text-sm">{passwordValue.length} characters</span>
                                    </div>
                                    
                                    <div className="bg-[#f8fafc] border border-slate-100 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 mb-2">
                                        <div className="flex items-center gap-2">
                                            {hasMinLen ? <CheckCircle2 className="w-5 h-5 text-white fill-emerald-500" /> : <XCircle className="w-5 h-5 text-white fill-red-500" />}
                                            <span className={`text-sm ${hasMinLen ? 'text-emerald-600' : 'text-red-500'}`}>Minimum 8 characters</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {hasUpper ? <CheckCircle2 className="w-5 h-5 text-white fill-emerald-500" /> : <XCircle className="w-5 h-5 text-white fill-red-500" />}
                                            <span className={`text-sm ${hasUpper ? 'text-emerald-600' : 'text-red-500'}`}>Uppercase letter (A-Z)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {hasLower ? <CheckCircle2 className="w-5 h-5 text-white fill-emerald-500" /> : <XCircle className="w-5 h-5 text-white fill-red-500" />}
                                            <span className={`text-sm ${hasLower ? 'text-emerald-600' : 'text-red-500'}`}>Lowercase letter (a-z)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {hasNumber ? <CheckCircle2 className="w-5 h-5 text-white fill-emerald-500" /> : <XCircle className="w-5 h-5 text-white fill-red-500" />}
                                            <span className={`text-sm ${hasNumber ? 'text-emerald-600' : 'text-red-500'}`}>Number (0-9)</span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {hasSymbol ? <CheckCircle2 className="w-5 h-5 text-white fill-emerald-500" /> : <XCircle className="w-5 h-5 text-white fill-red-500" />}
                                            <span className={`text-sm ${hasSymbol ? 'text-emerald-600' : 'text-red-500'}`}>Symbol (!@#$%)</span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {doesNotContainUserOrEmail ? <CheckCircle2 className="w-5 h-5 text-white fill-emerald-500" /> : <XCircle className="w-5 h-5 text-white fill-red-500" />}
                                            <span className={`text-sm ${doesNotContainUserOrEmail ? 'text-emerald-600' : 'text-red-500'} break-words whitespace-pre-wrap`}>Exclude username/email</span>
                                        </div>
                                    </div>
                                    
                                    {errors.password && strengthScore !== 6 && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <XCircle className="w-4 h-4 text-white fill-red-500" />
                                            <p className="text-red-500 text-sm font-semibold">{errors.password.message}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {!passwordValue && errors.password && (
                                <p className="text-red-500 text-xs font-semibold mt-1 ml-1">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="relative">
                            <input
                                {...register("confirmPassword")}
                                type={showPass ? "text" : "password"}
                                placeholder="Confirm Password"
                                className="w-full pl-5 pr-12 py-4 rounded-2xl bg-[#f8fafc] border border-transparent text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all shadow-sm"
                            />
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-xs font-semibold mt-1 ml-1">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        {/* Submit */}
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
                                "Create Account"
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-slate-100">
                        <p className="text-slate-500 text-sm font-medium">
                            Already have an account?{" "}
                            <Link to="/login" className="text-slate-900 font-bold hover:text-blue-600 transition-colors inline-flex items-center gap-1 ml-1">
                                Log In <span aria-hidden="true">&rarr;</span>
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
