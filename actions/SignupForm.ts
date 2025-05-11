"use client";
import { z } from "zod";
import { signupSchema } from "@/components/Signup";
import { toast } from "sonner";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const signup = async (
  data: z.infer<typeof signupSchema>,
  router: AppRouterInstance
) => {
  const api = await fetch("/api/signup", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const res = await api.json();

  if (api.status === 200) {
    toast.success(res.message);
    localStorage.setItem("Email", data.email);
    router.push("/verify");
  } else if (api.status === 400) {
    toast.error(res.message);
  } else if (api.status === 401) {
    toast.error(res.message);
    router.push("/verify");
  } else if (api.status === 500) {
    toast.error(res.message);
  } else if (api.status === 422) {
    toast.error(res.message);
  }
};
