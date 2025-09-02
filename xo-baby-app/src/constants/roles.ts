export type UserRole = "parent" | "medical" | "admin";

export const ROLE_LABELS: Record<UserRole, string> = {
  parent: "I’m a parent or custodian",
  medical: "I’m a medical personnel",
  admin: "I’m medical facility admin",
};
