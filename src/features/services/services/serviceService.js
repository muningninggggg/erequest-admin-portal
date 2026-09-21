import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc
} from "firebase/firestore";

import { db } from "../../../firebase/firebaseConfig";

const SERVICES_COLLECTION = "services";

// GET ALL SERVICES
export async function getAllServices() {
  const servicesRef = collection(
    db,
    SERVICES_COLLECTION
  );

  const snapshot = await getDocs(servicesRef);

  const services = snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data()
  }));

  // Sort alphabetically by service name
  services.sort((a, b) =>
    (a.name || "").localeCompare(b.name || "")
  );

  return services;
}


// ADD NEW SERVICE
export async function addService(serviceId, name, description) {
  const cleanId = serviceId.trim();
  const cleanName = name.trim();
  const cleanDescription = description.trim();

  if (!cleanId) {
    throw new Error("Service ID is required.");
  }

  if (!cleanName) {
    throw new Error("Service name is required.");
  }

  const serviceRef = doc(
    db,
    SERVICES_COLLECTION,
    cleanId
  );

  await setDoc(serviceRef, {
    name: cleanName,
    description: cleanDescription,
    isActive: true,
    updatedAt: Date.now()
  });
}


// UPDATE EXISTING SERVICE
export async function updateService(
  serviceId,
  name,
  description
) {
  const cleanName = name.trim();
  const cleanDescription = description.trim();

  if (!serviceId) {
    throw new Error("Service ID is required.");
  }

  if (!cleanName) {
    throw new Error("Service name is required.");
  }

  const serviceRef = doc(
    db,
    SERVICES_COLLECTION,
    serviceId
  );

  await updateDoc(serviceRef, {
    name: cleanName,
    description: cleanDescription,
    updatedAt: Date.now()
  });
}


// ACTIVATE / DEACTIVATE SERVICE
export async function setServiceActiveStatus(
  serviceId,
  isActive
) {
  if (!serviceId) {
    throw new Error("Service ID is required.");
  }

  const serviceRef = doc(
    db,
    SERVICES_COLLECTION,
    serviceId
  );

  await updateDoc(serviceRef, {
    isActive,
    updatedAt: Date.now()
  });
}