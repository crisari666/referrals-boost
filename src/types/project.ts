export type ApiAmenity = { _id: string; title: string };

export type ApiProject = {
  _id: string;
  title: string;
  description?: string;
  location: string;
  city?: string;
  state?: string;
  country?: string;
  lat: number;
  lng: number;
  priceSell: number;
  commissionPercentage: number;
  commissionValue: number;
  amenities?: ApiAmenity[];
  images?: string[];
  deleted?: boolean;
  createdAt: string;
  updatedAt: string;
};
