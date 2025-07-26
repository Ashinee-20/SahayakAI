'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash2, Loader2, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getUserContent, listTextbooks, Content } from '@/services/firebase-service';
import { Timestamp } from 'firebase/firestore';
import Link from 'next/link';

type ContentWithId = Content & { id: string };
type TextbookFile = { name: string; url: string };

export default function MySpacePage() {
  const { user } = useAuth();
  const [content, setContent] = useState<ContentWithId[]>([]);
  const [textbooks, setTextbooks] = useState<TextbookFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setIsLoading(true);
      try {
        const [userContent, textbookFiles] = await Promise.all([
          getUserContent(user.uid),
          listTextbooks(user.uid),
        ]);
        setContent(userContent.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()));
        setTextbooks(textbookFiles);
      } catch (error) {
        console.error("Failed to load user data:", error);
        // You can add a toast notification here
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user]);
  
  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getContentTypeLabel = (type: Content['type']) => {
    const labels: Record<Content['type'], string> = {
        lessonPlan: 'Lesson Plan',
        assessment: 'Assessment',
        story: 'Story',
        visualAid: 'Visual Aid',
        classNotes: 'Class Notes',
    };
    return labels[type];
  }
  
  const renderContentTable = (filteredContent: ContentWithId[]) => (
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
        {filteredContent.map((item) => (
          <TableRow key={item.id}>
            <TableCell><Badge variant="secondary">{getContentTypeLabel(item.type)}</Badge></TableCell>
            <TableCell className="font-medium">{item.title}</TableCell>
            <TableCell>{formatDate(item.createdAt)}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">My Space</h1>
        <p className="text-muted-foreground">Your personal hub for all your content and resources.</p>
      </div>

      {isLoading ? (
         <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
         </div>
      ) : (
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">My Content</TabsTrigger>
          <TabsTrigger value="notes">My Notes</TabsTrigger>
          <TabsTrigger value="schedule">My Schedule</TabsTrigger>
          <TabsTrigger value="textbooks">My Textbooks</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>My Content</CardTitle>
              <CardDescription>All your generated lesson plans, assessments, notes, and stories.</CardDescription>
            </CardHeader>
            <CardContent>
              {renderContentTable(content)}
            </CardContent>
          </Card>
        </TabsContent>
        
         <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>My Notes</CardTitle>
              <CardDescription>All your generated class notes from audio recordings.</CardDescription>
            </CardHeader>
            <CardContent>
              {renderContentTable(content.filter(c => c.type === 'classNotes'))}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>My Schedule</CardTitle>
              <CardDescription>Your class schedule. (Placeholder)</CardDescription>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground pt-6">
              <p>Schedule feature coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="textbooks">
          <Card>
            <CardHeader>
              <CardTitle>My Textbooks</CardTitle>
              <CardDescription>Your collection of textbook PDFs from Firebase Storage.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                {textbooks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {textbooks.map(book => (
                            <Link key={book.name} href={book.url} target="_blank" rel="noopener noreferrer">
                                <Card className="hover:shadow-lg transition-shadow hover:border-primary">
                                    <CardContent className="flex flex-col items-center justify-center p-6">
                                        <BookOpen className="h-12 w-12 text-primary mb-4" />
                                        <p className="text-center font-semibold">{book.name}</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground">
                        <p>No textbooks found. Please follow the setup guide to upload your textbooks to Firebase Storage.</p>
                    </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      )}
    </div>
  );
}
