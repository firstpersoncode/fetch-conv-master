const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const messageSchema = mongoose.Schema({
   id: {
     type: String,
     required: true,
     index: true,
     unique: true
   },
   name: String,
   data: [],
   updated: {
     type: Date,
     default: Date.now()
   }
});
messageSchema.plugin(uniqueValidator)
const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
