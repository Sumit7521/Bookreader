"use server";
import { auth } from "@/auth";
import connectToDatabase from "@/lib/db";
import WritingProject from "@/models/WritingProject";
import Chapter from "@/models/Chapter";
import { revalidatePath } from "next/cache";

export async function getProjectsAction() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  try {
    await connectToDatabase();
    const projects = await WritingProject.find({ userId: session.user.id }).sort({ updatedAt: -1 }).lean();
    return { success: true, projects: JSON.parse(JSON.stringify(projects)) };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch projects" };
  }
}

export async function getProjectAction(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  try {
    await connectToDatabase();
    const project = await WritingProject.findOne({ _id: projectId, userId: session.user.id }).lean();
    if (!project) return { error: "Project not found" };
    return { success: true, project: JSON.parse(JSON.stringify(project)) };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch project" };
  }
}

export async function createProjectAction(data: { title: string; category: "Novels" | "Short Stories" | "Poetry" | "Drafts" | "Custom"; synopsis?: string }) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  try {
    await connectToDatabase();
    const project = await WritingProject.create({
      userId: session.user.id,
      ...data,
    });
    revalidatePath("/write");
    return { success: true, project: JSON.parse(JSON.stringify(project)) };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create project" };
  }
}

export async function deleteProjectAction(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  try {
    await connectToDatabase();
    await WritingProject.findOneAndDelete({ _id: projectId, userId: session.user.id });
    await Chapter.deleteMany({ projectId, userId: session.user.id });
    revalidatePath("/write");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete project" };
  }
}

export async function getChaptersAction(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  try {
    await connectToDatabase();
    const chapters = await Chapter.find({ projectId, userId: session.user.id }).sort({ order: 1 }).lean();
    return { success: true, chapters: JSON.parse(JSON.stringify(chapters)) };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch chapters" };
  }
}

export async function createChapterAction(projectId: string, title: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  try {
    await connectToDatabase();
    const count = await Chapter.countDocuments({ projectId, userId: session.user.id });
    const chapter = await Chapter.create({
      userId: session.user.id,
      projectId,
      title,
      order: count + 1,
    });
    revalidatePath(`/write/${projectId}`);
    return { success: true, chapter: JSON.parse(JSON.stringify(chapter)) };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create chapter" };
  }
}

export async function deleteChapterAction(chapterId: string, projectId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  try {
    await connectToDatabase();
    await Chapter.findOneAndDelete({ _id: chapterId, userId: session.user.id });
    revalidatePath(`/write/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete chapter" };
  }
}

export async function getChapterAction(chapterId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  try {
    await connectToDatabase();
    const chapter = await Chapter.findOne({ _id: chapterId, userId: session.user.id }).lean();
    if (!chapter) return { error: "Chapter not found" };
    return { success: true, chapter: JSON.parse(JSON.stringify(chapter)) };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch chapter" };
  }
}

export async function saveChapterContentAction(chapterId: string, content: string, wordCount: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  try {
    await connectToDatabase();
    const chapter = await Chapter.findOneAndUpdate(
      { _id: chapterId, userId: session.user.id },
      { content, wordCount },
      { new: true }
    ).lean();
    return { success: true, chapter: JSON.parse(JSON.stringify(chapter)) };
  } catch (error) {
    console.error(error);
    return { error: "Failed to save chapter content" };
  }
}

export async function renameChapterAction(chapterId: string, title: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  try {
    await connectToDatabase();
    const chapter = await Chapter.findOneAndUpdate(
      { _id: chapterId, userId: session.user.id },
      { title },
      { new: true }
    ).lean();
    return { success: true, chapter: JSON.parse(JSON.stringify(chapter)) };
  } catch (error) {
    console.error(error);
    return { error: "Failed to rename chapter" };
  }
}

export async function reorderChaptersAction(projectId: string, orderedChapterIds: string[]) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  const userId = session.user.id;
  try {
    await connectToDatabase();
    const bulkOps = orderedChapterIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, projectId, userId },
        update: { $set: { order: index + 1 } },
      },
    }));
    await Chapter.bulkWrite(bulkOps);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to reorder chapters" };
  }
}
