"use client";
import React, { useEffect, useState } from "react";
import { z } from "zod";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OtpVerify } from "@/actions/OtpVerification";
import { useRouter } from "next/navigation";

export const otpSchema = z.object({
  otp: z.string().min(6, { message: "Otp must be 6 digits" }),
});

const Verify = () => {
  const [Email, setEmail] = useState<string | null>("");
  const [Loading, setLoading] = useState(false);
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(otpSchema),
  });
  useEffect(() => {
    const email = localStorage.getItem("Email");
    if (!email) return;
    setEmail(email);
  }, []);

  const onSubmit = async (data: z.infer<typeof otpSchema>) => {
    setLoading(true)
    await OtpVerify(data, router, Email)
    setLoading(false)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-sky-50 to-pink-100 text-gray-800 flex justify-center items-center">
      <div className="border border-purple-300 shadow rounded-2xl p-5">
        <form
          className="flex justify-center flex-col gap-2"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Label htmlFor="otp" className="text-2xl font-bold mb-3">
            Verify
          </Label>
          <p>
            An otp is sent on your email. Enter the otp below to verify yourself
          </p>
          <p>
            <strong>Note: </strong>This otp is only valid for 5 minutes
          </p>
          <Input
            id="otp"
            placeholder="Enter 6 digit otp"
            maxLength={6}
            {...register("otp")}
          />
          {errors.otp && <p className="text-red-600">{errors.otp.message}</p>}
          <Button type="submit" className="bg-purple-400 hover:bg-purple-500">
            {Loading ? <Loader2 className="animate-spin" /> : "Verify"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Verify;
