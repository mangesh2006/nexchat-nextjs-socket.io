import User from "@/models/User";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    const token = req.headers.get("authorization")?.split(" ")[1];

    console.log(name)

    if (!name) {
      return NextResponse.json({ message: "Name not found" }, { status: 400 });
    }

    if (!token) {
      return NextResponse.json({ message: "Token not found" }, { status: 401 });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET!);

    let email = (decode as { email: string }).email;

    const user = await User.findOneAndUpdate(
      { email },
      { $set: { fullname: name } }
    );

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 400 });
    }

    return NextResponse.json({ message: "Profile saved" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Server error" }, { status: 200 });
  }
}
