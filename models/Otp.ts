import bcrypt from "bcryptjs";
import { model, models, Schema } from "mongoose";

export interface Iotp {
  email: string;
  otp: string;
  expiresAt: Date;
}

const OtpSchema = new Schema<Iotp>({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, default: Date.now, expires: 5 * 60 * 1000 },
});

OtpSchema.pre("save", async function () {
  if (this.isModified("otp")) {
    this.otp = await bcrypt.hash(this.otp, 10);
  }
});

const Otp = models?.Otp || model("Otp", OtpSchema);

export default Otp;
