import { otpSchema } from "@/components/Verify";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { toast } from "sonner";
import { z } from "zod";

export const OtpVerify = async (
  data: z.infer<typeof otpSchema>,
  router: AppRouterInstance,
  email: string | null
) => {
  const api = await fetch("/api/verify", {
    method: "POST",
    body: JSON.stringify({ data, email }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const res = await api.json();

  if (api.status === 200) {
    toast.success(res.message);
    localStorage.removeItem("Email");
    localStorage.setItem("token", res.token);
    router.push("/profile")
  } else if (api.status === 400) {
    toast.error(res.message);
  } else if (api.status === 404) {
    toast.error(res.message);
  } else if (api.status === 500) {
    toast.error(res.message);
  }
};
