import { Injectable } from '@angular/core';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  DocumentData,
  CollectionReference,
  DocumentReference,
} from 'firebase/firestore';
import { db } from '../firebase';

@Injectable({ providedIn: 'root' })
export class FirestoreService {
  // get all documents in a collection
  async getCollection(collPath: string): Promise<any[]> {
    const collRef: CollectionReference<DocumentData> = collection(db, collPath);
    const snap = await getDocs(collRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  // get single document by collection + id
  async getDoc(collPath: string, id: string): Promise<any | null> {
    const docRef: DocumentReference<DocumentData> = doc(db, collPath, id);
    const snap = await getDoc(docRef);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  }

  // add document to collection (auto-id)
  async addDocument(collPath: string, data: any) {
    const collRef = collection(db, collPath);
    return addDoc(collRef, data);
  }

  // set document by id (overwrites)
  async setDocument(collPath: string, id: string, data: any) {
    const docRef = doc(db, collPath, id);
    return setDoc(docRef, data);
  }

  // update fields of a document
  async updateDocument(collPath: string, id: string, data: Partial<any>) {
    const docRef = doc(db, collPath, id);
    return updateDoc(docRef, data);
  }

  // delete document
  async deleteDocument(collPath: string, id: string) {
    const docRef = doc(db, collPath, id);
    return deleteDoc(docRef);
  }
}
