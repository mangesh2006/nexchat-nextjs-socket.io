"use client";
import { LogOutIcon, Video } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import Room from "./Room";

const Dashboard = () => {
  const [fullname, setfullname] = useState("");
  const [imgUrl, setimgUrl] = useState("");
  const [token, settoken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const localToken = localStorage.getItem("token");
    if (!localToken) {
      router.push("/");
    } else {
      settoken(localToken);
    }
  }, [router]);

  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const api = await fetch("/api/fetchProfile", {
          method: "POST",
          body: JSON.stringify({ token }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        const res = await api.json();

        if (api.status === 200) {
          setimgUrl(res.url);
          setfullname(res.name);
        } else {
          toast.error(res.message || "Failed to fetch profile");
        }
      } catch (error) {
        toast.error("Something went wrong fetching profile");
        console.error(error);
      }
    };

    fetchProfile();
  }, [token]);

  const handleLogout = async () => {
    if (!token) {
      console.error("Token is null, cannot logout");
      return;
    }

    const api = await fetch("/api/logout", {
      method: "POST",
      body: JSON.stringify({ token }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const res = await api.json();

    if (api.status === 200) {
      localStorage.removeItem("token");
      router.push("/");
    } else {
      toast.error(res.message || "Logout failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-sky-50 to-pink-100 text-gray-800 flex justify-center items-center">
      <div className="m-15 w-full h-[90vh] shadow border rounded-lg flex">
        <aside className="boder h-full w-28 border-r flex flex-col justify-between items-center">
          <span className="m-2">{fullname}</span>
          <div className="p-3 flex flex-col justify-between gap-6">
            <div className="flex flex-col items-center justify-center gap-4">
              <Button variant={"destructive"} onClick={handleLogout}>
                <LogOutIcon className="cursor-pointer" />
              </Button>
              <Button variant={"ghost"}>
                <Video className="cursor-pointer" />
              </Button>
              <Image
                src={imgUrl || "/chat.png"}
                alt="Profile"
                width={50}
                height={50}
                className="rounded-full border border-black w-12 h-12 cursor-pointer"
                priority
                placeholder="empty"
                unoptimized
              />
            </div>
          </div>
        </aside>
        <Room />
      </div>
    </div>
  );
};

export default Dashboard;
