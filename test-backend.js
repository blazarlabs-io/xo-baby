const axios = require("axios");

const BASE_URL = "http://localhost:3000";
const KID_ID = "srnxTIaPEgsmhwMCoWfs";

async function testBackend() {
  console.log("🧪 Testing Backend API Endpoints...\n");

  try {
    // Test weight endpoint
    console.log("📊 Testing Weight Endpoint...");
    const weightResponse = await axios.get(
      `${BASE_URL}/measurements/${KID_ID}/weight`
    );
    console.log("✅ Weight GET:", weightResponse.status, weightResponse.data);
  } catch (error) {
    console.log(
      "❌ Weight GET Error:",
      error.response?.status,
      error.response?.data
    );
  }

  try {
    // Test height endpoint
    console.log("\n📏 Testing Height Endpoint...");
    const heightResponse = await axios.get(
      `${BASE_URL}/measurements/${KID_ID}/height`
    );
    console.log("✅ Height GET:", heightResponse.status, heightResponse.data);
  } catch (error) {
    console.log(
      "❌ Height GET Error:",
      error.response?.status,
      error.response?.data
    );
  }

  try {
    // Test head circumference endpoint
    console.log("\n👶 Testing Head Circumference Endpoint...");
    const headResponse = await axios.get(
      `${BASE_URL}/measurements/${KID_ID}/head-circumference`
    );
    console.log(
      "✅ Head Circumference GET:",
      headResponse.status,
      headResponse.data
    );
  } catch (error) {
    console.log(
      "❌ Head Circumference GET Error:",
      error.response?.status,
      error.response?.data
    );
  }

  console.log("\n🔍 Backend Test Complete!");
}

testBackend().catch(console.error);



