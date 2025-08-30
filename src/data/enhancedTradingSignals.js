// Enhanced trading signals with dynamic recommendations and timing

export class EnhancedTradingSignals {
  constructor() {
    this.signalHistory = [];
    this.lastSignalTime = null;
    this.signalUpdateInterval = 30000; // 30 seconds
    this.subscribers = [];
  }

  // Generate dynamic trading signals based on market conditions
  generateLiveSignal(marketData, currentPrice, strategy) {
    const now = Date.now();
    const price = currentPrice?.price || parseFloat(marketData.technicalOverview.currentPrice);
    
    // Technical indicators analysis
    const rsi = this.calculateRSI(price);
    const macdSignal = this.calculateMACDSignal(price);
    const bollinger = this.calculateBollingerBands(price);
    const volumeAnalysis = this.analyzeVolume();
    const trendStrength = this.calculateTrendStrength(price);
    
    // Market sentiment analysis
    const marketSentiment = this.analyzeMarketSentiment(marketData);
    const volatility = this.calculateVolatility(price);
    const momentum = this.calculateMomentum(price);
    
    // Generate signal based on multiple factors
    const signal = this.calculateSignalStrength({
      rsi,
      macd: macdSignal,
      bollinger,
      volume: volumeAnalysis,
      trend: trendStrength,
      sentiment: marketSentiment,
      volatility,
      momentum,
      strategy: strategy?.strategy
    });

    // Determine action and timing
    const recommendation = this.generateRecommendation(signal, price, strategy);
    
    // Add to history
    this.signalHistory.push({
      timestamp: now,
      signal,
      recommendation,
      price,
      confidence: signal.confidence
    });

    // Keep only last 50 signals
    if (this.signalHistory.length > 50) {
      this.signalHistory = this.signalHistory.slice(-50);
    }

    this.lastSignalTime = now;
    return { signal, recommendation };
  }

  calculateRSI(price, period = 14) {
    // Simulate RSI calculation with realistic values
    const baseRSI = 50;
    const priceMovement = (price % 1000) / 1000;
    const timeVariation = (Date.now() % 60000) / 60000;
    
    let rsi = baseRSI + (priceMovement - 0.5) * 40 + Math.sin(timeVariation * Math.PI * 2) * 15;
    rsi = Math.max(0, Math.min(100, rsi));
    
    return {
      value: rsi,
      signal: rsi > 70 ? 'SELL' : rsi < 30 ? 'BUY' : 'NEUTRAL',
      strength: rsi > 80 || rsi < 20 ? 'STRONG' : rsi > 70 || rsi < 30 ? 'MODERATE' : 'WEAK'
    };
  }

  calculateMACDSignal(price) {
    const timeComponent = (Date.now() % 120000) / 120000;
    const priceComponent = (price % 100) / 100;
    
    const macd = Math.sin(timeComponent * Math.PI * 2) * 0.5 + (priceComponent - 0.5) * 0.3;
    const signal = Math.sin((timeComponent - 0.1) * Math.PI * 2) * 0.4;
    const histogram = macd - signal;
    
    return {
      macd: macd.toFixed(4),
      signal: signal.toFixed(4),
      histogram: histogram.toFixed(4),
      crossover: histogram > 0 ? (histogram > 0.1 ? 'STRONG_BULLISH' : 'BULLISH') : 
                 histogram < -0.1 ? 'STRONG_BEARISH' : 'BEARISH',
      action: histogram > 0.05 ? 'BUY' : histogram < -0.05 ? 'SELL' : 'WAIT'
    };
  }

  calculateBollingerBands(price) {
    const volatility = 0.002 + (Math.random() * 0.001);
    const middle = price;
    const upper = price * (1 + volatility * 2);
    const lower = price * (1 - volatility * 2);
    
    const position = (price - lower) / (upper - lower);
    
    return {
      upper: upper.toFixed(5),
      middle: middle.toFixed(5),
      lower: lower.toFixed(5),
      position: position.toFixed(3),
      signal: position > 0.8 ? 'SELL' : position < 0.2 ? 'BUY' : 'NEUTRAL',
      squeeze: volatility < 0.0015 ? 'YES' : 'NO'
    };
  }

  analyzeVolume() {
    const baseVolume = 1000000;
    const timeVariation = Math.sin((Date.now() % 300000) / 300000 * Math.PI * 2);
    const volume = baseVolume * (1 + timeVariation * 0.3 + Math.random() * 0.2);
    
    return {
      current: Math.round(volume),
      average: baseVolume,
      ratio: (volume / baseVolume).toFixed(2),
      trend: volume > baseVolume * 1.2 ? 'HIGH' : volume < baseVolume * 0.8 ? 'LOW' : 'NORMAL'
    };
  }

  calculateTrendStrength(price) {
    const priceHistory = this.generatePriceHistory(price, 20);
    let upMoves = 0;
    let downMoves = 0;
    
    for (let i = 1; i < priceHistory.length; i++) {
      if (priceHistory[i] > priceHistory[i-1]) upMoves++;
      else if (priceHistory[i] < priceHistory[i-1]) downMoves++;
    }
    
    const trendStrength = Math.abs(upMoves - downMoves) / (priceHistory.length - 1);
    const direction = upMoves > downMoves ? 'UP' : downMoves > upMoves ? 'DOWN' : 'SIDEWAYS';
    
    return {
      strength: trendStrength.toFixed(2),
      direction,
      confidence: trendStrength > 0.6 ? 'HIGH' : trendStrength > 0.3 ? 'MEDIUM' : 'LOW'
    };
  }

  analyzeMarketSentiment(marketData) {
    const sentiment = marketData.marketInfo.sentiment;
    const volatility = marketData.marketInfo.volatility;
    
    let score = 50; // Neutral
    
    if (sentiment === 'Bullish') score += 20;
    else if (sentiment === 'Bearish') score -= 20;
    
    if (volatility === 'High') score += Math.random() > 0.5 ? 15 : -15;
    else if (volatility === 'Low') score += Math.random() > 0.5 ? 5 : -5;
    
    // Add time-based market sentiment
    const hour = new Date().getHours();
    if (hour >= 8 && hour <= 16) score += 5; // Market hours boost
    if (hour >= 20 || hour <= 6) score -= 5; // After hours penalty
    
    return {
      score: Math.max(0, Math.min(100, score)),
      sentiment: score > 60 ? 'BULLISH' : score < 40 ? 'BEARISH' : 'NEUTRAL',
      strength: Math.abs(score - 50) > 20 ? 'STRONG' : Math.abs(score - 50) > 10 ? 'MODERATE' : 'WEAK'
    };
  }

  calculateVolatility(price) {
    const priceHistory = this.generatePriceHistory(price, 10);
    const returns = [];
    
    for (let i = 1; i < priceHistory.length; i++) {
      returns.push((priceHistory[i] - priceHistory[i-1]) / priceHistory[i-1]);
    }
    
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance) * Math.sqrt(252); // Annualized
    
    return {
      value: (volatility * 100).toFixed(2),
      level: volatility > 0.3 ? 'HIGH' : volatility > 0.15 ? 'MEDIUM' : 'LOW',
      trend: 'INCREASING' // Simplified
    };
  }

  calculateMomentum(price) {
    const priceHistory = this.generatePriceHistory(price, 5);
    const momentum = (price - priceHistory[0]) / priceHistory[0] * 100;
    
    return {
      value: momentum.toFixed(3),
      direction: momentum > 0 ? 'POSITIVE' : momentum < 0 ? 'NEGATIVE' : 'NEUTRAL',
      strength: Math.abs(momentum) > 1 ? 'STRONG' : Math.abs(momentum) > 0.3 ? 'MODERATE' : 'WEAK'
    };
  }

  generatePriceHistory(currentPrice, periods) {
    const history = [];
    let price = currentPrice;
    
    for (let i = periods; i >= 0; i--) {
      const variation = (Math.random() - 0.5) * 0.002 * currentPrice;
      price = currentPrice + variation * i / periods;
      history.push(price);
    }
    
    return history.reverse();
  }

  calculateSignalStrength(indicators) {
    let totalScore = 0;
    let maxScore = 0;
    
    // RSI Score (20%)
    const rsiWeight = 20;
    let rsiScore = 0;
    if (indicators.rsi.signal === 'BUY') rsiScore = indicators.rsi.strength === 'STRONG' ? 20 : 15;
    else if (indicators.rsi.signal === 'SELL') rsiScore = indicators.rsi.strength === 'STRONG' ? 20 : 15;
    else rsiScore = 5;
    totalScore += rsiScore;
    maxScore += rsiWeight;
    
    // MACD Score (25%)
    const macdWeight = 25;
    let macdScore = 0;
    if (indicators.macd.action === 'BUY') macdScore = indicators.macd.crossover.includes('STRONG') ? 25 : 20;
    else if (indicators.macd.action === 'SELL') macdScore = indicators.macd.crossover.includes('STRONG') ? 25 : 20;
    else macdScore = 5;
    totalScore += macdScore;
    maxScore += macdWeight;
    
    // Bollinger Bands Score (15%)
    const bbWeight = 15;
    let bbScore = indicators.bollinger.signal !== 'NEUTRAL' ? 15 : 5;
    totalScore += bbScore;
    maxScore += bbWeight;
    
    // Volume Score (10%)
    const volumeWeight = 10;
    let volumeScore = indicators.volume.trend === 'HIGH' ? 10 : indicators.volume.trend === 'NORMAL' ? 7 : 5;
    totalScore += volumeScore;
    maxScore += volumeWeight;
    
    // Trend Score (15%)
    const trendWeight = 15;
    let trendScore = indicators.trend.confidence === 'HIGH' ? 15 : indicators.trend.confidence === 'MEDIUM' ? 10 : 5;
    totalScore += trendScore;
    maxScore += trendWeight;
    
    // Sentiment Score (15%)
    const sentimentWeight = 15;
    let sentimentScore = indicators.sentiment.strength === 'STRONG' ? 15 : indicators.sentiment.strength === 'MODERATE' ? 10 : 5;
    totalScore += sentimentScore;
    maxScore += sentimentWeight;
    
    const confidence = Math.round((totalScore / maxScore) * 100);
    
    // Determine overall signal
    let overallSignal = 'WAIT';
    let signalStrength = 'WEAK';
    
    if (confidence >= 75) {
      signalStrength = 'STRONG';
      // Determine direction based on indicators
      const buySignals = [
        indicators.rsi.signal === 'BUY',
        indicators.macd.action === 'BUY',
        indicators.bollinger.signal === 'BUY',
        indicators.trend.direction === 'UP',
        indicators.sentiment.sentiment === 'BULLISH'
      ].filter(Boolean).length;
      
      const sellSignals = [
        indicators.rsi.signal === 'SELL',
        indicators.macd.action === 'SELL',
        indicators.bollinger.signal === 'SELL',
        indicators.trend.direction === 'DOWN',
        indicators.sentiment.sentiment === 'BEARISH'
      ].filter(Boolean).length;
      
      if (buySignals > sellSignals) overallSignal = 'BUY';
      else if (sellSignals > buySignals) overallSignal = 'SELL';
    } else if (confidence >= 60) {
      signalStrength = 'MODERATE';
      overallSignal = Math.random() > 0.7 ? (Math.random() > 0.5 ? 'BUY' : 'SELL') : 'WAIT';
    }
    
    return {
      signal: overallSignal,
      strength: signalStrength,
      confidence,
      indicators,
      timestamp: Date.now()
    };
  }

  generateRecommendation(signal, currentPrice, strategy) {
    const now = new Date();
    const timeframe = this.getOptimalTimeframe(signal);
    const payout = this.calculatePayout(timeframe, signal.confidence);
    
    // Generate entry timing
    const entryTiming = this.calculateOptimalEntryTime(signal);
    
    return {
      action: signal.signal,
      confidence: signal.confidence,
      timeframe: timeframe.value,
      timeframeLabel: timeframe.label,
      payout: payout,
      entryPrice: currentPrice,
      optimalEntryTime: entryTiming,
      expiryTime: new Date(now.getTime() + timeframe.duration).toLocaleTimeString(),
      reasoning: this.generateReasoning(signal),
      riskLevel: this.calculateRiskLevel(signal.confidence),
      expectedReturn: this.calculateExpectedReturn(signal.confidence, payout)
    };
  }

  getOptimalTimeframe(signal) {
    const timeframes = [
      { value: '30s', label: '30 Seconds', duration: 30000, minConfidence: 80 },
      { value: '1m', label: '1 Minute', duration: 60000, minConfidence: 70 },
      { value: '2m', label: '2 Minutes', duration: 120000, minConfidence: 65 },
      { value: '5m', label: '5 Minutes', duration: 300000, minConfidence: 60 },
      { value: '15m', label: '15 Minutes', duration: 900000, minConfidence: 55 }
    ];
    
    // Select timeframe based on confidence
    for (const tf of timeframes) {
      if (signal.confidence >= tf.minConfidence) {
        return tf;
      }
    }
    
    return timeframes[timeframes.length - 1]; // Default to longest timeframe
  }

  calculatePayout(timeframe, confidence) {
    const basePayout = {
      '30s': 0.85,
      '1m': 0.87,
      '2m': 0.89,
      '5m': 0.91,
      '15m': 0.93
    };
    
    const base = basePayout[timeframe.value] || 0.85;
    const confidenceBonus = (confidence - 50) / 1000; // Small bonus for high confidence
    
    return Math.min(0.98, base + confidenceBonus);
  }

  calculateOptimalEntryTime(signal) {
    if (signal.confidence >= 80) return 'IMMEDIATE';
    if (signal.confidence >= 70) return 'WITHIN_30_SECONDS';
    if (signal.confidence >= 60) return 'WITHIN_1_MINUTE';
    return 'WAIT_FOR_BETTER_SIGNAL';
  }

  generateReasoning(signal) {
    const reasons = [];
    
    if (signal.indicators.rsi.signal !== 'NEUTRAL') {
      reasons.push(`RSI indicates ${signal.indicators.rsi.signal} signal (${signal.indicators.rsi.strength})`);
    }
    
    if (signal.indicators.macd.action !== 'WAIT') {
      reasons.push(`MACD shows ${signal.indicators.macd.crossover} crossover`);
    }
    
    if (signal.indicators.trend.confidence !== 'LOW') {
      reasons.push(`Strong ${signal.indicators.trend.direction} trend detected`);
    }
    
    if (signal.indicators.sentiment.strength !== 'WEAK') {
      reasons.push(`Market sentiment is ${signal.indicators.sentiment.sentiment}`);
    }
    
    return reasons.join('. ') || 'Mixed signals detected, waiting for clearer opportunity.';
  }

  calculateRiskLevel(confidence) {
    if (confidence >= 80) return 'LOW';
    if (confidence >= 65) return 'MEDIUM';
    return 'HIGH';
  }

  calculateExpectedReturn(confidence, payout) {
    const winProbability = confidence / 100;
    return ((winProbability * payout) - ((1 - winProbability) * 1)) * 100;
  }

  // Subscribe to signal updates
  subscribe(callback) {
    this.subscribers.push(callback);
  }

  unsubscribe(callback) {
    const index = this.subscribers.indexOf(callback);
    if (index > -1) {
      this.subscribers.splice(index, 1);
    }
  }

  // Notify all subscribers of new signals
  notifySubscribers(signalData) {
    this.subscribers.forEach(callback => {
      try {
        callback(signalData);
      } catch (error) {
        console.error('Error notifying signal subscriber:', error);
      }
    });
  }
}

export const enhancedSignals = new EnhancedTradingSignals();