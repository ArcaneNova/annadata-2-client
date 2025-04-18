import io, { Socket } from 'socket.io-client';
import { toast } from '@/components/ui/use-toast';
import { Vendor } from '@/types/vendor';
import { Product } from '@/types/product';
import { useAuth } from '@/hooks/use-auth';

interface VendorLocation {
  vendorId: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
    address?: string;
  };
}

interface ConsumerLocation {
  consumerId: string;
  location: [number, number];
}

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private locationWatchId: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private lastKnownLocation: { lat: number; lng: number; radius?: number } | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isReconnecting = false;
  private vendorUpdateCallbacks: ((vendors: Vendor[]) => void)[] = [];
  private locationUpdateTimeout: NodeJS.Timeout | null = null;
  private connectionPromise: Promise<Socket | null> | null = null;
  private initialized = false;
  private isAuthenticated = false;

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  initialize(): Promise<Socket | null> {
    if (this.initialized && this.socket?.connected && this.isAuthenticated) {
      console.log('Socket already initialized, connected and authenticated');
      return Promise.resolve(this.socket);
    }

    console.log('Initializing socket service...');
    this.initialized = true;
    return this.connect();
  }

  connect(): Promise<Socket | null> {
    // If already connected and authenticated, return the socket
    if (this.socket?.connected && this.isAuthenticated) {
      console.log('Socket already connected and authenticated, reusing connection');
      return Promise.resolve(this.socket);
    }

    // If connection is in progress, return the existing promise
    if (this.connectionPromise) {
      console.log('Connection already in progress, waiting...');
      return this.connectionPromise;
    }

    // Reset reconnection attempts
    this.reconnectAttempts = 0;

    // Create new connection promise
    console.log('Creating new socket connection...');
    this.connectionPromise = new Promise((resolve) => {
      try {
        const auth = useAuth.getState();
        const token = auth.token;
        const userRole = auth.user?.role;

        // Get the base URL by removing '/api' from VITE_API_URL
        const baseURL = import.meta.env.VITE_API_URL.replace('/api', '');
        console.log('Initializing socket connection at:', baseURL);
        
      if (this.socket) {
          console.log('Cleaning up existing socket instance');
          this.cleanup();
      }

        // Configure socket options based on authentication status
      const socketOptions: any = {
          transports: ['websocket'],
        path: '/socket.io',
          autoConnect: false,
          reconnection: false, // We'll handle reconnection manually
        };

        // Add authentication if token exists
      if (token) {
          console.log('Connecting with authentication, user role:', userRole);
        socketOptions.auth = { token };
          socketOptions.query = { role: userRole };
        } else {
          console.log('Connecting without authentication (public access)');
        }

        this.socket = io(baseURL, socketOptions);

        // Set up connection listeners
        this.socket.on('connect', () => {
          console.log('Socket connected successfully with ID:', this.socket?.id);
          this.isAuthenticated = !!token; // Only mark as authenticated if token exists
          this.connectionPromise = null;
          this.setupSocketListeners();
          resolve(this.socket);
        });

        this.socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          
          // For public access, don't treat connection errors as fatal
          if (!token) {
            console.log('Public access connection error, continuing with limited functionality');
            this.connectionPromise = null;
            resolve(null);
          } else {
            this.handleConnectionError(error);
            resolve(null);
          }
        });

        // Manually connect after setting up listeners
        console.log('Attempting to connect socket...');
        this.socket.connect();

      } catch (error) {
        console.error('Socket connection error:', error);
        this.handleConnectionError(error);
        resolve(null);
      }
    });

    return this.connectionPromise;
  }

  private handleConnectionError(error: any) {
    console.error('Connection error:', error);
    this.isAuthenticated = false;
    this.connectionPromise = null;

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
      }
      
      this.reconnectTimer = setTimeout(() => {
        this.connect();
      }, 1000 * this.reconnectAttempts); // Exponential backoff
    } else {
      console.log('Max reconnection attempts reached, cleaning up');
      this.cleanup();
      toast({
        title: "Connection Error",
        description: "Failed to connect to real-time updates. Please refresh the page.",
        variant: "destructive",
      });
    }
  }

  private cleanup() {
    console.log('Cleaning up socket service...');
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.connectionPromise = null;
    this.stopLocationWatch();
    if (this.locationUpdateTimeout) {
      clearTimeout(this.locationUpdateTimeout);
      this.locationUpdateTimeout = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.lastKnownLocation = null;
    this.vendorUpdateCallbacks = [];
    this.reconnectAttempts = 0;
    this.isReconnecting = false;
    this.isAuthenticated = false;
    this.initialized = false;
  }

  private setupSocketListeners() {
    if (!this.socket) {
      console.error('Cannot setup listeners: Socket is null');
      return;
    }
    
    this.socket.removeAllListeners();

    this.socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${reason}`);
      this.isAuthenticated = false;
      
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        // The disconnection was initiated by the server or client, so don't reconnect
        console.log('Disconnection was initiated, not attempting to reconnect');
      } else {
        // Attempt to reconnect if this wasn't a deliberate disconnection
        this.handleConnectionError(reason);
      }
    });

    // Handle vendor location events
    this.socket.on('vendor:location:update', (data) => {
      console.log('Vendor location update:', data);
    });

    // Handle all types of vendor updates - very important for compatibility!
    this.socket.on('nearby:vendors', (vendors) => {
      console.log('Received nearby vendors:', vendors);
      if (Array.isArray(vendors)) {
        console.log(`Processing ${vendors.length} vendors from nearby:vendors event`);
        this.vendorUpdateCallbacks.forEach(callback => callback(vendors));
      } else {
        console.error('Invalid vendors data format:', vendors);
      }
    });

    this.socket.on('nearby:vendors:update', (vendors) => {
      console.log('Received nearby vendors update:', vendors);
      if (Array.isArray(vendors)) {
        console.log(`Processing ${vendors.length} vendors from nearby:vendors:update event`);
        this.vendorUpdateCallbacks.forEach(callback => callback(vendors));
      } else {
        console.error('Invalid vendors update format:', vendors);
      }
    });

    // This is the most common response format
    this.socket.on('get:nearby:vendors:response', (vendors) => {
      console.log('Received get:nearby:vendors:response:', vendors);
      if (Array.isArray(vendors)) {
        console.log(`Processing ${vendors.length} vendors from get:nearby:vendors:response event`);
        this.vendorUpdateCallbacks.forEach(callback => callback(vendors));
      } else {
        console.error('Invalid vendors response format:', vendors);
      }
    });

    this.socket.on('connect', () => {
      console.log('Socket connected successfully with ID:', this.socket?.id);
      this.isAuthenticated = true;
      this.reconnectAttempts = 0;
      
      // If we have a last known location, request vendors again after reconnecting
      if (this.lastKnownLocation) {
        console.log('Requesting vendors with last known location after reconnect');
        this.requestNearbyVendors(this.lastKnownLocation);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.handleConnectionError(error);
    });
  }

  async requestNearbyVendors(location: { lat: number; lng: number; radius?: number }) {
    if (!this.socket?.connected) {
      console.log('Socket not connected, attempting to connect before requesting vendors');
      await this.connect();
    }

    if (!this.socket?.connected) {
      console.error('Failed to connect socket, cannot request nearby vendors');
      return;
    }

    try {
      // Save the location for possible reconnection use
      this.lastKnownLocation = location;
      
      // Try both event names and formats to ensure compatibility with backend
      console.log('Requesting nearby vendors with location:', location);
      
      // Format for find:nearby:vendors (GeoJSON format)
      const geoJsonPoint = {
        location: {
          type: 'Point',
          coordinates: [location.lng, location.lat]
        },
        radius: location.radius || 5000
      };
      
      // Format for get:nearby:vendors (simple format)
      const simpleFormat = {
        lat: location.lat,
        lng: location.lng,
        radius: location.radius || 5000
      };
      
      // Send both formats to ensure compatibility
      this.socket.emit('find:nearby:vendors', geoJsonPoint);
      console.log('Emitted find:nearby:vendors with data:', geoJsonPoint);
      
      this.socket.emit('get:nearby:vendors', simpleFormat);
      console.log('Emitted get:nearby:vendors with data:', simpleFormat);
      
    } catch (error) {
      console.error('Error requesting nearby vendors:', error);
    }
  }

  onNearbyVendorsUpdate(callback: (vendors: Vendor[]) => void) {
    // Store the callback
    this.vendorUpdateCallbacks.push(callback);

    // Return a cleanup function
    return () => {
      this.vendorUpdateCallbacks = this.vendorUpdateCallbacks.filter(cb => cb !== callback);
    };
  }

  disconnect() {
    console.log('Disconnecting socket service...');
    this.cleanup();
    this.initialized = false;
  }

  isConnected(): boolean {
    return !!this.socket?.connected;
  }

  startVendorLocationBroadcast() {
    if (!this.socket?.connected) {
      this.connect();
    }

    if (this.locationWatchId !== null) {
      return;
    }

    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return;
    }

    this.locationWatchId = navigator.geolocation.watchPosition(
      (position) => {
        if (this.socket?.connected) {
          this.socket.emit('vendor:location:update', {
            coordinates: [position.coords.longitude, position.coords.latitude]
          });
        }
      },
      (error) => {
        console.error('Location watch error:', error);
        toast({
          title: "Location Error",
          description: "Failed to update your location",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  async updateConsumerLocation(location: { lat: number; lng: number; radius?: number }) {
    const auth = useAuth.getState();
    if (auth.user?.role !== 'consumer') {
      console.log('User is not a consumer, skipping consumer location update');
      return;
    }

    if (this.locationUpdateTimeout) {
      clearTimeout(this.locationUpdateTimeout);
    }

    this.locationUpdateTimeout = setTimeout(async () => {
      if (!this.socket?.connected) {
        const socket = await this.initialize();
        if (!socket) {
          console.log('Failed to establish socket connection for consumer location update');
          return;
        }
      }

      console.log('Updating consumer location:', location);
      
      // Format data according to what the server expects
      const data = {
        lat: location.lat,
        lng: location.lng,
        role: 'consumer' // Explicitly include role
      };

      console.log('Emitting consumer:location:update with data:', data);
      this.socket?.emit('consumer:location:update', data);
    }, 500);
  }

  stopLocationWatch() {
    if (this.locationWatchId !== null) {
      navigator.geolocation.clearWatch(this.locationWatchId);
      this.locationWatchId = null;
    }
  }

  // Order events
  onNewOrder(callback: (order: any) => void) {
    console.log('Registering for new order notifications');
    this.initialize().then(() => {
      if (this.socket) {
        // Remove any existing listeners to prevent duplicates
        this.socket.off('order:new');
        
        // Register new listener
        this.socket.on('order:new', (orderData) => {
          console.log('New order notification received:', orderData);
          
          // Show a browser notification if possible
          this.showOrderNotification(orderData);
          
          // Call the callback with the order data
          callback(orderData);
        });
        
        console.log('New order notification listener registered');
      }
    }).catch(error => {
      console.error('Failed to register for order notifications:', error);
    });
    
    return () => {
      if (this.socket) {
        this.socket.off('order:new');
      }
    };
  }
  
  // Show browser notification for new orders
  private showOrderNotification(order: any) {
    try {
      // Check if browser supports notifications
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          const notification = new Notification('New Order Received!', {
            body: `Order #${order.orderNumber || 'New'} - ₹${order.totalAmount || 0} from ${order.customerName || 'Customer'}`,
            icon: '/notification-icon.png'
          });
          
          // Close the notification after 5 seconds
          setTimeout(() => notification.close(), 5000);
          
          // Add click handler to open order details
          notification.onclick = () => {
            window.focus();
            // Navigate to order details if applicable
          };
        } else if (Notification.permission !== 'denied') {
          // Request permission if not denied
          Notification.requestPermission();
        }
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  // Emit order events
  emitOrderEvent(event: string, data: any) {
    if (!this.socket?.connected) {
      this.connect();
    }
    this.socket?.emit(event, data);
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  // This handles safe emitting with error checking
  emit(event: string, data: any) {
    try {
      if (!this.socket) {
        console.warn('Socket.io instance not available for emit. Event not sent:', event);
        return;
      }
      
      if (!this.socket.connected) {
        console.warn('Socket.io not connected. Attempting to reconnect before emitting:', event);
        this.connect()
          .then(socket => {
            if (socket) {
              console.log(`Socket reconnected, emitting delayed event: ${event}`);
              socket.emit(event, data);
            }
          })
          .catch(error => {
            console.error('Failed to reconnect socket before emitting:', error);
          });
        return;
      }
      
      console.log(`Emitting socket event: ${event}`, data);
      this.socket.emit(event, data);
    } catch (error) {
      console.error(`Error emitting socket event ${event}:`, error);
    }
  }
}

export const socketService = SocketService.getInstance();