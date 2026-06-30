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

const op = openapi.paths['/subadmin/quizzes']?.post;
if (op) {
  console.log("=== Request Body for POST /subadmin/quizzes ===");
  const content = op.requestBody?.content;
  if (!content) {
    console.log("No request body");
  } else {
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
        } else if (propVal.items) {
          details = `array of ${propVal.items.type || propVal.items.$ref}`;
        }
        const required = schema.required?.includes(propName) ? '(REQUIRED)' : '';
        console.log(`  - ${propName}: ${details} ${required}`);
      }
    } else {
      console.log(JSON.stringify(schema, null, 2));
    }
  }
} else {
  console.log("Operation POST /subadmin/quizzes not found");
}
