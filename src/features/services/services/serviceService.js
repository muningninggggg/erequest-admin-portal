import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc
} from "firebase/firestore";

import { db } from "../../../firebase/firebaseConfig";


const SERVICES_COLLECTION = "services";


/* =========================================
   GET ALL SERVICES
   ========================================= */

export async function getAllServices() {

  const servicesRef = collection(
    db,
    SERVICES_COLLECTION
  );

  const snapshot = await getDocs(
    servicesRef
  );


  const services = snapshot.docs.map(
    (document) => ({
      id: document.id,
      ...document.data()
    })
  );


  // Sort alphabetically by service name
  services.sort((a, b) =>
    (a.name || "").localeCompare(
      b.name || ""
    )
  );


  return services;
}


/* =========================================
   CREATE ID NAME
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
   GET NEXT SERVICE NUMBER
   ========================================= */

async function getNextServiceNumber() {

  const servicesRef = collection(
    db,
    SERVICES_COLLECTION
  );


  const snapshot = await getDocs(
    servicesRef
  );


  let highestNumber = 0;


  snapshot.docs.forEach(
    (document) => {

      const serviceId =
        document.id;


      /*
       * Examples:
       *
       * registrar_001
       * accounting_002
       * guidance_003
       *
       * Extract:
       *
       * 001
       * 002
       * 003
       */

      const match =
        serviceId.match(/_(\d+)$/);


      if (match) {

        const number =
          parseInt(
            match[1],
            10
          );


        if (
          number > highestNumber
        ) {

          highestNumber =
            number;

        }
      }
    }
  );


  return highestNumber + 1;
}


/* =========================================
   GENERATE SERVICE ID
   ========================================= */

async function generateServiceId(
  name
) {

  const idName =
    createIdName(name);


  if (!idName) {

    throw new Error(
      "Unable to generate Service ID."
    );

  }


  const nextNumber =
    await getNextServiceNumber();


  const formattedNumber =
    String(nextNumber).padStart(
      3,
      "0"
    );


  return `${idName}_${formattedNumber}`;
}


/* =========================================
   ADD NEW SERVICE
   ========================================= */

export async function addService(
  name,
  description
) {

  const cleanName =
    name.trim();

  const cleanDescription =
    description.trim();


  if (!cleanName) {

    throw new Error(
      "Service name is required."
    );

  }


  /*
   * Generate ID automatically.
   *
   * Example:
   *
   * Registrar
   * -> registrar_001
   *
   * Accounting
   * -> accounting_002
   */

  const serviceId =
    await generateServiceId(
      cleanName
    );


  const serviceRef = doc(
    db,
    SERVICES_COLLECTION,
    serviceId
  );


  await setDoc(
    serviceRef,
    {
      name: cleanName,

      description:
        cleanDescription,

      isActive: true,

      createdAt:
        Date.now(),

      updatedAt:
        Date.now()
    }
  );


  return serviceId;
}


/* =========================================
   UPDATE EXISTING SERVICE
   ========================================= */

export async function updateService(
  serviceId,
  name,
  description
) {

  const cleanName =
    name.trim();

  const cleanDescription =
    description.trim();


  if (!serviceId) {

    throw new Error(
      "Service ID is required."
    );

  }


  if (!cleanName) {

    throw new Error(
      "Service name is required."
    );

  }


  /*
   * IMPORTANT:
   *
   * We DO NOT generate a new ID here.
   *
   * Example:
   *
   * Original:
   * registrar_001
   *
   * Admin changes name:
   * Registrar Office
   *
   * ID remains:
   * registrar_001
   *
   * This protects relationships with
   * transactions and other records.
   */

  const serviceRef = doc(
    db,
    SERVICES_COLLECTION,
    serviceId
  );


  await updateDoc(
    serviceRef,
    {
      name:
        cleanName,

      description:
        cleanDescription,

      updatedAt:
        Date.now()
    }
  );
}


/* =========================================
   ACTIVATE / DEACTIVATE SERVICE
   ========================================= */

export async function setServiceActiveStatus(
  serviceId,
  isActive
) {

  if (!serviceId) {

    throw new Error(
      "Service ID is required."
    );

  }


  const serviceRef = doc(
    db,
    SERVICES_COLLECTION,
    serviceId
  );


  await updateDoc(
    serviceRef,
    {
      isActive:
        isActive,

      updatedAt:
        Date.now()
    }
  );
}