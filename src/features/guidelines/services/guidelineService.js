import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc
} from "firebase/firestore";

import { db } from "../../../firebase/firebaseConfig";


const GUIDELINES_COLLECTION =
  "department_guidelines";


/* =========================================
   GET ALL GUIDELINES
   ========================================= */

export async function getAllGuidelines() {

  const guidelinesRef = collection(
    db,
    GUIDELINES_COLLECTION
  );

  const snapshot = await getDocs(
    guidelinesRef
  );


  const guidelines = snapshot.docs.map(
    (document) => ({
      id: document.id,
      ...document.data()
    })
  );


  guidelines.sort((a, b) => {

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


  return guidelines;
}


/* =========================================
   CREATE ID-FRIENDLY NAME

   Example:
   "Bring Original Documents"
   ->
   "bring_original_documents"
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

    // Remove underscores at beginning/end
    .replace(/^_+|_+$/g, "");
}


/* =========================================
   GET NEXT GUIDELINE NUMBER

   Example existing:
   bring_original_documents_001
   observe_office_hours_002

   Next:
   3
   ========================================= */

async function getNextGuidelineNumber() {

  const guidelinesRef = collection(
    db,
    GUIDELINES_COLLECTION
  );


  const snapshot = await getDocs(
    guidelinesRef
  );


  let highestNumber = 0;


  snapshot.docs.forEach((document) => {

    const guidelineId =
      document.id;


    const match =
      guidelineId.match(/_(\d+)$/);


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
   GENERATE GUIDELINE ID
   ========================================= */

async function generateGuidelineId(
  guidelineText
) {

  const idName =
    createIdName(guidelineText);


  if (!idName) {

    throw new Error(
      "Unable to generate Guideline ID."
    );

  }


  const nextNumber =
    await getNextGuidelineNumber();


  const formattedNumber =
    String(nextNumber).padStart(
      3,
      "0"
    );


  return `${idName}_${formattedNumber}`;
}


/* =========================================
   ADD GUIDELINE

   ID IS GENERATED AUTOMATICALLY
   ========================================= */

export async function addGuideline(
  transactionId,
  guidelineText,
  displayOrder
) {

  const cleanTransactionId =
    transactionId.trim();

  const cleanGuidelineText =
    guidelineText.trim();

  const cleanDisplayOrder =
    Number(displayOrder);


  /* VALIDATION */

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


  /* GENERATE ID */

  const guidelineId =
    await generateGuidelineId(
      cleanGuidelineText
    );


  const guidelineRef = doc(
    db,
    GUIDELINES_COLLECTION,
    guidelineId
  );


  /* SAVE */

  const currentTime =
    Date.now();


  await setDoc(
    guidelineRef,
    {

      transactionId:
        cleanTransactionId,

      guidelineText:
        cleanGuidelineText,

      displayOrder:
        cleanDisplayOrder,

      isActive:
        true,

      createdAt:
        currentTime,

      updatedAt:
        currentTime

    }
  );


  return guidelineId;
}


/* =========================================
   UPDATE GUIDELINE

   IMPORTANT:
   EXISTING ID DOES NOT CHANGE
   ========================================= */

export async function updateGuideline(
  guidelineId,
  transactionId,
  guidelineText,
  displayOrder
) {

  const cleanTransactionId =
    transactionId.trim();

  const cleanGuidelineText =
    guidelineText.trim();

  const cleanDisplayOrder =
    Number(displayOrder);


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


  await updateDoc(
    guidelineRef,
    {

      transactionId:
        cleanTransactionId,

      guidelineText:
        cleanGuidelineText,

      displayOrder:
        cleanDisplayOrder,

      updatedAt:
        Date.now()

    }
  );
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


  const guidelineRef = doc(
    db,
    GUIDELINES_COLLECTION,
    guidelineId
  );


  await updateDoc(
    guidelineRef,
    {

      isActive:
        isActive,

      updatedAt:
        Date.now()

    }
  );
}