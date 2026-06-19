"use server";

import { auth } from "@/auth";
import connectToDatabase from "@/lib/db";
import Book from "@/models/Book";
import Review from "@/models/Review";
import Annotation from "@/models/Annotation";
import WritingProject from "@/models/WritingProject";

export type SearchResult = {
  id: string;
  type: "book" | "review" | "annotation" | "writingproject";
  title: string;
  description: string;
  url: string;
};

export async function globalSearchAction(query: string): Promise<{ success: boolean; results?: Record<string, SearchResult[]>; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  const userId = session.user.id;

  if (!query || query.trim().length === 0) return { success: true, results: {} };

  try {
    await connectToDatabase();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const runSearch = async (model: any, searchFields: string[], regexFields: string[], type: string, buildUrl: (doc: any) => string, mapTitle: (doc: any) => string, mapDesc: (doc: any) => string) => {
      try {
        // Try Atlas Search
        const searchResults = await model.aggregate([
          {
            $search: {
              index: "default",
              text: {
                query,
                path: searchFields,
                fuzzy: { maxEdits: 1 }
              }
            }
          },
          { $match: { userId } },
          { $limit: 5 }
        ]);
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return searchResults.map((doc: any) => ({
          id: doc._id.toString(),
          type,
          title: mapTitle(doc),
          description: mapDesc(doc),
          url: buildUrl(doc)
        }));
      } catch {
        // Fallback to regex if Atlas Search is not configured
        const regex = new RegExp(query, "i");
        const orConditions = regexFields.map(f => ({ [f]: regex }));
        
        const fallbackResults = await model.find({
          userId,
          $or: orConditions
        }).limit(5).lean();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return fallbackResults.map((doc: any) => ({
          id: doc._id.toString(),
          type,
          title: mapTitle(doc),
          description: mapDesc(doc),
          url: buildUrl(doc)
        }));
      }
    };

    const [books, reviews, annotations, projects] = await Promise.all([
      runSearch(
        Book, 
        ["title", "author", "series"], 
        ["title", "author", "series"],
        "book",
        (doc) => `/library/${doc._id}`,
        (doc) => doc.title,
        (doc) => `${doc.author || ""} ${doc.series ? `(${doc.series})` : ""}`
      ),
      runSearch(
        Review,
        ["review", "plotSummary", "favoriteQuotes"],
        ["review", "plotSummary"],
        "review",
        (doc) => `/library/${doc.bookId}`,
        () => `Review Notes`,
        (doc) => (doc.review ? doc.review.substring(0, 50) + "..." : "No review text")
      ),
      runSearch(
        Annotation,
        ["note", "selectedText"],
        ["note", "selectedText"],
        "annotation",
        (doc) => `/reader/${doc.bookId}?page=${doc.pageNumber}`,
        (doc) => `Annotation on Page ${doc.pageNumber}`,
        (doc) => (doc.note || doc.selectedText || "").substring(0, 50)
      ),
      runSearch(
        WritingProject,
        ["title", "synopsis"],
        ["title", "synopsis"],
        "writingproject",
        (doc) => `/write/${doc._id}`,
        (doc) => doc.title,
        (doc) => (doc.synopsis || "").substring(0, 50)
      )
    ]);

    const results = {
      books,
      reviews,
      annotations,
      projects
    };

    return { success: true, results };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Search failed" };
  }
}
