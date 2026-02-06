import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  is_pinned: boolean;
  is_active: boolean;
  link_url: string | null;
}

interface AnnouncementFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement?: Announcement | null;
  onSuccess: () => void;
}

export const AnnouncementForm = ({
  open,
  onOpenChange,
  announcement,
  onSuccess,
}: AnnouncementFormProps) => {
  const isEditing = !!announcement;
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(announcement?.title ?? "");
  const [content, setContent] = useState(announcement?.content ?? "");
  const [category, setCategory] = useState(announcement?.category ?? "news");
  const [isPinned, setIsPinned] = useState(announcement?.is_pinned ?? false);
  const [isActive, setIsActive] = useState(announcement?.is_active ?? true);
  const [linkUrl, setLinkUrl] = useState(announcement?.link_url ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      title,
      content,
      category,
      is_pinned: isPinned,
      is_active: isActive,
      link_url: linkUrl || null,
    };

    let error;
    if (isEditing) {
      const result = await supabase
        .from("announcements")
        .update(data)
        .eq("id", announcement.id);
      error = result.error;
    } else {
      const result = await supabase.from("announcements").insert(data);
      error = result.error;
    }

    setLoading(false);

    if (error) {
      console.error("Error saving announcement:", error);
      toast.error("Failed to save announcement");
      return;
    }

    toast.success(isEditing ? "Announcement updated" : "Announcement created");
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Announcement" : "New Announcement"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Announcement title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Announcement content..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="news">News</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
                <SelectItem value="promotion">Promotion</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkUrl">Link URL (optional)</Label>
            <Input
              id="linkUrl"
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isPinned">Pin to top</Label>
            <Switch
              id="isPinned"
              checked={isPinned}
              onCheckedChange={setIsPinned}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">Active</Label>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isEditing ? (
              "Update Announcement"
            ) : (
              "Create Announcement"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
