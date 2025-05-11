import { connectDB } from "@/lib/db";
import Otp from "@/models/Otp";
import User, { Iuser } from "@/models/User";
import { sendMail } from "@/utils/sendMail";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { message: "Credentials not found" },
        { status: 400 }
      );
    }

    const existing = await User.findOne<Iuser>({ email });

    if (existing) {
      if (!existing.isVerified) {
        return NextResponse.json(
          { message: "User not verified" },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { message: "User already exist" },
        { status: 400 }
      );
    }

    const user = await User.create({
      username,
      email,
      password
    });

    if (!user) {
      return NextResponse.json(
        { message: "Error while creating user" },
        { status: 422 }
      );
    }

    const verify = Math.floor(100000 + Math.random() * 900000).toString();

    await sendMail(email, verify);
    await Otp.deleteMany({ email });

    const otp = await Otp.create({
      email,
      otp: verify,
    });

    if (!otp) {
      return NextResponse.json(
        { message: "Error while creating otp" },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { message: "Signup successfull. Otp sent on your email" },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
