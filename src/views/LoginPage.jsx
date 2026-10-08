import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSynapse } from '../context/SynapseContext';

const ASCIIBackground = () => {
  const [grid, setGrid] = useState('');

  useEffect(() => {
    // Generate a static ASCII grid for the background
    const cols = Math.floor(window.innerWidth / 12); // approx width of a mono character
    const rows = Math.floor(window.innerHeight / 14); // approx height
    let pattern = '';
    
    for (let r = 0; r < rows; r++) {
      let rowStr = '';
      for (let c = 0; c < cols; c++) {
        // Minimalist tech grid: mostly dots or pluses, occasional empty space
        if (r % 4 === 0 && c % 8 === 0) rowStr += '+';
        else if (r % 4 === 0) rowStr += '-';
        else if (c % 8 === 0) rowStr += '|';
        else rowStr += ' ';
      }
      pattern += rowStr + '\\n';
    }
    setGrid(pattern);

    const handleResize = () => {
      // Re-run on resize
      const newCols = Math.floor(window.innerWidth / 12);
      const newRows = Math.floor(window.innerHeight / 14);
      let newPattern = '';
      for (let r = 0; r < newRows; r++) {
        let rowStr = '';
        for (let c = 0; c < newCols; c++) {
          if (r % 4 === 0 && c % 8 === 0) rowStr += '+';
          else if (r % 4 === 0) rowStr += '-';
          else if (c % 8 === 0) rowStr += '|';
          else rowStr += ' ';
        }
        newPattern += rowStr + '\\n';
      }
      setGrid(newPattern);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center bg-white text-[#f0f0f0]">
      <pre className="font-mono text-xs leading-[14px] whitespace-pre m-0 p-0 select-none">
        {grid}
      </pre>
    </div>
  );
};

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { addToast } = useSynapse();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      addToast('success', 'Success', 'Successfully logged in.');
      navigate('/app');
    } catch (error) {
      addToast('error', 'Login Failed', error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white font-sans relative overflow-hidden">
      
      {/* ASCII Background Layer */}
      <ASCIIBackground />

      {/* Main Content Box */}
      <div className="w-full max-w-sm bg-white border border-black/10 rounded-none p-10 relative z-10 flex flex-col shadow-none">
        
        <div className="mb-10 text-center">
          <span className="font-display font-bold text-3xl tracking-tighter text-black">Synapse OS</span>
        </div>
        
        <h1 className="text-xl font-display font-medium text-black mb-2 text-left tracking-tight">System Login</h1>
        <p className="text-sm text-black/60 mb-8 text-left">Authenticate to access the infrastructure.</p>
        
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-black block">Email address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-black/20 px-0 py-2 text-sm text-black outline-none transition-colors focus:border-black placeholder:text-black/30 rounded-none" 
              placeholder="user@enterprise.com" 
            />
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between items-end mb-1.5">
              <label className="text-[13px] font-medium text-black block">Password</label>
              <a href="#" className="text-xs text-black/60 hover:text-black transition-colors underline underline-offset-2">Recovery</a>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b border-black/20 px-0 py-2 pr-8 text-sm text-black outline-none transition-colors focus:border-black placeholder:text-black/30 rounded-none" 
                placeholder="••••••••" 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-colors focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 mt-8 rounded-none bg-black text-white font-medium text-sm hover:bg-black/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Enter System'}
          </button>
        </form>
        
        <div className="mt-10 border-t border-black/10 pt-6">
          <p className="text-[13px] text-left text-black/60">
            No active clearance? <Link to="/register" className="text-black font-medium hover:underline underline-offset-2 transition-all">Request access</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
