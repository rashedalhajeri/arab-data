
export interface AdvertisementImage {
  id?: string;
  advertisement_id: string;
  image_url: string;
  is_main: boolean;
  storage_path?: string;
  order_num?: number;
  created_at?: string;
}

export interface Advertisement {
  id?: string;
  title: string;
  description?: string;
  category_type: string;
  ad_type: string;
  price?: string;
  is_active: boolean;
  status: string;
  created_at?: string;
  updated_at?: string;
  office_id: string;
  user_id: string;
  images?: AdvertisementImage[];
}
