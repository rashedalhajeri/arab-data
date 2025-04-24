import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Share2, Loader2, Image as ImageIcon, Eye, QrCode as QrCodeIcon } from "lucide-react";
import { useDashboard } from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import QRCode from "react-qr-code";

// Tipo para los anuncios
interface Advertisement {
  id: string;
  title: string;
  category: string;
  status: "active" | "pending" | "expired";
  created_at: string;
  image_url?: string;
  slug?: string;
}

const QrCodes = () => {
  const { office } = useDashboard();
  const [loading, setLoading] = useState(true);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");

  // Cargar anuncios al iniciar
  useEffect(() => {
    const fetchAdvertisements = async () => {
      setLoading(true);
      
      try {
        // En un caso real, aquí cargaríamos los anuncios desde Supabase
        // Por ahora, simularemos los datos con algunos ejemplos
        
        // Simulación de retraso de red
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Datos de ejemplo
        const exampleAds: Advertisement[] = [
          {
            id: "1",
            title: "سيارة مرسيدس 2022",
            category: "vehicles",
            status: "active",
            created_at: new Date().toISOString(),
            image_url: "https://via.placeholder.com/300x200?text=Mercedes",
            slug: "mercedes-2022"
          },
          {
            id: "2",
            title: "شقة فاخرة للبيع",
            category: "real-estate",
            status: "active",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            image_url: "https://via.placeholder.com/300x200?text=Apartment",
            slug: "luxury-apartment"
          },
          {
            id: "3",
            title: "آيفون 13 برو جديد",
            category: "other",
            status: "pending",
            created_at: new Date(Date.now() - 172800000).toISOString(),
            image_url: "https://via.placeholder.com/300x200?text=iPhone",
            slug: "iphone-13-pro"
          }
        ];
        
        setAdvertisements(exampleAds);
      } catch (error) {
        console.error("Error al cargar los anuncios:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdvertisements();
  }, []);

  // Función para generar la URL del anuncio
  const generateAdUrl = (adSlug: string) => {
    if (!office?.slug) return "";
    const currentOrigin = window.location.origin;
    // استخدام المسار المباشر للمكتب
    return `${currentOrigin}/${office.slug}/ad/${adSlug}`;
  };

  // Filtrar anuncios por estado
  const filteredAds = activeTab === "all" 
    ? advertisements 
    : advertisements.filter(ad => ad.status === activeTab);

  // Manejar la descarga del código QR
  const handleDownloadQR = (adId: string, adTitle: string, adUrl: string) => {
    // Obtener el elemento SVG del código QR
    const svg = document.getElementById(`qr-code-${adId}`);
    if (!svg) return;
    
    // Crear un canvas para convertir el SVG a PNG
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    // Crear una imagen a partir del SVG
    const img = new Image();
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      // Configurar el canvas con un margen
      canvas.width = img.width + 40; // 20px de margen en cada lado
      canvas.height = img.height + 40;
      
      if (ctx) {
        // Fondo blanco
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar el QR centrado
        ctx.drawImage(img, 20, 20);
        
        // Convertir a PNG y descargar
        const pngUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = `qr-code-${adTitle.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.click();
        
        // Limpiar
        URL.revokeObjectURL(url);
      }
    };
    
    img.src = url;
  };

  // Manejar compartir del código QR
  const handleShareQR = async (adId: string, adUrl: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'مشاركة رمز QR',
          text: 'يمكنك مسح رمز QR هذا للوصول إلى الإعلان',
          url: adUrl
        });
      } catch (error) {
        console.error('Error al compartir:', error);
      }
    } else {
      // Copiar al portapapeles como alternativa
      navigator.clipboard.writeText(adUrl);
      alert('تم نسخ الرابط إلى الحافظة');
    }
  };

  // Componente para mostrar el código QR
  const QrCodeCard = ({ ad }: { ad: Advertisement }) => {
    const adUrl = generateAdUrl(ad.slug || ad.id);
    
    return (
      <Card className="overflow-hidden">
        <div className="aspect-square relative bg-white p-6 flex items-center justify-center">
          {/* Código QR real usando react-qr-code */}
          <div className="relative" style={{ background: 'white', padding: '12px' }}>
            <QRCode
              id={`qr-code-${ad.id}`}
              value={adUrl || window.location.origin}
              size={160}
              level="H"
              fgColor="#000000"
              bgColor="#FFFFFF"
            />
          </div>
          <Badge 
            className={`absolute top-3 right-3 ${
              ad.status === "active" ? "bg-green-500 hover:bg-green-600" : 
              ad.status === "pending" ? "bg-amber-500 hover:bg-amber-600" : 
              "bg-destructive hover:bg-destructive/80"
            }`} 
            variant={ad.status === "active" ? "default" : ad.status === "pending" ? "secondary" : "destructive"}
          >
            {ad.status === "active" ? "نشط" : ad.status === "pending" ? "معلق" : "منتهي"}
          </Badge>
        </div>
        
        <CardContent className="p-4 border-t">
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
              {ad.image_url ? (
                <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <ImageIcon className="text-gray-400" size={24} />
                </div>
              )}
            </div>
            <div className="flex-grow">
              <h3 className="font-medium text-lg truncate">{ad.title}</h3>
              <p className="text-sm text-gray-500 truncate">{adUrl}</p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-3 pt-0 justify-between">
          <Button size="sm" variant="outline" onClick={() => handleDownloadQR(ad.id, ad.title, adUrl)}>
            <Download className="h-4 w-4 ml-2" />
            تحميل
          </Button>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleShareQR(ad.id, adUrl)}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href={adUrl} target="_blank" rel="noopener noreferrer">
                <Eye className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  };

  // Componente para el estado vacío
  const EmptyState = () => (
    <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-slate-800/30">
      <QrCodeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <p className="text-gray-500 dark:text-gray-400 mb-3">لا توجد رموز QR لعرضها</p>
      <p className="text-gray-500 dark:text-gray-400 mb-5">أضف إعلانات جديدة لإنشاء رموز QR تلقائيًا</p>
      <Button 
        variant="default"
        onClick={() => window.location.href = "/dashboard/advertisements"}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
      >
        إضافة إعلان جديد
      </Button>
    </div>
  );

  return (
    <>
      {/* ترويسة الصفحة */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <Input 
            type="search"
            placeholder="البحث في رموز QR..."
            className="w-64"
          />
        </div>
        <div className="space-y-2 text-right">
          <h1 className="text-3xl font-bold bg-gradient-to-l from-purple-800 to-indigo-700 text-transparent bg-clip-text">رموز QR</h1>
          <p className="text-gray-600 dark:text-gray-400">استعرض وشارك رموز QR لإعلاناتك</p>
        </div>
      </header>

      {/* تصفية رموز QR */}
      <Card className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm border-none shadow-lg mb-6">
        <CardContent className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-transparent border border-gray-200 dark:border-gray-700 p-1">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                id="tab-filter-all"
                name="tab-filter"
              >
                الكل
              </TabsTrigger>
              <TabsTrigger 
                value="active" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                id="tab-filter-active"
                name="tab-filter"
              >
                نشط
              </TabsTrigger>
              <TabsTrigger 
                value="pending" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                id="tab-filter-pending"
                name="tab-filter"
              >
                معلق
              </TabsTrigger>
              <TabsTrigger 
                value="expired" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                id="tab-filter-expired"
                name="tab-filter"
              >
                منتهي
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* عرض رموز QR */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-primary h-8 w-8" />
        </div>
      ) : filteredAds.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAds.map(ad => (
            <QrCodeCard key={ad.id} ad={ad} />
          ))}
        </div>
      )}
    </>
  );
};

export default QrCodes; 