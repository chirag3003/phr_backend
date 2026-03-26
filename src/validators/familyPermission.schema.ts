import { z } from 'zod';

export const familyPermissionSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  permissionTo: z.string(),
  write: z.boolean(),
  permissions: z.object({
    documents: z.boolean(),
    symptoms: z.boolean(),
    meals: z.boolean(),
    glucose: z.boolean(),
    allergies: z.boolean(),
    water: z.boolean(),
    steps: z.boolean(),
  }),
});

export type FamilyPermission = z.infer<typeof familyPermissionSchema>;

export const updateFamilyPermissionSchema = familyPermissionSchema.omit({
  _id: true,
  userId: true,
  permissionTo: true,
});

export type FamilyPermissionUpdateInput = z.infer<typeof updateFamilyPermissionSchema>;

export const createFamilyPermissionSchema = familyPermissionSchema.omit({
  _id: true,
  userId: true,
  permissionTo: true,
});

export type CreateFamilyPermissionInput = z.infer<typeof createFamilyPermissionSchema>;
