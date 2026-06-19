"use server";

import { auth } from "@/auth";
import crypto from "crypto";

export async function getCloudinarySignatureAction(folder?: string, uploadType?: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const timestamp = Math.round(new Date().getTime() / 1000);
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!apiSecret) {
    return { success: false, error: "CLOUDINARY_API_SECRET is not set." };
  }

  const params: Record<string, string> = { timestamp: timestamp.toString() };
  if (folder) params.folder = folder;
  if (uploadType) params.type = uploadType;

  // Cloudinary requires signatures to be created with alphabetically sorted parameters.
  const sortedKeys = Object.keys(params).sort();
  const signatureString = sortedKeys.map(k => `${k}=${params[k]}`).join('&') + apiSecret;
  
  const signature = crypto.createHash("sha1").update(signatureString).digest("hex");

  return {
    success: true,
    timestamp,
    signature,
    apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  };
}
