import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";

import { db } from "../../../firebase/firebaseConfig";
import { addActivityLog } from "../../dashboard/services/activityLogService";

const TRANSACTIONS_COLLECTION = "transactions";
const SERVICES_COLLECTION = "services";


/* =========================================
   GET ALL TRANSACTIONS
   ========================================= */

export async function getAllTransactions() {
  const snapshot = await getDocs(
    collection(db, TRANSACTIONS_COLLECTION)
  );

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
   ========================================= */

export async function getActiveServices() {
  const snapshot = await getDocs(
    collection(db, SERVICES_COLLECTION)
  );

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
   CREATE ID-FRIENDLY NAME
   ========================================= */

function createIdName(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}


/* =========================================
   GET NEXT TRANSACTION NUMBER
   ========================================= */

async function getNextTransactionNumber() {
  const snapshot = await getDocs(
    collection(db, TRANSACTIONS_COLLECTION)
  );

  let highestNumber = 0;

  snapshot.docs.forEach((document) => {
    const match = document.id.match(/_(\d+)$/);

    if (match) {
      const number = parseInt(match[1], 10);

      if (number > highestNumber) {
        highestNumber = number;
      }
    }
  });

  return highestNumber + 1;
}


/* =========================================
   GENERATE TRANSACTION ID
   ========================================= */

async function generateTransactionId(name) {
  const idName = createIdName(name);

  if (!idName) {
    throw new Error(
      "Unable to generate Transaction ID from the transaction name."
    );
  }

  const nextNumber = await getNextTransactionNumber();
  const formattedNumber = String(nextNumber).padStart(3, "0");

  return `${idName}_${formattedNumber}`;
}


/* =========================================
   GET SERVICE NAME
   Used for Recent Updates
   ========================================= */

async function getServiceName(serviceId) {
  if (!serviceId) {
    return "";
  }

  const snapshot = await getDocs(
    collection(db, SERVICES_COLLECTION)
  );

  const service = snapshot.docs.find(
    (document) => document.id === serviceId
  );

  return service?.data()?.name || "";
}


/* =========================================
   ADD TRANSACTION
   ========================================= */

export async function addTransaction(
  serviceId,
  name,
  description,
  officeName,
  officeSchedule
) {
  const cleanServiceId = serviceId.trim();
  const cleanName = name.trim();
  const cleanDescription = description.trim();
  const cleanOfficeName = officeName.trim();
  const cleanOfficeSchedule = officeSchedule.trim();

  if (!cleanServiceId) {
    throw new Error("Please select a service.");
  }

  if (!cleanName) {
    throw new Error("Transaction name is required.");
  }

  const transactionId =
    await generateTransactionId(cleanName);

  const transactionRef = doc(
    db,
    TRANSACTIONS_COLLECTION,
    transactionId
  );

  const currentTime = Date.now();

  await setDoc(transactionRef, {
    serviceId: cleanServiceId,
    name: cleanName,
    description: cleanDescription,
    officeName: cleanOfficeName,
    officeSchedule: cleanOfficeSchedule,
    isActive: true,
    createdAt: currentTime,
    updatedAt: currentTime
  });

  const serviceName =
    await getServiceName(cleanServiceId);

  await addActivityLog({
    type: "transaction",
    action: "added",
    title: cleanName,
    description: "New transaction added",
    parentName: serviceName,
    parentId: cleanServiceId,
    recordId: transactionId
  });

  return transactionId;
}


/* =========================================
   UPDATE TRANSACTION
   ID DOES NOT CHANGE
   ========================================= */

export async function updateTransaction(
  transactionId,
  serviceId,
  name,
  description,
  officeName,
  officeSchedule
) {
  const cleanServiceId = serviceId.trim();
  const cleanName = name.trim();

  if (!transactionId) {
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
    transactionId
  );

  await updateDoc(transactionRef, {
    serviceId: cleanServiceId,
    name: cleanName,
    description: description.trim(),
    officeName: officeName.trim(),
    officeSchedule: officeSchedule.trim(),
    updatedAt: Date.now()
  });

  const serviceName =
    await getServiceName(cleanServiceId);

  await addActivityLog({
    type: "transaction",
    action: "updated",
    title: cleanName,
    description: "Transaction information updated",
    parentName: serviceName,
    parentId: cleanServiceId,
    recordId: transactionId
  });
}


/* =========================================
   ACTIVATE / DEACTIVATE TRANSACTION
   ========================================= */

export async function setTransactionActiveStatus(
  transactionId,
  isActive
) {
  if (!transactionId) {
    throw new Error("Transaction ID is required.");
  }

  const transactions = await getAllTransactions();

  const transaction = transactions.find(
    (item) => item.id === transactionId
  );

  const transactionName =
    transaction?.name || "Transaction";

  const serviceId =
    transaction?.serviceId || "";

  const serviceName =
    await getServiceName(serviceId);

  const transactionRef = doc(
    db,
    TRANSACTIONS_COLLECTION,
    transactionId
  );

  await updateDoc(transactionRef, {
    isActive,
    updatedAt: Date.now()
  });

  await addActivityLog({
    type: "transaction",
    action: isActive
      ? "activated"
      : "deactivated",
    title: transactionName,
    description: isActive
      ? "Transaction activated"
      : "Transaction deactivated",
    parentName: serviceName,
    parentId: serviceId,
    recordId: transactionId
  });
}


/* =========================================
   DELETE TRANSACTION
   ========================================= */

export async function deleteTransaction(
  transactionId
) {
  if (!transactionId) {
    throw new Error("Transaction ID is required.");
  }

  /*
   * Get transaction information BEFORE
   * deleting it so the Recent Update
   * still knows its name and service.
   */
  const transactions = await getAllTransactions();

  const transaction = transactions.find(
    (item) => item.id === transactionId
  );

  const transactionName =
    transaction?.name || "Transaction";

  const serviceId =
    transaction?.serviceId || "";

  const serviceName =
    await getServiceName(serviceId);

  const transactionRef = doc(
    db,
    TRANSACTIONS_COLLECTION,
    transactionId
  );

  await deleteDoc(transactionRef);

  await addActivityLog({
    type: "transaction",
    action: "deleted",
    title: transactionName,
    description: "Transaction deleted",
    parentName: serviceName,
    parentId: serviceId,
    recordId: transactionId
  });
}