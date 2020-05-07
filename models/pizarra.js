var mongoose = require('mongoose');  
var PizarraSchema = new mongoose.Schema({  
  salaId: {
    type:mongoose.ObjectId,  
  },
  blocks: [{}],
  nombreArchivo:String 
},{timestamps:{ createdAt: 'creadaEn', updatedAt: 'modificadaEn' }});
mongoose.model('pizarras', PizarraSchema);
module.exports = mongoose.model('pizarras');
/*blocks: [
          {
            type: "header",
            data: {
              text: "ESTE ES EL EDITOR QUE HE PROGRAMADO",
              level: 2
            }
          },
          {
            type : 'paragraph',
            data : {
              text : 'Aqui iran las cosas que tengan que ir'
            }
          },
          {
            type: "header",
            data: {
              text: "POR EJEMPPLO",
              level: 3
            }
          },
          {
            type : 'list',
            data : {
              items : [
                'una lista',
                'con cada uno de sus puntos',
              ],
              style: 'unordered'
            }
          },
          {
            type: "header",
            data: {
              text: "PERO PODRIAN SER OTRAS COSAS",
              level: 3
            }
          }
     ]
     */