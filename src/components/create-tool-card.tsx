import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CreateToolCardProps {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  disabled?: boolean;
}

export default function CreateToolCard({
  href,
  title,
  description,
  icon: Icon,
  disabled = false,
}: CreateToolCardProps) {
  const cardContent = (
    <Card
      className={cn(
        'group h-full flex flex-col transition-all duration-200',
        disabled
          ? 'bg-muted/50 cursor-not-allowed'
          : 'hover:shadow-lg hover:-translate-y-1 hover:border-primary'
      )}
    >
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className={cn("p-3 rounded-full bg-primary/10", disabled ? "text-muted-foreground" : "text-primary group-hover:text-primary")}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="font-headline text-xl">{title}</CardTitle>
          </div>
        </div>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>
    </Card>
  );

  if (disabled) {
    return <div>{cardContent}</div>;
  }

  return <Link href={href}>{cardContent}</Link>;
}
