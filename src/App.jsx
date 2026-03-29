import { useState } from 'react'
import { 
  ArrowLeft, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  History, 
  Target, 
  X,
  PieChart,
  Car,
  Home,
  Plane,
  Laptop,
  Wallet,
  Trash2
} from 'lucide-react'
import './App.css'

function App() {
  const [currentScreen, setCurrentScreen] = useState('home'); // home, history, goals
  const [balance, setBalance] = useState(24500);
  const [income, setIncome] = useState(25000);
  const [expenses, setExpenses] = useState(500);

  const [transactions, setTransactions] = useState([
    { id: 1, name: 'Salary', type: 'income', amount: 25000, date: 'TODAY', category: 'Income', icon: '💰' },
    { id: 2, name: 'Food', type: 'expense', amount: 500, date: 'TODAY', category: 'Essentials', icon: '🍕' }
  ]);

  const [goals, setGoals] = useState([
    { id: 1, name: 'Dream Car', current: 525000, target: 800000, icon: <Car size={26} /> }
  ]);

  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  const [txType, setTxType] = useState('expense');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('Other');
  
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Wallet');
  const [amountToAdd, setAmountToAdd] = useState('');

  const categories = txType === 'expense' 
    ? ['Food', 'Clothing', 'Rent', 'Bills', 'Transport', 'Health', 'Entertainment', 'Shopping', 'Other']
    : ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'];

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleAddTransaction = () => {
    const amount = Number(txAmount);
    if (!amount) return;

    const newTx = {
      id: Date.now(),
      name: txCategory,
      type: txType,
      amount: amount,
      date: 'TODAY',
      category: txCategory,
      icon: txType === 'income' ? '💰' : '💸'
    };

    setTransactions([newTx, ...transactions]);
    if (txType === 'income') {
      setIncome(prev => prev + amount);
      setBalance(prev => prev + amount);
    } else {
      setExpenses(prev => prev + amount);
      setBalance(prev => prev - amount);
    }

    setShowTransactionModal(false);
    setTxAmount('');
  };

  const handleAddGoal = () => {
    const target = Number(goalTarget);
    if (!goalName || !target) return;

    const newGoal = {
      id: Date.now(),
      name: goalName,
      current: 0,
      target: target,
      icon: getIcon(selectedIcon)
    };

    setGoals([...goals, newGoal]);
    setShowGoalModal(false);
    setGoalName('');
    setGoalTarget('');
  };

  const handleDeleteGoal = (id) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const handleAddMoneyToGoal = () => {
    const amount = Number(amountToAdd);
    if (!amount || !selectedGoal || amount > balance) return;

    setGoals(goals.map(g => {
      if (g.id === selectedGoal.id) {
        return { ...g, current: Math.min(g.current + amount, g.target) };
      }
      return g;
    }));

    setBalance(prev => prev - amount);
    setExpenses(prev => prev + amount);
    
    setTransactions([{
      id: Date.now(),
      name: `Sav. ${selectedGoal.name}`,
      type: 'expense',
      amount: amount,
      date: 'TODAY',
      category: 'Savings',
      icon: '🏛️'
    }, ...transactions]);

    setShowAddMoneyModal(false);
    setAmountToAdd('');
  };

  const getIcon = (name) => {
    const icons = {
      Car: <Car size={26} />, Home: <Home size={26} />, Plane: <Plane size={26} />, 
      Laptop: <Laptop size={26} />, Wallet: <Wallet size={26} />
    };
    return icons[name] || <Wallet size={26} />;
  }

  const chartData = [
    { day: 'Sun', value: 30 },
    { day: 'Mon', value: 20 },
    { day: 'Tue', value: 45 },
    { day: 'Wed', value: 15 },
    { day: 'Thu', value: 35 },
    { day: 'Fri', value: 50 },
    { day: 'Sat', value: 85, active: true },
  ];

  return (
    <div className="app-container animate-fade-in">
      
      {/* Home Screen */}
      {currentScreen === 'home' && (
        <div className="app-content hide-scrollbar">
          <div className="total-balance-section">
            <div className="label-muted">Available Funds</div>
            <div className="balance-amount-xl">{formatCurrency(balance).replace('₹', '')}</div>
          </div>

          <div className="summary-cards-container">
            <div className="summary-card-glass">
              <div className="card-icon-round" style={{ background: 'rgba(0, 255, 163, 0.1)', color: 'var(--accent-neon)' }}>
                <ArrowUpRight size={18} />
              </div>
              <span className="card-label-small">Income+</span>
              <span className="card-amount neon">₹{formatCurrency(income).replace('₹', '')}</span>
            </div>
            <div className="summary-card-glass">
              <div className="card-icon-round" style={{ background: 'rgba(255, 94, 98, 0.1)', color: 'var(--accent-coral)' }}>
                <ArrowDownRight size={18} />
              </div>
              <span className="card-label-small">Spent-</span>
              <span className="card-amount coral">₹{formatCurrency(expenses).replace('₹', '')}</span>
            </div>
          </div>

          <div className="chart-container-premium">
            <div className="chart-header-row">
              <span className="card-label-small">Usage Analytics</span>
              <PieChart size={16} color="var(--text-muted)" />
            </div>
            <div className="chart-bars-flex">
              {chartData.map((d, i) => (
                <div key={i} className="bar-wrapper">
                  <div 
                    className={`bar-pill ${d.active ? 'active' : ''}`} 
                    style={{ height: `${d.value}%` }}
                  ></div>
                  <span className="bar-label">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="action-grid">
            <button className="action-btn-premium" onClick={() => setCurrentScreen('history')}>
              <History size={20} className="neon-text" /> History
            </button>
            <button className="action-btn-premium" onClick={() => setCurrentScreen('goals')}>
              <Target size={20} className="neon-text" /> Goals
            </button>
          </div>
        </div>
      )}

      {/* History Screen */}
      {currentScreen === 'history' && (
        <div className="app-content hide-scrollbar">
          <div className="app-header">
            <button className="back-btn" onClick={() => setCurrentScreen('home')}>
              <ArrowLeft size={20} />
            </button>
            <h1 className="title-large">Performance</h1>
          </div>

          <div className="history-feed">
            <div className="label-muted" style={{ marginBottom: '10px' }}>Recent Activity</div>
            {transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No transactions yet</div>
            ) : (
              transactions.map(tx => (
                <div key={tx.id} className="tx-card-glass animate-fade-in">
                  <div className="tx-icon-square">{tx.icon}</div>
                  <div className="tx-meta">
                    <span className="tx-name">{tx.name}</span>
                    <span className="tx-tag">{tx.category}</span>
                  </div>
                  <div className="tx-amount-vibrant" style={{ color: tx.type === 'income' ? 'var(--accent-neon)' : 'var(--accent-coral)' }}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Goals Screen */}
      {currentScreen === 'goals' && (
        <div className="app-content hide-scrollbar">
          <div className="app-header" style={{ justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button className="back-btn" onClick={() => setCurrentScreen('home')}>
                <ArrowLeft size={20} />
              </button>
              <h1 className="title-large">Savings</h1>
            </div>
            <button className="back-btn" onClick={() => setShowGoalModal(true)}>
              <Plus size={20} />
            </button>
          </div>

          <div className="savings-hero">
            <div className="hero-label">Accumulated Capital</div>
            <div className="hero-amount">{formatCurrency(goals.reduce((acc, g) => acc + g.current, 0))}</div>
          </div>

          <div className="goals-feed">
            {goals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No savings goals yet</div>
            ) : (
              goals.map(goal => (
                <div key={goal.id} className="goal-card-premium animate-fade-in">
                  <div className="goal-header-flex">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div className="goal-icon-circle-glow">{goal.icon}</div>
                      <div>
                        <span className="tx-name">{goal.name}</span>
                        <span className="tx-tag">{formatCurrency(goal.current)} of {formatCurrency(goal.target)}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <span className="tx-amount-vibrant" style={{ color: 'var(--accent-neon)' }}>
                        {Math.round((goal.current / goal.target) * 100)}%
                       </span>
                       <button className="icon-btn-minimal" onClick={() => handleDeleteGoal(goal.id)}>
                         <Trash2 size={16} color="var(--accent-coral)" />
                       </button>
                    </div>
                  </div>
                  <div className="goal-progress-track">
                    <div className="goal-progress-fill-glow" style={{ width: `${(goal.current / goal.target) * 100}%` }}></div>
                  </div>
                  <button className="add-btn-glass" onClick={() => { setSelectedGoal(goal); setShowAddMoneyModal(true); }}>
                    Deposit
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* FAB */}
      {currentScreen === 'home' && (
        <button className="fab-glow" onClick={() => setShowTransactionModal(true)}>
          <Plus size={32} />
        </button>
      )}

      {/* Modals */}
      {showTransactionModal && (
        <div className="modal-backdrop-blur" onClick={() => setShowTransactionModal(false)}>
          <div className="sheet-container-premium animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="input-huge-center">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '32px', color: 'var(--text-muted)', fontWeight: '800' }}>₹</span>
                <input 
                  className="amount-input-premium" 
                  type="number" 
                  placeholder="0" 
                  autoFocus
                  value={txAmount}
                  onChange={e => setTxAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="chip-grid-aesthetic" style={{ marginBottom: '24px' }}>
              {['Expense', 'Income'].map(type => (
                <button 
                  key={type} 
                  className={`aesthetic-chip ${txType === type.toLowerCase() ? 'active' : ''}`}
                  onClick={() => { setTxType(type.toLowerCase()); setTxCategory('Other'); }}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="label-muted" style={{ marginBottom: '12px', textAlign: 'center' }}>Category</div>
            <div className="chip-grid-aesthetic">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  className={`aesthetic-chip small ${txCategory === cat ? 'active' : ''}`}
                  onClick={() => setTxCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button className="primary-btn-premium" onClick={handleAddTransaction} style={{ marginTop: '20px' }}>
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <div className="modal-backdrop-blur" onClick={() => setShowAddMoneyModal(false)}>
          <div className="sheet-container-premium animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="input-huge-center">
              <span className="card-label-small">Deposit to {selectedGoal?.name}</span>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '32px', color: 'var(--text-muted)', fontWeight: '800' }}>₹</span>
                <input 
                  className="amount-input-premium" 
                  type="number" 
                  placeholder="0" 
                  autoFocus
                  value={amountToAdd}
                  onChange={e => setAmountToAdd(e.target.value)}
                />
              </div>
            </div>
            <button className="primary-btn-premium" onClick={handleAddMoneyToGoal}>
              Authorize Deposit
            </button>
          </div>
        </div>
      )}

      {/* New Goal Modal */}
      {showGoalModal && (
        <div className="modal-backdrop-blur" onClick={() => setShowGoalModal(false)}>
          <div className="sheet-container-premium animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="input-huge-center" style={{ marginBottom: '20px' }}>
              <input 
                className="amount-input-premium" 
                style={{ fontSize: '32px' }}
                placeholder="Target Name" 
                value={goalName}
                onChange={e => setGoalName(e.target.value)}
              />
            </div>
            <div className="input-huge-center">
              <span className="card-label-small">Target Capital</span>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '24px', color: 'var(--text-muted)' }}>₹</span>
                <input 
                  className="amount-input-premium" 
                  style={{ fontSize: '48px' }}
                  type="number" 
                  placeholder="0" 
                  value={goalTarget}
                  onChange={e => setGoalTarget(e.target.value)}
                />
              </div>
            </div>
            <button className="primary-btn-premium" style={{ marginTop: '20px' }} onClick={handleAddGoal}>
              Create Target
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default App
