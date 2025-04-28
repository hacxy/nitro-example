import ts from "typescript";
import fs from "fs";
import path from "path";
// import { string } from "zod";


interface SwaggerConfig {
  public?: boolean
}

function resolveModulePath(
  currentFilePath: string,
  importPath: string,
  basePath: string,
): string | null {
  if (importPath.startsWith("./") || importPath.startsWith("../")) {
    const currentDir = path.dirname(currentFilePath);
    const resolvedPath = path.resolve(currentDir, importPath);

    const extensions = [".ts", ".tsx", ".js", ".jsx"];
    for (const ext of extensions) {
      const fullPath = resolvedPath + ext;
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }

    for (const ext of extensions) {
      const indexPath = path.join(resolvedPath, `index${ext}`);
      if (fs.existsSync(indexPath)) {
        return indexPath;
      }
    }
  } else if (importPath.startsWith("~/")) {
    return path.join(basePath, "server", `${importPath.slice(2)}.ts`);
  } else {
    // ...
  }

  return null;
}

function extractSchemaFromModule(
  filePath: string,
  code: string,
  exportName: string,
): string | null {

  const sourceFile = ts.createSourceFile(
    filePath,
    code,
    ts.ScriptTarget.ES2020,
    true,
  );

  let schemaDefinition: string | null = null;

  function findExport(node: ts.Node) {
    if (
      ts.isVariableStatement(node) &&
      node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      for (const declaration of node.declarationList.declarations) {
        if (
          ts.isIdentifier(declaration.name) &&
          declaration.name.text === exportName &&
          declaration.initializer
        ) {
          const start = declaration.initializer.getStart(sourceFile);
          const end = declaration.initializer.getEnd();
          schemaDefinition = code.substring(start, end);
          return;
        }
      }
    }

    if (
      exportName === "default" &&
      ts.isExportAssignment(node) &&
      !node.isExportEquals
    ) {
      const start = node.expression.getStart(sourceFile);
      const end = node.expression.getEnd();
      schemaDefinition = code.substring(start, end);
      return;
    }

    if (!schemaDefinition) {
      ts.forEachChild(node, findExport);
    }
  }

  findExport(sourceFile);

  return schemaDefinition;
}

export function extractRouteSchemas(
  id: string,
  code: string,
  basePath: string = process.cwd(),
): {
  querySchema: Record<string, string> | undefined;
  pathSchema: Record<string, string> | undefined;
  requestSchema: Record<string, string> | undefined;
  responseSchema: Record<string, string> | undefined;
  defineRouteMetaDefinition: string | undefined;
  routeMetaData: Record<string, any>
  swaggerConfig: SwaggerConfig
} {
  const sourceFile = ts.createSourceFile(
    id,
    code,
    ts.ScriptTarget.ES2020,
    true,
  );

  const imports: Record<string, { from: string; path: string }> = {};

  function collectImports(node: ts.Node) {
    if (ts.isImportDeclaration(node)) {
      const moduleSpecifier = node.moduleSpecifier;

      if (ts.isStringLiteral(moduleSpecifier)) {
        const importPath = moduleSpecifier.text;

        if (node.importClause) {
          if (
            node.importClause.namedBindings &&
            ts.isNamedImports(node.importClause.namedBindings)
          ) {
            node.importClause.namedBindings.elements.forEach((element) => {
              const importName = element.name.text;
              const propertyName = element.propertyName
                ? element.propertyName.text
                : importName;
              imports[importName] = { from: propertyName, path: importPath };
            });
          }

          if (node.importClause.name) {
            const defaultImportName = node.importClause.name.text;
            imports[defaultImportName] = { from: "default", path: importPath };
          }
        }
      }
    }

    ts.forEachChild(node, collectImports);
  }

  collectImports(sourceFile);

  let querySchema: Record<string, string> | undefined;
  let pathSchema: Record<string, string> | undefined;
  let requestSchema: Record<string, string> | undefined;
  let responseSchema: Record<string, string> | undefined;
  let defineRouteMetaDefinition: string | undefined;
  let routeMetaData: Record<string, any>
  let defineEventHandler: string | undefined
  let swaggerConfig: SwaggerConfig = {}

  function visit(node: ts.Node) {
    if (
      ts.isVariableDeclaration(node) &&
      node.name &&
      ts.isIdentifier(node.name) &&
      node.name.text.includes("QuerySchema") &&
      node.initializer
    ) {
      const start = node.initializer.getStart(sourceFile);
      const end = node.initializer.getEnd();
      const schemaDefinition = code.substring(start, end);

      // @ts-ignore
      if (schemaDefinition == node.initializer.escapedText) {
        const typeText = schemaDefinition;

        Object.keys(imports).forEach((importName) => {
          if (typeText.includes(importName)) {
            const importInfo = imports[importName];
            const importPath = resolveModulePath(id, importInfo.path, basePath);

            if (importPath && fs.existsSync(importPath)) {
              const importedCode = fs.readFileSync(importPath, "utf-8");
              const importedDefinition = extractSchemaFromModule(
                importPath,
                importedCode,
                importInfo.from,
              );

              if (importedDefinition) {
                querySchema = {
                  // @ts-ignore
                  name: node.name.text,
                  definition: importedDefinition,
                  importedFrom: importPath,
                };
              }
            }
          }
        });
      }

      if (schemaDefinition.startsWith("z.object")) {
        querySchema = {
          name: node.name.text,
          definition: schemaDefinition,
        };
      }
    }

    if (
      ts.isVariableDeclaration(node) &&
      node.name &&
      ts.isIdentifier(node.name) &&
      node.name.text.includes("PathSchema") &&
      node.initializer
    ) {
      const start = node.initializer.getStart(sourceFile);
      const end = node.initializer.getEnd();
      const schemaDefinition = code.substring(start, end);

      // @ts-ignore
      if (schemaDefinition == node.initializer.escapedText) {
        const typeText = schemaDefinition;

        Object.keys(imports).forEach((importName) => {
          if (typeText.includes(importName)) {
            const importInfo = imports[importName];
            const importPath = resolveModulePath(id, importInfo.path, basePath);

            if (importPath && fs.existsSync(importPath)) {
              const importedCode = fs.readFileSync(importPath, "utf-8");
              const importedDefinition = extractSchemaFromModule(
                importPath,
                importedCode,
                importInfo.from,
              );

              if (importedDefinition) {
                pathSchema = {
                  // @ts-ignore
                  name: node.name.text,
                  definition: importedDefinition,
                  importedFrom: importPath,
                };
              }
            }
          }
        });
      }

      if (schemaDefinition.startsWith("z.object")) {
        pathSchema = {
          name: node.name.text,
          definition: schemaDefinition,
        };
      }
    }

    if (
      ts.isVariableDeclaration(node) &&
      node.name &&
      ts.isIdentifier(node.name) &&
      node.name.text.includes("RequestSchema") &&
      node.initializer
    ) {
      const start = node.initializer.getStart(sourceFile);
      const end = node.initializer.getEnd();
      const schemaDefinition = code.substring(start, end);

      // @ts-ignore
      if (schemaDefinition == node.initializer.escapedText) {
        const typeText = schemaDefinition;

        Object.keys(imports).forEach((importName) => {
          if (typeText.includes(importName)) {
            const importInfo = imports[importName];
            const importPath = resolveModulePath(id, importInfo.path, basePath);

            if (importPath && fs.existsSync(importPath)) {
              const importedCode = fs.readFileSync(importPath, "utf-8");
              const importedDefinition = extractSchemaFromModule(
                importPath,
                importedCode,
                importInfo.from,
              );

              if (importedDefinition) {
                requestSchema = {
                  // @ts-ignore
                  name: node.name.text,
                  definition: importedDefinition,
                  importedFrom: importPath,
                };
              }
            }
          }
        });
      }

      if (schemaDefinition.startsWith("z.object")) {
        requestSchema = {
          name: node.name.text,
          definition: schemaDefinition,
        };
      }
    }

    if (
      ts.isVariableDeclaration(node) &&
      node.name &&
      ts.isIdentifier(node.name) &&
      node.name.text.includes("ResponseSchema") &&
      node.initializer //&&
      //ts.isObjectLiteralExpression(node.initializer)
    ) {
      const start = node.initializer.getStart(sourceFile);
      const end = node.initializer.getEnd();
      const schemaDefinition = code.substring(start, end);

      // @ts-ignore
      if (schemaDefinition == node.initializer.escapedText) {
        const typeText = schemaDefinition;

        Object.keys(imports).forEach((importName) => {
          if (typeText.includes(importName)) {
            const importInfo = imports[importName];
            const importPath = resolveModulePath(id, importInfo.path, basePath);

            if (importPath && fs.existsSync(importPath)) {
              const importedCode = fs.readFileSync(importPath, "utf-8");
              const importedDefinition = extractSchemaFromModule(
                importPath,
                importedCode,
                importInfo.from,
              );

              if (importedDefinition) {
                responseSchema = {
                  // @ts-ignore
                  name: node.name.text,
                  definition: importedDefinition,
                  importedFrom: importPath,
                };
              }
            }
          }
        });
      }

      if (schemaDefinition.startsWith("z.object")) {
        responseSchema = {
          name: node.name.text,
          definition: schemaDefinition,
        };
      }

      if (schemaDefinition.startsWith("z.string")) {
        responseSchema = {
          name: node.name.text,
          definition: schemaDefinition,
        };
      }

      if (schemaDefinition.startsWith("z.array")) {
        responseSchema = {
          name: node.name.text,
          definition: schemaDefinition,
        };
      }


      if (schemaDefinition.startsWith("z.number")) {
        responseSchema = {
          name: node.name.text,
          definition: schemaDefinition,
        };
      }

      if (schemaDefinition.startsWith("z.boolean")) {
        responseSchema = {
          name: node.name.text,
          definition: schemaDefinition,
        };
      }


    }

    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "defineRouteMeta"
    ) {
      if (node.arguments.length > 0) {
        const arg = node.arguments[0];
        const start = arg.getStart(sourceFile);
        const end = arg.getEnd();
        defineRouteMetaDefinition = code.substring(start, end);
        routeMetaData = eval(`(${defineRouteMetaDefinition})`)
      }
    }

    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "defineEventHandler"
    ) {
      if (node.arguments.length > 0) {
        const arg = node.arguments[0];
        const start = arg.getStart(sourceFile);
        const end = arg.getEnd();

        defineEventHandler = code.substring(start, end)

        if (defineEventHandler.includes('requireAuth')) {
          // 根据代码内容 注入额外的配置信息用于控制swagger json内容
          swaggerConfig.public = true
        }
      }
    }


    if (
      requestSchema != null &&
      responseSchema != null &&
      defineRouteMetaDefinition != null
    ) {
      return;
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return {
    querySchema,
    pathSchema,
    requestSchema,
    responseSchema,
    defineRouteMetaDefinition,
    routeMetaData,
    swaggerConfig
  };
}
