

export type Course = {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription?: string;
  price: string;
  category: string;
  imageId: string;
  lessons: { id: string; title: string; duration: string }[];
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  tags?: string[];
  learningOutcomes?: string[];
  prerequisites?: string;
  isNew?: boolean;
  isBestseller?: boolean;
  hasPreview?: boolean;
  enrollmentCount?: number;
  status?: 'draft' | 'published' | 'unpublished';
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
    id: 'cyber-1',
    slug: 'enterprise-attacker-emulation-c2-dev',
    title: 'Enterprise Attacker Emulation & C2 Development',
    shortDescription: 'Build custom C2 frameworks and emulate real-world threat actors.',
    description:
      'Master advanced offensive techniques by building custom command-and-control frameworks and emulating real-world threat actors in enterprise environments.',
    price: '₹1999',
    category: 'Cybersecurity',
    imageId: 'course-cyber-1',
    lessons: [
      { id: 'l1', title: 'Intro to Red Teaming & C2', duration: '45:00' },
      { id: 'l2', title: 'Building Your C2 Infrastructure', duration: '2:30:00' },
      { id: 'l3', title: 'Advanced Payload Development', duration: '3:15:00' },
    ],
    level: 'Advanced',
    isBestseller: true,
    enrollmentCount: 11523,
    status: 'published',
    tags: ['red teaming', 'c2', 'malware development'],
    learningOutcomes: ['Develop a functional C2 server from scratch', 'Create advanced payloads that evade detection', 'Simulate a full-scale enterprise breach'],
    prerequisites: 'Strong understanding of networking, Windows internals, and a programming language like C++ or Go.'
  },
  {
    id: 'cyber-2',
    slug: 'website-hacking-full-stack-security',
    title: 'Website Hacking (Full Stack Security)',
    shortDescription: 'A comprehensive guide to finding and exploiting web vulnerabilities.',
    description:
      'A comprehensive guide to finding and exploiting vulnerabilities in modern web applications, from front-end to back-end.',
    price: '₹799',
    category: 'Cybersecurity',
    imageId: 'course-cyber-2',
    lessons: [
      { id: 'l1', title: 'Web Hacking Fundamentals', duration: '30:00' },
      { id: 'l2', title: 'Server-Side & Client-Side Attacks', duration: '1:45:00' },
      { id: 'l3', title: 'API Security Testing', duration: '1:20:00' },
    ],
    level: 'Intermediate',
    enrollmentCount: 28451,
     status: 'published',
    tags: ['web security', 'pentesting', 'owasp'],
    learningOutcomes: ['Identify and exploit the OWASP Top 10 vulnerabilities', 'Secure APIs against common attacks', 'Perform comprehensive security audits of web applications'],
    prerequisites: 'Basic knowledge of web technologies (HTML, JavaScript, HTTP).'
  },
  {
    id: 'cyber-3',
    slug: 'wifi-hacking-wireless-security',
    title: 'Wi-Fi Hacking & Wireless Security',
    shortDescription: 'Learn to audit and secure wireless networks.',
    description:
      'Learn to audit and secure wireless networks. Master techniques for cracking WPA2, sniffing packets, and deploying rogue access points.',
    price: '₹699',
    category: 'Cybersecurity',
    imageId: 'course-cyber-3',
    lessons: [
      { id: 'l1', title: 'Wireless Networking Basics', duration: '25:00' },
      { id: 'l2', title: 'Cracking Wi-Fi Passwords', duration: '1:10:00' },
      { id: 'l3', title: 'Man-in-the-Middle Attacks', duration: '55:00' },
    ],
    level: 'Beginner',
    enrollmentCount: 19872,
     status: 'published',
  },
  {
    id: 'cyber-4',
    slug: 'android-hacking-apk-rat-fud',
    title: 'Android Hacking (APK • RAT • FUD)',
    shortDescription: 'Reverse engineer Android apps and create undetectable RATs.',
    description:
      'Dive into mobile security by reverse engineering Android apps, creating undetectable remote access trojans (RATs), and bypassing security measures.',
    price: '₹899',
    category: 'Cybersecurity',
    imageId: 'course-cyber-4',
    lessons: [
      { id: 'l1', title: 'Android Security Architecture', duration: '40:00' },
      { id: 'l2', title: 'Reverse Engineering APKs', duration: '1:50:00' },
      { id: 'l3', title: 'Building a Custom RAT', duration: '2:10:00' },
    ],
    level: 'Advanced',
    enrollmentCount: 8421,
     status: 'published',
  },
  {
    id: 'cyber-5',
    slug: 'advanced-social-engineering',
    title: 'Advanced Social Engineering',
    shortDescription: 'Execute sophisticated phishing, vishing, and impersonation attacks.',
    description:
      'Explore the psychological principles behind social engineering and learn to execute sophisticated phishing, vishing, and impersonation attacks.',
    price: '₹749',
    category: 'Cybersecurity',
    imageId: 'course-cyber-5',
    lessons: [
      { id: 'l1', title: 'Psychology of Influence', duration: '50:00' },
      { id: 'l2', title: 'OSINT & Reconnaissance', duration: '1:30:00' },
      { id: 'l3', title: 'Crafting Phishing Campaigns', duration: '1:15:00' },
    ],
    level: 'Intermediate',
    enrollmentCount: 13488,
     status: 'published',
  },
  {
    id: 'cyber-6',
    slug: 'antivirus-evasion-research-track',
    title: 'Antivirus Evasion (Research Track)',
    shortDescription: 'Bypass AV detection through advanced polymorphism and metamorphism.',
    description:
      'A deep dive into how antivirus software works and the advanced techniques used by malware authors to bypass detection through polymorphism and metamorphism.',
    price: '₹544',
    category: 'Cybersecurity',
    imageId: 'course-cyber-6',
    lessons: [
      { id: 'l1', title: 'How Antivirus Works', duration: '45:00' },
      { id: 'l2', title: 'Signature-Based Evasion', duration: '1:25:00' },
      { id: 'l3', title: 'Behavioral Analysis Bypass', duration: '1:45:00' },
    ],
    level: 'Advanced',
    enrollmentCount: 7521,
    status: 'draft',
  },
  {
    id: 'cyber-7',
    slug: 'kali-linux-pentesting-basics',
    title: 'Kali Linux & Pentesting Basics',
    shortDescription: 'Your first step into ethical hacking with Kali Linux.',
    description:
      'Your first step into ethical hacking. Learn to use Kali Linux and its powerful tools for network scanning, vulnerability assessment, and exploitation.',
    price: '₹599',
    category: 'Cybersecurity',
    imageId: 'course-cyber-7',
    lessons: [
      { id: 'l1', title: 'Setting up your Kali Lab', duration: '35:00' },
      { id: 'l2', title: 'Essential Linux Commands', duration: '1:00:00' },
      { id: 'l3', title: 'First Pentest with Metasploit', duration: '1:30:00' },
    ],
    level: 'Beginner',
    isNew: true,
    enrollmentCount: 35102,
     status: 'published',
  },
  {
    id: 'cyber-8',
    slug: 'bug-hunting-a-z-live-practicals',
    title: 'Bug Hunting A–Z (Live Practicals)',
    shortDescription: 'Learn bug bounty hunting with practical, hands-on labs.',
    description:
      'Learn the art and science of bug bounty hunting. A practical, hands-on course covering recon, vulnerability identification, and report writing.',
    price: '₹199',
    category: 'Cybersecurity',
    imageId: 'course-cyber-8',
    lessons: [
      { id: 'l1', title: 'Intro to Bug Bounty Programs', duration: '20:00' },
      { id: 'l2', title: 'Automated & Manual Recon', duration: '1:10:00' },
      { id: 'l3', title: 'Exploiting Common Web Bugs', duration: '1:40:00' },
    ],
    level: 'Beginner',
    isBestseller: true,
    enrollmentCount: 52198,
     status: 'published',
  },
  {
    id: 'cyber-9',
    slug: 'reverse-engineering-windows-android',
    title: 'Reverse Engineering (Windows & Android)',
    shortDescription: 'Analyze malicious software on Windows and Android.',
    description:
      'Unpack and analyze malicious software and legitimate applications on both Windows and Android platforms to understand their inner workings.',
    price: '₹999',
    category: 'Cybersecurity',
    imageId: 'course-cyber-9',
    lessons: [
      { id: 'l1', title: 'Assembly Language Basics', duration: '1:00:00' },
      { id: 'l2', title: 'Debugging with x64dbg & IDA', duration: '2:15:00' },
      { id: 'l3', title: 'Static & Dynamic Analysis', duration: '1:55:00' },
    ],
    level: 'Advanced',
    enrollmentCount: 6843,
     status: 'published',
  },
  {
    id: 'cyber-10',
    slug: 'start-hacking-from-zero-2-0',
    title: 'Start Hacking From Zero 2.0',
    shortDescription: 'The ultimate beginner\'s course to start your ethical hacking journey.',
    description:
      'The ultimate beginner\'s course to start your ethical hacking journey, covering everything from basic concepts to your first hands-on hacks.',
    price: '₹499',
    category: 'Cybersecurity',
    imageId: 'course-cyber-10',
    lessons: [
      { id: 'l1', title: 'What is Ethical Hacking?', duration: '15:00' },
      { id: 'l2', title: 'Networking for Hackers', duration: '1:05:00' },
      { id: 'l3', title: 'Using Your First Exploit', duration: '45:00' },
    ],
    level: 'Beginner',
    hasPreview: true,
    enrollmentCount: 41337,
     status: 'published',
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

    