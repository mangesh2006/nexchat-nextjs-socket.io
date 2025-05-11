import { connectDB } from "@/lib/db";
import User from "@/models/User";
import ImageKit from "imagekit";
import jwt from "jsonwebtoken";

export const config = {
  api: {
    bodyParser: false,
  },
};

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE!,
  publicKey: process.env.IMAGEKIT_PUBLIC!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL!,
});

// Helper function to determine media type
function getMediaType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
  if (['mp4', 'webm', 'ogg'].includes(extension)) return 'video';
  if (['mp3', 'wav', 'ogg'].includes(extension)) return 'audio';
  return 'document';
}

export async function POST(req: Request) {
  try {
    await connectDB();
    
    // Check if request is chat media upload
    const url = new URL(req.url);
    const uploadType = url.searchParams.get("type") || "profile";
    const roomId = url.searchParams.get("roomId");

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
      });
    }
    
    // Authorization - not needed for chat uploads if roomId is provided
    const token = req.headers.get("authorization")?.split(" ")[1];
    let email;
    
    if (uploadType === "profile") {
      if (!token) return new Response("Unauthorized", { status: 401 });
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        email = (decoded as { email: string }).email;
      } catch {
        return new Response("Invalid token", { status: 401 });
      }
    } else if (uploadType === "chat" && !roomId) {
      return new Response(JSON.stringify({ error: "Room ID required for chat uploads" }), {
        status: 400
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Set folder based on upload type
    const folder = uploadType === "chat" ? "chat-media" : "profile-images";

    const response = await imagekit.upload({
      file: buffer,
      fileName: file.name,
      folder: folder
    });

    // Update user profile if it's a profile image
    if (uploadType === "profile" && email) {
      await User.findOneAndUpdate(
        { email },
        { $set: { imageUrl: response.url } }
      );
    }    // For chat uploads, include additional media metadata
    if (uploadType === "chat") {
      const mediaType = getMediaType(file.name);
      return new Response(JSON.stringify({
        url: response.url,
        fileName: file.name,
        mediaType,
        fileId: response.fileId
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // For profile uploads, just return the URL
      return new Response(JSON.stringify({ url: response.url }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
