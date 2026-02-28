import { Metadata } from "next";
import { SignupForm } from "@/components/AuthForm/SignupForm";

export const metadata: Metadata = {
  title: "Sign Up - OpenFeed",
  description: "Create your OpenFeed account",
};

export default function SignUpPage() {
  return <SignupForm />
}
