'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Clock, Calendar } from 'lucide-react';

export const UpcomingClasses = ({ t }: { t: (key: string) => string }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {t('todaysClasses')}
                </CardTitle>
                <CardDescription>{t('todaysSchedule')}</CardDescription>
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
    )
}
