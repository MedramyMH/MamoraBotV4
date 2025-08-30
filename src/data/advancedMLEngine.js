// Advanced ML Engine with Enhanced Learning and Risk Management
class AdvancedMLEngine {
  constructor() {
    this.storageKey = 'advanced_ml_data';
    this.experienceData = this.loadExperience();
    this.riskProfile = this.loadRiskProfile();
    this.marketPatterns = new Map();
    this.strategyPerformance = new Map();
    this.realTimeAnalysis = new Map();
  }

  // Load enhanced experience data
  loadExperience() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : {
        totalTrades: 0,
        successfulTrades: 0,
        totalProfit: 0,
        totalLoss: 0,
        winStreaks: [],
        lossStreaks: [],
        strategyPerformance: {},
        timeframeAnalysis: {},
        marketConditionPerformance: {},
        riskMetrics: {
          maxDrawdown: 0,
          sharpeRatio: 0,
          winRate: 0,
          avgWin: 0,
          avgLoss: 0,
          profitFactor: 0
        },
        learningHistory: [],
        adaptiveSettings: {
          confidenceThreshold: 70,
          maxRiskPerTrade: 5,
          adaptiveTimeframes: true,
          marketConditionFiltering: true
        }
      };
    } catch (error) {
      console.error('Failed to load ML experience:', error);
      return this.getDefaultExperience();
    }
  }

  // Load risk profile
  loadRiskProfile() {
    try {
      const saved = localStorage.getItem('ml_risk_profile');
      return saved ? JSON.parse(saved) : {
        riskTolerance: 'medium', // low, medium, high
        maxDrawdownLimit: 20, // percentage
        dailyLossLimit: 100, // dollar amount
        consecutiveLossLimit: 3,
        positionSizing: 'fixed', // fixed, percentage, kelly
        riskRewardRatio: 2.0,
        stopLossEnabled: true,
        takeProfitEnabled: true
      };
    } catch (error) {
      return this.getDefaultRiskProfile();
    }
  }

  // Enhanced trade outcome recording with risk analysis
  recordTradeOutcome(tradeData) {
    const outcome = {
      id: Date.now(),
      symbol: tradeData.symbol,
      action: tradeData.action,
      amount: tradeData.amount,
      strategy: tradeData.strategy,
      timeframe: tradeData.timeframe,
      entryPrice: tradeData.entryPrice || 0,
      exitPrice: tradeData.exitPrice || 0,
      result: tradeData.result, // 'win', 'loss', 'pending'
      profit: tradeData.profit || 0,
      confidence: tradeData.confidence,
      marketConditions: tradeData.marketConditions,
      timestamp: Date.now(),
      duration: tradeData.duration || 0,
      riskScore: this.calculateRiskScore(tradeData),
      marketVolatility: tradeData.marketVolatility || 'medium'
    };

    // Update core metrics
    this.updateCoreMetrics(outcome);
    
    // Update strategy performance
    this.updateStrategyPerformance(outcome);
    
    // Update timeframe analysis
    this.updateTimeframeAnalysis(outcome);
    
    // Update market condition performance
    this.updateMarketConditionPerformance(outcome);
    
    // Update risk metrics
    this.updateRiskMetrics(outcome);
    
    // Learn market patterns
    this.learnMarketPatterns(outcome);
    
    // Adapt settings based on performance
    this.adaptSettings();
    
    // Add to history
    this.experienceData.learningHistory.push(outcome);
    
    // Maintain history size
    if (this.experienceData.learningHistory.length > 2000) {
      this.experienceData.learningHistory = this.experienceData.learningHistory.slice(-2000);
    }
    
    this.saveExperience();
    return outcome;
  }

  // Calculate risk score for trade
  calculateRiskScore(tradeData) {
    let riskScore = 50; // Base risk score
    
    // Adjust for market volatility
    if (tradeData.marketVolatility === 'high') riskScore += 20;
    else if (tradeData.marketVolatility === 'low') riskScore -= 10;
    
    // Adjust for confidence level
    if (tradeData.confidence > 80) riskScore -= 15;
    else if (tradeData.confidence < 60) riskScore += 15;
    
    // Adjust for timeframe
    if (tradeData.timeframe === '30s') riskScore += 25;
    else if (tradeData.timeframe === '5m') riskScore -= 10;
    
    // Adjust for amount relative to balance
    const riskPercentage = (tradeData.amount / 1000) * 100; // Assuming 1000 base
    if (riskPercentage > 10) riskScore += 20;
    else if (riskPercentage < 2) riskScore -= 5;
    
    return Math.max(0, Math.min(100, riskScore));
  }

  // Update core trading metrics
  updateCoreMetrics(outcome) {
    this.experienceData.totalTrades++;
    
    if (outcome.result === 'win') {
      this.experienceData.successfulTrades++;
      this.experienceData.totalProfit += outcome.profit;
    } else if (outcome.result === 'loss') {
      this.experienceData.totalLoss += Math.abs(outcome.profit);
    }
    
    // Update win/loss streaks
    this.updateStreaks(outcome);
  }

  // Update win/loss streaks
  updateStreaks(outcome) {
    const recentTrades = this.experienceData.learningHistory.slice(-10);
    let currentStreak = 1;
    let streakType = outcome.result;
    
    // Calculate current streak
    for (let i = recentTrades.length - 1; i >= 0; i--) {
      if (recentTrades[i].result === streakType) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Update streak records
    if (streakType === 'win') {
      this.experienceData.winStreaks.push(currentStreak);
      if (this.experienceData.winStreaks.length > 50) {
        this.experienceData.winStreaks = this.experienceData.winStreaks.slice(-50);
      }
    } else if (streakType === 'loss') {
      this.experienceData.lossStreaks.push(currentStreak);
      if (this.experienceData.lossStreaks.length > 50) {
        this.experienceData.lossStreaks = this.experienceData.lossStreaks.slice(-50);
      }
    }
  }

  // Update strategy performance with advanced metrics
  updateStrategyPerformance(outcome) {
    const strategyName = outcome.strategy?.name || 'Unknown';
    
    if (!this.experienceData.strategyPerformance[strategyName]) {
      this.experienceData.strategyPerformance[strategyName] = {
        totalTrades: 0,
        wins: 0,
        losses: 0,
        totalProfit: 0,
        totalLoss: 0,
        avgConfidence: 0,
        avgRiskScore: 0,
        bestTimeframe: null,
        worstTimeframe: null,
        marketConditions: {},
        recentPerformance: []
      };
    }
    
    const strategyPerf = this.experienceData.strategyPerformance[strategyName];
    strategyPerf.totalTrades++;
    
    if (outcome.result === 'win') {
      strategyPerf.wins++;
      strategyPerf.totalProfit += outcome.profit;
    } else if (outcome.result === 'loss') {
      strategyPerf.losses++;
      strategyPerf.totalLoss += Math.abs(outcome.profit);
    }
    
    // Update averages
    strategyPerf.avgConfidence = this.calculateMovingAverage(
      strategyPerf.avgConfidence, outcome.confidence, strategyPerf.totalTrades
    );
    
    strategyPerf.avgRiskScore = this.calculateMovingAverage(
      strategyPerf.avgRiskScore, outcome.riskScore, strategyPerf.totalTrades
    );
    
    // Track recent performance (last 20 trades)
    strategyPerf.recentPerformance.push({
      result: outcome.result,
      profit: outcome.profit,
      timestamp: outcome.timestamp
    });
    
    if (strategyPerf.recentPerformance.length > 20) {
      strategyPerf.recentPerformance = strategyPerf.recentPerformance.slice(-20);
    }
  }

  // Learn and adapt from market patterns
  learnMarketPatterns(outcome) {
    const patternKey = `${outcome.symbol}_${outcome.timeframe}_${outcome.marketConditions?.volatility}`;
    
    if (!this.marketPatterns.has(patternKey)) {
      this.marketPatterns.set(patternKey, {
        occurrences: 0,
        winRate: 0,
        avgProfit: 0,
        bestStrategy: null,
        riskLevel: 'medium'
      });
    }
    
    const pattern = this.marketPatterns.get(patternKey);
    pattern.occurrences++;
    
    if (outcome.result === 'win') {
      pattern.winRate = ((pattern.winRate * (pattern.occurrences - 1)) + 100) / pattern.occurrences;
      pattern.avgProfit = ((pattern.avgProfit * (pattern.occurrences - 1)) + outcome.profit) / pattern.occurrences;
    } else {
      pattern.winRate = (pattern.winRate * (pattern.occurrences - 1)) / pattern.occurrences;
    }
    
    // Update best strategy for this pattern
    if (outcome.result === 'win' && (!pattern.bestStrategy || outcome.confidence > 70)) {
      pattern.bestStrategy = outcome.strategy?.name;
    }
  }

  // Adaptive settings adjustment
  adaptSettings() {
    const recentTrades = this.experienceData.learningHistory.slice(-50);
    if (recentTrades.length < 20) return;
    
    const recentWinRate = (recentTrades.filter(t => t.result === 'win').length / recentTrades.length) * 100;
    const recentAvgRisk = recentTrades.reduce((sum, t) => sum + t.riskScore, 0) / recentTrades.length;
    
    // Adjust confidence threshold based on performance
    if (recentWinRate < 50) {
      this.experienceData.adaptiveSettings.confidenceThreshold = Math.min(85, 
        this.experienceData.adaptiveSettings.confidenceThreshold + 2);
    } else if (recentWinRate > 70) {
      this.experienceData.adaptiveSettings.confidenceThreshold = Math.max(60, 
        this.experienceData.adaptiveSettings.confidenceThreshold - 1);
    }
    
    // Adjust max risk per trade
    if (recentAvgRisk > 70) {
      this.experienceData.adaptiveSettings.maxRiskPerTrade = Math.max(2, 
        this.experienceData.adaptiveSettings.maxRiskPerTrade - 0.5);
    } else if (recentAvgRisk < 40 && recentWinRate > 65) {
      this.experienceData.adaptiveSettings.maxRiskPerTrade = Math.min(10, 
        this.experienceData.adaptiveSettings.maxRiskPerTrade + 0.5);
    }
  }

  // Get optimal strategy with advanced selection
  getOptimalStrategy(marketData, availableStrategies, currentBalance) {
    if (!availableStrategies || availableStrategies.length === 0) {
      return null;
    }
    
    // Score each strategy based on multiple factors
    const strategyScores = availableStrategies.map(strategy => {
      let score = 50; // Base score
      
      const strategyPerf = this.experienceData.strategyPerformance[strategy.name];
      
      if (strategyPerf && strategyPerf.totalTrades >= 5) {
        // Historical performance weight (40%)
        const winRate = (strategyPerf.wins / strategyPerf.totalTrades) * 100;
        score += (winRate - 50) * 0.4;
        
        // Recent performance weight (30%)
        const recentWins = strategyPerf.recentPerformance.filter(p => p.result === 'win').length;
        const recentWinRate = (recentWins / strategyPerf.recentPerformance.length) * 100;
        score += (recentWinRate - 50) * 0.3;
        
        // Risk-adjusted performance (20%)
        const avgRisk = strategyPerf.avgRiskScore;
        if (avgRisk < 50) score += 10;
        else if (avgRisk > 70) score -= 15;
        
        // Profit factor (10%)
        if (strategyPerf.totalProfit > strategyPerf.totalLoss) {
          const profitFactor = strategyPerf.totalProfit / Math.max(strategyPerf.totalLoss, 1);
          score += Math.min(10, profitFactor * 2);
        }
      }
      
      // Market condition suitability
      const conditionKey = `${marketData.volatility}_${marketData.sentiment}`;
      if (strategyPerf?.marketConditions?.[conditionKey]) {
        const conditionPerf = strategyPerf.marketConditions[conditionKey];
        if (conditionPerf.total >= 3) {
          const conditionWinRate = (conditionPerf.wins / conditionPerf.total) * 100;
          score += (conditionWinRate - 50) * 0.2;
        }
      }
      
      return { strategy, score };
    });
    
    // Sort by score and return best strategy
    strategyScores.sort((a, b) => b.score - a.score);
    return strategyScores[0].strategy;
  }

  // Get dynamic expiry time recommendation
  getDynamicExpiryTime(symbol, marketConditions, strategy) {
    const volatility = marketConditions.volatility || 'medium';
    const trend = marketConditions.trend || 'neutral';
    
    // Base expiry times by volatility
    let expiryOptions = [];
    
    if (volatility === 'high') {
      expiryOptions = ['30s', '1m'];
    } else if (volatility === 'medium') {
      expiryOptions = ['1m', '2m'];
    } else {
      expiryOptions = ['2m', '5m'];
    }
    
    // Adjust based on trend strength
    if (trend.includes('Strong')) {
      // Strong trends can support longer expiries
      if (!expiryOptions.includes('5m')) {
        expiryOptions.push('5m');
      }
    }
    
    // Check historical performance for this symbol and timeframe
    const symbolPattern = `${symbol}_${volatility}`;
    const bestTimeframe = this.getBestTimeframeForPattern(symbolPattern);
    
    if (bestTimeframe && expiryOptions.includes(bestTimeframe)) {
      return bestTimeframe;
    }
    
    // Return most conservative option
    return expiryOptions[0];
  }

  // Get best timeframe for pattern
  getBestTimeframeForPattern(pattern) {
    const timeframePerf = this.experienceData.timeframeAnalysis;
    let bestTimeframe = null;
    let bestScore = 0;
    
    Object.entries(timeframePerf).forEach(([timeframe, data]) => {
      if (data.patterns && data.patterns[pattern] && data.patterns[pattern].total >= 3) {
        const winRate = (data.patterns[pattern].wins / data.patterns[pattern].total) * 100;
        if (winRate > bestScore) {
          bestScore = winRate;
          bestTimeframe = timeframe;
        }
      }
    });
    
    return bestTimeframe;
  }

  // Calculate moving average
  calculateMovingAverage(currentAvg, newValue, count) {
    return ((currentAvg * (count - 1)) + newValue) / count;
  }

  // Get comprehensive learning insights
  getLearningInsights() {
    const totalTrades = this.experienceData.totalTrades;
    const winRate = totalTrades > 0 ? (this.experienceData.successfulTrades / totalTrades) * 100 : 0;
    const profitFactor = this.experienceData.totalLoss > 0 ? 
      this.experienceData.totalProfit / this.experienceData.totalLoss : 0;
    
    // Find best performing strategy
    let bestStrategy = null;
    let bestStrategyScore = 0;
    
    Object.entries(this.experienceData.strategyPerformance).forEach(([name, perf]) => {
      if (perf.totalTrades >= 5) {
        const strategyWinRate = (perf.wins / perf.totalTrades) * 100;
        const strategyProfitFactor = perf.totalLoss > 0 ? perf.totalProfit / perf.totalLoss : 0;
        const score = strategyWinRate + (strategyProfitFactor * 10);
        
        if (score > bestStrategyScore) {
          bestStrategyScore = score;
          bestStrategy = {
            name,
            winRate: Math.round(strategyWinRate),
            profitFactor: strategyProfitFactor.toFixed(2),
            trades: perf.totalTrades
          };
        }
      }
    });
    
    return {
      totalTrades,
      overallWinRate: Math.round(winRate),
      profitFactor: profitFactor.toFixed(2),
      bestStrategy,
      experienceLevel: this.getExperienceLevel(totalTrades),
      recommendations: this.generateAdvancedRecommendations(),
      riskMetrics: this.calculateRiskMetrics(),
      adaptiveSettings: this.experienceData.adaptiveSettings
    };
  }

  // Generate advanced recommendations
  generateAdvancedRecommendations() {
    const recommendations = [];
    const recentTrades = this.experienceData.learningHistory.slice(-20);
    
    if (this.experienceData.totalTrades < 10) {
      recommendations.push('Build experience with small position sizes');
      recommendations.push('Focus on high-confidence signals (>75%)');
    } else {
      const recentWinRate = recentTrades.filter(t => t.result === 'win').length / recentTrades.length * 100;
      
      if (recentWinRate < 50) {
        recommendations.push('Consider reducing position sizes until performance improves');
        recommendations.push('Focus on market conditions with historically better performance');
      } else if (recentWinRate > 70) {
        recommendations.push('Performance is excellent - consider gradual position size increases');
        recommendations.push('Current strategy selection is working well');
      }
      
      // Risk-based recommendations
      const avgRisk = recentTrades.reduce((sum, t) => sum + t.riskScore, 0) / recentTrades.length;
      if (avgRisk > 70) {
        recommendations.push('Current trades have high risk scores - consider more conservative approach');
      }
    }
    
    return recommendations;
  }

  // Calculate comprehensive risk metrics
  calculateRiskMetrics() {
    const trades = this.experienceData.learningHistory;
    if (trades.length < 5) return null;
    
    const profits = trades.map(t => t.profit || 0);
    const winningTrades = profits.filter(p => p > 0);
    const losingTrades = profits.filter(p => p < 0);
    
    return {
      maxDrawdown: this.calculateMaxDrawdown(profits),
      avgWin: winningTrades.length > 0 ? winningTrades.reduce((a, b) => a + b, 0) / winningTrades.length : 0,
      avgLoss: losingTrades.length > 0 ? Math.abs(losingTrades.reduce((a, b) => a + b, 0) / losingTrades.length) : 0,
      largestWin: Math.max(...profits),
      largestLoss: Math.min(...profits),
      consecutiveWins: Math.max(...this.experienceData.winStreaks, 0),
      consecutiveLosses: Math.max(...this.experienceData.lossStreaks, 0)
    };
  }

  // Calculate maximum drawdown
  calculateMaxDrawdown(profits) {
    let maxDrawdown = 0;
    let peak = 0;
    let currentBalance = 0;
    
    profits.forEach(profit => {
      currentBalance += profit;
      if (currentBalance > peak) {
        peak = currentBalance;
      }
      const drawdown = ((peak - currentBalance) / peak) * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });
    
    return maxDrawdown;
  }

  // Get experience level
  getExperienceLevel(totalTrades) {
    if (totalTrades < 20) return 'Beginner';
    if (totalTrades < 100) return 'Intermediate';
    if (totalTrades < 500) return 'Advanced';
    return 'Expert';
  }

  // Save experience data
  saveExperience() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.experienceData));
      return true;
    } catch (error) {
      console.error('Failed to save ML experience:', error);
      return false;
    }
  }

  // Get default experience structure
  getDefaultExperience() {
    return {
      totalTrades: 0,
      successfulTrades: 0,
      totalProfit: 0,
      totalLoss: 0,
      winStreaks: [],
      lossStreaks: [],
      strategyPerformance: {},
      timeframeAnalysis: {},
      marketConditionPerformance: {},
      riskMetrics: {
        maxDrawdown: 0,
        sharpeRatio: 0,
        winRate: 0,
        avgWin: 0,
        avgLoss: 0,
        profitFactor: 0
      },
      learningHistory: [],
      adaptiveSettings: {
        confidenceThreshold: 70,
        maxRiskPerTrade: 5,
        adaptiveTimeframes: true,
        marketConditionFiltering: true
      }
    };
  }

  // Get default risk profile
  getDefaultRiskProfile() {
    return {
      riskTolerance: 'medium',
      maxDrawdownLimit: 20,
      dailyLossLimit: 100,
      consecutiveLossLimit: 3,
      positionSizing: 'fixed',
      riskRewardRatio: 2.0,
      stopLossEnabled: true,
      takeProfitEnabled: true
    };
  }
}

export const advancedMLEngine = new AdvancedMLEngine();