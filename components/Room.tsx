"use client";
import React, { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Copy, Eye, EyeClosed } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import io from "socket.io-client";
import Link from "next/link";

const socket = io("http://localhost:5000");

const Room = () => {
  const [code, setCode] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  useEffect(() => {
    const roomCode = Math.floor(10000000 + Math.random() * 90000000);
    setCode(roomCode);
    
    // Try to get the username from localStorage if it exists
    const storedUserName = localStorage.getItem("userName");
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, []);

    useEffect(() => {
      const handleRoomCreated = ({ roomId, roomName, success }: { roomId: string, roomName: string, success: boolean }) => {
        setLoading(false);
        if (success) {
          toast.success(`Room "${roomName}" created successfully!`);
          router.push(`/room/${roomId}`);
        } else {
          toast.error("Failed to create room. Please try again.");
        }
      };
  
      const handleRoomError = ({ error }: { error: string }) => {
        setLoading(false);
        toast.error(error || "An error occurred");
      };

    socket.on("room-created", handleRoomCreated);
    socket.on("room-error", handleRoomError);

    return () => {
      socket.off("room-created", handleRoomCreated);
      socket.off("room-error", handleRoomError);
    };
  }, [router]);

  const toggleCodeVisibility = () => {
    setIsVisible(!isVisible);
  };

  const copyToClipboard = () => {
    if (code) {
      navigator.clipboard.writeText(code.toString());
      toast.success("Code copied");
    }
  };

  const createRoom = () => {
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    if (!code) {
      toast.error("Room code not generated");
      return;
    }    if (!userName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    
    setLoading(true);

    // Save username to localStorage for future use
    localStorage.setItem("userName", userName.trim());
    
    socket.emit("create-room", {
      roomId: code.toString(),
      roomName: groupName.trim(),
      creatorName: userName.trim()
    });
  };

  return (
    <div className="flex justify-center items-center mx-auto">
      <div className="bg-transparent backdrop-blur-lg shadow p-10 border rounded-lg flex flex-col gap-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center">Create Room</h2>        <div className="flex flex-col gap-2">
          <Label htmlFor="userName">Your Name</Label>
          <Input
            id="userName"
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="groupName">Group name</Label>
          <Input
            id="groupName"
            placeholder="Enter group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Room Code</Label>
          <div className="flex items-center gap-3 border rounded-md px-3 py-2">
            <Input
              ref={inputRef}
              type={isVisible ? "text" : "password"}
              readOnly
              value={code?.toString() || ""}
              className="border-none shadow-none focus-visible:ring-0 p-0 h-auto"
            />
            <button
              type="button"
              onClick={toggleCodeVisibility}
              className="flex items-center justify-center h-8 w-8"
            >
              {isVisible ? <EyeClosed size={20} /> : <Eye size={20} />}
            </button>
            <button type="button" className="flex items-center justify-center h-8 w-8">
              <Copy size={20} onClick={copyToClipboard} />
            </button>
          </div>
          <p className="text-xs text-gray-500 italic mt-1">
            Share this code with others to join your room
          </p>
        </div>

        <div className="flex gap-3 mt-2 flex-col justify-center items-center">
          <Button 
            className="w-full" 
            onClick={createRoom} 
            disabled={loading || !groupName.trim()}
          >
            {loading ? "Creating..." : "Create Room"}
          </Button>
          <p>or</p>
          <Button className="w-full">
            <Link href={"/join"} className="">Join room</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Room;
