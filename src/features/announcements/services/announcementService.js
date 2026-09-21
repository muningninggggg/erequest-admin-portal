import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";

import { db } from "../../../firebase/firebaseConfig";


const ANNOUNCEMENTS_COLLECTION = "announcements";


/* =========================================================
   GET ALL ANNOUNCEMENTS
   ========================================================= */

export const getAllAnnouncements = async () => {

  const snapshot = await getDocs(
    collection(db, ANNOUNCEMENTS_COLLECTION)
  );

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data()
  }));
};


/* =========================================================
   ADD ANNOUNCEMENT
   Firestore automatically creates the document ID.
   ========================================================= */

export const addAnnouncement = async (
  title,
  message,
  displayOrder
) => {

  const cleanTitle = title.trim();
  const cleanMessage = message.trim();

  if (!cleanTitle) {
    throw new Error("Announcement title is required.");
  }

  if (!cleanMessage) {
    throw new Error("Announcement message is required.");
  }

  const order = Number(displayOrder);

  if (Number.isNaN(order)) {
    throw new Error("Display order must be a number.");
  }


  const announcementData = {

    title: cleanTitle,

    message: cleanMessage,

    displayOrder: order,

    isActive: true,

    datePosted: serverTimestamp(),

    updatedAt: serverTimestamp()
  };


  // Firestore automatically generates the document ID.
  const documentReference = await addDoc(
    collection(db, ANNOUNCEMENTS_COLLECTION),
    announcementData
  );


  // Return generated ID if the page needs it.
  return documentReference.id;
};


/* =========================================================
   UPDATE ANNOUNCEMENT
   Uses the existing Firestore document ID.
   ========================================================= */

export const updateAnnouncement = async (
  announcementId,
  title,
  message,
  displayOrder
) => {

  if (!announcementId) {
    throw new Error(
      "Unable to update announcement: missing document ID."
    );
  }


  const cleanTitle = title.trim();
  const cleanMessage = message.trim();


  if (!cleanTitle) {
    throw new Error("Announcement title is required.");
  }


  if (!cleanMessage) {
    throw new Error("Announcement message is required.");
  }


  const order = Number(displayOrder);


  if (Number.isNaN(order)) {
    throw new Error("Display order must be a number.");
  }


  const announcementRef = doc(
    db,
    ANNOUNCEMENTS_COLLECTION,
    announcementId
  );


  await updateDoc(announcementRef, {

    title: cleanTitle,

    message: cleanMessage,

    displayOrder: order,

    updatedAt: serverTimestamp()
  });
};


/* =========================================================
   ACTIVATE / DEACTIVATE ANNOUNCEMENT
   ========================================================= */

export const setAnnouncementActiveStatus = async (
  announcementId,
  isActive
) => {

  if (!announcementId) {
    throw new Error(
      "Unable to change announcement status: missing document ID."
    );
  }


  const announcementRef = doc(
    db,
    ANNOUNCEMENTS_COLLECTION,
    announcementId
  );


  await updateDoc(announcementRef, {

    isActive: Boolean(isActive),

    updatedAt: serverTimestamp()
  });
};