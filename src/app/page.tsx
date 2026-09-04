import RoadmapBoard from '@/components/roadmap/RoadmapBoard';
import { ProjectProvider } from '@/context/ProjectContext';

export default function Home() {
  return (
    <ProjectProvider>
      <main className="min-h-screen bg-slate-50">
        <RoadmapBoard />
      </main>
    </ProjectProvider>
  );
}
