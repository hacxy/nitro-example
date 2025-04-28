import { userInfoSchema } from "~/schemas/user"

const ResponseSchema = userInfoSchema

export default defineEventHandler({
  onRequest: [requireAuth],
  handler: () => {
    return {}
  }
})

defineRouteMeta({
  openAPI: {
    tags: ['个人信息'],
    summary: '获取个人信息'
  }
})
