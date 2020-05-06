var mongoose = require('mongoose');  
var EntrySchema = new mongoose.Schema({
  salaId:mongoose.ObjectId,  
  tokenEntrada: String,
  nombreSala: String,
  entraSale:Boolean  
},{timestamps:{ createdAt: 'creadaEn', updatedAt: 'modificadaEn' }});
mongoose.model('entries', UserSchema);
module.exports = mongoose.model('entries');