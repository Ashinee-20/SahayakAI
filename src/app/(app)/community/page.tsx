'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, MessageSquare, Upload, ArrowUpDown, X } from 'lucide-react';
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
    content: 'Interactive Geometry Lesson\n\nGrade: 7\nSubject: Mathematics\n\nObjectives:\n• Students will identify basic geometric shapes\n• Students will understand properties of triangles, squares, and circles\n• Students will apply geometric concepts in real-world scenarios\n\nActivities:\n1. Shape Hunt - Students find geometric shapes around the classroom\n2. Building with Blocks - Hands-on construction using geometric blocks\n3. Property Investigation - Measure angles and sides of different shapes\n\nMaterials Needed:\n• Geometric blocks\n• Measuring tools (rulers, protractors)\n• Worksheets\n• Interactive whiteboard\n\nAssessment:\n• Observation during activities\n• Exit ticket with shape identification\n• Homework: Find 5 geometric shapes at home',
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
    content: 'Human Body Systems Quiz\n\nGrade: 5\nSubject: Science\nDuration: 30 minutes\n\nInstructions: Choose the best answer for each question.\n\n1. Which organ is responsible for pumping blood throughout the body?\na) Brain\nb) Heart\nc) Liver\nd) Kidney\nAnswer: b) Heart\n\n2. What is the primary function of the lungs?\na) Digesting food\nb) Filtering blood\nc) Breathing and gas exchange\nd) Producing hormones\nAnswer: c) Breathing and gas exchange\n\n3. Which system breaks down food into nutrients?\na) Circulatory system\nb) Respiratory system\nc) Digestive system\nd) Nervous system\nAnswer: c) Digestive system\n\n4. Blood vessels that carry blood away from the heart are called:\na) Veins\nb) Arteries\nc) Capillaries\nd) Nerves\nAnswer: b) Arteries\n\n5. The process of breathing in is called:\na) Exhalation\nb) Inhalation\nc) Circulation\nd) Digestion\nAnswer: b) Inhalation',
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
    content: 'The Tale of Two Protons\n\nOnce upon a time, in a tiny world called Atomsville, lived two best friends, Percy the Proton and Nelly the Neutron. They lived in a cozy house called the Nucleus, right in the center of their neighborhood.\n\nPercy was always positive and cheerful. He had a special power - he carried a positive charge that made him very important in Atomsville. Nelly, on the other hand, was neutral and calm. She didn\'t have any charge, but she was very good at keeping everyone balanced and happy.\n\nOne day, they met Eddie the Electron, who lived in the outer rings around their neighborhood. Eddie was always moving around, full of energy, and he carried a negative charge. At first, Percy and Eddie didn\'t get along because they were opposites - Percy was positive and Eddie was negative.\n\nBut then something magical happened! Percy realized that even though he and Eddie were different, they needed each other. Percy\'s positive charge and Eddie\'s negative charge balanced each other out, making their atom stable and strong.\n\nFrom that day on, Percy the Proton, Nelly the Neutron, and Eddie the Electron became the best of friends. They learned that being different wasn\'t bad - it was actually what made them special and helped them work together as a team.\n\nAnd that\'s how atoms are made - with protons, neutrons, and electrons all working together in harmony!\n\nThe End.\n\nMoral: Differences make us stronger when we work together.',
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
  const [filteredPosts, setFilteredPosts] = useState(initialCommunityPosts);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [sharedContent, setSharedContent] = useState<Post[]>([]);
  const [shareForm, setShareForm] = useState({
    title: '',
    description: '',
    type: 'Lesson Plan',
    grade: '',
    subject: '',
    content: ''
  });
  const { t } = useTranslation();

  // Filter and search functionality
  useState(() => {
    let filtered = [...posts, ...sharedContent];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Grade filter
    if (gradeFilter !== 'all') {
      filtered = filtered.filter(post => post.grade === gradeFilter);
    }
    
    // Subject filter
    if (subjectFilter !== 'all') {
      filtered = filtered.filter(post => post.subject === subjectFilter);
    }
    
    // Sort
    if (sortBy === 'rating') {
      filtered.sort((a, b) => b.likes - a.likes);
    } else {
      filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    
    setFilteredPosts(filtered);
  }, [posts, sharedContent, searchTerm, gradeFilter, subjectFilter, sortBy]);
  const handleAdaptClick = (post: Post) => {
    setSelectedPost(post);
    setAdaptedContent(post.content);
  }

  const handleAdaptConfirm = () => {
    if (!selectedPost) return;
    
    // Simulate saving to user's content (in real app, this would go to Firestore)
    const adaptedPost = {
      ...selectedPost,
      content: adaptedContent,
      id: Date.now(), // Generate new ID
      title: `${selectedPost.title} (Adapted)`,
    };
    
    // In a real app, this would be saved to the user's content in Firestore
    localStorage.setItem('adaptedContent', JSON.stringify([
      ...JSON.parse(localStorage.getItem('adaptedContent') || '[]'),
      adaptedPost
    ]));
    
    alert('Content adapted and saved to your "My Space"! Check the My Content tab to see it.');
    setSelectedPost(null);
    setAdaptedContent('');
  };

  const handleShareContent = () => {
    if (!shareForm.title || !shareForm.description || !shareForm.content) {
      alert('Please fill in all required fields');
      return;
    }
    
    const newPost: Post = {
      id: Date.now(),
      author: 'You', // In real app, get from auth
      school: 'Your School',
      avatar: 'https://placehold.co/40x40.png',
      initials: 'YU',
      type: shareForm.type,
      grade: shareForm.grade,
      subject: shareForm.subject,
      title: shareForm.title,
      description: shareForm.description,
      content: shareForm.content,
      likes: 0,
      comments: 0,
      createdAt: new Date(),
    };
    
    setSharedContent(prev => [newPost, ...prev]);
    setShareDialogOpen(false);
    setShareForm({
      title: '',
      description: '',
      type: 'Lesson Plan',
      grade: '',
      subject: '',
      content: ''
    });
    
    alert('Content shared successfully!');
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
             <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
               <DialogTrigger asChild>
                 <Button>
                   <Upload className="mr-2 h-4 w-4" /> {t('community.buttons.share')}
                 </Button>
               </DialogTrigger>
               <DialogContent className="sm:max-w-[600px]">
                 <DialogHeader>
                   <DialogTitle>Share Your Content</DialogTitle>
                   <DialogDescription>
                     Share your educational content with the community
                   </DialogDescription>
                 </DialogHeader>
                 <div className="grid gap-4 py-4">
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <Label htmlFor="share-title">Title *</Label>
                       <Input 
                         id="share-title"
                         value={shareForm.title}
                         onChange={(e) => setShareForm(prev => ({...prev, title: e.target.value}))}
                         placeholder="Enter content title"
                       />
                     </div>
                     <div>
                       <Label htmlFor="share-type">Content Type</Label>
                       <Select value={shareForm.type} onValueChange={(value) => setShareForm(prev => ({...prev, type: value}))}>
                         <SelectTrigger>
                           <SelectValue />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="Lesson Plan">Lesson Plan</SelectItem>
                           <SelectItem value="Assessment">Assessment</SelectItem>
                           <SelectItem value="Story">Story</SelectItem>
                           <SelectItem value="Visual Aid">Visual Aid</SelectItem>
                         </SelectContent>
                       </Select>
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <Label htmlFor="share-grade">Grade</Label>
                       <Select value={shareForm.grade} onValueChange={(value) => setShareForm(prev => ({...prev, grade: value}))}>
                         <SelectTrigger>
                           <SelectValue placeholder="Select grade" />
                         </SelectTrigger>
                         <SelectContent>
                           {Array.from({length: 12}, (_, i) => (
                             <SelectItem key={i+1} value={`${i+1}`}>Grade {i+1}</SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </div>
                     <div>
                       <Label htmlFor="share-subject">Subject</Label>
                       <Select value={shareForm.subject} onValueChange={(value) => setShareForm(prev => ({...prev, subject: value}))}>
                         <SelectTrigger>
                           <SelectValue placeholder="Select subject" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="Maths">Maths</SelectItem>
                           <SelectItem value="Science">Science</SelectItem>
                           <SelectItem value="English">English</SelectItem>
                           <SelectItem value="History">History</SelectItem>
                           <SelectItem value="Geography">Geography</SelectItem>
                         </SelectContent>
                       </Select>
                     </div>
                   </div>
                   <div>
                     <Label htmlFor="share-description">Description *</Label>
                     <Textarea 
                       id="share-description"
                       value={shareForm.description}
                       onChange={(e) => setShareForm(prev => ({...prev, description: e.target.value}))}
                       placeholder="Brief description of your content"
                       className="min-h-[80px]"
                     />
                   </div>
                   <div>
                     <Label htmlFor="share-content">Content *</Label>
                     <Textarea 
                       id="share-content"
                       value={shareForm.content}
                       onChange={(e) => setShareForm(prev => ({...prev, content: e.target.value}))}
                       placeholder="Paste your lesson plan, assessment questions, story, etc."
                       className="min-h-[200px]"
                     />
                   </div>
                 </div>
                 <DialogFooter>
                   <Button type="button" variant="outline" onClick={() => setShareDialogOpen(false)}>
                     Cancel
                   </Button>
                   <Button type="button" onClick={handleShareContent}>
                     Share Content
                   </Button>
                 </DialogFooter>
               </DialogContent>
             </Dialog>
           </div>
         </CardHeader>
         <CardContent>
           <div className="flex flex-col md:flex-row gap-4 mb-6">
             <Input 
               placeholder={t('community.searchPlaceholder')} 
               className="flex-1"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
             <div className="flex flex-wrap gap-4">
               <Select value={gradeFilter} onValueChange={setGradeFilter}>
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
               <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                 <SelectTrigger className="w-full md:w-[160px]">
                   <SelectValue placeholder={t('community.filters.subject')} />
                 </SelectTrigger>
                 <SelectContent>
                    <SelectItem value="all">{t('community.filters.allSubjects')}</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="Maths">Maths</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                    <SelectItem value="Geography">Geography</SelectItem>
                 </SelectContent>
               </Select>
               <Select value={sortBy} onValueChange={setSortBy}>
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
            {filteredPosts.map(post => (
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
                                    className="min-h-[400px] text-sm"
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setSelectedPost(null)}>
                                    Cancel
                                </Button>
                                <Button type="submit" onClick={handleAdaptConfirm}>{t('community.buttons.adaptToMySpace')}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardFooter>
              </Card>
            ))}
            {filteredPosts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No content found matching your filters.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
