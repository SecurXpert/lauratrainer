const fs = require('fs');

const jsonPath = "C:\\Users\\securxpert\\.gemini\\antigravity\\brain\\c3556401-0d99-4d47-8ead-d6e15443c1f0\\.system_generated\\steps\\706\\content.md";
const content = fs.readFileSync(jsonPath, 'utf8');

const jsonLines = content.split('\n');
let jsonText = '';
for (const line of jsonLines) {
  if (line.trim().startsWith('{')) {
    jsonText = line;
    break;
  }
}

const data = JSON.parse(jsonText);
const paths = data.paths || {};
const targetPath = "/trainer/quizzes";

if (paths[targetPath] && paths[targetPath].get) {
  const getObj = paths[targetPath].get;
  console.log("Get object:", JSON.stringify(getObj, null, 2));
  
  // Search component schema definition
  const responses = getObj.responses || {};
  const okResponse = responses["200"] || {};
  const contentObj = okResponse.content || {};
  const jsonContent = contentObj["application/json"] || {};
  const schema = jsonContent.schema || {};
  
  if (schema.$ref) {
    const refPath = schema.$ref.split('/');
    let current = data;
    for (let i = 1; i < refPath.length; i++) {
      current = current[refPath[i]];
    }
    console.log("Reference Schema:", JSON.stringify(current, null, 2));
  } else {
    console.log("Direct Schema:", JSON.stringify(schema, null, 2));
  }
} else {
  console.log("Path get not found");
}
