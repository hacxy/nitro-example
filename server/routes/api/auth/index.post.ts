import { z } from "zod"
import { accountSchema } from "~/schemas/auth"
const RequestSchema = accountSchema

const ResponseSchema = z.object({
  token: z.string().describe('身份认证token')
})

// 用户登录
export default defineEventHandler(async () => {
  const event = useEvent()
  const body = await readBody<{ username: string, password: string }>(event)

  RequestSchema.parse(body)

  const token = useSignJwt(body)

  ResponseSchema.parse({ token })

  return { token }
})

defineRouteMeta({
  openAPI: {
    tags: ['登录'],
    description: '用户登录接口',
    summary: '用户登录',
  }
})
