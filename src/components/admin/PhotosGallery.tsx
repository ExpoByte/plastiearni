import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Image as ImageIcon, MapPin, Scale, Calendar, User, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface CollectionPhoto {
  id: string;
  user_id: string;
  user_name: string;
  weight_kg: number;
  plastic_type: string;
  location: string | null;
  status: string;
  photo_url: string;
  created_at: string;
  points_earned: number;
}

export const PhotosGallery = () => {
  const [photos, setPhotos] = useState<CollectionPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<CollectionPhoto | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      const { data, error } = await supabase.functions.invoke("admin-photos");
      if (error) {
        setError(error.message);
      } else {
        setPhotos(data || []);
      }
      setLoading(false);
    };
    fetchPhotos();
  }, []);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });

  const statusColor = (status: string) => {
    switch (status) {
      case "verified": return "bg-green-500/10 text-green-600";
      case "pending": return "bg-yellow-500/10 text-yellow-600";
      case "rejected": return "bg-red-500/10 text-red-600";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>Failed to load photos: {error}</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 space-y-3">
        <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto" />
        <p className="text-muted-foreground">No collection photos found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground">
        Collection Photos ({photos.length})
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {photos.map((photo) => (
          <button
            key={photo.id}
            onClick={() => setSelectedPhoto(photo)}
            className="group relative rounded-xl overflow-hidden bg-card shadow-soft aspect-square"
          >
            <img
              src={photo.photo_url}
              alt={`Collection by ${photo.user_name}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <p className="text-white text-xs font-medium truncate">{photo.user_name}</p>
              <p className="text-white/70 text-[10px]">{photo.weight_kg} kg · {photo.plastic_type}</p>
            </div>
            <span className={`absolute top-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusColor(photo.status)}`}>
              {photo.status}
            </span>
          </button>
        ))}
      </div>

      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          {selectedPhoto && (
            <>
              <img
                src={selectedPhoto.photo_url}
                alt={`Collection by ${selectedPhoto.user_name}`}
                className="w-full max-h-[60vh] object-contain bg-black"
              />
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{selectedPhoto.user_name}</span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor(selectedPhoto.status)}`}>
                    {selectedPhoto.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Scale className="h-3.5 w-3.5" />
                    <span>{selectedPhoto.weight_kg} kg — {selectedPhoto.plastic_type}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(selectedPhoto.created_at)}</span>
                  </div>
                  {selectedPhoto.location && (
                    <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{selectedPhoto.location}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Points earned: {selectedPhoto.points_earned}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
