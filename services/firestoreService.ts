
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Guest, Room, Invoice } from '../types';

// System Users Management (Admin Priority)
export const subscribeToUsers = (callback: (users: any[]) => void) => {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(users);
  });
};

export const updateUserStatus = async (userId: string, status: 'active' | 'blocked') => {
  const userRef = doc(db, 'users', userId);
  return await updateDoc(userRef, { status, updatedAt: serverTimestamp() });
};

export const deleteUser = async (userId: string) => {
  return await deleteDoc(doc(db, 'users', userId));
};

export const updateUserRole = async (userId: string, role: 'admin' | 'staff') => {
  const userRef = doc(db, 'users', userId);
  return await updateDoc(userRef, { role, updatedAt: serverTimestamp() });
};

export const updateUser = async (userId: string, data: Partial<any>) => {
  const userRef = doc(db, 'users', userId);
  return await updateDoc(userRef, { ...data, updatedAt: serverTimestamp() });
};

// Social Feed (Mural BFV)
export const subscribeToPosts = (callback: (posts: any[]) => void) => {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(posts);
  });
};

export const createPost = async (post: any) => {
  return await addDoc(collection(db, 'posts'), {
    ...post,
    createdAt: serverTimestamp(),
    likes: 0
  });
};

// Notifications
export const subscribeToNotifications = (userId: string, callback: (notifications: any[]) => void) => {
  const q = query(
    collection(db, 'notifications'), 
    where('userId', 'in', [userId, 'all']),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() as any 
    }));
    callback(notifications);
  });
};

export const markNotificationAsRead = async (notificationId: string) => {
  return await updateDoc(doc(db, 'notifications', notificationId), { read: true });
};

export const createNotification = async (notification: any) => {
  return await addDoc(collection(db, 'notifications'), {
    ...notification,
    read: false,
    createdAt: serverTimestamp()
  });
};

// Guests
export const subscribeToGuests = (callback: (guests: any[]) => void) => {
  const q = query(collection(db, 'guests'), orderBy('name'));
  return onSnapshot(q, (snapshot) => {
    const guests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(guests);
  });
};

export const addGuest = async (guest: Omit<Guest, 'id'>) => {
  return await addDoc(collection(db, 'guests'), {
    ...guest,
    createdAt: serverTimestamp()
  });
};

export const updateGuest = async (guestId: string, data: Partial<Guest>) => {
  const guestRef = doc(db, 'guests', guestId);
  return await updateDoc(guestRef, { ...data, updatedAt: serverTimestamp() });
};

export const deleteGuest = async (guestId: string) => {
  return await deleteDoc(doc(db, 'guests', guestId));
};

// Rooms
export const subscribeToRooms = (callback: (rooms: any[]) => void) => {
  const q = query(collection(db, 'rooms'), orderBy('number'));
  return onSnapshot(q, (snapshot) => {
    const rooms = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(rooms);
  });
};

// Invoices
export const subscribeToInvoices = (callback: (invoices: any[]) => void) => {
  const q = query(collection(db, 'invoices'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const invoices = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(invoices);
  });
};

export const createInvoice = async (invoice: Omit<Invoice, 'id'>) => {
  return await addDoc(collection(db, 'invoices'), {
    ...invoice,
    createdAt: serverTimestamp()
  });
};
