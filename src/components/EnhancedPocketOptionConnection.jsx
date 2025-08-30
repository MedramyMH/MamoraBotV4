import React, { useState, useEffect } from 'react';
import { pocketOptionService } from '../data/pocketOptionIntegration';
import { connectionPersistence } from '../data/connectionPersistence';

const EnhancedPocketOptionConnection = ({ onConnectionChange }) => {
  const [credentials, setCredentials] = useState({
    apiKey: 'xKJW4s4TPRnBUM8AGdyFo3B7',
    secretKey: 'Medramy12345*-',
    accountId: '110049797'
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [accountInfo, setAccountInfo] = useState(null);
  const [showCredentials, setShowCredentials] = useState(false);
  const [connectionHistory, setConnectionHistory] = useState([]);
  const [autoReconnect, setAutoReconnect] = useState(true);

  useEffect(() => {
    // Load saved connection state
    const savedConnection = connectionPersistence.loadConnectionState();
    if (savedConnection && savedConnection.isConnected) {
      setConnectionStatus('connected');
      setAccountInfo(savedConnection.accountInfo);
      setCredentials(savedConnection.credentials || credentials);
      onConnectionChange(true, savedConnection.accountInfo);
      addConnectionLog('success', 'Restored previous connection');
    }

    // Load saved credentials if no connection state
    if (!savedConnection) {
      const savedCredentials = localStorage.getItem('pocketOptionCredentials');
      if (savedCredentials) {
        try {
          const parsed = JSON.parse(savedCredentials);
          setCredentials(parsed);
        } catch (e) {
          console.error('Failed to parse saved credentials');
        }
      }
    }

    // Auto-reconnect if enabled and credentials exist
    if (autoReconnect && credentials.apiKey && credentials.secretKey && credentials.accountId) {
      setTimeout(() => {
        if (connectionStatus === 'disconnected') {
          handleConnect();
        }
      }, 1000);
    }
  }, []);

  useEffect(() => {
    // Set up connection persistence listener
    const handleConnectionEvent = (event, data) => {
      if (event === 'connection_cleared') {
        setConnectionStatus('disconnected');
        setAccountInfo(null);
        onConnectionChange(false, null);
        addConnectionLog('info', 'Connection cleared');
      }
    };

    connectionPersistence.addListener(handleConnectionEvent);
    
    return () => {
      connectionPersistence.removeListener(handleConnectionEvent);
    };
  }, [onConnectionChange]);

  const handleConnect = async () => {
    // Use provided credentials by default
    const connectCredentials = {
      apiKey: credentials.apiKey || 'xKJW4s4TPRnBUM8AGdyFo3B7',
      secretKey: credentials.secretKey || 'Medramy12345*-',
      accountId: credentials.accountId || '110049797'
    };

    const validation = pocketOptionService.validateCredentials(connectCredentials);
    if (!validation.valid) {
      addConnectionLog('error', validation.message);
      return;
    }

    setIsConnecting(true);
    addConnectionLog('info', 'Connecting to Pocket Option with provided credentials...');
    
    try {
      const result = await pocketOptionService.connect(connectCredentials);
      if (result.success) {
        setConnectionStatus('connected');
        setAccountInfo(result.accountInfo);
        onConnectionChange(true, result.accountInfo);
        
        // Save connection state for persistence
        connectionPersistence.saveConnectionState({
          isConnected: true,
          accountInfo: result.accountInfo,
          credentials: connectCredentials
        });
        
        // Save credentials securely
        localStorage.setItem('pocketOptionCredentials', JSON.stringify(connectCredentials));
        
        addConnectionLog('success', `Successfully connected! Account: ${result.accountInfo.accountId}`);
        addConnectionLog('success', `Balance: $${result.accountInfo.balance} ${result.accountInfo.currency}`);
      } else {
        addConnectionLog('error', result.message || 'Connection failed');
      }
    } catch (error) {
      addConnectionLog('error', 'Connection failed: ' + error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleQuickConnect = async () => {
    // Use the exact credentials provided by the user
    const quickCredentials = {
      apiKey: 'xKJW4s4TPRnBUM8AGdyFo3B7',
      secretKey: 'Medramy12345*-',
      accountId: '110049797'
    };
    
    setCredentials(quickCredentials);
    
    setIsConnecting(true);
    addConnectionLog('info', 'Quick connecting with your provided credentials...');
    
    try {
      const result = await pocketOptionService.connect(quickCredentials);
      if (result.success) {
        setConnectionStatus('connected');
        setAccountInfo(result.accountInfo);
        onConnectionChange(true, result.accountInfo);
        
        // Save connection state
        connectionPersistence.saveConnectionState({
          isConnected: true,
          accountInfo: result.accountInfo,
          credentials: quickCredentials
        });
        
        localStorage.setItem('pocketOptionCredentials', JSON.stringify(quickCredentials));
        
        addConnectionLog('success', '✅ Connected successfully with your credentials!');
        addConnectionLog('success', `Account ID: ${result.accountInfo.accountId}`);
        addConnectionLog('success', `Balance: $${result.accountInfo.balance}`);
      } else {
        addConnectionLog('error', result.message || 'Connection failed');
      }
    } catch (error) {
      addConnectionLog('error', 'Connection error: ' + error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    pocketOptionService.disconnect();
    setConnectionStatus('disconnected');
    setAccountInfo(null);
    onConnectionChange(false, null);
    
    // Clear connection state
    connectionPersistence.clearConnectionState();
    
    addConnectionLog('info', 'Disconnected from Pocket Option');
  };

  const addConnectionLog = (type, message) => {
    const log = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    setConnectionHistory(prev => [log, ...prev.slice(0, 4)]); // Keep last 5 logs
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'info': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <span className="text-xl">🔗</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Pocket Option Integration</h3>
              <p className="text-blue-100 text-sm">Professional Trading Connection</p>
            </div>
          </div>
          
          <div className={`px-4 py-2 rounded-full text-sm font-bold ${ 
            connectionStatus === 'connected' 
              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            {connectionStatus === 'connected' ? '🟢 LIVE' : '🔴 OFFLINE'}
          </div>
        </div>
      </div>

      <div className="p-6">
        {connectionStatus === 'disconnected' && (
          <div className="space-y-6">
            {/* Your Credentials Quick Connect */}
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-green-400 font-semibold">Your Pocket Option Account</h4>
                  <p className="text-gray-300 text-sm">ID: 110049797 • API Key: xKJW4s4T...</p>
                </div>
                <button
                  onClick={handleQuickConnect}
                  disabled={isConnecting}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:from-gray-600 disabled:to-gray-700"
                >
                  {isConnecting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connecting...
                    </span>
                  ) : (
                    '🚀 Connect Now'
                  )}
                </button>
              </div>
              <p className="text-gray-300 text-sm">
                Click to connect with your provided Pocket Option credentials for live trading
              </p>
            </div>

            {/* Manual Connection Toggle */}
            <div>
              <button
                onClick={() => setShowCredentials(!showCredentials)}
                className="w-full flex items-center justify-between p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-all duration-200"
              >
                <span className="text-white font-semibold">Manual API Connection</span>
                <span className={`transform transition-transform ${showCredentials ? 'rotate-180' : ''}`}>
                  ⬇️
                </span>
              </button>

              {showCredentials && (
                <div className="mt-4 space-y-4 bg-slate-800/50 p-4 rounded-lg border border-slate-600/30">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        API Key *
                      </label>
                      <input
                        type="text"
                        value={credentials.apiKey}
                        onChange={(e) => setCredentials({...credentials, apiKey: e.target.value})}
                        placeholder="Enter your Pocket Option API Key"
                        className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Password *
                      </label>
                      <input
                        type="password"
                        value={credentials.secretKey}
                        onChange={(e) => setCredentials({...credentials, secretKey: e.target.value})}
                        placeholder="Enter your Password"
                        className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Account ID *
                      </label>
                      <input
                        type="text"
                        value={credentials.accountId}
                        onChange={(e) => setCredentials({...credentials, accountId: e.target.value})}
                        placeholder="Enter your Account ID"
                        className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleConnect}
                    disabled={isConnecting || !credentials.apiKey || !credentials.secretKey || !credentials.accountId}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                  >
                    {isConnecting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Establishing Secure Connection...
                      </span>
                    ) : (
                      '🔐 Connect to Pocket Option'
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Auto-reconnect Option */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="autoReconnect"
                checked={autoReconnect}
                onChange={(e) => setAutoReconnect(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="autoReconnect" className="text-gray-300 text-sm">
                Auto-reconnect on page reload
              </label>
            </div>
          </div>
        )}

        {connectionStatus === 'connected' && accountInfo && (
          <div className="space-y-4">
            {/* Account Dashboard */}
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-lg p-4">
              <h4 className="text-green-400 font-bold mb-3 flex items-center">
                <span className="mr-2">💼</span>
                Account Dashboard - Connected!
              </h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">${accountInfo.balance}</div>
                  <div className="text-xs text-gray-400 uppercase">Balance</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{accountInfo.accountType}</div>
                  <div className="text-xs text-gray-400 uppercase">Account</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400">{accountInfo.currency}</div>
                  <div className="text-xs text-gray-400 uppercase">Currency</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">{accountInfo.leverage}</div>
                  <div className="text-xs text-gray-400 uppercase">Leverage</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleDisconnect}
              className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105"
            >
              🔌 Disconnect
            </button>
          </div>
        )}

        {/* Connection Log */}
        {connectionHistory.length > 0 && (
          <div className="mt-6 bg-black/30 rounded-lg p-4 border border-slate-600/30">
            <h4 className="text-gray-300 font-semibold mb-3 flex items-center">
              <span className="mr-2">📋</span>
              Connection Log
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {connectionHistory.map((log) => (
                <div key={log.id} className="flex items-center justify-between text-sm">
                  <span className={getLogColor(log.type)}>{log.message}</span>
                  <span className="text-gray-500 text-xs">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedPocketOptionConnection;
