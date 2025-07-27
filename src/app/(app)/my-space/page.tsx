'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash2, Loader2, BookOpen, User, Clock, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getUserContent, listTextbooks, Content } from '@/services/firebase-service';
import { Timestamp } from 'firebase/firestore';
import Link from 'next/link';
import { useTranslation } from '@/hooks/use-translation';

type ContentWithId = Content & { id: string };
type TextbookFile = { name: string; url: string };

// Mock schedule data
const mockSchedule = [
  { time: '09:00 AM', subject: 'Mathematics', grade: 'Grade 8', room: 'Room 101' },
  { time: '10:30 AM', subject: 'Science', grade: 'Grade 7', room: 'Room 205' },
  { time: '12:00 PM', subject: 'English', grade: 'Grade 6', room: 'Room 103' },
  { time: '01:30 PM', subject: 'History', grade: 'Grade 9', room: 'Room 201' },
  { time: '03:00 PM', subject: 'Geography', grade: 'Grade 8', room: 'Room 104' },
];
export default function MySpacePage() {
  const { user, isGuest } = useAuth();
  const [content, setContent] = useState<ContentWithId[]>([]);
  const [textbooks, setTextbooks] = useState<TextbookFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    async function loadData() {
      if (!user || isGuest) {
        return;
      }
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
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user, isGuest]);
  
  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getContentTypeLabel = (type: Content['type']) => {
    const labels: Record<Content['type'], string> = {
        lessonPlan: t('contentType.lessonPlan'),
        assessment: t('contentType.assessment'),
        story: t('contentType.story'),
        visualAid: t('contentType.visualAid'),
        classNotes: t('contentType.classNotes'),
    };
    return labels[type];
  }
  
  const renderContentTable = (filteredContent: ContentWithId[]) => (
     <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('type')}</TableHead>
          <TableHead>{t('title')}</TableHead>
          <TableHead>{t('dateCreated')}</TableHead>
          <TableHead className="text-right">{t('actions')}</TableHead>
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

  if (isGuest) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-headline font-bold">{t('mySpace.title')}</h1>
          <p className="text-muted-foreground">{t('mySpace.subtitle')}</p>
        </div>
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <User className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t('mySpace.guest.title')}</h3>
            <p className="text-muted-foreground mb-6">{t('mySpace.guest.description')}</p>
            <Button asChild>
              <Link href="/">{t('signIn')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">{t('mySpace.title')}</h1>
        <p className="text-muted-foreground">{t('mySpace.subtitle')}</p>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">{t('mySpace.tabs.myContent')}</TabsTrigger>
          <TabsTrigger value="notes">{t('mySpace.tabs.myNotes')}</TabsTrigger>
          <TabsTrigger value="schedule">{t('mySpace.tabs.mySchedule')}</TabsTrigger>
          <TabsTrigger value="textbooks">{t('mySpace.tabs.myTextbooks')}</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>{t('mySpace.content.title')}</CardTitle>
              <CardDescription>{t('mySpace.content.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                renderContentTable(content)
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
         <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>{t('mySpace.notes.title')}</CardTitle>
              <CardDescription>{t('mySpace.notes.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                renderContentTable(content.filter(c => c.type === 'classNotes'))
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>{t('mySpace.schedule.title')}</CardTitle>
              <CardDescription>Your weekly class schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Today's Schedule</span>
                </div>
                <div className="grid gap-3">
                  {mockSchedule.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[80px]">
                          <Clock className="h-4 w-4" />
                          <span>{item.time}</span>
                        </div>
                        <div>
                          <p className="font-semibold">{item.subject}</p>
                          <p className="text-sm text-muted-foreground">{item.grade}</p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.room}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="textbooks">
          <Card>
            <CardHeader>
              <CardTitle>{t('mySpace.textbooks.title')}</CardTitle>
              <CardDescription>{t('mySpace.textbooks.description')}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                {isLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                textbooks.length > 0 ? (
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
                        <p>{t('mySpace.textbooks.empty')}</p>
                    </div>
                )
                )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
