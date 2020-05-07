var mongoose = require('mongoose');  
var EntrySchema = new mongoose.Schema({  
  salaId: {
    type:mongoose.ObjectId,  
  },
  tokenEntrada: String,
  nombreSala: String,
  entraSale:Boolean 
},{timestamps:{ createdAt: 'creadaEn', updatedAt: 'modificadaEn' }});
mongoose.model('entries', EntrySchema);
module.exports = mongoose.model('entries');