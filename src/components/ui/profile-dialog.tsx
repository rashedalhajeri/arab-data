
"use client";

import { useCharacterLimit } from "@/components/hooks/use-character-limit";
import { useImageUpload } from "@/components/hooks/use-image-upload";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, ImagePlus, X } from "lucide-react";
import { useId, useState } from "react";

function ProfileDialog() {
  const id = useId();

  const maxLength = 180;
  const {
    value,
    characterCount,
    handleChange,
    maxLength: limit,
  } = useCharacterLimit({
    maxLength,
    initialValue:
      "تحية طيبة، أنا أحمد، مطور ويب يحب تحويل الأفكار إلى مواقع مذهلة!",
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">تعديل الملف الشخصي</Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-right">
          <DialogTitle className="border-b border-border px-6 py-4 text-base">
            تعديل الملف الشخصي
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          قم بإجراء تغييرات على ملفك الشخصي هنا. يمكنك تغيير صورتك وتعيين اسم المستخدم.
        </DialogDescription>
        <div className="overflow-y-auto">
          <ProfileBg defaultImage="https://originui.com/profile-bg.jpg" />
          <Avatar defaultImage="https://originui.com/avatar-72-01.jpg" />
          <div className="px-6 pb-6 pt-4">
            <form className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`${id}-first-name`}>الاسم الأول</Label>
                  <Input
                    id={`${id}-first-name`}
                    placeholder="أحمد"
                    defaultValue="أحمد"
                    type="text"
                    required
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`${id}-last-name`}>اسم العائلة</Label>
                  <Input
                    id={`${id}-last-name`}
                    placeholder="الأحمد"
                    defaultValue="الأحمد"
                    type="text"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${id}-username`}>اسم المستخدم</Label>
                <div className="relative">
                  <Input
                    id={`${id}-username`}
                    className="peer ps-9"
                    placeholder="اسم المستخدم"
                    defaultValue="ahmed-alahmad-69"
                    type="text"
                    required
                  />
                  <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                    <Check
                      size={16}
                      strokeWidth={2}
                      className="text-emerald-500"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${id}-website`}>الموقع الإلكتروني</Label>
                <div className="flex rounded-lg shadow-sm shadow-black/5">
                  <span className="-z-10 inline-flex items-center rounded-e-lg border border-input bg-background px-3 text-sm text-muted-foreground">
                    https://
                  </span>
                  <Input
                    id={`${id}-website`}
                    className="-me-px rounded-e-none shadow-none"
                    placeholder="yourwebsite.com"
                    defaultValue="www.ahmed.com"
                    type="text"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${id}-bio`}>السيرة الذاتية</Label>
                <Textarea
                  id={`${id}-bio`}
                  placeholder="اكتب بعض الجمل عن نفسك"
                  defaultValue={value}
                  maxLength={maxLength}
                  onChange={handleChange}
                  aria-describedby={`${id}-description`}
                />
                <p
                  id={`${id}-description`}
                  className="mt-2 text-left text-xs text-muted-foreground"
                  role="status"
                  aria-live="polite"
                >
                  متبقي <span className="tabular-nums">{limit - characterCount}</span> حرف
                </p>
              </div>
            </form>
          </div>
        </div>
        <DialogFooter className="border-t border-border px-6 py-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              إلغاء
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="button">حفظ التغييرات</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProfileBg({ defaultImage }: { defaultImage?: string }) {
  const [hideDefault, setHideDefault] = useState(false);
  const { previewUrl, fileInputRef, handleThumbnailClick, handleFileChange, handleRemove } =
    useImageUpload();

  const currentImage = previewUrl || (!hideDefault ? defaultImage : null);

  const handleImageRemove = () => {
    handleRemove();
    setHideDefault(true);
  };

  return (
    <div className="h-32">
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-muted">
        {currentImage && (
          <img
            className="h-full w-full object-cover"
            src={currentImage}
            alt={previewUrl ? "معاينة الصورة المرفوعة" : "خلفية الملف الشخصي الافتراضية"}
            width={512}
            height={96}
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          <button
            type="button"
            className="z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-offset-2 transition-colors hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
            onClick={handleThumbnailClick}
            aria-label={currentImage ? "تغيير الصورة" : "رفع صورة"}
          >
            <ImagePlus size={16} strokeWidth={2} aria-hidden="true" />
          </button>
          {currentImage && (
            <button
              type="button"
              className="z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-offset-2 transition-colors hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
              onClick={handleImageRemove}
              aria-label="حذف الصورة"
            >
              <X size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        aria-label="رفع ملف صورة"
      />
    </div>
  );
}

function Avatar({ defaultImage }: { defaultImage?: string }) {
  const { previewUrl, fileInputRef, handleThumbnailClick, handleFileChange } = useImageUpload();

  const currentImage = previewUrl || defaultImage;

  return (
    <div className="-mt-10 px-6">
      <div className="relative flex size-20 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-muted shadow-sm shadow-black/10">
        {currentImage && (
          <img
            src={currentImage}
            className="h-full w-full object-cover"
            width={80}
            height={80}
            alt="صورة الملف الشخصي"
          />
        )}
        <button
          type="button"
          className="absolute flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-offset-2 transition-colors hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
          onClick={handleThumbnailClick}
          aria-label="تغيير صورة الملف الشخصي"
        >
          <ImagePlus size={16} strokeWidth={2} aria-hidden="true" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
          aria-label="رفع صورة الملف الشخصي"
        />
      </div>
    </div>
  );
}

export { ProfileDialog };
