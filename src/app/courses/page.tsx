'use client';
import { useState } from 'react';
import { CourseCard } from "@/components/app/course-card";
import { courses } from "@/lib/data";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SlidersHorizontal, Search, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useSearchAndFilter } from '@/hooks/use-search-and-filter';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const categories = Array.from(new Set(courses.map(c => c.category)));
const levels = ["Beginner", "Intermediate", "Advanced"];
const durations = ["Short (< 2 hours)", "Medium (2-5 hours)", "Long (5+ hours)"];
const maxPrice = Math.max(...courses.map(c => parseInt(c.price.replace('₹', ''))));


function FilterSidebar() {
  const {
    searchTerm,
    setSearchTerm,
    selectedCategories,
    toggleCategory,
    selectedLevels,
    toggleLevel,
    priceRange,
    setPriceRange,
    resetFilters,
  } = useSearchAndFilter();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Search</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search courses..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Accordion type="multiple" defaultValue={['category', 'level', 'price']} className="w-full">
        <AccordionItem value="category">
          <AccordionTrigger>Category</AccordionTrigger>
          <AccordionContent className="space-y-2">
            {categories.map(category => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox 
                  id={`cat-${category}`} 
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                />
                <label htmlFor={`cat-${category}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {category}
                </label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="level">
          <AccordionTrigger>Level</AccordionTrigger>
          <AccordionContent className="space-y-2">
            {levels.map(level => (
              <div key={level} className="flex items-center space-x-2">
                <Checkbox 
                  id={`level-${level}`} 
                  checked={selectedLevels.includes(level)}
                  onCheckedChange={() => toggleLevel(level)}
                />
                <label htmlFor={`level-${level}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {level}
                </label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="p-2">
                <Slider
                    defaultValue={[priceRange[1]]}
                    max={maxPrice}
                    step={50}
                    onValueChange={(value) => setPriceRange([0, value[0]])}
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>₹0</span>
                    <span>₹{priceRange[1]}</span>
                </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <Button variant="ghost" onClick={resetFilters} className="w-full">
        <X className="mr-2 h-4 w-4" /> Reset Filters
      </Button>
    </div>
  );
}


export default function CoursesPage() {
  const { filteredCourses, setSortBy } = useSearchAndFilter();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">All Courses</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Find your next learning adventure.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24">
            <FilterSidebar />
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-muted-foreground">{filteredCourses.length} courses found</p>
                <Select onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="popular">Most Popular</SelectItem>
                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredCourses.length > 0 ? (
                    filteredCourses.map(course => (
                    <CourseCard key={course.id} course={course} />
                    ))
                ) : (
                    <div className="sm:col-span-2 xl:col-span-3 text-center py-16">
                        <h3 className="text-xl font-semibold">No Courses Found</h3>
                        <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
            
            {/* Load More Button could go here */}
        </main>
      </div>

       {/* Mobile Sticky Filter Button & Sheet */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg">
              <SlidersHorizontal className="mr-2 h-5 w-5" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] flex flex-col">
            <SheetHeader>
              <SheetTitle>Filter & Sort</SheetTitle>
            </SheetHeader>
            <div className="flex-grow overflow-y-auto -mx-6 px-6">
              <FilterSidebar />
            </div>
            <SheetFooter>
                <SheetClose asChild>
                    <Button className="w-full">Apply Filters</Button>
                </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
