'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, MessageSquare, Upload, ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/use-translation';

const initialCommunityPosts = [
  {
    id: 1,
    author: 'Anjali Sharma',
    school: 'Delhi Public School',
    avatar: 'https://placehold.co/40x40.png',
    initials: 'AS',
    type: 'Lesson Plan',
    grade: '7',
    subject: 'Maths',
    title: 'Interactive Geometry Lesson for Grade 7',
    description: 'A fun, hands-on lesson plan to teach basic geometric shapes and their properties.',
    content: '{\n  "title": "Interactive Geometry Lesson",\n  "grade": "7",\n  "subject": "Maths",\n  "objectives": ["Identify shapes", "Understand properties"],\n  "activities": ["Shape hunt", "Building with blocks"]\n}',
    likes: 15,
    comments: 4,
    createdAt: new Date('2023-10-26T10:00:00Z'),
  },
  {
    id: 2,
    author: 'Ravi Kumar',
    school: 'Kendriya Vidyalaya',
    avatar: 'https://placehold.co/40x40.png',
    initials: 'RK',
    type: 'Assessment',
    grade: '5',
    subject: 'Science',
    title: 'Grade 5 Science - Human Body Systems Quiz',
    description: 'A comprehensive quiz covering the digestive, circulatory, and respiratory systems.',
    content: '{\n  "title": "Human Body Systems Quiz",\n  "questions": [\n    {"q": "Which organ pumps blood?", "a": "Heart"},\n    {"q": "What is the function of the lungs?", "a": "Breathing"}\n  ]\n}',
    likes: 22,
    comments: 8,
    createdAt: new Date('2023-10-28T14:30:00Z'),
  },
   {
    id: 3,
    author: 'Priya Singh',
    school: 'Modern School',
    avatar: 'https://placehold.co/40x40.png',
    initials: 'PS',
    type: 'Story',
    grade: '3',
    subject: 'Science',
    title: 'The Tale of Two Protons',
    description: 'An engaging story to explain the concept of atoms and molecules to young learners.',
    content: 'Once upon a time, in a tiny world called Atomsville, lived two best friends, Percy the Proton and Nelly the Neutron. They lived in a cozy house called the Nucleus...',
    likes: 30,
    comments: 12,
    createdAt: new Date('2023-10-20T09:00:00Z'),
  },
];

type Post = typeof initialCommunityPosts[0];

export default function CommunityPage() {
  const [posts, setPosts] = useState(initialCommunityPosts);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [adaptedContent, setAdaptedContent] = useState('');
  const { t } = useTranslation();

  const handleAdaptClick = (post: Post) => {
    setSelectedPost(post);
    setAdaptedContent(post.content);
  }

  const handleAdaptConfirm = () => {
    if (!selectedPost) return;
    // In a real app, you would save `adaptedContent` to the user's "My Space" in Firestore.
    console.log(`Adapting content for "${selectedPost.title}"`);
    console.log(adaptedContent);
    alert('Content adapted and saved to your "My Space"! (Simulated)');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">{t('community.title')}</h1>
        <p className="text-muted-foreground">{t('community.subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>{t('community.feed.title')}</CardTitle>
              <CardDescription>{t('community.feed.description')}</CardDescription>
            </div>
             <Button>
                <Upload className="mr-2 h-4 w-4" /> {t('community.buttons.share')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input placeholder={t('community.searchPlaceholder')} className="flex-1" />
            <div className="flex flex-wrap gap-4">
              <Select>
                <SelectTrigger className="w-full md:w-[160px]">
                  <SelectValue placeholder={t('community.filters.grade')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('community.filters.allGrades')}</SelectItem>
                  <SelectItem value="3">Grade 3</SelectItem>
                  <SelectItem value="5">Grade 5</SelectItem>
                  <SelectItem value="7">Grade 7</SelectItem>
                </SelectContent>
              </Select>
               <Select>
                <SelectTrigger className="w-full md:w-[160px]">
                  <SelectValue placeholder={t('community.filters.subject')} />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="all">{t('community.filters.allSubjects')}</SelectItem>
                   <SelectItem value="Science">Science</SelectItem>
                   <SelectItem value="Maths">Maths</SelectItem>
                </SelectContent>
              </Select>
               <Select>
                <SelectTrigger className="w-full md:w-[160px]">
                  <SelectValue placeholder={t('community.filters.sortBy')} />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="rating">{t('community.filters.highestRating')}</SelectItem>
                   <SelectItem value="recent">{t('community.filters.mostRecent')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-6">
            {posts.map(post => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="font-headline text-xl">{post.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={post.avatar} />
                          <AvatarFallback>{post.initials}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{post.author}</span>
                        <span className="text-sm text-muted-foreground">- {post.school}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Badge>{post.type}</Badge>
                         <p className="text-xs text-muted-foreground">{post.createdAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{post.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <div className="flex gap-4 text-muted-foreground">
                        <Button variant="ghost" size="sm" className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" /> {post.likes}
                        </Button>
                         <Button variant="ghost" size="sm" className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" /> {post.comments}
                        </Button>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button 
                                className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:scale-105 transition-transform duration-200"
                                onClick={() => handleAdaptClick(post)}
                            >
                                {t('community.buttons.previewAndAdapt')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                            <DialogTitle>{t('community.adaptModal.title')}: {selectedPost?.title}</DialogTitle>
                            <DialogDescription>
                               {t('community.adaptModal.description')}
                            </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <Label htmlFor="content-editor">{t('community.adaptModal.contentLabel')}</Label>
                                <Textarea 
                                    id="content-editor"
                                    value={adaptedContent}
                                    onChange={(e) => setAdaptedContent(e.target.value)}
                                    className="min-h-[300px] font-mono text-xs"
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit" onClick={handleAdaptConfirm}>{t('community.buttons.adaptToMySpace')}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
