
'use client';

import { useState, useMemo } from 'react';
import type { Course } from '@/lib/data';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

type SortOption = 'newest' | 'popular' | 'price-asc' | 'price-desc';

export function useSearchAndFilter() {
  const firestore = useFirestore();
  
  // Fetch all published courses from Firestore
  const coursesQuery = useMemoFirebase(() => query(
    collection(firestore, 'courses'), 
    where('status', '==', 'published')
  ), [firestore]);
  const { data: courses, isLoading } = useCollection<Course>(coursesQuery);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  
  const maxPrice = useMemo(() => {
    if (!courses) return 10000;
    return Math.max(...courses.map(c => parseInt(c.price.replace('₹', ''))));
  }, [courses]);
  
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
  const [sortBy, setSortBy] = useState<SortOption>('popular');

  const categories = useMemo(() => {
    if (!courses) return [];
    return Array.from(new Set(courses.map(c => c.category)));
  }, [courses]);
  
  // Update price range when maxPrice changes
  useState(() => {
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
    resetFilters
  };
}
