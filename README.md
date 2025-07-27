# BazaarBuddy - Fresh Local Marketplace

A comprehensive marketplace application connecting suppliers, stall owners, and buyers with a modern React frontend and Node.js backend.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file in the root directory:
   ```env
   # MongoDB Atlas Connection String
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   
   # JWT Secret Key (use a strong, unique secret)
   JWT_SECRET=your-super-secret-jwt-key-here
   
   # Server Port
   PORT=5000
   ```

3. **Start the server:**
   ```bash
   node server.js
   ```

4. **Access the application:**
   - Frontend: http://localhost:5000
   - API Base URL: http://localhost:5000/api

## 🏗️ Architecture

### Backend (`server.js`)
- **Express.js** server with RESTful API
- **MongoDB** database with Mongoose ODM
- **JWT** authentication
- **CORS** enabled for frontend communication
- **Static file serving** for the React frontend

### Frontend (`public/index.html`)
- **React** application (CDN-based)
- **Axios** for API communication
- **Context API** for state management
- **Responsive design** with modern CSS

### Configuration (`config.js`)
- Centralized configuration management
- Environment variable support
- Secure credential handling

## 🔗 Frontend-Backend Integration

### How It Works

1. **Static File Serving:**
   ```javascript
   app.use(express.static(path.join(__dirname, 'public')));
   ```

2. **Root Route:**
   ```javascript
   app.get('/', (req, res) => {
     res.sendFile(path.join(__dirname, 'public', 'index.html'));
   });
   ```

3. **API Communication:**
   - Frontend uses `axios` with base URL: `http://localhost:5000/api`
   - Automatic token injection for authenticated requests
   - CORS enabled for seamless communication

### API Endpoints

#### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

#### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Add new product (suppliers only)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

#### Cart & Orders
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add to cart
- `PUT /api/cart/update` - Update cart
- `POST /api/orders` - Create order
- `GET /api/orders/my` - Get user orders

#### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `GET /api/suppliers/:id` - Get supplier details

## 🧪 Testing

Run the connection test to verify everything is working:

```bash
node test-connection.js
```

This will test:
- Server connectivity
- API endpoints
- Database connection
- Frontend serving

## 🔒 Security Features

- **JWT Authentication** with configurable secrets
- **Password Hashing** with bcrypt
- **CORS Protection** for API endpoints
- **Environment Variables** for sensitive data
- **Input Validation** and sanitization
- **Role-based Access Control**

## 📱 Features

### For Suppliers
- Product management
- Order tracking
- Analytics dashboard
- Inventory alerts
- Bulk operations

### For Buyers/Stall Owners
- Product browsing
- Shopping cart
- Order management
- Wishlist
- Supplier ratings

### General Features
- Real-time search
- Category filtering
- Price filtering
- Responsive design
- User profiles

## 🛠️ Development

### Project Structure
```
BazaarBuddy/
├── server.js          # Main server file
├── config.js          # Configuration
├── package.json       # Dependencies
├── .env              # Environment variables (create this)
├── .gitignore        # Git ignore rules
├── public/
│   └── index.html    # React frontend
└── test-connection.js # Connection test
```

### Adding New Features

1. **Backend API:**
   - Add routes in `server.js`
   - Create/update schemas as needed
   - Implement authentication middleware

2. **Frontend:**
   - Add React components in `index.html`
   - Update API calls using axios
   - Manage state with Context API

## 🚀 Deployment

### Environment Variables
Make sure to set these in production:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - A strong, unique secret key
- `PORT` - Server port (optional, defaults to 5000)

### Security Checklist
- [ ] Use HTTPS in production
- [ ] Set strong JWT secrets
- [ ] Configure CORS properly
- [ ] Use environment variables
- [ ] Enable rate limiting
- [ ] Set up proper logging

## 📞 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify MongoDB connection
3. Ensure all environment variables are set
4. Run the connection test: `node test-connection.js`

## 🎯 Next Steps

- Add image upload functionality
- Implement real-time notifications
- Add payment gateway integration
- Create mobile app versions
- Add advanced analytics
- Implement caching strategies
