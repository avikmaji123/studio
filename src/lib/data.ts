export type Course = {
  id: string;
  title: string;
  description: string;
  price: string;
  category: string;
  imageId: string;
  lessons: { id: string; title: string; duration: string }[];
};

export type Testimonial = {
    id: string;
    name: string;
    title: string;
    quote: string;
    imageId: string;
}

export const courses: Course[] = [
  {
    id: '1',
    title: 'The Complete 2024 Web Development Bootcamp',
    description: 'Become a Full-Stack Web Developer with just one course. HTML, CSS, Javascript, Node, React, MongoDB, Web3 and DApps.',
    price: '₹499',
    category: 'Web Development',
    imageId: 'course-1',
    lessons: [
      { id: 'l1', title: 'Introduction to Web Development', duration: '15:30' },
      { id: 'l2', title: 'HTML & CSS Basics', duration: '45:10' },
      { id: 'l3', title: 'JavaScript Fundamentals', duration: '1:20:00' },
    ],
  },
  {
    id: '2',
    title: 'The Data Science Course 2024: Complete Data Science Bootcamp',
    description: 'Complete Data Science Training: Mathematics, Statistics, Python, Advanced Statistics in Python, Machine & Deep Learning.',
    price: '₹599',
    category: 'Data Science',
    imageId: 'course-2',
    lessons: [
      { id: 'l1', title: 'Introduction to Data Science', duration: '20:00' },
      { id: 'l2', title: 'Python for Data Analysis', duration: '2:10:30' },
      { id: 'l3', title: 'Machine Learning Concepts', duration: '1:45:00' },
    ],
  },
  {
    id: '3',
    title: 'Digital Marketing Masterclass - 23 Courses in 1',
    description: 'Grow Your Business with Digital Marketing: Social Media Marketing, SEO, YouTube, Email, Facebook Marketing, Analytics & More!',
    price: '₹399',
    category: 'Marketing',
    imageId: 'course-3',
    lessons: [
      { id: 'l1', title: 'Fundamentals of Digital Marketing', duration: '25:45' },
      { id: 'l2', title: 'SEO for Beginners', duration: '1:15:20' },
      { id: 'l3', title: 'Social Media Strategy', duration: '1:05:10' },
    ],
  },
    {
    id: '4',
    title: 'UI/UX Design Essentials',
    description: 'Learn the fundamentals of UI/UX design, from user research to creating beautiful and intuitive interfaces.',
    price: '₹699',
    category: 'Design',
    imageId: 'course-4',
    lessons: [
      { id: 'l1', title: 'Introduction to UI/UX', duration: '18:00' },
      { id: 'l2', title: 'User Research and Personas', duration: '1:02:00' },
      { id: 'l3', title: 'Wireframing and Prototyping', duration: '1:30:00' },
    ],
  },
  {
    id: '5',
    title: 'Cyber Security for Beginners',
    description: 'Protect yourself and your organization from cyber threats. Learn about ethical hacking, network security, and cryptography.',
    price: '₹799',
    category: 'IT & Software',
    imageId: 'course-5',
    lessons: [
      { id: 'l1', title: 'Introduction to Cyber Security', duration: '22:30' },
      { id: 'l2', title: 'Network Security Fundamentals', duration: '1:10:00' },
      { id: 'l3', title: 'Ethical Hacking Basics', duration: '1:50:00' },
    ],
  },
  {
    id: '6',
    title: 'Cloud Computing with AWS',
    description: 'Master Amazon Web Services from scratch. Learn about EC2, S3, Lambda, and build scalable cloud applications.',
    price: '₹899',
    category: 'IT & Software',
    imageId: 'course-6',
    lessons: [
      { id: 'l1', title: 'Introduction to Cloud Computing', duration: '15:00' },
      { id: 'l2', title: 'Core AWS Services', duration: '2:00:00' },
      { id: 'l3', title: 'Building a Serverless App', duration: '1:40:00' },
    ],
  },
];


export const testimonials: Testimonial[] = [
    {
        id: '1',
        name: 'Sarah Johnson',
        title: 'Web Developer',
        quote: "CourseVerse transformed my career. The web development bootcamp was comprehensive and the instructor was amazing. I landed a new job within a month of completing the course!",
        imageId: 'testimonial-1',
    },
    {
        id: '2',
        name: 'Michael Chen',
        title: 'Data Analyst',
        quote: "The data science course was exactly what I needed to level up my skills. The content is up-to-date and the hands-on projects were invaluable. Highly recommended for aspiring data scientists.",
        imageId: 'testimonial-2',
    },
    {
        id: '3',
        name: 'Priya Patel',
        title: 'Marketing Manager',
        quote: "As a marketing professional, I found the digital marketing masterclass incredibly useful. It covers everything from SEO to social media. My campaign results have improved significantly.",
        imageId: 'testimonial-3',
    }
];
