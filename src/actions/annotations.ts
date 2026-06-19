"use server";

import { auth } from "@/auth";
import connectToDatabase from "@/lib/db";
import Annotation from "@/models/Annotation";
import { revalidatePath } from "next/cache";

export async function saveAnnotationAction(data: {
  bookId: string;
  pageNumber: number;
  type: "highlight" | "margin";
  selectedText?: string;
  color?: string;
  note?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectToDatabase();
    
    const newAnnotation = await Annotation.create({
      userId: session.user.id,
      bookId: data.bookId,
      pageNumber: data.pageNumber,
      type: data.type,
      selectedText: data.selectedText,
      color: data.color,
      note: data.note,
    });

    revalidatePath(`/reader/${data.bookId}`);
    return { success: true, annotation: JSON.parse(JSON.stringify(newAnnotation)) };
  } catch (error) {
    console.error(error);
    return { error: "Failed to save annotation" };
  }
}

export async function getAnnotationsAction(bookId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized", annotations: [] };

  try {
    await connectToDatabase();
    const annotations = await Annotation.find({ userId: session.user.id, bookId })
      .sort({ createdAt: -1 })
      .lean();
      
    // Serialize to plain objects
    const serialized = annotations.map(a => ({
      ...a,
      _id: a._id.toString(),
      userId: a.userId.toString(),
      bookId: a.bookId.toString(),
      createdAt: (a.createdAt as Date).toISOString(),
      updatedAt: (a.updatedAt as Date).toISOString(),
    }));

    return { success: true, annotations: serialized };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch annotations", annotations: [] };
  }
}

export async function deleteAnnotationAction(annotationId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectToDatabase();
    await Annotation.findOneAndDelete({ _id: annotationId, userId: session.user.id });
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete annotation" };
  }
}

export async function updateAnnotationNoteAction(annotationId: string, note: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectToDatabase();
    const updated = await Annotation.findOneAndUpdate(
      { _id: annotationId, userId: session.user.id },
      { note },
      { new: true }
    ).lean();
    
    return { success: true, annotation: JSON.parse(JSON.stringify(updated)) };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update annotation" };
  }
}
