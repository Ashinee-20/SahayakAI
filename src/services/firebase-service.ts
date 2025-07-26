import { db, storage } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, listAll } from 'firebase/storage';
import { z } from 'zod';

export const ContentSchema = z.object({
  userId: z.string(),
  type: z.enum(['lessonPlan', 'assessment', 'story', 'visualAid', 'classNotes']),
  title: z.string(),
  content: z.any(),
  createdAt: z.custom<Timestamp>(),
  shared: z.boolean().default(false),
});

export type Content = z.infer<typeof ContentSchema>;

export async function saveContent(
  userId: string,
  type: Content['type'],
  title: string,
  content: any
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'content'), {
      userId,
      type,
      title,
      content,
      createdAt: Timestamp.now(),
      shared: false,
    });
    return docRef.id;
  } catch (e) {
    console.error('Error adding document: ', e);
    throw new Error('Failed to save content to Firestore.');
  }
}

export async function getUserContent(userId: string): Promise<(Content & { id: string })[]> {
  const q = query(collection(db, 'content'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  const content: (Content & { id: string })[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    // Basic validation, can be improved with Zod parsing
    const docContent = {
      id: doc.id,
      userId: data.userId,
      type: data.type,
      title: data.title,
      content: data.content,
      createdAt: data.createdAt,
      shared: data.shared,
    };
    content.push(docContent);
  });
  return content;
}

export async function uploadImageToStorage(imageDataUri: string, userId: string, contentId: string): Promise<string> {
    const storageRef = ref(storage, `users/${userId}/visual-aids/${contentId}.png`);
    await uploadString(storageRef, imageDataUri, 'data_url');
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
}

export async function listTextbooks(userId: string): Promise<{name: string, url: string}[]> {
    const textbooksRef = ref(storage, `textbooks/`);
    const res = await listAll(textbooksRef);
    
    const textbookPromises = res.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
            name: itemRef.name,
            url: url,
        };
    });

    return Promise.all(textbookPromises);
}
