const mongoose = require("mongoose");
//credenciais
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

async function connectDb(app) {
  try {
    await mongoose.connect(
      `mongodb+srv://${dbUser}:${dbPassword}@cluster0.novrypn.mongodb.net/Exemplo?retryWrites=true&w=majority`
    );
    console.log("conectar ao banco de dados");
    app.listen(3000);
  } catch (err) {
    console.log(err);
  }
}

module.exports = connectDb;
