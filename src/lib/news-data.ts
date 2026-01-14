export type NewsArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl?: string;
  publishDate: string;
  sourceName: string;
  sourceUrl: string;
};

// This is mock data that simulates parsed RSS feed items.
// In a real application, this would be fetched and parsed on the server.
export const newsArticles: NewsArticle[] = [
  {
    id: '1',
    slug: 'the-future-of-web-development-in-2025',
    title: 'The Future of Web Development in 2025',
    excerpt: 'Explore the latest trends shaping the future of web development, from AI-powered tools to the rise of edge computing. What skills should you be learning to stay ahead?',
    content: `
<p>The web development landscape is in a constant state of flux, and 2025 is shaping up to be a pivotal year. Several key trends are emerging that will redefine how we build, deploy, and interact with web applications.</p>
<h3>AI and Machine Learning Integration</h3>
<p>Artificial intelligence is no longer a futuristic concept; it's here. AI-powered code assistants like GitHub Copilot are becoming indispensable, but the integration goes deeper. Expect to see more AI-driven UI/UX design tools that can generate layouts, suggest color palettes, and even perform A/B testing automatically. On the backend, machine learning models will be more accessible for tasks like personalization, fraud detection, and content recommendation.</p>
<h3>The Rise of Edge Computing</h3>
<p>Moving computation closer to the user is a game-changer for performance. Edge computing allows for processing data at the network edge, reducing latency and improving responsiveness. For web developers, this means leveraging services like Vercel's Edge Functions or Cloudflare Workers to create highly performant, globally distributed applications without managing complex server infrastructure.</p>
<h3>WebAssembly (Wasm) Gains Traction</h3>
<p>WebAssembly is opening up new possibilities by allowing code written in languages like C++, Rust, and Go to run in the browser at near-native speed. This is particularly impactful for performance-intensive applications such as 3D rendering, video editing, and complex data visualization, which were previously limited to native desktop applications.</p>
`,
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f2ba8a620542?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHx3ZWIlMjBkZXZlbG9wbWVudHxlbnwwfHx8fDE3NzAxODIzMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    publishDate: '2024-07-28',
    sourceName: 'Tech Trends Weekly',
    sourceUrl: '#',
  },
  {
    id: '2',
    slug: 'ux-design-principles-for-data-heavy-dashboards',
    title: '5 UX Design Principles for Data-Heavy Dashboards',
    excerpt: 'Designing a dashboard that is both powerful and intuitive is a major challenge. We explore five key principles to help you create user-friendly, data-rich interfaces.',
    content: `
<p>A data dashboard can quickly become a cluttered mess if not designed with care. The key is to present complex information in a way that is easily digestible and actionable. Here are five UX principles to guide your design process:</p>
<ol>
  <li><strong>Establish a Clear Visual Hierarchy:</strong> Not all data is created equal. Use size, color, and placement to guide the user's eye to the most critical information first. Key Performance Indicators (KPIs) should be prominent, while secondary data can be less emphasized.</li>
  <li><strong>Prioritize Context over Raw Data:</strong> Numbers without context are meaningless. Instead of just showing '2,503', show '2,503 users (+15% from last month)'. Providing context and comparisons helps users understand the significance of the data at a glance.</li>
  -
  <li><strong>Choose the Right Visualization for the Job:</strong> A bar chart is not always the answer. Understand the story you want to tell with the data. Use line charts for trends over time, pie charts for proportions (sparingly!), and tables for detailed lookups.</li>
  <li><strong>Incorporate Progressive Disclosure:</strong> Don't overwhelm users with every piece of data at once. Show a high-level summary by default and allow users to drill down into more detailed views if they need to. This keeps the interface clean and focused.</li>
  <li><strong>Design for Actionability:</strong> A good dashboard should empower users to make decisions. Ensure that insights are linked to actions. If a metric is underperforming, provide a direct link or pathway for the user to investigate or address the issue.</li>
</ol>
`,
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxkYXNoYm9hcmR8ZW58MHx8fHwxNzcwMTgyNDgxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    publishDate: '2024-07-25',
    sourceName: 'UX Planet',
    sourceUrl: '#',
  },
  {
    id: '3',
    slug: 'the-psychology-of-color-in-marketing',
    title: 'The Psychology of Color in Marketing',
    excerpt: 'Color is a powerful tool in a marketer’s arsenal. It can influence mood, attract attention, and even drive conversions. Let’s dive into the psychology behind what colors mean to your audience.',
    content: `
<p>Color is more than just an aesthetic choice; it's a powerful psychological tool. When used correctly in marketing, it can evoke specific emotions and drive user behavior. Here’s a quick breakdown of common color associations in Western cultures:</p>
<ul>
  <li><strong>Red:</strong> Evokes strong emotions like passion, excitement, and urgency. It's often used for clearance sales or to create a sense of importance. Think of brands like Coca-Cola and Netflix.</li>
  <li><strong>Blue:</strong> Often associated with trust, security, and stability. It's a favorite among financial institutions and tech companies looking to build credibility, such as Facebook, and American Express.</li>
  <li><strong>Green:</strong> Synonymous with nature, health, and tranquility. It's commonly used by brands focused on wellness, sustainability, and finance (money).</li>
  <li><strong>Yellow:</strong> Represents optimism, youth, and clarity. It's eye-catching and can be used to grab attention, but can also cause eye fatigue if overused.</li>
  <li><strong>Black:</strong> Signifies luxury, power, and sophistication. High-end brands often use black to create a sleek and premium feel.</li>
</ul>
<p>It's crucial to remember that color perception can vary significantly across different cultures. Always research your target audience to ensure your color choices resonate positively and effectively convey your brand message.</p>
`,
    publishDate: '2024-07-22',
    sourceName: 'Marketing Insights',
    sourceUrl: '#',
  },
   {
    id: '4',
    slug: 'why-your-business-needs-a-design-system',
    title: 'Why Your Business Needs a Design System',
    excerpt: 'A design system is more than just a style guide; it’s a single source of truth that groups all the elements that will allow the teams to design, realize, and develop a product.',
    content: `
<p>In today's fast-paced development world, consistency and efficiency are paramount. This is where a design system comes in. It's a comprehensive library of reusable components, patterns, and guidelines that ensures a cohesive user experience across all your products.</p>
<h3>Benefits of a Design System:</h3>
<ul>
    <li><strong>Increased Efficiency:</strong> With a library of pre-built, pre-tested components, designers and developers can build products faster instead of reinventing the wheel every time.</li>
    <li><strong>Improved Consistency:</strong> A design system ensures that all your products have a consistent look and feel, which strengthens brand identity and improves user trust.</li>
    <li><strong>Better Collaboration:</strong> It provides a shared language and a single source of truth for designers, developers, product managers, and other stakeholders, reducing miscommunication and streamlining the workflow.</li>
    <li><strong>Scalability:</strong> As your company grows and your product offerings expand, a design system makes it much easier to maintain quality and consistency at scale.</li>
</ul>
<p>Building a design system is an investment, but the long-term benefits in terms of speed, quality, and brand cohesion are well worth the effort.</p>
`,
    imageUrl: 'https://images.unsplash.com/photo-1541462608143-67571c6738dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxkZXNpZ24lMjBzeXN0ZW18ZW58MHx8fHwxNzcwMTgzMjM5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    publishDate: '2024-07-20',
    sourceName: 'Creative Bloq',
    sourceUrl: '#',
  },
];
