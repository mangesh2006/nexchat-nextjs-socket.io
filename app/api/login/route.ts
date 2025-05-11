import { connectDB } from "@/lib/db";
import User, { Iuser } from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ message: "Please fill all fields" }),
        { status: 400 }
      );
    }

    const user = await User.findOne<Iuser>({ email });

    if (!user) {
      return new Response(
        JSON.stringify({ message: "Invalid credentials" }),
        { status: 400 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return new Response(
        JSON.stringify({ message: "Invalid credentials" }),
        { status: 400 }
      );
    }

    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    await User.findOneAndUpdate({ email }, { $set: { isLoggedIn: true } });

    return new Response(
      JSON.stringify({ message: "Login successful", token }),
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}
