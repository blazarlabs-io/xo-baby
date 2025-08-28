// Point the Vercel serverless function to your compiled Nest handler
module.exports = require('../dist/serverless.js').default;