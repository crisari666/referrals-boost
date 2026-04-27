export type ApiAmenity = { _id: string; title: string };
export type ApiAmenityGroup = { icon?: string; title: string; amenities: string[] };

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
  priceSellUsd?: number;
  commissionPercentage: number;
  commissionValue: number;
  amenities?: ApiAmenity[];
  amenitiesGroups?: ApiAmenityGroup[];
  images?: string[];
  horizontalImages?: string[];
  reelVideo?: string;
  brochure?: string;
  plane?: string;
  cardProject?: string;
  deleted?: boolean;
  createdAt: string;
  updatedAt: string;
};
