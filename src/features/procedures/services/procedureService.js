import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc
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
   ADD PROCEDURE STEP
   ========================================= */

export async function addProcedureStep(
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

  const cleanId =
    procedureId.trim();

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
    Number(stepNumber);


  if (!cleanId) {

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


  const procedureRef = doc(
    db,
    PROCEDURES_COLLECTION,
    cleanId
  );


  /*
   * Prevent an existing Procedure ID
   * from being overwritten.
   */

  const existingProcedure =
    await getDoc(procedureRef);


  if (existingProcedure.exists()) {

    throw new Error(
      "A procedure step with this ID already exists."
    );

  }


  await setDoc(procedureRef, {

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

    isActive: true,

    updatedAt:
      Date.now()

  });

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
    Number(stepNumber);


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


  /*
   * Website name and URL must be
   * entered together.
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


  const procedureRef = doc(
    db,
    PROCEDURES_COLLECTION,
    procedureId
  );


  await updateDoc(procedureRef, {

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


  const procedureRef = doc(
    db,
    PROCEDURES_COLLECTION,
    procedureId
  );


  await updateDoc(procedureRef, {

    isActive: isActive,

    updatedAt:
      Date.now()

  });

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