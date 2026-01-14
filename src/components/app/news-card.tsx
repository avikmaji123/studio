import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { NewsArticle } from '@/lib/news-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type NewsCardProps = {
  article: NewsArticle;
};

export function NewsCard({ article }: NewsCardProps) {
  const placeholderImage = PlaceHolderImages.find(p => p.id === 'news-placeholder');
  const imageUrl = article.imageUrl || placeholderImage?.imageUrl;

  return (
    <Card className="flex flex-col overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-xl group h-full">
      <Link href={`/news/${article.slug}`} className="flex flex-col h-full">
        <div className="relative aspect-video w-full">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={article.title}
              fill
              className="object-cover"
            />
          )}
        </div>
        <CardHeader className="p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span>{article.sourceName}</span>
            <span aria-hidden="true">&bull;</span>
            <time dateTime={article.publishDate}>
                {format(new Date(article.publishDate), 'MMM d, yyyy')}
            </time>
          </div>
          <h3 className="text-xl font-semibold leading-tight line-clamp-2 h-[3.25rem]">
            {article.title}
          </h3>
        </CardHeader>
        <CardContent className="flex-grow p-6 pt-0">
          <p className="line-clamp-3 text-muted-foreground">{article.excerpt}</p>
        </CardContent>
      </Link>
    </Card>
  );
}
