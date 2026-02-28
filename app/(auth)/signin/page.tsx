import { LoginForm } from "@/components/AuthForm/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - OpenFeed",
  description: "Sign in to your OpenFeed account",
};

export default function SignInPage() {
  return <LoginForm />
}
