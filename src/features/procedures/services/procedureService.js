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

const PROCEDURES_COLLECTION = "procedure_steps";
const TRANSACTIONS_COLLECTION = "transactions";


/* =========================================
   GET ALL PROCEDURE STEPS
   ========================================= */

export async function getAllProcedureSteps() {
  const snapshot = await getDocs(
    collection(db, PROCEDURES_COLLECTION)
  );

  const procedures = snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data()
  }));

  procedures.sort((a, b) => {
    const transactionCompare =
      (a.transactionId || "").localeCompare(
        b.transactionId || ""
      );

    if (transactionCompare !== 0) {
      return transactionCompare;
    }

    return (a.stepNumber || 0) - (b.stepNumber || 0);
  });

  return procedures;
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
   GET NEXT PROCEDURE NUMBER
   ========================================= */

async function getNextProcedureNumber() {
  const snapshot = await getDocs(
    collection(db, PROCEDURES_COLLECTION)
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
   GENERATE PROCEDURE ID
   ========================================= */

async function generateProcedureId(instruction) {
  const idName = createIdName(instruction);

  if (!idName) {
    throw new Error(
      "Unable to generate Procedure ID."
    );
  }

  const nextNumber = await getNextProcedureNumber();
  const formattedNumber = String(nextNumber).padStart(3, "0");

  return `${idName}_${formattedNumber}`;
}


/* =========================================
   ADD PROCEDURE STEP
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
  const cleanTransactionId = transactionId.trim();
  const cleanInstruction = instruction.trim();
  const cleanImageCaption = imageCaption.trim();
  const cleanRemoteImageUrl = remoteImageUrl.trim();
  const cleanLocalImagePath = localImagePath.trim();
  const cleanWebsiteName = websiteName.trim();
  const cleanWebsiteUrl = cleanWebsiteUrlValue(websiteUrl);
  const cleanStepNumber = Number(stepNumber);

  if (!cleanTransactionId) {
    throw new Error(
      "Transaction ID is required."
    );
  }

  if (
    !Number.isInteger(cleanStepNumber) ||
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

  if (cleanWebsiteUrl && !cleanWebsiteName) {
    throw new Error(
      "Please enter a link name for the website."
    );
  }

  if (cleanWebsiteName && !cleanWebsiteUrl) {
    throw new Error(
      "Please enter the website URL."
    );
  }

  const procedureId =
    await generateProcedureId(cleanInstruction);

  const procedureRef = doc(
    db,
    PROCEDURES_COLLECTION,
    procedureId
  );

  const currentTime = Date.now();

  await setDoc(procedureRef, {
    transactionId: cleanTransactionId,
    stepNumber: cleanStepNumber,
    instruction: cleanInstruction,
    remoteImageUrl: cleanRemoteImageUrl,
    localImagePath: cleanLocalImagePath,
    imageCaption: cleanImageCaption,
    websiteName: cleanWebsiteName,
    websiteUrl: cleanWebsiteUrl,
    isActive: true,
    createdAt: currentTime,
    updatedAt: currentTime
  });

  /* ACTIVITY LOG */

  const transactionName =
    await getTransactionName(cleanTransactionId);

  await addActivityLog({
    type: "procedure",
    action: "added",
    title: `Step ${cleanStepNumber}: ${cleanInstruction}`,
    description: "New procedure step added",
    parentName: transactionName,
    parentId: cleanTransactionId,
    recordId: procedureId
  });

  return procedureId;
}


/* =========================================
   UPDATE PROCEDURE STEP
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
  const cleanTransactionId = transactionId.trim();
  const cleanInstruction = instruction.trim();
  const cleanImageCaption = imageCaption.trim();
  const cleanRemoteImageUrl = remoteImageUrl.trim();
  const cleanLocalImagePath = localImagePath.trim();
  const cleanWebsiteName = websiteName.trim();
  const cleanWebsiteUrl = cleanWebsiteUrlValue(websiteUrl);
  const cleanStepNumber = Number(stepNumber);

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
    !Number.isInteger(cleanStepNumber) ||
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

  if (cleanWebsiteUrl && !cleanWebsiteName) {
    throw new Error(
      "Please enter a link name for the website."
    );
  }

  if (cleanWebsiteName && !cleanWebsiteUrl) {
    throw new Error(
      "Please enter the website URL."
    );
  }

  const procedureRef = doc(
    db,
    PROCEDURES_COLLECTION,
    procedureId
  );

  await updateDoc(procedureRef, {
    transactionId: cleanTransactionId,
    stepNumber: cleanStepNumber,
    instruction: cleanInstruction,
    remoteImageUrl: cleanRemoteImageUrl,
    localImagePath: cleanLocalImagePath,
    imageCaption: cleanImageCaption,
    websiteName: cleanWebsiteName,
    websiteUrl: cleanWebsiteUrl,
    updatedAt: Date.now()
  });

  /* ACTIVITY LOG */

  const transactionName =
    await getTransactionName(cleanTransactionId);

  await addActivityLog({
    type: "procedure",
    action: "updated",
    title: `Step ${cleanStepNumber}: ${cleanInstruction}`,
    description: "Procedure step updated",
    parentName: transactionName,
    parentId: cleanTransactionId,
    recordId: procedureId
  });
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

  /*
   * Get procedure information first so
   * Recent Updates knows the instruction,
   * step number and transaction.
   */
  const procedures =
    await getAllProcedureSteps();

  const procedure = procedures.find(
    (item) => item.id === procedureId
  );

  const instruction =
    procedure?.instruction || "Procedure Step";

  const stepNumber =
    procedure?.stepNumber || "";

  const transactionId =
    procedure?.transactionId || "";

  const transactionName =
    await getTransactionName(transactionId);

  const procedureRef = doc(
    db,
    PROCEDURES_COLLECTION,
    procedureId
  );

  await updateDoc(procedureRef, {
    isActive,
    updatedAt: Date.now()
  });

  /* ACTIVITY LOG */

  await addActivityLog({
    type: "procedure",
    action: isActive
      ? "activated"
      : "deactivated",
    title: stepNumber
      ? `Step ${stepNumber}: ${instruction}`
      : instruction,
    description: isActive
      ? "Procedure step activated"
      : "Procedure step deactivated",
    parentName: transactionName,
    parentId: transactionId,
    recordId: procedureId
  });
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

  /*
   * Get procedure information BEFORE
   * deleting the Firestore document.
   */
  const procedures =
    await getAllProcedureSteps();

  const procedure = procedures.find(
    (item) => item.id === procedureId
  );

  const instruction =
    procedure?.instruction || "Procedure Step";

  const stepNumber =
    procedure?.stepNumber || "";

  const transactionId =
    procedure?.transactionId || "";

  const transactionName =
    await getTransactionName(transactionId);

  const procedureRef = doc(
    db,
    PROCEDURES_COLLECTION,
    procedureId
  );

  await deleteDoc(procedureRef);

  /* ACTIVITY LOG */

  await addActivityLog({
    type: "procedure",
    action: "deleted",
    title: stepNumber
      ? `Step ${stepNumber}: ${instruction}`
      : instruction,
    description: "Procedure step deleted",
    parentName: transactionName,
    parentId: transactionId,
    recordId: procedureId
  });
}


/* =========================================
   OPTIONAL WEBSITE URL VALIDATION
   ========================================= */

function cleanWebsiteUrlValue(
  websiteUrl = ""
) {
  const cleanUrl = websiteUrl.trim();

  if (!cleanUrl) {
    return "";
  }

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