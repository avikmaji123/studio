export type Testimonial = {
  id: string;
  name: string;
  title: string;
  quote: string;
  imageId: string;
  rating: number;
};

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    title: 'Web Developer',
    quote:
      'CourseVerse has been a game-changer. The web development course was comprehensive and from a great instructor. I landed a new job within a month of completing it!',
    imageId: 'testimonial-1',
    rating: 5,
  },
  {
    id: '2',
    name: 'Michael Chen',
    title: 'Data Analyst',
    quote:
      'The data science course was exactly what I needed to level up my skills. The content is up-to-date and the hands-on projects were invaluable. Highly recommended for aspiring data scientists.',
    imageId: 'testimonial-2',
    rating: 5,
  },
  {
    id: '3',
    name: 'Priya Patel',
    title: 'Marketing Manager',
    quote:
      'As a marketing professional, I found the digital marketing masterclass incredibly useful. It covers everything from SEO to social media. My campaign results have improved significantly.',
    imageId: 'testimonial-3',
    rating: 4,
  },
  {
    id: '4',
    name: 'David Lee',
    title: 'UX Designer',
    quote:
      'The platform is incredibly well-designed. Finding and accessing high-quality, licensed courses is so easy. It’s clear this was built with care and a focus on the user experience.',
    imageId: 'testimonial-4',
    rating: 5,
  },
];
