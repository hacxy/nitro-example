// 上传多个图片的示例
import { z } from "zod"

const ResponseSchema = z.array(z.string())

defineEventHandler({
  onRequest: [requireAuth],
  handler: () => {
    return []
  }
})

defineRouteMeta({
  openAPI: {
    tags: ['文件上传'],
    summary: '上传多个图片',
    requestBody: {
      required: true,
      content: {
        "multipart/form-data": {
          schema: {
            type: "object",
            properties: {
              files: {
                type: "array",
                items: {
                  type: "string",
                  format: "binary"
                }
              }
            }
          }
        }
      }
    }
  }
})
