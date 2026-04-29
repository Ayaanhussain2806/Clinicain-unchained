import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Lots from "@/pages/Lots";
import LotDetail from "@/pages/LotDetail";
import Bookings from "@/pages/Bookings";
import BookingDetail from "@/pages/BookingDetail";
import Rides from "@/pages/Rides";
import Pricing from "@/pages/Pricing";
import Admin from "@/pages/Admin";
import AdminBookings from "@/pages/AdminBookings";
import AdminRevenue from "@/pages/AdminRevenue";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center text-slate-400">
      <div className="text-center">
        <div className="text-6xl font-bold text-slate-200 mb-4">404</div>
        <p className="text-lg">Page not found</p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/lots" component={Lots} />
        <Route path="/lots/:id" component={LotDetail} />
        <Route path="/bookings" component={Bookings} />
        <Route path="/bookings/:id" component={BookingDetail} />
        <Route path="/rides" component={Rides} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/admin" component={Admin} />
        <Route path="/admin/bookings" component={AdminBookings} />
        <Route path="/admin/revenue" component={AdminRevenue} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
