import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfessionalTradingInterface from './ProfessionalTradingInterface';
import PendingTrades from './PendingTrades';
import RealTimePricing from './RealTimePricing';
import MarketSelector from './MarketSelector';
import StrategySelector from './StrategySelector';
import { realTimeUpdateService } from '../data/realTimeUpdates';
import { connectionPersistence } from '../data/connectionPersistence';
import { mlLearningEngine } from '../data/mlLearningEngine';

const LiveTradingPage = () => {
  const navigate = useNavigate();
  const [selectedMarket, setSelectedMarket] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('');
  const [currentPrice, setCurrentPrice] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [accountInfo, setAccountInfo] = useState(null);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [mlInsights, setMlInsights] = useState(null);

  useEffect(() => {
    // Load connection state
    const connectionState = connectionPersistence.loadConnectionState();
    if (connectionState) {
      setIsConnected(connectionState.isConnected);
      setAccountInfo(connectionState.accountInfo);
    }

    // Load trading state
    const tradingState = connectionPersistence.loadTradingState();
    if (tradingState) {
      setSelectedMarket(tradingState.selectedMarket || '');
      setSelectedSymbol(tradingState.selectedSymbol || '');
      setSelectedTimeframe(tradingState.selectedTimeframe || '');
      setSelectedStrategy(tradingState.strategy);
    }

    // Load ML insights
    setMlInsights(mlLearningEngine.getLearningInsights());

    // Start real-time updates
    realTimeUpdateService.start();

    return () => {
      // Clean up
      realTimeUpdateService.stop();
    };
  }, []);

  useEffect(() => {
    // Auto-save trading state
    if (selectedMarket || selectedSymbol || selectedTimeframe) {
      connectionPersistence.saveTradingState({
        selectedMarket,
        selectedSymbol,
        selectedTimeframe,
        strategy: selectedStrategy
      });
    }
  }, [selectedMarket, selectedSymbol, selectedTimeframe, selectedStrategy]);

  const handlePriceUpdate = (priceData) => {
    setCurrentPrice(priceData);
  };

  const handleExecuteTrade = async (tradeParams) => {
    try {
      // Record trade for ML learning
      const tradeData = {
        ...tradeParams,
        strategy: selectedStrategy,
        marketConditions: {
          volatility: 'Medium', // This would come from real analysis
          sentiment: 'Neutral'   // This would come from real analysis
        },
        confidence: selectedStrategy?.signals?.confidence || 60,
        result: 'pending' // Will be updated when trade completes
      };

      // Add to trade history
      const newTrade = {
        id: Date.now(),
        ...tradeData,
        timestamp: new Date().toISOString(),
        status: 'executed'
      };

      setTradeHistory(prev => [newTrade, ...prev.slice(0, 49)]); // Keep last 50 trades

      // Record in ML engine for learning
      mlLearningEngine.recordTradeOutcome(tradeData);

      // Update ML insights
      setMlInsights(mlLearningEngine.getLearningInsights());

      return { success: true, trade: newTrade };
    } catch (error) {
      console.error('Trade execution error:', error);
      return { success: false, message: error.message };
    }
  };

  const handleStrategyChange = (strategy) => {
    setSelectedStrategy(strategy);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition-all duration-200"
            >
              ← Back to Dashboard
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Live Trading Terminal</h1>
              <p className="text-blue-100 text-sm">Professional Real-time Trading Environment</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className={`px-4 py-2 rounded-full text-sm font-bold ${
              isConnected 
                ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}>
              {isConnected ? '🟢 LIVE TRADING' : '🔴 DEMO MODE'}
            </div>

            {/* Account Balance */}
            {accountInfo && (
              <div className="text-white">
                <div className="text-sm text-blue-100">Balance</div>
                <div className="text-lg font-bold">${accountInfo.balance}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Market Selection & Strategy */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <span className="mr-2">📊</span>
              Market Selection
            </h3>
            <MarketSelector
              selectedMarket={selectedMarket}
              selectedSymbol={selectedSymbol}
              selectedTimeframe={selectedTimeframe}
              onMarketChange={setSelectedMarket}
              onSymbolChange={setSelectedSymbol}
              onTimeframeChange={setSelectedTimeframe}
            />
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden">
            <StrategySelector
              marketType={selectedMarket}
              symbol={selectedSymbol}
              timeframe={selectedTimeframe}
              marketData={null}
              onStrategyChange={handleStrategyChange}
            />
          </div>
        </div>

        {/* Real-time Pricing */}
        {selectedSymbol && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden">
            <RealTimePricing 
              symbol={selectedSymbol} 
              onPriceUpdate={handlePriceUpdate}
            />
          </div>
        )}

        {/* ML Learning Insights */}
        {mlInsights && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <span className="mr-2">🧠</span>
              AI Learning Insights
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-slate-800/50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-400">{mlInsights.totalTrades}</div>
                <div className="text-sm text-gray-400">Total Trades</div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-400">{mlInsights.overallWinRate}%</div>
                <div className="text-sm text-gray-400">Win Rate</div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-lg text-center">
                <div className="text-lg font-bold text-purple-400">{mlInsights.experienceLevel}</div>
                <div className="text-sm text-gray-400">Experience</div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-lg text-center">
                <div className="text-lg font-bold text-yellow-400">
                  {mlInsights.bestStrategy ? mlInsights.bestStrategy.name.slice(0, 10) : 'Learning'}
                </div>
                <div className="text-sm text-gray-400">Best Strategy</div>
              </div>
            </div>

            {mlInsights.recommendations.length > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h4 className="text-blue-400 font-semibold mb-2">AI Recommendations:</h4>
                <ul className="space-y-1">
                  {mlInsights.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-gray-300">• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Trading Interface & Pending Trades */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ProfessionalTradingInterface
            symbol={selectedSymbol}
            strategy={selectedStrategy}
            currentPrice={currentPrice}
            isConnected={isConnected}
            accountInfo={accountInfo}
            onExecuteTrade={handleExecuteTrade}
          />

          <PendingTrades
            symbol={selectedSymbol}
            isConnected={isConnected}
            onExecuteTrade={handleExecuteTrade}
            currentPrice={currentPrice}
          />
        </div>

        {/* Trade History */}
        {tradeHistory.length > 0 && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <span className="mr-2">📈</span>
              Recent Trade History
            </h3>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {tradeHistory.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
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
                    <div className="text-blue-400 font-bold">{trade.status.toUpperCase()}</div>
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

export default LiveTradingPage;