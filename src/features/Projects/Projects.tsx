import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import ProjectCard from "./ProjectCard";
import ProjectDetailModal from "./ProjectDetailModal";
import type { Project } from "@/data/mockData";
import { fetchProjects } from "@/store/projectsSlice";

const Projects = () => {
  const dispatch = useAppDispatch();
  const { list: projects, isLoading, error } = useAppSelector((state) => state.projects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    void dispatch(fetchProjects());
  }, [dispatch]);

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setModalOpen(true);
  };

  if (error) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <p className="text-destructive text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Proyectos</h1>
        <p className="text-sm text-muted-foreground mt-1">Catálogo de desarrollos disponibles</p>
      </div>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando proyectos...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={i}
              onSelect={handleSelectProject}
            />
          ))}
        </div>
      )}
      <ProjectDetailModal
        project={selectedProject}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};

export default Projects;
