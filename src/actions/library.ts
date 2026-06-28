"use server";

import { auth } from "@/auth";
import connectToDatabase from "@/lib/db";
import Book from "@/models/Book";
import Folder from "@/models/Folder";
import cloudinary from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";

export async function uploadBookAction(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const file = formData.get("file") as File | null;
  const title = formData.get("title") as string;
  const author = formData.get("author") as string;
  const folderId = formData.get("folderId") as string; // Optional

  if (!file || !title) {
    return { error: "File and title are required." };
  }

  try {
    await connectToDatabase();

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "books", resource_type: "raw" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(buffer);
    }) as unknown as { secure_url: string; public_id: string };

    await Book.create({
      userId: session.user.id,
      title,
      author: author || undefined,
      fileUrl: uploadResult.secure_url,
      filePublicId: uploadResult.public_id,
      folderId: folderId || undefined,
    });

    revalidatePath("/library");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to upload book." };
  }
}

export async function saveBookRecordAction(data: { title: string, author: string, folderId: string, fileUrl: string, filePublicId: string }) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectToDatabase();
    
    let coverImage = undefined;
    if (data.filePublicId && data.fileUrl.includes("cloudinary.com")) {
      const resourceType = data.fileUrl.includes("/raw/") ? "raw" : "image";
      if (resourceType === "image") {
        const cloudinaryLib = (await import("@/lib/cloudinary")).default;
        
        coverImage = cloudinaryLib.utils.url(data.filePublicId, {
          secure: true,
          sign_url: true,
          type: "authenticated",
          resource_type: "image",
          format: "jpg",
          transformation: [
            { width: 400, crop: "scale" },
            { page: 1 }
          ]
        });
      }
    }

    await Book.create({
      userId: session.user.id,
      title: data.title,
      author: data.author || undefined,
      fileUrl: data.fileUrl,
      filePublicId: data.filePublicId,
      folderId: data.folderId || undefined,
      coverImage: coverImage,
    });

    revalidatePath("/library");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to save book record." };
  }
}

export async function createFolderAction(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const libraryFolderType = formData.get("libraryFolderType") as 'genre' | 'author' | 'series' | 'custom';

  if (!name || !libraryFolderType) {
    return { error: "Name and type are required." };
  }

  try {
    await connectToDatabase();
    await Folder.create({
      userId: session.user.id,
      name,
      type: "library",
      libraryFolderType,
    });

    revalidatePath("/library");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create folder." };
  }
}

export async function getLibraryDataAction() {
  const session = await auth();
  if (!session?.user?.id) return { folders: [], books: [], error: "Unauthorized" };

  try {
    await connectToDatabase();
    
    // Convert to lean objects to avoid serialization issues
    const folders = await Folder.find({ userId: session.user.id, type: "library" })
      .lean()
      .exec()
      .then(docs => docs.map(doc => ({ 
        ...doc, 
        _id: doc._id.toString(),
        userId: doc.userId.toString(),
        createdAt: (doc.createdAt as Date)?.toISOString() || new Date().toISOString()
      })));
      
    const books = await Book.find({ userId: session.user.id })
      .lean()
      .exec()
      .then(docs => docs.map(doc => ({ 
        ...doc, 
        _id: doc._id.toString(),
        userId: doc.userId.toString(),
        folderId: doc.folderId?.toString(),
        tags: doc.tags || [],
        createdAt: (doc.createdAt as Date)?.toISOString() || new Date().toISOString(),
        updatedAt: (doc.updatedAt as Date)?.toISOString() || new Date().toISOString()
      })));

    return { folders, books };
  } catch (error) {
    console.error(error);
    return { folders: [], books: [], error: "Failed to fetch library data." };
  }
}

export async function deleteFolderAction(folderId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectToDatabase();
    await Folder.findOneAndDelete({ _id: folderId, userId: session.user.id });
    
    // Unset the folderId on any books that were in this folder
    await Book.updateMany(
      { folderId: folderId, userId: session.user.id },
      { $unset: { folderId: "" } }
    );

    revalidatePath("/library");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete folder." };
  }
}
