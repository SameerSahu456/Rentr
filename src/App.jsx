import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import LandingPage from './pages/landing/LandingPage'
import AboutPage from './pages/about/AboutPage'
import SearchPage from './pages/search/SearchPage'
import ProductPage from './pages/product/ProductPage'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import CustomerDashboard from './pages/dashboard/CustomerDashboard'
import DistributorDashboard from './pages/dashboard/DistributorDashboard'
import WishlistPage from './pages/dashboard/WishlistPage'
import CustomerSettings from './pages/settings/CustomerSettings'
import DistributorSettings from './pages/settings/DistributorSettings'
import CustomerCheckout from './pages/checkout/CustomerCheckout'
import DistributorCheckout from './pages/checkout/DistributorCheckout'
import BenefitsPage from './pages/benefits/BenefitsPage'
import BuildYourOwn from './pages/build-your-own/BuildYourOwn'
import PaymentSuccessPage from './pages/checkout/PaymentSuccessPage'
import OrderCancelledPage from './pages/checkout/OrderCancelledPage'
import PaymentFailurePage from './pages/checkout/PaymentFailurePage'
import CancellationReturnPage from './pages/policies/CancellationReturnPage'
import ShippingPolicyPage from './pages/policies/ShippingPolicyPage'
import PrivacyPolicyPage from './pages/policies/PrivacyPolicyPage'
import RentalTermsPage from './pages/policies/RentalTermsPage'
import KnowYourCustomerPage from './pages/policies/KnowYourCustomerPage'
import CorporateEnquiriesPage from './pages/policies/CorporateEnquiriesPage'
import ReferralPage from './pages/policies/ReferralPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/benefits" element={<BenefitsPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/products/:category" element={<SearchPage />} />
        <Route path="/product/:slug" element={<ProductPage />} />
        <Route path="/build-your-own" element={<BuildYourOwn />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<CustomerDashboard />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/distributor/dashboard" element={<DistributorDashboard />} />
        <Route path="/settings" element={<CustomerSettings />} />
        <Route path="/distributor/settings" element={<DistributorSettings />} />
        <Route path="/checkout" element={<CustomerCheckout />} />
        <Route path="/distributor/checkout" element={<DistributorCheckout />} />
        <Route path="/order-success" element={<PaymentSuccessPage />} />
        <Route path="/order-cancelled" element={<OrderCancelledPage />} />
        <Route path="/payment-failed" element={<PaymentFailurePage />} />
        <Route path="/cancellation-return" element={<CancellationReturnPage />} />
        <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/rental-terms" element={<RentalTermsPage />} />
        <Route path="/kyc" element={<KnowYourCustomerPage />} />
        <Route path="/corporate-enquiries" element={<CorporateEnquiriesPage />} />
        <Route path="/referral-terms" element={<ReferralPage />} />
      </Route>
    </Routes>
  )
}
