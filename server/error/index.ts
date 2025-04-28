import { ZodError } from "zod"

export default defineNitroErrorHandler((error, event) => {
  event.node.res.statusCode = 200
  let errMessage = error.message
  if (error.cause instanceof ZodError) {
    errMessage = error.cause.errors.shift().message
  }
  return send(event, JSON.stringify({ code: (error as any).statusCode, msg: errMessage }), 'application/json')
})
