"use server";

import { auth } from "@/auth";
import connectToDatabase from "@/lib/db";
import Settings from "@/models/Settings";
import User from "@/models/User";
import { revalidatePath } from "next/cache";

export async function getSettingsAction() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await connectToDatabase();
    
    // Fetch Settings
    let settings = await Settings.findOne({ userId: session.user.id }).lean();
    if (!settings) {
      settings = await Settings.create({ userId: session.user.id });
    }

    // Fetch User for Profile Picture
    const user = await User.findById(session.user.id).select("image").lean();

    return { 
      success: true, 
      settings: JSON.parse(JSON.stringify(settings)),
      profilePicture: user?.image || null
    };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to fetch settings" };
  }
}

export async function updateSettingsAction(payload: {
  theme?: string;
  accentColor?: string;
  fontFamily?: string;
  backgroundImage?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await connectToDatabase();
    
    const settings = await Settings.findOneAndUpdate(
      { userId: session.user.id },
      { $set: payload },
      { new: true, upsert: true }
    ).lean();

    return { success: true, settings: JSON.parse(JSON.stringify(settings)) };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update settings" };
  }
}

export async function updateProfilePictureAction(imageUrl: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await connectToDatabase();
    
    await User.findByIdAndUpdate(session.user.id, { $set: { image: imageUrl } });
    
    revalidatePath("/", "layout");
    
    return { success: true, imageUrl };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update profile picture" };
  }
}
