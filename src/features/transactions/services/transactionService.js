import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc
} from "firebase/firestore";

import { db } from "../../../firebase/firebaseConfig";

const TRANSACTIONS_COLLECTION = "transactions";
const SERVICES_COLLECTION = "services";


/* =========================================
   GET ALL TRANSACTIONS
   ========================================= */

export async function getAllTransactions() {
  const transactionsRef = collection(
    db,
    TRANSACTIONS_COLLECTION
  );

  const snapshot = await getDocs(transactionsRef);

  const transactions = snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data()
  }));

  transactions.sort((a, b) =>
    (a.name || "").localeCompare(b.name || "")
  );

  return transactions;
}


/* =========================================
   GET ACTIVE SERVICES
   For Service dropdown
   ========================================= */

export async function getActiveServices() {
  const servicesRef = collection(
    db,
    SERVICES_COLLECTION
  );

  const snapshot = await getDocs(servicesRef);

  const services = snapshot.docs
    .map((document) => ({
      id: document.id,
      ...document.data()
    }))
    .filter((service) => service.isActive === true);

  services.sort((a, b) =>
    (a.name || "").localeCompare(b.name || "")
  );

  return services;
}


/* =========================================
   ADD TRANSACTION
   ========================================= */

export async function addTransaction(
  transactionId,
  serviceId,
  name,
  description,
  officeName,
  officeSchedule
) {
  const cleanId = transactionId.trim();
  const cleanServiceId = serviceId.trim();
  const cleanName = name.trim();
  const cleanDescription = description.trim();
  const cleanOfficeName = officeName.trim();
  const cleanOfficeSchedule = officeSchedule.trim();

  if (!cleanId) {
    throw new Error("Transaction ID is required.");
  }

  if (!cleanServiceId) {
    throw new Error("Please select a service.");
  }

  if (!cleanName) {
    throw new Error("Transaction name is required.");
  }

  const transactionRef = doc(
    db,
    TRANSACTIONS_COLLECTION,
    cleanId
  );

  // Prevent duplicate Transaction ID
  const existingTransaction =
    await getDoc(transactionRef);

  if (existingTransaction.exists()) {
    throw new Error(
      "A transaction with this ID already exists."
    );
  }

  await setDoc(transactionRef, {
    serviceId: cleanServiceId,
    name: cleanName,
    description: cleanDescription,
    officeName: cleanOfficeName,
    officeSchedule: cleanOfficeSchedule,
    isActive: true,
    updatedAt: Date.now()
  });
}


/* =========================================
   UPDATE TRANSACTION
   ========================================= */

export async function updateTransaction(
  transactionId,
  serviceId,
  name,
  description,
  officeName,
  officeSchedule
) {
  if (!transactionId) {
    throw new Error("Transaction ID is required.");
  }

  if (!serviceId.trim()) {
    throw new Error("Please select a service.");
  }

  if (!name.trim()) {
    throw new Error("Transaction name is required.");
  }

  const transactionRef = doc(
    db,
    TRANSACTIONS_COLLECTION,
    transactionId
  );

  await updateDoc(transactionRef, {
    serviceId: serviceId.trim(),
    name: name.trim(),
    description: description.trim(),
    officeName: officeName.trim(),
    officeSchedule: officeSchedule.trim(),
    updatedAt: Date.now()
  });
}


/* =========================================
   ACTIVATE / DEACTIVATE
   ========================================= */

export async function setTransactionActiveStatus(
  transactionId,
  isActive
) {
  if (!transactionId) {
    throw new Error("Transaction ID is required.");
  }

  const transactionRef = doc(
    db,
    TRANSACTIONS_COLLECTION,
    transactionId
  );

  await updateDoc(transactionRef, {
    isActive: isActive,
    updatedAt: Date.now()
  });
}