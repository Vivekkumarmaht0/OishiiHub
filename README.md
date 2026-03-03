# OishiiHub 🍜🍣

Welcome to **OishiiHub** - "Where Every Bite is Oishii". A comprehensive web application for an authentic Japanese dining experience, featuring an interactive menu, a dual-role ordering system (Guest/Customer and Staff/Chef), and a dynamic recipe discovery page.

![OishiiHub Preview](images/Foods/Reman.png)

## 🌟 Features

### 🛒 Ordering System
- **Customer View**: Browse the menu, add items to your cart, customize with modifiers (e.g., extra chashu, extra noodles), and place an order directly to the kitchen. Includes live order status updates and table number tracking.
- **Admin/Kitchen Dashboard**: Accessible via a PIN (Default: `101103`). Staff can view live incoming orders, filter by status or keyword, and update the order state (`Received`, `In Progress`, `Ready`, `Completed`).

### 📖 Recipe Finder
- Search for recipes directly through TheMealDB API integration.
- Discover authentic meals, view their ingredients, and follow step-by-step instructions.
- Includes embedded video tutorial links where available.

### 🍱 Main Site Pages
- **Home**: A beautifully designed landing page featuring popular favorites, step-by-step ordering guides, and an "Our Story" section about the restaurant.
- **Menu Items**: Dedicated pages for exploring specific categories like Ramen and Sushi.

## 🛠️ Technologies Used

- **HTML5**: Semantic and accessible markup.
- **Vanilla CSS3**: Custom design system using variables, Flexbox, CSS Grid, and responsive media queries.
- **Vanilla JavaScript**: DOM manipulation, LocalStorage-based mock backend for cross-tab state syncing, and asynchronous API calls (Fetch API).
- **TheMealDB API**: For dynamically sourcing and searching recipe data.
- **FontAwesome**: For beautiful, scalable iconography.

## 🚀 Getting Started

No complex build steps or dependencies are required! 

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Vivekkumarmaht0/OishiiHub.git
   ```
2. **Open the project:**
   Simply open `homePage.html` or `index.html` in your favorite modern web browser.
   - Start from `homePage.html` to view the landing page and navigate from there.
   - Start from `index.html` to jump straight into the Staff Login / Ordering Dashboard.

## 👮 Admin Access
To simulate the kitchen staff experience:
1. Navigate to the Admin Panel from the Home Page or open `index.html`.
2. Enter the default PIN: **`101103`**
3. Open a second tab as a Customer to place new orders and watch them appear live on the Admin Dashboard!

## 🤝 Contributing

Contributions are welcome! If you'd like to help improve OishiiHub, feel free to fork the repository and submit a pull request with your enhancements.

## 📄 License
&copy; 2026 OishiiHub. All rights reserved.
