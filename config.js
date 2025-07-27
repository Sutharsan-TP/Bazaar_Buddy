// Environment Configuration
module.exports = {
  // MongoDB Atlas Connection String
  MONGODB_URI: process.env.MONGODB_URI,

  // JWT Secret Key
  JWT_SECRET: process.env.JWT_SECRET,

  // Server Port
  PORT: process.env.PORT || 5000,
};
