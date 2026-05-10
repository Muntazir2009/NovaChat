import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, User, Eye, EyeOff, MessageSquare, Sparkles } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const resetSchema = z.object({
  email: z.string().email("Invalid email"),
});

type Mode = "login" | "signup" | "reset";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const { toast } = useToast();

  const loginForm = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });
  const signupForm = useForm({ resolver: zodResolver(signupSchema), defaultValues: { displayName: "", email: "", password: "" } });
  const resetForm = useForm({ resolver: zodResolver(resetSchema), defaultValues: { email: "" } });

  const handleLogin = async (data: z.infer<typeof loginSchema>) => {
    try {
      await signIn(data.email, data.password);
    } catch {
      toast({ title: "Login failed", description: "Invalid email or password", variant: "destructive" });
    }
  };

  const handleSignup = async (data: z.infer<typeof signupSchema>) => {
    try {
      await signUp(data.email, data.password, data.displayName);
    } catch {
      toast({ title: "Sign up failed", description: "Could not create account", variant: "destructive" });
    }
  };

  const handleReset = async (data: z.infer<typeof resetSchema>) => {
    try {
      await resetPassword(data.email);
      toast({ title: "Email sent", description: "Check your inbox for reset instructions" });
      setMode("login");
    } catch {
      toast({ title: "Failed", description: "Could not send reset email", variant: "destructive" });
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch {
      toast({ title: "Google sign-in failed", variant: "destructive" });
    }
  };

  const particles = Array.from({ length: 20 });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        {particles.map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/40"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ y: [0, -30, 0], opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md px-4"
      >
        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center mb-4 shadow-lg glow-primary"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <MessageSquare className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
              NovaChat
            </h1>
            <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Connect. Chat. Create.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {mode === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="text-xl font-semibold mb-6 text-center">Welcome back</h2>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <FormField control={loginForm.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input data-testid="input-email" placeholder="Email address" autoComplete="email" className="pl-10 bg-muted/50 border-border h-12 rounded-xl" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={loginForm.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input data-testid="input-password" type={showPassword ? "text" : "password"} placeholder="Password" autoComplete="current-password" className="pl-10 pr-10 bg-muted/50 border-border h-12 rounded-xl" {...field} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="text-right">
                      <button type="button" onClick={() => setMode("reset")} className="text-sm text-primary hover:underline">
                        Forgot password?
                      </button>
                    </div>
                    <Button data-testid="button-login" type="submit" className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold shadow-lg transition-all duration-200" disabled={loginForm.formState.isSubmitting}>
                      {loginForm.formState.isSubmitting ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </Form>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                  <div className="relative flex justify-center text-xs text-muted-foreground"><span className="bg-card px-3">or continue with</span></div>
                </div>
                <Button data-testid="button-google" variant="outline" className="w-full h-12 rounded-xl border-border hover:bg-muted/50 font-medium" onClick={handleGoogle}>
                  <FcGoogle className="w-5 h-5 mr-2" /> Continue with Google
                </Button>
                <p className="text-center text-sm text-muted-foreground mt-6">
                  Don't have an account?{" "}
                  <button onClick={() => setMode("signup")} className="text-primary font-medium hover:underline">Sign up</button>
                </p>
              </motion.div>
            )}

            {mode === "signup" && (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="text-xl font-semibold mb-6 text-center">Create account</h2>
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                    <FormField control={signupForm.control} name="displayName" render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input data-testid="input-name" placeholder="Display name" autoComplete="name" className="pl-10 bg-muted/50 border-border h-12 rounded-xl" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={signupForm.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input data-testid="input-signup-email" placeholder="Email address" autoComplete="email" className="pl-10 bg-muted/50 border-border h-12 rounded-xl" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={signupForm.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input data-testid="input-signup-password" type={showPassword ? "text" : "password"} placeholder="Password (min 6 chars)" autoComplete="new-password" className="pl-10 pr-10 bg-muted/50 border-border h-12 rounded-xl" {...field} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button data-testid="button-signup" type="submit" className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold shadow-lg" disabled={signupForm.formState.isSubmitting}>
                      {signupForm.formState.isSubmitting ? "Creating..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                  <div className="relative flex justify-center text-xs text-muted-foreground"><span className="bg-card px-3">or</span></div>
                </div>
                <Button variant="outline" className="w-full h-12 rounded-xl border-border hover:bg-muted/50 font-medium" onClick={handleGoogle}>
                  <FcGoogle className="w-5 h-5 mr-2" /> Continue with Google
                </Button>
                <p className="text-center text-sm text-muted-foreground mt-6">
                  Already have an account?{" "}
                  <button onClick={() => setMode("login")} className="text-primary font-medium hover:underline">Sign in</button>
                </p>
              </motion.div>
            )}

            {mode === "reset" && (
              <motion.div
                key="reset"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="text-xl font-semibold mb-2 text-center">Reset Password</h2>
                <p className="text-muted-foreground text-sm text-center mb-6">Enter your email and we'll send a reset link</p>
                <Form {...resetForm}>
                  <form onSubmit={resetForm.handleSubmit(handleReset)} className="space-y-4">
                    <FormField control={resetForm.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input data-testid="input-reset-email" placeholder="Email address" autoComplete="email" className="pl-10 bg-muted/50 border-border h-12 rounded-xl" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button data-testid="button-reset" type="submit" className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold" disabled={resetForm.formState.isSubmitting}>
                      Send Reset Link
                    </Button>
                  </form>
                </Form>
                <p className="text-center text-sm text-muted-foreground mt-6">
                  <button onClick={() => setMode("login")} className="text-primary font-medium hover:underline">Back to login</button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
