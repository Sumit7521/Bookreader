"use client";

import { useActionState, useState, useEffect } from "react";
import { createFolderAction } from "@/actions/library";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FolderPlus } from "lucide-react";

export function CreateFolderModal() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createFolderAction, undefined);

  useEffect(() => {
    if (state?.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonVariants({ variant: "outline", className: "gap-2 border-amber-200 hover:bg-amber-50 dark:border-stone-700 dark:hover:bg-stone-800" })}>
        <FolderPlus className="h-4 w-4" />
        New Folder
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#fdfbf7] dark:bg-stone-950 border-stone-200 dark:border-stone-800">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-stone-800 dark:text-stone-100">Create Library Folder</DialogTitle>
          <DialogDescription className="text-stone-500 dark:text-stone-400">
            Organize your books by genre, author, series, or a custom category.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4 pt-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Folder Name</Label>
            <Input id="name" name="name" required placeholder="e.g., Epic Fantasy" className="bg-white/50 dark:bg-stone-900/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="libraryFolderType">Type</Label>
            <Select name="libraryFolderType" defaultValue="genre" required>
              <SelectTrigger className="bg-white/50 dark:bg-stone-900/50">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="genre">Genre</SelectItem>
                <SelectItem value="author">Author</SelectItem>
                <SelectItem value="series">Series</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={pending} className="bg-amber-600 hover:bg-amber-700 text-white">
              {pending ? "Creating..." : "Create Folder"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
