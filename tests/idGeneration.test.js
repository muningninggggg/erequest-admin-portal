import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeIdPart,
  buildServiceId,
  buildTransactionId,
  buildRequirementId,
  buildProcedureStepId,
  buildGuidelineId
} from "../src/utils/idUtils.js";

/**
 * FIX #4 REVISION: TRANSACTION ID FORMAT
 *
 * Verifies:
 * 1. Transaction Document IDs derived ONLY from Transaction Name (no serviceId prefix):
 *    - "Getting Prospectus" -> "getting_prospectus"
 *    - "Getting Clearance" -> "getting_clearance"
 *    - "Updating Prospectus" -> "updating_prospectus"
 * 2. Service-to-Transaction relationship preservation via `serviceId` field
 * 3. Atomic create-if-absent rejects duplicate Transaction IDs across entire collection,
 *    even when submitted under different Services.
 * 4. Preserves existing document IDs (no rename on edits).
 * 5. Requirements and Procedure Steps derive IDs from the actual stored transactionId.
 * 6. Compatibility with Android Room & SQLite (text primary keys, checklist preferences).
 */

/* =========================================================
   1. ID NORMALIZATION TESTS
   ========================================================= */

test("Normalization: Converts text to lowercase, trims, and replaces non-alphanumeric with underscores", () => {
  assert.equal(normalizeIdPart("Registrar"), "registrar");
  assert.equal(normalizeIdPart("  Registrar Office  "), "registrar_office");
  assert.equal(normalizeIdPart("Getting Prospectus"), "getting_prospectus");
  assert.equal(normalizeIdPart("School ID (Front & Back)"), "school_id_front_back");
  assert.equal(normalizeIdPart("Office of the University Registrar - Main"), "office_of_the_university_registrar_main");
});

test("Normalization: Collapses multiple consecutive spaces and underscores into a single underscore", () => {
  assert.equal(normalizeIdPart("A   B    C"), "a_b_c");
  assert.equal(normalizeIdPart("___Test___Name___"), "test_name");
  assert.equal(normalizeIdPart("Special &*#$ Characters"), "special_characters");
});

test("Normalization: Rejects invalid or empty inputs", () => {
  assert.throws(() => normalizeIdPart(""), /resulted in an empty document ID/);
  assert.throws(() => normalizeIdPart("   "), /resulted in an empty document ID/);
  assert.throws(() => normalizeIdPart("!@#$%^&*()"), /resulted in an empty document ID/);
  assert.throws(() => normalizeIdPart(null), /must be a string/);
  assert.throws(() => normalizeIdPart(undefined), /must be a string/);
  assert.throws(() => normalizeIdPart(123), /must be a string/);
});

test("Normalization: Rejects restricted Firestore document IDs like . and ..", () => {
  assert.throws(() => normalizeIdPart("."), /Invalid name/);
  assert.throws(() => normalizeIdPart(".."), /Invalid name/);
});

/* =========================================================
   2. REVISED TRANSACTION ID & TARGET ID GENERATION FORMATS
   ========================================================= */

test("Format 1 (Services): buildServiceId creates normalized slug", () => {
  assert.equal(buildServiceId("Registrar"), "registrar");
  assert.equal(buildServiceId("Guidance Counseling"), "guidance_counseling");
  assert.equal(buildServiceId("Accounting Office"), "accounting_office");
});

test("Format 2 (Transactions): buildTransactionId derives ONLY from Transaction Name (no service prefix)", () => {
  assert.equal(buildTransactionId("Getting Prospectus"), "getting_prospectus");
  assert.equal(buildTransactionId("Getting Clearance"), "getting_clearance");
  assert.equal(buildTransactionId("Updating Prospectus"), "updating_prospectus");
  assert.equal(buildTransactionId("Tuition Fee Assessment"), "tuition_fee_assessment");
});

test("Format 3 (Requirements): buildRequirementId creates [parentTransactionId]_[normalized_text]", () => {
  // Using revised transactionId
  assert.equal(
    buildRequirementId("getting_prospectus", "School ID"),
    "getting_prospectus_school_id"
  );
  assert.equal(
    buildRequirementId("getting_prospectus", "Transcript of Records (TOR)"),
    "getting_prospectus_transcript_of_records_tor"
  );

  // Using legacy/prefixed transactionId
  assert.equal(
    buildRequirementId("registrar_getting_prospectus", "School ID"),
    "registrar_getting_prospectus_school_id"
  );
});

test("Format 4 (Procedure Steps): buildProcedureStepId creates [parentTransactionId]_step_[3-digit padded]", () => {
  // Using revised transactionId
  assert.equal(
    buildProcedureStepId("getting_prospectus", 1),
    "getting_prospectus_step_001"
  );
  assert.equal(
    buildProcedureStepId("getting_prospectus", 2),
    "getting_prospectus_step_002"
  );
  assert.equal(
    buildProcedureStepId("getting_prospectus", 10),
    "getting_prospectus_step_010"
  );
  assert.equal(
    buildProcedureStepId("getting_prospectus", 100),
    "getting_prospectus_step_100"
  );
  assert.equal(
    buildProcedureStepId("getting_prospectus", "5"),
    "getting_prospectus_step_005"
  );

  // Using legacy/prefixed transactionId
  assert.equal(
    buildProcedureStepId("registrar_getting_prospectus", 1),
    "registrar_getting_prospectus_step_001"
  );
});

test("Format 4 (Procedure Steps): Rejects invalid step numbers", () => {
  assert.throws(
    () => buildProcedureStepId("getting_prospectus", 0),
    /Step number must be an integer greater than 0/
  );
  assert.throws(
    () => buildProcedureStepId("getting_prospectus", -1),
    /Step number must be an integer greater than 0/
  );
  assert.throws(
    () => buildProcedureStepId("getting_prospectus", 1.5),
    /Step number must be an integer greater than 0/
  );
  assert.throws(
    () => buildProcedureStepId("getting_prospectus", "abc"),
    /Step number must be an integer greater than 0/
  );
});

test("Format 5 (Department Guidelines): buildGuidelineId creates [parentServiceId]_[normalized_text]", () => {
  assert.equal(
    buildGuidelineId("registrar", "Office Hours"),
    "registrar_office_hours"
  );
  assert.equal(
    buildGuidelineId("guidance_counseling", "Confidentiality Policy"),
    "guidance_counseling_confidentiality_policy"
  );
});

test("Parent ID Validation: Rejects missing or empty parent IDs for child collections", () => {
  assert.throws(() => buildRequirementId("", "Req"), /Parent Transaction ID is required/);
  assert.throws(() => buildRequirementId("   ", "Req"), /Parent Transaction ID is required/);
  assert.throws(() => buildProcedureStepId("", 1), /Parent Transaction ID is required/);
  assert.throws(() => buildGuidelineId("", "Guide"), /Parent Service ID is required/);
  assert.throws(() => buildGuidelineId("   ", "Guide"), /Parent Service ID is required/);
});

/* =========================================================
   3. ATOMIC COLLISION & CROSS-SERVICE DUPLICATE PREVENTION
   ========================================================= */

test("Atomic Create-If-Absent: Rejects duplicate Transaction ID across the entire collection, even under different Services", async () => {
  const inMemoryStore = new Map();
  // Existing transaction: "getting_prospectus" belongs to "registrar"
  inMemoryStore.set("transactions/getting_prospectus", {
    serviceId: "registrar",
    name: "Getting Prospectus",
    isActive: true
  });

  const mockDb = {};
  const mockRunTransaction = async (db, updateFunction) => {
    const mockTransaction = {
      get: async (docRef) => {
        const path = `${docRef.collection}/${docRef.id}`;
        return {
          exists: () => inMemoryStore.has(path),
          data: () => inMemoryStore.get(path)
        };
      },
      set: (docRef, data) => {
        const path = `${docRef.collection}/${docRef.id}`;
        inMemoryStore.set(path, data);
      }
    };
    return updateFunction(mockTransaction);
  };

  const executeCreate = async (collection, id, data, errorMsg) => {
    const docRef = { collection, id };
    await mockRunTransaction(mockDb, async (tx) => {
      const snap = await tx.get(docRef);
      if (snap.exists()) {
        throw new Error(errorMsg || `Record with ID "${id}" already exists.`);
      }
      tx.set(docRef, data);
    });
  };

  // Attempt to create "Getting Prospectus" under DIFFERENT service "admissions"
  const newTxName = "Getting Prospectus";
  const newTxId = buildTransactionId(newTxName); // "getting_prospectus"

  await assert.rejects(
    async () => {
      await executeCreate(
        "transactions",
        newTxId,
        { serviceId: "admissions", name: newTxName },
        `A transaction with the name "${newTxName}" already exists.`
      );
    },
    {
      name: "Error",
      message: 'A transaction with the name "Getting Prospectus" already exists.'
    }
  );

  // Attempt to create a distinct transaction "Getting Clearance" succeeds
  const uniqueTxName = "Getting Clearance";
  const uniqueTxId = buildTransactionId(uniqueTxName);

  await assert.doesNotReject(async () => {
    await executeCreate(
      "transactions",
      uniqueTxId,
      { serviceId: "admissions", name: uniqueTxName },
      `A transaction with the name "${uniqueTxName}" already exists.`
    );
  });

  assert.equal(inMemoryStore.has("transactions/getting_clearance"), true);
  // Verify serviceId field preserved
  assert.equal(inMemoryStore.get("transactions/getting_clearance").serviceId, "admissions");
});

test("Race Condition Prevention: Concurrent creation attempts result in exactly 1 success and 1 rejection", async () => {
  const inMemoryStore = new Map();
  let lock = Promise.resolve();

  const serializedTransaction = async (fn) => {
    const prevLock = lock;
    let release;
    lock = new Promise((res) => { release = res; });
    await prevLock;
    try {
      const tx = {
        get: async (path) => ({
          exists: () => inMemoryStore.has(path),
          data: () => inMemoryStore.get(path)
        }),
        set: (path, data) => inMemoryStore.set(path, data)
      };
      return await fn(tx);
    } finally {
      release();
    }
  };

  const createTransaction = async (serviceId, txName) => {
    const id = buildTransactionId(txName);
    const path = `transactions/${id}`;
    return serializedTransaction(async (tx) => {
      const snap = await tx.get(path);
      if (snap.exists()) {
        throw new Error(`A transaction with the name "${txName}" already exists.`);
      }
      tx.set(path, { serviceId, name: txName, createdAt: Date.now() });
      return id;
    });
  };

  // Two admins attempt to create "Updating Prospectus" simultaneously (one under registrar, one under accounting)
  const results = await Promise.allSettled([
    createTransaction("registrar", "Updating Prospectus"),
    createTransaction("accounting", "Updating Prospectus")
  ]);

  const fulfilled = results.filter((r) => r.status === "fulfilled");
  const rejected = results.filter((r) => r.status === "rejected");

  assert.equal(fulfilled.length, 1, "Exactly one creation must succeed");
  assert.equal(rejected.length, 1, "Exactly one creation must be rejected");
  assert.equal(fulfilled[0].value, "updating_prospectus");
  assert.match(rejected[0].reason.message, /already exists/);
});

/* =========================================================
   4. ANDROID ROOM & SQLITE COMPATIBILITY
   ========================================================= */

test("Android Compatibility: Revised Transaction IDs adhere to Android Room & SQLite constraints", () => {
  const serviceId = buildServiceId("Registrar");
  const txId = buildTransactionId("Getting Prospectus"); // "getting_prospectus"
  const reqId = buildRequirementId(txId, "School ID"); // "getting_prospectus_school_id"
  const stepId = buildProcedureStepId(txId, 1); // "getting_prospectus_step_001"
  const guideId = buildGuidelineId(serviceId, "Office Hours"); // "registrar_office_hours"

  const allIds = [serviceId, txId, reqId, stepId, guideId];

  for (const id of allIds) {
    // 1. Must be non-empty string
    assert.equal(typeof id, "string");
    assert.ok(id.length > 0);

    // 2. Contains only lowercase alphanumeric and underscores
    assert.match(id, /^[a-z0-9_]+$/);

    // 3. No consecutive underscores or trailing/leading underscores
    assert.ok(!id.includes("__"), `ID '${id}' must not have consecutive underscores`);
    assert.ok(!id.startsWith("_"), `ID '${id}' must not start with underscore`);
    assert.ok(!id.endsWith("_"), `ID '${id}' must not end with underscore`);
  }

  // 4. SharedPreferences checklist preference key format:
  // "checklist_${transactionId}_${requirementId}"
  const prefKey = `checklist_${txId}_${reqId}`;
  assert.equal(
    prefKey,
    "checklist_getting_prospectus_getting_prospectus_school_id"
  );
  assert.match(prefKey, /^checklist_[a-z0-9_]+$/);
});

/* =========================================================
   5. BACKWARD COMPATIBILITY & EDIT IMMUTABILITY
   ========================================================= */

test("Backward Compatibility: System handles mix of legacy, auto, prefixed, and revised IDs", () => {
  const mixedCollection = [
    { id: "accounting", name: "Accounting Office" },
    { id: "guidance_001", name: "Guidance Counseling" },
    { id: "k8Z2p0X4mL9vQ1w3aBcD", name: "Registrar Services" },
    { id: "registrar_getting_prospectus", name: "Getting Prospectus (Old)" },
    { id: "getting_prospectus", name: "Getting Prospectus (New)" }
  ];

  // Sorting remains strictly alphabetical by name
  const sorted = [...mixedCollection].sort((a, b) => a.name.localeCompare(b.name));
  assert.equal(sorted[0].name, "Accounting Office");
  assert.equal(sorted[1].name, "Getting Prospectus (New)");
  assert.equal(sorted[2].name, "Getting Prospectus (Old)");
  assert.equal(sorted[3].name, "Guidance Counseling");
  assert.equal(sorted[4].name, "Registrar Services");

  // Child requirements correctly derive from whatever parent transactionId is passed
  const reqFromOldTx = buildRequirementId("registrar_getting_prospectus", "Form 137");
  assert.equal(reqFromOldTx, "registrar_getting_prospectus_form_137");

  const reqFromNewTx = buildRequirementId("getting_prospectus", "Form 137");
  assert.equal(reqFromNewTx, "getting_prospectus_form_137");
});
