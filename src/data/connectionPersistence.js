// Connection persistence and state management
class ConnectionPersistence {
  constructor() {
    this.storageKey = 'tradingDashboard_state';
    this.connectionKey = 'pocketOption_connection';
    this.listeners = new Set();
  }

  // Save connection state
  saveConnectionState(connectionData) {
    try {
      const state = {
        isConnected: connectionData.isConnected,
        accountInfo: connectionData.accountInfo,
        credentials: connectionData.credentials,
        timestamp: Date.now(),
        sessionId: this.generateSessionId()
      };
      
      localStorage.setItem(this.connectionKey, JSON.stringify(state));
      this.notifyListeners('connection_saved', state);
      return true;
    } catch (error) {
      console.error('Failed to save connection state:', error);
      return false;
    }
  }

  // Load connection state
  loadConnectionState() {
    try {
      const saved = localStorage.getItem(this.connectionKey);
      if (!saved) return null;

      const state = JSON.parse(saved);
      
      // Check if connection is still valid (within 24 hours)
      const isValid = Date.now() - state.timestamp < 24 * 60 * 60 * 1000;
      
      if (!isValid) {
        this.clearConnectionState();
        return null;
      }

      return state;
    } catch (error) {
      console.error('Failed to load connection state:', error);
      return null;
    }
  }

  // Clear connection state
  clearConnectionState() {
    localStorage.removeItem(this.connectionKey);
    this.notifyListeners('connection_cleared');
  }

  // Save trading state (positions, analysis, etc.)
  saveTradingState(tradingData) {
    try {
      const state = {
        selectedMarket: tradingData.selectedMarket,
        selectedSymbol: tradingData.selectedSymbol,
        selectedTimeframe: tradingData.selectedTimeframe,
        analysis: tradingData.analysis,
        strategy: tradingData.strategy,
        autoRefresh: tradingData.autoRefresh,
        timestamp: Date.now()
      };

      localStorage.setItem(this.storageKey, JSON.stringify(state));
      return true;
    } catch (error) {
      console.error('Failed to save trading state:', error);
      return false;
    }
  }

  // Load trading state
  loadTradingState() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (!saved) return null;

      const state = JSON.parse(saved);
      
      // Check if state is recent (within 1 hour)
      const isRecent = Date.now() - state.timestamp < 60 * 60 * 1000;
      
      return isRecent ? state : null;
    } catch (error) {
      console.error('Failed to load trading state:', error);
      return null;
    }
  }

  // Generate unique session ID
  generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Add state change listener
  addListener(callback) {
    this.listeners.add(callback);
  }

  // Remove state change listener
  removeListener(callback) {
    this.listeners.delete(callback);
  }

  // Notify all listeners
  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Listener error:', error);
      }
    });
  }

  // Auto-save functionality
  enableAutoSave(getData, interval = 30000) {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    this.autoSaveInterval = setInterval(() => {
      const data = getData();
      if (data) {
        this.saveTradingState(data);
      }
    }, interval);
  }

  // Disable auto-save
  disableAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }
}

export const connectionPersistence = new ConnectionPersistence();