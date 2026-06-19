"use server";

import { auth } from "@/auth";
import crypto from "crypto";

export async function getCloudinarySignatureAction() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const timestamp = Math.round(new Date().getTime() / 1000);
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!apiSecret) {
    return { success: false, error: "CLOUDINARY_API_SECRET is not set." };
  }

  // Cloudinary requires signatures to be created with specific parameters.
  // We specify `timestamp` and `upload_preset` if we are still using a preset, or just `timestamp`.
  // To keep it simple and secure, we'll sign the timestamp and maybe folder.
  const signatureString = `timestamp=${timestamp}${apiSecret}`;
  
  const signature = crypto.createHash("sha1").update(signatureString).digest("hex");

  return {
    success: true,
    timestamp,
    signature,
    apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  };
}
