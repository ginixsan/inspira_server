var mongoose = require('mongoose');  
var UserSchema = new mongoose.Schema({  
  email: String,
  password: String  
},{timestamps:{ createdAt: 'creadaEn', updatedAt: 'modificadaEn' }});
mongoose.model('users', UserSchema);
module.exports = mongoose.model('users');