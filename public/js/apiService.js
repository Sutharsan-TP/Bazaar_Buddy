// API Configuration
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : window.location.origin + "/api";

// API Service Functions
const apiService = {
  // Auth APIs
  login: async (credentials) => {
    const response = await axios.post(`${API_BASE_URL}/login`, credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await axios.post(`${API_BASE_URL}/register`, userData);
    return response.data;
  },

  // Product APIs
  getProducts: async (params = {}) => {
    const response = await axios.get(`${API_BASE_URL}/products`, { params });
    return response.data;
  },

  getProduct: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/products/${id}`);
    return response.data;
  },

  // Supplier-specific Product APIs
  getMyProducts: async (token) => {
    console.log("API Service: Getting my products with token:", token);
    const response = await axios.get(`${API_BASE_URL}/products/my`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("API Service: Response:", response.data);
    return response.data;
  },

  addProduct: async (productData, token) => {
    const response = await axios.post(`${API_BASE_URL}/products`, productData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  updateProduct: async (productId, productData, token) => {
    const response = await axios.put(
      `${API_BASE_URL}/products/${productId}`,
      productData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  deleteProduct: async (productId, token) => {
    const response = await axios.delete(
      `${API_BASE_URL}/products/${productId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  // Supplier APIs
  getSuppliers: async (params = {}) => {
    const response = await axios.get(`${API_BASE_URL}/suppliers`, { params });
    return response.data;
  },

  getSupplier: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/suppliers/${id}`);
    return response.data;
  },

  // Rating APIs
  submitRating: async (ratingData, token) => {
    const response = await axios.post(`${API_BASE_URL}/ratings`, ratingData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getSupplierRatings: async (supplierId) => {
    const response = await axios.get(`${API_BASE_URL}/suppliers/${supplierId}`);
    return response.data;
  },

  // Order APIs
  getOrders: async (token, params = {}) => {
    const response = await axios.get(`${API_BASE_URL}/orders/my`, {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  createOrder: async (orderData, token) => {
    const response = await axios.post(`${API_BASE_URL}/orders`, orderData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Cart APIs
  getCart: async (token) => {
    const response = await axios.get(`${API_BASE_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  addToCart: async (productId, quantity, token) => {
    const response = await axios.post(
      `${API_BASE_URL}/cart/add`,
      {
        productId,
        quantity,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  updateCartQuantity: async (productId, quantity, token) => {
    const response = await axios.put(
      `${API_BASE_URL}/cart/update`,
      {
        productId,
        quantity,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  clearCart: async (token) => {
    const response = await axios.delete(`${API_BASE_URL}/cart/clear`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Analytics APIs
  getAnalytics: async (token, period = "30") => {
    const response = await axios.get(`${API_BASE_URL}/analytics/supplier`, {
      params: { period },
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getInventoryAlerts: async (token) => {
    const response = await axios.get(`${API_BASE_URL}/inventory/alerts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Order Management APIs
  updateOrderStatus: async (orderId, status, notes, token) => {
    const response = await axios.put(
      `${API_BASE_URL}/orders/${orderId}/status`,
      { status, notes },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  getOrderDetails: async (orderId, token) => {
    const response = await axios.get(`${API_BASE_URL}/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Wishlist APIs
  getWishlist: async (token) => {
    const response = await axios.get(`${API_BASE_URL}/wishlist`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  toggleWishlist: async (productId, token) => {
    const response = await axios.post(
      `${API_BASE_URL}/wishlist/toggle`,
      { productId },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },
};
