// @ts-nocheck
import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>GK General Store - Your Neighborhood Store Online</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
            
            * {
              font-family: 'Inter', sans-serif;
            }
            
            .gradient-bg {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            
            .product-card {
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .product-card:hover {
              transform: translateY(-8px);
              box-shadow: 0 20px 40px rgba(0,0,0,0.15);
            }
            
            .badge-discount {
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            }
            
            .badge-popular {
              background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            }
            
            .category-btn {
              transition: all 0.2s ease;
            }
            
            .category-btn:hover {
              transform: scale(1.05);
            }
            
            .category-btn.active {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            
            .cart-badge {
              animation: bounce 0.5s ease;
            }
            
            @keyframes bounce {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.2); }
            }
            
            .search-input {
              transition: all 0.3s ease;
            }
            
            .search-input:focus {
              box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
            }
            
            .empty-cart {
              animation: fadeIn 0.5s ease;
            }
            
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}
        </style>
      </head>
      <body class="bg-gray-50">{children}</body>
    </html>
  )
})