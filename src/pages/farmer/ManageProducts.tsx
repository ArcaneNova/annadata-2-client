import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, PencilLine, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import ProductForm from "@/components/products/ProductForm";
import { toast } from "@/hooks/use-toast";
import { Product, productService } from "@/services/product.service";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getUserRole } from "@/utils/auth";

const ManageProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const userRole = getUserRole();

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      let fetchedProducts;
      
      // Use the appropriate method based on user role
      if (userRole === 'farmer') {
        console.log('Fetching farmer-specific products');
        fetchedProducts = await productService.getFarmerOwnProducts();
      } else if (userRole === 'vendor') {
        console.log('Fetching vendor-specific products');
        fetchedProducts = await productService.getProducts();
      } else {
        console.log('Unknown user role:', userRole);
        fetchedProducts = [];
      }
      
      console.log('Fetched products:', fetchedProducts);
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = () => {
    setIsAddingProduct(true);
    setEditingProduct(null);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsAddingProduct(false);
  };

  const handleDeleteProduct = async (productId: string) => {
    setDeletingProduct(productId);
    try {
      await productService.deleteProduct(productId);
      setProducts(prevProducts => prevProducts.filter(product => product._id !== productId));
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
    } finally {
      setDeletingProduct(null);
    }
  };

  const handleFormSuccess = () => {
    setIsAddingProduct(false);
    setEditingProduct(null);
    fetchProducts();
  };

  const getPageTitle = () => {
    return userRole === "vendor" ? "Manage Store Products" : "Manage Farm Products";
  };

  const getPageDescription = () => {
    return userRole === "vendor" 
      ? "Add, update or remove products from your store" 
      : "Add, update or remove your farm products from the marketplace";
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["farmer", "vendor"]}>
      <div className="container mx-auto p-6">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{getPageTitle()}</h1>
            <p className="text-muted-foreground">{getPageDescription()}</p>
          </div>
          <Button 
            onClick={handleAddProduct} 
            className="bg-[#138808] hover:bg-[#138808]/90 self-start"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Product
          </Button>
        </div>

        {isAddingProduct || editingProduct ? (
          <Card>
            <CardHeader>
              <CardTitle>{editingProduct ? "Edit Product" : "Add New Product"}</CardTitle>
              <CardDescription>
                {editingProduct ? "Update your product details" : "Fill in the details for your new product"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductForm
                initialData={editingProduct || undefined}
                onSuccess={handleFormSuccess}
                userRole={userRole}
              />
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="active">
            <TabsList className="mb-6">
              <TabsTrigger value="active">Active Products</TabsTrigger>
              <TabsTrigger value="sold">Sold Products</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {products.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <div className="mb-4 rounded-full bg-yellow-100 p-3">
                      <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    </div>
                    <h3 className="mb-2 text-lg font-medium">No products available</h3>
                    <p className="mb-4 text-center text-muted-foreground">
                      {userRole === "vendor"
                        ? "You haven't added any products to your store yet."
                        : "You haven't added any products to your marketplace yet."
                      }
                    </p>
                    <Button onClick={handleAddProduct}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add your first product
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => (
                    <Card key={product._id} className="overflow-hidden">
                      <div className="aspect-video w-full overflow-hidden">
                        <img
                          src={product.images[0]?.url || "https://via.placeholder.com/400x300"}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          <Badge variant="outline" className={`${
                            product.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {product.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Price</p>
                            <p className="font-medium">₹{product.price}/{product.unit}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Available</p>
                            <p className="font-medium">{product.stock} {product.unit}</p>
                          </div>
                          {product.averageRating && (
                            <div className="col-span-2">
                              <p className="text-muted-foreground">Rating</p>
                              <p className="font-medium">⭐ {product.averageRating.toFixed(1)} ({product.totalRatings} reviews)</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleEditProduct(product)}
                        >
                          <PencilLine className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleDeleteProduct(product._id)}
                          disabled={deletingProduct === product._id}
                        >
                          {deletingProduct === product._id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}
                          Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="sold">
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="mb-4 rounded-full bg-blue-100 p-3">
                    <AlertTriangle className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium">No sold products</h3>
                  <p className="text-center text-muted-foreground">
                    Products that have been sold will appear here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default ManageProducts;
