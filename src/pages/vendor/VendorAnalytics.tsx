import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Loader2 } from "lucide-react";
import { api } from '@/lib/axios';
import { formatCurrency } from '@/lib/utils';
import ProtectedRoute from "@/components/ProtectedRoute";

interface ProductAnalytics {
  _id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  averageRating: number;
  totalRatings: number;
  totalSales: number;
  revenue: number;
  totalQuantitySold: number;
  dailySales: Array<{
    date: string;
    sales: number;
  }>;
}

const VendorAnalytics = () => {
  const [timeRange, setTimeRange] = useState('30');
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [products, setProducts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<ProductAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products/vendor/own');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const url = selectedProduct === 'all' 
          ? `/products/vendor/analytics?timeRange=${timeRange}`
          : `/products/vendor/analytics/${selectedProduct}?timeRange=${timeRange}`;
        
        const response = await api.get(url);
        setAnalytics(response.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [timeRange, selectedProduct]);

  // Calculate overall metrics
  const overallMetrics = {
    totalRevenue: analytics.reduce((sum, product) => sum + product.revenue, 0),
    totalSales: analytics.reduce((sum, product) => sum + product.totalSales, 0),
    averageRating: analytics.reduce((sum, product) => sum + product.averageRating, 0) / analytics.length || 0,
    totalProducts: analytics.length
  };

  // Prepare data for daily sales chart
  const dailySalesData = analytics[0]?.dailySales.map(day => ({
    date: new Date(day.date).toLocaleDateString(),
    sales: analytics.reduce((sum, product) => {
      const productDay = product.dailySales.find(d => new Date(d.date).toLocaleDateString() === new Date(day.date).toLocaleDateString());
      return sum + (productDay?.sales || 0);
    }, 0)
  })) || [];

  // Prepare data for product comparison chart
  const productComparisonData = analytics.map(product => ({
    name: product.name,
    sales: product.totalSales,
    revenue: product.revenue,
    rating: product.averageRating
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Vendor Analytics</h1>
        <p className="text-muted-foreground">
          Track your product performance and sales metrics
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select product" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            {products.map(product => (
              <SelectItem key={product._id} value={product._id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>Overall earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(overallMetrics.totalRevenue)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Sales</CardTitle>
            <CardDescription>Number of orders</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{overallMetrics.totalSales}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Rating</CardTitle>
            <CardDescription>Customer satisfaction</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{overallMetrics.averageRating.toFixed(1)} ⭐</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Products</CardTitle>
            <CardDescription>Total products</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{overallMetrics.totalProducts}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sales">Sales Trends</TabsTrigger>
          <TabsTrigger value="products">Product Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Daily Sales Trend</CardTitle>
              <CardDescription>Track your daily sales performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailySalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sales" stroke="#8884d8" name="Sales" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
              <CardDescription>Compare product metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="sales" fill="#8884d8" name="Sales" />
                    <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>Individual product performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {analytics.map(product => (
                <Card key={product._id}>
                  <CardHeader>
                    <CardTitle>{product.name}</CardTitle>
                    <CardDescription>{product.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Revenue:</span>
                        <span className="font-bold">{formatCurrency(product.revenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sales:</span>
                        <span className="font-bold">{product.totalSales}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rating:</span>
                        <span className="font-bold">{product.averageRating.toFixed(1)} ⭐</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Stock:</span>
                        <span className="font-bold">{product.stock}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ProtectedVendorAnalytics = () => {
  return (
    <ProtectedRoute allowedRoles={["vendor"]}>
      <VendorAnalytics />
    </ProtectedRoute>
  );
};

export default ProtectedVendorAnalytics; 