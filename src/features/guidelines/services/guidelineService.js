import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "firebase/firestore";

import { db } from "../../../firebase/firebaseConfig";
import { addActivityLog } from "../../dashboard/services/activityLogService";

const GUIDELINES_COLLECTION = "department_guidelines";
const TRANSACTIONS_COLLECTION = "transactions";


/* =========================================
   GET ALL GUIDELINES
   ========================================= */

export async function getAllGuidelines() {
  const snapshot = await getDocs(
    collection(db, GUIDELINES_COLLECTION)
  );

  const guidelines = snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data()
  }));

  guidelines.sort((a, b) => {
    const transactionCompare =
      (a.transactionId || "").localeCompare(
        b.transactionId || ""
      );

    if (transactionCompare !== 0) {
      return transactionCompare;
    }

    return (a.displayOrder || 0) - (b.displayOrder || 0);
  });

  return guidelines;
}


/* =========================================
   GET TRANSACTION NAME
   For Recent Updates
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
   GET NEXT GUIDELINE NUMBER
   ========================================= */

async function getNextGuidelineNumber() {
  const snapshot = await getDocs(
    collection(db, GUIDELINES_COLLECTION)
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
   GENERATE GUIDELINE ID
   ========================================= */

async function generateGuidelineId(guidelineText) {
  const idName = createIdName(guidelineText);

  if (!idName) {
    throw new Error(
      "Unable to generate Guideline ID."
    );
  }

  const nextNumber = await getNextGuidelineNumber();
  const formattedNumber = String(nextNumber).padStart(3, "0");

  return `${idName}_${formattedNumber}`;
}


/* =========================================
   ADD GUIDELINE
   ========================================= */

export async function addGuideline(
  transactionId,
  guidelineText,
  displayOrder
) {
  const cleanTransactionId = transactionId.trim();
  const cleanGuidelineText = guidelineText.trim();
  const cleanDisplayOrder = Number(displayOrder);

  if (!cleanTransactionId) {
    throw new Error(
      "Transaction ID is required."
    );
  }

  if (!cleanGuidelineText) {
    throw new Error(
      "Guideline is required."
    );
  }

  if (
    !Number.isInteger(cleanDisplayOrder) ||
    cleanDisplayOrder < 1
  ) {
    throw new Error(
      "Display order must be greater than 0."
    );
  }

  const guidelineId =
    await generateGuidelineId(cleanGuidelineText);

  const guidelineRef = doc(
    db,
    GUIDELINES_COLLECTION,
    guidelineId
  );

  await setDoc(guidelineRef, {
    transactionId: cleanTransactionId,
    guidelineText: cleanGuidelineText,
    displayOrder: cleanDisplayOrder,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  /* ACTIVITY LOG */

  const transactionName =
    await getTransactionName(cleanTransactionId);

  await addActivityLog({
    type: "guideline",
    action: "added",
    title: cleanGuidelineText,
    description: "New guideline added",
    parentName: transactionName,
    parentId: cleanTransactionId,
    recordId: guidelineId
  });

  return guidelineId;
}


/* =========================================
   UPDATE GUIDELINE
   ========================================= */

export async function updateGuideline(
  guidelineId,
  transactionId,
  guidelineText,
  displayOrder
) {
  const cleanTransactionId = transactionId.trim();
  const cleanGuidelineText = guidelineText.trim();
  const cleanDisplayOrder = Number(displayOrder);

  if (!guidelineId) {
    throw new Error(
      "Guideline ID is required."
    );
  }

  if (!cleanTransactionId) {
    throw new Error(
      "Transaction ID is required."
    );
  }

  if (!cleanGuidelineText) {
    throw new Error(
      "Guideline is required."
    );
  }

  if (
    !Number.isInteger(cleanDisplayOrder) ||
    cleanDisplayOrder < 1
  ) {
    throw new Error(
      "Display order must be greater than 0."
    );
  }

  const guidelineRef = doc(
    db,
    GUIDELINES_COLLECTION,
    guidelineId
  );

  await updateDoc(guidelineRef, {
    transactionId: cleanTransactionId,
    guidelineText: cleanGuidelineText,
    displayOrder: cleanDisplayOrder,
    updatedAt: serverTimestamp()
  });

  /* ACTIVITY LOG */

  const transactionName =
    await getTransactionName(cleanTransactionId);

  await addActivityLog({
    type: "guideline",
    action: "updated",
    title: cleanGuidelineText,
    description: "Guideline information updated",
    parentName: transactionName,
    parentId: cleanTransactionId,
    recordId: guidelineId
  });
}


/* =========================================
   ACTIVATE / DEACTIVATE GUIDELINE
   ========================================= */

export async function setGuidelineActiveStatus(
  guidelineId,
  isActive
) {
  if (!guidelineId) {
    throw new Error(
      "Guideline ID is required."
    );
  }

  /*
   * Get guideline information first.
   */
  const guidelines = await getAllGuidelines();

  const guideline = guidelines.find(
    (item) => item.id === guidelineId
  );

  const guidelineName =
    guideline?.guidelineText || "Guideline";

  const transactionId =
    guideline?.transactionId || "";

  const transactionName =
    await getTransactionName(transactionId);

  const guidelineRef = doc(
    db,
    GUIDELINES_COLLECTION,
    guidelineId
  );

  await updateDoc(guidelineRef, {
    isActive,
    updatedAt: serverTimestamp()
  });

  /* ACTIVITY LOG */

  await addActivityLog({
    type: "guideline",
    action: isActive
      ? "activated"
      : "deactivated",
    title: guidelineName,
    description: isActive
      ? "Guideline activated"
      : "Guideline deactivated",
    parentName: transactionName,
    parentId: transactionId,
    recordId: guidelineId
  });
}


/* =========================================
   DELETE GUIDELINE
   ========================================= */

export async function deleteGuideline(guidelineId) {
  if (!guidelineId) {
    throw new Error(
      "Guideline ID is required."
    );
  }

  /*
   * Get information BEFORE deletion.
   */
  const guidelines = await getAllGuidelines();

  const guideline = guidelines.find(
    (item) => item.id === guidelineId
  );

  const guidelineName =
    guideline?.guidelineText || "Guideline";

  const transactionId =
    guideline?.transactionId || "";

  const transactionName =
    await getTransactionName(transactionId);

  const guidelineRef = doc(
    db,
    GUIDELINES_COLLECTION,
    guidelineId
  );

  await deleteDoc(guidelineRef);

  /* ACTIVITY LOG */

  await addActivityLog({
    type: "guideline",
    action: "deleted",
    title: guidelineName,
    description: "Guideline deleted",
    parentName: transactionName,
    parentId: transactionId,
    recordId: guidelineId
  });
}