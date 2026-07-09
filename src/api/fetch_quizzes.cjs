const { API_BASE_URL } = require("../pages/services/api/api");

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzNSIsInN0dWRlbnRfaWQiOjM1LCJyb2xlIjoidHJhaW5lciIsImtpbmQiOiJhY2Nlc3MiLCJleHAiOjE3ODA1NjMzNDh9.mddIDlv3qIhnUXBRvHy2-T5CrmeVzOp0DLKsGEccp7Q";

async function run() {
  try {
    const res = await fetch(`${API_BASE_URL}/trainer/quizzes`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "accept": "application/json"
      }
    });
    console.log("Status:", res.status);
    const body = await res.json();
    console.log("Response body:", JSON.stringify(body, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
