export type Course = {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: string;
  category: string;
  imageId: string;
  lessons: { id: string; title: string; duration: string }[];
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  isNew?: boolean;
  isBestseller?: boolean;
  hasPreview?: boolean;
  enrollmentCount?: number;
};

export type Testimonial = {
  id: string;
  name: string;
  title: string;
  quote: string;
  imageId: string;
  rating: number;
};

export const courses: Course[] = [
  {
    id: '1',
    slug: 'the-complete-2024-web-development-bootcamp',
    title: 'The Complete 2024 Web Development Bootcamp',
    description:
      'A comprehensive course covering HTML, CSS, Javascript, Node, React, MongoDB, Web3 and DApps.',
    price: '₹499',
    category: 'Web Development',
    imageId: 'course-1',
    lessons: [
      { id: 'l1', title: 'Introduction to Web Development', duration: '15:30' },
      { id: 'l2', title: 'HTML & CSS Basics', duration: '45:10' },
      { id: 'l3', title: 'JavaScript Fundamentals', duration: '1:20:00' },
    ],
    level: 'Beginner',
    isNew: true,
    hasPreview: true,
    enrollmentCount: 25032,
  },
  {
    id: '2',
    slug: 'the-data-science-course-2024-complete-data-science-bootcamp',
    title: 'The Data Science Course 2024: Complete Data Science Bootcamp',
    description:
      'A complete Data Science training covering Mathematics, Statistics, Python, Advanced Statistics in Python, Machine & Deep Learning.',
    price: '₹599',
    category: 'Data Science',
    imageId: 'course-2',
    lessons: [
      { id: 'l1', title: 'Introduction to Data Science', duration: '20:00' },
      { id: 'l2', title: 'Python for Data Analysis', duration: '2:10:30' },
      { id: 'l3', title: 'Machine Learning Concepts', duration: '1:45:00' },
    ],
    level: 'Intermediate',
    isBestseller: true,
    hasPreview: true,
    enrollmentCount: 32104,
  },
  {
    id: '3',
    slug: 'digital-marketing-masterclass-23-courses-in-1',
    title: 'Digital Marketing Masterclass - 23 Courses in 1',
    description:
      'A masterclass on Digital Marketing: Social Media Marketing, SEO, YouTube, Email, Facebook Marketing, Analytics & More!',
    price: '₹399',
    category: 'Marketing',
    imageId: 'course-3',
    lessons: [
      { id: 'l1', title: 'Fundamentals of Digital Marketing', duration: '25:45' },
      { id: 'l2', title: 'SEO for Beginners', duration: '1:15:20' },
      { id: 'l3', title: 'Social Media Strategy', duration: '1:05:10' },
    ],
    level: 'Beginner',
    isBestseller: true,
    enrollmentCount: 45876,
  },
  {
    id: '4',
    slug: 'ui-ux-design-essentials',
    title: 'UI/UX Design Essentials',
    description:
      'Learn the fundamentals of UI/UX design, from user research to creating beautiful and intuitive interfaces.',
    price: '₹699',
    category: 'Design',
    imageId: 'course-4',
    lessons: [
      { id: 'l1', title: 'Introduction to UI/UX', duration: '18:00' },
      { id: 'l2', title: 'User Research and Personas', duration: '1:02:00' },
      { id: 'l3', title: 'Wireframing and Prototyping', duration: '1:30:00' },
    ],
    level: 'Beginner',
    hasPreview: true,
    enrollmentCount: 18453,
  },
  {
    id: '5',
    slug: 'cyber-security-for-beginners',
    title: 'Cyber Security for Beginners',
    description:
      'A course on how to protect yourself and your organization from cyber threats. Learn about ethical hacking, network security, and cryptography.',
    price: '₹799',
    category: 'IT & Software',
    imageId: 'course-5',
    lessons: [
      { id: 'l1', title: 'Introduction to Cyber Security', duration: '22:30' },
      { id: 'l2', title: 'Network Security Fundamentals', duration: '1:10:00' },
      { id: 'l3', title: 'Ethical Hacking Basics', duration: '1:50:00' },
    ],
    level: 'Advanced',
    enrollmentCount: 9784,
  },
  {
    id: '6',
    slug: 'cloud-computing-with-aws',
    title: 'Cloud Computing with AWS',
    description:
      'Master Amazon Web Services from scratch. Learn about EC2, S3, Lambda, and build scalable cloud applications.',
    price: '₹899',
    category: 'IT & Software',
    imageId: 'course-6',
    lessons: [
      { id: 'l1', title: 'Introduction to Cloud Computing', duration: '15:00' },
      { id: 'l2', title: 'Core AWS Services', duration: '2:00:00' },
      { id: 'l3', title: 'Building a Serverless App', duration: '1:40:00' },
    ],
    level: 'Intermediate',
    isNew: true,
    enrollmentCount: 15342,
  },
];

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
