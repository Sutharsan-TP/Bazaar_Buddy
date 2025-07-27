const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://Sutharsan:cGvWA7AkIVKmb0Ui@cluster0.1to2fxt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

console.log('Testing MongoDB connection...');
console.log('Connection string:', MONGODB_URI);

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:');
    console.error('Error:', err.message);
    console.error('Code:', err.code);
    process.exit(1);
  }); 