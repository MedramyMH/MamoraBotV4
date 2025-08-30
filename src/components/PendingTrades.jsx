import React, { useState, useEffect } from 'react';

const PendingTrades = ({ symbol, isConnected, onExecuteTrade, currentPrice }) => {
  const [pendingTrades, setPendingTrades] = useState([]);
  const [newTrade, setNewTrade] = useState({
    action: 'BUY',
    amount: 10,
    targetPrice: '',
    timeframe: '1m',
    stopLoss: '',
    takeProfit: '',
    expiryTime: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    // Load pending trades from localStorage
    const saved = localStorage.getItem('pendingTrades');
    if (saved) {
      try {
        const trades = JSON.parse(saved);
        setPendingTrades(trades.filter(trade => trade.status === 'pending'));
      } catch (error) {
        console.error('Failed to load pending trades:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Save pending trades to localStorage
    localStorage.setItem('pendingTrades', JSON.stringify(pendingTrades));
  }, [pendingTrades]);

  useEffect(() => {
    // Check price targets when current price changes
    if (currentPrice) {
      checkPriceTargets(currentPrice.price);
    }
  }, [currentPrice]);

  const addPendingTrade = () => {
    if (!newTrade.targetPrice) {
      alert('Please enter a target price');
      return;
    }

    const trade = {
      id: Date.now(),
      symbol: symbol || 'EURUSD',
      ...newTrade,
      targetPrice: parseFloat(newTrade.targetPrice),
      stopLoss: newTrade.stopLoss ? parseFloat(newTrade.stopLoss) : null,
      takeProfit: newTrade.takeProfit ? parseFloat(newTrade.takeProfit) : null,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiryTime: newTrade.expiryTime || null
    };

    setPendingTrades(prev => [trade, ...prev]);
    setNewTrade({
      action: 'BUY',
      amount: 10,
      targetPrice: '',
      timeframe: '1m',
      stopLoss: '',
      takeProfit: '',
      expiryTime: ''
    });
    setShowAddForm(false);
  };

  const cancelPendingTrade = (tradeId) => {
    setPendingTrades(prev => prev.filter(trade => trade.id !== tradeId));
  };

  const executePendingTrade = (trade) => {
    if (onExecuteTrade) {
      onExecuteTrade({
        symbol: trade.symbol,
        action: trade.action,
        amount: trade.amount,
        timeframe: trade.timeframe
      });
    }

    // Mark trade as executed
    setPendingTrades(prev => 
      prev.map(t => 
        t.id === trade.id 
          ? { ...t, status: 'executed', executedAt: new Date().toISOString() }
          : t
      )
    );
  };

  const checkPriceTargets = (price) => {
    if (!price) return;

    setPendingTrades(prev => 
      prev.map(trade => {
        if (trade.status !== 'pending') return trade;

        // Check if target price is reached
        const targetReached = 
          (trade.action === 'BUY' && price <= trade.targetPrice) ||
          (trade.action === 'SELL' && price >= trade.targetPrice);

        // Check if expired
        const isExpired = trade.expiryTime && new Date() > new Date(trade.expiryTime);

        if (targetReached && !isExpired) {
          // Auto-execute the trade
          setTimeout(() => executePendingTrade(trade), 100);
          return { ...trade, status: 'triggered' };
        }

        if (isExpired) {
          return { ...trade, status: 'expired' };
        }

        return trade;
      })
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-500/10';
      case 'triggered': return 'text-green-400 bg-green-500/10';
      case 'executed': return 'text-blue-400 bg-blue-500/10';
      case 'expired': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <span className="text-xl">⏳</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Pending Trades</h3>
              <p className="text-orange-100 text-sm">Automated Trade Execution</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-orange-100">
              {pendingTrades.filter(t => t.status === 'pending').length} Active
            </span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition-all duration-200"
            >
              {showAddForm ? '✕ Cancel' : '+ Add Trade'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Add New Trade Form */}
        {showAddForm && (
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600/30 space-y-4">
            <h4 className="text-white font-semibold mb-3">Add Pending Trade</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Action</label>
                <select
                  value={newTrade.action}
                  onChange={(e) => setNewTrade({...newTrade, action: e.target.value})}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
                >
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Amount ($)</label>
                <input
                  type="number"
                  min="1"
                  value={newTrade.amount}
                  onChange={(e) => setNewTrade({...newTrade, amount: Number(e.target.value)})}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Target Price *</label>
                <input
                  type="number"
                  step="0.00001"
                  value={newTrade.targetPrice}
                  onChange={(e) => setNewTrade({...newTrade, targetPrice: e.target.value})}
                  placeholder={currentPrice ? currentPrice.price.toFixed(5) : '1.08500'}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Timeframe</label>
                <select
                  value={newTrade.timeframe}
                  onChange={(e) => setNewTrade({...newTrade, timeframe: e.target.value})}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
                >
                  <option value="30s">30 Seconds</option>
                  <option value="1m">1 Minute</option>
                  <option value="2m">2 Minutes</option>
                  <option value="5m">5 Minutes</option>
                  <option value="15m">15 Minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Stop Loss</label>
                <input
                  type="number"
                  step="0.00001"
                  value={newTrade.stopLoss}
                  onChange={(e) => setNewTrade({...newTrade, stopLoss: e.target.value})}
                  placeholder="Optional"
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Take Profit</label>
                <input
                  type="number"
                  step="0.00001"
                  value={newTrade.takeProfit}
                  onChange={(e) => setNewTrade({...newTrade, takeProfit: e.target.value})}
                  placeholder="Optional"
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={addPendingTrade}
                disabled={!newTrade.targetPrice}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200"
              >
                Add Pending Trade
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Current Price Display */}
        {currentPrice && (
          <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-600/20">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Current Price ({symbol}):</span>
              <span className="text-white font-bold text-lg">
                {currentPrice.price.toFixed(5)}
                <span className={`ml-2 text-sm ${currentPrice.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ({currentPrice.change >= 0 ? '+' : ''}{currentPrice.changePercent.toFixed(2)}%)
                </span>
              </span>
            </div>
          </div>
        )}

        {/* Pending Trades List */}
        {pendingTrades.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">⏳</div>
            <h4 className="text-white font-semibold mb-2">No Pending Trades</h4>
            <p className="text-gray-400 text-sm">Add a pending trade to automatically execute when price targets are reached</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingTrades.map((trade) => (
              <div key={trade.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-600/30">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        trade.action === 'BUY' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {trade.action}
                      </span>
                      <span className="text-white font-semibold">{trade.symbol}</span>
                      <span className="text-gray-400">${trade.amount}</span>
                      <span className="text-gray-400">{trade.timeframe}</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(trade.status)}`}>
                        {trade.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">Target: </span>
                        <span className="text-white font-semibold">{trade.targetPrice.toFixed(5)}</span>
                      </div>
                      {trade.stopLoss && (
                        <div>
                          <span className="text-gray-400">Stop Loss: </span>
                          <span className="text-red-400">{trade.stopLoss.toFixed(5)}</span>
                        </div>
                      )}
                      {trade.takeProfit && (
                        <div>
                          <span className="text-gray-400">Take Profit: </span>
                          <span className="text-green-400">{trade.takeProfit.toFixed(5)}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-400">Created: </span>
                        <span className="text-white">{new Date(trade.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    {trade.status === 'pending' && (
                      <>
                        <button
                          onClick={() => executePendingTrade(trade)}
                          disabled={!isConnected}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                          Execute Now
                        </button>
                        <button
                          onClick={() => cancelPendingTrade(trade.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-all duration-200"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Statistics */}
        {pendingTrades.length > 0 && (
          <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-600/20">
            <h4 className="text-white font-semibold mb-3">Trade Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-yellow-400 font-bold text-lg">
                  {pendingTrades.filter(t => t.status === 'pending').length}
                </div>
                <div className="text-gray-400">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-bold text-lg">
                  {pendingTrades.filter(t => t.status === 'executed').length}
                </div>
                <div className="text-gray-400">Executed</div>
              </div>
              <div className="text-center">
                <div className="text-red-400 font-bold text-lg">
                  {pendingTrades.filter(t => t.status === 'expired').length}
                </div>
                <div className="text-gray-400">Expired</div>
              </div>
              <div className="text-center">
                <div className="text-green-400 font-bold text-lg">
                  {pendingTrades.filter(t => t.status === 'triggered').length}
                </div>
                <div className="text-gray-400">Triggered</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingTrades;