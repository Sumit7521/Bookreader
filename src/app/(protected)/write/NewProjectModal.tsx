"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { createProjectAction } from "@/actions/write";

type ProjectType = { _id: string, title: string, category: string, synopsis?: string, updatedAt: string | Date };
export function NewProjectModal({ open, onOpenChange, onSuccess }: { open: boolean, onOpenChange: (open: boolean) => void, onSuccess: (project: ProjectType) => void }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"Novels" | "Short Stories" | "Poetry" | "Drafts" | "Custom">("Drafts");
  const [synopsis, setSynopsis] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    
    setIsSubmitting(true);
    const res = await createProjectAction({ title, category, synopsis });
    if (res.success && res.project) {
      onSuccess(res.project);
      setTitle("");
      setSynopsis("");
      setCategory("Drafts");
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">New Writing Project</DialogTitle>
            <DialogDescription className="text-stone-500">
              Create a new space for your next masterpiece.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-stone-700 dark:text-stone-300">Title *</label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
                placeholder="Untitled Masterpiece" 
                className="bg-stone-50 dark:bg-stone-950 focus-visible:ring-amber-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium text-stone-700 dark:text-stone-300">Category</label>
              <Select value={category} onValueChange={(v) => { if (v) setCategory(v as "Novels" | "Short Stories" | "Poetry" | "Drafts" | "Custom") }}>
                <SelectTrigger className="bg-stone-50 dark:bg-stone-950 focus:ring-amber-500">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Novels">Novels</SelectItem>
                  <SelectItem value="Short Stories">Short Stories</SelectItem>
                  <SelectItem value="Poetry">Poetry</SelectItem>
                  <SelectItem value="Drafts">Drafts</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="synopsis" className="text-sm font-medium text-stone-700 dark:text-stone-300">Synopsis</label>
              <Textarea 
                id="synopsis" 
                value={synopsis} 
                onChange={(e) => setSynopsis(e.target.value)} 
                placeholder="A brief summary..." 
                className="resize-none min-h-[100px] bg-stone-50 dark:bg-stone-950 focus-visible:ring-amber-500" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="border-stone-200">Cancel</Button>
            <Button type="submit" disabled={isSubmitting || !title} className="bg-amber-600 hover:bg-amber-700 text-white">
              {isSubmitting ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
