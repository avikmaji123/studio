import Image from 'next/image';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';

import { newsArticles } from '@/lib/news-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type NewsArticlePageProps = {
  params: {
    slug: string;
  };
};

export default function NewsArticlePage({ params }: NewsArticlePageProps) {
  const article = newsArticles.find(a => a.slug === params.slug);

  if (!article) {
    notFound();
  }

  const placeholderImage = PlaceHolderImages.find(p => p.id === 'news-placeholder');
  const imageUrl = article.imageUrl || placeholderImage?.imageUrl;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
       <div className="mb-8">
        <Button asChild variant="ghost">
          <Link href="/news">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to News
          </Link>
        </Button>
      </div>

      <article>
        <header className="mb-8">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                <time dateTime={article.publishDate}>
                    {format(new Date(article.publishDate), 'MMMM d, yyyy')}
                </time>
                <span>&bull;</span>
                <span>Source: {article.sourceName}</span>
            </div>
            <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight mb-4">
                {article.title}
            </h1>
        </header>

        {imageUrl && (
            <div className="relative aspect-video w-full mb-8">
                <Image
                    src={imageUrl}
                    alt={article.title}
                    fill
                    className="object-cover rounded-xl shadow-lg"
                />
            </div>
        )}

        <div 
          className="prose dark:prose-invert max-w-none text-lg text-foreground/80" 
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <footer className="mt-12 pt-8 border-t">
            <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Article content provided by {article.sourceName}.</p>
                <Button asChild variant="outline">
                    <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer">
                        Read Original Source
                        <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                </Button>
            </div>
        </footer>
      </article>
    </div>
  );
}
