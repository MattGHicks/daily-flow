import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-6xl font-bold tracking-tight">
          Daily Flow
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl text-center">
          Your unified dashboard for managing projects, tasks, and client communications.
        </p>
        <div className="flex gap-4 mt-8">
          <Link href="/dashboard">
            <Button size="lg">
              Get Started
            </Button>
          </Link>
          <Button size="lg" variant="outline">
            Learn More
          </Button>
        </div>
      </div>
    </main>
  );
}
