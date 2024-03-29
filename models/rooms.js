var mongoose = require('mongoose');  
var RoomsSchema = new mongoose.Schema({  
  nombreSala: String,
  sessionId: String,
  ownerId:mongoose.ObjectId,
  unifiedToken:String,
  teacherToken:String,
  participants: [{
      email:String,
      token:String,
      publicToken:{
          type:Boolean,
          default:true
      },
      maxPublicToken:{
        type:Number,
        default:0
    },
      timesUsedToken:{
        type:Number,
        default:0
    }

  }],
  maxParticipants:Number,
  payment:{
      //1->gratis,2->voluntad,3->precio
    tipo:{
        type:Number,
        default:1
    },
    amount:[{
      type:Number
    }]
  }
},{timestamps:{ createdAt: 'creadaEn', updatedAt: 'modificadaEn' }});
// Getter
/*RoomsSchema.path('payment.amount').get(function(num) {
    return (num / 100).toFixed(2);
  });
  
  // Setter
RoomsSchema.path('payment.amount').set(function(num) {
    return num * 100;
  });*/
  function convierte(item)
  {
    item.map(function(value){
      return (num / 100).toFixed(2);
    });
    return item;
  }
  function recupera(item)
  {
    item.map(function(value){
      return num * 100;
    });
    return item;
  }
mongoose.model('rooms', RoomsSchema);
module.exports = mongoose.model('rooms');