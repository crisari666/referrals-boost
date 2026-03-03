import { projects } from "@/data/mockData";
import ProjectCard from "@/components/ProjectCard";

const Projects = () => {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Proyectos</h1>
        <p className="text-sm text-muted-foreground mt-1">Catálogo de desarrollos disponibles</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}
      </div>
    </div>
  );
};

export default Projects;
