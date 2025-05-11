import Otp, { Iotp } from "@/models/Otp";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";

export async function POST(request: Request) {
  try {
    await connectDB();
    const { data, email } = await request.json();
    const otp = data.otp;

    console.log(otp);

    if (!otp || !email) {
      return NextResponse.json(
        { message: "Please provide otp and email" },
        { status: 400 }
      );
    }

    const otpRecord = await Otp.findOne<Iotp>({ email });

    if (!otpRecord) {
      return NextResponse.json(
        { message: "OTP record not found" },
        { status: 404 }
      );
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.otp);

    if (!isMatch) {
      return NextResponse.json({ message: "Invalid otp" }, { status: 400 });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    await Otp.deleteMany({ email });

    const token = jwt.sign({ email }, process.env.JWT_SECRET as string, {
      expiresIn: "1d",
    });

    await User.findOneAndUpdate({ email }, { $set: { isLoggedIn: true } });

    return NextResponse.json(
      { message: "Otp verified successfully", token },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
