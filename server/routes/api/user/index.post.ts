import { createUserSchemaJosn } from "~/schemas/user"
import { createUser } from "~/services/user"

// 创建用户
export default defineEventHandler({
  onRequest: [requireAuth],

  handler: async () => {
    const event = useEvent()
    const body = readBody(event)
    await createUser(body)
    return
  }
})

defineRouteMeta({
  openAPI: {
    tags: ['用户'],
    summary: '创建新用户',
  },

})
