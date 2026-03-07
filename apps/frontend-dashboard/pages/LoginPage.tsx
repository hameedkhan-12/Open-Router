import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LoginRequest } from "@repo/shared";
import { useAuth } from "hooks/useAuth";
import { Loader2, Zap } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

const LoginPage = () => {
  const { login, loginLoading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginRequest>({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    setForm((prev) => {
      return {
        ...prev,
        [id]: value,
      };
    });
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      console.log("form", form);
      await login(form);
      console.log("Login successful");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Login failed. Please try again.",
      );
    }
  };
  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="pointer-events-none fixed inset-0 `bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,oklch(0.62_0.22_268/0.15),transparent)]`" />

      <div className="relative z-10 max-w-sm w-full">
        <div className="flex flex-col gap-3 items-center">
          <div className="size-12 bg-primary flex items-center justify-center rounded-md shadow-md shadow-primary/30">
            <Zap className="text-primary-foreground size-6" />
          </div>
          <p className="font-bold text-2xl tracking-tight">Open Router</p>
        </div>

        <Card className="border-border/60 shadow-md shadow-black/30">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>

          <form onSubmit={submitHandler}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="abc@email.com"
                  onChange={handleChange}
                  value={form.email}
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  onChange={handleChange}
                  value={form.password}
                  required
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Button className="w-full" type="submit" disabled={loginLoading}>
                {loginLoading && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                Sign In
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link to={"/signup"} className="hover:underline">
                  Create One
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
