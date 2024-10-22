import { useState } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { FirebaseError } from '../types/studentDashboard';

export const useFileUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        setErrorMessage('');
      } else {
        setErrorMessage('Please select a PDF file');
        setSelectedFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      setIsUploading(true);
      setUploadStatus('idle');
      setErrorMessage('');

      try {
        const storage = getStorage();
        const auth = getAuth();
        const db = getFirestore();

        if (!auth.currentUser) {
          throw new Error('No authenticated user');
        }

        const userId = auth.currentUser.uid;
        const fileRef = ref(storage, `pdfs/${userId}/${selectedFile.name}`);
        const snapshot = await uploadBytes(fileRef, selectedFile);
        const downloadURL = await getDownloadURL(snapshot.ref);

        await addDoc(collection(db, 'pdfs'), {
          name: selectedFile.name,
          url: downloadURL,
          userId: userId,
          uploadDate: new Date(),
          status: 'pending_review',
          fileSize: selectedFile.size,
          contentType: selectedFile.type,
        });

        setUploadStatus('success');
        setSelectedFile(null);
      } catch (error) {
        console.error('Error uploading file: ', error);
        const firebaseError = error as FirebaseError;
        setErrorMessage(firebaseError.message || 'Error uploading file');
        setUploadStatus('error');
      } finally {
        setIsUploading(false);
      }
    }
  };

  return {
    selectedFile,
    isUploading,
    uploadStatus,
    errorMessage,
    handleFileChange,
    handleUpload,
  };
};
