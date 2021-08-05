var mongoose = require('mongoose');

function mongo_connect() {
  mongoose.connect(process.env.MONGODB_URI);

  mongoose.connection.on('error', function() {
    console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  });

  mongoose.connection.on('disconnected', function() {
    console.log('MongoDB Connection disconnected');
  });

  mongoose.connection.on('open', function() {
    console.log('MongoDB Connection opened');
  });
}

export default mongo_connect;