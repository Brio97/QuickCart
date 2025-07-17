# QuickCart 🛒

A modern e-commerce web application built with React frontend and Flask backend.

## Features

- 🛍️ Product browsing with search and category filtering
- 🛒 Shopping cart functionality
- 💳 Secure checkout process
- 📱 Responsive design with Tailwind CSS
- 🔍 Real-time product search
- 📦 Order management
- ✅ Comprehensive testing suite

## Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **Vitest** - Testing framework

### Backend
- **Flask** - Python web framework
- **SQLAlchemy** - Database ORM
- **SQLite** - Database
- **Flask-CORS** - Cross-origin resource sharing
- **Pytest** - Testing framework

## Project Structure

```
quickcart/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   ├── context/        # React context
│   │   └── test/          # Test utilities
│   ├── tests/             # Test files
│   └── public/            # Static assets
├── server/                # Flask backend
│   ├── app.py            # Main application
│   ├── models.py         # Database models
│   ├── run.py            # Application runner
│   └── tests/            # Backend tests
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:Brio97/QuickCart.git
   cd QuickCart
   ```

2. **Set up the backend**
   ```bash
   cd server
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install flask flask-sqlalchemy flask-cors
   python run.py
   ```

3. **Set up the frontend**
   ```bash
   cd client
   npm install
   npm run dev
   ```

4. **Environment Variables**
   ```bash
   # client/.env
   VITE_API_URL=http://localhost:5000/api
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd server
   python run.py
   ```
   Backend will run on http://localhost:5000

2. **Start the frontend development server**
   ```bash
   cd client
   npm run dev
   ```
   Frontend will run on http://localhost:3000

## API Endpoints

### Products
- `GET /api/products` - Get products with pagination and filtering
- `GET /api/products/<id>` - Get single product
- `GET /api/categories` - Get all categories

### Cart & Orders
- `POST /api/cart/validate` - Validate cart items
- `POST /api/checkout` - Process checkout
- `GET /api/orders/<order_number>` - Get order details

### Health
- `GET /api/health` - Health check

## Testing

### Frontend Tests
```bash
cd client
npm test
```

### Backend Tests
```bash
cd server
python -m pytest
```

## Development

### Frontend Development
- Components are located in `client/src/components/`
- API services in `client/src/services/api.js`
- Styling with Tailwind CSS
- State management with React Context

### Backend Development
- Flask application in `server/app.py`
- Database models in `server/models.py`
- SQLite database with sample data seeding

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

Brian - [@Brio97](https://github.com/Brio97)

Project Link: [https://github.com/Brio97/QuickCart](https://github.com/Brio97/QuickCart)
```

Now let's add all files and make the initial commit:

```bash
git add .
```

```bash
git status
```

```bash
git commit -m "Initial commit: QuickCart e-commerce application

- React frontend with Vite and Tailwind CSS
- Flask backend with SQLAlchemy
- Product browsing and search functionality
- Shopping cart and checkout system
- Comprehensive testing suite
- API integration between frontend and backend"
```

```bash
git branch -M main
```

```bash
git push -u origin main
```

Let's also create a simple package.json in the root for project metadata:

```json:package.json
{
  "name": "quickcart",
  "version": "1.0.0",
  "description": "A modern e-commerce web application built with React and Flask",
  "scripts": {
    "dev": "concurrently \"cd server && python run.py\" \"cd client && npm run dev\"",
    "test": "concurrently \"cd server && python -m pytest\" \"cd client && npm test\"",
    "build": "cd client && npm run build",
    "start:server": "cd server && python run.py",
    "start:client": "cd client && npm run dev"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/Brio97/QuickCart.git"
  },
  "keywords": [
    "ecommerce",
    "react",
    "flask",
    "shopping-cart",
    "web-application"
  ],
  "author": "Brian",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/Brio97/QuickCart/issues"
  },
  "homepage": "https://github.com/Brio97/QuickCart#readme",
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

If you want to install concurrently for easier development:

```bash
npm install -D concurrently
```

Then you can run both frontend and backend with:

```bash
npm run dev
