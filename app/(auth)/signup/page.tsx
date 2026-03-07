import { Metadata } from "next";
import { SignupForm } from "@/components/AuthForm/SignupForm";

export const metadata: Metadata = {
  title: "Sign Up - OpenFeed",
  description: "Create your OpenFeed account",
};

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const { callbackUrl } = await searchParams
  return <SignupForm callbackUrl={callbackUrl} />
}
