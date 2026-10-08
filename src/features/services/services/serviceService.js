import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp
} from "firebase/firestore";

import {
  db
} from "../../../firebase/firebaseConfig";

import {
  addActivityLog
} from "../../dashboard/services/activityLogService";


const SERVICES_COLLECTION =
  "services";

/* =========================================================
   GET ALL SERVICES
   ========================================================= */

export async function getAllServices() {

  const servicesRef =
    collection(
      db,
      SERVICES_COLLECTION
    );


  const snapshot =
    await getDocs(
      servicesRef
    );


  const services =
    snapshot.docs.map(
      (document) => ({

        id:
          document.id,

        ...document.data()

      })
    );


  services.sort(
    (a, b) =>
      (a.name || "").localeCompare(
        b.name || ""
      )
  );


  return services;

}


/* =========================================================
   CREATE ID-FRIENDLY NAME
   ========================================================= */

function createIdName(
  name
) {

  return name
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9\s_-]/g,
      ""
    )
    .replace(
      /\s+/g,
      "_"
    )
    .replace(
      /_+/g,
      "_"
    )
    .replace(
      /^_+|_+$/g,
      ""
    );

}


/* =========================================================
   GET NEXT SERVICE NUMBER
   ========================================================= */

async function getNextServiceNumber() {

  const servicesRef =
    collection(
      db,
      SERVICES_COLLECTION
    );


  const snapshot =
    await getDocs(
      servicesRef
    );


  let highestNumber = 0;


  snapshot.docs.forEach(
    (document) => {

      const serviceId =
        document.id;


      const match =
        serviceId.match(
          /_(\d+)$/
        );


      if (match) {

        const number =
          parseInt(
            match[1],
            10
          );


        if (
          number >
          highestNumber
        ) {

          highestNumber =
            number;

        }

      }

    }
  );


  return highestNumber + 1;

}


/* =========================================================
   GENERATE SERVICE ID
   ========================================================= */

async function generateServiceId(
  name
) {

  const idName =
    createIdName(
      name
    );


  if (!idName) {

    throw new Error(
      "Unable to generate Service ID."
    );

  }


  const nextNumber =
    await getNextServiceNumber();


  const formattedNumber =
    String(
      nextNumber
    ).padStart(
      3,
      "0"
    );


  return (
    `${idName}_${formattedNumber}`
  );

}


/* =========================================================
   ADD NEW SERVICE
   ========================================================= */

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


  const serviceId =
    await generateServiceId(
      cleanName
    );


  const serviceRef =
    doc(
      db,
      SERVICES_COLLECTION,
      serviceId
    );


  await setDoc(
    serviceRef,
    {

      name:
        cleanName,

      description:
        cleanDescription,

      isActive:
        true,

      createdAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp()

    }
  );


  /* =======================================================
     ACTIVITY LOG
     ======================================================= */

  await addActivityLog({

    type:
      "service",

    action:
      "added",

    title:
      cleanName,

    description:
      "New service added",

    recordId:
      serviceId

  });


  return serviceId;

}


/* =========================================================
   UPDATE EXISTING SERVICE
   ========================================================= */

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


  const serviceRef =
    doc(
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
        serverTimestamp()

    }
  );


  /* =======================================================
     ACTIVITY LOG
     ======================================================= */

  await addActivityLog({

    type:
      "service",

    action:
      "updated",

    title:
      cleanName,

    description:
      "Service information updated",

    recordId:
      serviceId

  });

}


/* =========================================================
   ACTIVATE / DEACTIVATE SERVICE
   ========================================================= */

export async function setServiceActiveStatus(
  serviceId,
  isActive
) {

  if (!serviceId) {

    throw new Error(
      "Service ID is required."
    );

  }


  const serviceRef =
    doc(
      db,
      SERVICES_COLLECTION,
      serviceId
    );


  /*
   * Get the service first so we can save
   * its actual name in the activity log.
   */

  const services =
    await getAllServices();


  const service =
    services.find(
      (item) =>
        item.id === serviceId
    );


  const serviceName =
    service?.name ||
    "Service";


  await updateDoc(
    serviceRef,
    {

      isActive:
        isActive,

      updatedAt:
        serverTimestamp()

    }
  );


  /* =======================================================
     ACTIVITY LOG
     ======================================================= */

  await addActivityLog({

    type:
      "service",

    action:
      isActive
        ? "activated"
        : "deactivated",

    title:
      serviceName,

    description:
      isActive
        ? "Service activated"
        : "Service deactivated",

    recordId:
      serviceId

  });

}


/* =========================================================
   GET SERVICE TRANSACTION COUNT
   Used to prevent orphaned records on service deletion
   ========================================================= */

export async function getServiceTransactionCount(
  serviceId
) {

  if (!serviceId) {
    return 0;
  }

  const transactionsQuery =
    query(
      collection(
        db,
        "transactions"
      ),
      where(
        "serviceId",
        "==",
        serviceId
      )
    );

  const snapshot =
    await getDocs(
      transactionsQuery
    );

  return snapshot.size;

}


/* =========================================================
   DELETE SERVICE
   ========================================================= */

export async function deleteService(
  serviceId
) {

  if (!serviceId) {

    throw new Error(
      "Service ID is required."
    );

  }

  /*
   * Check if child transactions exist.
   * Prevent deletion to avoid orphaned records.
   */
  const transactionCount =
    await getServiceTransactionCount(
      serviceId
    );

  if (transactionCount > 0) {
    throw new Error(
      `Cannot delete this service because it contains ${transactionCount} transaction(s). Please delete or reassign those transactions first, or deactivate this service instead.`
    );
  }


  /*
   * Get the service before deleting it.
   * After deletion, we would no longer
   * be able to retrieve its name.
   */

  const services =
    await getAllServices();


  const service =
    services.find(
      (item) =>
        item.id === serviceId
    );


  const serviceName =
    service?.name ||
    "Service";


  const serviceRef =
    doc(
      db,
      SERVICES_COLLECTION,
      serviceId
    );


  await deleteDoc(
    serviceRef
  );


  /* =======================================================
     ACTIVITY LOG
     ======================================================= */

  await addActivityLog({

    type:
      "service",

    action:
      "deleted",

    title:
      serviceName,

    description:
      "Service deleted",

    recordId:
      serviceId

  });

}