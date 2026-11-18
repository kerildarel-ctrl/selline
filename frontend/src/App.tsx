import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './components/Toast'
import { Header } from './components/Header'
import { BottomNav } from './components/BottomNav'
import { PageSpinner } from './components/Spinner'

// Pages
import Welcome from './pages/Welcome'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import Account from './pages/Account'
import AccountEdit from './pages/AccountEdit'
import Addresses from './pages/Addresses'
import Favorites from './pages/Favorites'
import Notifications from './pages/Notifications'
import Messages from './pages/Messages'
import Conversation from './pages/Conversation'
import SellerDashboard from './pages/SellerDashboard'
import SellerProducts from './pages/SellerProducts'
import SellerProductForm from './pages/SellerProductForm'
import SellerOrders from './pages/SellerOrders'
import SellerRegister from './pages/SellerRegister'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import AdminShops from './pages/AdminShops'
import AdminProducts from './pages/AdminProducts'
import AdminCategories from './pages/AdminCategories'
import AdminReviews from './pages/AdminReviews'

function RequireAuth({ admin }: { admin?: boolean }) {
  const { user, loading } = useAuth()
  if(loading) return <PageSpinner />
  if(!user) return <Navigate to="/login" replace />
  if(admin && !user.isAdmin) return <Navigate to="/home" replace />
  return <Outlet />
}

function AppShell() {
  const { user } = useAuth()
  return (
    <>
      <Header />
      <Outlet />
      <BottomNav />
    </>
  )
}

function FullScreen() {
  return <Outlet />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <Routes>
              {/* Public auth pages (no shell) */}
              <Route element={<FullScreen />}>
                <Route path="/" element={<Welcome />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                {/* Conversation has its own full-screen layout */}
                <Route element={<RequireAuth />}>
                  <Route path="/messages/:id" element={<Conversation />} />
                </Route>
              </Route>

              {/* App shell with header + bottom nav */}
              <Route element={<AppShell />}>
                {/* Public pages */}
                <Route path="/home" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />

                {/* Auth required */}
                <Route element={<RequireAuth />}>
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/orders/:id" element={<OrderDetail />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/account/edit" element={<AccountEdit />} />
                  <Route path="/account/addresses" element={<Addresses />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/messages" element={<Messages />} />
                </Route>

                {/* Seller */}
                <Route path="/seller/register" element={<RequireAuth />}>
                  <Route index element={<SellerRegister />} />
                </Route>
                <Route element={<RequireAuth />}>
                  <Route path="/seller" element={<SellerDashboard />} />
                  <Route path="/seller/products" element={<SellerProducts />} />
                  <Route path="/seller/products/new" element={<SellerProductForm />} />
                  <Route path="/seller/products/:id/edit" element={<SellerProductForm />} />
                  <Route path="/seller/orders" element={<SellerOrders />} />
                </Route>

                {/* Admin */}
                <Route element={<RequireAuth admin />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/shops" element={<AdminShops />} />
                  <Route path="/admin/products" element={<AdminProducts />} />
                  <Route path="/admin/categories" element={<AdminCategories />} />
                  <Route path="/admin/reviews" element={<AdminReviews />} />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
