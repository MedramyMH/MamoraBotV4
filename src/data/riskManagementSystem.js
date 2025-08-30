// Advanced Risk Management System
class RiskManagementSystem {
  constructor() {
    this.storageKey = 'risk_management_settings';
    this.settings = this.loadSettings();
    this.dailyStats = this.loadDailyStats();
    this.alertListeners = new Set();
  }

  // Load risk management settings
  loadSettings() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : this.getDefaultSettings();
    } catch (error) {
      return this.getDefaultSettings();
    }
  }

  // Load daily statistics
  loadDailyStats() {
    try {
      const saved = localStorage.getItem('daily_trading_stats');
      const today = new Date().toDateString();
      
      if (saved) {
        const stats = JSON.parse(saved);
        if (stats.date === today) {
          return stats;
        }
      }
      
      // Return fresh daily stats
      return this.createFreshDailyStats();
    } catch (error) {
      return this.createFreshDailyStats();
    }
  }

  // Create fresh daily stats
  createFreshDailyStats() {
    return {
      date: new Date().toDateString(),
      tradesCount: 0,
      totalRisk: 0,
      totalProfit: 0,
      totalLoss: 0,
      consecutiveLosses: 0,
      maxConsecutiveLosses: 0,
      largestLoss: 0,
      riskEvents: []
    };
  }

  // Validate trade before execution
  validateTrade(tradeParams, accountBalance) {
    const risks = [];
    const { amount, symbol, strategy, confidence } = tradeParams;
    
    // Check daily loss limit
    if (this.settings.dailyLossLimit > 0) {
      const currentDailyLoss = Math.abs(this.dailyStats.totalLoss);
      if (currentDailyLoss >= this.settings.dailyLossLimit) {
        risks.push({
          type: 'DAILY_LOSS_LIMIT',
          severity: 'HIGH',
          message: `Daily loss limit of $${this.settings.dailyLossLimit} reached`,
          action: 'BLOCK'
        });
      } else if (currentDailyLoss + amount > this.settings.dailyLossLimit) {
        risks.push({
          type: 'DAILY_LOSS_WARNING',
          severity: 'MEDIUM',
          message: `Trade may exceed daily loss limit`,
          action: 'WARN'
        });
      }
    }
    
    // Check position sizing
    const positionSizePercent = (amount / accountBalance) * 100;
    if (positionSizePercent > this.settings.maxPositionSize) {
      risks.push({
        type: 'POSITION_SIZE',
        severity: 'HIGH',
        message: `Position size ${positionSizePercent.toFixed(1)}% exceeds limit of ${this.settings.maxPositionSize}%`,
        action: 'REDUCE'
      });
    }
    
    // Check consecutive losses
    if (this.dailyStats.consecutiveLosses >= this.settings.maxConsecutiveLosses) {
      risks.push({
        type: 'CONSECUTIVE_LOSSES',
        severity: 'HIGH',
        message: `${this.dailyStats.consecutiveLosses} consecutive losses reached`,
        action: 'BLOCK'
      });
    }
    
    // Check confidence threshold
    if (confidence < this.settings.minConfidence) {
      risks.push({
        type: 'LOW_CONFIDENCE',
        severity: 'MEDIUM',
        message: `Signal confidence ${confidence}% below minimum ${this.settings.minConfidence}%`,
        action: 'WARN'
      });
    }
    
    return {
      allowed: !risks.some(r => r.action === 'BLOCK'),
      risks,
      recommendedAmount: this.calculateRecommendedAmount(amount, accountBalance, risks),
      riskScore: this.calculateTradeRiskScore(tradeParams, accountBalance, risks)
    };
  }

  // Calculate recommended trade amount
  calculateRecommendedAmount(requestedAmount, accountBalance, risks) {
    let recommendedAmount = requestedAmount;
    
    // Apply position sizing rules
    const maxAmount = (accountBalance * this.settings.maxPositionSize) / 100;
    recommendedAmount = Math.min(recommendedAmount, maxAmount);
    
    // Reduce for high-risk conditions
    const highRisks = risks.filter(r => r.severity === 'HIGH').length;
    const mediumRisks = risks.filter(r => r.severity === 'MEDIUM').length;
    
    if (highRisks > 0) {
      recommendedAmount *= 0.5;
    } else if (mediumRisks > 1) {
      recommendedAmount *= 0.7;
    } else if (mediumRisks > 0) {
      recommendedAmount *= 0.8;
    }
    
    return Math.max(1, Math.round(recommendedAmount));
  }

  // Calculate trade risk score
  calculateTradeRiskScore(tradeParams, accountBalance, risks) {
    let riskScore = 30; // Base risk score
    
    // Add risk for each identified risk
    risks.forEach(risk => {
      if (risk.severity === 'HIGH') riskScore += 25;
      else if (risk.severity === 'MEDIUM') riskScore += 15;
      else riskScore += 5;
    });
    
    // Position size risk
    const positionPercent = (tradeParams.amount / accountBalance) * 100;
    riskScore += positionPercent * 2;
    
    // Confidence adjustment
    if (tradeParams.confidence < 60) riskScore += 20;
    else if (tradeParams.confidence > 80) riskScore -= 10;
    
    return Math.min(100, Math.max(0, riskScore));
  }

  // Record trade outcome for risk tracking
  recordTradeOutcome(tradeResult) {
    this.dailyStats.tradesCount++;
    
    if (tradeResult.result === 'win') {
      this.dailyStats.totalProfit += tradeResult.profit || 0;
      this.dailyStats.consecutiveLosses = 0;
    } else if (tradeResult.result === 'loss') {
      const loss = Math.abs(tradeResult.profit || 0);
      this.dailyStats.totalLoss += loss;
      this.dailyStats.consecutiveLosses++;
      this.dailyStats.maxConsecutiveLosses = Math.max(
        this.dailyStats.maxConsecutiveLosses, 
        this.dailyStats.consecutiveLosses
      );
      this.dailyStats.largestLoss = Math.max(this.dailyStats.largestLoss, loss);
    }
    
    this.saveDailyStats();
  }

  // Get default settings
  getDefaultSettings() {
    return {
      maxPositionSize: 5, // 5% of account per trade
      dailyLossLimit: 100, // $100 daily loss limit
      maxConsecutiveLosses: 3,
      minConfidence: 65, // Minimum 65% confidence
      maxDrawdown: 20, // 20% maximum drawdown
      useKellyCriterion: false,
      riskRewardRatio: 2.0,
      stopLossEnabled: true,
      initialBalance: 1000
    };
  }

  // Save settings
  saveSettings() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
  }

  // Save daily stats
  saveDailyStats() {
    localStorage.setItem('daily_trading_stats', JSON.stringify(this.dailyStats));
  }

  // Update settings
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  // Get risk status
  getRiskStatus() {
    return {
      dailyStats: this.dailyStats,
      settings: this.settings,
      riskLevel: this.calculateOverallRiskLevel()
    };
  }

  // Calculate overall risk level
  calculateOverallRiskLevel() {
    let riskFactors = 0;
    
    if (this.dailyStats.consecutiveLosses >= 2) riskFactors++;
    if (Math.abs(this.dailyStats.totalLoss) > this.settings.dailyLossLimit * 0.7) riskFactors++;
    if (this.dailyStats.tradesCount > 20) riskFactors++; // Overtrading
    
    if (riskFactors >= 2) return 'HIGH';
    if (riskFactors === 1) return 'MEDIUM';
    return 'LOW';
  }
}

export const riskManagementSystem = new RiskManagementSystem();