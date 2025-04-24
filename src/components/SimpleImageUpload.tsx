import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type SimpleImageUploadProps = {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  value?: string | null;
  onChange: (value: string | null) => void;
  onBlob?: (blob: File | null) => void;
  maxSizeInMB?: number;
  minWidth?: number;
  minHeight?: number;
  imageType?: 'logo' | 'cover';
};

export default function SimpleImageUpload({
  title = 'إسحب الصورة أو اضغط للتحميل',
  subtitle = 'يمكنك رفع صورة بأبعاد مخصصة',
  icon = <UploadCloud className="h-10 w-10 text-primary" />,
  className,
  value = null,
  onChange,
  onBlob,
  maxSizeInMB = 5,
  minWidth = 400,
  minHeight = 400,
  imageType = 'logo',
}: SimpleImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // التعامل مع السحب والإفلات
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // استخراج امتداد الملف من URL البيانات
  const getFileExtension = (dataUrl: string): string => {
    const match = dataUrl.match(/^data:image\/(\w+);/);
    return match ? match[1] : 'png';
  };

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setLoading(true);

      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        setError('الملف المحدد ليس صورة صالحة');
        setLoading(false);
        return;
      }

      // التحقق من حجم الملف
      if (file.size > maxSizeInMB * 1024 * 1024) {
        setError(`حجم الصورة يجب أن يكون أقل من ${maxSizeInMB} ميجابايت`);
        setLoading(false);
        return;
      }

      // تحويل الملف إلى URL بيانات
      const reader = new FileReader();
      reader.onloadend = () => {
        // التحقق من أبعاد الصورة
        const img = document.createElement('img');
        img.onload = () => {
          if (img.width < minWidth || img.height < minHeight) {
            setError(`أبعاد الصورة يجب أن تكون على الأقل ${minWidth}×${minHeight} بكسل`);
            setLoading(false);
            return;
          }
          
          // تعيين الصورة مباشرة
          const imageUrl = reader.result as string;
          onChange(imageUrl);
          
          // تحويل قاعدة البيانات base64 إلى blob لرفعها لاحقًا
          if (onBlob) {
            fetch(imageUrl)
              .then((res) => res.blob())
              .then((blob) => {
                const fileName = `${imageType}-${Date.now()}.${getFileExtension(imageUrl)}`;
                const uploadFile = new File([blob], fileName, { 
                  type: file.type 
                });
                onBlob(uploadFile);
              })
              .catch(() => onBlob(null));
          }
          
          setLoading(false);
        };
        img.onerror = () => {
          setError('حدث خطأ أثناء تحميل الصورة');
          setLoading(false);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    },
    [maxSizeInMB, minWidth, minHeight, onChange, onBlob, imageType]
  );

  // معالجة إفلات الملف
  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        await processFile(e.dataTransfer.files[0]);
      }
    },
    [processFile]
  );

  // التعامل مع اختيار الملف
  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        await processFile(e.target.files[0]);
      }
    },
    [processFile]
  );

  // فتح مربع حوار اختيار الملف
  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // حذف الصورة
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    if (onBlob) onBlob(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const aspectRatioClass = imageType === 'logo' 
    ? 'aspect-square' // 1:1 للشعار
    : 'aspect-video'; // 16:9 للغلاف

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleChange}
        onClick={(e) => e.stopPropagation()}
      />
      
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary/50",
          value ? "p-0" : `cursor-pointer min-h-[200px] ${aspectRatioClass}`,
          className
        )}
        onClick={value ? undefined : openFileDialog}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-2" />
            <p className="text-sm text-gray-500">جاري تحميل الصورة...</p>
          </div>
        ) : value ? (
          <div className="relative w-full h-full group">
            <img
              src={value}
              alt={imageType === 'logo' ? 'الشعار' : 'صورة الغلاف'}
              className={cn(
                "w-full h-full object-cover rounded-lg",
                imageType === 'logo' ? 'aspect-square' : 'aspect-video'
              )}
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
              <Button
                variant="destructive"
                size="sm"
                className="flex items-center gap-1"
                onClick={handleRemove}
              >
                <X size={16} />
                <span>حذف</span>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {icon}
            <h3 className="mt-2 text-base font-medium">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
            {error && (
              <div className="mt-2 text-sm text-red-500 bg-red-50 p-2 rounded-md w-full text-center">
                {error}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 