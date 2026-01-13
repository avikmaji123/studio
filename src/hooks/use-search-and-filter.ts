'use client';

import { useState, useMemo } from 'react';
import { courses, Course } from '@/lib/data';

type SortOption = 'newest' | 'popular' | 'price-asc' | 'price-desc';

const maxPrice = Math.max(...courses.map(c => parseInt(c.price.replace('₹', ''))));

export function useSearchAndFilter() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
  const [sortBy, setSortBy] = useState<SortOption>('popular');

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
                return b.id.localeCompare(a.id); // Assuming higher ID is newer
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
  }, [searchTerm, selectedCategories, selectedLevels, priceRange, sortBy]);

  return {
    searchTerm,
    setSearchTerm,
    selectedCategories,
    toggleCategory,
    selectedLevels,
    toggleLevel,
    priceRange,
    setPriceRange,
    sortBy,
    setSortBy,
    filteredCourses,
    resetFilters
  };
}
