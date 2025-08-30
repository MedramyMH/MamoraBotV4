import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfessionalHeader from './ProfessionalHeader';
import MarketSelector from './MarketSelector';
import MarketAnalysis from './MarketAnalysis';
import TradingSignal from './TradingSignal';
import EnhancedPocketOptionConnection from './EnhancedPocketOptionConnection';
import StrategySelector from './StrategySelector';
import RealTimePricing from './RealTimePricing';
import ProfessionalTradingInterface from './ProfessionalTradingInterface';
import PendingTrades from './PendingTrades';
import { generateMarketData } from '../data/tradingData';
import { enhancedRealTimeService } from '../data/enhancedRealTimeService';
import { enhancedPocketOptionService } from '../data/enhancedPocketOptionService';
import { advancedMLEngine } from '../data/advancedMLEngine';
import { riskManagementSystem } from '../data/riskManagementSystem';
import { connectionPersistence } from '../data/connectionPersistence';

const TradingAssistant = () => {
  const navigate = useNavigate();
  const [selectedMarket, setSelectedMarket] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isConnectedToPO, setIsConnectedToPO] = useState(false);
  const [accountInfo, setAccountInfo] = useState(null);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [marketStatus, setMarketStatus] = useState('open');
  const [realTimeSignal, setRealTimeSignal] = useState(null);
  const [mlInsights, setMlInsights] = useState(null);
  const [riskStatus, setRiskStatus] = useState(null);

  // Load saved state on component mount
  useEffect(() => {
    // Load connection state
    const connectionState = enhancedPocketOptionService.loadConnectionState();
    if (connectionState && connectionState.isConnected) {
      setIsConnectedToPO(true);
      setAccountInfo(connectionState.accountInfo);
    }

    // Load trading state
    const tradingState = connectionPersistence.loadTradingState();
    if (tradingState) {
      setSelectedMarket(tradingState.selectedMarket || '');
      setSelectedSymbol(tradingState.selectedSymbol || '');
      setSelectedTimeframe(tradingState.selectedTimeframe || '');
      setSelectedStrategy(tradingState.strategy);
      setAutoRefresh(tradingState.autoRefresh || false);
      
      if (tradingState.analysis) {
        setAnalysis(tradingState.analysis);
      }
    }

    // Load ML insights
    setMlInsights(advancedMLEngine.getLearningInsights());
    
    // Load risk status
    setRiskStatus(riskManagementSystem.getRiskStatus());

    // Start enhanced real-time service
    enhancedRealTimeService.start();

    return () => {
      connectionPersistence.saveTradingState({
        selectedMarket,
        selectedSymbol,
        selectedTimeframe,
        analysis,
        strategy: selectedStrategy,
        autoRefresh
      });
    };
  }, []);

  // Enhanced auto-refresh with real-time updates
  useEffect(() => {
    let interval;
    if (autoRefresh && analysis && selectedMarket && selectedSymbol && selectedTimeframe) {
      interval = setInterval(() => {
        const marketData = generateMarketData(selectedMarket, selectedSymbol, selectedTimeframe);
        setAnalysis(marketData);
        setLastUpdate(new Date().toLocaleTimeString());
        
        setMlInsights(advancedMLEngine.getLearningInsights());
        
        connectionPersistence.saveTradingState({
          selectedMarket,
          selectedSymbol,
          selectedTimeframe,
          analysis: marketData,
          strategy: selectedStrategy,
          autoRefresh: true
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, analysis, selectedMarket, selectedSymbol, selectedTimeframe, selectedStrategy]);

  // Enhanced real-time price and signal updates
  useEffect(() => {
    if (selectedSymbol) {
      const unsubscribePrice = enhancedRealTimeService.subscribe(
        selectedSymbol, 
        'price_update', 
        handleEnhancedPriceUpdate
      );
      
      const unsubscribeSignal = enhancedRealTimeService.subscribe(
        selectedSymbol, 
        'signal_update', 
        handleSignalUpdate
      );
      
      return () => {
        unsubscribePrice();
        unsubscribeSignal();
      };
    }
  }, [selectedSymbol]);

  useEffect(() => {
    const checkMarketStatus = () => {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay();
      
      const isWeekend = day === 0 || day === 6;
      const isMarketHours = hour >= 6 && hour <= 22;
      
      setMarketStatus(!isWeekend && isMarketHours ? 'open' : 'closed');
    };
    
    checkMarketStatus();
    const interval = setInterval(checkMarketStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleEnhancedPriceUpdate = (priceData) => {
    setCurrentPrice(priceData);
    
    if (analysis) {
      const updatedAnalysis = {
        ...analysis,
        technicalOverview: {
          ...analysis.technicalOverview,
          currentPrice: priceData.price.toFixed(5),
          priceChange: (priceData.change >= 0 ? '+' : '') + priceData.change.toFixed(5),
          priceChangePercent: priceData.changePercent.toFixed(2),
          volatility: priceData.volatility || 'medium',
          trend: priceData.trend || 'sideways'
        },
        marketInfo: {
          ...analysis.marketInfo,
          lastUpdate: new Date(priceData.timestamp).toLocaleTimeString(),
          volume: priceData.volume,
          bid: priceData.bid,
          ask: priceData.ask
        }
      };
      setAnalysis(updatedAnalysis);
    }
  };

  const handleSignalUpdate = (signalData) => {
    setRealTimeSignal(signalData);
    
    if (signalData && analysis) {
      const optimalExpiry = advancedMLEngine.getDynamicExpiryTime(
        selectedSymbol,
        {
          volatility: analysis.marketInfo?.volatility || 'medium',
          trend: signalData.indicators?.movingAverage || 'neutral'
        },
        selectedStrategy
      );
      
      setRealTimeSignal(prev => ({
        ...prev,
        recommendedExpiry: optimalExpiry
      }));
    }
  };

  const analyzeMarket = () => {
    if (!selectedMarket || !selectedSymbol || !selectedTimeframe) {
      alert('Please select market, symbol, and timeframe first.');
      return;
    }

    setIsAnalyzing(true);
    
    setTimeout(() => {
      const marketData = generateMarketData(selectedMarket, selectedSymbol, selectedTimeframe);
      setAnalysis(marketData);
      setIsAnalyzing(false);
      setLastUpdate(new Date().toLocaleTimeString());
      
      connectionPersistence.saveTradingState({
        selectedMarket,
        selectedSymbol,
        selectedTimeframe,
        analysis: marketData,
        strategy: selectedStrategy,
        autoRefresh
      });
    }, 1200);
  };

  const toggleAutoRefresh = () => {
    const newAutoRefresh = !autoRefresh;
    setAutoRefresh(newAutoRefresh);
    
    connectionPersistence.saveTradingState({
      selectedMarket,
      selectedSymbol,
      selectedTimeframe,
      analysis,
      strategy: selectedStrategy,
      autoRefresh: newAutoRefresh
    });
  };

  const handleConnectionChange = (connected, accInfo) => {
    setIsConnectedToPO(connected);
    setAccountInfo(accInfo);
  };

  const handleStrategyChange = (strategy) => {
    setSelectedStrategy(strategy);
    
    connectionPersistence.saveTradingState({
      selectedMarket,
      selectedSymbol,
      selectedTimeframe,
      analysis,
      strategy,
      autoRefresh
    });
  };

  const handleExecuteTrade = async (tradeParams) => {
    try {
      const riskValidation = riskManagementSystem.validateTrade(
        tradeParams, 
        accountInfo?.balance || 1000
      );
      
      if (!riskValidation.allowed) {
        const blockingRisks = riskValidation.risks.filter(r => r.action === 'BLOCK');
        alert('Trade blocked due to risk management:\n' + 
              blockingRisks.map(r => r.message).join('\n'));
        return { success: false, message: 'Trade blocked by risk management' };
      }
      
      const warnings = riskValidation.risks.filter(r => r.action === 'WARN');
      if (warnings.length > 0) {
        const proceed = confirm(
          'Risk warnings detected:\n' + 
          warnings.map(r => r.message).join('\n') + 
          '\n\nRecommended amount: $' + riskValidation.recommendedAmount +
          '\n\nProceed with trade?'
        );
        
        if (!proceed) {
          return { success: false, message: 'Trade cancelled by user' };
        }
        
        tradeParams.amount = riskValidation.recommendedAmount;
      }
      
      const result = await enhancedPocketOptionService.executeTrade(tradeParams);
      
      if (result.success) {
        const tradeData = {
          ...tradeParams,
          strategy: selectedStrategy,
          marketConditions: {
            volatility: analysis?.marketInfo?.volatility || 'Medium',
            sentiment: analysis?.marketInfo?.sentiment || 'Neutral'
          },
          confidence: selectedStrategy?.signals?.confidence || 60,
          result: 'pending',
          riskScore: riskValidation.riskScore,
          marketVolatility: currentPrice?.volatility || 'medium'
        };
        
        advancedMLEngine.recordTradeOutcome(tradeData);
        riskManagementSystem.recordTradeOutcome({ result: 'pending' });
        
        setMlInsights(advancedMLEngine.getLearningInsights());
        setRiskStatus(riskManagementSystem.getRiskStatus());
        
        return result;
      }
      
      return result;
    } catch (error) {
      console.error('Trade execution error:', error);
      return { success: false, message: error.message };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <ProfessionalHeader 
        isConnected={isConnectedToPO}
        accountInfo={accountInfo}
        marketStatus={marketStatus}
      />

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Enhanced Trading Dashboard</h1>
            <p className="text-gray-300">Professional AI-Powered Trading Terminal</p>
          </div>
          <button
            onClick={() => navigate('/live-trading')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-2xl"
          >
            🚀 Open Live Trading Terminal
          </button>
        </div>

        <EnhancedPocketOptionConnection onConnectionChange={handleConnectionChange} />

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700/50 p-6">
          <MarketSelector
            selectedMarket={selectedMarket}
            selectedSymbol={selectedSymbol}
            selectedTimeframe={selectedTimeframe}
            onMarketChange={setSelectedMarket}
            onSymbolChange={setSelectedSymbol}
            onTimeframeChange={setSelectedTimeframe}
          />
        </div>

        {selectedSymbol && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden">
            <RealTimePricing 
              symbol={selectedSymbol} 
              onPriceUpdate={handleEnhancedPriceUpdate}
            />
          </div>
        )}

        {realTimeSignal && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <span className="mr-2">📡</span>
              Live Trading Signal - Auto-Updating Every 2 Seconds
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${realTimeSignal.direction === 'BUY' ? 'text-green-400' : realTimeSignal.direction === 'SELL' ? 'text-red-400' : 'text-yellow-400'}`}>
                  {realTimeSignal.direction}
                </div>
                <div className="text-xs text-gray-400">Direction</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-400">{realTimeSignal.strength}%</div>
                <div className="text-xs text-gray-400">Strength</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-400">{realTimeSignal.confidence}%</div>
                <div className="text-xs text-gray-400">Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-400">{realTimeSignal.recommendedExpiry || '1m'}</div>
                <div className="text-xs text-gray-400">AI Optimal Expiry</div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden">
          <StrategySelector
            marketType={selectedMarket}
            symbol={selectedSymbol}
            timeframe={selectedTimeframe}
            marketData={analysis}
            onStrategyChange={handleStrategyChange}
          />
        </div>

        {mlInsights && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <span className="mr-2">🧠</span>
              AI Learning Insights - Continuously Learning
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
                <div className="text-lg font-bold text-yellow-400">{mlInsights.profitFactor}</div>
                <div className="text-sm text-gray-400">Profit Factor</div>
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

        {riskStatus && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <span className="mr-2">🛡️</span>
              Advanced Risk Management
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Risk Level</div>
                <div className={`text-lg font-bold ${
                  riskStatus.riskLevel === 'HIGH' ? 'text-red-400' : 
                  riskStatus.riskLevel === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {riskStatus.riskLevel}
                </div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Daily P&L</div>
                <div className={`text-lg font-bold ${
                  (riskStatus.dailyStats.totalProfit - riskStatus.dailyStats.totalLoss) >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  ${(riskStatus.dailyStats.totalProfit - riskStatus.dailyStats.totalLoss).toFixed(2)}
                </div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Consecutive Losses</div>
                <div className="text-lg font-bold text-orange-400">{riskStatus.dailyStats.consecutiveLosses}</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <span className="mr-2">🎯</span>
              Analysis Controls
            </h3>
            
            <div className="space-y-4">
              <button
                onClick={analyzeMarket}
                disabled={!selectedMarket || !selectedSymbol || !selectedTimeframe || isAnalyzing}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                {isAnalyzing ? 'ANALYZING...' : '🔍 ANALYZE MARKET'}
              </button>

              {analysis && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={analyzeMarket}
                    disabled={isAnalyzing}
                    className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-600 transition-colors"
                  >
                    🔄 REFRESH
                  </button>
                  
                  <button
                    onClick={toggleAutoRefresh}
                    disabled={isAnalyzing}
                    className={`px-4 py-2 font-semibold rounded-lg transition-colors ${
                      autoRefresh 
                        ? 'bg-red-600 text-white hover:bg-red-700' 
                        : 'bg-orange-600 text-white hover:bg-orange-700'
                    }`}
                  >
                    {autoRefresh ? '⏹️ STOP' : '▶️ LIVE'}
                  </button>
                </div>
              )}

              {lastUpdate && (
                <div className="text-center text-xs text-gray-400 bg-slate-800/50 p-2 rounded">
                  Last Update: {lastUpdate}
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <span className="mr-2">📊</span>
              System Status
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                <span className="text-gray-300">Real-time Data</span>
                <div className={`w-3 h-3 rounded-full ${enhancedRealTimeService.getStatus().isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                <span className="text-gray-300">Live Analysis</span>
                <div className={`w-3 h-3 rounded-full ${autoRefresh ? 'bg-blue-500 animate-pulse' : 'bg-gray-500'}`}></div>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                <span className="text-gray-300">Pocket Option</span>
                <div className={`w-3 h-3 rounded-full ${isConnectedToPO ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                <span className="text-gray-300">Market Status</span>
                <div className={`w-3 h-3 rounded-full ${marketStatus === 'open' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <span className="mr-2">⚡</span>
              Quick Stats
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Selected Asset:</span>
                <span className="text-white font-semibold">{selectedSymbol || 'None'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-300">Current Price:</span>
                <span className="text-green-400 font-semibold">
                  {currentPrice ? currentPrice.price.toFixed(5) : 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-300">AI Strategy:</span>
                <span className="text-blue-400 font-semibold">
                  {selectedStrategy?.strategy?.name || 'None'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-300">Confidence:</span>
                <span className="text-purple-400 font-semibold">
                  {selectedStrategy?.signals?.confidence ? Math.round(selectedStrategy.signals.confidence) + '%' : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {analysis && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden">
              <MarketAnalysis analysis={analysis} />
            </div>
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden">
              <TradingSignal 
                signalData={analysis.signalStrength} 
                recommendation={analysis.recommendation}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ProfessionalTradingInterface
            symbol={selectedSymbol}
            strategy={selectedStrategy}
            currentPrice={currentPrice}
            isConnected={isConnectedToPO}
            accountInfo={accountInfo}
            onExecuteTrade={handleExecuteTrade}
          />

          <PendingTrades
            symbol={selectedSymbol}
            isConnected={isConnectedToPO}
            onExecuteTrade={handleExecuteTrade}
            currentPrice={currentPrice}
          />
        </div>

        {!analysis && !isAnalyzing && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700/50 p-12">
            <div className="text-center">
              <div className="text-6xl mb-6">🚀</div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Enhanced Professional Trading Terminal Ready
              </h3>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Connect to Pocket Option, select your market and asset, then let our advanced AI algorithms with real-time updates, risk management, and machine learning guide your trading decisions.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-slate-700/30 p-6 rounded-xl border border-slate-600/30">
                  <div className="text-3xl mb-3">📊</div>
                  <div className="font-bold text-white mb-2">Real-time Analysis</div>
                  <div className="text-gray-300 text-sm">Live market data with 2-second precision updates</div>
                </div>
                <div className="bg-slate-700/30 p-6 rounded-xl border border-slate-600/30">
                  <div className="text-3xl mb-3">🧠</div>
                  <div className="font-bold text-white mb-2">AI Learning Engine</div>
                  <div className="text-gray-300 text-sm">Machine learning that adapts and improves over time</div>
                </div>
                <div className="bg-slate-700/30 p-6 rounded-xl border border-slate-600/30">
                  <div className="text-3xl mb-3">🛡️</div>
                  <div className="font-bold text-white mb-2">Risk Management</div>
                  <div className="text-gray-300 text-sm">Advanced risk controls and safety measures</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingAssistant;
