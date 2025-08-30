import React, { useState, useEffect } from 'react';
import { pocketOptionService } from '../data/pocketOptionIntegration';
import { mlLearningEngine } from '../data/mlLearningEngine';

const ProfessionalTradingInterface = ({ symbol, strategy, currentPrice, isConnected, accountInfo, onExecuteTrade }) => {
  const [tradeAmount, setTradeAmount] = useState(10);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1m');
  const [isExecuting, setIsExecuting] = useState(false);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [riskManagement, setRiskManagement] = useState({
    maxRiskPercent: 2,
    stopLossEnabled: true,
    takeProfitEnabled: true
  });

  const timeframeOptions = [
    { value: '30s', label: '30 Seconds', payout: 0.85 },
    { value: '1m', label: '1 Minute', payout: 0.87 },
    { value: '2m', label: '2 Minutes', payout: 0.89 },
    { value: '5m', label: '5 Minutes', payout: 0.91 },
    { value: '15m', label: '15 Minutes', payout: 0.93 },
    { value: '30m', label: '30 Minutes', payout: 0.95 },
    { value: '1h', label: '1 Hour', payout: 0.97 }
  ];

  useEffect(() => {
    // Load trade history from localStorage
    const saved = localStorage.getItem('tradeHistory');
    if (saved) {
      try {
        setTradeHistory(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load trade history:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Save trade history to localStorage
    if (tradeHistory.length > 0) {
      localStorage.setItem('tradeHistory', JSON.stringify(tradeHistory));
    }
  }, [tradeHistory]);

  const executeTrade = async (action) => {
    if (!isConnected) {
      alert('⚠️ Please connect to Pocket Option first');
      return;
    }

    if (!symbol || !strategy) {
      alert('⚠️ Please select a symbol and strategy first');
      return;
    }

    // Risk management check
    const maxAllowedAmount = (accountInfo?.balance || 1000) * (riskManagement.maxRiskPercent / 100);
    if (tradeAmount > maxAllowedAmount) {
      alert(`⚠️ Trade amount exceeds risk limit. Maximum allowed: $${maxAllowedAmount.toFixed(2)}`);
      return;
    }

    setIsExecuting(true);
    try {
      const tradeParams = {
        symbol,
        action,
        amount: tradeAmount,
        timeframe: selectedTimeframe,
        strategy: strategy.strategy
      };

      // Use the provided onExecuteTrade callback if available
      let result;
      if (onExecuteTrade) {
        result = await onExecuteTrade(tradeParams);
      } else {
        result = await pocketOptionService.executeTrade(tradeParams);
      }
      
      if (result.success) {
        const newTrade = {
          id: Date.now(),
          ...tradeParams,
          tradeId: result.trade?.tradeId || `trade_${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: 'executed',
          confidence: strategy?.signals?.confidence || 60
        };

        setTradeHistory(prev => [newTrade, ...prev.slice(0, 9)]);
        
        // Record trade outcome for ML learning
        const tradeData = {
          ...tradeParams,
          strategy: strategy,
          marketConditions: {
            volatility: 'Medium', // This would come from real market analysis
            sentiment: 'Neutral'   // This would come from real market analysis
          },
          confidence: strategy?.signals?.confidence || 60,
          result: 'pending' // Will be updated when trade completes
        };

        mlLearningEngine.recordTradeOutcome(tradeData);
        
        // Success notification with details
        const notification = `✅ ${action} Trade Executed!\n` +
          `Symbol: ${symbol}\n` +
          `Amount: $${tradeAmount}\n` +
          `Expiry: ${selectedTimeframe}\n` +
          `Trade ID: ${newTrade.tradeId}`;
        alert(notification);
      } else {
        alert('❌ Trade execution failed: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      alert('❌ Trade execution error: ' + error.message);
    } finally {
      setIsExecuting(false);
    }
  };

  const calculatePotentialReturn = () => {
    const selectedOption = timeframeOptions.find(opt => opt.value === selectedTimeframe);
    const payout = selectedOption?.payout || 0.85;
    return (tradeAmount * payout).toFixed(2);
  };

  const getStrategyRecommendation = () => {
    if (!strategy || !strategy.signals) return null;
    
    const signals = strategy.signals;
    const entryBuy = signals.entryPoints?.buy;
    const entrySell = signals.entryPoints?.sell;
    const price = currentPrice?.price || 0;
    const confidence = signals.confidence || 0;

    // Get ML-enhanced confidence
    const mlConfidence = mlLearningEngine.getStrategyConfidence(strategy.strategy, {
      volatility: 'Medium',
      sentiment: 'Neutral'
    });

    const finalConfidence = Math.round((confidence + mlConfidence) / 2);

    if (finalConfidence < 60) return { action: 'WAIT', reason: 'Low confidence signal', confidence: finalConfidence };
    if (entryBuy && price <= entryBuy * 1.001) return { action: 'BUY', reason: 'Price at optimal buy entry', confidence: finalConfidence };
    if (entrySell && price >= entrySell * 0.999) return { action: 'SELL', reason: 'Price at optimal sell entry', confidence: finalConfidence };
    return { action: 'WAIT', reason: 'Price not at optimal entry points', confidence: finalConfidence };
  };

  const recommendation = getStrategyRecommendation();

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <span className="text-xl">⚡</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Professional Trading Terminal</h3>
              <p className="text-blue-100 text-sm">High-Precision Binary Options Execution</p>
            </div>
          </div>
          
          <div className={`px-4 py-2 rounded-full text-sm font-bold ${
            isConnected ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            {isConnected ? '🟢 LIVE TRADING' : '🔴 DEMO MODE'}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Trading Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Amount & Timeframe */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
                Trade Amount ($)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="10000"
                  step="1"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(Number(e.target.value))}
                  className="w-full p-4 bg-slate-700 border-2 border-slate-600 rounded-lg text-white text-lg font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  USD
                </div>
              </div>
              <div className="flex justify-between text-xs mt-2">
                <span className="text-green-400">Potential Return: ${calculatePotentialReturn()}</span>
                <span className="text-gray-400">
                  Risk: {((tradeAmount / (accountInfo?.balance || 1000)) * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
                Expiry Time
              </label>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="w-full p-4 bg-slate-700 border-2 border-slate-600 rounded-lg text-white text-lg font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {timeframeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label} (Payout: {Math.round(option.payout * 100)}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Risk Management */}
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600/30">
            <h4 className="text-white font-bold mb-3 flex items-center">
              <span className="mr-2">🛡️</span>
              Risk Management
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Max Risk Per Trade (%)</label>
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={riskManagement.maxRiskPercent}
                  onChange={(e) => setRiskManagement({...riskManagement, maxRiskPercent: Number(e.target.value)})}
                  className="w-full"
                />
                <div className="text-center text-white font-bold">{riskManagement.maxRiskPercent}%</div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={riskManagement.stopLossEnabled}
                    onChange={(e) => setRiskManagement({...riskManagement, stopLossEnabled: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-300">Stop Loss</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={riskManagement.takeProfitEnabled}
                    onChange={(e) => setRiskManagement({...riskManagement, takeProfitEnabled: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-300">Take Profit</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendation */}
        {recommendation && (
          <div className={`p-4 rounded-lg border-2 ${
            recommendation.action === 'BUY' ? 'bg-green-500/10 border-green-500/30' :
            recommendation.action === 'SELL' ? 'bg-red-500/10 border-red-500/30' :
            'bg-yellow-500/10 border-yellow-500/30'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-lg font-bold ${
                  recommendation.action === 'BUY' ? 'text-green-400' :
                  recommendation.action === 'SELL' ? 'text-red-400' :
                  'text-yellow-400'
                }`}>
                  🤖 AI RECOMMENDATION: {recommendation.action}
                </div>
                <div className="text-sm text-gray-300 mt-1">{recommendation.reason}</div>
                <div className="text-xs text-gray-400 mt-1">
                  ML-Enhanced Confidence: {Math.round(recommendation.confidence)}/100
                </div>
              </div>
              <div className="text-4xl">
                {recommendation.action === 'BUY' ? '📈' :
                 recommendation.action === 'SELL' ? '📉' : '⏳'}
              </div>
            </div>
          </div>
        )}

        {/* Trading Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => executeTrade('BUY')}
            disabled={!isConnected || isExecuting}
            className="group relative px-8 py-6 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold text-lg rounded-xl hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-2xl"
          >
            {isExecuting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                EXECUTING...
              </span>
            ) : (
              <div>
                <div className="text-2xl mb-1">📈</div>
                <div>BUY ({selectedTimeframe})</div>
              </div>
            )}
          </button>

          <button
            onClick={() => executeTrade('SELL')}
            disabled={!isConnected || isExecuting}
            className="group relative px-8 py-6 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-lg rounded-xl hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-2xl"
          >
            {isExecuting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                EXECUTING...
              </span>
            ) : (
              <div>
                <div className="text-2xl mb-1">📉</div>
                <div>SELL ({selectedTimeframe})</div>
              </div>
            )}
          </button>
        </div>

        {/* Trade History */}
        {tradeHistory.length > 0 && (
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600/30">
            <h4 className="text-white font-bold mb-3 flex items-center">
              <span className="mr-2">📊</span>
              Recent Trades
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {tradeHistory.map((trade, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      trade.action === 'BUY' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {trade.action}
                    </span>
                    <div>
                      <div className="text-white font-semibold">{trade.symbol}</div>
                      <div className="text-xs text-gray-400">${trade.amount} • {trade.timeframe}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${
                      trade.status === 'executed' ? 'text-blue-400' : 'text-gray-400'
                    }`}>
                      {trade.status.toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(trade.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalTradingInterface;