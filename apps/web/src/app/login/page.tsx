import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue editing, review exports, and direct your next cut."
      submitLabel="Sign in"
      footer={
        <span>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-accentSoft transition hover:text-white">
            Create one
          </Link>
        </span>
      }
    />
  );
}
