import { z } from "zod"

const ResponseSchema = z.object({
  avatar: z.string().describe('头像url'),
  background: z.string().describe('背景图url')

})

export default defineEventHandler({
  onRequest: [requireAuth],
  handler: () => {
    return
  }
})

defineRouteMeta({
  openAPI: {
    tags: ['文件上传'],
    summary: '根据不同字段上传文件',
    requestBody: {
      required: true,
      content: {
        "multipart/form-data": {
          schema: {
            type: "object",
            properties: {
              avatar: {
                type: "string",
                format: "binary"
              },
              background: {
                type: "string",
                format: "binary"
              }
            }
          }
        }
      }
    }
  }
})
