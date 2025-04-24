import { useState, useEffect } from 'react';

interface CountryData {
  country: string | null;
  currencySymbol: string | null;
  currencyCode: string | null;
  isLoading: boolean;
  error: Error | null;
}

// Mapeo de monedas por país
const countryCurrencyMap: Record<string, { symbol: string; code: string }> = {
  'SA': { symbol: 'ر.س', code: 'ريال سعودي' },
  'KW': { symbol: 'د.ك', code: 'دينار كويتي' },
  'AE': { symbol: 'د.إ', code: 'درهم إماراتي' },
  'QA': { symbol: 'ر.ق', code: 'ريال قطري' },
  'BH': { symbol: 'د.ب', code: 'دينار بحريني' },
  'OM': { symbol: 'ر.ع', code: 'ريال عماني' },
  'EG': { symbol: 'ج.م', code: 'جنيه مصري' },
  'JO': { symbol: 'د.أ', code: 'دينار أردني' },
  'IQ': { symbol: 'د.ع', code: 'دينار عراقي' },
  'LB': { symbol: 'ل.ل', code: 'ليرة لبنانية' },
  // Añadir más países según sea necesario
};

export function useCountry(): CountryData {
  const [countryData, setCountryData] = useState<CountryData>({
    country: null,
    currencySymbol: null,
    currencyCode: null,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    async function detectCountry() {
      try {
        // Intentar obtener el país a través de una API de geolocalización
        const response = await fetch('https://ipapi.co/json/');
        
        if (!response.ok) {
          throw new Error('No se pudo detectar el país');
        }
        
        const data = await response.json();
        const countryCode = data.country_code;
        
        // Obtener información de moneda según el país
        const currencyInfo = countryCurrencyMap[countryCode] || { symbol: 'ر.س', code: 'ريال' };
        
        setCountryData({
          country: data.country_name,
          currencySymbol: currencyInfo.symbol,
          currencyCode: currencyInfo.code,
          isLoading: false,
          error: null
        });
      } catch (error) {
        // En caso de error, usar valores predeterminados para Arabia Saudita
        setCountryData({
          country: null,
          currencySymbol: 'ر.س',
          currencyCode: 'ريال',
          isLoading: false,
          error: error instanceof Error ? error : new Error('Error desconocido')
        });
      }
    }
    
    detectCountry();
  }, []);

  return countryData;
} 