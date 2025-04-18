import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import type { Product } from "@/types/product";

interface MarginModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const MarginModal = ({ product, isOpen, onClose, onUpdate }: MarginModalProps) => {
  if (!product) {
    return null;
  }
  
  const [marginPercentage, setMarginPercentage] = useState(product.marginPercentage?.toString() || "0");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products/${product._id}/margin`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ marginPercentage: Number(marginPercentage) })
      });

      if (!response.ok) {
        throw new Error('Failed to update margin');
      }

      toast({
        title: "Success",
        description: "Product margin updated successfully",
      });

      onUpdate();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update margin",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateFinalPrice = () => {
    if (!product) return 0;
    const basePrice = product.basePrice || product.price || 0;
    const margin = Number(marginPercentage) || 0;
    return basePrice * (1 + margin / 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Margin - {product.name}</DialogTitle>
          <DialogDescription>
            Set the margin percentage for this product. This will affect the final selling price.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Base Price</Label>
            <Input
              type="text"
              value={`₹${product.basePrice || product.price}`}
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label>Margin Percentage</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={marginPercentage}
                onChange={(e) => setMarginPercentage(e.target.value)}
                required
              />
              <span className="text-lg">%</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Final Price</Label>
            <Input
              type="text"
              value={`₹${calculateFinalPrice().toFixed(2)}`}
              disabled
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Margin"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MarginModal; 