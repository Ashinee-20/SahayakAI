import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash2 } from 'lucide-react';

const myContent = [
    { type: 'Lesson Plan', title: 'Algebra Basics for Grade 8', date: '2 days ago' },
    { type: 'Assessment', title: 'Quiz on Photosynthesis', date: '3 days ago' },
    { type: 'Story', title: 'The Water Cycle Adventure', date: '5 days ago' },
    { type: 'Class Notes', title: 'Lecture on Indian History', date: '1 week ago' },
];

export default function MySpacePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">My Space</h1>
        <p className="text-muted-foreground">Your personal hub for all your content and resources.</p>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">My Content</TabsTrigger>
          <TabsTrigger value="schedule">My Schedule</TabsTrigger>
          <TabsTrigger value="textbooks">My Textbooks</TabsTrigger>
          <TabsTrigger value="references">My References</TabsTrigger>
        </TabsList>
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>My Content</CardTitle>
              <CardDescription>All your generated lesson plans, assessments, notes, and stories.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Date Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myContent.map((item) => (
                    <TableRow key={item.title}>
                      <TableCell><Badge variant="secondary">{item.type}</Badge></TableCell>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>My Schedule</CardTitle>
              <CardDescription>Your class schedule. (Placeholder)</CardDescription>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              <p>Schedule feature coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="textbooks">
          <Card>
            <CardHeader>
              <CardTitle>My Textbooks</CardTitle>
              <CardDescription>Your registered NCERT textbooks. (Placeholder)</CardDescription>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              <p>Textbook management feature coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="references">
          <Card>
            <CardHeader>
              <CardTitle>My References</CardTitle>
              <CardDescription>Your collection of external resources. (Placeholder)</CardDescription>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              <p>Reference management feature coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
