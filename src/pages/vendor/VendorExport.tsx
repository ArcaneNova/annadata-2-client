import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/axios";
import { 
  Download, FileSpreadsheet, FileText, Calendar, BarChart2, 
  FileDown, Database, Filter, ArrowRight, Loader2, Link
} from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const VendorExport = () => {
  const [exportType, setExportType] = useState<string>("orders");
  const [dateRange, setDateRange] = useState<"all" | "custom" | "today" | "week" | "month" | "quarter">("all");
  const [fileFormat, setFileFormat] = useState<"csv" | "excel" | "json">("csv");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        format: fileFormat,
        dateRange,
        ...(startDate && { startDate: format(startDate, 'yyyy-MM-dd') }),
        ...(endDate && { endDate: format(endDate, 'yyyy-MM-dd') }),
        ...filters
      });
      
      // Get the correct endpoint based on export type
      let endpoint = `/export/${exportType}?${queryParams}`;
      
      // Make the API request for the export
      const response = await api.get(endpoint, { responseType: 'blob' });
      
      // Create a filename based on the export type and current date
      const date = format(new Date(), 'yyyy-MM-dd');
      let extension = '';
      switch (fileFormat) {
        case 'csv':
          extension = '.csv';
          break;
        case 'excel':
          extension = '.xlsx';
          break;
        case 'json':
          extension = '.json';
          break;
      }
      
      const filename = `${exportType}_${date}${extension}`;
      
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Export Successful',
        description: `Your ${exportType} data has been exported successfully.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting your data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const getFilterOptions = () => {
    switch (exportType) {
      case 'orders':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Order Status</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="minAmount">Minimum Amount</Label>
              <Select
                value={filters.minAmount || 'all'}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, minAmount: value }))
                }
              >
                <SelectTrigger id="minAmount">
                  <SelectValue placeholder="Select minimum amount" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Amounts</SelectItem>
                  <SelectItem value="100">₹100+</SelectItem>
                  <SelectItem value="500">₹500+</SelectItem>
                  <SelectItem value="1000">₹1,000+</SelectItem>
                  <SelectItem value="5000">₹5,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      case 'inventory':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={filters.category || 'all'}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="fruits">Fruits</SelectItem>
                  <SelectItem value="vegetables">Vegetables</SelectItem>
                  <SelectItem value="grains">Grains</SelectItem>
                  <SelectItem value="dairy">Dairy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="stock">Stock Level</Label>
              <Select
                value={filters.stock || 'all'}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, stock: value }))
                }
              >
                <SelectTrigger id="stock">
                  <SelectValue placeholder="Select stock level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      case 'sales':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="grouped">Grouping</Label>
              <Select
                value={filters.grouped || 'day'}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, grouped: value }))
                }
              >
                <SelectTrigger id="grouped">
                  <SelectValue placeholder="Select grouping" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">By Day</SelectItem>
                  <SelectItem value="week">By Week</SelectItem>
                  <SelectItem value="month">By Month</SelectItem>
                  <SelectItem value="product">By Product</SelectItem>
                  <SelectItem value="category">By Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="metric">Metric</Label>
              <Select
                value={filters.metric || 'revenue'}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, metric: value }))
                }
              >
                <SelectTrigger id="metric">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="units">Units Sold</SelectItem>
                  <SelectItem value="orders">Order Count</SelectItem>
                  <SelectItem value="profit">Profit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Export Data</h1>
          <p className="text-muted-foreground">
            Generate and download reports from your store data
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <RouterLink to="/vendor/dashboard">
            <Button variant="default">
              Dashboard
            </Button>
          </RouterLink>
        </div>
      </div>
      
      <Tabs defaultValue="export" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="export">Export Data</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="export" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
              <CardDescription>
                Configure your export parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="exportType">What would you like to export?</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                  <Card 
                    className={`cursor-pointer hover:border-primary ${exportType === 'orders' ? 'border-2 border-primary' : ''}`}
                    onClick={() => setExportType('orders')}
                  >
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center h-40">
                      <FileText className="h-10 w-10 mb-2 text-blue-500" />
                      <h3 className="font-medium">Orders</h3>
                      <p className="text-xs text-muted-foreground">
                        Order history and details
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className={`cursor-pointer hover:border-primary ${exportType === 'inventory' ? 'border-2 border-primary' : ''}`}
                    onClick={() => setExportType('inventory')}
                  >
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center h-40">
                      <Database className="h-10 w-10 mb-2 text-green-500" />
                      <h3 className="font-medium">Inventory</h3>
                      <p className="text-xs text-muted-foreground">
                        Products and stock levels
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className={`cursor-pointer hover:border-primary ${exportType === 'sales' ? 'border-2 border-primary' : ''}`}
                    onClick={() => setExportType('sales')}
                  >
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center h-40">
                      <BarChart2 className="h-10 w-10 mb-2 text-purple-500" />
                      <h3 className="font-medium">Sales Analytics</h3>
                      <p className="text-xs text-muted-foreground">
                        Sales performance data
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div>
                <Label htmlFor="dateRange">Date Range</Label>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mt-3">
                  <Button
                    variant={dateRange === 'all' ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => setDateRange('all')}
                  >
                    All Time
                  </Button>
                  <Button
                    variant={dateRange === 'today' ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => setDateRange('today')}
                  >
                    Today
                  </Button>
                  <Button
                    variant={dateRange === 'week' ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => setDateRange('week')}
                  >
                    This Week
                  </Button>
                  <Button
                    variant={dateRange === 'month' ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => setDateRange('month')}
                  >
                    This Month
                  </Button>
                  <Button
                    variant={dateRange === 'quarter' ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => setDateRange('quarter')}
                  >
                    This Quarter
                  </Button>
                  <Button
                    variant={dateRange === 'custom' ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => setDateRange('custom')}
                  >
                    Custom
                  </Button>
                </div>
                
                {dateRange === 'custom' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label>Start Date</Label>
                      <DatePicker date={startDate} setDate={setStartDate} />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <DatePicker date={endDate} setDate={setEndDate} />
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="fileFormat">File Format</Label>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <Button
                    variant={fileFormat === 'csv' ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => setFileFormat('csv')}
                  >
                    CSV
                  </Button>
                  <Button
                    variant={fileFormat === 'excel' ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => setFileFormat('excel')}
                  >
                    Excel
                  </Button>
                  <Button
                    variant={fileFormat === 'json' ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => setFileFormat('json')}
                  >
                    JSON
                  </Button>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Additional Filters</Label>
                  <Button variant="ghost" size="sm" onClick={() => setFilters({})}>
                    Reset Filters
                  </Button>
                </div>
                {getFilterOptions()}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={handleExport} 
                disabled={isExporting || (dateRange === 'custom' && (!startDate || !endDate))}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export {exportType}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Export History</CardTitle>
              <CardDescription>
                Recent export operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileDown className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">No recent exports</h3>
                <p className="text-sm text-muted-foreground">
                  Your export history will appear here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="scheduled" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>
                Set up automatic regular exports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">No scheduled reports</h3>
                <p className="text-sm text-muted-foreground">
                  Coming soon! Schedule regular data exports
                </p>
                <Button className="mt-4" disabled>
                  Create Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorExport; 