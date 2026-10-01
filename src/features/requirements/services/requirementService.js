import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc
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

  const snapshot = await getDocs(
    requirementsRef
  );

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
   CREATE ID-FRIENDLY NAME

   Example:

   "School ID"
   ->
   "school_id"

   "Certificate of Enrollment"
   ->
   "certificate_of_enrollment"
   ========================================= */

function createIdName(name) {

  return name
    .trim()
    .toLowerCase()

    // Remove special characters
    .replace(/[^a-z0-9\s_-]/g, "")

    // Spaces become underscores
    .replace(/\s+/g, "_")

    // Multiple underscores become one
    .replace(/_+/g, "_")

    // Remove underscore at beginning/end
    .replace(/^_+|_+$/g, "");
}


/* =========================================
   GET NEXT REQUIREMENT NUMBER

   Example existing IDs:

   school_id_001
   registration_form_002
   valid_id_003

   Next number:
   4
   ========================================= */

async function getNextRequirementNumber() {

  const requirementsRef = collection(
    db,
    REQUIREMENTS_COLLECTION
  );


  const snapshot = await getDocs(
    requirementsRef
  );


  let highestNumber = 0;


  snapshot.docs.forEach((document) => {

    const requirementId =
      document.id;


    /*
     * Find the number at the end.
     *
     * Example:
     *
     * school_id_001
     *             ↓
     *             001
     */

    const match =
      requirementId.match(/_(\d+)$/);


    if (match) {

      const number =
        parseInt(match[1], 10);


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

async function generateRequirementId(
  requirementText
) {

  const idName =
    createIdName(requirementText);


  if (!idName) {

    throw new Error(
      "Unable to generate Requirement ID."
    );

  }


  const nextNumber =
    await getNextRequirementNumber();


  const formattedNumber =
    String(nextNumber).padStart(
      3,
      "0"
    );


  return `${idName}_${formattedNumber}`;
}


/* =========================================
   ADD REQUIREMENT

   NO MANUAL REQUIREMENT ID

   Example:

   School ID
   ->
   school_id_001
   ========================================= */

export async function addRequirement(
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


  /* VALIDATION */

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


  /* =========================================
     GENERATE ID
     ========================================= */

  const requirementId =
    await generateRequirementId(
      cleanRequirementText
    );


  const requirementRef = doc(
    db,
    REQUIREMENTS_COLLECTION,
    requirementId
  );


  /* =========================================
     SAVE REQUIREMENT
     ========================================= */

  await setDoc(
    requirementRef,
    {

      transactionId:
        cleanTransactionId,

      requirementText:
        cleanRequirementText,

      displayOrder:
        cleanDisplayOrder,

      isActive:
        true,

      createdAt:
        Date.now(),

      updatedAt:
        Date.now()

    }
  );


  /* RETURN GENERATED ID */

  return requirementId;
}


/* =========================================
   UPDATE REQUIREMENT

   IMPORTANT:

   Requirement ID DOES NOT CHANGE
   when Requirement Text is edited.

   Example:

   Original:
   school_id_001

   Change text:
   Valid School ID

   ID stays:
   school_id_001
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


  await updateDoc(
    requirementRef,
    {

      transactionId:
        cleanTransactionId,

      requirementText:
        cleanRequirementText,

      displayOrder:
        cleanDisplayOrder,

      updatedAt:
        Date.now()

    }
  );
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


  await updateDoc(
    requirementRef,
    {

      isActive:
        isActive,

      updatedAt:
        Date.now()

    }
  );
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


  const requirementRef = doc(
    db,
    REQUIREMENTS_COLLECTION,
    requirementId
  );


  await deleteDoc(
    requirementRef
  );
}