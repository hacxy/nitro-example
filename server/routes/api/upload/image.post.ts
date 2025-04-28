// 文件上传, 单个图片上传示例
import { z } from "zod";

const FileSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) =>
        [
          "image/png",
          "image/jpeg",
          "image/jpg",
          "image/svg+xml",
          "image/gif",
        ].includes(file.type),
      { message: "Invalid image file type" }
    )
});

const ResponseSchema = z.string().describe('Image url')


export default defineEventHandler({
  onRequest: [requireAuth],
  handler: () => {
    return ''
  }
})

defineRouteMeta({
  openAPI: {
    tags: ['文件上传'],
    summary: '上传单个图片',
    requestBody: {
      content: {
        "multipart/form-data": {
          "schema": {
            "type": "object",
            "properties": {
              "file": {
                "type": "string",
                "format": "binary"
              }
            }
          }
        }
      }
    }
  }
})
