
export type UserRole = 'admin' | 'staff';
export type Permission = 'billing' | 'guests' | 'rooms' | 'reports' | 'staff' | 'mural' | 'dashboard' | 'comms';
export type Page = 'dashboard' | 'billing' | 'guests' | 'rooms' | 'reports' | 'settings' | 'comms' | 'staff' | 'mural';

export interface AppUser {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  permissions?: Permission[];
  photoURL?: string;
  status: 'active' | 'blocked';
  updatedAt?: any;
}

export interface Guest {
  id: string;
  name?: string;
  nif?: string;
  email?: string;
  phone?: string;
}

export interface Room {
  id: string;
  number: string;
  type: 'single' | 'double' | 'suite';
  pricePerNight: number;
  status: 'available' | 'occupied' | 'maintenance';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  guestId?: string;
  guestName?: string;
  roomName: string;
  roomNumber: string;
  roomPrice: number;
  hostingType: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: 'paid' | 'pending' | 'cancelled';
  createdAt: any;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CompanyInfo {
  name: string;
  nif: string;
  address: string;
  email: string;
  phone: string;
  logo?: string;
}
