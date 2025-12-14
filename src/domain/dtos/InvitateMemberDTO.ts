import z from "zod";

export const InviteMemberSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["admin", "member"]),
});

export type InviteMemberDTO = z.infer<typeof InviteMemberSchema>;
