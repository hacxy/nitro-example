import { INTERNAL_ROUTE } from "~/constants";

// 处理统一响应成功的参数格式
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("beforeResponse", (event, { body }) => {
    if (!INTERNAL_ROUTE.includes(event.node.req.url)) {
      return send(event, JSON.stringify({ code: 200, msg: 'ok', data: body || undefined }), 'application/json')
    }
    return
  });
});
