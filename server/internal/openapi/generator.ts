import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export function generateOpenApiSchema<
  T extends z.ZodObject<any>,
  R extends z.ZodObject<any>,
>(options: {
  queryDefinition: T;
  pathDefinition: T;
  requestDefinition: T;
  responseDefinition: R;
  responseDescription?: string;
}) {
  const {
    queryDefinition,
    pathDefinition,
    requestDefinition,
    responseDefinition,
    responseDescription = "Successful response",
  } = options;

  let parameters:
    | {
      name: string;
      in: string;
      required: boolean;
      schema: any;
    }[]
    | undefined;
  let requestBody = {};

  if (requestDefinition) {
    // @ts-ignore
    const { type, properties, required } = zodToJsonSchema(requestDefinition, {
      applyRegexFlags: true,
      $refStrategy: "none",
    });
    requestBody = {
      content: {
        "application/json": {
          schema: { type, properties, required },
        },
      },
    };
  }

  if (queryDefinition) {
    parameters = parameters || [];
    // @ts-ignore
    const { properties, required } = zodToJsonSchema(queryDefinition, {
      $refStrategy: "none",
    });
    for (const key of Object.keys(properties)) {
      parameters.push({
        name: key,
        in: "query",
        required: (required && required.includes(key)) || false,
        schema: properties[key],
      });
    }
  }

  if (pathDefinition) {
    parameters = parameters || [];
    // @ts-ignore
    const { properties, required } = zodToJsonSchema(pathDefinition, {
      $refStrategy: "none",
    });
    for (const key of Object.keys(properties)) {
      parameters.push({
        name: key,
        in: "path",
        required: (required && required.includes(key)) || false,
        schema: properties[key],
      });
    }
  }

  let responseSchema = {};
  if (responseDefinition) {

    // @ts-ignore
    const { type, properties, required, items } = zodToJsonSchema(responseDefinition, {
      $refStrategy: "none",
    });

    let dataSchema = {}
    if (type === 'array') {
      dataSchema = {
        type,
        items
      }
    } else {
      dataSchema = {
        type,
        properties,
        required,
        description: '响应数据',
      }
    }


    responseSchema = {
      type: 'object',
      required: ['msg', 'code'],
      properties: {
        code: {
          type: 'number',
          description: '状态码',
          default: 200
        },
        msg: {
          description: '响应成功信息',
          type: 'string',
          default: 'ok'
        },
        data: dataSchema
      }
    };

  }

  return {
    openAPI: {
      parameters,
      requestBody,
      responses: {
        200: {
          description: responseDescription,
          content: {
            "application/json": {
              schema: responseSchema,
            },
          },
        },
      },
    },
  };
}
