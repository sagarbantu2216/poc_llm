// auth.js
import { auth } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updatePassword,
  sendEmailVerification
} from 'firebase/auth';

export const doCreateUserWithEmailAndPassword = async (email, password) => {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(auth.currentUser);
  } catch (error) {
    throw new Error(error.message);
  }
};

export const doSignInWithEmailAndPassword = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw new Error(error.message);
  }
};

export const doSignInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    throw new Error(error.message);
  }
};

export const doSignOut = async () => {
  try {
    await auth.signOut();
  } catch (error) {
    throw new Error(error.message);
  }
};

export const doPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw new Error(error.message);
  }
};

export const doPasswordChange = async (password) => {
  try {
    await updatePassword(auth.currentUser, password);
  } catch (error) {
    throw new Error(error.message);
  }
};

export const doSendEmailVerification = async () => {
  try {
    await sendEmailVerification(auth.currentUser, {
      url: `${window.location.origin}/home`,
    });
  } catch (error) {
    throw new Error(error.message);
  }
};
