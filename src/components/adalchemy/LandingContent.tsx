"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap } from 'lucide-react';
import Image from 'next/image';

export function LandingContent() {
  return (
    <div className="flex flex-col items-center text-center space-y-12 py-8 md:py-16">
      <header className="space-y-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-primary">
          AdAlchemy: <span className="block sm:inline text-foreground">Transform Ideas into Ads</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-foreground/80">
          Generate compelling banner images in seconds using the power of AI.
          Spark your creativity and captivate your audience with unique, eye-catching visuals.
        </p>
      </header>

      <div className="relative w-full max-w-3xl">
        <Image
          src="https://placehold.co/1200x600.png"
          alt="Abstract representation of AI generating ad banners"
          width={1200}
          height={600}
          className="rounded-xl shadow-2xl object-cover"
          data-ai-hint="abstract technology"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent rounded-xl"></div>
      </div>
      
      <Link href="/generate">
        <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-xl py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
          <Zap className="mr-2 h-6 w-6" />
          Get Started Now
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </Link>

      <section className="w-full max-w-4xl pt-12">
        <h2 className="text-3xl font-bold mb-8 text-primary">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-card p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-semibold mb-2 text-primary">1. Describe Your Vision</h3>
            <p className="text-card-foreground/80">Enter a text prompt detailing the ad banner you need. Be as specific or as creative as you like!</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-semibold mb-2 text-primary">2. AI Magic Happens</h3>
            <p className="text-card-foreground/80">Our advanced AI interprets your prompt and generates four unique banner options in moments.</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-semibold mb-2 text-primary">3. Download & Deploy</h3>
            <p className="text-card-foreground/80">Review the generated images, choose your favorite, and download it instantly for your campaigns.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
