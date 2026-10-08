/**
 * Timestamp utilities for normalizing and parsing Firestore timestamps,
 * legacy Unix milliseconds, and Date instances.
 *
 * CRITICAL: This helper strictly distinguishes between valid timestamps,
 * pending server timestamps, and missing/invalid timestamps. It NEVER
 * uses the current date/time as a silent substitute for missing or pending values.
 */

/**
 * Checks if a value represents a pending Firestore serverTimestamp sentinel.
 *
 * @param {*} timestamp
 * @returns {boolean}
 */
export function isPendingTimestamp(timestamp) {
  if (!timestamp || typeof timestamp !== "object") {
    return false;
  }

  // Firestore serverTimestamp sentinel before commit
  if (
    timestamp._methodName === "serverTimestamp" ||
    timestamp.constructor?.name === "FieldValue" ||
    timestamp.constructor?.name === "ServerTimestampTransform" ||
    (typeof timestamp.isEqual !== "function" &&
      typeof timestamp.toDate !== "function" &&
      typeof timestamp.seconds !== "number" &&
      typeof timestamp.getTime !== "function" &&
      Object.prototype.hasOwnProperty.call(timestamp, "_methodName"))
  ) {
    return true;
  }

  return false;
}

/**
 * Parses and categorizes any timestamp input.
 *
 * Supported inputs:
 * - Firestore Timestamp object (has .toDate())
 * - Serialized Firestore Timestamp ({ seconds, nanoseconds })
 * - Numeric Unix milliseconds (e.g. Date.now())
 * - Valid numeric string
 * - JavaScript Date instance
 * - Valid ISO date string
 *
 * @param {*} timestamp
 * @returns {{
 *   state: 'valid' | 'pending' | 'missing' | 'invalid',
 *   date: Date | null,
 *   millis: number | null
 * }}
 */
export function parseTimestamp(timestamp) {
  if (timestamp === null || timestamp === undefined) {
    return {
      state: "missing",
      date: null,
      millis: null
    };
  }

  if (isPendingTimestamp(timestamp)) {
    return {
      state: "pending",
      date: null,
      millis: null
    };
  }

  // 1. Firestore Timestamp instance
  if (typeof timestamp.toDate === "function") {
    try {
      const date = timestamp.toDate();
      const millis = date.getTime();
      if (!Number.isNaN(millis)) {
        return { state: "valid", date, millis };
      }
    } catch {
      return { state: "invalid", date: null, millis: null };
    }
  }

  // 2. Serialized Firestore Timestamp ({ seconds, nanoseconds })
  if (
    typeof timestamp === "object" &&
    typeof timestamp.seconds === "number"
  ) {
    const millis =
      timestamp.seconds * 1000 +
      Math.floor((timestamp.nanoseconds || 0) / 1000000);
    const date = new Date(millis);
    if (!Number.isNaN(date.getTime())) {
      return { state: "valid", date, millis };
    }
    return { state: "invalid", date: null, millis: null };
  }

  // 3. JavaScript Date instance
  if (timestamp instanceof Date) {
    const millis = timestamp.getTime();
    if (!Number.isNaN(millis)) {
      return { state: "valid", date: timestamp, millis };
    }
    return { state: "invalid", date: null, millis: null };
  }

  // 4. Numeric Unix milliseconds
  if (typeof timestamp === "number") {
    if (!Number.isFinite(timestamp)) {
      return { state: "invalid", date: null, millis: null };
    }
    const date = new Date(timestamp);
    const millis = date.getTime();
    if (!Number.isNaN(millis)) {
      return { state: "valid", date, millis };
    }
    return { state: "invalid", date: null, millis: null };
  }

  // 5. String timestamp (ISO date string or numeric string)
  if (typeof timestamp === "string") {
    const cleanStr = timestamp.trim();
    if (!cleanStr) {
      return { state: "missing", date: null, millis: null };
    }

    // Numeric string (e.g. "1712000000000")
    if (/^-?\d+(\.\d+)?$/.test(cleanStr)) {
      const num = Number(cleanStr);
      if (Number.isFinite(num)) {
        const date = new Date(num);
        const millis = date.getTime();
        if (!Number.isNaN(millis)) {
          return { state: "valid", date, millis };
        }
      }
    }

    const date = new Date(cleanStr);
    const millis = date.getTime();
    if (!Number.isNaN(millis)) {
      return { state: "valid", date, millis };
    }
    return { state: "invalid", date: null, millis: null };
  }

  return { state: "invalid", date: null, millis: null };
}

/**
 * Safely converts any timestamp to a JavaScript Date object.
 * Returns null if missing, pending, or invalid.
 *
 * @param {*} timestamp
 * @returns {Date | null}
 */
export function convertTimestampToDate(timestamp) {
  const parsed = parseTimestamp(timestamp);
  return parsed.state === "valid" ? parsed.date : null;
}

/**
 * Safely converts any timestamp to epoch milliseconds (Long).
 * Returns null if missing, pending, or invalid.
 *
 * @param {*} timestamp
 * @returns {number | null}
 */
export function convertTimestampToMillis(timestamp) {
  const parsed = parseTimestamp(timestamp);
  return parsed.state === "valid" ? parsed.millis : null;
}
