const fs = require('fs');

const filePath = 'C:\\Users\\securxpert\\.gemini\\antigravity\\brain\\9acc5b5e-b50f-41c6-991e-a4b677a0194d\\.system_generated\\steps\\244\\content.md';
const fileContent = fs.readFileSync(filePath, 'utf8');

const jsonStartIndex = fileContent.indexOf('{"openapi"');
const jsonStr = fileContent.substring(jsonStartIndex);
const openapi = JSON.parse(jsonStr);

function resolveSchema(ref) {
  if (!ref) return null;
  const parts = ref.replace('#/', '').split('/');
  let current = openapi;
  for (const part of parts) {
    current = current[part];
  }
  return current;
}

function printSchemaDetails(pathName, method) {
  const op = openapi.paths[pathName]?.[method];
  if (!op) {
    console.log(`No operation for ${method.toUpperCase()} ${pathName}`);
    return;
  }
  console.log(`\n=== Schema for ${method.toUpperCase()} ${pathName} ===`);
  const content = op.requestBody?.content;
  if (!content) {
    console.log("No request body");
    return;
  }
  
  const contentType = Object.keys(content)[0];
  console.log("Content-Type:", contentType);
  let schema = content[contentType].schema;
  if (schema.$ref) {
    schema = resolveSchema(schema.$ref);
  }
  
  console.log("Properties:");
  if (schema.properties) {
    for (const [propName, propVal] of Object.entries(schema.properties)) {
      let details = propVal.type || 'object';
      if (propVal.$ref) {
        const refSchema = resolveSchema(propVal.$ref);
        details = `ref to ${propVal.$ref} (${refSchema.type})`;
      } else if (propVal.anyOf) {
        details = `anyOf: ${JSON.stringify(propVal.anyOf)}`;
      } else if (propVal.items) {
        let itemDetails = propVal.items.type;
        if (propVal.items.$ref) {
          itemDetails = `ref to ${propVal.items.$ref}`;
        }
        details = `array of ${itemDetails}`;
      }
      const required = schema.required?.includes(propName) ? '(REQUIRED)' : '';
      console.log(`  - ${propName}: ${details} ${required}`);
    }
  } else {
    console.log(JSON.stringify(schema, null, 2));
  }
}

printSchemaDetails('/compiler-questions/add', 'post');
printSchemaDetails('/exam/creation', 'post');
printSchemaDetails('/exam/update', 'post');
printSchemaDetails('/compiler-questions/update', 'put');
