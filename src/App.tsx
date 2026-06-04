import * as Sentry from "@sentry/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import type { ComponentType, ReactNode } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import IndexPage from "@/pages/Index";
import LoginPage from "@/pages/Login";
import SignupPage from "@/pages/Signup";
import ForgotPasswordPage from "@/pages/ForgotPassword";
import DashboardLayout from "@/pages/DashboardLayout";
import DashboardPage from "@/pages/Dashboard";
import VehiclesListPage from "@/pages/VehiclesList";
import VehicleNewPage from "@/pages/VehicleNew";
import VehiclePassportPage from "@/pages/VehiclePassport";
import InterventionNewPage from "@/pages/InterventionNew";
import InterventionsListPage from "@/pages/InterventionsList";
import AlertsCenterPage from "@/pages/AlertsCenter";
import GaragesListPage from "@/pages/GaragesList";
import AdminPage from "@/pages/AdminPage";
import AdminRevenue from "@/pages/AdminRevenue";
import GarageDetailPage from "@/pages/GarageDetail";
import VehicleInterventionsPage from "@/pages/VehicleInterventions";
import NotFound from "@/pages/NotFound";
import OnboardingPage from "@/pages/Onboarding";
import GarageOnboardingPage from "@/pages/GarageOnboarding";
import InstallPage from "@/pages/Install";
import BrandPreview from "@/pages/BrandPreview";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import LegalNotice from "@/pages/LegalNotice";
import PartnerContract from "@/pages/PartnerContract";
import FAQPage from "@/pages/FAQ";
import LocalBusiness from "@/pages/LocalBusiness";
import MarketplaceLayout from "@/pages/marketplace/MarketplaceLayout";
import SellerDashboard from "@/pages/marketplace/SellerDashboard";
import SellerInventory from "@/pages/marketplace/SellerInventory";
import SellerAddPart from "@/pages/marketplace/SellerAddPart";
import SellerProfile from "@/pages/marketplace/SellerProfile";
import SellerOrders from "@/pages/marketplace/SellerOrders";
import MarketplaceBrowse from "@/pages/marketplace/MarketplaceBrowse";
import CheckoutPage from "@/pages/marketplace/CheckoutPage";
import BuyerOrders from "@/pages/marketplace/BuyerOrders";
import { PWAInstallBanner } from "@/components/pwa/PWAInstallBanner";
import { StatusBanner } from "@/components/layout/StatusBanner";
import FlutterwaveReturnPage from "@/pages/FlutterwaveReturn";

const queryClient = new QueryClient();
const ErrorBoundary = Sentry.ErrorBoundary as unknown as ComponentType<{ fallback: ReactNode; children?: ReactNode }>;
const AppHelmetProvider = HelmetProvider as unknown as ComponentType<{ children?: ReactNode }>;

const App = () => (
  <ErrorBoundary fallback={<p className="p-8 text-center text-destructive">Une erreur inattendue est survenue. Veuillez rafraîchir la page.</p>}>
    <AppHelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <PWAInstallBanner />
          <StatusBanner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<IndexPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/onboarding/garage" element={<GarageOnboardingPage />} />
                
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="vehicles" element={<VehiclesListPage />} />
                  <Route path="vehicles/new" element={<VehicleNewPage />} />
                  <Route path="vehicles/:id" element={<VehiclePassportPage />} />
                  <Route path="vehicles/:id/interventions" element={<VehicleInterventionsPage />} />
                  <Route path="interventions" element={<InterventionsListPage />} />
                  <Route path="interventions/new" element={<InterventionNewPage />} />
                  <Route path="alerts" element={<AlertsCenterPage />} />
                  <Route path="garages" element={<GaragesListPage />} />
                  <Route path="garages/:id" element={<GarageDetailPage />} />
                  <Route path="admin" element={<AdminPage />} />
                  <Route path="admin/revenue" element={<AdminRevenue />} />
                </Route>
                
                <Route path="/marketplace" element={<MarketplaceLayout />}>
                  <Route index element={<Navigate to="/marketplace/dashboard" replace />} />
                  <Route path="dashboard" element={<SellerDashboard />} />
                  <Route path="inventory" element={<SellerInventory />} />
                  <Route path="add" element={<SellerAddPart />} />
                  <Route path="profile" element={<SellerProfile />} />
                  <Route path="orders" element={<SellerOrders />} />
                </Route>
                
                <Route path="/marketplace/browse" element={<MarketplaceBrowse />} />
                <Route path="/marketplace/checkout" element={<CheckoutPage />} />
                <Route path="/marketplace/orders" element={<BuyerOrders />} />
                <Route path="/install" element={<InstallPage />} />
                <Route path="/brand" element={<BrandPreview />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/legal" element={<LegalNotice />} />
                <Route path="/partner-contract" element={<PartnerContract />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/local" element={<LocalBusiness />} />
                <Route path="/payments/flutterwave/return" element={<FlutterwaveReturnPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AppHelmetProvider>
  </ErrorBoundary>
);

export default App;