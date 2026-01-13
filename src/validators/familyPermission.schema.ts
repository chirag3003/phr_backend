import { z } from 'zod';

export const familyPermissionSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  family: z.string(),
  permissionTo: z.string(),
  write: z.boolean(),
  permissions: z.object({
    documents: z.boolean(),
    symptoms: z.boolean(),
    meals: z.boolean(),
    trends: z.boolean(),
  }),
});

export type FamilyPermission = z.infer<typeof familyPermissionSchema>;

export const updateFamilyPermissionSchema = familyPermissionSchema.omit({
  _id: true,
  userId: true,
  family: true,
  permissionTo: true,
});

export type FamilyPermissionUpdateInput = z.infer<typeof updateFamilyPermissionSchema>;

export const createFamilyPermissionSchema = familyPermissionSchema.omit({
  _id: true,
  userId: true,
  family: true,
  permissionTo: true,
});

export type CreateFamilyPermissionInput = z.infer<typeof createFamilyPermissionSchema>;
