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

const REQUIREMENTS_COLLECTION = "requirements";
const TRANSACTIONS_COLLECTION = "transactions";


/* =========================================
   GET ALL REQUIREMENTS
   ========================================= */

export async function getAllRequirements() {
  const snapshot = await getDocs(
    collection(db, REQUIREMENTS_COLLECTION)
  );

  const requirements = snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data()
  }));

  requirements.sort((a, b) => {
    const transactionCompare =
      (a.transactionId || "").localeCompare(
        b.transactionId || ""
      );

    if (transactionCompare !== 0) {
      return transactionCompare;
    }

    return (a.displayOrder || 0) - (b.displayOrder || 0);
  });

  return requirements;
}


/* =========================================
   GET ACTIVE TRANSACTIONS
   ========================================= */

export async function getActiveTransactions() {
  const snapshot = await getDocs(
    collection(db, TRANSACTIONS_COLLECTION)
  );

  const transactions = snapshot.docs
    .map((document) => ({
      id: document.id,
      ...document.data()
    }))
    .filter(
      (transaction) =>
        transaction.isActive === true
    );

  transactions.sort((a, b) =>
    (a.name || "").localeCompare(b.name || "")
  );

  return transactions;
}


/* =========================================
   GET TRANSACTION NAME
   Used for Recent Updates
   ========================================= */

async function getTransactionName(transactionId) {
  if (!transactionId) {
    return "";
  }

  const snapshot = await getDocs(
    collection(db, TRANSACTIONS_COLLECTION)
  );

  const transaction = snapshot.docs.find(
    (document) => document.id === transactionId
  );

  return transaction?.data()?.name || "";
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
   GET NEXT REQUIREMENT NUMBER
   ========================================= */

async function getNextRequirementNumber() {
  const snapshot = await getDocs(
    collection(db, REQUIREMENTS_COLLECTION)
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
   GENERATE REQUIREMENT ID
   ========================================= */

async function generateRequirementId(requirementText) {
  const idName = createIdName(requirementText);

  if (!idName) {
    throw new Error(
      "Unable to generate Requirement ID."
    );
  }

  const nextNumber = await getNextRequirementNumber();

  const formattedNumber =
    String(nextNumber).padStart(3, "0");

  return `${idName}_${formattedNumber}`;
}


/* =========================================
   ADD REQUIREMENT
   ========================================= */

export async function addRequirement(
  transactionId,
  requirementText,
  displayOrder
) {
  const cleanTransactionId = transactionId.trim();
  const cleanRequirementText = requirementText.trim();
  const cleanDisplayOrder = Number(displayOrder);

  if (!cleanTransactionId) {
    throw new Error(
      "Please select a transaction."
    );
  }

  if (!cleanRequirementText) {
    throw new Error(
      "Requirement is required."
    );
  }

  if (
    !Number.isInteger(cleanDisplayOrder) ||
    cleanDisplayOrder < 1
  ) {
    throw new Error(
      "Display order must be a number greater than 0."
    );
  }

  const requirementId =
    await generateRequirementId(
      cleanRequirementText
    );

  const requirementRef = doc(
    db,
    REQUIREMENTS_COLLECTION,
    requirementId
  );

  const currentTime = Date.now();

  await setDoc(requirementRef, {
    transactionId: cleanTransactionId,
    requirementText: cleanRequirementText,
    displayOrder: cleanDisplayOrder,
    isActive: true,
    createdAt: currentTime,
    updatedAt: currentTime
  });

  /* ACTIVITY LOG */

  const transactionName =
    await getTransactionName(cleanTransactionId);

  await addActivityLog({
    type: "requirement",
    action: "added",
    title: cleanRequirementText,
    description: "New requirement added",
    parentName: transactionName,
    parentId: cleanTransactionId,
    recordId: requirementId
  });

  return requirementId;
}


/* =========================================
   UPDATE REQUIREMENT
   ========================================= */

export async function updateRequirement(
  requirementId,
  transactionId,
  requirementText,
  displayOrder
) {
  const cleanTransactionId = transactionId.trim();
  const cleanRequirementText = requirementText.trim();
  const cleanDisplayOrder = Number(displayOrder);

  if (!requirementId) {
    throw new Error(
      "Requirement ID is required."
    );
  }

  if (!cleanTransactionId) {
    throw new Error(
      "Please select a transaction."
    );
  }

  if (!cleanRequirementText) {
    throw new Error(
      "Requirement is required."
    );
  }

  if (
    !Number.isInteger(cleanDisplayOrder) ||
    cleanDisplayOrder < 1
  ) {
    throw new Error(
      "Display order must be a number greater than 0."
    );
  }

  const requirementRef = doc(
    db,
    REQUIREMENTS_COLLECTION,
    requirementId
  );

  await updateDoc(requirementRef, {
    transactionId: cleanTransactionId,
    requirementText: cleanRequirementText,
    displayOrder: cleanDisplayOrder,
    updatedAt: Date.now()
  });

  /* ACTIVITY LOG */

  const transactionName =
    await getTransactionName(cleanTransactionId);

  await addActivityLog({
    type: "requirement",
    action: "updated",
    title: cleanRequirementText,
    description: "Requirement information updated",
    parentName: transactionName,
    parentId: cleanTransactionId,
    recordId: requirementId
  });
}


/* =========================================
   ACTIVATE / DEACTIVATE REQUIREMENT
   ========================================= */

export async function setRequirementActiveStatus(
  requirementId,
  isActive
) {
  if (!requirementId) {
    throw new Error(
      "Requirement ID is required."
    );
  }

  /* Get requirement before updating */
  const requirements =
    await getAllRequirements();

  const requirement = requirements.find(
    (item) => item.id === requirementId
  );

  const requirementName =
    requirement?.requirementText || "Requirement";

  const transactionId =
    requirement?.transactionId || "";

  const transactionName =
    await getTransactionName(transactionId);

  const requirementRef = doc(
    db,
    REQUIREMENTS_COLLECTION,
    requirementId
  );

  await updateDoc(requirementRef, {
    isActive,
    updatedAt: Date.now()
  });

  /* ACTIVITY LOG */

  await addActivityLog({
    type: "requirement",
    action: isActive
      ? "activated"
      : "deactivated",
    title: requirementName,
    description: isActive
      ? "Requirement activated"
      : "Requirement deactivated",
    parentName: transactionName,
    parentId: transactionId,
    recordId: requirementId
  });
}


/* =========================================
   DELETE REQUIREMENT
   ========================================= */

export async function deleteRequirement(
  requirementId
) {
  if (!requirementId) {
    throw new Error(
      "Requirement ID is required."
    );
  }

  /*
   * Get information BEFORE deletion.
   */
  const requirements =
    await getAllRequirements();

  const requirement = requirements.find(
    (item) => item.id === requirementId
  );

  const requirementName =
    requirement?.requirementText || "Requirement";

  const transactionId =
    requirement?.transactionId || "";

  const transactionName =
    await getTransactionName(transactionId);

  const requirementRef = doc(
    db,
    REQUIREMENTS_COLLECTION,
    requirementId
  );

  await deleteDoc(requirementRef);

  /* ACTIVITY LOG */

  await addActivityLog({
    type: "requirement",
    action: "deleted",
    title: requirementName,
    description: "Requirement deleted",
    parentName: transactionName,
    parentId: transactionId,
    recordId: requirementId
  });
}