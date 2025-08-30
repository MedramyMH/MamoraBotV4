// Enhanced Real-time Updates System
class RealTimeUpdateService {
  constructor() {
    this.isActive = false;
    this.intervals = new Map();
    this.listeners = new Map();
    this.updateFrequency = 2000; // 2 seconds
    this.priceData = new Map();
    this.connectionStatus = 'disconnected';
  }

  // Start real-time updates
  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.connectionStatus = 'connected';
    
    // Start price updates
    this.startPriceUpdates();
    
    // Start market analysis updates
    this.startAnalysisUpdates();
    
    // Notify listeners
    this.notifyListeners('service_started', { status: 'connected' });
    
    console.log('Real-time update service started');
  }

  // Stop real-time updates
  stop() {
    if (!this.isActive) return;
    
    this.isActive = false;
    this.connectionStatus = 'disconnected';
    
    // Clear all intervals
    this.intervals.forEach((interval, key) => {
      clearInterval(interval);
    });
    this.intervals.clear();
    
    // Notify listeners
    this.notifyListeners('service_stopped', { status: 'disconnected' });
    
    console.log('Real-time update service stopped');
  }

  // Start price updates for specific symbol
  startPriceUpdates() {
    if (this.intervals.has('prices')) {
      clearInterval(this.intervals.get('prices'));
    }

    const priceInterval = setInterval(() => {
      if (!this.isActive) return;
      
      // Update prices for all active symbols
      this.listeners.forEach((callbacks, symbol) => {
        if (callbacks.has('price_update')) {
          const newPrice = this.generateRealisticPrice(symbol);
          this.priceData.set(symbol, newPrice);
          
          callbacks.get('price_update').forEach(callback => {
            try {
              callback(newPrice);
            } catch (error) {
              console.error('Price update callback error:', error);
            }
          });
        }
      });
    }, this.updateFrequency);

    this.intervals.set('prices', priceInterval);
  }

  // Start market analysis updates
  startAnalysisUpdates() {
    if (this.intervals.has('analysis')) {
      clearInterval(this.intervals.get('analysis'));
    }

    const analysisInterval = setInterval(() => {
      if (!this.isActive) return;
      
      // Update analysis for symbols with active listeners
      this.listeners.forEach((callbacks, symbol) => {
        if (callbacks.has('analysis_update')) {
          const analysisUpdate = this.generateAnalysisUpdate(symbol);
          
          callbacks.get('analysis_update').forEach(callback => {
            try {
              callback(analysisUpdate);
            } catch (error) {
              console.error('Analysis update callback error:', error);
            }
          });
        }
      });
    }, this.updateFrequency * 2); // Analysis updates every 4 seconds

    this.intervals.set('analysis', analysisInterval);
  }

  // Subscribe to updates for a specific symbol
  subscribe(symbol, eventType, callback) {
    if (!this.listeners.has(symbol)) {
      this.listeners.set(symbol, new Map());
    }

    const symbolListeners = this.listeners.get(symbol);
    if (!symbolListeners.has(eventType)) {
      symbolListeners.set(eventType, new Set());
    }

    symbolListeners.get(eventType).add(callback);

    // Start service if not already running
    if (!this.isActive) {
      this.start();
    }

    return () => this.unsubscribe(symbol, eventType, callback);
  }

  // Unsubscribe from updates
  unsubscribe(symbol, eventType, callback) {
    if (!this.listeners.has(symbol)) return;

    const symbolListeners = this.listeners.get(symbol);
    if (!symbolListeners.has(eventType)) return;

    symbolListeners.get(eventType).delete(callback);

    // Clean up empty listeners
    if (symbolListeners.get(eventType).size === 0) {
      symbolListeners.delete(eventType);
    }

    if (symbolListeners.size === 0) {
      this.listeners.delete(symbol);
    }

    // Stop service if no listeners
    if (this.listeners.size === 0) {
      this.stop();
    }
  }

  // Generate realistic price movement
  generateRealisticPrice(symbol) {
    const currentPrice = this.priceData.get(symbol);
    const basePrice = this.getBasePrice(symbol);
    
    // Use current price or base price
    const lastPrice = currentPrice ? currentPrice.price : basePrice;
    
    // Generate realistic price movement (0.01% to 0.1% change)
    const maxChange = lastPrice * 0.001; // 0.1% max change
    const priceChange = (Math.random() - 0.5) * 2 * maxChange;
    const newPrice = lastPrice + priceChange;
    
    // Calculate change percentage
    const changePercent = ((newPrice - basePrice) / basePrice) * 100;
    
    return {
      symbol,
      price: newPrice,
      change: priceChange,
      changePercent,
      timestamp: Date.now(),
      volume: Math.random() * 1000000,
      bid: newPrice - (Math.random() * 0.0001),
      ask: newPrice + (Math.random() * 0.0001)
    };
  }

  // Generate analysis update
  generateAnalysisUpdate(symbol) {
    const priceData = this.priceData.get(symbol);
    
    return {
      symbol,
      timestamp: Date.now(),
      technicalIndicators: {
        rsi: 30 + Math.random() * 40, // RSI between 30-70 for normal conditions
        macd: Math.random() > 0.5 ? 'bullish' : 'bearish',
        movingAverage: Math.random() > 0.5 ? 'above' : 'below',
        support: priceData ? priceData.price * 0.998 : 0,
        resistance: priceData ? priceData.price * 1.002 : 0
      },
      sentiment: this.generateSentiment(),
      volatility: this.generateVolatility(),
      signalStrength: Math.round(Math.random() * 100)
    };
  }

  // Generate market sentiment
  generateSentiment() {
    const sentiments = ['Strong Bearish', 'Bearish', 'Neutral', 'Bullish', 'Strong Bullish'];
    const weights = [0.1, 0.2, 0.4, 0.2, 0.1]; // Normal distribution
    
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < sentiments.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return sentiments[i];
      }
    }
    
    return 'Neutral';
  }

  // Generate volatility level
  generateVolatility() {
    const volatilities = ['Low', 'Medium', 'High'];
    const weights = [0.4, 0.4, 0.2]; // Most markets are low-medium volatility
    
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < volatilities.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return volatilities[i];
      }
    }
    
    return 'Medium';
  }

  // Get base price for symbol
  getBasePrice(symbol) {
    const prices = {
      'EURUSD': 1.08500,
      'GBPUSD': 1.26420,
      'USDJPY': 149.850,
      'BTCUSD': 43850.00,
      'ETHUSD': 2680.50,
      'AAPL': 195.89,
      'GOOGL': 142.56,
      'XAUUSD': 2045.50
    };
    
    return prices[symbol] || 100;
  }

  // Notify all service listeners
  notifyListeners(event, data) {
    // This could be expanded to notify global service listeners
    console.log(`Real-time service event: ${event}`, data);
  }

  // Get current connection status
  getStatus() {
    return {
      isActive: this.isActive,
      connectionStatus: this.connectionStatus,
      activeSymbols: Array.from(this.listeners.keys()),
      updateFrequency: this.updateFrequency
    };
  }

  // Update frequency (in milliseconds)
  setUpdateFrequency(frequency) {
    this.updateFrequency = Math.max(1000, frequency); // Minimum 1 second
    
    if (this.isActive) {
      // Restart with new frequency
      this.stop();
      setTimeout(() => this.start(), 100);
    }
  }
}

export const realTimeUpdateService = new RealTimeUpdateService();