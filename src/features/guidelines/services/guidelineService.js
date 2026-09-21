import {
  collection,
  doc,
  getDoc,
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
   ADD GUIDELINE
   ========================================= */

export async function addGuideline(
  guidelineId,
  transactionId,
  guidelineText,
  displayOrder
) {

  const cleanId =
    guidelineId.trim();

  const cleanTransactionId =
    transactionId.trim();

  const cleanGuidelineText =
    guidelineText.trim();

  const cleanDisplayOrder =
    Number(displayOrder);


  if (!cleanId) {

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
    cleanId
  );


  /*
   * Check first so an existing guideline
   * will not be overwritten accidentally.
   */

  const existingGuideline =
    await getDoc(guidelineRef);


  if (existingGuideline.exists()) {

    throw new Error(
      "A guideline with this ID already exists."
    );

  }


  await setDoc(guidelineRef, {

    transactionId:
      cleanTransactionId,

    guidelineText:
      cleanGuidelineText,

    displayOrder:
      cleanDisplayOrder,

    isActive: true,

    updatedAt:
      Date.now()

  });

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


  await updateDoc(guidelineRef, {

    transactionId:
      cleanTransactionId,

    guidelineText:
      cleanGuidelineText,

    displayOrder:
      cleanDisplayOrder,

    updatedAt:
      Date.now()

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


  const guidelineRef = doc(
    db,
    GUIDELINES_COLLECTION,
    guidelineId
  );


  await updateDoc(guidelineRef, {

    isActive: isActive,

    updatedAt:
      Date.now()

  });

}