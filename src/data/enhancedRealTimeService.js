// Enhanced Real-time Service with WebSocket Simulation
class EnhancedRealTimeService {
  constructor() {
    this.isActive = false;
    this.intervals = new Map();
    this.listeners = new Map();
    this.updateFrequency = 2000; // 2 seconds for professional feel
    this.priceData = new Map();
    this.connectionStatus = 'disconnected';
    this.wsSimulation = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Start enhanced real-time updates
  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.connectionStatus = 'connected';
    this.reconnectAttempts = 0;
    
    // Simulate WebSocket connection
    this.simulateWebSocketConnection();
    
    // Start all update services
    this.startPriceUpdates();
    this.startSignalUpdates();
    this.startMarketAnalysis();
    
    console.log('🚀 Enhanced Real-time Service Started');
    this.notifyListeners('service_started', { status: 'connected', timestamp: Date.now() });
  }

  // Simulate WebSocket connection for professional feel
  simulateWebSocketConnection() {
    this.wsSimulation = {
      readyState: 1, // OPEN
      onmessage: null,
      onopen: null,
      onclose: null,
      onerror: null
    };

    // Simulate connection events
    setTimeout(() => {
      if (this.wsSimulation && this.wsSimulation.onopen) {
        this.wsSimulation.onopen({ type: 'open' });
      }
    }, 100);
  }

  // Enhanced price updates with realistic market simulation
  startPriceUpdates() {
    if (this.intervals.has('prices')) {
      clearInterval(this.intervals.get('prices'));
    }

    const priceInterval = setInterval(() => {
      if (!this.isActive) return;
      
      // Update prices for all active symbols
      this.listeners.forEach((callbacks, symbol) => {
        if (callbacks.has('price_update')) {
          const newPrice = this.generateEnhancedPrice(symbol);
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

  // Start real-time signal updates
  startSignalUpdates() {
    if (this.intervals.has('signals')) {
      clearInterval(this.intervals.get('signals'));
    }

    const signalInterval = setInterval(() => {
      if (!this.isActive) return;
      
      this.listeners.forEach((callbacks, symbol) => {
        if (callbacks.has('signal_update')) {
          const signalUpdate = this.generateTradingSignal(symbol);
          
          callbacks.get('signal_update').forEach(callback => {
            try {
              callback(signalUpdate);
            } catch (error) {
              console.error('Signal update callback error:', error);
            }
          });
        }
      });
    }, this.updateFrequency);

    this.intervals.set('signals', signalInterval);
  }

  // Enhanced market analysis updates
  startMarketAnalysis() {
    if (this.intervals.has('analysis')) {
      clearInterval(this.intervals.get('analysis'));
    }

    const analysisInterval = setInterval(() => {
      if (!this.isActive) return;
      
      this.listeners.forEach((callbacks, symbol) => {
        if (callbacks.has('analysis_update')) {
          const analysisUpdate = this.generateMarketAnalysis(symbol);
          
          callbacks.get('analysis_update').forEach(callback => {
            try {
              callback(analysisUpdate);
            } catch (error) {
              console.error('Analysis update callback error:', error);
            }
          });
        }
      });
    }, this.updateFrequency * 3); // Analysis every 6 seconds

    this.intervals.set('analysis', analysisInterval);
  }

  // Generate enhanced realistic price with market microstructure
  generateEnhancedPrice(symbol) {
    const currentPrice = this.priceData.get(symbol);
    const basePrice = this.getBasePrice(symbol);
    
    const lastPrice = currentPrice ? currentPrice.price : basePrice;
    
    // Enhanced price movement with market microstructure
    const volatility = this.getSymbolVolatility(symbol);
    const trend = this.getMarketTrend(symbol);
    const marketNoise = (Math.random() - 0.5) * 2;
    
    // Calculate price change with trend and volatility
    const trendComponent = trend * 0.0001;
    const volatilityComponent = volatility * marketNoise * 0.0005;
    const priceChange = trendComponent + volatilityComponent;
    
    const newPrice = Math.max(0.00001, lastPrice + priceChange);
    const changePercent = ((newPrice - basePrice) / basePrice) * 100;
    
    // Enhanced price data
    return {
      symbol,
      price: parseFloat(newPrice.toFixed(5)),
      change: parseFloat(priceChange.toFixed(5)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      timestamp: Date.now(),
      volume: Math.round(Math.random() * 1000000),
      bid: parseFloat((newPrice - Math.random() * 0.00005).toFixed(5)),
      ask: parseFloat((newPrice + Math.random() * 0.00005).toFixed(5)),
      high24h: parseFloat((basePrice * 1.02).toFixed(5)),
      low24h: parseFloat((basePrice * 0.98).toFixed(5)),
      volatility: volatility,
      trend: trend > 0 ? 'bullish' : trend < 0 ? 'bearish' : 'sideways'
    };
  }

  // Generate real-time trading signals
  generateTradingSignal(symbol) {
    const priceData = this.priceData.get(symbol);
    const rsi = 30 + Math.random() * 40;
    const macd = Math.random() > 0.5 ? 'bullish' : 'bearish';
    const bollinger = Math.random() > 0.5 ? 'oversold' : 'overbought';
    
    // Calculate signal strength based on multiple indicators
    let signalStrength = 50;
    let direction = 'HOLD';
    
    if (rsi < 35 && macd === 'bullish') {
      direction = 'BUY';
      signalStrength = 70 + Math.random() * 20;
    } else if (rsi > 65 && macd === 'bearish') {
      direction = 'SELL';
      signalStrength = 70 + Math.random() * 20;
    } else {
      signalStrength = 40 + Math.random() * 20;
    }
    
    return {
      symbol,
      direction,
      strength: Math.round(signalStrength),
      confidence: Math.round(signalStrength * 0.9),
      indicators: {
        rsi: parseFloat(rsi.toFixed(2)),
        macd,
        bollinger,
        movingAverage: priceData ? (priceData.price > priceData.price * 1.001 ? 'above' : 'below') : 'neutral'
      },
      entryPrice: priceData ? priceData.price : 0,
      timestamp: Date.now()
    };
  }

  // Generate comprehensive market analysis
  generateMarketAnalysis(symbol) {
    const priceData = this.priceData.get(symbol);
    const volatility = this.getSymbolVolatility(symbol);
    const trend = this.getMarketTrend(symbol);
    
    return {
      symbol,
      timestamp: Date.now(),
      marketCondition: this.determineMarketCondition(volatility, trend),
      volatility: volatility > 0.7 ? 'High' : volatility > 0.4 ? 'Medium' : 'Low',
      trend: trend > 0.1 ? 'Strong Bullish' : trend > 0 ? 'Bullish' : trend < -0.1 ? 'Strong Bearish' : trend < 0 ? 'Bearish' : 'Neutral',
      support: priceData ? parseFloat((priceData.price * 0.995).toFixed(5)) : 0,
      resistance: priceData ? parseFloat((priceData.price * 1.005).toFixed(5)) : 0,
      recommendedExpiry: this.calculateOptimalExpiry(volatility, trend),
      riskLevel: volatility > 0.6 ? 'High' : volatility > 0.3 ? 'Medium' : 'Low'
    };
  }

  // Calculate optimal expiry time based on market conditions
  calculateOptimalExpiry(volatility, trend) {
    // High volatility = shorter expiry
    // Strong trend = longer expiry
    
    if (volatility > 0.7) {
      return Math.abs(trend) > 0.1 ? '1m' : '30s';
    } else if (volatility > 0.4) {
      return Math.abs(trend) > 0.1 ? '2m' : '1m';
    } else {
      return Math.abs(trend) > 0.1 ? '5m' : '2m';
    }
  }

  // Get symbol-specific volatility
  getSymbolVolatility(symbol) {
    const volatilities = {
      'EURUSD': 0.3,
      'GBPUSD': 0.4,
      'USDJPY': 0.35,
      'BTCUSD': 0.8,
      'ETHUSD': 0.7,
      'AAPL': 0.5,
      'GOOGL': 0.45,
      'XAUUSD': 0.6
    };
    
    const baseVol = volatilities[symbol] || 0.4;
    return baseVol + (Math.random() - 0.5) * 0.2; // Add some randomness
  }

  // Get market trend
  getMarketTrend(symbol) {
    // Simulate market trend with some persistence
    const trends = {
      'EURUSD': 0.1,
      'GBPUSD': -0.05,
      'USDJPY': 0.15,
      'BTCUSD': 0.2,
      'ETHUSD': 0.1,
      'AAPL': 0.05,
      'GOOGL': 0.08,
      'XAUUSD': -0.1
    };
    
    const baseTrend = trends[symbol] || 0;
    return baseTrend + (Math.random() - 0.5) * 0.1;
  }

  // Determine overall market condition
  determineMarketCondition(volatility, trend) {
    if (volatility > 0.6 && Math.abs(trend) > 0.1) {
      return 'Trending Volatile';
    } else if (volatility > 0.6) {
      return 'Ranging Volatile';
    } else if (Math.abs(trend) > 0.1) {
      return 'Trending Stable';
    } else {
      return 'Ranging Stable';
    }
  }

  // Enhanced subscription with auto-reconnect
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
  }

  // Stop all services
  stop() {
    if (!this.isActive) return;
    
    this.isActive = false;
    this.connectionStatus = 'disconnected';
    
    // Clear all intervals
    this.intervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.intervals.clear();
    
    // Close WebSocket simulation
    if (this.wsSimulation && this.wsSimulation.onclose) {
      this.wsSimulation.onclose({ type: 'close' });
    }
    this.wsSimulation = null;
    
    this.notifyListeners('service_stopped', { status: 'disconnected', timestamp: Date.now() });
    console.log('🛑 Enhanced Real-time Service Stopped');
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

  // Notify listeners
  notifyListeners(event, data) {
    console.log(`📡 Real-time service event: ${event}`, data);
  }

  // Get enhanced status
  getStatus() {
    return {
      isActive: this.isActive,
      connectionStatus: this.connectionStatus,
      activeSymbols: Array.from(this.listeners.keys()),
      updateFrequency: this.updateFrequency,
      reconnectAttempts: this.reconnectAttempts,
      wsConnected: this.wsSimulation !== null
    };
  }

  // Set update frequency
  setUpdateFrequency(frequency) {
    this.updateFrequency = Math.max(1000, frequency);
    
    if (this.isActive) {
      this.stop();
      setTimeout(() => this.start(), 100);
    }
  }
}

export const enhancedRealTimeService = new EnhancedRealTimeService();