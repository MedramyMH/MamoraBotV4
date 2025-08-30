// Enhanced ML Learning Engine for Strategy Optimization
class MLLearningEngine {
  constructor() {
    this.storageKey = 'ml_learning_data';
    this.experienceData = this.loadExperience();
    this.strategies = new Map();
    this.signalHistory = [];
    this.performanceMetrics = new Map();
  }

  // Load previous learning experience
  loadExperience() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : {
        totalTrades: 0,
        successfulTrades: 0,
        strategyPerformance: {},
        signalAccuracy: {},
        marketConditions: {},
        learningHistory: []
      };
    } catch (error) {
      console.error('Failed to load ML experience:', error);
      return {
        totalTrades: 0,
        successfulTrades: 0,
        strategyPerformance: {},
        signalAccuracy: {},
        marketConditions: {},
        learningHistory: []
      };
    }
  }

  // Save learning experience
  saveExperience() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.experienceData));
      return true;
    } catch (error) {
      console.error('Failed to save ML experience:', error);
      return false;
    }
  }

  // Record trade outcome for learning
  recordTradeOutcome(tradeData) {
    const outcome = {
      id: Date.now(),
      symbol: tradeData.symbol,
      action: tradeData.action,
      strategy: tradeData.strategy,
      signals: tradeData.signals,
      marketConditions: tradeData.marketConditions,
      result: tradeData.result, // 'win', 'loss', 'pending'
      confidence: tradeData.confidence,
      timestamp: Date.now(),
      timeframe: tradeData.timeframe,
      amount: tradeData.amount
    };

    // Update experience data
    this.experienceData.totalTrades++;
    if (tradeData.result === 'win') {
      this.experienceData.successfulTrades++;
    }

    // Update strategy performance
    const strategyName = tradeData.strategy.name;
    if (!this.experienceData.strategyPerformance[strategyName]) {
      this.experienceData.strategyPerformance[strategyName] = {
        totalTrades: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        avgConfidence: 0,
        marketConditions: {}
      };
    }

    const strategyPerf = this.experienceData.strategyPerformance[strategyName];
    strategyPerf.totalTrades++;
    
    if (tradeData.result === 'win') {
      strategyPerf.wins++;
    } else if (tradeData.result === 'loss') {
      strategyPerf.losses++;
    }

    strategyPerf.winRate = (strategyPerf.wins / strategyPerf.totalTrades) * 100;
    
    // Update signal accuracy
    this.updateSignalAccuracy(tradeData);
    
    // Update market condition analysis
    this.updateMarketConditions(tradeData);
    
    // Add to learning history
    this.experienceData.learningHistory.push(outcome);
    
    // Keep only last 1000 trades to prevent storage bloat
    if (this.experienceData.learningHistory.length > 1000) {
      this.experienceData.learningHistory = this.experienceData.learningHistory.slice(-1000);
    }

    this.saveExperience();
    return outcome;
  }

  // Update signal accuracy tracking
  updateSignalAccuracy(tradeData) {
    const signalKey = `${tradeData.action}_${tradeData.confidence}`;
    
    if (!this.experienceData.signalAccuracy[signalKey]) {
      this.experienceData.signalAccuracy[signalKey] = {
        total: 0,
        correct: 0,
        accuracy: 0
      };
    }

    const signalAcc = this.experienceData.signalAccuracy[signalKey];
    signalAcc.total++;
    
    if (tradeData.result === 'win') {
      signalAcc.correct++;
    }
    
    signalAcc.accuracy = (signalAcc.correct / signalAcc.total) * 100;
  }

  // Update market condition analysis
  updateMarketConditions(tradeData) {
    const conditionKey = `${tradeData.marketConditions.volatility}_${tradeData.marketConditions.sentiment}`;
    
    if (!this.experienceData.marketConditions[conditionKey]) {
      this.experienceData.marketConditions[conditionKey] = {
        total: 0,
        wins: 0,
        winRate: 0,
        bestStrategies: {}
      };
    }

    const condition = this.experienceData.marketConditions[conditionKey];
    condition.total++;
    
    if (tradeData.result === 'win') {
      condition.wins++;
    }
    
    condition.winRate = (condition.wins / condition.total) * 100;
    
    // Track best strategies for this condition
    const strategyName = tradeData.strategy.name;
    if (!condition.bestStrategies[strategyName]) {
      condition.bestStrategies[strategyName] = { wins: 0, total: 0 };
    }
    
    condition.bestStrategies[strategyName].total++;
    if (tradeData.result === 'win') {
      condition.bestStrategies[strategyName].wins++;
    }
  }

  // Get optimal strategy based on current market conditions
  getOptimalStrategy(marketData, availableStrategies) {
    const currentCondition = `${marketData.volatility}_${marketData.sentiment}`;
    const conditionData = this.experienceData.marketConditions[currentCondition];
    
    if (!conditionData || conditionData.total < 5) {
      // Not enough data, use default logic
      return this.getDefaultStrategy(marketData, availableStrategies);
    }

    // Find best performing strategy for current conditions
    let bestStrategy = null;
    let bestWinRate = 0;

    Object.entries(conditionData.bestStrategies).forEach(([strategyName, performance]) => {
      if (performance.total >= 3) { // Minimum trades for consideration
        const winRate = (performance.wins / performance.total) * 100;
        if (winRate > bestWinRate) {
          bestWinRate = winRate;
          bestStrategy = availableStrategies.find(s => s.name === strategyName);
        }
      }
    });

    return bestStrategy || this.getDefaultStrategy(marketData, availableStrategies);
  }

  // Default strategy selection when no learning data available
  getDefaultStrategy(marketData, availableStrategies) {
    // Simple logic based on market conditions
    if (marketData.volatility === 'High') {
      return availableStrategies.find(s => s.name.includes('Scalping')) || availableStrategies[0];
    } else if (marketData.sentiment === 'Strong Bullish' || marketData.sentiment === 'Strong Bearish') {
      return availableStrategies.find(s => s.name.includes('Trend')) || availableStrategies[0];
    } else {
      return availableStrategies.find(s => s.name.includes('Range')) || availableStrategies[0];
    }
  }

  // Get strategy confidence based on historical performance
  getStrategyConfidence(strategy, marketConditions) {
    const strategyPerf = this.experienceData.strategyPerformance[strategy.name];
    
    if (!strategyPerf || strategyPerf.totalTrades < 5) {
      return 60; // Default confidence for new strategies
    }

    let confidence = strategyPerf.winRate;
    
    // Adjust based on recent performance (last 20 trades)
    const recentTrades = this.experienceData.learningHistory
      .filter(trade => trade.strategy.name === strategy.name)
      .slice(-20);
    
    if (recentTrades.length >= 5) {
      const recentWins = recentTrades.filter(trade => trade.result === 'win').length;
      const recentWinRate = (recentWins / recentTrades.length) * 100;
      
      // Weight recent performance more heavily
      confidence = (confidence * 0.6) + (recentWinRate * 0.4);
    }

    // Adjust for market conditions
    const conditionKey = `${marketConditions.volatility}_${marketConditions.sentiment}`;
    const conditionData = this.experienceData.marketConditions[conditionKey];
    
    if (conditionData && conditionData.bestStrategies[strategy.name]) {
      const conditionPerf = conditionData.bestStrategies[strategy.name];
      if (conditionPerf.total >= 3) {
        const conditionWinRate = (conditionPerf.wins / conditionPerf.total) * 100;
        confidence = (confidence * 0.7) + (conditionWinRate * 0.3);
      }
    }

    return Math.max(30, Math.min(95, Math.round(confidence)));
  }

  // Get learning insights
  getLearningInsights() {
    const totalTrades = this.experienceData.totalTrades;
    const overallWinRate = totalTrades > 0 ? (this.experienceData.successfulTrades / totalTrades) * 100 : 0;
    
    // Find best performing strategy
    let bestStrategy = null;
    let bestWinRate = 0;
    
    Object.entries(this.experienceData.strategyPerformance).forEach(([name, perf]) => {
      if (perf.totalTrades >= 5 && perf.winRate > bestWinRate) {
        bestWinRate = perf.winRate;
        bestStrategy = { name, winRate: perf.winRate, trades: perf.totalTrades };
      }
    });

    // Find best market conditions
    let bestCondition = null;
    let bestConditionWinRate = 0;
    
    Object.entries(this.experienceData.marketConditions).forEach(([condition, data]) => {
      if (data.total >= 5 && data.winRate > bestConditionWinRate) {
        bestConditionWinRate = data.winRate;
        bestCondition = { condition, winRate: data.winRate, trades: data.total };
      }
    });

    return {
      totalTrades,
      overallWinRate: Math.round(overallWinRate),
      bestStrategy,
      bestCondition,
      experienceLevel: this.getExperienceLevel(totalTrades),
      recommendations: this.generateRecommendations()
    };
  }

  // Determine experience level
  getExperienceLevel(totalTrades) {
    if (totalTrades < 10) return 'Beginner';
    if (totalTrades < 50) return 'Intermediate';
    if (totalTrades < 200) return 'Advanced';
    return 'Expert';
  }

  // Generate AI recommendations
  generateRecommendations() {
    const recommendations = [];
    
    if (this.experienceData.totalTrades < 10) {
      recommendations.push('Start with small amounts to build experience');
      recommendations.push('Focus on learning market patterns');
    } else {
      const overallWinRate = (this.experienceData.successfulTrades / this.experienceData.totalTrades) * 100;
      
      if (overallWinRate < 60) {
        recommendations.push('Consider adjusting risk management settings');
        recommendations.push('Focus on higher confidence signals only');
      } else if (overallWinRate > 75) {
        recommendations.push('Excellent performance! Consider increasing position sizes');
        recommendations.push('Your strategy selection is working well');
      }
    }

    return recommendations;
  }

  // Clear all learning data (reset)
  clearLearningData() {
    this.experienceData = {
      totalTrades: 0,
      successfulTrades: 0,
      strategyPerformance: {},
      signalAccuracy: {},
      marketConditions: {},
      learningHistory: []
    };
    
    localStorage.removeItem(this.storageKey);
    return true;
  }
}

export const mlLearningEngine = new MLLearningEngine();