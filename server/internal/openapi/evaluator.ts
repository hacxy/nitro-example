import * as vm from "vm";

export function evaluateSchemaDefinition(definition: string | undefined) {
  if (!definition) return;

  try {
    const code = `
      (function() {
        const z = require('zod');
        const schema = ${definition};
        return schema;
      })();
    `;

    const context = { require, console };
    const script = new vm.Script(code);
    const schema = script.runInNewContext(context);

    return schema;
  } catch (error) {
    console.error(`Error evaluating schema in ${definition}:`, error);
    return null;
  }
}
