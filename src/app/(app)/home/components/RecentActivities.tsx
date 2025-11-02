'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const recentItems = [
    { type: 'Lesson Plan', title: 'Algebra Basics for Grade 8', date: '2 days ago', variant: 'default' },
    { type: 'Assessment', title: 'Quiz on Photosynthesis', date: '3 days ago', variant: 'secondary' },
    { type: 'Story', title: 'The Water Cycle Adventure', date: '5 days ago', variant: 'outline' },
    { type: 'Class Notes', title: 'Lecture on Indian History', date: '1 week ago', variant: 'destructive' },
    { type: 'Lesson Plan', title: 'Introduction to Poetry', date: '1 week ago', variant: 'default' },
]

export const RecentActivities = ({ t }: { t: (key: string) => string }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">{t('recentlyGenerated')}</CardTitle>
                <CardDescription>{t('recentCreations')}</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>{t('type')}</TableHead>
                        <TableHead>{t('title')}</TableHead>
                        <TableHead>{t('date')}</TableHead>
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
    )
}
