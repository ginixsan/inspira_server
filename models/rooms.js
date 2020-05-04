var mongoose = require('mongoose');  
var RoomsSchema = new mongoose.Schema({  
  nombreSala: String,
  sessionId: String,
  participants: [{
      email:String,
      token:String,
      publicToken:String
  }],
  maxParticipants:Number,
  payment:{
      //1->gratis,2->voluntad,3->precio
    tipo:Number,
    amount:Number
  }
});
// Getter
RoomsSchema.path('payment.amount').get(function(num) {
    return (num / 100).toFixed(2);
  });
  
  // Setter
RoomsSchema.path('payment.amount').set(function(num) {
    return num * 100;
  });
mongoose.model('rooms', RoomsSchema);
module.exports = mongoose.model('rooms');