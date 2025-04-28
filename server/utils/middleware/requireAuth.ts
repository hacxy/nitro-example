import jwt from 'jsonwebtoken'
export default defineEventHandler({
  onRequest: [fromNodeMiddleware(() => {
    const event = useEvent();
    const authorization = event.node.req.headers.authorization?.replace('Bearer ', "");
    try {
      const decoded = jwt.verify(authorization, 'tj991118.');
      // @ts-ignore
      event.node.req.user = decoded;
    } catch (err) {
      throw createError({
        statusCode: 401,
        message: '无效token'
      });
    }

  })],
  handler: () => void 0
})

