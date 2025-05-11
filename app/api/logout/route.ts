import { connectDB } from "@/lib/db";
import User, { Iuser } from "@/models/User";
import { jwtDecode } from "jwt-decode";
import { NextResponse } from "next/server";

interface JWTpayload {
  email: string;
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ message: "Token not found" }, { status: 400 });
    }

    const decode = jwtDecode<JWTpayload>(token);
    const email = decode.email;

    const user = await User.findOneAndUpdate<Iuser>(
      { email },
      { $set: { isLoggedIn: false } }
    );

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Logged out" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
