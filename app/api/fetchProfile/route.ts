import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import User, { Iuser } from "@/models/User";

interface JwtPayload {
  email: string;
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ message: "Token not found" }, { status: 400 });
    }

    const decode = jwtDecode<JwtPayload>(token);
    const email = decode.email as string;

    const user = await User.findOne<Iuser>({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { url: user.imageUrl, name: user.fullname },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
