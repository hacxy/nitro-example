import transform from "./server/internal/hooks/openapi";

//https://nitro.unjs.io/config
export default defineNitroConfig({
  errorHandler: "~/error",
  compatibilityDate: '2025-04-28',
  srcDir: "server",
  experimental: {
    openAPI: true,
    asyncContext: true
  },
  openAPI: {
    production: 'prerender',
    meta: {
      title: 'Nitro API Document',
      version: '1.0.0',
      description: 'Nitro 服务示例',
    },
  },
  hooks: {
    "rollup:before": (_nitro, config) => {
      // @ts-ignore
      config.plugins.unshift({
        name: "openapi-schema-inject",
        transform,
      });
    },
  },

});
