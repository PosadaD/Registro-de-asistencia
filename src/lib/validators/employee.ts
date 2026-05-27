import { z } from "zod";

export const employeeSchema = z.object({
  name: z.string().min(1),
  gender: z.string().optional(),

  rfc: z.string().optional(),
  shortRfc: z.string().optional(),
  curp: z.string().optional(),

  immediateBoss: z.string().optional(),
  educationalInstitution: z.string().optional(),
  semester: z.string().optional(),

  providerType: z.string().optional(),
  economicSupport: z.boolean().optional(),

  startDate: z.string(),
  photo: z.string().optional(),
});