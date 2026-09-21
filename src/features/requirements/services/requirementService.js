import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc
} from "firebase/firestore";

import { db } from "../../../firebase/firebaseConfig";

const REQUIREMENTS_COLLECTION = "requirements";
const TRANSACTIONS_COLLECTION = "transactions";


/* =========================================
   GET ALL REQUIREMENTS
   ========================================= */

export async function getAllRequirements() {
  const requirementsRef = collection(
    db,
    REQUIREMENTS_COLLECTION
  );

  const snapshot = await getDocs(requirementsRef);

  const requirements = snapshot.docs.map(
    (document) => ({
      id: document.id,
      ...document.data()
    })
  );

  requirements.sort((a, b) => {
    const transactionCompare =
      (a.transactionId || "").localeCompare(
        b.transactionId || ""
      );

    if (transactionCompare !== 0) {
      return transactionCompare;
    }

    return (
      (a.displayOrder || 0) -
      (b.displayOrder || 0)
    );
  });

  return requirements;
}


/* =========================================
   GET ACTIVE TRANSACTIONS
   Used for Transaction dropdown
   ========================================= */

export async function getActiveTransactions() {
  const transactionsRef = collection(
    db,
    TRANSACTIONS_COLLECTION
  );

  const snapshot = await getDocs(
    transactionsRef
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
    (a.name || "").localeCompare(
      b.name || ""
    )
  );

  return transactions;
}


/* =========================================
   ADD REQUIREMENT
   ========================================= */

export async function addRequirement(
  requirementId,
  transactionId,
  requirementText,
  displayOrder
) {
  const cleanId = requirementId.trim();
  const cleanTransactionId =
    transactionId.trim();
  const cleanRequirementText =
    requirementText.trim();

  const cleanDisplayOrder =
    Number(displayOrder);


  if (!cleanId) {
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
    cleanId
  );


  // Prevent duplicate Requirement ID
  const existingRequirement =
    await getDoc(requirementRef);


  if (existingRequirement.exists()) {
    throw new Error(
      "A requirement with this ID already exists."
    );
  }


  await setDoc(requirementRef, {
    transactionId:
      cleanTransactionId,

    requirementText:
      cleanRequirementText,

    displayOrder:
      cleanDisplayOrder,

    isActive: true,

    updatedAt:
      Date.now()
  });
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
  const cleanTransactionId =
    transactionId.trim();

  const cleanRequirementText =
    requirementText.trim();

  const cleanDisplayOrder =
    Number(displayOrder);


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
    transactionId:
      cleanTransactionId,

    requirementText:
      cleanRequirementText,

    displayOrder:
      cleanDisplayOrder,

    updatedAt:
      Date.now()
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


  const requirementRef = doc(
    db,
    REQUIREMENTS_COLLECTION,
    requirementId
  );


  await updateDoc(requirementRef, {
    isActive: isActive,
    updatedAt: Date.now()
  });
}