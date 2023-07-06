const mongoose = require('mongoose')

mongoose.connect().then(() => {
  app.listen(3000)
  console.log('Conectado ao banco de dados')
}).catch(err => console.log(err))