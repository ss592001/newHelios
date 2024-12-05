
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const test = new Schema({
   name: {
      type: String
   },
   description:{
      type:String
   },
   type:{
      type:String
   },
   totalMarks:{
      type:String
   },
   testTime:{
      type:String
   },
   uploadedAt:{
      type:Date
   },
   Test:{
      type:Array
   }
})
module.exports = mongoose.model('test', test);