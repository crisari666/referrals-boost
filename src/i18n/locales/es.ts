import { assistantSegment } from "@/i18n/segments/assistant";
import { authSegment } from "@/i18n/segments/auth";
import { clientsSegment } from "@/i18n/segments/clients";
import { commonSegment } from "@/i18n/segments/common";
import { contractSegment } from "@/i18n/segments/contract";
import { dashboardSegment } from "@/i18n/segments/dashboard";
import { firstAccessSegment } from "@/i18n/segments/firstAccess";
import { layoutSegment } from "@/i18n/segments/layout";
import { notFoundSegment } from "@/i18n/segments/notFound";
import { profileSegment } from "@/i18n/segments/profile";
import { projectsSegment } from "@/i18n/segments/projects";
import { scheduleSegment } from "@/i18n/segments/schedule";
import { signupSegment } from "@/i18n/segments/signup";
import { twilioSegment } from "@/i18n/segments/twilio";
import { uiSegment } from "@/i18n/segments/ui";
import { validationSegment } from "@/i18n/segments/validation";
import { whatsappSegment } from "@/i18n/segments/whatsapp";

const es = {
  common: commonSegment.es,
  layout: layoutSegment.es,
  auth: authSegment.es,
  clients: clientsSegment.es,
  validation: validationSegment.es,
  dashboard: dashboardSegment.es,
  schedule: scheduleSegment.es,
  projects: projectsSegment.es,
  profile: profileSegment.es,
  assistant: assistantSegment.es,
  whatsapp: whatsappSegment.es,
  twilio: twilioSegment.es,
  signup: signupSegment.es,
  contract: contractSegment.es,
  notFound: notFoundSegment.es,
  firstAccess: firstAccessSegment.es,
  ui: uiSegment.es,
};

export default es;
