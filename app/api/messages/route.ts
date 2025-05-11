import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const roomId = url.searchParams.get("roomId");
    
    if (!roomId) {
      return NextResponse.json({ error: "Room ID is required" }, { status: 400 });
    }
    
    const messages = await Message.find({ roomId })
      .sort({ timestamp: 1 })
      .limit(100);
      
    return NextResponse.json({ messages });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const { roomId, message, sender, timestamp, mediaUrl, mediaType, fileName, messageId, readBy } = await req.json();
    
    if (!roomId || !message || !sender) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    // Create object with optional media fields
    const messageData: any = {
      roomId,
      message,
      sender,
      timestamp: timestamp || new Date(),
      messageId: messageId || new Date().getTime().toString(),
      readBy: readBy || [sender] // Initialize with the sender (messages are automatically read by the sender)
    };
    
    // Add media properties if they exist
    if (mediaUrl) messageData.mediaUrl = mediaUrl;
    if (mediaType) messageData.mediaType = mediaType;
    if (fileName) messageData.fileName = fileName;
      const newMessage = await Message.create(messageData);
    
    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const { messageId, userName } = await req.json();
    
    if (!messageId || !userName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    // Find the message by ID and update the readBy array if the user hasn't already read it
    const message = await Message.findOneAndUpdate(
      { messageId, readBy: { $ne: userName } },
      { $addToSet: { readBy: userName } },
      { new: true }
    );
    
    if (!message) {
      return NextResponse.json({ success: false, error: "Message not found or already read" });
    }
    
    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
