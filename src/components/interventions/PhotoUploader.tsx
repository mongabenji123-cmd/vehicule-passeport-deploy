import { useCallback, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoUploaderProps {
  vehicleId: string;
  value: string[];
  onChange: (urls: string[]) => void;
}

export function PhotoUploader({ vehicleId, value, onChange }: PhotoUploaderProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    if (!user) return;
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (fileArray.length === 0) {
      toast.error('Seules les images sont acceptées');
      return;
    }
    if (fileArray.some(f => f.size > 5 * 1024 * 1024)) {
      toast.error('Taille maximale : 5 Mo par image');
      return;
    }

    setUploading(true);
    const newUrls: string[] = [];

    for (const file of fileArray) {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${vehicleId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from('intervention-docs')
        .upload(path, file, { contentType: file.type });

      if (error) {
        toast.error(`Erreur upload : ${file.name}`);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('intervention-docs')
        .getPublicUrl(path);
      newUrls.push(urlData.publicUrl);
    }

    onChange([...value, ...newUrls]);
    setUploading(false);
    toast.success(`${newUrls.length} photo${newUrls.length > 1 ? 's' : ''} ajoutée${newUrls.length > 1 ? 's' : ''}`);
  }, [user, vehicleId, value, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files);
  }, [uploadFiles]);

  const removePhoto = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all',
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/40 hover:bg-secondary/30'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Upload en cours…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Glissez vos photos ici ou <span className="text-primary">parcourir</span>
            </p>
            <p className="text-xs text-muted-foreground/50">Images uniquement, max 5 Mo</p>
          </div>
        )}
      </div>

      {/* Previews */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {value.map((url, i) => (
            <div key={i} className="relative group aspect-square rounded-md overflow-hidden border border-border bg-secondary">
              <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive/90 text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
