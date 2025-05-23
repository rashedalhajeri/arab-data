import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import DropZoneImage from "@/components/DropZoneImage";
import { useToast } from "@/components/ui/use-toast";
import { useDashboard } from "@/components/DashboardLayout";
import { PlusCircle, Loader2, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { supabase } from "@/lib/supabase";
import { Category } from "@/hooks/useCategories";
import { Advertisement, AdvertisementImage } from "@/types/advertisement";
import { TablesInsert } from "@/integrations/supabase/types";

const defaultAd: Advertisement = {
  title: "",
  category_type: "real-estate",
  ad_type: "sale",
  description: "",
  is_active: true,
  status: "active", // Added the required status field
  office_id: "",
  user_id: "",
  price: ""
};

export default function AddAdvertisement() {
  const navigate = useNavigate();
  const { category: categoryParam, adType: adTypeParam } = useParams<{ category?: string; adType?: string; }>();
  const { office } = useDashboard();
  const { toast } = useToast();
  const [advertisement, setAdvertisement] = useState<Advertisement>(defaultAd);
  const [images, setImages] = useState<AdvertisementImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(categoryParam);
  const [selectedAdType, setSelectedAdType] = useState<string | undefined>(adTypeParam);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
      setAdvertisement(prev => ({ ...prev, category_type: categoryParam }));
    }
    if (adTypeParam) {
      setSelectedAdType(adTypeParam);
      setAdvertisement(prev => ({ ...prev, ad_type: adTypeParam }));
    }
  }, [categoryParam, adTypeParam]);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!office?.id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('office_id', office.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }
        setCategories(data || []);
      } catch (error: any) {
        toast({
          title: "Error fetching categories",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [office?.id, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAdvertisement(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setAdvertisement(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (index: number, imageUrl: string) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], image_url: imageUrl };
    setImages(newImages);
  };

  const handleSetMainImage = (index: number) => {
    const newImages = images.map((img, i) => ({ ...img, is_main: i === index }));
    setImages(newImages);
  };

  const addImage = () => {
    setImages(prev => [...prev, { image_url: "", is_main: false }]);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      toast({
        title: "تنبيه",
        description: "يرجى إضافة صورة واحدة على الأقل",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      if (!office?.id) {
        throw new Error("Office ID is missing");
      }

      const adData = {
        ...advertisement,
        office_id: office.id,
        user_id: (await supabase.auth.getUser()).data.user?.id || "",
        status: "active"
      } as TablesInsert<"advertisements">;

      const { data: adResult, error: adError } = await supabase
        .from("advertisements")
        .insert(adData)
        .select()
        .single();

      if (adError) throw adError;

      const imagesData = images.map((img, index) => ({
        advertisement_id: adResult.id,
        image_url: img.image_url,
        is_main: img.is_main ?? (index === 0),
        storage_path: img.storage_path || img.image_url,
        order_num: index + 1
      })) as TablesInsert<"advertisement_images">[];

      const { error: imagesError } = await supabase
        .from("advertisement_images")
        .insert(imagesData);

      if (imagesError) throw imagesError;

      toast({
        title: "تم إنشاء الإعلان بنجاح",
        description: "سيتم نشره بعد المراجعة",
      });
      navigate("/dashboard/advertisements");
    } catch (error: any) {
      toast({
        title: "فشل إنشاء الإعلان",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const dataURLtoBlob = (dataurl: any) => {
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[arr.length - 1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">عنوان الإعلان</Label>
            <Input
              type="text"
              id="title"
              name="title"
              value={advertisement.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="category_type">نوع الفئة</Label>
            <Select value={selectedCategory} onValueChange={(value) => {
              setSelectedCategory(value);
              handleSelectChange("category_type", value);
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر نوع الفئة" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="ad_type">نوع الإعلان</Label>
            <Select value={selectedAdType} onValueChange={(value) => {
              setSelectedAdType(value);
              handleSelectChange("ad_type", value);
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر نوع الإعلان" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sale">بيع</SelectItem>
                <SelectItem value="rent">إيجار</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="price">السعر (د.ك)</Label>
            <Input
              type="number"
              id="price"
              name="price"
              value={advertisement.price}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              name="description"
              value={advertisement.description}
              onChange={handleInputChange}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>صور الإعلان</Label>
            {images.map((image, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <DropZoneImage
                  value={image.image_url}
                  onChange={(url) => handleImageChange(index, url!)}
                  aspectRatio={16 / 9}
                />
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Input
                      type="radio"
                      id={`main-image-${index}`}
                      name="main-image"
                      className="h-4 w-4"
                      checked={image.is_main}
                      onChange={() => handleSetMainImage(index)}
                    />
                    <Label htmlFor={`main-image-${index}`}>صورة رئيسية</Label>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="w-full">
                        <X className="h-4 w-4 ml-2" />
                        حذف الصورة
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                        <AlertDialogDescription>
                          سيتم حذف هذه الصورة بشكل دائم. هل أنت متأكد؟
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={() => removeImage(index)}>حذف</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" className="w-full" onClick={addImage}>
              <PlusCircle className="h-4 w-4 ml-2" />
              إضافة صورة
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={uploading}>
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            جاري إنشاء الإعلان...
          </>
        ) : (
          "إنشاء الإعلان"
        )}
      </Button>
    </form>
  );
}
