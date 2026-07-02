const https = require('https');

https.get('https://lauratek.in:8000/openapi.json', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const obj = JSON.parse(data);
      const paths = Object.keys(obj.paths).filter(p => p.toLowerCase().includes('quiz'));
      console.log("Quiz Paths:");
      paths.forEach(p => {
        console.log(`- ${p}: ${Object.keys(obj.paths[p]).join(', ')}`);
      });
    } catch (e) {
      console.error("Failed to parse JSON:", e.message);
    }
  });
}).on('error', (err) => {
  console.error("Error fetching openapi.json:", err.message);
});
