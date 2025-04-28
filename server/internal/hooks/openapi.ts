import { extractRouteSchemas } from "../openapi/extractor";
import { evaluateSchemaDefinition } from "../openapi/evaluator";
import { generateOpenApiSchema } from "../openapi/generator";

export default function transform(code: string, id: string) {
  const hit = id.includes("/server/routes/") || id.includes("/server/api/");

  if (!hit) return null;

  const schema = extractRouteSchemas(id, code);

  let openapiSchema = generateOpenApiSchema({
    queryDefinition: evaluateSchemaDefinition(schema.querySchema?.definition),
    pathDefinition: evaluateSchemaDefinition(schema.pathSchema?.definition),
    requestDefinition: evaluateSchemaDefinition(
      schema.requestSchema?.definition,
    ),
    responseDefinition: evaluateSchemaDefinition(
      schema.responseSchema?.definition,
    ),
  });

  if (schema.swaggerConfig.public) {
    (openapiSchema.openAPI as any).security = [{ bearer: [] }]
  }


  let newCode = code;
  if (openapiSchema && schema.defineRouteMetaDefinition == null) {
    newCode = `${code}
    defineRouteMeta(${JSON.stringify(openapiSchema, null, 2)});
    `;
  }


  if (schema.defineRouteMetaDefinition) {
    code = code.replaceAll(`defineRouteMeta(${schema.defineRouteMetaDefinition})`, '')
    const { routeMetaData = {} } = schema
    openapiSchema.openAPI = Object.assign(openapiSchema.openAPI, routeMetaData.openAPI)
    newCode = `
    ${code}
    defineRouteMeta(${JSON.stringify(openapiSchema, null, 2)});
    `;
  }


  return {
    code: newCode,
    map: null,
  };
}
