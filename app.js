require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const app = express()
//config json response
app.use(express.json())
//Models
const User = require('./models/User.js')

//open route - public route
app.get('/', (req,res) => {
  res.status(200).json({msg:'O servidor está funcionando corretamente'})
})

//private route
app.get('/user/:id', checkToken, async (req,res) => {
  const id = req.params.id;
  try{
    //check if user exists
    const user = await User.findById(id, "-password");
    if(!user){
      return res.status(404).json({ msg: "usuario nao encontrado" });
    }
    res.status(200).json({ user });
  }catch(err){
    console.log(err)
    res.status(500).json({msg: "houve um erro ao buscar o ususario"})
  }
})

function checkToken(req,res,next){
  const authHeader = req.headers['authorization']
  // const token = 'Bearer &*hDH78h7*@'
  const token = authHeader && authHeader.split(' ')[1]//divide a string 
  if(!token){
    return res.status(401).json({ msg: "Acesso negado!"});
  }
  try {
    const secret = process.env.SECRET
    jwt.verify(token, secret)
    next()
  } catch (err) {
    res.status(400).json({ msg: "Token invalido!"});
  }
}


//Register User
app.post('/auth/register', async(req, res) => {
  const {name, email, password, confirmpassword} = req.body
  //validations
  if(!name){
    return res.status(422).json({msg: 'O Nome é obrigatorio'})
  }
  if(!email){
    return res.status(422).json({msg: 'O E-mail é obrigatorio'})
  }
  if(!password){
    return res.status(422).json({msg: 'A senha é obrigatoria'})
  }
  if(password !== confirmpassword){
    return res.status(422).json({msg: 'As senhas não conferem'})
  }
  //check if user exists
  const userExists = await User.findOne({email: email})
  if(userExists){
    return res.status(422).json({msg: 'Esse email ja foi cadastrado'})
  }
  //create password
  const salt = await bcrypt.genSalt(12)
  const passwordHash = await bcrypt.hash(password, salt)

  //create user
  const user = new User({
    name: name, email: email, password: passwordHash
  })
  try{
    await user.save()
    res.status(201).json({msg: "Usuario criado com sucesso"})
  }catch(err){
    console.log(err);
    res.status(500).json({msg: "Houve um erro no servidor"})
  }

})


//login User
app.post('/auth/login', async(req,res) => {
  const {email, password} = req.body
  if(!email || !password){
    return res.status(422).json({msg: 'Está faltando e-mail ou senha'})
  }
  //checar se o usuario existe
  const user = await User.findOne({email: email})

  if(!user){
    return res.status(404).json({msg: 'Está faltando o usuario'})
  }
  //check if password match
  const checkPassword = await bcrypt.compare(password, user.password)
  if(!checkPassword){
    return res.status(422).json({msg: 'Senha incorreta'})
  }
  try{
    const secret = process.env.SECRET
    const token = jwt.sign(
      {
        id: user._id,
      },
      secret
    )
    res.status(200).json({msg:'Autenticação realizada com sucesso', token})
  }catch(err){
    console.log(err);
    res.status(500).json({msg: "Houve um erro no servidor"})
  }
  // return res.status(200).json({msg: 'Veio o usuario'})
})






//credencials 
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS

mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.novrypn.mongodb.net/Exemplo?retryWrites=true&w=majority`)
.then(() => {
  app.listen(3000)
  console.log('Conectado ao banco de dados')
}).catch(err => console.log(err))


// video parado em 1:06:25