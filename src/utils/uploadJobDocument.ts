import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { storage, db } from "../lib/firebase";

/**
 * Upload a document to Firebase Storage and save the download URL in Firestore
 * @param userId - The ID of the current user
 * @param jobId - The ID of the job 
 * @param file - The file to upload 
 */
export const uploadJobDocument = async (
  userId: string,
  jobId: string,
  file: File
): Promise<string> => {
  const path = `job_documents/${userId}/${jobId}/${file.name}`;
  const fileRef = ref(storage, path);

  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);

  const jobDocRef = doc(db, "users", userId, "applied_jobs", jobId);
  await updateDoc(jobDocRef, {
    documents: arrayUnion(url), 
  });

  return url;
};
