import { runTransaction, doc } from "firebase/firestore";

/**
 * Shared utility for generating and validating human-readable,
 * name-based Firestore document IDs with atomic collision protection.
 */

/**
 * Normalizes text to a clean, lowercase, underscore-delimited slug.
 * - Converts to lowercase
 * - Trims whitespace
 * - Replaces spaces and punctuation with underscores
 * - Collapses repeated underscores
 * - Trims leading and trailing underscores
 *
 * @param {string} text
 * @returns {string}
 */
export function normalizeIdPart(text) {
  if (typeof text !== "string") {
    throw new Error("Invalid input: name must be a string.");
  }

  const normalized = text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (!normalized) {
    throw new Error("Invalid name: resulted in an empty document ID.");
  }

  // Firestore document ID safety check
  if (
    normalized === "." ||
    normalized === ".." ||
    normalized.startsWith("__") && normalized.endsWith("__")
  ) {
    throw new Error("Invalid name: restricted Firestore document ID.");
  }

  return normalized;
}

/**
 * Generates a Service document ID.
 * Format: [normalized service name]
 * Example: "Registrar" -> "registrar"
 *
 * @param {string} serviceName
 * @returns {string}
 */
export function buildServiceId(serviceName) {
  return normalizeIdPart(serviceName);
}

/**
 * Generates a Transaction document ID derived ONLY from the Transaction Name.
 * Format: [normalized transaction name]
 * Examples:
 * - "Getting Prospectus" -> "getting_prospectus"
 * - "Getting Clearance" -> "getting_clearance"
 * - "Updating Prospectus" -> "updating_prospectus"
 *
 * @param {string} transactionName
 * @returns {string}
 */
export function buildTransactionId(transactionName) {
  return normalizeIdPart(transactionName);
}

/**
 * Generates a Requirement document ID.
 * Format: [parentTransactionId]_[normalized requirement text]
 * Example: "registrar_getting_prospectus" + "School ID" -> "registrar_getting_prospectus_school_id"
 *
 * @param {string} parentTransactionId
 * @param {string} requirementText
 * @returns {string}
 */
export function buildRequirementId(parentTransactionId, requirementText) {
  const cleanParentId = (parentTransactionId || "").trim();
  if (!cleanParentId) {
    throw new Error("Parent Transaction ID is required to generate Requirement ID.");
  }
  const cleanTextPart = normalizeIdPart(requirementText);
  return `${cleanParentId}_${cleanTextPart}`;
}

/**
 * Generates a Procedure Step document ID.
 * Format: [parentTransactionId]_step_[3-digit padded step number]
 * Example: "registrar_getting_prospectus" + 1 -> "registrar_getting_prospectus_step_001"
 *
 * @param {string} parentTransactionId
 * @param {number|string} stepNumber
 * @returns {string}
 */
export function buildProcedureStepId(parentTransactionId, stepNumber) {
  const cleanParentId = (parentTransactionId || "").trim();
  if (!cleanParentId) {
    throw new Error("Parent Transaction ID is required to generate Procedure Step ID.");
  }
  const num = Number(stepNumber);
  if (!Number.isInteger(num) || num < 1) {
    throw new Error("Step number must be an integer greater than 0.");
  }
  const padded = String(num).padStart(3, "0");
  return `${cleanParentId}_step_${padded}`;
}

/**
 * Generates a Department Guideline document ID.
 * Format: [parentServiceId]_[normalized guideline text]
 * Example: "registrar" + "Office Hours" -> "registrar_office_hours"
 *
 * @param {string} parentServiceId
 * @param {string} guidelineText
 * @returns {string}
 */
export function buildGuidelineId(parentServiceId, guidelineText) {
  const cleanParentId = (parentServiceId || "").trim();
  if (!cleanParentId) {
    throw new Error("Parent Service ID is required to generate Guideline ID.");
  }
  const cleanTextPart = normalizeIdPart(guidelineText);
  return `${cleanParentId}_${cleanTextPart}`;
}

/**
 * Atomically creates a document in Firestore if and only if it does not already exist.
 * If the document already exists, throws an error with the specified duplicate error message.
 *
 * @param {import("firebase/firestore").Firestore} db
 * @param {string} collectionName
 * @param {string} documentId
 * @param {object} data
 * @param {string} duplicateErrorMessage
 * @returns {Promise<import("firebase/firestore").DocumentReference>}
 */
export async function createDocumentIfAbsent(
  db,
  collectionName,
  documentId,
  data,
  duplicateErrorMessage
) {
  const docRef = doc(db, collectionName, documentId);

  await runTransaction(db, async (transaction) => {
    const existingDoc = await transaction.get(docRef);
    if (existingDoc.exists()) {
      throw new Error(
        duplicateErrorMessage ||
          `A record with ID "${documentId}" already exists.`
      );
    }
    transaction.set(docRef, data);
  });

  return docRef;
}
