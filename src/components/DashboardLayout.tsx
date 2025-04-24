import React, { useEffect, useState, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import GallerySidebar from "@/components/GallerySidebar";
import { Loader2 } from "lucide-react";

// Tipo para los datos de la oficina
interface OfficeData {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  displayUrl: string;
  logoUrl: string;
  [key: string]: any;  // Para otras propiedades adicionales
}

// Tipo para el contexto del Dashboard
interface DashboardContextType {
  office: OfficeData | null;
  loading: boolean;
  refreshOfficeData: () => Promise<void>;
}

// Crear el contexto
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Hook personalizado para usar el contexto del Dashboard
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard debe ser usado dentro de un DashboardProvider");
  }
  return context;
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [office, setOffice] = useState<OfficeData | null>(null);

  // Función para cargar/refrescar datos de la oficina
  const fetchOfficeData = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("offices")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error al cargar la información de la oficina:", error);
        return;
      }

      if (!data) {
        navigate("/create-page");
        return;
      }

      // Preparar los datos de la oficina con URLs formateadas
      const galleryUrl = data.slug ? `${window.location.origin}/${data.slug}` : "#";
      const logoUrl = data.logo_url 
        ? supabase.storage.from("office-assets").getPublicUrl(data.logo_url).data.publicUrl
        : "/placeholder.svg";
        
      setOffice({
        ...data,
        displayUrl: galleryUrl,
        logoUrl: logoUrl
      });
    } catch (error) {
      console.error("Error general:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al iniciar
  useEffect(() => {
    fetchOfficeData();
  }, []);

  // Si está cargando, mostrar un indicador de carga
  if (loading && !office) {
    return (
      <div dir="rtl" className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-950 dark:to-slate-900 min-h-screen">
        <GallerySidebar
          galleryName="جاري التحميل..."
          galleryUrl="#"
          galleryLogo="/placeholder.svg"
        />
        <main className="mr-64 py-8 px-8 min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-purple-700" size={40} />
        </main>
      </div>
    );
  }

  return (
    <DashboardContext.Provider value={{ 
      office, 
      loading, 
      refreshOfficeData: fetchOfficeData 
    }}>
      <div dir="rtl" className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-950 dark:to-slate-900 min-h-screen">
        {/* القائمة الجانبية */}
        <GallerySidebar
          galleryName={office?.name || "اسم المعرض"}
          galleryUrl={office?.displayUrl || "#"}
          galleryLogo={office?.logoUrl || "/placeholder.svg"}
        />

        {/* محتوى لوحة التحكم */}
        <main className="mr-64 py-8 px-8 min-h-screen">
          <div className="max-w-6xl space-y-8">
            {children}
          </div>
        </main>
      </div>
    </DashboardContext.Provider>
  );
};

export default DashboardLayout; 