import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AdminLayout from "./layout/AdminLayout";
import BlogsPage from "./pages/Blogs";
import DashboardPage from "./pages/Dashboard";
import InventoryPage from "./pages/Inventory";
import LoginPage from "./pages/Login";
import OrdersPage from "./pages/Orders";
import ProductsPage from "./pages/Products";
import UsersPage from "./pages/Users";
import AdsPage from "./pages/Ads";
import ReviewsPage from "./pages/Reviews";
import ContactMessagesPage from "./pages/ContactMessages";
import BannersPage from "./pages/Banners";
import BrandsPage from "./pages/Brands";
import DealsPage from "./pages/Deals";
import CategoriesPage from "./pages/Categories";

function PrivateRoute({ children }) {
	const { isAuthenticated } = useAuth();
	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}
	return children;
}

function App() {
	return (
		<Routes>
			<Route path="/login" element={<LoginPage />} />
			<Route
				path="/"
				element={
					<PrivateRoute>
						<AdminLayout />
					</PrivateRoute>
				}
			>
				<Route index element={<DashboardPage />} />
				<Route path="products" element={<ProductsPage />} />
				<Route path="inventory" element={<InventoryPage />} />
				<Route path="orders" element={<OrdersPage />} />
				<Route path="blogs" element={<BlogsPage />} />
				<Route path="categories" element={<CategoriesPage />} />
				<Route path="users" element={<UsersPage />} />
				<Route path="ads" element={<AdsPage />} />
				<Route path="reviews" element={<ReviewsPage />} />
				<Route path="banners" element={<BannersPage />} />
				<Route path="brands" element={<BrandsPage />} />
				<Route path="deals" element={<DealsPage />} />
				<Route path="contact-messages" element={<ContactMessagesPage />} />
			</Route>
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}

export default App;
