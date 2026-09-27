import {
  collection,
  doc,
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
   CREATE ID-FRIENDLY NAME

   Example:
   "Getting Prospectus"
   becomes:
   "getting_prospectus"
   ========================================= */

function createIdName(name) {
  return name
    .trim()
    .toLowerCase()

    // Remove special characters
    .replace(/[^a-z0-9\s_-]/g, "")

    // Spaces become underscore
    .replace(/\s+/g, "_")

    // Multiple underscores become one
    .replace(/_+/g, "_")

    // Remove underscore at beginning/end
    .replace(/^_+|_+$/g, "");
}


/* =========================================
   GET NEXT TRANSACTION NUMBER

   Example:
   Existing:
   getting_prospectus_001
   updating_prospectus_002

   Next transaction:
   request_tor_003
   ========================================= */

async function getNextTransactionNumber() {
  const transactionsRef = collection(
    db,
    TRANSACTIONS_COLLECTION
  );

  const snapshot = await getDocs(transactionsRef);

  let highestNumber = 0;

  snapshot.docs.forEach((document) => {
    const transactionId = document.id;

    // Get last 3+ digit number from ID
    const match = transactionId.match(/_(\d+)$/);

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

   Example:
   Name: Getting Prospectus
   Number: 1

   Result:
   getting_prospectus_001
   ========================================= */

async function generateTransactionId(name) {
  const idName = createIdName(name);

  if (!idName) {
    throw new Error(
      "Unable to generate Transaction ID from the transaction name."
    );
  }

  const nextNumber =
    await getNextTransactionNumber();

  const formattedNumber = String(
    nextNumber
  ).padStart(3, "0");

  return `${idName}_${formattedNumber}`;
}


/* =========================================
   ADD TRANSACTION
   AUTO-GENERATED TRANSACTION ID
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
    throw new Error(
      "Please select a service."
    );
  }

  if (!cleanName) {
    throw new Error(
      "Transaction name is required."
    );
  }


  /* =========================================
     AUTO GENERATE TRANSACTION ID
     ========================================= */

  const transactionId =
    await generateTransactionId(cleanName);


  const transactionRef = doc(
    db,
    TRANSACTIONS_COLLECTION,
    transactionId
  );


  /* =========================================
     SAVE TO FIRESTORE
     ========================================= */

  await setDoc(transactionRef, {
    serviceId: cleanServiceId,

    name: cleanName,

    description: cleanDescription,

    officeName: cleanOfficeName,

    officeSchedule: cleanOfficeSchedule,

    isActive: true,

    createdAt: Date.now(),

    updatedAt: Date.now()
  });


  /* =========================================
     RETURN GENERATED ID
     ========================================= */

  return transactionId;
}


/* =========================================
   UPDATE TRANSACTION

   IMPORTANT:
   The Transaction ID does NOT change
   when the transaction name is edited.

   Example:

   Original:
   getting_prospectus_001

   Name changed to:
   Request Prospectus

   ID remains:
   getting_prospectus_001

   This protects Requirements,
   Procedures, Notifications, etc.
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
    throw new Error(
      "Transaction ID is required."
    );
  }

  if (!serviceId.trim()) {
    throw new Error(
      "Please select a service."
    );
  }

  if (!name.trim()) {
    throw new Error(
      "Transaction name is required."
    );
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
    throw new Error(
      "Transaction ID is required."
    );
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