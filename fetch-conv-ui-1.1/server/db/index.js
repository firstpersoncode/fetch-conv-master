const mongoose = require('mongoose');
// connect database
module.exports = (db) => {
  return mongoose.connect(db, (err) => {
    if (err) {
      return console.log(err)
    }
    
    console.log('Connected to database', db)
  });
}
