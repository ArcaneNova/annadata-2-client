
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Heart, Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  inCart: boolean;
}

interface ProductShopProps {
  products: Product[];
  onProductsChange: (products: Product[]) => void;
}

const ProductShop = ({ products, onProductsChange }: ProductShopProps) => {
  const handleQuantityChange = (id: number, increment: boolean) => {
    onProductsChange(products.map(product => {
      if (product.id === id) {
        const newQuantity = increment 
          ? product.quantity + 1 
          : Math.max(0, product.quantity - 1);
        
        return { 
          ...product, 
          quantity: newQuantity,
          inCart: newQuantity > 0
        };
      }
      return product;
    }));
  };

  const handleAddToCart = (id: number) => {
    toast({
      title: "Added to Cart",
      description: "Product has been added to your cart.",
    });
    
    onProductsChange(products.map(product => {
      if (product.id === id) {
        return { ...product, inCart: true, quantity: Math.max(1, product.quantity) };
      }
      return product;
    }));
  };

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Shop Products</CardTitle>
            <CardDescription>Browse and order fresh products</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Heart className="w-4 h-4 mr-2" />
            Favorites
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <div key={product.id} className="p-4 rounded-lg border bg-white hover:shadow-md transition-shadow">
              <h4 className="font-semibold mb-2">{product.name}</h4>
              <p className="text-[#FF9933] font-bold mb-3">₹{product.price}/kg</p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center border rounded-md">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 rounded-r-none"
                    onClick={() => handleQuantityChange(product.id, false)}
                    disabled={product.quantity === 0}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <div className="px-3 py-1">{product.quantity}</div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 rounded-l-none"
                    onClick={() => handleQuantityChange(product.id, true)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <Button 
                className="w-full bg-[#138808] hover:bg-[#138808]/90"
                onClick={() => handleAddToCart(product.id)}
                disabled={product.inCart && product.quantity > 0}
              >
                {product.inCart ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductShop;
