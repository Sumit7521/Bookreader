"use server";
import { auth } from "@/auth";
import connectToDatabase from "@/lib/db";
import WritingProject from "@/models/WritingProject";
import Chapter from "@/models/Chapter";
// @ts-expect-error No type definitions for html-to-docx
import HTMLtoDOCX from "html-to-docx";
import { convert } from "html-to-text";

export async function exportToDocxAction(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  try {
    await connectToDatabase();
    const project = await WritingProject.findOne({ _id: projectId, userId: session.user.id }).lean();
    if (!project) return { error: "Project not found" };

    const chapters = await Chapter.find({ projectId, userId: session.user.id }).sort({ order: 1 }).lean();
    
    const htmlString = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${project.title}</title>
        </head>
        <body>
          <h1>${project.title}</h1>
          <p>By ${session.user.name || "Author"}</p>
          <div style="page-break-after: always;"></div>
          ${chapters.map((c: { title: string, content?: string }) => `
            <h2>${c.title}</h2>
            ${c.content || ""}
            <div style="page-break-after: always;"></div>
          `).join("")}
        </body>
      </html>
    `;

    const docxBuffer = await HTMLtoDOCX(htmlString, null, {
      title: project.title as string,
    });

    const base64 = (docxBuffer as Buffer).toString("base64");
    return { success: true, base64, title: project.title };
  } catch (error) {
    console.error(error);
    return { error: "Failed to generate DOCX" };
  }
}

export async function exportToTxtAction(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  try {
    await connectToDatabase();
    const project = await WritingProject.findOne({ _id: projectId, userId: session.user.id }).lean();
    if (!project) return { error: "Project not found" };

    const chapters = await Chapter.find({ projectId, userId: session.user.id }).sort({ order: 1 }).lean();
    
    const htmlString = `
      <h1>${project.title}</h1>
      <p>By ${session.user.name || "Author"}</p>
      <br/><br/>
      ${chapters.map((c: { title: string, content?: string }) => `
        <h2>${c.title}</h2>
        ${c.content || ""}
        <br/><br/>
      `).join("")}
    `;

    const text = convert(htmlString, {
      wordwrap: 80,
      selectors: [
        { selector: 'h1', options: { uppercase: false } },
        { selector: 'h2', options: { uppercase: false } }
      ]
    });

    return { success: true, text, title: project.title };
  } catch (error) {
    console.error(error);
    return { error: "Failed to generate TXT" };
  }
}
