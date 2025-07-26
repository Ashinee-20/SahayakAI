import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, MessageSquare, GitBranchPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const communityPosts = [
  {
    id: 1,
    author: 'Anjali Sharma',
    school: 'Delhi Public School',
    avatar: 'https://placehold.co/40x40.png',
    initials: 'AS',
    type: 'Lesson Plan',
    title: 'Interactive Geometry Lesson for Grade 7',
    description: 'A fun, hands-on lesson plan to teach basic geometric shapes and their properties.',
    likes: 15,
    comments: 4,
  },
  {
    id: 2,
    author: 'Ravi Kumar',
    school: 'Kendriya Vidyalaya',
    avatar: 'https://placehold.co/40x40.png',
    initials: 'RK',
    type: 'Assessment',
    title: 'Grade 5 Science - Human Body Systems Quiz',
    description: 'A comprehensive quiz covering the digestive, circulatory, and respiratory systems.',
    likes: 22,
    comments: 8,
  },
   {
    id: 3,
    author: 'Priya Singh',
    school: 'Modern School',
    avatar: 'https://placehold.co/40x40.png',
    initials: 'PS',
    type: 'Story',
    title: 'The Tale of Two Protons',
    description: 'An engaging story to explain the concept of atoms and molecules to young learners.',
    likes: 30,
    comments: 12,
  },
];

export default function CommunityPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">Community Hub</h1>
        <p className="text-muted-foreground">Share, discover, and adapt content from fellow educators.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Community Feed</CardTitle>
          <CardDescription>Find resources shared by other teachers.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input placeholder="Search content..." className="flex-1" />
            <div className="flex gap-4">
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Grade 5</SelectItem>
                  <SelectItem value="7">Grade 7</SelectItem>
                </SelectContent>
              </Select>
               <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Subject" />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="Maths">Maths</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-6">
            {communityPosts.map(post => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="font-headline text-xl">{post.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={post.avatar} />
                          <AvatarFallback>{post.initials}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{post.author}</span>
                        <span className="text-sm text-muted-foreground">- {post.school}</span>
                      </div>
                    </div>
                    <Badge>{post.type}</Badge>
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
                    <Button className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:scale-105 transition-transform duration-200">
                        <GitBranchPlus className="mr-2 h-4 w-4" /> Adapt
                    </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
