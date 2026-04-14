import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your workspace"
      subtitle="Set up your account to upload footage, direct the AI, and ship polished exports."
      submitLabel="Create account"
      includeName
      footer={
        <span>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-accentSoft transition hover:text-white">
            Sign in
          </Link>
        </span>
      }
    />
  );
}
