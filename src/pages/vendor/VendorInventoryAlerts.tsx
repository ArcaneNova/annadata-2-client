import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/axios";
import { AlertTriangle, Check, Package, Truck, BarChart2, Settings, BellRing, X } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  images: Array<{ url: string; public_id: string }>;
  averageRating: number;
  totalRatings: number;
  seller: string;
}

interface AlertSettings {
  enabled: boolean;
  threshold: number;
  notifyByEmail: boolean;
  emailFrequency: 'daily' | 'immediate';
}

const VendorInventoryAlerts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    enabled: true,
    threshold: 10,
    notifyByEmail: false,
    emailFrequency: 'immediate'
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [restockAmount, setRestockAmount] = useState(10);
  const [isRestocking, setIsRestocking] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchAlertSettings();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/vendor/own');
      setProducts(response.data);

      // Filter low stock products
      const lowStock = response.data.filter((product: Product) => 
        product.stock < alertSettings.threshold
      );
      setLowStockProducts(lowStock);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch products. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAlertSettings = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/inventory/alerts/settings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAlertSettings({
          enabled: data.enabled,
          threshold: data.threshold,
          notifyByEmail: data.notifyByEmail || false,
          emailFrequency: data.emailFrequency || 'daily'
        });
      } else {
        // Handle non-200 responses (like 404)
        console.log("Alert settings endpoint returned status:", response.status);
        // Use default values if endpoint doesn't exist
        setAlertSettings({
          enabled: false,
          threshold: 5,
          notifyByEmail: false,
          emailFrequency: 'daily'
        });
      }
    } catch (error) {
      console.error('Error fetching alert settings:', error);
      // Set default values on error
      setAlertSettings({
        enabled: false,
        threshold: 5,
        notifyByEmail: false,
        emailFrequency: 'daily'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveAlertSettings = async () => {
    try {
      await api.post('/inventory/alerts/settings', alertSettings);
      toast({
        title: 'Success',
        description: 'Alert settings saved successfully.',
      });
      setIsSettingsOpen(false);

      // Refresh products to update low stock items
      fetchProducts();
    } catch (error) {
      console.error('Error saving alert settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save alert settings.',
        variant: 'destructive',
      });
    }
  };

  const handleRestock = async () => {
    if (!selectedProduct) return;

    try {
      setIsRestocking(true);
      // Update product stock
      await api.patch(`/products/${selectedProduct._id}`, {
        stock: selectedProduct.stock + restockAmount
      });

      toast({
        title: 'Success',
        description: `${selectedProduct.name} restocked successfully.`,
      });

      // Refresh products
      fetchProducts();
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error restocking product:', error);
      toast({
        title: 'Error',
        description: 'Failed to restock product.',
        variant: 'destructive',
      });
    } finally {
      setIsRestocking(false);
    }
  };

  const openRestockDialog = (product: Product) => {
    setSelectedProduct(product);
    setRestockAmount(Math.max(alertSettings.threshold - product.stock, 5));
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Inventory Alerts</h1>
          <p className="text-muted-foreground">
            Monitor low stock products and manage alerts
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button variant="outline" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Alert Settings
          </Button>
          <Link to="/vendor/dashboard">
            <Button variant="default">
              Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Low Stock Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {lowStockProducts.length}
            </div>
            <p className="text-sm text-muted-foreground">
              Products below threshold ({alertSettings.threshold} units)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              Total Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {products.reduce((sum, product) => sum + product.stock, 0)}
            </div>
            <p className="text-sm text-muted-foreground">
              Total units in stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing className="h-5 w-5 text-amber-500" />
              Alert Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span>Low Stock Alerts</span>
              <Switch
                checked={alertSettings.enabled}
                onCheckedChange={(checked) => {
                  setAlertSettings((prev) => ({
                    ...prev,
                    enabled: checked,
                  }));
                }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {alertSettings.enabled
                ? `Alerts enabled (${alertSettings.threshold} units threshold)`
                : 'Alerts disabled'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Low Stock Products</CardTitle>
          <CardDescription>
            Products that need restocking soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : lowStockProducts.length === 0 ? (
            <div className="text-center py-8">
              <Check className="mx-auto h-12 w-12 text-green-500 opacity-50" />
              <h3 className="mt-4 text-lg font-medium">All products well-stocked</h3>
              <p className="text-sm text-muted-foreground">
                No products below the threshold of {alertSettings.threshold} units
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Current Stock</TableHead>
                    <TableHead className="text-right">Threshold</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockProducts.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="text-right">
                        <span className={`font-medium ${product.stock === 0 ? 'text-red-500' : 'text-amber-500'}`}>
                          {product.stock} {product.unit}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{alertSettings.threshold}</TableCell>
                      <TableCell className="text-right">
                        {product.stock === 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Out of stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Low stock
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRestockDialog(product)}
                        >
                          <Truck className="mr-2 h-4 w-4" />
                          Restock
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inventory Alert Settings</DialogTitle>
            <DialogDescription>
              Configure when and how you want to receive inventory alerts
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="alertEnabled">Enable low stock alerts</Label>
              <Switch
                id="alertEnabled"
                checked={alertSettings.enabled}
                onCheckedChange={(checked) =>
                  setAlertSettings((prev) => ({ ...prev, enabled: checked }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="threshold">Stock threshold</Label>
              <Input
                id="threshold"
                type="number"
                min={1}
                value={alertSettings.threshold}
                onChange={(e) =>
                  setAlertSettings((prev) => ({
                    ...prev,
                    threshold: parseInt(e.target.value) || 10,
                  }))
                }
              />
              <p className="text-sm text-muted-foreground">
                You'll be alerted when stock falls below this number
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotify">Email notifications</Label>
              <Switch
                id="emailNotify"
                checked={alertSettings.notifyByEmail}
                onCheckedChange={(checked) =>
                  setAlertSettings((prev) => ({
                    ...prev,
                    notifyByEmail: checked,
                  }))
                }
              />
            </div>

            {alertSettings.notifyByEmail && (
              <div className="space-y-2">
                <Label htmlFor="emailFrequency">Email frequency</Label>
                <Select
                  value={alertSettings.emailFrequency}
                  onValueChange={(value: 'daily' | 'immediate') =>
                    setAlertSettings((prev) => ({
                      ...prev,
                      emailFrequency: value,
                    }))
                  }
                >
                  <SelectTrigger id="emailFrequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="daily">Daily digest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveAlertSettings}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restock Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restock {selectedProduct?.name}</DialogTitle>
            <DialogDescription>
              Add inventory to your stock
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Current Stock</Label>
                <div className="mt-1 font-medium">
                  {selectedProduct?.stock} {selectedProduct?.unit}
                </div>
              </div>
              <div>
                <Label>Threshold</Label>
                <div className="mt-1 font-medium">
                  {alertSettings.threshold} {selectedProduct?.unit}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="restockAmount">Amount to add</Label>
              <Input
                id="restockAmount"
                type="number"
                min={1}
                value={restockAmount}
                onChange={(e) => setRestockAmount(parseInt(e.target.value) || 1)}
              />
              <p className="text-sm text-muted-foreground">
                New stock level will be {(selectedProduct?.stock || 0) + restockAmount} {selectedProduct?.unit}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedProduct(null)}>
              Cancel
            </Button>
            <Button onClick={handleRestock} disabled={isRestocking}>
              {isRestocking ? 'Processing...' : 'Confirm Restock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorInventoryAlerts; 