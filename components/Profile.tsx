"use client";
import React, { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Profile = () => {
  const ref = useRef<HTMLInputElement>(null);
  const [imgurl, setImgurl] = useState<string | null>(null);
  const [Loading, setLoading] = useState(false);
  const [token, settoken] = useState<string | null>(null);
  const [Name, setName] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    settoken(token);
  }, []);

  const handleSubmit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.set("file", file);

    setLoading(true);

    const api = await fetch("/api/upload", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const res = await api.json();

    if (api.status === 200) {
      setImgurl(res.url);
    } else if (api.status === 500) {
      toast.message(res.message);
    } else if (api.status === 401) {
      toast.error(res.message);
    } else if (api.status === 400) {
      toast.error(res.error);
    }

    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const api = await fetch("/api/profile", {
      method: "POST",
      body: JSON.stringify({ name: Name }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const res = await api.json();

    if (api.status === 200) {
      toast.success(res.message);
      router.push("/dashboard");
    } else if (api.status === 500) {
      toast.error(res.message);
    } else if (api.status === 400) {
      toast.error(res.message);
    } else if (api.status === 401) {
      toast.error(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-sky-50 to-pink-100 text-gray-800 flex justify-center items-center">
      <form
        className="p-10 w-xl border border-purple-400 rounded-lg flex justify-center flex-col gap-4"
        onSubmit={handleSave}
      >
        <h1 className="text-2xl font-bold">Create profile</h1>
        <div className="flex justify-center items-center flex-col gap-4">
          <Image
            src={imgurl || "/chat.png"}
            alt="Profile picture"
            priority
            width={100}
            height={100}
            className="rounded-full border-2 border-black w-24 h-24"
            placeholder="empty"
          />
          <Input
            type="file"
            ref={ref}
            className="hidden"
            onChange={handleSubmit}
          />
          <Button
            type="button"
            className="bg-purple-400 hover:bg-purple-500 rounded-lg"
            onClick={() => ref.current?.click()}
          >
            {Loading ? <Loader2 className="animate-spin" /> : "Upload picture"}
          </Button>
        </div>
        <div className="flex flex-col gap-3 justify-center">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            placeholder="Enter full name"
            className="w-full"
            value={Name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <Button
          type="submit"
          className="bg-purple-400 hover:bg-purple-500 rounded-lg"
        >
          {Loading ? <Loader2 className="animate-spin" /> : "Save profile"}
        </Button>
      </form>
    </div>
  );
};

export default Profile;
