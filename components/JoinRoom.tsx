"use client";
import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const JoinRoom = () => {
  const [roomCode, setRoomCode] = useState("");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {    interface RoomJoinedData {
      roomId: string;
      roomName: string;
      participants: any[]; 
      success: boolean;
    }
    
    const handleRoomJoined = (data: RoomJoinedData) => {
      setLoading(false);
      if (data.success) {
        toast.success(`Joined room "${data.roomName}" successfully!`);
        router.push(`/room/${data.roomId}`);
      }
      if (data.success) {
        router.push(`/room/${data.roomId}`);
      } else {
        toast.error("Failed to join room");
      }
    };

    const handleRoomError = ({ error }: { error: string }) => {
      setLoading(false);
      toast.error(error || "Failed to join room");
    };

    socket.on("room-joined", handleRoomJoined);
    socket.on("room-error", handleRoomError);

    return () => {
      socket.off("room-joined", handleRoomJoined);
      socket.off("room-error", handleRoomError);
    };
  }, [router]);

  const joinRoom = () => {
    if (!roomCode.trim()) {
      toast.error("Please enter a room code");
      return;
    }    if (!userName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setLoading(true);
    
    localStorage.setItem("userName", userName.trim());

    socket.emit("join-room", {
      roomId: roomCode.trim(),
      userName: userName.trim()
    });
  };

  return (
    <div className="flex justify-center items-center mx-auto min-h-screen">
      <div className="bg-transparent backdrop-blur-lg shadow p-10 border rounded-lg flex flex-col gap-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center">Join Room</h2>
          <div className="flex flex-col gap-2">
          <Label htmlFor="userName">Your Name</Label>
          <Input
            id="userName"
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <Label htmlFor="roomCode">Room Code</Label>
          <Input
            id="roomCode"
            placeholder="Enter room code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
          />
        </div>

        <div className="flex gap-3 mt-2 flex-col">
          <Button 
            className="w-full" 
            onClick={joinRoom}
            disabled={loading || !roomCode.trim()}
          >
            {loading ? "Joining..." : "Join Room"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;