"use client";

import { useRef, useTransition } from "react";
import emailjs from "@emailjs/browser";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, User, MessageSquare, Send, Loader2 } from "lucide-react";

export default function ContactUs() {
  const form = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  const sendEmail = (e: any) => {
    e.preventDefault();

    startTransition(async () => {
      if (!form.current) return;
      try {
        const res = await emailjs.sendForm(
          "service_xqoj3i9",
          "template_44i8ptx",
          form.current,
          "M3PNytkF0RPjKCPL5"
        );
        if (res.status === 200) {
          toast.success("Message sent successfully!");
          form.current?.reset();
        }
      } catch (error) {
        toast.error("Failed to send message. Please try again!");
      }
    });
  };
  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, delay: 0.2 },
    },
  };

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial="hidden"
        animate="visible"
        className="w-full max-w-6xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left side: Illustration and info */}
          <motion.div
            variants={formVariants}
            className="hidden lg:block space-y-6 text-center lg:text-left"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full -z-10" />
              <Mail className="h-16 w-16 text-emerald-600 mx-auto lg:mx-0 mb-4" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              We'd love to hear from you
            </h2>
            <p className="text-muted-foreground text-lg">
              Have a question, feedback, or just want to say hello?
              <br />
              Our team is here to help.
            </p>
            <div className="flex flex-col gap-3 text-muted-foreground">
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <Mail className="h-5 w-5 text-emerald-600" />
                <span>aliamer19ali@gmail.com</span>
              </div>
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <MessageSquare className="h-5 w-5 text-emerald-600" />
                <span>Response within 24h</span>
              </div>
            </div>
          </motion.div>

          {/* Right side: Form */}
          <motion.div variants={formVariants}>
            <Card className="border-border/50 shadow-xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Mail className="h-6 w-6 text-emerald-600" />
                  Contact Support
                </CardTitle>
                <CardDescription className="text-base">
                  We're here to help. Send us a message and we'll get back to you
                  as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-5" ref={form} onSubmit={sendEmail}>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-emerald-600" />
                      Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Your Name"
                      required
                      disabled={pending}
                      className="w-full transition-all focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-emerald-600" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="Your Email"
                      required
                      disabled={pending}
                      className="w-full transition-all focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-emerald-600" />
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Your Message"
                      required
                      disabled={pending}
                      className="w-full min-h-32 max-h-48 transition-all focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={pending}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {pending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
