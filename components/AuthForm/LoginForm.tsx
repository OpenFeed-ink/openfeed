"use client";
import { motion } from "motion/react"
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { Variants } from "motion";
import * as z from "zod";
import { toast } from "sonner"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { Logo } from "../Logo";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});


type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });


  const onLogin = (data: LoginValues) => {
    startTransition(async () => {
      const { error } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });
      if (error) {
        toast.error(error.message || "unkown error")
        return;
      }
      router.replace("/");
    });
  };


  const loginWith = (provider: "google" | "github") => {
    startTransition(async () => {
      const { error } = await authClient.signIn.social({
        provider,
      });
      if (error) {
        toast.error(error.message || "unkown error")
      }
    });
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md"
    >
      <Card className="border-border/50 shadow-lg backdrop-blur-sm">
        <CardHeader className="space-y-2 text-center">
          <motion.div variants={itemVariants} className="flex items-center justify-center">
            <Logo size={200} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <CardTitle className="text-2xl font-bold">
              Welcome back
            </CardTitle>
            <CardDescription>
              Enter your credentials to access your dashboard"
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Social Login Buttons */}
          <motion.div
            variants={staggerChildren}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-3"
          >
            <motion.div variants={fadeUp}>
              <Button
                variant="outline"
                className="w-full border-muted-foreground/20 hover:bg-teal-500/10 hover:border-teal-500/50 transition-all"
                onClick={() => loginWith('google')}
              >
                <FaGoogle className="mr-2 h-4 w-4" />
                Google
              </Button>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Button
                variant="outline"
                className="w-full border-muted-foreground/20 hover:bg-teal-500/10 hover:border-teal-500/50 transition-all"
                onClick={() => loginWith('github')}
              >
                <FaGithub className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Separator />
          </motion.div>

          {/* Email/Password Form */}
          <motion.form variants={itemVariants} onSubmit={handleSubmit(onLogin)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isPending}
                required
                className="transition-all duration-200 border-muted-foreground/20 focus:ring-2 focus:ring-teal-500"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  placeholder="••••••••••••••••••••••••"
                  type={showPassword ? "text" : "password"}
                  autoCapitalize="none"
                  autoComplete={"current-password"}
                  disabled={isPending}
                  required
                  className="transition-all duration-200 border-muted-foreground/20 focus:ring-2 focus:ring-teal-500 pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-teal-600 text-white transition-all duration-200 hover:bg-teal-700 hover:scale-[1.02] active:scale-[0.98]"
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </motion.form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          {/* Toggle between signin/signup */}
          <motion.div variants={itemVariants} className="text-center text-sm w-full">
            <p className="text-muted-foreground">
              Don&apos;t have an account?{" "}
              <a
                href="/signup"
                className="font-medium text-teal-600 transition-colors hover:text-teal-500 hover:underline"
              >
                Sign up
              </a>
            </p>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
