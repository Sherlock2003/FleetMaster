export interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  vin: string;
  license_plate: string;
  status: 'Available' | 'Rented' | 'Maintenance';
  created_at: string;
  image_path?: string;
}

export interface Document {
  id: number;
  vehicle_id: number;
  type: 'Insurance' | 'RC' | 'PUC';
  expiration_date: string;
  file_path?: string;
  created_at: string;
}

export interface MaintenanceLog {
  id: number;
  vehicle_id: number;
  description: string;
  service_date: string;
  cost: number;
  created_at: string;
}

export interface Media {
  id: number;
  vehicle_id: number;
  type: 'Exterior' | 'Interior';
  file_path: string;
  created_at: string;
}
