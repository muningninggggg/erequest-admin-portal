import {
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";

import {
  doc,
  getDoc
} from "firebase/firestore";

import {
  auth,
  db
} from "../../../firebase/firebaseConfig";

// LOGIN + VERIFY ADMIN ROLE
export async function loginAdmin(email, password) {
  try {
    // 1. Sign in using Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    // 2. Check if the UID exists in the admins collection
    const adminRef = doc(
      db,
      "admins",
      user.uid
    );

    const adminSnapshot = await getDoc(adminRef);

    // 3. Account is authenticated but not registered as an admin
    if (!adminSnapshot.exists()) {
      await signOut(auth);

      throw new Error(
        "This account is not authorized as an administrator."
      );
    }

    const adminData = adminSnapshot.data();

    // 4. Verify admin role
    if (adminData.role !== "admin") {
      await signOut(auth);

      throw new Error(
        "This account does not have administrator privileges."
      );
    }

    // 5. Successful admin login
    return {
      user,
      adminData
    };
  } catch (error) {
    throw error;
  }
}

// LOGOUT
export async function logoutAdmin() {
  await signOut(auth);
}

// GET CURRENT AUTHENTICATED USER
export function getCurrentUser() {
  return auth.currentUser;
}