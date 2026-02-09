import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './auth/login';
import Signup from './auth/signup';
import { ProtectedRoute } from './auth/ProtectedRoute';
import Header from './components/Header';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import CategoryList from './admin/CategoryList';
import CategoryForm from './admin/CategoryForm';
import SubCategoryList from './admin/SubCategoryList';
import SubCategoryForm from './admin/SubCategoryForm';
import StockList from './admin/StockList';
import StockForm from './admin/StockForm';
import QuotationsList from './admin/QuotationsList';
import SiteVisitsList from './admin/SiteVisitsList';
import CustomersList from './admin/CustomersList';
import ComingSoon from './admin/ComingSoon';
import CustomerHome from './customer/CustomerHome';
import CategoryDetail from './customer/CategoryDetail';
import SubCategoryDetail from './customer/SubCategoryDetail';
import ContactPage from './customer/ContactPage';
import QuotationGenerator from './customer/QuotationGenerator';
import SiteVisitBooking from './customer/SiteVisitBooking';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Customer Routes - Public access */}
        <Route path="/" element={<CustomerHome />} />
        <Route path="/categories" element={<CustomerHome />} />
        <Route path="/category/:id" element={<CategoryDetail />} />
        <Route path="/subcategory/:id" element={<SubCategoryDetail />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/quotation" element={<QuotationGenerator />} />
        <Route path="/site-visit" element={<SiteVisitBooking />} />
        
        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="categories" element={<CategoryList />} />
          <Route path="categories/new" element={<CategoryForm />} />
          <Route path="categories/:id" element={<CategoryForm />} />
          <Route path="subcategories" element={<SubCategoryList />} />
          <Route path="subcategories/new" element={<SubCategoryForm />} />
          <Route path="subcategories/:id" element={<SubCategoryForm />} />
          <Route path="stock" element={<StockList />} />
          <Route path="stock/new" element={<StockForm />} />
          <Route path="stock/:id" element={<StockForm />} />
          <Route path="quotations" element={<QuotationsList />} />
          <Route path="sitevisits" element={<SiteVisitsList />} />
          <Route path="customers" element={<CustomersList />} />
          <Route path="settings" element={<ComingSoon title="Settings" />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
