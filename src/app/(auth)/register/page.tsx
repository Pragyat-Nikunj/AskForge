"use client";

import { useAuthStore } from '@/store/Auth';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { ShineBorder } from '@/components/magicui/shine-border';
import { toast } from "react-hot-toast";
import { useRouter } from 'next/navigation';

function RegisterPage() {
  const { login, createAccount, session } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const firstname = formData.get("firstname");
    const lastname = formData.get("lastname");
    const email = formData.get("email");
    const password = formData.get("password");

    if (!firstname || !lastname || !email || !password) {
      setError("Please fill all the fields.");
      return;
    }

    setIsLoading(true);
    setError("");

    const response = await createAccount(
      `${firstname} ${lastname}`,
      email.toString(),
      password.toString()
    );

    if (response.error) {
      toast.error("Registration Failed");
      setError(response.error.message);
    } else {
      const loginResponse = await login(email.toString(), password.toString());
      if (loginResponse.error) {
        toast.error("Login Failed");
        setError(loginResponse.error.message);
      }
      else {
        toast.success("Registration Successful");
        router.push("/");
      }
    }

    setIsLoading(false);
  };

  if (session) {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen flex items-center justify-center p-4 text-white">
        <p>You are already logged in. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md relative animate-fade-in">
        {/* Matched background glow from LoginPage */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-blue-400/30 via-indigo-500/20 to-white/10 blur-xl opacity-70"></div>

        <form
          onSubmit={handleSubmit}
          className="relative z-10 bg-white/10 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/10 flex flex-col gap-6"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}
        >
          <ShineBorder shineColor={["#60A5FA", "#818CF8", "#38BDF8"]} />
          <div className="text-center mb-2">
            <h1 className="text-3xl font-bold text-white drop-shadow">Register</h1>
            <p className="text-slate-300 text-sm mt-1">
              Create an account to get started.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="firstname" className="text-slate-200 text-sm font-medium">
              First Name
            </label>
            <input
              type="text"
              id="firstname"
              name="firstname"
              autoComplete="given-name"
              required
              className="bg-slate-900/30 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              placeholder="John"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="lastname" className="text-slate-200 text-sm font-medium">
              Last Name
            </label>
            <input
              type="text"
              id="lastname"
              name="lastname"
              autoComplete="family-name"
              required
              className="bg-slate-900/30 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              placeholder="Doe"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-slate-200 text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              required
              className="bg-slate-900/30 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-slate-200 text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="new-password"
              required
              className="bg-slate-900/30 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm font-medium animate-shake">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-bold shadow-md hover:scale-105 transition-transform duration-300 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Creating account...
              </span>
            ) : (
              "Register"
            )}
          </button>

          <p className="text-sm text-center text-slate-300 mt-2">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400 hover:underline font-medium">
              Login
            </Link>
          </p>
        </form>
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out both;
        }

        @keyframes shake {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-4px); }
          40%, 60% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default RegisterPage;
