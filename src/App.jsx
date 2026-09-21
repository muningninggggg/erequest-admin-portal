import {
  BrowserRouter,
  Navigate,
  Route,
  Routes
} from "react-router-dom";

import LoginPage from "./features/auth/pages/LoginPage";
import DashboardPage from "./features/dashboard/pages/DashboardPage";
import ServicesPage from "./features/services/pages/ServicesPage";

import TransactionsPage from "./features/transactions/pages/TransactionsPage";
import AddTransactionPage from "./features/transactions/pages/AddTransactionPage";
import EditTransactionPage from "./features/transactions/pages/EditTransactionPage";
import ManageTransactionPage from "./features/transactions/pages/ManageTransactionPage";

import AnnouncementsPage from "./features/announcements/pages/AnnouncementsPage";

import RequirementsPage from "./features/requirements/pages/RequirementsPage";

import ProtectedRoute from "./features/auth/components/ProtectedRoute";


function App() {

  return (

    <BrowserRouter>

      <Routes>


        {/* =====================================================
            DEFAULT
            ===================================================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />


        {/* =====================================================
            LOGIN
            ===================================================== */}

        <Route
          path="/login"
          element={<LoginPage />}
        />


        {/* =====================================================
            PROTECTED ADMIN ROUTES
            ===================================================== */}

        <Route element={<ProtectedRoute />}>


          {/* DASHBOARD */}

          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />


          {/* SERVICES */}

          <Route
            path="/services"
            element={<ServicesPage />}
          />


          {/* TRANSACTIONS LIST */}

          <Route
            path="/transactions"
            element={<TransactionsPage />}
          />


          {/* ADD TRANSACTION */}

          <Route
            path="/transactions/add"
            element={<AddTransactionPage />}
          />


          {/* EDIT TRANSACTION */}

          <Route
            path="/transactions/edit/:transactionId"
            element={<EditTransactionPage />}
          />


          {/* MANAGE TRANSACTION */}

          <Route
            path="/transactions/manage/:transactionId"
            element={<ManageTransactionPage />}
          />


          {/* REQUIREMENTS */}

          <Route
            path="/requirements"
            element={<RequirementsPage />}
          />


          {/* ANNOUNCEMENTS */}

          <Route
            path="/announcements"
            element={<AnnouncementsPage />}
          />


        </Route>


        {/* =====================================================
            UNKNOWN ROUTE
            ===================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />


      </Routes>

    </BrowserRouter>

  );

}


export default App;