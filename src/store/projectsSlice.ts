import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { projects as initialProjects, type Project } from "@/data/mockData";

interface ProjectsState {
  list: Project[];
}

const initialState: ProjectsState = {
  list: initialProjects,
};

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setProjects(state, action: PayloadAction<Project[]>) {
      state.list = action.payload;
    },
    updateProject(state, action: PayloadAction<Project>) {
      const idx = state.list.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) state.list[idx] = action.payload;
    },
  },
});

export const { setProjects, updateProject } = projectsSlice.actions;
export default projectsSlice.reducer;
