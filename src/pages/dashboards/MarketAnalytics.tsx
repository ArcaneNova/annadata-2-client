
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cropPrices } from "@/data/mockData";
import { LineChart, BarChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Brain, TrendingUp, Leaf, ArrowUpRight, ArrowDownRight } from "lucide-react";

const priceHistory = [
  { month: "Jan", rice: 32, wheat: 25, corn: 20, soybeans: 45 },
  { month: "Feb", rice: 35, wheat: 28, corn: 22, soybeans: 47 },
  { month: "Mar", rice: 33, wheat: 27, corn: 21, soybeans: 46 },
  { month: "Apr", rice: 36, wheat: 29, corn: 23, soybeans: 48 },
  { month: "May", rice: 34, wheat: 26, corn: 22, soybeans: 47 },
  { month: "Jun", rice: 37, wheat: 28, corn: 24, soybeans: 49 },
];

const demandData = [
  { crop: "Rice", current: 1200, forecast: 1400 },
  { crop: "Wheat", current: 900, forecast: 1100 },
  { crop: "Corn", current: 700, forecast: 850 },
  { crop: "Soybeans", current: 500, forecast: 600 },
];

const marketShare = [
  { name: "Rice", value: 35 },
  { name: "Wheat", value: 25 },
  { name: "Corn", value: 20 },
  { name: "Soybeans", value: 15 },
  { name: "Others", value: 5 },
];

const seasonalityData = [
  { month: "Jan", yield: 80, rainfall: 45 },
  { month: "Feb", yield: 85, rainfall: 50 },
  { month: "Mar", yield: 90, rainfall: 65 },
  { month: "Apr", yield: 95, rainfall: 75 },
  { month: "May", yield: 100, rainfall: 85 },
  { month: "Jun", yield: 95, rainfall: 80 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const aiInsights = [
  {
    title: "Price Trend Analysis",
    description: "Rice prices show an upward trend with 8% growth expected in the next quarter.",
    icon: TrendingUp,
    trend: "up",
    value: "+8%",
  },
  {
    title: "Demand Forecast",
    description: "Wheat demand is predicted to increase by 15% during the harvest season.",
    icon: Brain,
    trend: "up",
    value: "+15%",
  },
  {
    title: "Crop Recommendation",
    description: "Consider diversifying into organic soybeans due to growing market demand.",
    icon: Leaf,
    trend: "up",
    value: "+12%",
  },
];

const MarketAnalytics = () => {
  return (
    <div className="p-8 bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Market Analytics</h1>
        <span className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</span>
      </div>

      <div className="grid gap-6">
        {/* AI Insights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiInsights.map((insight, index) => (
            <Card key={index} className="bg-gradient-to-br from-white to-gray-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <insight.icon className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                  </div>
                  <span className={`flex items-center ${
                    insight.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {insight.trend === 'up' ? (
                      <ArrowUpRight size={16} />
                    ) : (
                      <ArrowDownRight size={16} />
                    )}
                    {insight.value}
                  </span>
                </div>
                <CardDescription className="mt-2">{insight.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Price History Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Crop Price Trends</CardTitle>
            <CardDescription>Historical price movements of major crops over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={priceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="rice" stroke="#0088FE" strokeWidth={2} />
                <Line type="monotone" dataKey="wheat" stroke="#00C49F" strokeWidth={2} />
                <Line type="monotone" dataKey="corn" stroke="#FFBB28" strokeWidth={2} />
                <Line type="monotone" dataKey="soybeans" stroke="#FF8042" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Demand Forecast Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Demand Forecast</CardTitle>
            <CardDescription>Current demand vs. forecasted demand for major crops</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={demandData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="crop" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="current" name="Current Demand" fill="#0088FE" />
                <Bar dataKey="forecast" name="Forecasted Demand" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Two Charts Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Market Share Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Market Share</CardTitle>
              <CardDescription>Distribution of market share across major crops</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={marketShare}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {marketShare.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Seasonality Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Seasonality & Yield</CardTitle>
              <CardDescription>Correlation between rainfall and crop yield</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={seasonalityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="yield" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="rainfall" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Current Market Prices */}
        <Card>
          <CardHeader>
            <CardTitle>Current Market Prices</CardTitle>
            <CardDescription>Latest prices of major crops in the market</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {cropPrices.map((crop) => (
                <div key={crop.id} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{crop.name}</h3>
                    <span className={`text-xs ${crop.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {crop.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {crop.change}
                    </span>
                  </div>
                  <p className="text-2xl font-bold mt-2">₹{crop.price}/{crop.unit}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarketAnalytics;
