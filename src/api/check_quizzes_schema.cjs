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

if (paths[targetPath]) {
  console.log(JSON.stringify(paths[targetPath], null, 2));
} else {
  console.log("Path not found in OpenAPI:", targetPath);
}
