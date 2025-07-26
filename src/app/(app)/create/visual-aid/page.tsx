import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function VisualAidPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
       <div>
        <h1 className="text-3xl font-headline font-bold">Generate Visual Aid</h1>
        <p className="text-muted-foreground">This feature is currently under construction.</p>
      </div>
      <Card className="text-center">
        <CardHeader>
            <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit">
                <Construction className="h-12 w-12" />
            </div>
        </CardHeader>
        <CardContent>
          <CardTitle className="text-2xl font-headline">Coming Soon!</CardTitle>
          <CardDescription className="mt-2 text-lg">
            We are working hard to bring you the Visual Aid generation tool.
            Check back later for updates!
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
