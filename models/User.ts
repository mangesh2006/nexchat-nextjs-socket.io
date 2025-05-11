import mongoose, { model, models, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface Iuser {
  _id?: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  isVerified?: boolean;
  isLoggedIn?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  imageUrl?: string;
  fullname?: string;
  desc?: string;
}

const UserSchema = new Schema<Iuser>(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    isLoggedIn: { type: Boolean, default: false },
    imageUrl: { type: String, default: "" },
    fullname: { type: String, default: "" },
    desc: { type: String, default: "" },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = models?.User || model<Iuser>("User", UserSchema);

export default User;
