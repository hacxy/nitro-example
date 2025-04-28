export default defineEventHandler({
  onRequest: [requireAuth],
  handler: () => {
    const event = useEvent()
    return
  }
})
