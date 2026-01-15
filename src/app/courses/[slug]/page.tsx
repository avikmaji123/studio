
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { getSdks } from '@/firebase/index.server';
import type { Course } from '@/lib/data';
import CourseDetailClientPage from './course-detail-client-page';

// This is a server-side utility function. It MUST NOT be in a 'use client' file.
async function getCourseBySlug(slug: string): Promise<Course | null> {
  // We use a separate, server-only initialization for Firestore.
  const { firestore } = getSdks();
  const coursesRef = collection(firestore, 'courses');
  const q = query(coursesRef, where('slug', '==', slug), where('status', '==', 'published'), limit(1));
  
  try {
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    
    const courseDoc = querySnapshot.docs[0];
    const courseData = courseDoc.data() as Omit<Course, 'id'>;

    // Manually add the document ID to the object
    const courseWithId: Course = {
      id: courseDoc.id,
      ...courseData
    };
    
    return courseWithId;
  } catch (error) {
    console.error("Error fetching course by slug:", error);
    return null;
  }
}

export default async function CoursePage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const course = await getCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  // Pass the server-fetched data to the client component.
  // The client component needs a serializable object.
  // The `course` object with a plain string ID is serializable.
  return <CourseDetailClientPage course={course} />;
}
