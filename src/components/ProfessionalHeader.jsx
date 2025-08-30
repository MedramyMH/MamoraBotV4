import React from 'react';

const ProfessionalHeader = ({ isConnected, accountInfo, marketStatus }) => {
  return (
    <div className="bg-gradient-to-r from-slate-800 to-blue-900 shadow-2xl border-b border-blue-700/30">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Main Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
              <span className="text-2xl">🚀</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Professional Trading Terminal
              </h1>
              <p className="text-blue-200 text-sm">
                Advanced AI-Powered Binary Options Platform
              </p>
            </div>
          </div>
          
          {/* Status Indicators */}
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="text-xs text-blue-200 uppercase tracking-wide">Market Status</div>
              <div className={`text-sm font-semibold ${marketStatus === 'open' ? 'text-green-400' : 'text-red-400'}`}>
                {marketStatus === 'open' ? '🟢 Markets Open' : '🔴 Markets Closed'}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xs text-blue-200 uppercase tracking-wide">Connection</div>
              <div className={`text-sm font-semibold ${isConnected ? 'text-green-400' : 'text-orange-400'}`}>
                {isConnected ? '🟢 Live Trading' : '🟡 Demo Mode'}
              </div>
            </div>
          </div>
        </div>

        {/* Account Info Bar */}
        {accountInfo && (
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-blue-700/30">
            <div className="grid grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-xs text-blue-200 uppercase tracking-wide">Balance</div>
                <div className="text-lg font-bold text-green-400">${accountInfo.balance}</div>
              </div>
              <div>
                <div className="text-xs text-blue-200 uppercase tracking-wide">Account Type</div>
                <div className="text-lg font-semibold text-white">{accountInfo.accountType}</div>
              </div>
              <div>
                <div className="text-xs text-blue-200 uppercase tracking-wide">Currency</div>
                <div className="text-lg font-semibold text-white">{accountInfo.currency}</div>
              </div>
              <div>
                <div className="text-xs text-blue-200 uppercase tracking-wide">Leverage</div>
                <div className="text-lg font-semibold text-blue-300">{accountInfo.leverage}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalHeader;