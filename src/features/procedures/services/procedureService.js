import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";

import { db } from "../../../firebase/firebaseConfig";


const PROCEDURES_COLLECTION = "procedure_steps";


/* =========================================
   GET ALL PROCEDURE STEPS
   ========================================= */

export async function getAllProcedureSteps() {

  const proceduresRef = collection(
    db,
    PROCEDURES_COLLECTION
  );


  const snapshot = await getDocs(
    proceduresRef
  );


  const procedures = snapshot.docs.map(
    (document) => ({
      id: document.id,
      ...document.data()
    })
  );


  procedures.sort((a, b) => {

    const transactionCompare =
      (a.transactionId || "").localeCompare(
        b.transactionId || ""
      );


    if (transactionCompare !== 0) {

      return transactionCompare;

    }


    return (
      (a.stepNumber || 0) -
      (b.stepNumber || 0)
    );

  });


  return procedures;
}


/* =========================================
   CREATE ID-FRIENDLY NAME

   Example:

   "Submit Requirements"
   ->
   "submit_requirements"

   "Proceed to Registrar Office"
   ->
   "proceed_to_registrar_office"
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
   GET NEXT PROCEDURE NUMBER

   Example existing IDs:

   submit_requirements_001
   wait_for_verification_002
   claim_document_003

   Next:
   4
   ========================================= */

async function getNextProcedureNumber() {

  const proceduresRef = collection(
    db,
    PROCEDURES_COLLECTION
  );


  const snapshot = await getDocs(
    proceduresRef
  );


  let highestNumber = 0;


  snapshot.docs.forEach((document) => {

    const procedureId =
      document.id;


    /*
     * Find number at the end
     *
     * Example:
     *
     * submit_requirements_001
     *                     ↓
     *                    001
     */

    const match =
      procedureId.match(/_(\d+)$/);


    if (match) {

      const number =
        parseInt(
          match[1],
          10
        );


      if (number > highestNumber) {

        highestNumber =
          number;

      }

    }

  });


  return highestNumber + 1;
}


/* =========================================
   GENERATE PROCEDURE ID
   ========================================= */

async function generateProcedureId(
  instruction
) {

  const idName =
    createIdName(
      instruction
    );


  if (!idName) {

    throw new Error(
      "Unable to generate Procedure ID."
    );

  }


  const nextNumber =
    await getNextProcedureNumber();


  const formattedNumber =
    String(
      nextNumber
    ).padStart(
      3,
      "0"
    );


  return `${idName}_${formattedNumber}`;
}


/* =========================================
   ADD PROCEDURE STEP

   PROCEDURE ID IS AUTOMATIC

   Example:

   Submit Requirements
   ->
   submit_requirements_001
   ========================================= */

export async function addProcedureStep(
  transactionId,
  stepNumber,
  instruction,
  imageCaption = "",
  remoteImageUrl = "",
  localImagePath = "",
  websiteName = "",
  websiteUrl = ""
) {

  const cleanTransactionId =
    transactionId.trim();


  const cleanInstruction =
    instruction.trim();


  const cleanImageCaption =
    imageCaption.trim();


  const cleanRemoteImageUrl =
    remoteImageUrl.trim();


  const cleanLocalImagePath =
    localImagePath.trim();


  const cleanWebsiteName =
    websiteName.trim();


  const cleanWebsiteUrl =
    cleanWebsiteUrlValue(
      websiteUrl
    );


  const cleanStepNumber =
    Number(
      stepNumber
    );


  /* =========================================
     VALIDATION
     ========================================= */

  if (!cleanTransactionId) {

    throw new Error(
      "Transaction ID is required."
    );

  }


  if (
    !Number.isInteger(
      cleanStepNumber
    ) ||
    cleanStepNumber < 1
  ) {

    throw new Error(
      "Step number must be greater than 0."
    );

  }


  if (!cleanInstruction) {

    throw new Error(
      "Procedure instruction is required."
    );

  }


  /*
   * If a website URL is entered,
   * a link name is also required.
   */

  if (
    cleanWebsiteUrl &&
    !cleanWebsiteName
  ) {

    throw new Error(
      "Please enter a link name for the website."
    );

  }


  /*
   * If a link name is entered,
   * a website URL is also required.
   */

  if (
    cleanWebsiteName &&
    !cleanWebsiteUrl
  ) {

    throw new Error(
      "Please enter the website URL."
    );

  }


  /* =========================================
     GENERATE PROCEDURE ID
     ========================================= */

  const procedureId =
    await generateProcedureId(
      cleanInstruction
    );


  const procedureRef = doc(
    db,
    PROCEDURES_COLLECTION,
    procedureId
  );


  /* =========================================
     SAVE TO FIRESTORE
     ========================================= */

  await setDoc(
    procedureRef,
    {

      transactionId:
        cleanTransactionId,

      stepNumber:
        cleanStepNumber,

      instruction:
        cleanInstruction,

      remoteImageUrl:
        cleanRemoteImageUrl,

      localImagePath:
        cleanLocalImagePath,

      imageCaption:
        cleanImageCaption,

      websiteName:
        cleanWebsiteName,

      websiteUrl:
        cleanWebsiteUrl,

      isActive:
        true,

      createdAt:
        Date.now(),

      updatedAt:
        Date.now()

    }
  );


  /* =========================================
     RETURN GENERATED ID
     ========================================= */

  return procedureId;
}


/* =========================================
   UPDATE PROCEDURE STEP

   IMPORTANT:

   Procedure ID DOES NOT CHANGE
   when instruction is edited.

   Example:

   Original ID:
   submit_requirements_001

   New instruction:
   Submit Complete Requirements

   ID remains:
   submit_requirements_001
   ========================================= */

export async function updateProcedureStep(
  procedureId,
  transactionId,
  stepNumber,
  instruction,
  imageCaption = "",
  remoteImageUrl = "",
  localImagePath = "",
  websiteName = "",
  websiteUrl = ""
) {

  const cleanTransactionId =
    transactionId.trim();


  const cleanInstruction =
    instruction.trim();


  const cleanImageCaption =
    imageCaption.trim();


  const cleanRemoteImageUrl =
    remoteImageUrl.trim();


  const cleanLocalImagePath =
    localImagePath.trim();


  const cleanWebsiteName =
    websiteName.trim();


  const cleanWebsiteUrl =
    cleanWebsiteUrlValue(
      websiteUrl
    );


  const cleanStepNumber =
    Number(
      stepNumber
    );


  /* =========================================
     VALIDATION
     ========================================= */

  if (!procedureId) {

    throw new Error(
      "Procedure ID is required."
    );

  }


  if (!cleanTransactionId) {

    throw new Error(
      "Transaction ID is required."
    );

  }


  if (
    !Number.isInteger(
      cleanStepNumber
    ) ||
    cleanStepNumber < 1
  ) {

    throw new Error(
      "Step number must be greater than 0."
    );

  }


  if (!cleanInstruction) {

    throw new Error(
      "Procedure instruction is required."
    );

  }


  /*
   * Website name and URL
   * must be entered together.
   */

  if (
    cleanWebsiteUrl &&
    !cleanWebsiteName
  ) {

    throw new Error(
      "Please enter a link name for the website."
    );

  }


  if (
    cleanWebsiteName &&
    !cleanWebsiteUrl
  ) {

    throw new Error(
      "Please enter the website URL."
    );

  }


  /* =========================================
     UPDATE FIRESTORE
     ========================================= */

  const procedureRef = doc(
    db,
    PROCEDURES_COLLECTION,
    procedureId
  );


  await updateDoc(
    procedureRef,
    {

      transactionId:
        cleanTransactionId,

      stepNumber:
        cleanStepNumber,

      instruction:
        cleanInstruction,

      remoteImageUrl:
        cleanRemoteImageUrl,

      localImagePath:
        cleanLocalImagePath,

      imageCaption:
        cleanImageCaption,

      websiteName:
        cleanWebsiteName,

      websiteUrl:
        cleanWebsiteUrl,

      updatedAt:
        Date.now()

    }
  );
}


/* =========================================
   ACTIVATE / DEACTIVATE PROCEDURE STEP
   ========================================= */

export async function setProcedureStepActiveStatus(
  procedureId,
  isActive
) {

  if (!procedureId) {

    throw new Error(
      "Procedure ID is required."
    );

  }


  const procedureRef = doc(
    db,
    PROCEDURES_COLLECTION,
    procedureId
  );


  await updateDoc(
    procedureRef,
    {

      isActive:
        isActive,

      updatedAt:
        Date.now()

    }
  );
}


/* =========================================
   DELETE PROCEDURE STEP
   ========================================= */

export async function deleteProcedureStep(
  procedureId
) {

  if (!procedureId) {

    throw new Error(
      "Procedure ID is required."
    );

  }


  const procedureRef = doc(
    db,
    PROCEDURES_COLLECTION,
    procedureId
  );


  await deleteDoc(
    procedureRef
  );
}


/* =========================================
   OPTIONAL WEBSITE URL VALIDATION
   ========================================= */

function cleanWebsiteUrlValue(
  websiteUrl = ""
) {

  const cleanUrl =
    websiteUrl.trim();


  /*
   * Website URL is optional.
   */

  if (!cleanUrl) {

    return "";

  }


  /*
   * Only HTTP / HTTPS links
   * are accepted.
   */

  if (
    !cleanUrl.startsWith("https://") &&
    !cleanUrl.startsWith("http://")
  ) {

    throw new Error(
      "Website URL must start with http:// or https://"
    );

  }


  return cleanUrl;
}