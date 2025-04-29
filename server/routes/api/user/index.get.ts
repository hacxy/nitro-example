
export default defineEventHandler({
  onRequest: [requireAuth],
  handler: () => {
    const event = useEvent()
    return
  }
})


defineRouteMeta({
  openAPI: {
    tags: ['用户'],
    summary: '获取用户列表'
  }
})
