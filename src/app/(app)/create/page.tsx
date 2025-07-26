import CreateToolCard from '@/components/create-tool-card';
import {
  BookOpenCheck,
  ClipboardCheck,
  AudioLines,
  ImageIcon,
  PenSquare,
} from 'lucide-react';

const tools = [
  {
    href: '/create/lesson-plan',
    title: 'Lesson Plan',
    description: 'Generate a detailed lesson plan for any topic.',
    icon: BookOpenCheck,
  },
  {
    href: '/create/assessment',
    title: 'Assessments',
    description: 'Create quizzes, tests, and other assessments.',
    icon: ClipboardCheck,
  },
  {
    href: '/create/class-notes',
    title: 'Class Notes',
    description: 'Record audio and get structured notes.',
    icon: AudioLines,
  },
  {
    href: '/create/story',
    title: 'Story Generation',
    description: 'Craft educational stories to engage students.',
    icon: PenSquare,
  },
  {
    href: '/create/visual-aid',
    title: 'Visual Aid',
    description: 'Generate visual aids for your lessons. (Coming Soon)',
    icon: ImageIcon,
    disabled: true,
  },
];

export default function CreatePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">Create</h1>
        <p className="text-muted-foreground">
          Choose a tool to start creating content for your classroom.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <CreateToolCard key={tool.title} {...tool} />
        ))}
      </div>
    </div>
  );
}
