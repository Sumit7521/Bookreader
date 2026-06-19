"use client";

import { useActionState, useState, useEffect } from "react";
import { uploadBookAction } from "@/actions/library";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud } from "lucide-react";

interface UploadBookModalProps {
  folders: { _id: string; name: string }[];
}

export function UploadBookModal({ folders }: UploadBookModalProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(uploadBookAction, undefined);

  useEffect(() => {
    if (state?.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonVariants({ className: "gap-2 bg-amber-600 hover:bg-amber-700 text-white" })}>
        <UploadCloud className="h-4 w-4" />
        Upload Book
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#fdfbf7] dark:bg-stone-950 border-stone-200 dark:border-stone-800">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-stone-800 dark:text-stone-100">Upload to Library</DialogTitle>
          <DialogDescription className="text-stone-500 dark:text-stone-400">
            Add a new PDF book to your personal collection.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4 pt-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Book Title</Label>
            <Input id="title" name="title" required placeholder="e.g., The Hobbit" className="bg-white/50 dark:bg-stone-900/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="author">Author (Optional)</Label>
            <Input id="author" name="author" placeholder="e.g., J.R.R. Tolkien" className="bg-white/50 dark:bg-stone-900/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="folderId">Folder (Optional)</Label>
            <Select name="folderId">
              <SelectTrigger className="bg-white/50 dark:bg-stone-900/50">
                <SelectValue placeholder="Select a folder" />
              </SelectTrigger>
              <SelectContent>
                {folders.map(f => (
                  <SelectItem key={f._id} value={f._id}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">PDF File</Label>
            <Input id="file" name="file" type="file" accept="application/pdf" required className="bg-white/50 dark:bg-stone-900/50 file:text-amber-700 dark:file:text-amber-500 cursor-pointer" />
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={pending} className="bg-amber-600 hover:bg-amber-700 text-white w-full sm:w-auto">
              {pending ? "Uploading..." : "Upload Book"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
