
'use client';

import { useState, useMemo } from 'react';
import type { Course } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

type SortOption = 'newest' | 'popular' | 'price-asc' | 'price-desc';

export function useSearchAndFilter() {
  const firestore = useFirestore();
  const { user } = useUser();
  
  // Fetch all published courses from Firestore
  const coursesQuery = useMemoFirebase(() => query(
    collection(firestore, 'courses'), 
    where('status', '==', 'published')
  ), [firestore]);
  const { data: courses, isLoading: coursesLoading } = useCollection<Course>(coursesQuery);

  // Fetch user's enrollments
  const enrollmentsQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'enrollments') : null),
    [firestore, user]
  );
  const { data: enrollments, isLoading: enrollmentsLoading } = useCollection(enrollmentsQuery);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  
  const maxPrice = useMemo(() => {
    if (!courses) return 10000;
    const prices = courses.map(c => parseInt(c.price.replace('₹', ''))).filter(p => !isNaN(p));
    return Math.max(...prices, 0);
  }, [courses]);
  
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
  const [sortBy, setSortBy] = useState<SortOption>('popular');

  const categories = useMemo(() => {
    if (!courses) return [];
    const allCategories = courses.map(c => c.category).filter(Boolean); // Filter out undefined/null
    return Array.from(new Set(allCategories));
  }, [courses]);
  
  // Update price range when maxPrice changes
  useMemo(() => {
    setPriceRange([0, maxPrice]);
  }, [maxPrice]);


  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const toggleLevel = (level: string) => {
    setSelectedLevels(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedLevels([]);
    setPriceRange([0, maxPrice]);
    setSortBy('popular');
  };

  const filteredCourses = useMemo(() => {
    if (!courses) return [];

    let filtered = courses.filter(course => {
      // Search term filter
      const searchMatch =
        searchTerm.trim() === '' ||
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const categoryMatch =
        selectedCategories.length === 0 || selectedCategories.includes(course.category);
      
      // Level filter
      const levelMatch =
        selectedLevels.length === 0 || selectedLevels.includes(course.level || 'All Levels');

      // Price filter
      const coursePrice = parseInt(course.price.replace('₹', ''));
      const priceMatch = coursePrice >= priceRange[0] && coursePrice <= priceRange[1];

      return searchMatch && categoryMatch && levelMatch && priceMatch;
    });

    // Sorting
    filtered.sort((a, b) => {
        const priceA = parseInt(a.price.replace('₹', ''));
        const priceB = parseInt(b.price.replace('₹', ''));

        switch (sortBy) {
            case 'newest':
                // Assuming ID is a timestamp or sequential, otherwise createdDate field would be better
                return (b.id > a.id) ? 1 : -1; 
            case 'popular':
                return (b.enrollmentCount || 0) - (a.enrollmentCount || 0);
            case 'price-asc':
                return priceA - priceB;
            case 'price-desc':
                return priceB - priceA;
            default:
                return 0;
        }
    });

    return filtered;
  }, [courses, searchTerm, selectedCategories, selectedLevels, priceRange, sortBy]);
  
  const isLoading = coursesLoading || enrollmentsLoading;

  return {
    isLoading,
    searchTerm,
    setSearchTerm,
    categories,
    selectedCategories,
    toggleCategory,
    selectedLevels,
    toggleLevel,
    priceRange,
    setPriceRange,
    maxPrice,
    sortBy,
    setSortBy,
    filteredCourses,
    enrolledCourseIds: enrollments?.map(e => e.courseId) || [],
    resetFilters
  };
}
