
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

interface Order {
  date: string;
  product: string;
  quantity: number;
  amount: number;
}

interface OrderHistoryProps {
  orders: Order[];
}

const OrderHistory = ({ orders }: OrderHistoryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
        <CardDescription>Recent purchases and spending</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order, index) => (
            <div key={index} className="p-4 rounded-lg border bg-gradient-to-r from-white to-gray-50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{order.product}</h4>
                <span className="text-sm text-gray-500">
                  {new Date(order.date).toLocaleDateString()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Quantity</p>
                  <p className="font-medium">{order.quantity} kg</p>
                </div>
                <div>
                  <p className="text-gray-500">Amount</p>
                  <p className="font-medium">₹{order.amount}</p>
                </div>
              </div>
            </div>
          ))}
          <Button className="w-full" variant="outline">
            <ShoppingCart className="w-4 h-4 mr-2" />
            View All Orders
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderHistory;
