import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import InvoicesPage from './pages/InvoicesPage';
import InvoiceForm from './pages/InvoiceForm';
import InvoiceDetail from './pages/InvoiceDetail';
import PaymentsPage from './pages/PaymentsPage';
import ContractsPage from './pages/ContractsPage';
import ContractForm from './pages/ContractForm';
import ContractDetail from './pages/ContractDetail';
import SupportPage from './pages/SupportPage';
import TicketForm from './pages/TicketForm';
import TicketDetail from './pages/TicketDetail';
import OrdersPage from './pages/OrdersPage';
import OrderDetail from './pages/OrderDetail';
import CustomersPage from './pages/CustomersPage';
import CustomerDetail from './pages/CustomerDetail';
import SignupPage from './pages/SignupPage';
import SettingsPage from './pages/SettingsPage';
import AssetsPage from './pages/AssetsPage';
import AssetDetail from './pages/AssetDetail';
import AssetForm from './pages/AssetForm';
import ReturnsPage from './pages/ReturnsPage';
import ReturnDetail from './pages/ReturnDetail';
import ReturnForm from './pages/ReturnForm';
import KYCDetail from './pages/KYCDetail';
import PartnerDetail from './pages/PartnerDetail';
import AnalyticsPage from './pages/AnalyticsPage';
import AdvanceReplacementsPage from './pages/AdvanceReplacementsPage';
import LogisticsPage from './pages/LogisticsPage';
import ShipmentDetail from './pages/ShipmentDetail';
import DeliveryChallanDetail from './pages/DeliveryChallanDetail';
import ReplacementsPage from './pages/ReplacementsPage';
import ReplacementDetail from './pages/ReplacementDetail';
import UsersPage from './pages/UsersPage';
import NotificationsPage from './pages/NotificationsPage';
import AuditTrailPage from './pages/AuditTrailPage';
import BillingPage from './pages/BillingPage';
import ReportsPage from './pages/ReportsPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-3 border-rentr-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/customers/:email" element={<CustomerDetail />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/invoices/new" element={<InvoiceForm />} />
        <Route path="/invoices/:id" element={<InvoiceDetail />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/contracts" element={<ContractsPage />} />
        <Route path="/contracts/new" element={<ContractForm />} />
        <Route path="/contracts/:id" element={<ContractDetail />} />
        <Route path="/contracts/:id/edit" element={<ContractForm />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/support/new" element={<TicketForm />} />
        <Route path="/support/:id" element={<TicketDetail />} />
        <Route path="/assets" element={<AssetsPage />} />
        <Route path="/assets/new" element={<AssetForm />} />
        <Route path="/assets/:id" element={<AssetDetail />} />
        <Route path="/returns" element={<ReturnsPage />} />
        <Route path="/returns/new" element={<ReturnForm />} />
        <Route path="/returns/:id" element={<ReturnDetail />} />
        {/* KYC & Partners — detail pages still accessible, list redirects to Customers */}
        <Route path="/kyc" element={<Navigate to="/customers?tab=kyc" replace />} />
        <Route path="/kyc/:id" element={<KYCDetail />} />
        <Route path="/partners" element={<Navigate to="/customers?tab=partners" replace />} />
        <Route path="/partners/:email" element={<PartnerDetail />} />
        <Route path="/logistics" element={<LogisticsPage />} />
        <Route path="/shipments" element={<Navigate to="/logistics" replace />} />
        <Route path="/shipments/:id" element={<ShipmentDetail />} />
        <Route path="/delivery-challans" element={<Navigate to="/logistics" replace />} />
        <Route path="/delivery-challans/:id" element={<DeliveryChallanDetail />} />
        <Route path="/replacements" element={<ReplacementsPage />} />
        <Route path="/replacements/:id" element={<ReplacementDetail />} />
        <Route path="/advance-replacements" element={<Navigate to="/replacements" replace />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/audit-trail" element={<AuditTrailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
