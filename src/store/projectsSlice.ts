import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import * as projectsService from "@/services/projectsService";
import type { Project } from "@/data/mockData";
import type { ApiProject } from "@/types/project";

function mapApiProjectToProject(api: ApiProject): Project {
  const cityStateCountry = [api.city, api.state, api.country].filter(Boolean).join(", ");
  const location = cityStateCountry || api.location || "";
  
  const imageName = api.images?.at(-1);
  const imageUrl = imageName ? projectsService.getProjectImageUrl(imageName) : "";
  return {
    id: api._id,
    title: api.title,
    location,
    priceFrom: api.priceSell,
    commission: api.commissionPercentage,
    commissionType: "%",
    lotsAvailable: 0,
    totalLots: 0,
    image: imageUrl,
    status: "available",
    description: api.description ?? "",
    amenities: api.amenities?.map((a) => a.title) ?? [],
  };
}

interface ProjectsState {
  list: Project[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  list: [],
  isLoading: false,
  error: null,
};

export const fetchProjects = createAsyncThunk<
  Project[],
  void,
  { rejectValue: string }
>("projects/fetch", async (_, { rejectWithValue }) => {
  try {
    const data = await projectsService.getProjects();
    return Array.isArray(data) ? data.map(mapApiProjectToProject) : [];
  } catch (err: unknown) {
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : "Error al cargar proyectos.";
    return rejectWithValue(message);
  }
});

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
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
        state.error = null;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Error desconocido";
      });
  },
});

export const { setProjects, updateProject } = projectsSlice.actions;
export default projectsSlice.reducer;
