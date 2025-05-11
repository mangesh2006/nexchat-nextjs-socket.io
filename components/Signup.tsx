"use client";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signup } from "@/actions/SignupForm";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { LoginForm } from "@/actions/LoginForm";

export const signupSchema = z.object({
  username: z
    .string()
    .min(2, { message: "Username must be atleast 2 characters" }),
  email: z.string().email({ message: "Please enter valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase latter",
    })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase latter",
    })
    .regex(/[#, @, $, &, *]/, {
      message: "Password must contain at least one special character",
    }),
});

const Signup = () => {
  const router = useRouter();
  const [Loading, setLoading] = useState(false);
  const [Form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleOnchange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: z.infer<typeof signupSchema>) => {
    setLoading(true);
    try {
      await signup(data, router);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await LoginForm(Form, router);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-sky-50 to-pink-100 text-gray-800 flex justify-center items-center">
      <Tabs defaultValue="signup" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2 gap-2">
          <TabsTrigger
            value="signup"
            className="data-[state=active]:border-purple-400 cursor-pointer bg-white"
          >
            Singup
          </TabsTrigger>
          <TabsTrigger
            value="login"
            className="data-[state=active]:border-purple-400 cursor-pointer bg-white"
          >
            Login
          </TabsTrigger>
        </TabsList>
        <TabsContent value="signup">
          <Card className="border-purple-300">
            <CardHeader>
              <CardTitle>Signup</CardTitle>
              <CardDescription>Make your account here.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter username"
                    {...register("username")}
                  />
                </div>
                {errors.username && (
                  <p className="text-red-600">{errors.username.message}</p>
                )}
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="Enter Email"
                    type="email"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-600">{errors.email.message}</p>
                )}
                <div className="space-y-1">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    placeholder="Enter Password"
                    type="password"
                    {...register("password")}
                  />
                </div>
                {errors.password && (
                  <p className="text-red-600">{errors.password.message}</p>
                )}
                <div className="w-full border-t border-b p-2 mt-3 flex flex-col">
                  <h3 className="text-md font-bold">Passsword requirements</h3>
                  <ul className="list-disc">
                    <li>Password length must be 8 characters</li>
                    <li>Password must contain one number</li>
                    <li>Password must contain one lowercase latter</li>
                    <li>Password must contain one uppercase latter</li>
                    <li>Password must contain one special character</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex mt-2 items-center">
                <Button
                  type="submit"
                  className="bg-purple-600 text-white px-8 py-3 hover:bg-purple-700 transition flex justify-center items-center"
                  disabled={Loading}
                >
                  {Loading ? <Loader2 className="animate-spin" /> : "Signup"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="login">
          <Card className="border-purple-300">
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Login here to use features you want.
              </CardDescription>
            </CardHeader>
            <form onSubmit={onLogin}>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    name="email"
                    id="email"
                    type="email"
                    placeholder="Enter Email"
                    onChange={handleOnchange}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password">password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter Password"
                    name="password"
                    onChange={handleOnchange}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex mt-2 items-center">
                <Button
                  type="submit"
                  className="bg-purple-600 text-white px-8 py-3 hover:bg-purple-700 transition"
                  disabled={Loading}
                >
                  {Loading ? <Loader2 className="animate-spin" /> : "Login"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Signup;
