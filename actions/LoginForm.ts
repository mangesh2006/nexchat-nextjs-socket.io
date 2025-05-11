import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { toast } from "sonner";

type LoginFormProps = {
  email: string;
  password: string;
};

export const LoginForm = async (
  Form: LoginFormProps,
  router: AppRouterInstance
) => {
  const { email, password } = Form;
  const api = await fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const res = await api.json();

  if (api.status === 200) {
    toast.success(res.message);
    localStorage.setItem("token", res.token);
    router.push("/dashboard");
  } else if (api.status === 400) {
    toast.error(res.message);
  } else if (api.status === 500) {
    toast.error(res.message);
  }
};
