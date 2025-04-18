import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Camera, Loader2, Upload } from "lucide-react";
import { Product, ProductFormData, productService } from "@/services/product.service";

interface ProductFormProps {
  initialData?: Product;
  onSuccess: () => void;
  userRole: "farmer" | "vendor";
}

const CATEGORIES = {
  farmer: ['vegetables', 'fruits', 'crops', 'dairy', 'other'],
  vendor: ['vegetables', 'fruits', 'crops', 'dairy', 'groceries', 'snacks', 'beverages', 'other']
};

const UNITS = {
  common: ['kg', 'gram', 'piece', 'dozen', 'liter'],
  vendor: ['packet', 'box', 'carton']
};

const ProductForm = ({ initialData, onSuccess, userRole }: ProductFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    category: initialData?.category || (userRole === "vendor" ? "groceries" : "vegetables"),
    price: initialData?.price || 0,
    stock: initialData?.stock || 0,
    unit: initialData?.unit || "kg",
    // Vendor specific fields
    ...(userRole === "vendor" && {
      brand: initialData?.brand || "",
      manufacturer: initialData?.manufacturer || "",
      expiryDate: initialData?.expiryDate || "",
      batchNumber: initialData?.batchNumber || "",
    }),
  });

  const [selectedImages, setSelectedImages] = useState<FileList | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedImages(e.target.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submitData = {
        ...formData,
        images: selectedImages,
      };

      if (initialData?._id) {
        await productService.updateProduct(initialData._id, submitData);
      } else {
        await productService.createProduct(submitData);
      }
      onSuccess();
    } catch (error) {
      // Error is already handled by the service
    } finally {
      setIsLoading(false);
    }
  };

  const availableCategories = CATEGORIES[userRole];
  const availableUnits = [...UNITS.common, ...(userRole === "vendor" ? UNITS.vendor : [])];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter product name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter product description"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleSelectChange("category", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {availableCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">Unit</Label>
          <Select
            value={formData.unit}
            onValueChange={(value) => handleSelectChange("unit", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {availableUnits.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (₹)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            min="0"
            value={formData.stock}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {userRole === "vendor" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="brand">Brand Name</Label>
            <Input
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="Enter brand name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manufacturer">Manufacturer</Label>
            <Input
              id="manufacturer"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
              placeholder="Enter manufacturer name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input
              id="expiryDate"
              name="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="batchNumber">Batch Number</Label>
            <Input
              id="batchNumber"
              name="batchNumber"
              value={formData.batchNumber}
              onChange={handleChange}
              placeholder="Enter batch number"
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="images">Product Images</Label>
        <Input
          id="images"
          name="images"
          type="file"
          accept="image/*"
          multiple
          max={5}
          onChange={handleImageChange}
          className="cursor-pointer"
        />
        <p className="text-sm text-muted-foreground">
          You can upload up to 5 images. Supported formats: JPG, PNG
        </p>
      </div>

      <Button
        type="submit"
        className="w-full bg-[#138808] hover:bg-[#138808]/90"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : initialData ? (
          "Update Product"
        ) : (
          "Add Product"
        )}
      </Button>
    </form>
  );
};

export default ProductForm;
