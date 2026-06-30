const axios = require('axios');
const FormData = require('form-data');

const API_BASE = 'https://lauratek.in:8000';

async function runTest() {
  console.log("=== 1. Logging in to obtain token ===");
  let token = '';
  try {
    const loginRes = await axios.post(`${API_BASE}/login/token`, new URLSearchParams({
      username: 'sara.jehn@gmail.com',
      password: 'password'
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    token = loginRes.data.access_token;
    console.log("Login successful! Token:", token.substring(0, 15) + "...");
  } catch (err) {
    console.error("Login failed:", err.response?.data || err.message);
    return;
  }

  // Test 1: Complete required fields
  console.log("\n=== Test 1: Sending required fields (title, description, course_id, timer) ===");
  try {
    const form = new FormData();
    form.append('title', 'Test Quiz Title');
    form.append('description', 'Test quiz description');
    form.append('course_id', 1);
    form.append('timer', 15);

    const res = await axios.post(`${API_BASE}/subadmin/quizzes`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });
    console.log("Test 1 Result: SUCCESS", res.data);
  } catch (err) {
    console.error("Test 1 Result: FAILED", err.response?.data || err.message);
  }

  // Test 2: Sending extra field (category)
  console.log("\n=== Test 2: Sending required fields + extra field (category) ===");
  try {
    const form = new FormData();
    form.append('title', 'Test Quiz Title 2');
    form.append('description', 'Test quiz description 2');
    form.append('course_id', 1);
    form.append('timer', 15);
    form.append('category', 'Programming');

    const res = await axios.post(`${API_BASE}/subadmin/quizzes`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });
    console.log("Test 2 Result: SUCCESS", res.data);
  } catch (err) {
    console.error("Test 2 Result: FAILED", err.response?.data || err.message);
  }

  // Test 3: Missing description
  console.log("\n=== Test 3: Missing description ===");
  try {
    const form = new FormData();
    form.append('title', 'Test Quiz Title 3');
    form.append('course_id', 1);
    form.append('timer', 15);

    const res = await axios.post(`${API_BASE}/subadmin/quizzes`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });
    console.log("Test 3 Result: SUCCESS", res.data);
  } catch (err) {
    console.error("Test 3 Result: FAILED", err.response?.data || err.message);
  }
}

runTest();
