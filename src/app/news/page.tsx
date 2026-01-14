'use client';
import { NewsCard } from '@/components/app/news-card';
import { newsArticles } from '@/lib/news-data';

export default function NewsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">News & Updates</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Stay informed with the latest trends in technology, design, and marketing.
        </p>
      </div>

      {newsArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {newsArticles.map(article => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold">No News Yet</h3>
          <p className="text-muted-foreground mt-2">Check back soon for the latest updates.</p>
        </div>
      )}
    </div>
  );
}
