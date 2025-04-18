
export const cropPrices = [
  { id: 1, name: "Rice", price: 35, unit: "kg", trend: "up", change: "+2.5%" },
  { id: 2, name: "Wheat", price: 28, unit: "kg", trend: "down", change: "-1.2%" },
  { id: 3, name: "Corn", price: 22, unit: "kg", trend: "up", change: "+3.1%" },
  { id: 4, name: "Soybeans", price: 45, unit: "kg", trend: "up", change: "+1.8%" },
  { id: 5, name: "Potatoes", price: 18, unit: "kg", trend: "down", change: "-0.9%" },
];

export const vendors = [
  {
    id: 1,
    name: "Rajesh Trading Co.",
    location: { lat: 28.6139, lng: 77.2090 },
    products: ["Rice", "Wheat"],
    rating: 4.5,
  },
  {
    id: 2,
    name: "Krishna Vegetables",
    location: { lat: 28.6129, lng: 77.2019 },
    products: ["Potatoes", "Onions"],
    rating: 4.8,
  },
];

export const consumers = [
  {
    id: 1,
    name: "Priya Singh",
    location: { lat: 28.6150, lng: 77.2100 },
    preferences: ["Organic", "Local"],
  },
  {
    id: 2,
    name: "Amit Kumar",
    location: { lat: 28.6140, lng: 77.2080 },
    preferences: ["Wholesale", "Bulk"],
  },
];
