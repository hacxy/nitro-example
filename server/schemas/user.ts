import { z } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'

export const userInfoSchema = z.object({
  username: z.string().describe("用户名称").min(5, '用户名最少不低于5个字符').max(12, '用户名最多不超过8个字符').regex(/^[A-Za-z0-9_.]{5,12}$/)
})

export const createUserSchema = z.object({
  username: z.string().describe("用户名称").min(5, '用户名最少不低于5个字符').max(12, '用户名最多不超过8个字符').regex(/^[A-Za-z0-9_.]{5,12}$/),
  password: z.string().describe("用户名称").min(5, '用户名最少不低于5个字符').max(12, '用户名最多不超过8个字符').regex(/^[A-Za-z0-9_.]{5,12}$/)
})

export const createUserSchemaJosn = zodToJsonSchema(createUserSchema)
