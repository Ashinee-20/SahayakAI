'use client';

import { BookOpenCheck } from 'lucide-react';

export const Header = () => {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-4">
        <BookOpenCheck className="w-16 h-16 text-primary" />
      </div>
      <h1 className="text-5xl font-headline font-bold text-gray-800">
        Sahayak
      </h1>
      <p className="mt-2 text-xl text-muted-foreground italic">
        Create, Share, Adapt
      </p>
      <p className="mt-6 text-lg text-gray-600">
        Your AI-powered teaching assistant for low-resource, multi-grade classrooms.
      </p>
    </div>
  );
};
