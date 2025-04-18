import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm, Controller } from "react-hook-form";
import { api } from "@/lib/axios";
import { Package, Edit, Trash2, Search, ImagePlus } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  images: { url: string }[];
  averageRating: number;
  totalRatings: number;
}

const VendorProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<FileList | null>(null);
  const { register, handleSubmit, reset, setValue, control } = useForm();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products/vendor/own');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    }
  };

  const handleAddProduct = async (data: any) => {
    try {
      const formData = new FormData();
      
      // Add basic fields
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('price', data.price);
      formData.append('stock', data.stock);
      formData.append('unit', data.unit);

      // Handle multiple images
      if (selectedImages) {
        Array.from(selectedImages).forEach((file) => {
          formData.append('images', file);
        });
      }

      const response = await api.post('/products/vendor/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setProducts(prev => [...prev, response.data.product]);
      setIsAddDialogOpen(false);
      setSelectedImages(null);
      reset();
      toast({
        title: "Success",
        description: "Product added successfully",
      });
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add product",
        variant: "destructive",
      });
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (e.target.files.length > 5) {
        toast({
          title: "Error",
          description: "Maximum 5 images allowed",
          variant: "destructive",
        });
        return;
      }
      setSelectedImages(e.target.files);
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    Object.keys(product).forEach(key => {
      setValue(key, product[key as keyof Product]);
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await api.delete(`/products/vendor/products/${productId}`);
      setProducts(products.filter(p => p._id !== productId));
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const onSubmitEdit = async (data: any) => {
    if (!selectedProduct) return;

    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'images') {
          if (data.images.length > 0) {
            Array.from(data.images).forEach((file: any) => {
              formData.append('images', file);
            });
          }
        } else {
          formData.append(key, data[key]);
        }
      });

      const response = await api.put(`/products/vendor/products/${selectedProduct._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setProducts(products.map(p => p._id === selectedProduct._id ? response.data.product : p));
      setIsEditDialogOpen(false);
      reset();
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Manage Products</h1>
        <p className="text-muted-foreground">
          View and manage your product inventory
        </p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          Add New Product
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map(product => (
          <Card key={product._id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {product.name}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(product)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(product._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>{product.category}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span className="font-bold">₹{product.price}</span>
                </div>
                <div className="flex justify-between">
                  <span>Stock:</span>
                  <span className="font-bold">{product.stock} {product.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rating:</span>
                  <span className="font-bold">{product.averageRating.toFixed(1)} ⭐ ({product.totalRatings})</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Add a new product to your inventory
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleAddProduct)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register('name')} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register('description')} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Controller
                  name="category"
                  control={control}
                  defaultValue=""
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vegetables">Vegetables</SelectItem>
                        <SelectItem value="fruits">Fruits</SelectItem>
                        <SelectItem value="crops">Crops</SelectItem>
                        <SelectItem value="dairy">Dairy</SelectItem>
                        <SelectItem value="groceries">Groceries</SelectItem>
                        <SelectItem value="snacks">Snacks</SelectItem>
                        <SelectItem value="beverages">Beverages</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price</Label>
                <Input type="number" id="price" {...register('price')} required min="0" step="0.01" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Stock</Label>
                <Input type="number" id="stock" {...register('stock')} required min="0" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">Unit</Label>
                <Controller
                  name="unit"
                  control={control}
                  defaultValue=""
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilogram</SelectItem>
                        <SelectItem value="gram">Gram</SelectItem>
                        <SelectItem value="piece">Piece</SelectItem>
                        <SelectItem value="dozen">Dozen</SelectItem>
                        <SelectItem value="liter">Liter</SelectItem>
                        <SelectItem value="packet">Packet</SelectItem>
                        <SelectItem value="box">Box</SelectItem>
                        <SelectItem value="carton">Carton</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="images">Images (Max 5)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    id="images"
                    onChange={handleImageSelect}
                    multiple
                    accept="image/*"
                    className="flex-1"
                  />
                  <div className="flex items-center gap-1">
                    <ImagePlus className="h-4 w-4" />
                    <span>{selectedImages ? selectedImages.length : 0}/5</span>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Add Product</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update your product details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitEdit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register('name')} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register('description')} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select {...register('category')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vegetables">Vegetables</SelectItem>
                    <SelectItem value="fruits">Fruits</SelectItem>
                    <SelectItem value="groceries">Groceries</SelectItem>
                    <SelectItem value="dairy">Dairy</SelectItem>
                    <SelectItem value="snacks">Snacks</SelectItem>
                    <SelectItem value="beverages">Beverages</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price</Label>
                <Input type="number" id="price" {...register('price')} required min="0" step="0.01" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Stock</Label>
                <Input type="number" id="stock" {...register('stock')} required min="0" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">Unit</Label>
                <Select {...register('unit')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilogram</SelectItem>
                    <SelectItem value="gram">Gram</SelectItem>
                    <SelectItem value="piece">Piece</SelectItem>
                    <SelectItem value="dozen">Dozen</SelectItem>
                    <SelectItem value="liter">Liter</SelectItem>
                    <SelectItem value="packet">Packet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="images">New Images (Optional)</Label>
                <Input type="file" id="images" {...register('images')} multiple accept="image/*" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Update Product</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ProtectedVendorProducts = () => {
  return (
    <ProtectedRoute allowedRoles={["vendor"]}>
      <VendorProducts />
    </ProtectedRoute>
  );
};

export default ProtectedVendorProducts; 