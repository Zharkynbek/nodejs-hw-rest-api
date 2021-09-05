const app = require("../app");
const db = require("../model/db");

const PORT = process.env.PORT || 3000;

db.then(() => {
  app.listen(PORT, () => {
    console.log(`hey bro, server is okay. Use our API on port: ${PORT}`);
  });
}).catch((e) => {
  console.log(`Error: ${e.message}`);
});
