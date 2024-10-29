import { useState, useEffect } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { FormSubmission } from '../types/forms.types';

export const useFormUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const { authStatus } = useAuth();

  useEffect(() => {
    if (!authStatus.user?.uid) return;

    const formsRef = collection(db, 'forms');
    const q = query(
      formsRef,
      where('studentId', '==', authStatus.user.uid),
      orderBy('uploadDate', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const forms = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        uploadDate: doc.data().uploadDate.toDate(),
        lastUpdated: doc.data().lastUpdated.toDate(),
      })) as FormSubmission[];

      setSubmissions(forms);
    });

    return () => unsubscribe();
  }, [authStatus.user?.uid]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        setErrorMessage('');
        setUploadStatus('idle');
      } else {
        setErrorMessage('Please select a PDF file');
        setSelectedFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !authStatus.user?.uid) return;

    setIsUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');

    try {
      const storage = getStorage();
      const timestamp = new Date();
      const filePath = `forms/${authStatus.user.uid}/${timestamp.getTime()}_${selectedFile.name}`;
      const fileRef = ref(storage, filePath);

      // Upload file to Storage
      const snapshot = await uploadBytes(fileRef, selectedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Add document to Firestore
      await addDoc(collection(db, 'forms'), {
        studentId: authStatus.user.uid,
        studentName: `${authStatus.metadata?.firstName} ${authStatus.metadata?.lastName}`,
        fileName: selectedFile.name,
        fileUrl: downloadURL,
        filePath: filePath,
        uploadDate: Timestamp.fromDate(timestamp),
        lastUpdated: Timestamp.fromDate(timestamp),
        status: 'pending',
        fileSize: selectedFile.size,
        contentType: selectedFile.type,
      });

      setUploadStatus('success');
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
      setErrorMessage('Failed to upload file. Please try again.');
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  return {
    selectedFile,
    isUploading,
    uploadStatus,
    errorMessage,
    submissions,
    handleFileChange,
    handleUpload,
  };
};
