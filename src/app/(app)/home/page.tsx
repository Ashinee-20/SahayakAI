'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { BookOpen, FileText, Sparkles, Clock, Calendar } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const stats = [
  { title: 'Lesson Plans Created', value: '12', icon: BookOpen },
  { title: 'Assessments Generated', value: '8', icon: FileText },
  { title: 'Stories Crafted', value: '5', icon: Sparkles },
];

const recentItems = [
    { type: 'Lesson Plan', title: 'Algebra Basics for Grade 8', date: '2 days ago', variant: 'default' },
    { type: 'Assessment', title: 'Quiz on Photosynthesis', date: '3 days ago', variant: 'secondary' },
    { type: 'Story', title: 'The Water Cycle Adventure', date: '5 days ago', variant: 'outline' },
    { type: 'Class Notes', title: 'Lecture on Indian History', date: '1 week ago', variant: 'destructive' },
    { type: 'Lesson Plan', title: 'Introduction to Poetry', date: '1 week ago', variant: 'default' },
]

export default function HomePage() {
  const { user, isGuest } = useAuth();
  const userName = user?.displayName?.split(' ')[0] || 'Guest';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">Welcome back, {userName}!</h1>
        <p className="text-muted-foreground">Here's your dashboard at a glance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">+2 since last week</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Today's Classes
                </CardTitle>
                <CardDescription>Your schedule for today. (Placeholder)</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-3">
                    <li className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>10:00 AM</span>
                        </div>
                        <p className="font-semibold">Maths - Grade 8</p>
                    </li>
                    <li className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>11:30 AM</span>
                        </div>
                        <p className="font-semibold">Science - Grade 6</p>
                    </li>
                     <li className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>02:00 PM</span>
                        </div>
                        <p className="font-semibold">English - Grade 7</p>
                    </li>
                </ul>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Recently Generated</CardTitle>
                <CardDescription>Your 5 most recent creations.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentItems.map((item) => (
                        <TableRow key={item.title}>
                            <TableCell>
                                <Badge variant={item.type === 'Lesson Plan' ? 'default' : item.type === 'Assessment' ? 'secondary' : item.type === 'Story' ? 'outline' : 'destructive'}>{item.type}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">{item.title}</TableCell>
                            <TableCell className="text-muted-foreground">{item.date}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
