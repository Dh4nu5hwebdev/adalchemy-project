
"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Download, ImageOff } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ImageCardProps {
  imageUrl: string | null;
  index: number;
  isLoading?: boolean;
}

export function ImageCard({ imageUrl, index, isLoading = false }: ImageCardProps) {
  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `adalchemy_banner_${index + 1}.png`; // Assuming PNG, adjust if type varies
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-xl">
        <CardContent className="p-0">
          <Skeleton className="aspect-[3/2] w-full" />
        </CardContent>
        <CardFooter className="p-3 bg-card/50">
          <Skeleton className="h-9 w-full" />
        </CardFooter>
      </Card>
    );
  }
  
  // Using a generic placeholder aspect ratio if needed
  const placeholderImage = `https://placehold.co/600x400.png`; 

  return (
    <Card className="overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-xl">
      <CardContent className="p-0">
        <div className="aspect-[3/2] w-full bg-muted flex items-center justify-center relative">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`Generated Banner ${index + 1}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" // Example sizes, adjust based on grid layout
              className="object-cover" // Ensure object-cover for fill to work as expected
              data-ai-hint="advertisement banner"
            />
          ) : (
             <ImageOff className="w-16 h-16 text-muted-foreground" />
          )}
        </div>
      </CardContent>
      <CardFooter className="p-3 bg-card/80">
        <Button
          onClick={handleDownload}
          disabled={!imageUrl}
          variant="outline"
          className="w-full border-primary/50 text-primary hover:bg-primary/10 hover:text-primary"
        >
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </CardFooter>
    </Card>
  );
}
