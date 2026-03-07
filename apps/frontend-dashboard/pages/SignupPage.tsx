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
import { Label } from "@radix-ui/react-label";
import type { SignupRequest } from "@repo/shared";
import { useAuth } from "hooks/useAuth";
import { Loader2, Zap } from "lucide-react";
import React from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, signupLoading } = useAuth();
  const [form, setForm] = React.useState<SignupRequest>({
    email: "",
    password: "",
  })

  // const onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setForm(prev => {
  //     return {
  //       ...prev,
  //       email: e.target.value
  //     }
  //   })
  // }

  // const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setForm(prev => {
  //     return {
  //       ...prev,
  //       password: e.target.value
  //     }
  //   })
  // }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {id, value } = e.target;
    setForm(prev => {
      return {
        ...prev,
        [id]: value
      }
    })
  }
  const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Inside handleSubmit");
   try {
     await signup(form);
     toast.success("Account created successfully");
     navigate("/login");
   } catch (error: any) {
    toast.error(error.message);
   }
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="pointer-events-none fixed inset-0 `bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,oklch(0.62_0.22_268/0.15),transparent)]`" />
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-md bg-primary shadow-md shadow-primary/30">
            <Zap className="size-6 text-primary-foreground" />
          </div>
          <p className="font-bold text-2xl tracking-tight">Open Router</p>
        </div>

        <Card className="border-border/60 shadow-xl shadow-black/30">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Create Account</CardTitle>
            <CardDescription>Start building with NexusAI today</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
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
              <div>
                <Label>Password</Label>
                <Input 
                id="password"
                type="password"
                placeholder="password"
                onChange={handleChange}
                value={form.password}
                required
                minLength={8}
                />
                <p className="text-xs text-muted-foreground">At least 8 characters</p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Button disabled={signupLoading} className="w-full cursor-pointer" type="submit">
                {signupLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                Create Account
              </Button>
              <p>Already have an account?{" "}
                <Link to={"/login" } className="text-primary font-semibold hover:underline">
                Sign In
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;
