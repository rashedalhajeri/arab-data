
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import SimpleImageUpload from "@/components/SimpleImageUpload";
import { Loader2 } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";

interface CategoryFormProps {
  onSubmit: (formData: {
    name: string;
    image_url: string;
    is_active: boolean;
  }) => Promise<void>;
  onCancel: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    image_url: "",
    is_active: true
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      await onSubmit({
        ...formData,
        image_url: imagePreview || formData.image_url,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">اسم الفئة</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="مثال: سيارات"
          className="w-full"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>صورة الفئة</Label>
        <SimpleImageUpload
          value={imagePreview || formData.image_url}
          onChange={setImagePreview}
          onBlob={setImageFile}
          title="اختر صورة للفئة"
          subtitle="اسحب وأفلت الصورة هنا أو اضغط للتحميل"
          maxSizeInMB={1}
          minWidth={100}
          minHeight={100}
          aspectRatio={1}
          imageType="cover"
          className="h-32"
        />
      </div>

      <div className="flex items-center space-x-2 space-x-reverse">
        <Checkbox
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, is_active: checked as boolean })
          }
        />
        <Label htmlFor="is_active">فئة نشطة</Label>
      </div>

      <DialogFooter className="gap-2 sm:gap-0">
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 sm:flex-none"
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            disabled={!formData.name.trim() || uploading}
            className="flex-1 sm:flex-none"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              "إضافة الفئة"
            )}
          </Button>
        </div>
      </DialogFooter>
    </form>
  );
};
