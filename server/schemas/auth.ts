import { z } from "zod";

export const accountSchema = z.object({
  username: z.string().describe("用户名称").min(5, '用户名最少不低于5个字符').max(12, '用户名最多不超过8个字符').regex(/^[A-Za-z0-9_.]{5,12}$/),
  password: z.string().describe("密码").min(6, '密码最少不低于6个字符').max(18, '密码最多不超过18个字符').regex(/^[A-Za-z0-9_.]{6,18}$/)
})


