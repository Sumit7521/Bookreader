"use client";

import { useState } from "react";
import { Plus, BookOpen, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { NewProjectModal } from "./NewProjectModal";

type ProjectType = { _id: string, title: string, category: string, synopsis?: string, updatedAt: string | Date };
export function WriteHubClient({ initialProjects }: { initialProjects: ProjectType[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = ["Novels", "Short Stories", "Poetry", "Drafts", "Custom"];

  const handleProjectCreated = (newProject: ProjectType) => {
    setProjects([newProject, ...projects]);
    setIsModalOpen(false);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-serif font-semibold text-stone-800 dark:text-stone-200">Your Projects</h2>
        <Button onClick={() => setIsModalOpen(true)} className="bg-amber-600 hover:bg-amber-700 text-white transition-colors">
          <Plus className="w-4 h-4 mr-2" /> New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-lg">
          <FileText className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-stone-700 dark:text-stone-300">No projects yet</h3>
          <p className="text-stone-500 mb-6">Start writing your first masterpiece.</p>
          <Button onClick={() => setIsModalOpen(true)} variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-50">
            Create a Project
          </Button>
        </div>
      ) : (
        <div className="space-y-10">
          {categories.map(category => {
            const catProjects = projects.filter(p => p.category === category);
            if (catProjects.length === 0) return null;

            return (
              <div key={category}>
                <h3 className="text-lg font-medium text-stone-600 dark:text-stone-400 mb-4 flex items-center border-b border-stone-100 dark:border-stone-800 pb-2">
                  <BookOpen className="w-4 h-4 mr-2 text-amber-600 dark:text-amber-500" /> {category}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {catProjects.map(project => (
                    <Link key={project._id} href={`/write/${project._id}`} className="group block h-full">
                      <Card className="h-full flex flex-col border-stone-200 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all bg-white dark:bg-stone-900 overflow-hidden">
                        <div className="h-32 bg-stone-100 dark:bg-stone-800 p-4 flex flex-col justify-end relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <h4 className="font-serif font-bold text-lg text-stone-800 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors line-clamp-2 z-10 relative">
                            {project.title}
                          </h4>
                        </div>
                        <CardContent className="p-4 flex-1 flex flex-col">
                          <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-3 mb-4 flex-1">
                            {project.synopsis || "No synopsis."}
                          </p>
                          <div className="flex items-center text-xs text-stone-400 dark:text-stone-500 mt-auto">
                            <Clock className="w-3 h-3 mr-1" /> Updated {new Date(project.updatedAt).toLocaleDateString()}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <NewProjectModal open={isModalOpen} onOpenChange={setIsModalOpen} onSuccess={handleProjectCreated} />
    </div>
  );
}
