// app/(auth)/login/page.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeClosed } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const nextError = searchParams.get("error"); // erro vindo do NextAuth
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(nextError);
  const [isPending, startTransition] = useTransition();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
        callbackUrl,
      });

      if (res?.error) {
        setError("Credenciais inválidas. Verifique seu usuário e senha.");
        return;
      }

      // Login ok
      router.push(res?.url ?? callbackUrl);
      router.refresh();
    });
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-6 animate-fade-in">
      <Card className="w-full max-w-md backdrop-blur-sm bg-white/95 border border-gray-200/50 shadow-xl rounded-2xl animate-scale-in">
        <CardHeader className="space-y-3 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight text-slate-800">
            Uai Cores Production Line
          </CardTitle>
          <CardDescription className="text-slate-600 font-medium">
            Faça login com seu usuário e senha
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 animate-shake shadow-sm">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid gap-2">
              <Label
                htmlFor="username"
                className="text-sm font-semibold text-slate-700"
              >
                Usuário
              </Label>
              <Input
                id="username"
                name="username"
                placeholder="seu.usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                disabled={isPending}
                required
                className="rounded-lg border-gray-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 bg-white transition-all duration-200 hover:border-slate-300"
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-slate-700"
                >
                  Senha
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={isPending}
                  required
                  className="rounded-lg border-gray-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 bg-white transition-all duration-200 hover:border-slate-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800 transition-colors duration-200"
                >
                  {showPwd ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeClosed className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending || !username || !password}
              className="w-full rounded-lg bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white font-semibold py-3 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Entrando...
                </div>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
