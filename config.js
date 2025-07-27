// Environment Configuration
module.exports = {
  // MongoDB Atlas Connection String
  MONGODB_URI:
    "mongodb+srv://Sutharsan:cGvWA7AkIVKmb0Ui@cluster0.1to2fxt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",

  // JWT Secret Key
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",

  // Server Port
  PORT: process.env.PORT || 5000,
};
