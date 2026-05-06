import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dumbbell, 
  User as UserIcon, 
  Plus, 
  Trash2, 
  Save, 
  LogOut, 
  ChevronRight, 
  Search,
  ClipboardList,
  Info,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  ArrowLeft,
  UserPlus,
  Settings,
  History,
  Copy,
  Edit3,
  X,
  Check,
  Sun,
  Moon,
  Download,
  Key,
  FileText,
  Mail,
  Bell,
  MessageSquare,
  Send,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Home,
  Menu,
  MoreVertical
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { User, Plan, Exercise, PlanItem, Role, ModelPlan } from './types';

const parseDateValue = (value?: string) => {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(value);
};

const getDaysRemaining = (endDate?: string) => {
  const end = parseDateValue(endDate);
  if (!end) return null;
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const PASSWORD_RULE_MESSAGE = 'La password deve contenere almeno 8 caratteri e almeno una lettera maiuscola.';
const hasStrongPassword = (value: string) => value.length >= 8 && /[A-Z]/.test(value);

const isContractExpired = (endDate?: string) => {
  const end = parseDateValue(endDate);
  if (!end) return false;
  if (Number.isNaN(end.getTime())) return false;
  end.setHours(23, 59, 59, 999);
  return end.getTime() < Date.now();
};

const formatExerciseLoad = (item: PlanItem) => {
  const parts = [`${item.sets || '-'} x ${item.reps || '-'}`];
  if (item.weight) parts.push(`${item.weight} kg`);
  if (item.recovery) parts.push(`Rec. ${item.recovery}`);
  return parts.join(' - ');
};

// --- Components ---

const Auth = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [healthConsent, setHealthConsent] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!isLogin && !isForgot && !privacyAccepted) {
      setError('Devi accettare la Privacy Policy per registrarti.');
      return;
    }
    if (!isLogin && !isForgot && !healthConsent) {
      setError('Devi prestare il consenso esplicito al trattamento dei dati relativi alla salute.');
      return;
    }
    if (!isLogin && !isForgot && !ageConfirmed) {
      setError('Devi avere almeno 14 anni per usare questo servizio.');
      return;
    }
    if (!isLogin && !isForgot && !hasStrongPassword(password)) {
      setError(PASSWORD_RULE_MESSAGE);
      return;
    }

    setLoading(true);

    if (isForgot) {
      try {
        const res = await fetch('/api/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (res.ok) {
          setMessage(data.message);
        } else {
          setError(data.error || 'Errore durante l\'operazione');
        }
      } catch (err) {
        setError('Errore di connessione');
      } finally {
        setLoading(false);
      }
      return;
    }

    const endpoint = isLogin ? '/api/login' : '/api/register';
    const body = isLogin ? { email, password } : { email, password, name, privacyAccepted, healthConsent, ageConfirmed };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const user = await res.json();
        onLogin(user);
      } else {
        const data = await res.json();
        setError(data.error || 'Errore durante l\'operazione');
      }
    } catch (err) {
      setError('Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent rounded-full blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent-dark rounded-full blur-[120px]" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass p-10 rounded-[3rem] relative z-10"
      >
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-zinc-900 rounded-3xl flex items-center justify-center shadow-2xl border border-white/10 overflow-hidden">
            <img 
              src="https://i.imgur.com/Qbox1fT.jpeg" 
              alt="Coach Bellu Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
        <h1 className="text-4xl font-display font-black text-center mb-2 text-white italic tracking-tighter uppercase">Coach Bellu</h1>
        <p className="text-zinc-500 text-center mb-10 font-bold uppercase tracking-widest text-[10px]">
          {isForgot ? 'Recupero Password' : (isLogin ? 'Accedi al tuo account' : 'Crea il tuo account')}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && !isForgot && (
            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Nome Completo</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Inserisci nome e cognome"
                value={name} 
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div>
            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Email</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="Inserisci la tua email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {!isForgot && (
            <div className="relative">
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="input-field pr-14" 
                  placeholder="••••••••"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={!isLogin ? 8 : undefined}
                  title={!isLogin ? PASSWORD_RULE_MESSAGE : undefined}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-zinc-600 hover:accent transition-all"
                  title={showPassword ? "Nascondi Password" : "Mostra Password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}
          {!isLogin && !isForgot && (
            <div className="space-y-4 mt-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="privacy"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="mt-1"
                  required
                />
                <label htmlFor="privacy" className="text-[10px] text-zinc-500 uppercase tracking-widest leading-relaxed">
                  Ho letto e accetto la <a href="/privacy-policy" className="text-accent hover:underline">Privacy Policy</a>.
                </label>
              </div>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="health-consent"
                  checked={healthConsent}
                  onChange={(e) => setHealthConsent(e.target.checked)}
                  className="mt-1"
                  required
                />
                <label htmlFor="health-consent" className="text-[10px] text-zinc-500 uppercase tracking-widest leading-relaxed">
                  Acconsento esplicitamente al trattamento dei miei dati relativi alla salute, inclusi peso, altezza e condizioni di salute, per ricevere programmi di fitness/coaching personalizzati.
                </label>
              </div>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="age-confirmed"
                  checked={ageConfirmed}
                  onChange={(e) => setAgeConfirmed(e.target.checked)}
                  className="mt-1"
                  required
                />
                <label htmlFor="age-confirmed" className="text-[10px] text-zinc-500 uppercase tracking-widest leading-relaxed">
                  Dichiaro di avere almeno 14 anni.
                </label>
              </div>
            </div>
          )}
          {error && <p className="text-red-400 text-[10px] font-black uppercase tracking-widest text-center">{error}</p>}
          {message && <p className="text-accent text-[10px] font-black uppercase tracking-widest text-center">{message}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full py-5 mt-4">
            {loading ? '...' : (isForgot ? 'Invia Richiesta' : (isLogin ? 'Accedi' : 'Registrati'))}
          </button>
        </form>

        <div className="mt-10 text-center space-y-4">
          {!isForgot ? (
            <>
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-[10px] text-zinc-500 hover:text-accent transition-colors font-black uppercase tracking-widest block w-full"
              >
                {isLogin ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
              </button>
              {isLogin && (
                <button 
                  onClick={() => setIsForgot(true)}
                  className="text-[10px] text-zinc-500 hover:text-accent transition-colors font-black uppercase tracking-widest"
                >
                  Hai dimenticato la password?
                </button>
              )}
            </>
          ) : (
            <button 
              onClick={() => setIsForgot(false)}
              className="text-[10px] text-zinc-500 hover:text-accent transition-colors font-black uppercase tracking-widest"
            >
              Torna al Login
            </button>
          )}
          <div className="flex items-center justify-center gap-3 pt-4">
            <a href="/privacy-policy" className="text-[10px] text-zinc-600 hover:text-accent transition-colors font-black uppercase tracking-widest">Privacy Policy</a>
            <span className="text-zinc-700 text-[10px]">|</span>
            <a href="/terms" className="text-[10px] text-zinc-600 hover:text-accent transition-colors font-black uppercase tracking-widest">Termini</a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd1, setShowPwd1] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const token = new URLSearchParams(window.location.search).get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return setError('Le password non coincidono');
    if (!hasStrongPassword(password)) return setError(PASSWORD_RULE_MESSAGE);
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setTimeout(() => window.location.href = '/', 2000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div className="max-w-md w-full glass p-10 rounded-[3rem]">
        <h2 className="text-3xl font-display font-black italic uppercase tracking-tighter text-white mb-6">Nuova Password</h2>
        {message ? (
          <p className="text-accent font-bold uppercase tracking-widest text-xs text-center">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Password</label>
              <div className="relative">
                <input type={showPwd1 ? "text" : "password"} className="input-field pr-14" value={password} onChange={e => setPassword(e.target.value)} minLength={8} title={PASSWORD_RULE_MESSAGE} required />
                <button 
                  type="button"
                  onClick={() => setShowPwd1(!showPwd1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-zinc-600 hover:text-accent transition-all"
                >
                  {showPwd1 ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="relative">
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Conferma Password</label>
              <div className="relative">
                <input type={showPwd2 ? "text" : "password"} className="input-field pr-14" value={confirm} onChange={e => setConfirm(e.target.value)} required />
                <button 
                  type="button"
                  onClick={() => setShowPwd2(!showPwd2)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-zinc-600 hover:text-accent transition-all"
                >
                  {showPwd2 ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            {error && <p className="text-red-400 text-[10px] font-black uppercase tracking-widest text-center">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full py-5">
              {loading ? 'Aggiornamento...' : 'Aggiorna Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const Chat = ({ currentUser, otherUser, onBack, theme, newMessagesCount = 0, onRead }: { currentUser: User, otherUser: User, onBack: () => void, theme?: 'dark' | 'light', newMessagesCount?: number, onRead?: () => void }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const fetchMessages = () => {
    fetch(`/api/messages/${currentUser.id}?otherId=${otherUser.id}`)
      .then(res => res.json())
      .then(data => {
        setMessages(Array.isArray(data) ? data : []);
        // Mark as read
        fetch('/api/messages/read', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ receiverId: currentUser.id, senderId: otherUser.id })
        }).then(() => {
          if (onRead) onRead();
        });
      });
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [otherUser.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setLoading(true);
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender_id: currentUser.id, receiver_id: otherUser.id, content: newMessage }),
      });
      setNewMessage('');
      fetchMessages();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] glass rounded-[3rem] overflow-hidden">
      <div className={`p-6 border-b flex items-center justify-between ${theme === 'light' ? 'bg-zinc-100/50 border-zinc-200' : 'bg-zinc-900/50 border-white/5'}`}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={`p-2 rounded-xl transition-all ${theme === 'light' ? 'hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900' : 'hover:bg-white/5 text-zinc-500 hover:text-white'}`}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className={`text-xl font-display font-black italic uppercase tracking-tighter ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>{otherUser.name}</h3>
            <p className="text-[10px] font-black text-accent uppercase tracking-widest">Chat Diretta</p>
          </div>
        </div>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
        {messages.map((m, i) => (
          <React.Fragment key={i}>
            {newMessagesCount > 0 && i === messages.length - newMessagesCount && (
              <div className="flex items-center gap-4 py-4">
                <div className="h-px flex-1 bg-accent/20" />
                <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">{newMessagesCount} nuovi messaggi</span>
                <div className="h-px flex-1 bg-accent/20" />
              </div>
            )}
            <div className={`flex ${m.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl ${
                m.sender_id === currentUser.id 
                  ? 'bg-accent text-black rounded-tr-none' 
                  : (theme === 'light' ? 'bg-zinc-200 text-zinc-900 rounded-tl-none' : 'bg-zinc-800 text-white rounded-tl-none')
              }`}>
                <p className="text-sm font-bold">{m.content}</p>
                <p className={`text-[10px] sm:text-[8px] mt-1 font-black uppercase opacity-40 ${m.sender_id === currentUser.id ? 'text-black' : (theme === 'light' ? 'text-zinc-900' : 'text-white')}`}>
                  {new Date(m.created_at).toLocaleDateString([], { day: '2-digit', month: '2-digit' })} • {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSend} className={`p-6 border-t flex gap-3 ${theme === 'light' ? 'bg-zinc-100/50 border-zinc-200' : 'bg-zinc-900/50 border-white/5'}`}>
        <input 
          className="input-field flex-1" 
          placeholder="Scrivi un messaggio..." 
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          autoFocus
        />
        <button type="submit" disabled={loading} className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center text-black hover:scale-105 transition-all shadow-lg shadow-accent/20">
          <Send className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
};

const CoachInbox = ({ unreadNotifications, onSelectAthlete, onBack, theme }: { 
  unreadNotifications: any[], 
  onSelectAthlete: (senderId: number) => void,
  onBack: () => void,
  theme?: 'dark' | 'light' 
}) => {
  const grouped = useMemo(() => {
    return unreadNotifications.reduce((acc, n) => {
      if (!acc[n.sender_id]) {
        acc[n.sender_id] = {
          sender_id: n.sender_id,
          sender_name: n.sender_name,
          last_message: n.content,
          count: 0,
          created_at: n.created_at
        };
      }
      acc[n.sender_id].count++;
      if (new Date(n.created_at) > new Date(acc[n.sender_id].created_at)) {
        acc[n.sender_id].last_message = n.content;
        acc[n.sender_id].created_at = n.created_at;
      }
      return acc;
    }, {} as Record<number, any>);
  }, [unreadNotifications]);

  const items = Object.values(grouped).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-6">
        <button onClick={onBack} className={`w-14 h-14 flex items-center justify-center border rounded-2xl hover:shadow-lg transition-all ${theme === 'light' ? 'bg-white border-zinc-200 shadow-zinc-200' : 'bg-zinc-900 border-white/10 shadow-accent/20'}`}>
          <ArrowLeft className={`w-6 h-6 ${theme === 'dark' ? 'text-accent' : 'text-zinc-900'}`} />
        </button>
        <h2 className={`text-4xl font-display font-black italic uppercase tracking-tighter ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>Inbox Messaggi</h2>
      </div>

      <div className="grid gap-4">
        {items.length === 0 ? (
          <div className="glass p-20 rounded-[3rem] text-center space-y-4">
             <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/5">
               <Mail className="w-10 h-10 text-zinc-700" />
             </div>
             <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs italic">Nessun nuovo messaggio</p>
          </div>
        ) : (
          items.map((item: any) => (
            <button 
              key={item.sender_id}
              onClick={() => onSelectAthlete(item.sender_id)}
              className="glass p-6 rounded-[2.5rem] flex items-center justify-between group hover:scale-[1.01] transition-all text-left"
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center shrink-0">
                  <UserIcon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h4 className={`text-xl font-display font-black italic uppercase tracking-tighter ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>{item.sender_name}</h4>
                  <p className="text-zinc-500 text-xs font-bold line-clamp-1 italic">"{item.last_message}"</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-accent text-black px-3 py-1 rounded-full text-[10px] font-black shadow-lg shadow-accent/20">
                  {item.count}
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-accent transition-all" />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

const Notifications = ({ coachId, onReply, onBack, theme, fullView = false }: { coachId: number, onReply: (userId: number) => void, onBack: () => void, theme?: 'dark' | 'light', fullView?: boolean }) => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const endpoint = fullView ? `/api/notifications/full/${coachId}` : `/api/notifications/${coachId}`;
    fetch(endpoint)
      .then(res => res.json())
      .then(data => setNotifications(Array.isArray(data) ? data : []));
  }, [coachId, fullView]);

  return (
    <div className="space-y-8 h-full">
      {onBack && typeof onBack === 'function' && onBack.toString() !== '() => {}' && (
        <div className="flex items-center gap-6">
          <button onClick={onBack} className={`w-14 h-14 flex items-center justify-center border rounded-2xl hover:shadow-lg transition-all ${theme === 'light' ? 'bg-white border-zinc-200 hover:shadow-zinc-200' : 'bg-zinc-900 border-white/10 hover:shadow-accent/20'}`}>
            <ArrowLeft className={`w-6 h-6 ${theme === 'dark' ? 'text-accent' : 'text-zinc-900'}`} />
          </button>
          <h2 className={`text-4xl font-display font-black italic uppercase tracking-tighter ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>Notifiche</h2>
        </div>
      )}
      <div className="grid gap-4">
        {notifications.length === 0 ? (
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs text-center py-20">Nessuna nuova notifica</p>
        ) : (
          notifications.map((n, i) => (
            <div key={i} className="glass p-6 rounded-3xl flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <p className={`font-black italic uppercase tracking-tighter ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>Messaggio da {n.sender_name}</p>
                  <p className="text-zinc-500 text-xs font-bold line-clamp-1">"{n.content}"</p>
                  {fullView && (
                    <p className="text-[10px] font-black text-accent uppercase tracking-widest mt-1">
                      {new Date(n.created_at).toLocaleDateString()} • {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              </div>
              <button 
                onClick={() => onReply(n.sender_id)}
                className="bg-accent text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all transition-colors"
                title="Rispondi"
              >
                Rispondi
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const ContactCoach = ({ athleteId, coachId, onBack, theme }: { athleteId: number, coachId: number, onBack: () => void, theme?: 'dark' | 'light' }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender_id: athleteId, receiver_id: coachId, content: message }),
      });
      setSent(true);
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="glass p-12 rounded-[3rem] text-center space-y-6">
        <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-accent" />
        </div>
        <h3 className={`text-3xl font-display font-black italic uppercase tracking-tighter ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>Messaggio Inviato!</h3>
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Pietro ti risponderà il prima possibile.</p>
        <button onClick={onBack} className="btn-primary px-10 py-4">Torna alla Dashboard</button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-6">
        <button onClick={onBack} className={`w-14 h-14 flex items-center justify-center border rounded-2xl hover:shadow-lg transition-all ${theme === 'light' ? 'bg-white border-zinc-200 shadow-zinc-200' : 'bg-zinc-900 border-white/10 shadow-accent/20'}`}>
          <ArrowLeft className="w-6 h-6 text-accent" />
        </button>
        <div>
          <h2 className={`text-4xl font-display font-black italic uppercase tracking-tighter ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>Contatta il Coach</h2>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Invia feedback, domande o lamentele</p>
        </div>
      </div>

      <form onSubmit={handleSend} className="glass p-10 rounded-[3rem] space-y-8">
        <div>
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 block ml-1">Il tuo messaggio</label>
          <textarea 
            className="input-field min-h-[200px] py-6 text-lg font-bold italic" 
            placeholder="Scrivi qui..." 
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-6 flex items-center justify-center gap-3">
          <Send className="w-6 h-6" />
          {loading ? 'Invio...' : 'Invia Messaggio'}
        </button>
      </form>
    </div>
  );
};

const ExerciseLibrary = ({ exercises, onUpdate, theme }: { exercises: Exercise[], onUpdate: () => void, theme?: 'dark' | 'light' }) => {
  const [editingEx, setEditingEx] = useState<Exercise | null>(null);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newMuscleGroup, setNewMuscleGroup] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [libSearch, setLibSearch] = useState('');

  const handleSave = async () => {
    const endpoint = editingEx ? `/api/exercises/${editingEx.id}` : '/api/exercises';
    const method = editingEx ? 'PATCH' : 'POST';
    
    await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, category: newCategory, muscle_group: newMuscleGroup }),
    });
    
    setEditingEx(null);
    setIsAdding(false);
    setNewName('');
    setNewCategory('');
    setNewMuscleGroup('');
    onUpdate();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminare questo esercizio?')) return;
    await fetch(`/api/exercises/${id}`, { method: 'DELETE' });
    onUpdate();
  };

  const categories = Array.from(new Set(exercises.map(ex => ex.category)));

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className={`text-4xl font-display font-black italic uppercase tracking-tighter leading-none mb-2 ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>Libreria Esercizi</h2>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Gestisci il tuo database di movimenti</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <div className="relative flex-1">
            <input 
              className={`w-full py-4 pl-8 pr-4 border rounded-2xl text-xs font-bold uppercase tracking-widest outline-none focus:border-accent transition-all ${theme === 'light' ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-white/10 text-white'}`}
              placeholder="Cerca per nome o gruppo muscolare..."
              value={libSearch}
              onChange={e => setLibSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { setIsAdding(true); setEditingEx(null); setNewName(''); setNewCategory(''); setNewMuscleGroup(''); }}
            className="bg-accent text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-accent-dark transition-all shadow-xl shadow-accent/20 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Nuovo Esercizio
          </button>
        </div>
      </div>

      {(isAdding || editingEx) && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-8 rounded-[2.5rem] border shadow-2xl space-y-6 ${theme === 'light' ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-white/10'}`}
        >
          <h3 className={`text-xl font-display font-black italic uppercase tracking-tighter ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>{editingEx ? 'Modifica' : 'Aggiungi'} Esercizio</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block ml-1">Nome</label>
              <input 
                placeholder="Es. Panca Piana" 
                className={`input-field border ${theme === 'light' ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-800/50 border-white/5 text-white'}`}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block ml-1">Tag / Categoria</label>
              <input 
                placeholder="Es. Petto, Schiena, Gambe..." 
                className={`input-field border ${theme === 'light' ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-800/50 border-white/5 text-white'}`}
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block ml-1">Gruppo Muscolare</label>
              <input 
                placeholder="Es. Pettorali, Dorsali..." 
                className={`input-field border ${theme === 'light' ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-800/50 border-white/5 text-white'}`}
                value={newMuscleGroup}
                onChange={(e) => setNewMuscleGroup(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => { setIsAdding(false); setEditingEx(null); }} className={`px-6 py-3 font-bold uppercase tracking-widest text-xs ${theme === 'light' ? 'text-zinc-500 hover:text-zinc-900' : 'text-zinc-400 hover:text-white'}`}>Annulla</button>
            <button onClick={handleSave} className={`${theme === 'light' ? 'bg-zinc-900 text-white hover:bg-black' : 'bg-white text-black hover:bg-zinc-200'} px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all`}>Salva</button>
          </div>
        </motion.div>
      )}

      <div className="space-y-12">
        {Array.from(new Set(exercises.map(ex => ex.category))).sort().map(cat => {
          const catExercises = exercises.filter(ex => 
            ex.category === cat && 
            (ex.name.toLowerCase().includes(libSearch.toLowerCase()) || 
             (ex.muscle_group || '').toLowerCase().includes(libSearch.toLowerCase()))
          );
          if (catExercises.length === 0) return null;
          return (
            <div key={cat} className="space-y-6">
            <div className="flex items-center gap-4">
              <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full ${theme === 'light' ? 'bg-zinc-900 text-white' : 'bg-white text-black'}`}>{cat}</span>
              <div className={`h-px flex-1 ${theme === 'light' ? 'bg-zinc-200' : 'bg-white/5'}`} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {catExercises.map(ex => (
                <div key={ex.id} className={`p-6 rounded-2xl border flex justify-between items-center group hover:shadow-md transition-all ${theme === 'light' ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-white/5'}`}>
                  <div>
                    <p className={`font-black italic uppercase tracking-tighter text-lg ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>{ex.name}</p>
                    {ex.muscle_group && <p className="text-[8px] font-black text-accent uppercase tracking-widest">{ex.muscle_group}</p>}
                  </div>
                  <div className="flex gap-1 transition-opacity">
                    <button 
                      onClick={() => { setEditingEx(ex); setNewName(ex.name); setNewCategory(ex.category); setNewMuscleGroup(ex.muscle_group || ''); setIsAdding(false); }}
                      className={`p-2 rounded-xl transition-all ${theme === 'light' ? 'text-zinc-400 hover:text-blue-500 hover:bg-blue-500/5' : 'text-zinc-500 hover:text-accent hover:bg-accent/5'}`}
                      title="Modifica"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(ex.id)}
                      className={`p-2 rounded-xl transition-all ${theme === 'light' ? 'text-zinc-400 hover:text-red-600 hover:bg-red-50' : 'text-zinc-500 hover:text-red-500 hover:bg-red-500/5'}`}
                      title="Elimina"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
            );
        })}

      </div>
    </div>
  );
};

const ModelsLibrary = ({ models, exercises, onUpdate, theme }: { models: ModelPlan[], exercises: Exercise[], onUpdate: () => void, theme?: 'dark' | 'light' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState<boolean | ModelPlan>(false);
  const [viewingModel, setViewingModel] = useState<ModelPlan | null>(null);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [modelItems, setModelItems] = useState<PlanItem[]>([]);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [expandedDays, setExpandedDays] = useState<string[]>(['Giorno A']);

  // Effect to populate form when editing
  useEffect(() => {
    if (typeof isCreating === 'object' && isCreating !== null) {
      setNewName(isCreating.name);
      setNewDesc(isCreating.description || '');
      // Fetch items if they are not already in the object
      if (isCreating.items) {
        setModelItems(isCreating.items);
      } else {
        fetch(`/api/models/${isCreating.id}/items`)
          .then(res => res.json())
          .then(setModelItems);
      }
    } else {
      setNewName('');
      setNewDesc('');
      setModelItems([]);
    }
  }, [isCreating]);

  const filteredModels = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return models.filter(m => 
      m.name.toLowerCase().includes(s) || 
      (m.description || '').toLowerCase().includes(s) ||
      (m.items || []).some((item: any) => item.exercise_name.toLowerCase().includes(s))
    );
  }, [models, searchTerm]);

  const filteredEx = useMemo(() => exercises.filter(e => e.name.toLowerCase().includes(exerciseSearch.toLowerCase()) || e.category.toLowerCase().includes(exerciseSearch.toLowerCase())), [exercises, exerciseSearch]);

  const handleSave = async () => {
    if (!newName) return alert('Inserisci il nome del modello');
    const isEditing = typeof isCreating === 'object';
    const url = isEditing ? `/api/models/${(isCreating as ModelPlan).id}` : '/api/models';
    const method = isEditing ? 'PATCH' : 'POST';

    await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, description: newDesc, items: modelItems })
    });
    setIsCreating(false);
    setNewName(''); setNewDesc(''); setModelItems([]);
    onUpdate();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Eliminare questo modello?')) return;
    try {
      const res = await fetch(`/api/models/${id}`, { method: 'DELETE' });
      if (res.ok) {
        onUpdate();
        alert('Modello eliminato con successo');
      } else {
        alert('Errore durante l\'eliminazione del modello');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Errore di connessione');
    }
  };

  if (isCreating) {
    if (previewMode) {
      return (
        <div className="space-y-12">
          <div className="flex justify-between items-center">
            <button onClick={() => setPreviewMode(false)} className="flex items-center gap-2 text-accent font-black uppercase tracking-widest text-xs">
              <ArrowLeft className="w-5 h-5" /> Torna all'Editor
            </button>
            <h2 className={`text-3xl font-display font-black italic uppercase tracking-tighter ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>Anteprima Modello</h2>
          </div>
          <div className={`p-12 rounded-[4rem] space-y-12 border ${theme === 'light' ? 'bg-white border-zinc-200 shadow-xl' : 'glass border-white/10'}`}>
            <div>
              <h1 className="text-5xl font-display font-black italic uppercase tracking-tighter text-accent mb-4">{newName}</h1>
              <p className={`font-bold text-xl italic ${theme === 'light' ? 'text-zinc-500' : 'text-zinc-400'}`}>{newDesc}</p>
            </div>
            {(Object.entries(modelItems.reduce((acc, item) => {
              const day = item.day || 'Giorno A';
              if (!acc[day]) acc[day] = [];
              acc[day].push(item);
              return acc;
            }, {} as Record<string, PlanItem[]>)) as [string, PlanItem[]][]).sort().map(([day, items]) => (
              <div key={day} className="space-y-6">
                <h3 className="text-2xl font-display font-black italic uppercase text-accent border-b border-white/5 pb-2">{day}</h3>
                <div className="grid gap-4">
                  {items.map((item, i) => (
                    <div key={i} className={`flex justify-between items-center p-4 rounded-2xl border ${theme === 'light' ? 'bg-zinc-50 border-zinc-100' : 'bg-white/5 border-white/5'}`}>
                      <span className={`font-bold text-lg uppercase italic ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>{item.exercise_name}</span>
                      <span className="text-accent font-black tracking-tighter">{formatExerciseLoad(item)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button onClick={handleSave} className="btn-primary w-full py-6 text-xl">Conferma e Salva Modello</button>
        </div>
      );
    }    return (
      <div className="space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h2 className={`text-4xl font-display font-black italic uppercase tracking-tighter leading-none mb-2 ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>
              {typeof isCreating === 'object' ? 'Modifica Modello' : 'Editor Modello'}
            </h2>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
              {typeof isCreating === 'object' ? 'Stai modificando un modello esistente' : 'Stai creando un modello master riutilizzabile'}
            </p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setIsCreating(false)} className={`px-6 py-3 font-black uppercase tracking-widest text-xs transition-all ${theme === 'light' ? 'text-zinc-500 hover:text-zinc-900' : 'text-zinc-500 hover:text-white'}`}>Annulla</button>
            <button 
              onClick={() => setPreviewMode(true)} 
              disabled={modelItems.length === 0}
              className={`px-6 py-3 border rounded-2xl font-black uppercase tracking-widest text-xs transition-all disabled:opacity-30 ${theme === 'light' ? 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50' : 'bg-zinc-900 border-white/10 text-accent hover:bg-accent/5'}`}
            >
              Anteprima
            </button>
            <button onClick={handleSave} className="btn-primary px-10 py-4 shadow-xl shadow-accent/20">Salva Modello</button>
          </div>
        </div>

        <div className={`glass p-10 rounded-[3.5rem] space-y-8 ${theme === 'light' ? 'border-zinc-200' : 'border-white/10'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block ml-1">Nome Modello</label>
              <input 
                className={`input-field text-xl py-6 rounded-[2rem] transition-all ${theme === 'light' ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-black/40 border-white/5 text-white focus:bg-black/60'}`} 
                placeholder="Es. Full Body Forza..." 
                value={newName} 
                onChange={e => setNewName(e.target.value)} 
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block ml-1">Descrizione / Obiettivi</label>
              <input 
                className={`input-field text-lg py-6 rounded-[2rem] transition-all ${theme === 'light' ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-black/40 border-white/5 text-white focus:bg-black/60'}`} 
                placeholder="Es. Focus progressione carichi..." 
                value={newDesc} 
                onChange={e => setNewDesc(e.target.value)} 
              />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="relative">
            {/* Search Icon Removed */}
            <input
              type="text"
              placeholder="Cerca esercizio da aggiungere al modello..."
              className={`input-field pl-8 py-8 text-xl font-bold rounded-[2.5rem] transition-all ${theme === 'light' ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900/80 border-white/5 text-white focus:bg-zinc-900'}`}
              value={exerciseSearch}
              onChange={(e) => setExerciseSearch(e.target.value)}
            />
            <AnimatePresence>
              {exerciseSearch && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`absolute z-50 w-full mt-4 border rounded-[3rem] shadow-2xl max-h-[400px] overflow-y-auto p-6 backdrop-blur-2xl ${theme === 'light' ? 'bg-white border-zinc-200' : 'bg-zinc-950 border-white/10'}`}
                >
                  {filteredEx.map(ex => (
                    <button
                      key={ex.id}
                      onClick={() => {
                        setModelItems([...modelItems, { exercise_name: ex.name, category: ex.category || '', day: 'Giorno A', sets: '', reps: '', weight: '', recovery: '', notes: '', pt_notes: '' }]);
                        setExerciseSearch('');
                      }}
                      className={`w-full text-left p-6 rounded-3xl flex items-center justify-between group transition-all ${theme === 'light' ? 'hover:bg-zinc-50' : 'hover:bg-white/5'}`}
                    >
                      <div>
                        <p className={`font-black text-2xl italic uppercase tracking-tighter transition-colors ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>{ex.name}</p>
                        <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">{ex.category}</p>
                      </div>
                      <Plus className="w-8 h-8 text-accent opacity-0 group-hover:opacity-100 transition-all" />
                    </button>
                  ))}
                  {filteredEx.length === 0 && <p className="text-center py-8 text-zinc-500 font-bold uppercase tracking-widest text-xs">Nessun esercizio trovato</p>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-12">
            {modelItems.length === 0 && (
              <div className={`text-center py-24 border-2 border-dashed rounded-[4rem] ${theme === 'light' ? 'border-zinc-200 bg-zinc-50/50' : 'border-white/5 bg-zinc-900/20'}`}>
                <ClipboardList className="w-20 h-20 mx-auto mb-6 opacity-5" />
                <p className={`text-2xl font-black uppercase tracking-widest opacity-20 italic ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-600'}`}>Cerca e aggiungi esercizi</p>
              </div>
            )}
            {(Object.entries(
              modelItems.reduce((acc, item, idx) => {
                const day = item.day || 'Giorno A';
                if (!acc[day]) acc[day] = [];
                acc[day].push({ ...item, originalIndex: idx });
                return acc;
              }, {} as Record<string, (PlanItem & { originalIndex: number })[]>)
            ) as [string, (PlanItem & { originalIndex: number })[]][]).sort().map(([day, items]) => {
              const isExpanded = expandedDays.includes(day);
              return (
                <div key={day} className="space-y-8">
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => setExpandedDays(isExpanded ? expandedDays.filter(d => d !== day) : [...expandedDays, day])}
                      className="flex items-center gap-4 group"
                    >
                      <h3 className="text-3xl font-display font-black italic uppercase tracking-tighter text-accent">{day}</h3>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform ${isExpanded ? 'rotate-90' : ''} ${theme === 'light' ? 'bg-zinc-100' : 'bg-white/5'}`}>
                        <ChevronRight className="w-5 h-5 text-accent" />
                      </div>
                    </button>
                    <div className={`h-px flex-1 ${theme === 'light' ? 'bg-zinc-100' : 'bg-white/5'}`} />
                  </div>

                  {isExpanded && (
                    <div className="grid gap-6">
                      {items.map((item) => (
                        <div key={item.originalIndex} className={`glass p-8 rounded-[3rem] border flex flex-col gap-8 relative group transition-all ${theme === 'light' ? 'bg-white border-zinc-100' : 'bg-zinc-900/40 border-white/5'}`}>
                          <div className="flex justify-between items-start">
                            <div className="md:col-span-2">
                              <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em] block mb-2">{item.category}</span>
                              <p className={`text-3xl font-display font-black italic uppercase ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>{item.exercise_name}</p>
                            </div>
                            <button onClick={() => setModelItems(modelItems.filter((_, i) => i !== item.originalIndex))} className={`p-4 rounded-2xl transition-all ${theme === 'light' ? 'text-red-400 hover:bg-red-50' : 'text-red-500 hover:bg-red-500/10'}`}>
                              <Trash2 className="w-6 h-6" />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                            <div className="md:col-span-1">
                              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Giorno</label>
                              <select 
                                className={`input-field py-4 rounded-2xl font-black text-accent border transition-all ${theme === 'light' ? 'bg-zinc-50 border-zinc-200' : 'bg-black/40 border-white/5'}`}
                                value={item.day}
                                onChange={e => {
                                  const updated = [...modelItems];
                                  updated[item.originalIndex].day = e.target.value;
                                  setModelItems(updated);
                                }}
                              >
                                <option value="Giorno A">Giorno A</option>
                                <option value="Giorno B">Giorno B</option>
                                <option value="Giorno C">Giorno C</option>
                                <option value="Giorno D">Giorno D</option>
                              </select>
                            </div>

                            <div className="md:col-span-2 flex gap-2">
                              <div className="flex-1 min-w-0">
                                <label className="text-[10px] font-black text-zinc-500 uppercase mb-2 block ml-1">Set</label>
                                <input 
                                  placeholder="3"
                                  className={`input-field text-center font-black text-xl py-4 px-2 border transition-all ${theme === 'light' ? 'bg-zinc-50 border-zinc-200' : 'bg-black/40 border-white/5'}`} 
                                  value={item.sets} 
                                  onChange={e => { const updated = [...modelItems]; updated[item.originalIndex].sets = e.target.value; setModelItems(updated); }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <label className="text-[10px] font-black text-zinc-500 uppercase mb-2 block ml-1">Rip</label>
                                <input
                                  placeholder="12"
                                  className={`input-field text-center font-black text-xl py-4 px-2 border transition-all ${theme === 'light' ? 'bg-zinc-50 border-zinc-200' : 'bg-black/40 border-white/5'}`}
                                  value={item.reps}
                                  onChange={e => { const updated = [...modelItems]; updated[item.originalIndex].reps = e.target.value; setModelItems(updated); }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <label className="text-[10px] font-black text-zinc-500 uppercase mb-2 block ml-1">Kg</label>
                                <input
                                  placeholder="20"
                                  className={`input-field text-center font-black text-xl py-4 px-2 border transition-all ${theme === 'light' ? 'bg-zinc-50 border-zinc-200' : 'bg-black/40 border-white/5'}`}
                                  value={item.weight || ''}
                                  onChange={e => { const updated = [...modelItems]; updated[item.originalIndex].weight = e.target.value; setModelItems(updated); }}
                                />
                              </div>
                            </div>

                            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-[10px] font-black text-zinc-500 uppercase mb-2 block ml-1">Recupero</label>
                                <input 
                                  placeholder="Es. 90''" 
                                  className={`input-field py-4 font-bold text-accent border transition-all ${theme === 'light' ? 'bg-zinc-50 border-zinc-200' : 'bg-black/40 border-white/5'}`}
                                  value={item.recovery || ''}
                                  onChange={e => {
                                    const updated = [...modelItems];
                                    updated[item.originalIndex].recovery = e.target.value;
                                    setModelItems(updated);
                                  }}
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-black text-zinc-500 uppercase mb-2 block ml-1">Note Tecniche</label>
                                <input 
                                  placeholder="Es. focus eccentrica..." 
                                  className={`input-field py-4 border italic font-bold transition-all ${theme === 'light' ? 'bg-zinc-50 border-zinc-200 text-zinc-600' : 'bg-black/40 border-white/5 text-zinc-300'}`} 
                                  value={item.pt_notes} 
                                  onChange={e => { const updated = [...modelItems]; updated[item.originalIndex].pt_notes = e.target.value; setModelItems(updated); }} 
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase mb-2 block ml-1">Altre Note</label>
                                <textarea 
                                  placeholder="Altre informazioni utili..." 
                                  className={`input-field py-3 min-h-[60px] text-xs border transition-all ${theme === 'light' ? 'bg-zinc-50 border-zinc-200 text-zinc-600' : 'bg-black/40 border-white/5 text-zinc-300'}`}
                                  value={item.notes || ''}
                                  onChange={e => {
                                    const updated = [...modelItems];
                                    updated[item.originalIndex].notes = e.target.value;
                                    setModelItems(updated);
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (viewingModel) {
    return (
      <div className="space-y-12">
        <div className="flex justify-between items-center">
          <button onClick={() => setViewingModel(null)} className="flex items-center gap-2 text-accent font-black uppercase tracking-widest text-xs">
            <ArrowLeft className="w-5 h-5" /> Torna ai Modelli
          </button>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Modalità Visualizzazione</span>
            <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
          </div>
        </div>
        <div className={`p-12 rounded-[4rem] border ${theme === 'light' ? 'bg-white border-zinc-200 shadow-2xl' : 'glass border-accent/20'}`}>
          <div className={`mb-12 border-b pb-10 ${theme === 'light' ? 'border-zinc-100' : 'border-white/10'}`}>
            <h2 className={`text-6xl font-display font-black italic uppercase tracking-tighter mb-4 ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>{viewingModel.name}</h2>
            <p className="text-zinc-400 font-bold text-xl italic max-w-2xl leading-relaxed">{viewingModel.description || 'Nessuna descrizione'}</p>
          </div>
          <div className="space-y-12">
            {(Object.entries((viewingModel.items || []).reduce((acc: any, item: any) => {
              const day = item.day || 'Giorno A';
              if (!acc[day]) acc[day] = [];
              acc[day].push(item);
              return acc;
            }, {} as any)) as [string, any[]][]).sort().map(([day, items]) => (
              <div key={day} className="space-y-10">
                <div className="flex items-center gap-6">
                  <h3 className="text-4xl font-display font-black italic uppercase text-accent tracking-tighter">{day}</h3>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                <div className="grid gap-6">
                  {items.map((item, i) => (
                    <div key={i} className={`p-8 rounded-[3rem] border flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${theme === 'light' ? 'bg-zinc-50 border-zinc-100' : 'glass border-white/5'}`}>
                      <div>
                        <span className="text-[10px] font-black text-accent uppercase tracking-widest block mb-1">{item.category}</span>
                        <h4 className={`text-3xl font-display font-black italic uppercase ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>{item.exercise_name}</h4>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-3xl font-black italic text-accent">{formatExerciseLoad(item)}</span>
                        <span className="text-xs font-bold text-zinc-500 italic mt-1">{item.pt_notes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h2 className={`text-4xl sm:text-6xl font-display font-black italic uppercase tracking-tighter leading-none mb-3 ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>Modelli Master</h2>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Libreria Schede Riutilizzabili</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)} 
          className="bg-blue-600 text-white px-6 sm:px-10 py-3 sm:py-5 rounded-2xl sm:rounded-[2rem] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 flex items-center gap-3"
          title="Crea Nuovo Modello"
        >
          <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="hidden sm:inline">Crea Nuovo Modello</span>
        </button>
      </div>
      <div className="relative">
        <input 
          className={`input-field py-8 text-xl font-bold rounded-[2.5rem] transition-all ${theme === 'light' ? 'bg-white border-zinc-200' : 'bg-zinc-900/50 border-white/5 focus:bg-zinc-900'}`} 
          placeholder="Cerca modello per nome, descrizione, keyword..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredModels.map(m => (
          <motion.div 
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass p-6 rounded-[2.5rem] border relative group transition-all duration-500 hover:shadow-2xl ${theme === 'light' ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-white/5 hover:border-accent/20'}`}
          >
            <div className="mb-6">
              <h3 className="text-2xl font-display font-black italic uppercase tracking-tighter text-blue-500 leading-none mb-2 group-hover:text-accent transition-colors">{m.name}</h3>
              <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-3 h-3"/> {new Date(m.created_at).toLocaleDateString()}
              </p>
            </div>
            <p className="text-zinc-500 font-bold italic text-sm leading-relaxed line-clamp-2 mb-8">{m.description || 'Nessuna descrizione specificata per questo modello master.'}</p>
            <div className="flex justify-between items-center pt-5 border-t border-white/5">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsCreating(m)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg ${theme === 'light' ? 'bg-zinc-100 text-zinc-900 hover:bg-accent hover:text-black' : 'bg-zinc-800 text-accent hover:bg-accent hover:text-black'}`}
                  title="Modifica Modello"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setViewingModel(m)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg ${theme === 'light' ? 'bg-zinc-100 text-zinc-900 hover:bg-accent hover:text-black' : 'bg-zinc-800 text-accent hover:bg-accent hover:text-black'}`}
                  title="Visualizza Modello"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDelete(m.id); }} 
                className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                title="Elimina Modello"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute top-4 right-4 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <span className="text-[8px] font-black text-blue-500 uppercase">Master</span>
            </div>
          </motion.div>
        ))}
        {filteredModels.length === 0 && <div className="col-span-full text-zinc-500 font-bold uppercase tracking-widest text-xs text-center py-32 border-2 border-dashed border-white/5 rounded-[4rem]">Nessun modello trovato nella libreria</div>}
      </div>
    </div>
  );
};

const LoadModelView = ({ models, onSelect, onBack, theme }: { models: ModelPlan[], onSelect: (items: PlanItem[]) => void, onBack: () => void, theme?: 'dark' | 'light' }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredModels = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return models.filter(m => 
      m.name.toLowerCase().includes(s) || 
      (m.description || '').toLowerCase().includes(s)
    );
  }, [models, searchTerm]);

  const handleSelect = async (modelId: number) => {
    const res = await fetch(`/api/models/${modelId}/items`);
    const items = await res.json();
    onSelect(Array.isArray(items) ? items : []);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <button onClick={onBack} className={`w-14 h-14 flex items-center justify-center rounded-2xl hover:shadow-lg transition-all border ${theme === 'light' ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-white/10 text-white'}`}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className={`text-3xl font-display font-black italic uppercase tracking-tighter ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>Carica Modello</h2>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Importa un modello nella scheda corrente</p>
        </div>
      </div>
      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-400" />
        <input 
          className={`input-field pl-16 py-6 border transition-all ${theme === 'light' ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-black/40 border-white/5 text-white'}`} 
          placeholder="Cerca modello da caricare (nome, descrizione)..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
        />
      </div>
      <div className="grid gap-4">
        {filteredModels.map(m => (
          <button 
            key={m.id} 
            onClick={() => handleSelect(m.id)} 
            className={`text-left glass p-6 rounded-[2rem] border shadow-sm hover:shadow-xl hover:border-blue-500 transition-all group ${theme === 'light' ? 'bg-white border-zinc-100' : 'bg-zinc-900/40 border-white/5'}`}
          >
            <h3 className="text-2xl font-black italic uppercase tracking-tighter group-hover:text-blue-600 transition-colors">{m.name}</h3>
            <p className="text-zinc-500 mt-2 italic font-medium">{m.description || 'Nessuna descrizione'}</p>
          </button>
        ))}
        {filteredModels.length === 0 && <div className={`text-zinc-500 font-bold uppercase tracking-widest text-xs text-center py-20 border-2 border-dashed rounded-[3rem] ${theme === 'light' ? 'border-zinc-200 bg-zinc-50/30' : 'border-white/5 bg-zinc-900/20'}`}>Nessun modello trovato</div>}
      </div>
    </div>
  );
};

const PlanHistory = ({ userId, clientName, onLoadPlan, onBack, theme }: { userId: number, clientName: string, onLoadPlan: (items: PlanItem[]) => void, onBack: () => void, theme?: 'dark' | 'light' }) => {
  const [history, setHistory] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = () => {
    fetch(`/api/plans/${userId}/history`)
      .then(res => res.json())
      .then(data => {
        setHistory(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  const handleDeletePlan = async (planId: number) => {
    if (!confirm('Eliminare definitivamente questa scheda dallo storico?')) return;
    await fetch(`/api/plans/${planId}`, { method: 'DELETE' });
    fetchHistory();
  };

  if (loading) return <div className="text-center py-12">Caricamento storico...</div>;

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-6">
        <button onClick={onBack} className={`w-14 h-14 flex items-center justify-center border rounded-2xl hover:shadow-lg transition-all ${theme === 'light' ? 'bg-white border-zinc-200 shadow-zinc-200' : 'bg-zinc-900 border-white/10 shadow-accent/20'}`}>
          <ArrowLeft className="w-6 h-6 text-accent" />
        </button>
        <div>
          <h2 className={`text-3xl font-display font-black italic uppercase tracking-tighter ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>Storico Schede: {clientName}</h2>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Gestisci le programmazioni passate</p>
        </div>
      </div>

      {history.length === 0 ? (
        <p className={`font-medium ${theme === 'light' ? 'text-zinc-500' : 'text-zinc-400'}`}>Nessuna scheda precedente trovata.</p>
      ) : (
        <div className="space-y-20">
          {history.map((plan) => {
            const grouped = plan.items.reduce((acc, item) => {
              const day = item.day || 'Giorno A';
              if (!acc[day]) acc[day] = [];
              acc[day].push(item);
              return acc;
            }, {} as Record<string, PlanItem[]>);

            return (
              <div key={plan.id} className={`p-10 rounded-[3rem] border shadow-xl relative group ${theme === 'light' ? 'bg-white border-zinc-100' : 'bg-zinc-900 border-white/10'}`}>
                <div className="absolute top-0 right-10 -translate-y-1/2 flex gap-2">
                  <div className="bg-zinc-900 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                    {new Date(plan.created_at).toLocaleDateString()}
                  </div>
                  <button 
                    onClick={() => onLoadPlan(plan.items)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
                    title="Carica nell'editor per modificare"
                  >
                    <Edit3 className="w-3 h-3" /> Carica
                  </button>
                  <button 
                    onClick={() => handleDeletePlan(plan.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 flex items-center gap-2"
                  >
                    <Trash2 className="w-3 h-3" /> Elimina
                  </button>
                </div>
                <div className="space-y-10">
                  {(Object.entries(grouped) as [string, PlanItem[]][]).sort().map(([day, items]) => (
                    <div key={day} className="space-y-4">
                      <h4 className="text-xl font-display font-black italic uppercase tracking-tighter text-blue-600">{day}</h4>
                      <div className="grid gap-4">
                        {items.map((item, i) => (
                          <div key={i} className={`flex flex-col gap-1 p-4 rounded-2xl border ${theme === 'light' ? 'bg-zinc-50/50 border-zinc-100' : 'bg-black/40 border-white/5'}`}>
                            <div className="flex items-center justify-between">
                              <p className={`font-medium ${theme === 'light' ? 'text-zinc-900' : 'text-zinc-300'}`}>
                                <strong className="uppercase italic tracking-tight">{item.exercise_name}</strong>: {formatExerciseLoad(item)}
                              </p>
                              {item.pt_notes && <span className="text-xs text-zinc-400 italic">Note PT: {item.pt_notes}</span>}
                            </div>
                            {item.user_notes && (
                              <div className={`mt-2 p-3 rounded-xl border ${theme === 'light' ? 'bg-blue-50 border-blue-100' : 'bg-blue-900/20 border-blue-500/20'}`}>
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Feedback Atleta:</p>
                                <p className={`text-xs italic ${theme === 'light' ? 'text-zinc-600' : 'text-zinc-400'}`}>"{item.user_notes}"</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const PlanPreview = ({ items, clientName, onBack, theme }: { items: PlanItem[], clientName: string, onBack: () => void, theme?: 'dark' | 'light' }) => {
  const grouped = useMemo(() => {
    return items.reduce((acc, item) => {
      const day = item.day || 'Giorno A';
      if (!acc[day]) acc[day] = [];
      acc[day].push(item);
      return acc;
    }, {} as Record<string, PlanItem[]>);
  }, [items]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("COACH BELLU - FITPLAN", 105, 20, { align: "center" });
    doc.setFontSize(14);
    doc.text(`Atleta: ${clientName}`, 105, 30, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Data: ${new Date().toLocaleDateString()}`, 105, 35, { align: "center" });

    let y = 50;
    const entries = Object.entries(grouped).sort() as [string, PlanItem[]][];
    entries.forEach(([day, dayItems]) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(0, 242, 255); // Electric Blue
      doc.text(day, 20, y);
      y += 10;
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      
      dayItems.forEach((item) => {
        const text = `- ${item.exercise_name}: ${formatExerciseLoad(item)} ${item.pt_notes ? `(${item.pt_notes})` : ''}`;
        const splitText = doc.splitTextToSize(text, 170);
        doc.text(splitText, 25, y);
        y += splitText.length * 7;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });
      y += 10;
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("NOTE:", 20, y);
    y += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("• 3 giorni x week A-B-C", 25, y); y += 7;
    doc.text("• La dicitura è serie x ripetizioni", 25, y); y += 7;
    doc.text("• Tempi di recupero circa 1:30", 25, y);

    doc.save(`Scheda_${clientName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className={`w-14 h-14 flex items-center justify-center border rounded-2xl hover:shadow-lg transition-all ${theme === 'light' ? 'bg-white border-zinc-200 shadow-zinc-200' : 'bg-zinc-900 border-white/10 shadow-accent/20'}`}>
            <ArrowLeft className="w-6 h-6 text-accent" />
          </button>
          <div>
            <h2 className={`text-4xl font-display font-black italic uppercase tracking-tighter leading-none mb-2 ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>Anteprima Atleta</h2>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Visualizzazione per: {clientName}</p>
          </div>
        </div>
        <button 
          onClick={downloadPDF}
          className="btn-primary px-8 py-4 flex items-center gap-2"
        >
          <Download className="w-5 h-5" /> Scarica PDF
        </button>
      </div>
      
      <div className={`p-12 rounded-[3rem] border shadow-2xl space-y-12 ${theme === 'light' ? 'bg-white border-zinc-100' : 'bg-zinc-900 border-white/10'}`}>
        <div className={`flex justify-between items-start border-b pb-10 ${theme === 'light' ? 'border-zinc-100' : 'border-white/5'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden ${theme === 'light' ? 'bg-zinc-900' : 'bg-zinc-800'}`}>
              <img 
                src="https://i.imgur.com/Qbox1fT.jpeg" 
                alt="Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className={`text-2xl font-display font-black italic uppercase tracking-tighter leading-none ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>Pietro Cassago</h3>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Personal Trainer</p>
            </div>
          </div>
          <div className="text-right text-[10px] font-bold text-zinc-400 uppercase tracking-widest space-y-1">
            <p>mail: pietrocassagopt@gmail.com</p>
            <p>tel: 3403745135</p>
          </div>
        </div>

        <div className="space-y-12">
          {(Object.entries(grouped) as [string, PlanItem[]][]).sort().map(([day, dayItems]) => (
            <div key={day} className="space-y-6">
              <h4 className={`text-3xl font-display font-black italic uppercase tracking-tighter border-l-4 border-blue-600 pl-4 ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>{day}</h4>
              <ul className="space-y-4 ml-8">
                {dayItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-lg font-medium">
                    <span className="text-blue-600 font-black mt-1">•</span>
                    <span>
                      <strong className={`uppercase italic tracking-tight ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>{item.exercise_name}</strong>
                      <span className={`ml-2 ${theme === 'light' ? 'text-zinc-700' : 'text-zinc-400'}`}>{formatExerciseLoad(item)}</span>
                      {item.pt_notes && <span className="text-zinc-400 italic ml-2">({item.pt_notes})</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={`pt-10 border-t ${theme === 'light' ? 'border-zinc-100' : 'border-white/5'}`}>
          <h4 className={`text-xl font-display font-black italic uppercase tracking-tighter mb-6 ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>NOTA BENE:</h4>
          <ul className="space-y-3 text-sm font-medium text-zinc-500">
            <li className="flex gap-3"><span className="text-blue-600">•</span> 3 giorni x week A-B-C</li>
            <li className="flex gap-3"><span className="text-blue-600">•</span> La dicitura è serie x ripetizioni</li>
            <li className="flex gap-3"><span className="text-blue-600">•</span> Se non indicato diversamente i tempi di recupero sono circa 1:30</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const SettingsView = ({ user, onBack, theme, settings: initialSettings, updateSettings }: { user: User, onBack: () => void, theme: 'dark' | 'light', settings: any, updateSettings: (s: any) => void }) => {
  const [settings, setSettings] = useState<any>(initialSettings || {});
  const [notifSettings, setNotifSettings] = useState({
    notification_email: user.notification_email || user.email,
    email_notifications_enabled: user.email_notifications_enabled === 1
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const defaultSettings = {
    about_title: 'Pietro Cassago',
    about_subtitle: 'Performance Elite',
    about_description: "Coach Bellu. Specialista in Calisthenics, Strength & Conditioning. Trasformo atleti attraverso un approccio scientifico e una programmazione d'élite personalizzata.",
    about_specialty: 'Calisthenics',
    about_focus: 'Performance',
    about_standard: 'Elite',
    about_image: 'https://picsum.photos/seed/coachbellu/800/800',
    about_image_enabled: true,
    about_font_family: 'Inter',
    about_text_color_dark: '#ffffff',
    about_text_color_light: '#000000',
    about_accent_color: '#2350D1',
    about_title_size: '6rem',
    about_desc_size: '1.125rem',
    about_box_size: 220,
    about_box_width: 100,
    box1_enabled: false, box1_label: 'Specialty', box1_value: 'Calisthenics', box1_bg: '#2350D1', box1_color: '#ffffff',
    box2_enabled: false, box2_label: 'Focus', box2_value: 'Performance', box2_bg: '#2350D1', box2_color: '#ffffff',
    box3_enabled: false, box3_label: 'Quality', box3_value: 'Elite', box3_bg: '#2350D1', box3_color: '#ffffff',
  };

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    updateSettings(settings);

    await fetch(`/api/users/${user.id}/notifications`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notifSettings),
    });

    setSaving(false);
    
    // Check if anything actually changed
    const hasChanged = JSON.stringify(settings) !== JSON.stringify(initialSettings);
    if (hasChanged) {
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 3000);
    }
    
    // Update local state to reflect possible count changes
    updateSettings(settings);
  };

  const addBox = () => {
    // Find first available box index
    for (let i = 1; i <= 8; i++) {
      if (!settings[`box${i}_enabled`]) {
        setSettings({
          ...settings,
          [`box${i}_enabled`]: true,
          [`box${i}_label`]: 'Nuovo Box',
          [`box${i}_value`]: 'Valore',
          [`box${i}_bg`]: '#2350D1',
          [`box${i}_color`]: '#ffffff',
          [`box${i}_height`]: 220,
          [`box${i}_width`]: 300,
          [`box${i}_font_size`]: 30
        });
        break;
      }
    }
  };

  const deleteBox = (i: number) => {
    if (!confirm(`Sei sicuro di voler eliminare il Box ${i}?`)) return;
    setSettings({
      ...settings,
      [`box${i}_enabled`]: false
    });
  };

  const handleReset = () => {
    if (confirm('Ripristinare le impostazioni predefinite?')) {
      const hasChanged = JSON.stringify(defaultSettings) !== JSON.stringify(settings);
      setSettings(defaultSettings);
      if (hasChanged) {
        setSuccessMessage(true);
        setTimeout(() => setSuccessMessage(false), 3000);
      }
    }
  };

  if (loading) return <div className="text-center py-12 text-zinc-500">Caricamento...</div>;

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-6">
        <button onClick={onBack} className={`w-14 h-14 flex items-center justify-center border rounded-2xl hover:shadow-lg transition-all ${theme === 'dark' ? 'bg-zinc-900 border-white/10' : 'bg-white border-zinc-200'}`}>
          <ArrowLeft className="w-6 h-6 text-accent" />
        </button>
        <div>
          <h2 className={`text-4xl font-display font-black italic uppercase tracking-tighter leading-none mb-2 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Impostazioni Sito</h2>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Personalizza la tua pagina "Chi Sono"</p>
        </div>
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-green-500 text-white px-8 py-4 rounded-[2rem] text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-2xl shadow-green-500/40 flex items-center gap-3 border border-white/20"
          >
            <CheckCircle2 className="w-5 h-5" /> Modifiche salvate
          </motion.div>
        )}
      </div>

      <form onSubmit={handleSave} className="glass p-10 rounded-[3rem] space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block ml-1">Titolo (Nome)</label>
              <input 
                className={`input-field ${theme === 'light' ? 'bg-white border-zinc-200 text-zinc-900' : ''}`} 
                value={settings.about_title || ''} 
                onChange={e => setSettings({...settings, about_title: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block ml-1">Sottotitolo</label>
              <input 
                className={`input-field ${theme === 'light' ? 'bg-white border-zinc-200 text-zinc-900' : ''}`} 
                value={settings.about_subtitle || ''} 
                onChange={e => setSettings({...settings, about_subtitle: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block ml-1">URL Immagine Profilo</label>
              <input 
                className={`input-field ${theme === 'light' ? 'bg-white border-zinc-200 text-zinc-900' : ''}`} 
                value={settings.about_image || ''} 
                onChange={e => setSettings({...settings, about_image: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block ml-1">Descrizione Bio</label>
              <textarea 
                className={`input-field min-h-[120px] py-4 ${theme === 'light' ? 'bg-white border-zinc-200 text-zinc-900' : ''}`} 
                value={settings.about_description || ''} 
                onChange={e => setSettings({...settings, about_description: e.target.value})}
              />
            </div>
            <div className="flex items-center gap-4 py-6 px-8 rounded-3xl bg-accent/5 border border-accent/20">
              <input 
                type="checkbox" 
                checked={String(settings.about_image_enabled) === 'true'}
                onChange={e => setSettings({...settings, about_image_enabled: e.target.checked})}
                className="w-6 h-6 rounded-xl appearance-none border-2 border-accent/20 checked:bg-accent checked:border-accent transition-all cursor-pointer relative after:content-[''] after:absolute after:inset-0 after:flex after:items-center after:justify-center after:text-black after:font-black after:text-[10px] after:checked:content-['✓']"
              />
              <label className={`text-[10px] font-black uppercase tracking-widest ${theme === 'light' ? 'text-zinc-900' : 'text-zinc-400'}`}>Abilita Immagine Profilo</label>
            </div>
          </div>
        </div>

        {/* Global Styles */}
        <div className="pt-10 border-t border-white/5 space-y-10">
          <h3 className={`text-2xl font-display font-black italic uppercase tracking-tighter ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>Dimensioni e Stile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block ml-1">Altezza Box (px)</label>
              <input 
                type="range" min="100" max="600" step="10"
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-accent"
                value={settings.about_box_size || 220}
                onChange={e => setSettings({...settings, about_box_size: parseInt(e.target.value)})}
              />
              <span className="text-[10px] font-bold text-accent mt-2 block ml-1">{settings.about_box_size || 220}px</span>
            </div>
          </div>
        </div>

        {/* Detailing Boxes Customization */}
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-2xl font-display font-black italic uppercase tracking-tighter ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>Box Informativi</h3>
            <button 
              type="button"
              onClick={addBox}
              className="px-6 py-3 bg-accent text-black rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all shadow-lg shadow-accent/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Aggiungi Box
            </button>
          </div>
          
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => {
            if (!settings[`box${i}_enabled`]) return null;
            return (
              <div key={i} className={`p-8 rounded-3xl border transition-all border-accent/30 bg-accent/5`}>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black bg-accent text-black">
                      {i}
                    </div>
                    <h4 className={`text-lg font-black uppercase tracking-widest ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>Box {i}</h4>
                  </div>
                  <button 
                    type="button"
                    onClick={() => deleteBox(i)}
                    className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                    title="Elimina Box"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block ml-1">Etichetta (es. Specialty)</label>
                    <input className="input-field" value={settings[`box${i}_label`] || ''} onChange={e => setSettings({...settings, [`box${i}_label`]: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block ml-1">Valore (es. Calisthenics)</label>
                    <input className="input-field" value={settings[`box${i}_value`] || ''} onChange={e => setSettings({...settings, [`box${i}_value`]: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block ml-1">Altezza (px)</label>
                      <input type="number" className="input-field" value={settings[`box${i}_height`] || 220} onChange={e => setSettings({...settings, [`box${i}_height`]: parseInt(e.target.value)})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block ml-1">Larghezza (px)</label>
                      <input type="number" className="input-field" value={settings[`box${i}_width`] || 300} onChange={e => setSettings({...settings, [`box${i}_width`]: parseInt(e.target.value)})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block ml-1">Testo (px)</label>
                      <input type="number" className="input-field" value={settings[`box${i}_font_size`] || 30} onChange={e => setSettings({...settings, [`box${i}_font_size`]: parseInt(e.target.value)})} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block ml-1">Colore Sfondo</label>
                    <input type="color" className="w-full h-12 rounded-xl bg-zinc-900 border border-white/10" value={settings[`box${i}_bg`] || '#2350D1'} onChange={e => setSettings({...settings, [`box${i}_bg`]: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block ml-1">Colore Testo</label>
                    <input type="color" className="w-full h-12 rounded-xl bg-zinc-900 border border-white/10" value={settings[`box${i}_color`] || '#ffffff'} onChange={e => setSettings({...settings, [`box${i}_color`]: e.target.value})} />
                  </div>
                </div>
              </div>
            );
          })}

        <div className="pt-10 border-t border-white/5 space-y-8">
          <h3 className="text-2xl font-display font-black italic uppercase tracking-tighter text-white">Stile & Tipografia</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block ml-1">Font Family</label>
              <select 
                className="input-field"
                value={settings.about_font_family || 'Inter'}
                onChange={e => setSettings({...settings, about_font_family: e.target.value})}
              >
                <option value="Inter">Inter (Sans)</option>
                <option value="Outfit">Outfit (Display)</option>
                <option value="Roboto Mono">Roboto Mono (Monospace)</option>
                <option value="Montserrat">Montserrat</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block ml-1">Testo Dark Mode</label>
              <input 
                type="color" 
                className="w-full h-12 rounded-xl bg-zinc-900 border border-white/10"
                value={settings.about_text_color_dark || '#ffffff'}
                onChange={e => setSettings({...settings, about_text_color_dark: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block ml-1">Testo Light Mode</label>
              <input 
                type="color" 
                className="w-full h-12 rounded-xl bg-zinc-900 border border-white/10"
                value={settings.about_text_color_light || '#000000'}
                onChange={e => setSettings({...settings, about_text_color_light: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block ml-1">Dim. Titolo</label>
              <input 
                className="input-field"
                value={settings.about_title_size || '6rem'}
                onChange={e => setSettings({...settings, about_title_size: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block ml-1">Dim. Bio</label>
              <input 
                className="input-field"
                value={settings.about_desc_size || '1.125rem'}
                onChange={e => setSettings({...settings, about_desc_size: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 space-y-8">
          <h3 className="text-2xl font-display font-black italic uppercase tracking-tighter text-white">Notifiche Email</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block ml-1">Email per Notifiche</label>
              <input 
                className="input-field" 
                value={notifSettings.notification_email} 
                onChange={e => setNotifSettings({...notifSettings, notification_email: e.target.value})}
              />
            </div>
            <div className="flex items-center gap-4">
              <button 
                type="button"
                onClick={() => setNotifSettings({...notifSettings, email_notifications_enabled: !notifSettings.email_notifications_enabled})}
                className={`w-14 h-8 rounded-full transition-all relative ${notifSettings.email_notifications_enabled ? 'bg-accent' : 'bg-zinc-800'}`}
              >
                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${notifSettings.email_notifications_enabled ? 'right-1' : 'left-1'}`} />
              </button>
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                {notifSettings.email_notifications_enabled ? 'Notifiche Attive' : 'Notifiche Disattivate'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-white/5">
          <button 
            type="button"
            onClick={handleReset}
            className="text-zinc-500 hover:text-red-400 font-bold uppercase tracking-widest text-xs transition-colors"
          >
            Ripristina Predefiniti
          </button>
          <button 
            type="submit" 
            disabled={saving}
            className="btn-primary"
          >
            {saving ? 'Salvataggio...' : 'Salva Modifiche'}
          </button>
        </div>
      </form>
    </div>
  );
};

const PTHome = ({ user, theme, onAthleteClick, onNotificationsClick }: { user: User, theme: 'dark' | 'light', onAthleteClick: (client: User) => void, onNotificationsClick: () => void }) => {
  const [view, setView] = useState<'home' | 'chat'>('home');
  const [chatUser, setChatUser] = useState<User | null>(null);
  const [clients, setClients] = useState<User[]>([]);

  useEffect(() => {
    fetch('/api/users').then(res => res.json()).then(data => setClients(Array.isArray(data) ? data : []));
  }, []);

  if (view === 'chat' && chatUser) {
    return <Chat currentUser={user} otherUser={chatUser} onBack={() => setView('home')} theme={theme} />;
  }

  const expiringAthletes = clients
    .filter(c => {
      const daysLeft = getDaysRemaining(c.contract_end);
      return daysLeft !== null && daysLeft <= 7;
    })
    .sort((a, b) => (getDaysRemaining(a.contract_end) ?? 999) - (getDaysRemaining(b.contract_end) ?? 999));

  const recentAthletes = [...clients]
    .sort((a, b) => {
      // Use created_at if available or ID
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA || b.id - a.id;
    })
    .slice(0, 5);

  return (
    <div className={`max-w-6xl mx-auto space-y-12 transition-all duration-500`}>
      <div className="flex flex-col md:flex-row justify-end items-start md:items-center gap-6">
        {/* COACH HOME and Benvenuto removed */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-3 space-y-10">
          <section className="space-y-6">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-3">
              <TrendingUp className="w-4 h-4" /> Ultimi Atleti Inseriti
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentAthletes.map(athlete => {
                const joinedDate = athlete.contract_start ? new Date(athlete.contract_start).toLocaleDateString() : 'N/D';
                return (
                  <button 
                    key={athlete.id} 
                    onClick={() => onAthleteClick(athlete)}
                    className={`w-full text-left glass p-6 rounded-[2.5rem] flex items-center justify-between group hover:shadow-2xl transition-all border-white/5 ${theme === 'light' ? 'bg-white border-zinc-200 hover:shadow-zinc-200' : ''}`}
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center font-black text-2xl italic shrink-0 ${theme === 'dark' ? 'bg-zinc-800 text-accent' : 'bg-zinc-100 text-zinc-900'}`}>
                        {athlete.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <h4 className={`text-xl font-display font-black italic uppercase tracking-tighter leading-none group-hover:text-accent transition-colors ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>{athlete.name}</h4>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-2">Inserito il {joinedDate}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-red-500" /> Contratti Scaduti / in Scadenza
            </h3>
            {expiringAthletes.length > 0 ? expiringAthletes.map(athlete => {
              const daysLeft = getDaysRemaining(athlete.contract_end);
              const label = daysLeft === null
                ? ''
                : daysLeft < 0
                  ? `Scaduto da ${Math.abs(daysLeft)} giorni`
                  : daysLeft === 0
                    ? 'Scade oggi'
                    : `Scade in ${daysLeft} giorni`;
              return (
                <div key={athlete.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 grow">
                  <div className="flex items-center gap-3">
                    <Clock className={`w-4 h-4 ${theme === 'dark' ? 'text-accent' : 'text-zinc-900'}`} />
                    <p className={`font-black uppercase tracking-widest text-[10px] ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{athlete.name}</p>
                  </div>
                  <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{label}</p>
                </div>
              );
            }) : (
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-[8px] italic">Nessun contratto in scadenza.</p>
              )}
          </section>
        </div>
      </div>
    </div>
  );
};


const PTDashboard = ({ pt, theme, clients, exercises, models, refreshClients, refreshExercises, refreshModels, selectedClient, setSelectedClient, initialView, onViewHandled, newMessagesCount, onRead }: { 
  pt: User, 
  theme: 'dark' | 'light', 
  clients: User[], 
  exercises: Exercise[], 
  models: ModelPlan[], 
  refreshClients: () => void, 
  refreshExercises: () => void, 
  refreshModels: () => void,
  selectedClient: User | null,
  setSelectedClient: (c: User | null) => void,
  initialView?: 'editor' | 'chat' | null,
  onViewHandled?: () => void,
  newMessagesCount?: number,
  onRead?: () => void
}) => {

  const [newPlanItems, setNewPlanItems] = useState<PlanItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [exercisePickerDay, setExercisePickerDay] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'editor' | 'library' | 'models' | 'history' | 'preview' | 'chat' | 'load_model' | 'bio'>('bio');
  const [editingAthlete, setEditingAthlete] = useState<User | null>(null);
  const [chatUser, setChatUser] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [athleteActionMenu, setAthleteActionMenu] = useState<User | null>(null);
  const infoRef = React.useRef<HTMLDivElement>(null);
  const exerciseSearchRef = React.useRef<HTMLInputElement>(null);
  const [lastScrollPos, setLastScrollPos] = useState(() => {
    const saved = sessionStorage.getItem('pt_athlete_list_scroll');
    return saved ? parseInt(saved) : 0;
  });

  // Handle athlete click
  const handleAthleteClick = (client: User) => {
    if (window.innerWidth < 1024) {
      sessionStorage.setItem('pt_athlete_list_scroll', window.scrollY.toString());
      setLastScrollPos(window.scrollY);
    }
    setSelectedClient(client);
    setView('bio');
  };

  // When going back from full info, we might want to restore scroll
  const handleBackFromInfo = () => {
    setSelectedClient(null);
    setView('bio'); // Reset view state internally if needed, but the main thing is clear selectedClient
    
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        window.scrollTo({ top: lastScrollPos, behavior: 'instant' });
      }, 50);
    }
  };

  useEffect(() => {
    if (!pt) return;
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.subView) {
        setView(event.state.subView);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [pt]);

  useEffect(() => {
    const currentState = window.history.state;
    if (currentState && currentState.subView !== view) {
      window.history.pushState({ ...currentState, subView: view }, '');
    }
  }, [view]);

  useEffect(() => {
    if (initialView && selectedClient) {
      if (initialView === 'chat') {
        setChatUser(selectedClient);
        setView('chat');
      } else {
        setView(initialView as any);
      }
      onViewHandled?.();
    }
  }, [initialView, selectedClient, onViewHandled]);

  const hasScrolledRef = React.useRef(false);

  useEffect(() => {
    if (selectedClient) {
      const el = document.getElementById(`athlete-${selectedClient.id}`);
      if (el) {
        // Find scrollable container and check layout
        const container = document.getElementById('athlete-list-container');
        if (container) {
          setTimeout(() => {
            el.scrollIntoView({ 
              behavior: hasScrolledRef.current ? 'smooth' : 'auto', 
              block: hasScrolledRef.current ? 'nearest' : 'center'
            });
            hasScrolledRef.current = true;
          }, 50);
        }
      }
    }
  }, [selectedClient, clients]);

  const [athleteSearch, setAthleteSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'experience' | 'age'>('all');
  const [filterValue, setFilterValue] = useState('');
  const [expandedDays, setExpandedDays] = useState<string[]>(['Giorno A']);

  const fetchUnread = () => {
    fetch(`/api/notifications/${pt.id}`)
      .then(res => res.json())
      .then(data => setUnreadCount(Array.isArray(data) ? data.length : 0));
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 5000);
    return () => clearInterval(interval);
  }, [pt.id]);

  const handleUpdateAthlete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAthlete) return;
    const res = await fetch(`/api/users/${editingAthlete.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: editingAthlete.name, 
        email: editingAthlete.email,
        bio: editingAthlete.bio,
        age: editingAthlete.age,
        experience_years: editingAthlete.experience_years,
        contract_start: editingAthlete.contract_start,
        contract_end: editingAthlete.contract_end
      }),
    });
    if (res.ok) {
      if (selectedClient?.id === editingAthlete.id) {
        setSelectedClient(editingAthlete);
      }
      setEditingAthlete(null);
      refreshClients();
    } else {
      alert('Errore durante il salvataggio');
    }
  };

  const handleDeleteAthlete = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare questo atleta e tutti i suoi dati?')) return;
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      alert('Errore durante l\'eliminazione dell\'atleta');
      return;
    }
    setAthleteActionMenu(null);
    if (selectedClient?.id === id) {
      setSelectedClient(null);
      setView('bio');
    }
    refreshClients();
  };

  const filteredExercises = useMemo(() => {
    if (!searchTerm.trim() && !exercisePickerDay) return [];
    if (!searchTerm.trim()) return exercises;
    return exercises.filter(ex =>
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ex.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ex.muscle_group || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, exercises, exercisePickerDay]);

  const filteredClients = useMemo(() => {
    let result = clients.filter(c => c.name.toLowerCase().includes(athleteSearch.toLowerCase()));
    if (filterType === 'experience' && filterValue) {
      result = result.filter(c => c.experience_years?.toString() === filterValue);
    } else if (filterType === 'age' && filterValue) {
      result = result.filter(c => c.age?.toString() === filterValue);
    }
    return result;
  }, [clients, athleteSearch, filterType, filterValue]);



  const addExercise = (ex: Exercise) => {
    setNewPlanItems([...newPlanItems, {
      exercise_name: ex.name,
      category: ex.category,
      day: exercisePickerDay || 'Giorno A',
      sets: '',
      reps: '',
      weight: '',
      recovery: '',
      notes: '',
      pt_notes: ''
    }]);
    setSearchTerm('');
    setExercisePickerDay(null);
  };

  const removeExercise = (index: number) => {
    setNewPlanItems(newPlanItems.filter((_, i) => i !== index));
  };

  const savePlan = async () => {
    if (!selectedClient) return;
    setLoading(true);
    try {
      await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedClient.id,
          ptId: pt.id,
          items: newPlanItems
        }),
      });
      alert('Scheda salvata con successo!');
      setNewPlanItems([]);
      setSelectedClient(null);
      setView('editor');
    } catch (err) {
      alert('Errore nel salvataggio');
    } finally {
      setLoading(false);
    }
  };

  if (view === 'chat' && chatUser) {
    return <Chat currentUser={pt} otherUser={chatUser} onBack={() => {
      if (window.innerWidth < 1024 && !selectedClient) {
        handleBackFromInfo();
      } else {
        setView('editor');
      }
    }} theme={theme} newMessagesCount={newMessagesCount} onRead={onRead} />;
  }

  if (view === 'library') {
    return (
      <div className="space-y-6 pb-40 overflow-y-auto h-full">
        <button onClick={handleBackFromInfo} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-bold uppercase tracking-widest text-xs">
          <ArrowLeft className="w-4 h-4" /> Torna alla Dashboard
        </button>
        <ExerciseLibrary exercises={exercises} onUpdate={refreshExercises} theme={theme} />
      </div>
    );
  }

  if (view === 'models') {
    return (
      <div className="space-y-6 pb-40 overflow-y-auto h-full">
        <button onClick={handleBackFromInfo} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-bold uppercase tracking-widest text-xs">
          <ArrowLeft className="w-4 h-4" /> Torna alla Dashboard
        </button>
        <ModelsLibrary models={models} exercises={exercises} onUpdate={refreshModels} theme={theme} />
      </div>
    );
  }

  if (view === 'history' && selectedClient) {
    return (
      <PlanHistory 
        userId={selectedClient.id} 
        clientName={selectedClient.name} 
        onLoadPlan={(items) => {
          setNewPlanItems(items.map(item => ({
            exercise_name: item.exercise_name,
            category: item.category,
            day: item.day,
            sets: item.sets,
            reps: item.reps,
            weight: item.weight || '',
            recovery: item.recovery || '',
            notes: item.notes || '',
            pt_notes: item.pt_notes || ''
          })));
          setView('editor');
        }}
        onBack={handleBackFromInfo} 
        theme={theme}
      />
    );
  }

  if (view === 'load_model') {
    return (
      <LoadModelView 
        models={models}
        onSelect={(items) => {
          // Add loaded items to current plan items
          const cleanedItems = items.map(item => ({
            exercise_name: item.exercise_name,
            category: item.category,
            day: item.day,
            sets: item.sets,
            reps: item.reps,
            weight: item.weight || '',
            recovery: item.recovery || '',
            notes: item.notes || '',
            pt_notes: item.pt_notes || ''
          }));
          setNewPlanItems([...newPlanItems, ...cleanedItems]);
          setView('editor');
        }}
        onBack={handleBackFromInfo}
      />
    );
  }

  if (view === 'preview' && selectedClient) {
    return <PlanPreview items={newPlanItems} clientName={selectedClient.name} onBack={handleBackFromInfo} theme={theme} />;
  }

  // Mobile Detail View was previously rendered conditionally, now handled by CSS

  return (
    <div className="flex items-stretch gap-8 lg:h-full flex-1 min-h-0">
      {/* Client List */}
      <div className={`w-full lg:w-1/3 flex flex-col lg:h-full ${selectedClient ? 'hidden lg:flex' : 'flex'}`}>
        <div className="flex-none space-y-6 mb-6">
          <div className="flex justify-between items-center">
            <h2 className={`text-xl font-display font-black italic uppercase tracking-tighter flex items-center gap-2 ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>
              <UserIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-accent' : 'text-zinc-900'}`} /> ATLETI: {clients.length}
            </h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setView('models')}
              className={`p-3 border rounded-2xl transition-all shadow-sm hover:shadow-lg ${theme === 'light' ? 'bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50' : 'bg-zinc-900 border-white/5 text-accent hover:bg-zinc-800'}`}
              title="Gestisci Modelli"
            >
              <ClipboardList className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setView('library')}
              className={`p-3 border rounded-2xl transition-all shadow-sm hover:shadow-lg ${theme === 'light' ? 'bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50' : 'bg-zinc-900 border-white/5 text-accent hover:bg-zinc-800'}`}
              title="Gestisci Libreria"
            >
              <Dumbbell className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Athlete Search & Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              className={`w-full py-3 pl-14 pr-4 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all ${theme === 'dark' ? 'bg-zinc-900 border-white/5 text-white' : 'bg-white border-zinc-200 text-zinc-900'}`}
              placeholder="Cerca Atleta..."
              value={athleteSearch}
              onChange={e => setAthleteSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${theme === 'dark' ? 'bg-zinc-900 border-white/5 text-accent' : 'bg-white border-zinc-200 text-accent'}`}
              value={filterType}
              onChange={e => { setFilterType(e.target.value as any); setFilterValue(''); }}
            >
              <option value="all">Tutti</option>
              <option value="experience">Esperienza (Anni)</option>
              <option value="age">Età</option>
            </select>
            {filterType !== 'all' && (
              <input 
                type="number"
                className={`w-20 py-3 px-4 rounded-xl text-[10px] font-bold border transition-all ${theme === 'dark' ? 'bg-zinc-900 border-white/5 text-white' : 'bg-white border-zinc-200 text-zinc-900'}`}
                placeholder="Val..."
                value={filterValue}
                onChange={e => setFilterValue(e.target.value)}
              />
            )}
          </div>
        </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2 pb-24 lg:pb-0 scroll-smooth space-y-4 scrollbar-hide" id="athlete-list-container">
          {filteredClients.map(client => {
            const daysLeft = getDaysRemaining(client.contract_end);
            return (
              <div key={client.id} id={`athlete-${client.id}`} className="relative group pt-athlete-box">
                <div
                  onClick={() => handleAthleteClick(client)}
                  className={`w-full athlete-box flex items-center justify-between group border-2 transition-all duration-300 cursor-pointer p-4 sm:p-8 ${
                    selectedClient?.id === client.id 
                      ? (theme === 'dark' ? 'bg-accent text-white border-accent shadow-2xl shadow-accent/40 scale-[1.02]' : 'bg-white border-zinc-900 shadow-xl scale-[1.02]') 
                      : (theme === 'dark' ? 'border-transparent bg-zinc-900/40 opacity-70 hover:opacity-100' : 'border-transparent bg-white shadow-sm hover:shadow-md')
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="relative shrink-0">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-black text-lg sm:text-xl transition-colors duration-500 ${
                        theme === 'dark' 
                          ? (selectedClient?.id === client.id ? 'bg-white text-accent shadow-xl' : 'bg-zinc-800 text-accent') 
                          : (selectedClient?.id === client.id ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-900')
                      }`}>
                        {client.name.charAt(0)}
                      </div>
                      {daysLeft !== null && (
                        <div className={`absolute -top-2 -right-2 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg text-[7px] sm:text-[8px] font-black uppercase tracking-tighter shadow-md ${
                          daysLeft <= 7 ? 'bg-red-500 text-white animate-pulse' : (theme === 'dark' ? 'bg-zinc-900 text-accent' : 'bg-white text-zinc-900 border border-zinc-200')
                        }`}>
                          {daysLeft < 0 ? 'scad.' : `${daysLeft}g`}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className={`font-black text-lg sm:text-xl italic uppercase tracking-tighter truncate transition-colors duration-500 ${
                        theme === 'dark' ? 'text-white' : 'text-zinc-900'
                      }`}>{client.name}</p>
                      <div className="flex flex-col gap-0.5">
                        <p className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest truncate transition-colors duration-500 ${
                          theme === 'dark' ? (selectedClient?.id === client.id ? 'text-white/60' : 'text-zinc-500') : 'text-zinc-500'
                        }`}>
                          {client.email}
                        </p>
                        <div className={`flex items-center gap-1 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${
                          theme === 'dark' ? (selectedClient?.id === client.id ? 'text-white/80' : 'text-accent') : 'text-zinc-900'
                        }`}>
                          {client.age && <span>{client.age} anni</span>}
                          {client.age && client.experience_years && <span className="mx-1">•</span>}
                          {client.experience_years && <span>{client.experience_years} anni exp</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    {/* Desktop Actions */}
                    <div className="hidden sm:flex items-center gap-1 sm:gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setChatUser(client); setView('chat'); }}
                        className={`p-2.5 rounded-xl transition-all ${
                          theme === 'dark'
                            ? (selectedClient?.id === client.id ? 'text-white hover:bg-black/10' : 'text-zinc-500 hover:text-accent hover:bg-accent/5')
                            : (selectedClient?.id === client.id ? 'text-zinc-900 hover:bg-zinc-100' : 'text-zinc-500 hover:text-accent hover:bg-accent/5')
                        }`}
                        title="Apri Chat"
                      >
                        <MessageSquare className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingAthlete(client); }}
                        className={`p-2.5 rounded-xl transition-all ${
                          theme === 'dark'
                            ? (selectedClient?.id === client.id ? 'text-white/60 hover:text-white hover:bg-black/10' : 'text-zinc-600 hover:text-blue-500 hover:bg-blue-500/5')
                            : (selectedClient?.id === client.id ? 'text-zinc-900 hover:bg-zinc-100' : 'text-zinc-400 hover:text-blue-500 hover:bg-blue-500/5')
                        }`}
                        title="Modifica Info"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteAthlete(client.id); }}
                        className={`p-2.5 rounded-xl transition-all ${
                          theme === 'dark'
                            ? (selectedClient?.id === client.id ? 'text-white/60 hover:text-red-300 hover:bg-red-500/10' : 'text-zinc-600 hover:text-red-500 hover:bg-red-500/5')
                            : (selectedClient?.id === client.id ? 'text-red-600 hover:bg-red-50' : 'text-zinc-400 hover:text-red-600 hover:bg-red-50')
                        }`}
                        title="Elimina"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Mobile Menu Trigger */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); setAthleteActionMenu(client); }}
                      className={`sm:hidden p-2 rounded-xl transition-all ${
                        theme === 'dark'
                          ? (selectedClient?.id === client.id ? 'text-white hover:bg-black/10' : 'text-zinc-500 hover:text-white hover:bg-white/5')
                          : (selectedClient?.id === client.id ? 'text-zinc-900 hover:bg-zinc-100' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100')
                      }`}
                    >
                      <MoreVertical className="w-6 h-6" />
                    </button>

                    <ChevronRight className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 transition-transform group-hover:translate-x-1 ${
                      theme === 'dark' ? (selectedClient?.id === client.id ? 'text-white' : 'text-zinc-700') : 'text-zinc-400'
                    }`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Edit Athlete Modal */}
        <AnimatePresence>
          {editingAthlete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass w-full max-w-md p-10 rounded-[3.5rem] shadow-2xl border-white/10 relative"
              >
                <button 
                  onClick={() => setEditingAthlete(null)} 
                  className="absolute top-8 right-8 p-3 hover:bg-white/5 rounded-2xl transition-all text-zinc-500 hover:text-white z-10"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="mb-10 pr-12">
                  <h3 className="text-4xl font-display font-black italic uppercase tracking-tighter text-white break-words">Modifica Atleta</h3>
                </div>
                <form onSubmit={handleUpdateAthlete} className="space-y-8 max-h-[70vh] overflow-y-auto px-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Nome</label>
                      <input 
                        className="input-field" 
                        value={editingAthlete.name} 
                        onChange={e => setEditingAthlete({...editingAthlete, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Email</label>
                      <input 
                        className="input-field" 
                        value={editingAthlete.email} 
                        onChange={e => setEditingAthlete({...editingAthlete, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Età</label>
                      <input 
                        className="input-field" 
                        type="number"
                        value={editingAthlete.age || ''} 
                        onChange={e => setEditingAthlete({...editingAthlete, age: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Exp (Anni)</label>
                      <input 
                        className="input-field" 
                        type="number"
                        value={editingAthlete.experience_years || ''} 
                        onChange={e => setEditingAthlete({...editingAthlete, experience_years: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Inizio Piano</label>
                      <input 
                        className="input-field" 
                        type="date"
                        value={editingAthlete.contract_start || ''} 
                        onChange={e => setEditingAthlete({...editingAthlete, contract_start: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Fine Piano</label>
                      <input 
                        className="input-field" 
                        type="date"
                        value={editingAthlete.contract_end || ''} 
                        onChange={e => setEditingAthlete({...editingAthlete, contract_end: e.target.value})}
                      />
                    </div>
                  </div>

                  {editingAthlete.contract_start && editingAthlete.contract_end && (
                    <div className="p-4 rounded-2xl bg-accent/5 border border-accent/10">
                      <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">Durata Calcolata</p>
                      <p className="text-lg font-black italic text-white">
                        {Math.ceil((new Date(editingAthlete.contract_end).getTime() - new Date(editingAthlete.contract_start).getTime()) / (1000 * 60 * 60 * 24))} Giorni
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Bio / Info Atleta</label>
                    <textarea 
                      className="input-field min-h-[120px] py-4 italic font-bold" 
                      placeholder="Obiettivi, inforturies, note particolari..."
                      value={editingAthlete.bio || ''} 
                      onChange={e => setEditingAthlete({...editingAthlete, bio: e.target.value})}
                    />
                  </div>
                  <button type="submit" className="btn-primary w-full py-5 mt-4">Salva Modifiche</button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Mobile Athlete Action Menu */}
        <AnimatePresence>
          {athleteActionMenu && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center sm:hidden">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setAthleteActionMenu(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className={`relative w-full glass rounded-t-[3rem] p-8 pb-12 border-t transition-colors duration-500 ${
                  theme === 'dark' ? 'bg-black/95 border-white/10' : 'bg-white border-zinc-200 shadow-[0_-20px_50px_rgba(0,0,0,0.1)]'
                }`}
              >
                <div className="w-12 h-1.5 bg-zinc-500/20 rounded-full mx-auto mb-8" />
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className={`text-2xl font-display font-black italic uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Opzioni Atleta</h3>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-1">{athleteActionMenu.name}</p>
                  </div>
                  <button onClick={() => setAthleteActionMenu(null)} className={`p-3 rounded-2xl transition-all ${theme === 'dark' ? 'bg-white/5 text-zinc-500 hover:text-white' : 'bg-zinc-100 text-zinc-500 hover:text-zinc-900'}`}>
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-3">
                  <button 
                    onClick={() => { setChatUser(athleteActionMenu); setView('chat'); setAthleteActionMenu(null); }}
                    className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all ${
                      theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-900'
                    }`}
                  >
                    <MessageSquare className="w-6 h-6 text-accent" />
                    <span className="font-black uppercase tracking-widest text-xs">Apri Chat</span>
                  </button>
                  <button 
                    onClick={() => { setEditingAthlete(athleteActionMenu); setAthleteActionMenu(null); }}
                    className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all ${
                      theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-900'
                    }`}
                  >
                    <Edit3 className="w-6 h-6 text-blue-500" />
                    <span className="font-black uppercase tracking-widest text-xs">Modifica Info</span>
                  </button>
                  <button 
                    onClick={() => { handleDeleteAthlete(athleteActionMenu!.id); setAthleteActionMenu(null); }}
                    className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all ${
                      theme === 'dark' ? 'bg-red-500/10 hover:bg-red-500/20 text-red-500' : 'bg-red-50 hover:bg-red-100 text-red-600'
                    }`}
                  >
                    <Trash2 className="w-6 h-6" />
                    <span className="font-black uppercase tracking-widest text-xs">Elimina Atleta</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Plan Editor / Bio View */}
      <div className={`w-full lg:w-2/3 flex flex-col lg:h-full min-h-0 ${!selectedClient ? 'hidden lg:flex' : 'flex'}`} ref={infoRef}>
        <div className="flex-1 overflow-y-auto pr-2 -mr-2 pb-24 lg:pb-0 scroll-smooth scrollbar-hide space-y-6 pt-1">
        {selectedClient && (
          <button onClick={handleBackFromInfo} className="lg:hidden flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-black uppercase tracking-widest text-[10px] sm:text-xs mb-6">
            <ArrowLeft className="w-5 h-5" /> Torna alla Lista
          </button>
        )}
        {selectedClient ? (
          view === 'bio' ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass p-10 rounded-[3rem] space-y-10 border-white/40"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className={`text-5xl font-display font-black italic uppercase tracking-tighter leading-none mb-4 ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>{selectedClient.name}</h2>
                  <div className="flex flex-wrap gap-4">
                    <span className="px-4 py-1.5 bg-accent/10 border border-accent/20 text-accent rounded-full text-[10px] font-black uppercase tracking-widest">
                      {selectedClient.age || '??'} Anni
                    </span>
                    <span className="px-4 py-1.5 bg-accent/10 border border-accent/20 text-accent rounded-full text-[10px] font-black uppercase tracking-widest">
                      {selectedClient.experience_years || '0'} Anni Exp
                    </span>
                  </div>
                </div>
                <div className="flex gap-3 mt-4 sm:mt-0 order-last sm:order-none">
                  <button 
                    onClick={() => setView('editor')}
                    className="btn-primary flex items-center gap-2 py-3 px-6 sm:py-4 sm:px-8 text-[10px] sm:text-xs"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> Crea Scheda
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Biografia / Note</h3>
                      <button 
                        onClick={() => setEditingAthlete(selectedClient)}
                        className="text-[10px] font-black text-accent uppercase tracking-widest hover:underline"
                      >
                        Modifica Info
                      </button>
                    </div>
                    <div className={`p-6 rounded-3xl border ${theme === 'dark' ? 'bg-zinc-900/50 border-white/5 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-600'} italic font-bold`}>
                      {selectedClient.bio || 'Nessuna bio inserita.'}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Dati Atleta & Contratto</h3>
                  <div className={`p-6 rounded-3xl border space-y-6 ${theme === 'dark' ? 'bg-zinc-900/50 border-white/5' : 'bg-zinc-50 border-zinc-200'}`}>
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <span className="text-[10px] font-black text-zinc-500 uppercase">Età / Esperienza:</span>
                        <div className="flex gap-2">
                          <span className="px-3 py-1 bg-accent/20 text-accent rounded-lg text-[10px] font-black">{selectedClient.age || '??'} Anni</span>
                          <span className="px-3 py-1 bg-accent/20 text-accent rounded-lg text-[10px] font-black">{selectedClient.experience_years || '0'} Exp</span>
                        </div>
                      </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] font-black text-zinc-500 block mb-1">INIZIO:</span>
                        <span className={`text-lg font-black italic transition-colors duration-500 ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>
                          {selectedClient.contract_start ? new Date(selectedClient.contract_start).toLocaleDateString() : 'N/D'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-zinc-500 block mb-1">FINE:</span>
                        <span className="text-lg font-black italic text-accent">
                          {selectedClient.contract_end ? new Date(selectedClient.contract_end).toLocaleDateString() : 'Non impostata'}
                        </span>
                      </div>
                    </div>
                    {selectedClient.contract_start && selectedClient.contract_end && (
                      <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-accent" />
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                            {getDaysRemaining(selectedClient.contract_end) > 0 
                              ? `Mancano ${getDaysRemaining(selectedClient.contract_end)} giorni`
                              : 'Contratto scaduto'}
                          </span>
                        </div>
                        <div className="bg-accent/10 px-3 py-1 rounded-lg">
                          <span className="text-[10px] font-black text-accent uppercase">
                            Durata: {Math.ceil((new Date(selectedClient.contract_end).getTime() - new Date(selectedClient.contract_start).getTime()) / (1000 * 60 * 60 * 24))}g
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                  
                  <button 
                    onClick={() => setView('history')}
                    className={`w-full p-6 rounded-3xl border flex items-center justify-between group transition-all ${theme === 'dark' ? 'hover:bg-accent hover:border-accent border-white/10' : 'hover:bg-accent hover:border-accent border-zinc-200'}`}
                  >
                    <div className="flex items-center gap-4">
                      <History className={`w-6 h-6 transition-colors ${theme === 'dark' ? 'text-accent group-hover:text-black' : 'text-accent group-hover:text-black'}`} />
                      <span className={`font-black uppercase tracking-widest text-xs transition-colors ${theme === 'dark' ? 'text-white group-hover:text-black' : 'text-zinc-900 group-hover:text-black'}`}>Vedi Storico Schede</span>
                    </div>
                    <ChevronRight className={`w-5 h-5 transition-all group-hover:translate-x-1 ${theme === 'dark' ? 'text-zinc-700 group-hover:text-black' : 'text-zinc-300 group-hover:text-black'}`} />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass p-8 rounded-[2.5rem] space-y-8 border-white/40"
            >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <h2 className="text-4xl font-display font-black italic uppercase tracking-tighter leading-none mb-2">Nuova Scheda</h2>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Atleta: {selectedClient.name}</p>
              </div>
              {selectedClient.bio && (
                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 max-w-xs">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Bio / Info</p>
                  <p className="text-xs text-zinc-600 italic line-clamp-2">{selectedClient.bio}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-3 justify-center md:justify-end">
                <button 
                  onClick={() => setView('load_model')}
                  className="p-4 rounded-2xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-all hover:shadow-md"
                  title="Carica da Modello"
                >
                  <Download className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => setView('history')}
                  className="p-4 rounded-2xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-all hover:shadow-md"
                  title="Vedi Storico"
                >
                  <History className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => setView('preview')}
                  disabled={newPlanItems.length === 0}
                  className="p-4 rounded-2xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-all hover:shadow-md disabled:opacity-30"
                  title="Anteprima"
                >
                  <Eye className="w-6 h-6" />
                </button>
                <button 
                  onClick={async () => {
                    if (newPlanItems.length === 0) return;
                    const name = prompt('Nome del modello:');
                    if (!name) return;
                    const desc = prompt('Descrizione del modello:');
                    await fetch('/api/models', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name, description: desc, items: newPlanItems }),
                    });
                    alert('Modello salvato!');
                  }}
                  className="p-4 rounded-2xl border border-accent/20 text-accent hover:bg-accent/5 transition-all hover:shadow-md"
                  title="Salva come Modello"
                >
                  <Copy className="w-6 h-6" />
                </button>
                <button 
                  onClick={savePlan}
                  disabled={newPlanItems.length === 0 || loading}
                  className="bg-accent text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-accent-dark transition-all shadow-xl shadow-accent/20 disabled:opacity-30 flex items-center gap-2"
                >
                  <Save className="w-5 h-5" /> {loading ? '...' : 'Salva'}
                </button>
              </div>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <input
                ref={exerciseSearchRef}
                type="text"
                placeholder="Cerca esercizio (es. panca, squat, schiena, bicipiti...)"
                className={`input-field pl-8 py-6 text-xl font-bold rounded-[2rem] ${theme === 'light' ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900/80 border-white/5 focus:bg-zinc-900 text-white'}`}
                value={searchTerm}
                onFocus={() => setExercisePickerDay(prev => prev || 'Giorno A')}
                onChange={(e) => {
                  setExercisePickerDay(prev => prev || 'Giorno A');
                  setSearchTerm(e.target.value);
                }}
              />
              {exercisePickerDay && (
                <p className="mt-3 ml-2 text-[10px] font-black uppercase tracking-widest text-accent">
                  Aggiunta a: {exercisePickerDay}
                </p>
              )}
              <AnimatePresence>
                {(searchTerm || exercisePickerDay) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute z-10 w-full mt-4 border rounded-[2.5rem] shadow-2xl max-h-96 overflow-y-auto p-4 backdrop-blur-2xl ${theme === 'light' ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-white/10'}`}
                  >
                    {filteredExercises.length > 0 ? (
                      filteredExercises.map(ex => (
                        <button
                          key={ex.id}
                          onClick={() => addExercise(ex)}
                          className={`w-full text-left p-5 rounded-2xl flex items-center justify-between group transition-all ${theme === 'light' ? 'hover:bg-zinc-50' : 'hover:bg-white/5'}`}
                        >
                          <div>
                            <p className={`font-black text-xl italic uppercase tracking-tighter ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>{ex.name}</p>
                            <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">{ex.category}</p>
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg shadow-accent/20">
                            <Plus className="w-6 h-6 text-black" />
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="p-8 text-center text-zinc-500 font-bold uppercase tracking-widest text-xs italic">Nessun esercizio trovato</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Exercise List */}
            <div className="space-y-12">
              {newPlanItems.length === 0 && (
                <div className="text-center py-24 border-2 border-dashed border-white/5 rounded-[4rem] text-zinc-800 bg-zinc-900/20">
                  <ClipboardList className="w-20 h-20 mx-auto mb-6 opacity-5" />
                  <p className="text-2xl font-black uppercase tracking-widest opacity-10 italic">Componi la scheda</p>
                </div>
              )}
              
              {(Object.entries(
                newPlanItems.reduce((acc, item, idx) => {
                  const day = item.day || 'Giorno A';
                  if (!acc[day]) acc[day] = [];
                  acc[day].push({ ...item, originalIndex: idx });
                  return acc;
                }, {} as Record<string, (PlanItem & { originalIndex: number })[]>)
              ) as [string, (PlanItem & { originalIndex: number })[]][]).sort().map(([day, items]) => {
                const isExpanded = expandedDays.includes(day);
                return (
                  <div key={day} className="space-y-8">
                    <button 
                      onClick={() => setExpandedDays(isExpanded ? expandedDays.filter(d => d !== day) : [...expandedDays, day])}
                      className="w-full flex items-center gap-6 group hover:opacity-80 transition-all"
                    >
                      <h3 className="text-3xl font-display font-black italic uppercase tracking-tighter text-accent">{day}</h3>
                      <div className={`h-px flex-1 ${theme === 'dark' ? 'bg-white/5' : 'bg-zinc-200'}`} />
                      <div className={`w-10 h-10 rounded-xl ${theme === 'dark' ? 'bg-zinc-900 border border-white/5' : 'bg-zinc-100 border border-zinc-200'} flex items-center justify-center transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                        <ChevronRight className="w-5 h-5 text-accent" />
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className="space-y-6">
                        {items.map((item) => (
                          <motion.div 
                            layout
                            key={item.originalIndex}
                            className="glass p-8 rounded-[3rem] flex flex-col gap-8 relative group"
                          >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em] block mb-2">{item.category}</span>
                            <p className={`font-black text-3xl italic uppercase tracking-tighter ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>{item.exercise_name}</p>
                          </div>
                          <button 
                            onClick={() => removeExercise(item.originalIndex)}
                            className="p-4 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                          >
                            <Trash2 className="w-6 h-6" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                          <div className="md:col-span-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Giorno</label>
                            <select 
                              className="input-field py-4 rounded-2xl font-black text-accent"
                              value={item.day}
                              onChange={(e) => {
                                const updated = [...newPlanItems];
                                updated[item.originalIndex].day = e.target.value;
                                setNewPlanItems(updated);
                              }}
                            >
                              <option value="Giorno A">Giorno A</option>
                              <option value="Giorno B">Giorno B</option>
                              <option value="Giorno C">Giorno C</option>
                              <option value="Giorno D">Giorno D</option>
                            </select>
                          </div>
                          <div className="md:col-span-2 flex gap-2">
                            <div className="flex-1 min-w-0">
                              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Set</label>
                              <input 
                                placeholder="3" 
                                className="input-field text-center font-black text-xl py-4 px-2"
                                value={item.sets}
                                onChange={(e) => {
                                  const updated = [...newPlanItems];
                                  updated[item.originalIndex].sets = e.target.value;
                                  setNewPlanItems(updated);
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Rip</label>
                              <input
                                placeholder="12"
                                className="input-field text-center font-black text-xl py-4 px-2"
                                value={item.reps}
                                onChange={(e) => {
                                  const updated = [...newPlanItems];
                                  updated[item.originalIndex].reps = e.target.value;
                                  setNewPlanItems(updated);
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Kg</label>
                              <input
                                placeholder="20"
                                className="input-field text-center font-black text-xl py-4 px-2"
                                value={item.weight || ''}
                                onChange={(e) => {
                                  const updated = [...newPlanItems];
                                  updated[item.originalIndex].weight = e.target.value;
                                  setNewPlanItems(updated);
                                }}
                              />
                            </div>
                          </div>
                          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Recupero</label>
                              <input 
                                placeholder="Es. 90''" 
                                className="input-field py-4 font-bold text-accent"
                                value={item.recovery || ''}
                                onChange={(e) => {
                                  const updated = [...newPlanItems];
                                  updated[item.originalIndex].recovery = e.target.value;
                                  setNewPlanItems(updated);
                                }}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Note Tecniche</label>
                              <input 
                                placeholder="Es. focus eccentrica..." 
                                className="input-field py-4 italic font-bold"
                                value={item.pt_notes}
                                onChange={(e) => {
                                  const updated = [...newPlanItems];
                                  updated[item.originalIndex].pt_notes = e.target.value;
                                  setNewPlanItems(updated);
                                }}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Altre Note</label>
                              <textarea 
                                placeholder="Altre informazioni utili..." 
                                className="input-field py-3 min-h-[60px] text-xs"
                                value={item.notes || ''}
                                onChange={(e) => {
                                  const updated = [...newPlanItems];
                                  updated[item.originalIndex].notes = e.target.value;
                                  setNewPlanItems(updated);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        </motion.div>
                      ))}
                      
                      {/* Add Exercise Button under the last one in the day */}
                      <button 
                        onClick={() => {
                          setExercisePickerDay(day);
                          setSearchTerm('');
                          exerciseSearchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          setTimeout(() => exerciseSearchRef.current?.focus(), 100);
                        }}
                        className="w-full py-8 border-2 border-dashed border-white/5 rounded-[3rem] text-zinc-700 hover:text-accent hover:border-accent/20 hover:bg-accent/5 transition-all flex flex-col items-center justify-center gap-3 group"
                      >
                        <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-all">
                          <Plus className="w-6 h-6 group-hover:text-black" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Aggiungi Esercizio a {day}</span>
                      </button>
                    </div>
                    )}
                  </div>
                );
              })}
              </div>
            </motion.div>
          )
        ) : (

          <div className="h-full hidden lg:flex items-center justify-center text-zinc-800 border-2 border-dashed border-white/5 rounded-[4rem] p-12 bg-zinc-900/20">
            <div className="text-center">
              <div className="w-28 h-28 bg-zinc-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/5">
                <UserPlus className="w-12 h-12 text-accent/20" />
              </div>
              <h3 className="text-3xl font-display font-black italic uppercase tracking-tighter mb-3 text-white">Pronto a Coachare?</h3>
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Seleziona un atleta dalla lista per iniziare</p>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

const UserProfile = ({ user, onBack, theme, onAccountDeleted }: { user: User, onBack: () => void, theme?: 'dark' | 'light', onAccountDeleted: () => void }) => {
  const [email, setEmail] = useState(user.email);
  const [name, setName] = useState(user.name);
  const [age, setAge] = useState(user.age ? String(user.age) : '');
  const [experience_years, setExperienceYears] = useState(user.experience_years ? String(user.experience_years) : '');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          age: age ? Number(age) : null,
          experience_years: experience_years ? Number(experience_years) : null
        }),
      });
      if (res.ok) {
        alert('Profilo aggiornato! Effettua nuovamente il login per vedere le modifiche.');
      } else {
        const data = await res.json();
        alert(data.error || 'Errore durante l\'aggiornamento');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Sei sicuro di voler eliminare il tuo account? Questa azione è permanente e cancellerà i tuoi dati personali, i dati relativi alla salute e il tuo programma.')) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/user', { method: 'DELETE' });
      if (res.ok) {
        alert('Account eliminato con successo.');
        onAccountDeleted();
      } else {
        alert('Errore durante l\'eliminazione dell\'account.');
      }
    } catch {
      alert('Errore durante l\'eliminazione dell\'account.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-6">
        <button onClick={onBack} className={`w-14 h-14 flex items-center justify-center border rounded-2xl hover:shadow-lg transition-all ${theme === 'light' ? 'bg-white border-zinc-200 shadow-zinc-200' : 'bg-zinc-900 border-white/10 shadow-accent/20'}`}>
          <ArrowLeft className={`w-6 h-6 ${theme === 'dark' ? 'text-accent' : 'text-zinc-900'}`} />
        </button>
        <div>
          <h2 className={`text-4xl font-display font-black italic uppercase tracking-tighter ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>Il Tuo Profilo</h2>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Gestisci le tue informazioni personali</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="glass p-10 rounded-[3rem] space-y-8 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Nome Completo</label>
            <input className="input-field" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Email</label>
            <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Età</label>
            <input type="number" min={14} className="input-field" value={age} onChange={e => setAge(e.target.value)} />
          </div>
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Anni di Esperienza</label>
            <input type="number" min={0} className="input-field" value={experience_years} onChange={e => setExperienceYears(e.target.value)} />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-5">
          {loading ? 'Salvataggio...' : 'Salva Modifiche'}
        </button>
      </form>

      <div className="glass p-10 rounded-[3rem] space-y-5 max-w-2xl">
        <div>
          <h3 className={`text-2xl font-display font-black italic uppercase tracking-tighter ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>Elimina account</h3>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-2">Azione permanente sui dati del tuo profilo</p>
        </div>
        <button type="button" disabled={deleting} onClick={handleDeleteAccount} className="w-full py-5 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 font-black uppercase tracking-widest text-xs hover:bg-red-500 hover:text-white transition-all">
          {deleting ? 'Eliminazione...' : 'Elimina account'}
        </button>
      </div>
    </div>
  );
};

const UserDashboard = ({ user, theme, onAccountDeleted }: { user: User, theme?: 'dark' | 'light', onAccountDeleted: () => void }) => {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'dashboard' | 'contact' | 'chat' | 'profile' | 'notifications'>('dashboard');
  const [coach, setCoach] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [expandedDays, setExpandedDays] = useState<string[]>(['Giorno A']);

  useEffect(() => {
    const fetchUnread = () => {
      fetch(`/api/notifications/${user.id}`)
        .then(res => res.json())
        .then(data => setUnreadCount(Array.isArray(data) ? data.length : 0));
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 5000);
    return () => clearInterval(interval);
  }, [user.id]);

  useEffect(() => {
    fetch(`/api/plans/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setPlan(data);
        setLoading(false);
      });
    
    // Fetch coach info
    fetch('/api/coach')
      .then(res => res.json())
      .then(setCoach);
  }, [user.id]);

  const updateNote = async (itemId: number, note: string) => {
    // Aggiornamento ottimistico dello stato locale immediato
    setPlan(prev => {
      if (!prev) return null;
      return {
        ...prev,
        items: prev.items.map(item => item.id === itemId ? { ...item, user_notes: note } : item)
      };
    });

    try {
      await fetch(`/api/plan-items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_notes: note }),
      });
    } catch (err) {
      console.error("Errore nel salvataggio della nota:", err);
    }
  };

  const [managingNotesItemId, setManagingNotesItemId] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);

  const manageNotes = (itemId: number) => {
    setManagingNotesItemId(itemId);
  };

  const deleteNote = (itemId: number, noteIndex: number) => {
    const item = plan?.items.find(i => i.id === itemId);
    if (!item || !item.user_notes) return;
    const notes = item.user_notes.split('\n').filter(Boolean);
    notes.splice(noteIndex, 1);
    updateNote(itemId, notes.join('\n'));
  };

  const editNote = (itemId: number, noteIndex: number) => {
    const item = plan?.items.find(i => i.id === itemId);
    if (!item || !item.user_notes) return;
    const notes = item.user_notes.split('\n').filter(Boolean);
    setNoteDraft(notes[noteIndex]);
    setEditingNoteIndex(noteIndex);
  };

  const handleSaveNote = () => {
    if (!noteDraft.trim() || managingNotesItemId === null) return;
    const item = plan?.items.find(i => i.id === managingNotesItemId);
    if (!item) return;
    const notes = item.user_notes ? item.user_notes.split('\n').filter(Boolean) : [];
    
    if (editingNoteIndex !== null) {
      notes[editingNoteIndex] = noteDraft;
    } else {
      notes.push(noteDraft);
    }
    
    updateNote(managingNotesItemId, notes.join('\n'));
    setNoteDraft("");
    setEditingNoteIndex(null);
  };


  const groupedItems = useMemo(() => {
    if (!plan) return {};
    return plan.items.reduce((acc, item) => {
      const day = item.day || 'Giorno A';
      if (!acc[day]) acc[day] = [];
      acc[day].push(item);
      return acc;
    }, {} as Record<string, PlanItem[]>);
  }, [plan]);
  const contractExpired = isContractExpired(user.contract_end);

  const downloadPDF = () => {
    if (!plan) return;
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("COACH BELLU - FITPLAN", 105, 20, { align: "center" });
    doc.setFontSize(14);
    doc.text(`Atleta: ${user.name}`, 105, 30, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Data: ${new Date(plan.created_at).toLocaleDateString()}`, 105, 35, { align: "center" });

    let y = 50;
    const entries = Object.entries(groupedItems).sort() as [string, PlanItem[]][];
    entries.forEach(([day, dayItems]) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(0, 242, 255); // Electric Blue
      doc.text(day, 20, y);
      y += 10;
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      
      dayItems.forEach((item) => {
        const text = `- ${item.exercise_name}: ${formatExerciseLoad(item)} ${item.pt_notes ? `(${item.pt_notes})` : ''}`;
        const splitText = doc.splitTextToSize(text, 170);
        doc.text(splitText, 25, y);
        y += splitText.length * 7;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });
      y += 10;
    });

    doc.save(`Scheda_${user.name.replace(/\s+/g, '_')}.pdf`);
  };

  if (view === 'profile') {
    return <UserProfile user={user} onBack={() => setView('dashboard')} theme={theme} onAccountDeleted={onAccountDeleted} />;
  }

  if (view === 'notifications') {
    return <Notifications coachId={user.id} onBack={() => setView('dashboard')} onReply={() => setView('chat')} theme={theme} />;
  }

  if (view === 'contact') {
    if (!coach) return <div className="text-center py-20 text-zinc-500 font-bold uppercase tracking-widest text-xs">Caricamento dati coach...</div>;
    return <ContactCoach athleteId={user.id} coachId={coach.id} onBack={() => setView('dashboard')} theme={theme} />;
  }

  if (view === 'chat') {
    if (!coach) return <div className="text-center py-20 text-zinc-500 font-bold uppercase tracking-widest text-xs">Caricamento dati coach...</div>;
    return <Chat currentUser={user} otherUser={coach} onBack={() => setView('dashboard')} theme={theme} />;
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-6">
      <div className="w-16 h-16 border-4 border-white/5 border-t-accent rounded-full animate-spin" />
      <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px]">Caricamento Piano...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-12 py-4 pb-40 space-y-12 sm:space-y-20 overflow-x-hidden overflow-y-visible w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-6">
          <div className="text-left">
            <h2 className={`text-5xl sm:text-7xl font-display font-black italic uppercase tracking-tighter leading-none mb-3 ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>La Tua Scheda</h2>
            {plan && (
              <div className="flex items-center gap-3 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                <Clock className="w-4 h-4 text-accent" /> 
                <span>Aggiornata il {new Date(plan.created_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {plan && (
              <div className={`${contractExpired ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-emerald-500 text-white shadow-emerald-500/20'} px-8 py-4 rounded-2xl flex items-center gap-3 shadow-xl w-fit`}>
                {contractExpired ? <AlertCircle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                <span className="text-xs font-black uppercase tracking-widest">{contractExpired ? 'Programma Scaduto' : 'Programma Attivo'}</span>
              </div>
            )}
            <button
              onClick={() => setView('profile')}
              className={`w-14 h-14 flex items-center justify-center border rounded-2xl transition-all hover:shadow-lg ${theme === 'light' ? 'bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-100' : 'bg-zinc-900 border-white/10 text-accent hover:bg-white/5'}`}
              title="Impostazioni Profilo"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>


      {!plan ? (
        <div className="glass p-24 rounded-[4rem] text-center">
          <div className="w-28 h-28 bg-zinc-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-white/5">
            <ClipboardList className="w-14 h-14 text-zinc-700" />
          </div>
          <h3 className={`text-4xl font-display font-black italic uppercase tracking-tighter mb-6 ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>Nessun Piano Attivo</h3>
          <p className="text-zinc-500 font-bold max-w-md mx-auto mb-10 text-lg">
            Pietro sta ancora preparando il tuo percorso. Riceverai una notifica non appena la tua scheda sarà pronta.
          </p>
          <button onClick={() => window.location.reload()} className="btn-primary px-12 py-5">Controlla Aggiornamenti</button>
        </div>
      ) : (
        <div className="space-y-20 overflow-x-hidden overflow-y-visible w-full">
          {(Object.entries(groupedItems) as [string, PlanItem[]][]).sort().map(([day, items]) => {
            const isExpanded = expandedDays.includes(day);
            return (
              <div key={day} className="space-y-10 overflow-x-hidden overflow-y-visible w-full">
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => setExpandedDays(isExpanded ? expandedDays.filter(d => d !== day) : [...expandedDays, day])}
                    className="flex items-center gap-4 group"
                  >
                    <h3 className="text-3xl sm:text-5xl font-display font-black italic uppercase tracking-tighter text-accent">{day}</h3>
                    <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-transform ${isExpanded ? 'rotate-90' : ''} ${theme === 'light' ? 'bg-zinc-100' : 'bg-white/5'}`}>
                      <ChevronRight className="w-6 h-6 text-accent" />
                    </div>
                  </button>
                  <div className={`h-px flex-1 ${theme === 'light' ? 'bg-zinc-200' : 'bg-white/5'}`} />
                </div>
                {isExpanded && (
                  <div className="grid gap-8 overflow-x-hidden overflow-y-visible w-full">
                    {items.map((item) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass p-6 sm:p-8 rounded-[2.5rem] relative overflow-x-hidden overflow-y-visible w-full group min-h-[160px] flex flex-col justify-center"
                    >
                      <div className="flex items-start justify-between w-full mb-4">
                        <div className="flex-1 min-w-0 flex items-start gap-4">
                          <span className="w-3 h-3 rounded-full bg-accent shadow-lg shadow-accent/50 mt-3.5 shrink-0" />
                          <h4 className={`text-2xl sm:text-3xl font-display font-black italic uppercase tracking-tighter break-words overflow-hidden flex-1 min-w-0 ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>
                            {item.exercise_name}
                          </h4>
                        </div>
                        <button 
                          onClick={() => manageNotes(item.id!)}
                          className={`p-2 rounded-xl transition-all shrink-0 ml-4 ${theme === 'dark' ? 'text-accent hover:bg-white/5' : 'text-zinc-900 hover:bg-zinc-100'}`}
                          title="Gestisci Note"
                        >
                          <FileText className="w-6 h-6" />
                        </button>
                      </div>

                      <div className="flex flex-col items-center justify-center text-center w-full">
                        <p className="text-xl sm:text-2xl font-black italic text-zinc-500 mb-4">
                          {formatExerciseLoad(item)} {item.pt_notes && <span className="text-accent/60 ml-2">({item.pt_notes})</span>}
                        </p>
                        
                        {item.user_notes && (
                          <ul className="space-y-1 overflow-x-hidden overflow-y-visible w-full">
                            {item.user_notes.split('\n').filter(Boolean).map((note, idx) => (
                              <li key={idx} className="text-lg sm:text-xl font-bold italic text-zinc-400 flex items-start gap-2 justify-center overflow-x-hidden overflow-y-visible w-full">
                                <span className="text-accent mt-1 select-none">•</span>
                                <span className="whitespace-normal break-words max-w-full">{note}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </motion.div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          
          <div className={`p-8 sm:p-16 rounded-[4rem] shadow-2xl relative overflow-hidden border transition-all ${theme === 'light' ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-white/5 text-white'}`}>
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full -mr-48 -mt-48 blur-[100px]" />
            <h4 className={`text-3xl font-display font-black italic uppercase tracking-tighter mb-10 flex items-center gap-4 ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>
              <Info className="w-8 h-8 text-accent" /> NOTA BENE
            </h4>
            <ul className="space-y-6 text-zinc-500 font-bold text-lg">
              <li className="flex gap-4">
                <span className="text-accent font-black">•</span>
                <span>Le note evidenziate in blu sono inserite dal coach e non possono essere modificate dall'atleta. Per aggiungere nuove note o modificarle, è necessario cliccare sull'icona di modifica situata nell'angolo del riquadro dell'esercizio.</span>
              </li>
            </ul>
          </div>
          {plan && (
            <div className="flex justify-center pt-10">
              <button 
                onClick={downloadPDF}
                className="btn-primary flex items-center gap-3 px-12 py-5"
              >
                <Download className="w-6 h-6" />
                <span className="text-sm font-black uppercase tracking-widest">Scarica PDF del Programma</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Manage Notes Panel */}

      <AnimatePresence>
        {managingNotesItemId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass w-full max-w-md p-10 rounded-[3.5rem] shadow-2xl border-white/10 relative"
            >
              <button 
                onClick={() => setManagingNotesItemId(null)} 
                className={`absolute top-8 right-8 p-3 rounded-2xl transition-all z-10 ${theme === 'light' ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col mb-10 pr-12">
                <h3 className={`text-3xl font-display font-black italic uppercase tracking-tighter ${theme === 'light' ? 'text-zinc-900' : 'text-white'} break-words`}>Gestisci Note</h3>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-1 break-words">
                  {plan?.items.find(i => i.id === managingNotesItemId)?.exercise_name}
                </p>
              </div>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 scrollbar-hide py-1">
                {plan?.items.find(i => i.id === managingNotesItemId)?.user_notes?.split('\n').filter(Boolean).map((note, idx) => (
                  <div key={idx} className={`p-5 rounded-3xl flex items-center justify-between group ${theme === 'light' ? 'bg-zinc-100 border border-zinc-200' : 'bg-white/5 border border-white/10'}`}>
                    <p className={`font-bold italic flex-1 pr-4 ${theme === 'light' ? 'text-zinc-800' : 'text-zinc-300'}`}>{note}</p>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => editNote(managingNotesItemId, idx)}
                        className={`p-2 transition-colors ${theme === 'light' ? 'text-zinc-400 hover:text-accent' : 'text-zinc-500 hover:text-accent'}`}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteNote(managingNotesItemId, idx)}
                        className={`p-2 transition-colors ${theme === 'light' ? 'text-zinc-400 hover:text-red-500' : 'text-zinc-500 hover:text-red-500'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {(!plan?.items.find(i => i.id === managingNotesItemId)?.user_notes || plan?.items.find(i => i.id === managingNotesItemId)?.user_notes?.trim() === '') && (
                  <p className={`text-center py-10 font-bold uppercase tracking-widest text-[10px] ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-500'}`}>Nessuna nota per questo esercizio</p>
                )}
              </div>

              <div className="mt-8 space-y-4">
                <textarea 
                  className={`input-field min-h-[100px] py-4 italic font-bold text-sm ${theme === 'light' ? 'text-zinc-900 bg-white border-zinc-200 placeholder-zinc-400' : ''}`} 
                  placeholder="Scrivi una nota (es. carichi, sensazioni...)"
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                />
                <div className="flex gap-3">
                  {editingNoteIndex !== null && (
                    <button 
                      onClick={() => { setNoteDraft(''); setEditingNoteIndex(null); }}
                      className={`flex-1 py-4 rounded-2xl border font-black uppercase tracking-widest text-[10px] transition-all ${theme === 'light' ? 'border-zinc-200 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900' : 'border-white/10 text-zinc-500 hover:bg-white/5 hover:text-white'}`}
                    >
                      Annulla
                    </button>
                  )}
                  <button 
                    onClick={handleSaveNote}
                    className="btn-primary flex-1 py-4 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {editingNoteIndex !== null ? 'Aggiorna' : 'Aggiungi'} Nota
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>

  );
};

// Redundant component removed
const AboutMe = ({ user, theme, settings, onBack, updateSettings }: { user?: User | null, theme?: 'dark' | 'light', settings: any, onBack: () => void, updateSettings: (s: any) => void }) => {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing && user?.role === 'pt') {
    return (
      <div className="max-w-4xl mx-auto mt-10">
        <SettingsView user={user} onBack={() => setIsEditing(false)} theme={theme!} settings={settings} updateSettings={updateSettings} />
      </div>
    );
  }

  const currentTextColor = theme === 'dark' 
    ? (settings.about_text_color_dark || '#ffffff') 
    : (settings.about_text_color_light || '#000000');

  const customStyles = {
    fontFamily: settings.about_font_family || 'Inter',
    color: currentTextColor
  };

  return (
    <div className="relative overflow-hidden flex items-center justify-center p-6 pt-24 md:p-12" style={customStyles}>
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/5 blur-[150px] rounded-full" />
      </div>

      {user?.role === 'pt' && (
        <div className="absolute top-4 right-4 md:top-8 md:right-8 z-50">
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-accent text-black p-4 rounded-2xl shadow-xl shadow-accent/20 hover:scale-110 transition-all font-black"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      )}

      <div className={`max-w-7xl w-full grid ${String(settings.about_image_enabled) !== 'false' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-4xl mx-auto'} gap-24 sm:gap-12 lg:gap-24 items-center relative z-10`}>
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
          <div className="space-y-4">
            <h1 
              className="font-display font-black italic uppercase tracking-tighter leading-[0.85] transition-colors duration-500" 
              style={{ 
                fontSize: settings.about_title_size || 'clamp(1.5rem, 8vw, 10rem)', 
                color: currentTextColor 
              }}
            >
              {settings.about_title || 'Pietro Cassago'}
            </h1>
            <p className="text-accent font-black uppercase tracking-[0.3em] text-[8px] sm:text-lg lg:text-xl italic">
              {settings.about_subtitle || 'Performance Elite'}
            </p>
          </div>

          <p className="font-medium leading-relaxed opacity-80 text-[8px] sm:text-base lg:text-xl" style={{ fontSize: settings.about_desc_size ? `calc(${settings.about_desc_size} * 0.4)` : undefined }}>
            {settings.about_description}
          </p>

          <div className="grid grid-cols-2 gap-2 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i, index) => {
              if (settings[`box${i}_enabled`] === false || !settings[`box${i}_enabled`]) return null;
              const isEven = (index + 1) % 2 === 0;
              return (
                <div 
                  key={i} 
                  className={`p-4 sm:p-12 flex flex-col justify-center rounded-[1.5rem] sm:rounded-[3.5rem] shadow-xl group hover:scale-105 transition-all w-full ${isEven ? 'mt-8 sm:mt-32 md:ml-auto md:mr-0' : 'md:mr-auto md:ml-0'}`}
                  style={{ 
                    backgroundColor: settings[`box${i}_bg`] || '#2350D1',
                    minHeight: `calc(${settings[`box${i}_height`] || settings.about_box_size || 220}px * 0.4)`,
                    width: '100%',
                    maxWidth: `${settings[`box${i}_width`] || 300}px`
                  }}
                >
                  <span 
                    className="text-[6px] sm:text-[12px] font-black uppercase tracking-[0.2em] mb-1 sm:mb-3 opacity-70"
                    style={{ color: settings[`box${i}_color`] || '#ffffff' }}
                  >
                    {settings[`box${i}_label`] || `Info ${i}`}
                  </span>
                  <span 
                    className="font-display font-black italic uppercase tracking-tighter"
                    style={{ 
                      color: settings[`box${i}_color`] || '#ffffff',
                      fontSize: `calc(${settings[`box${i}_font_size`] || 30}px * 0.5)`,
                      lineHeight: '1'
                    }}
                  >
                    {settings[`box${i}_value`] || '...'}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {String(settings.about_image_enabled) !== 'false' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative">
            <div className="relative aspect-square md:aspect-[4/5] lg:aspect-square">
              <div className="absolute inset-0 border-[20px] border-accent/10 rounded-[4rem]" />
              <div className="absolute inset-[20px] bg-zinc-900 rounded-[3rem] overflow-hidden">
                <img src={settings.about_image || "https://picsum.photos/seed/coachbellu/800/800"} alt="Coach" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};


// --- Main App ---

const PrivacyPolicy = ({ settings, theme }: any) => {
  const [lang, setLang] = useState<'it' | 'en'>('it');

  return (
    <div className={`min-h-screen py-20 px-6 ${theme === 'dark' ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex justify-between items-center">
          <a href="/" className={`inline-flex items-center gap-2 font-black uppercase tracking-widest text-xs transition-colors ${theme === 'dark' ? 'text-zinc-500 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'}`}>
            <ArrowLeft className="w-4 h-4" /> {lang === 'it' ? 'Torna alla Home' : 'Back to Home'}
          </a>
          <button 
            onClick={() => setLang(lang === 'it' ? 'en' : 'it')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl border transition-all ${theme === 'dark' ? 'text-zinc-300 border-white/10 hover:bg-white/5' : 'text-zinc-700 border-zinc-200 hover:bg-zinc-100'}`}
          >
            {lang === 'it' ? 'EN' : 'IT'}
          </button>
        </div>
        <h1 className="text-5xl font-display font-black italic uppercase tracking-tighter text-accent">Privacy Policy</h1>
        
        <div className={`glass p-12 rounded-[3.5rem] space-y-8 text-sm md:text-base leading-relaxed ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`}>
          {lang === 'it' ? (
            <>
              <p><strong>Titolare del Trattamento:</strong> {settings?.privacy_owner_name || 'Bellu Riccardo'} ({settings?.privacy_owner_email || 'belluriccardo@gmail.com'})</p>
              <p><strong>Dati Raccolti:</strong> {settings?.privacy_data_collected || 'email, password (criptata), peso, altezza, condizioni di salute'}</p>
              <p><strong>Finalità del Trattamento:</strong> {settings?.privacy_purpose || 'gestione account e programmi di allenamento personalizzati'}</p>
              <p><strong>Conservazione dei Dati:</strong> {settings?.privacy_retention || 'I dati personali sono conservati per la durata del rapporto di coaching e cancellati entro 12 mesi dalla terminazione dell\'account, su richiesta dell\'utente o quando non più necessari.'}</p>
              <p><strong>Hosting:</strong> {settings?.privacy_hosting || 'Render (render.com)'}</p>
              <p><strong>Database:</strong> {settings?.privacy_database || 'Turso (turso.tech)'}</p>
              
              <p><strong>Base Giuridica:</strong> I dati sono trattati sulla base del consenso esplicito dell'utente ai sensi degli artt. 6 e 9 del GDPR.</p>
              <p><strong>Diritti dell'Utente:</strong> Hai il diritto di: accedere ai tuoi dati personali, rettificare dati inesatti, richiedere la cancellazione dei tuoi dati, opporti al trattamento, richiedere la portabilità dei dati. Per esercitare questi diritti scrivi a belluriccardo@gmail.com</p>
              <p><strong>Diritto di Reclamo:</strong> Hai il diritto di presentare reclamo al Garante per la Protezione dei Dati Personali all'indirizzo <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline transition-all">www.garanteprivacy.it</a></p>
              
              <p className="pt-8 border-t border-white/10 text-xs italic opacity-80">Ultimo aggiornamento: {new Date().toLocaleDateString()}</p>
            </>
          ) : (
            <>
              <p><strong>Data Controller:</strong> {settings?.privacy_owner_name || 'Bellu Riccardo'} ({settings?.privacy_owner_email || 'belluriccardo@gmail.com'})</p>
              <p><strong>Data Collected:</strong> {settings?.privacy_data_collected || 'email, encrypted password, weight, height, health conditions'}</p>
              <p><strong>Purpose of Processing:</strong> {settings?.privacy_purpose || 'account management and personalized training programs'}</p>
              <p><strong>Data Retention:</strong> {settings?.privacy_retention || 'Personal data is kept for the duration of the coaching relationship and deleted within 12 months of account termination, upon user request or when no longer necessary.'}</p>
              <p><strong>Hosting:</strong> {settings?.privacy_hosting || 'Render (render.com)'}</p>
              <p><strong>Database:</strong> {settings?.privacy_database || 'Turso (turso.tech)'}</p>
              
              <p><strong>Legal Basis:</strong> Data is processed based on the explicit consent of the user pursuant to articles 6 and 9 of the GDPR.</p>
              <p><strong>User Rights:</strong> You have the right to: access your personal data, rectify inaccurate data, request the deletion of your data, object to the processing, request data portability. To exercise these rights write to belluriccardo@gmail.com</p>
              <p><strong>Right to Complain:</strong> You have the right to lodge a complaint with the Data Protection Authority at <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline transition-all">www.garanteprivacy.it</a></p>
              
              <p className="pt-8 border-t border-white/10 text-xs italic opacity-80">Last update: {new Date().toLocaleDateString()}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const LegalPrivacyPolicy = ({ settings, theme }: any) => {
  const [lang, setLang] = useState<'it' | 'en'>('it');
  const ownerName = settings?.privacy_owner_name || 'Bellu Riccardo';
  const ownerEmail = settings?.privacy_owner_email || 'belluriccardo@gmail.com';

  return (
    <div className={`min-h-screen py-20 px-6 ${theme === 'dark' ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex justify-between items-center">
          <a href="/" className={`inline-flex items-center gap-2 font-black uppercase tracking-widest text-xs transition-colors ${theme === 'dark' ? 'text-zinc-500 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'}`}>
            <ArrowLeft className="w-4 h-4" /> {lang === 'it' ? 'Torna alla Home' : 'Back to Home'}
          </a>
          <button onClick={() => setLang(lang === 'it' ? 'en' : 'it')} className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl border transition-all ${theme === 'dark' ? 'text-zinc-300 border-white/10 hover:bg-white/5' : 'text-zinc-700 border-zinc-200 hover:bg-zinc-100'}`}>
            {lang === 'it' ? 'EN' : 'IT'}
          </button>
        </div>
        <h1 className="text-5xl font-display font-black italic uppercase tracking-tighter text-accent">Privacy Policy</h1>
        <div className={`glass p-12 rounded-[3.5rem] space-y-8 text-sm md:text-base leading-relaxed ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`}>
          {lang === 'it' ? (
            <>
              <p><strong>Titolare del Trattamento:</strong> {ownerName}, Via Gradisca 10, Varese, Italia. Email: <a href={`mailto:${ownerEmail}`} className="text-accent hover:underline">{ownerEmail}</a>. P.IVA: XXXX.</p>
              <p><strong>Dati raccolti:</strong> nome, cognome, email, password salvata solo in forma hash, peso, altezza e condizioni di salute inseriti dal coach/admin dopo il consulto. Possono inoltre essere trattati log tecnici essenziali come IP, timestamp, endpoint, user-agent e status code.</p>
              <p><strong>Finalita del trattamento:</strong> gestione account, accesso al programma personale, creazione e gestione di programmi di allenamento personalizzati, sicurezza del servizio, prevenzione abusi e reset password tramite email.</p>
              <p><strong>Base giuridica:</strong> consenso dell'utente ai sensi dell'art. 6 GDPR, consenso esplicito ai sensi dell'art. 9 GDPR per i dati relativi alla salute e legittimo interesse per sicurezza tecnica, prevenzione abusi e log tecnici essenziali.</p>
              <p><strong>Minori:</strong> il servizio non e destinato a utenti sotto i 14 anni. Gli utenti sotto i 14 anni non possono registrarsi o usare il servizio. In Italia, per i servizi online, i minori di almeno 14 anni possono prestare il consenso al trattamento dei dati personali. Se il Titolare viene a conoscenza della raccolta di dati di un utente sotto i 14 anni, l'account e i dati collegati saranno eliminati.</p>
              <p><strong>Fornitori:</strong> hosting su Render, database su Turso, email e reset password tramite Brevo. Se i fornitori trattano dati fuori dallo Spazio Economico Europeo, devono applicarsi garanzie adeguate, incluse le Clausole Contrattuali Standard ove richiesto.</p>
              <p><strong>Conservazione:</strong> i dati account e relativi alla salute sono conservati per la durata del rapporto di coaching. In caso di richiesta o eliminazione account, i dati sono cancellati immediatamente salvo obblighi legali o tecnici. I log tecnici sono conservati per massimo 30 giorni e non devono includere password, token, dati salute o payload sensibili.</p>
              <p><strong>Diritti dell'utente:</strong> accesso, rettifica, cancellazione, opposizione, limitazione, portabilita e revoca del consenso. Per esercitare i diritti scrivi a <a href={`mailto:${ownerEmail}`} className="text-accent hover:underline">{ownerEmail}</a>.</p>
              <p><strong>Diritto di reclamo:</strong> puoi presentare reclamo al Garante per la Protezione dei Dati Personali su <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline transition-all">www.garanteprivacy.it</a>.</p>
              <p><strong>Sicurezza:</strong> il sito usa misure tecniche ragionevoli, tra cui HTTPS, password salvate in forma hash, accesso protetto agli account e controlli di accesso.</p>
              <p><strong>Disclaimer salute:</strong> il servizio offre programmi di coaching e allenamento fitness e non sostituisce consulenza medica. In caso di patologie, dubbi o condizioni fisiche particolari, consulta un medico o professionista sanitario prima di seguire un programma di allenamento.</p>
              <p className="pt-8 border-t border-white/10 text-xs italic opacity-80">Ultimo aggiornamento: 5 maggio 2026</p>
            </>
          ) : (
            <>
              <p><strong>Data Controller:</strong> {ownerName}, Via Gradisca 10, Varese, Italy. Email: <a href={`mailto:${ownerEmail}`} className="text-accent hover:underline">{ownerEmail}</a>. VAT number: XXXX.</p>
              <p><strong>Data collected:</strong> first name, last name, email, password stored only as a hash, weight, height and health conditions entered by the coach/admin after consultation. Essential technical logs may also be processed, such as IP address, timestamp, endpoint, user-agent and status code.</p>
              <p><strong>Purposes:</strong> account management, access to the personal program, creation and management of personalized training programs, service security, abuse prevention and password reset by email.</p>
              <p><strong>Legal basis:</strong> user consent under Article 6 GDPR, explicit consent under Article 9 GDPR for health-related data, and legitimate interest for technical security, abuse prevention and essential technical logs.</p>
              <p><strong>Minors:</strong> the service is not intended for users under 14 years old. Users under 14 may not register or use the service. In Italy, for online services, minors aged 14 or older may give consent to personal data processing. If the Data Controller becomes aware that data from a user under 14 has been collected, the account and related data will be deleted.</p>
              <p><strong>Providers:</strong> hosting by Render, database by Turso, email and password reset by Brevo. If providers process data outside the EEA, appropriate safeguards, including Standard Contractual Clauses where required, should apply.</p>
              <p><strong>Retention:</strong> account and health-related data are stored for the duration of the coaching relationship. If the user requests account deletion, data are deleted immediately unless legal or technical obligations require otherwise. Technical logs are retained for a maximum of 30 days and must not include passwords, tokens, health data or sensitive payloads.</p>
              <p><strong>User rights:</strong> access, correction, deletion, objection, restriction, portability and withdrawal of consent. To exercise these rights, contact <a href={`mailto:${ownerEmail}`} className="text-accent hover:underline">{ownerEmail}</a>.</p>
              <p><strong>Right to complain:</strong> users may lodge a complaint with the Italian Data Protection Authority at <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline transition-all">www.garanteprivacy.it</a>.</p>
              <p><strong>Security:</strong> the website uses reasonable technical measures, including HTTPS, password hashing, protected account access and access controls.</p>
              <p><strong>Health disclaimer:</strong> the service provides fitness/coaching/training programs and does not replace medical advice. Users with medical conditions, doubts or specific physical conditions should consult a doctor or healthcare professional before following a training program.</p>
              <p className="pt-8 border-t border-white/10 text-xs italic opacity-80">Last update: May 5, 2026</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const TermsPage = ({ theme }: any) => {
  const [lang, setLang] = useState<'it' | 'en'>('it');

  return (
    <div className={`min-h-screen py-20 px-6 ${theme === 'dark' ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex justify-between items-center">
          <a href="/" className={`inline-flex items-center gap-2 font-black uppercase tracking-widest text-xs transition-colors ${theme === 'dark' ? 'text-zinc-500 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'}`}>
            <ArrowLeft className="w-4 h-4" /> {lang === 'it' ? 'Torna alla Home' : 'Back to Home'}
          </a>
          <button onClick={() => setLang(lang === 'it' ? 'en' : 'it')} className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl border transition-all ${theme === 'dark' ? 'text-zinc-300 border-white/10 hover:bg-white/5' : 'text-zinc-700 border-zinc-200 hover:bg-zinc-100'}`}>
            {lang === 'it' ? 'EN' : 'IT'}
          </button>
        </div>
        <h1 className="text-5xl font-display font-black italic uppercase tracking-tighter text-accent">{lang === 'it' ? 'Termini di Servizio' : 'Terms of Service'}</h1>
        <div className={`glass p-12 rounded-[3.5rem] space-y-8 text-sm md:text-base leading-relaxed ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`}>
          {lang === 'it' ? (
            <>
              <p><strong>Servizio:</strong> coach-bellu consente agli atleti di accedere al proprio programma fitness/coaching personalizzato. I pagamenti non sono gestiti sul sito.</p>
              <p><strong>Requisito di eta:</strong> per registrarsi o usare il servizio devi avere almeno 14 anni.</p>
              <p><strong>Responsabilita dell'utente:</strong> l'utente deve fornire informazioni corrette e mantenere riservate le credenziali del proprio account.</p>
              <p><strong>Nessuna garanzia di risultato:</strong> i programmi di allenamento possono supportare il percorso dell'utente, ma non garantiscono risultati specifici.</p>
              <p><strong>Salute e allenamento:</strong> l'utente segue i programmi sotto la propria responsabilita. Il servizio non sostituisce consulenza medica; in presenza di patologie, dubbi o condizioni fisiche particolari, e necessario consultare un medico prima di allenarsi.</p>
              <p><strong>Uso improprio:</strong> l'uso scorretto del sito o dell'account puo comportare sospensione o cancellazione dell'account.</p>
              <p><strong>Limitazione di responsabilita:</strong> eventuali limitazioni di responsabilita si applicano nei limiti consentiti dalla legge italiana.</p>
              <p><strong>Legge applicabile:</strong> si applica la legge italiana, senza limitare i diritti inderogabili riconosciuti ai consumatori.</p>
              <p className="pt-8 border-t border-white/10 text-xs italic opacity-80">Ultimo aggiornamento: 5 maggio 2026</p>
            </>
          ) : (
            <>
              <p><strong>Service:</strong> coach-bellu allows athletes to access their personalized fitness/coaching program. Payments are not processed on the website.</p>
              <p><strong>Age requirement:</strong> users must be at least 14 years old to register or use the service.</p>
              <p><strong>User responsibility:</strong> users must provide accurate information and keep account credentials confidential.</p>
              <p><strong>No guaranteed results:</strong> training programs may support the user's progress but do not guarantee specific results.</p>
              <p><strong>Health and training:</strong> users follow training programs at their own responsibility. The service does not replace medical advice; users with medical conditions, doubts or specific physical conditions must consult a doctor before training.</p>
              <p><strong>Misuse:</strong> improper use of the website or account may lead to account suspension or deletion.</p>
              <p><strong>Liability limitation:</strong> any liability limitations apply only within the limits allowed by Italian law.</p>
              <p><strong>Applicable law:</strong> Italian law applies, without limiting mandatory consumer rights.</p>
              <p className="pt-8 border-t border-white/10 text-xs italic opacity-80">Last update: May 5, 2026</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('fitplan_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTab, setActiveTab] = useState<'home' | 'dashboard' | 'about' | 'models' | 'notifications' | 'chat'>(() => {
    if (user?.role === 'user') return 'dashboard';
    return 'home';
  });
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('fitplan_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });
  const [settings, setSettings] = useState<any>({});
  const [clients, setClients] = useState<User[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [models, setModels] = useState<ModelPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [ptTargetView, setPtTargetView] = useState<'editor' | 'chat' | null>(null);
  const [coach, setCoach] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState<any[]>([]);
  const [chatDividerCount, setChatDividerCount] = useState(0);
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);

  // Browser History Management
  useEffect(() => {
    if (!user) return;

    const handlePopState = (event: PopStateEvent) => {
      if (event.state) {
        const { tab, client, ptView } = event.state;
        if (tab) setActiveTab(tab);
        if (client !== undefined) setSelectedClient(client);
        if (ptView !== undefined) setPtTargetView(ptView);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Initial state setup
    if (!window.history.state) {
      window.history.replaceState({ 
        tab: activeTab, 
        client: selectedClient, 
        ptView: ptTargetView 
      }, '');
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const currentState = window.history.state;
    const hasChanged = 
      !currentState || 
      currentState.tab !== activeTab || 
      currentState.client?.id !== selectedClient?.id ||
      currentState.ptView !== ptTargetView;

    if (hasChanged) {
      window.history.pushState({ 
        tab: activeTab, 
        client: selectedClient, 
        ptView: ptTargetView 
      }, '');
    }
  }, [activeTab, selectedClient, ptTargetView, user]);

  const fetchUnread = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/notifications/${user.id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setUnreadCount(data.length);
        setUnreadNotifications(data);
      }
    } catch (err) {
      console.error("Error fetching unread:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnread();
      const interval = setInterval(fetchUnread, 5000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const refreshCurrentUser = async () => {
      try {
        const res = await fetch('/api/me');
        if (!res.ok) return;
        const freshUser = await res.json();
        if (cancelled) return;
        setUser(prev => {
          if (!prev || prev.id !== freshUser.id) return prev;
          const next = { ...prev, ...freshUser };
          localStorage.setItem('fitplan_user', JSON.stringify(next));
          return next;
        });
      } catch {
        // Keep the cached user if the refresh fails transiently.
      }
    };
    refreshCurrentUser();
    const interval = setInterval(refreshCurrentUser, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user?.id]);

  const refreshClients = () => fetch('/api/users').then(res => res.json()).then(setClients);
  const refreshExercises = () => fetch('/api/exercises').then(res => res.json()).then(setExercises);
  const refreshModels = () => fetch('/api/models').then(res => res.json()).then(setModels);

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(setSettings);
    if (user?.role === 'pt') {
      Promise.all([refreshClients(), refreshExercises(), refreshModels()]).then(() => setLoading(false));
    } else {
      setLoading(false);
      // Fetch coach info for athletes
      fetch('/api/coach')
        .then(res => res.json())
        .then(setCoach);
    }
  }, [user]);

  const isResetPage = window.location.pathname === '/reset-password';
  const isPrivacyPage = window.location.pathname === '/privacy' || window.location.pathname === '/privacy-policy';
  const isTermsPage = window.location.pathname === '/terms';

  useEffect(() => {
    localStorage.setItem('fitplan_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, [theme]);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('fitplan_user', JSON.stringify(u));
  };

  const handleChatClick = () => {
    if (user?.role === 'pt') {
      setActiveTab('notifications');
    } else {
      // Athlete logic
      if (unreadCount > 0) {
        setChatDividerCount(unreadCount);
        setUnreadCount(0);
        setUnreadNotifications([]);
      } else {
        setChatDividerCount(0);
      }
      setActiveTab('chat');
    }
    setIsHeaderMenuOpen(false);
  };

  const handleLogout = () => {
    fetch('/api/logout', { method: 'POST' }).catch(() => {});
    setUser(null);
    localStorage.removeItem('fitplan_user');
  };

  const handleAccountDeleted = () => {
    setUser(null);
    localStorage.removeItem('fitplan_user');
    window.location.href = '/';
  };

  if (isResetPage) {
    return <ResetPassword />;
  }

  if (isPrivacyPage) {
    return <LegalPrivacyPolicy settings={settings} theme={theme} />;
  }

  if (isTermsPage) {
    return <TermsPage theme={theme} />;
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className={`w-full overflow-x-hidden overflow-y-visible ${activeTab === 'dashboard' && user.role === 'pt' ? 'lg:h-screen lg:overflow-hidden min-h-screen' : 'min-h-screen pb-24'} flex flex-col transition-colors duration-500 ${theme === 'dark' ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
      {/* Header */}
      <header className={`backdrop-blur-2xl border-b sticky top-0 z-20 transition-colors duration-500 ${theme === 'dark' ? 'bg-black/80 border-white/5' : 'bg-white/80 border-zinc-200'}`}>
        <div className="max-w-7xl mx-auto px-2 sm:px-6 h-28 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl overflow-hidden border transition-colors duration-500 ${theme === 'dark' ? 'bg-zinc-900 border-white/5 shadow-accent/10' : 'bg-white border-zinc-200 shadow-zinc-200'}`}>
              <img 
                src="https://i.imgur.com/Qbox1fT.jpeg" 
                alt="Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="hidden sm:block">
              <span className={`font-display font-black text-3xl italic uppercase tracking-tighter block leading-none transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Coach Bellu</span>
              <span className="text-[10px] font-black text-accent uppercase tracking-[0.4em] mt-2 block">Performance Elite</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-3">
            {user.role === 'pt' && (
              <button 
                onClick={() => setActiveTab('home')}
                className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                  activeTab === 'home' ? 'bg-accent text-black shadow-xl shadow-accent/20' : (theme === 'dark' ? 'text-zinc-500 hover:text-white hover:bg-white/5' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100')
                }`}
              >
                Home
              </button>
            )}
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                activeTab === 'dashboard' ? 'bg-accent text-black shadow-xl shadow-accent/20' : (theme === 'dark' ? 'text-zinc-500 hover:text-white hover:bg-white/5' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100')
              }`}
            >
              {user.role === 'pt' ? 'ATLETI' : 'SCHEDA'}
            </button>
            {user.role === 'pt' && (
              <button 
                onClick={() => setActiveTab('models')}
                className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                  activeTab === 'models' ? 'bg-accent text-black shadow-xl shadow-accent/20' : (theme === 'dark' ? 'text-zinc-500 hover:text-white hover:bg-white/5' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100')
                }`}
              >
                Modelli
              </button>
            )}
            <button 
              onClick={() => setActiveTab('about')}
              className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                activeTab === 'about' ? 'bg-accent text-black shadow-xl shadow-accent/20' : (theme === 'dark' ? 'text-zinc-500 hover:text-white hover:bg-white/5' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100')
              }`}
            >
              Chi Sono
            </button>
          </nav>

          <div className="flex items-center gap-5 relative">
            <div className="hidden md:block text-right">
              <p className={`text-lg font-black italic uppercase tracking-tighter transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{user.name}</p>
              <p className="text-[10px] font-black text-accent uppercase tracking-widest">{user.role === 'pt' ? 'Coach' : 'Atleta'}</p>
            </div>

            <div className="relative">
              <button 
                onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
                className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all border ${isHeaderMenuOpen ? 'bg-accent border-accent text-black' : (theme === 'dark' ? 'bg-zinc-900 text-accent border-white/5 hover:bg-zinc-800' : 'bg-white text-zinc-900 border-zinc-200 hover:bg-zinc-100')}`}
                title="Menu"
              >
                <Menu className="w-6 h-6" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center text-[10px] font-black text-black shadow-lg shadow-accent/20 border-2 border-black">
                    {unreadCount}
                  </div>
                )}
              </button>

              <AnimatePresence>
                {isHeaderMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={`absolute right-0 mt-4 w-64 glass rounded-[2rem] shadow-2xl p-4 z-50 border transition-colors duration-500 ${theme === 'dark' ? 'bg-black/95 border-white/10' : 'bg-white/95 border-zinc-200'}`}
                  >
                    <div className="flex flex-col gap-2">
                      {!(user.role === 'user') && (
                        <button 
                          onClick={handleChatClick}
                          className={`flex items-center gap-4 p-4 rounded-xl transition-all ${activeTab === 'notifications' ? 'bg-accent text-black' : (theme === 'dark' ? 'hover:bg-white/5 text-zinc-400 hover:text-white' : 'hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900')}`}
                        >
                          <Mail className="w-5 h-5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Inbox</span>
                          {unreadCount > 0 && <span className="ml-auto bg-accent text-black px-2 py-0.5 rounded-full text-[8px] font-black">{unreadCount}</span>}
                        </button>
                      )}
                      {(user.role === 'user') && (
                        <button 
                          onClick={handleChatClick}
                          className={`hidden md:flex items-center gap-4 p-4 rounded-xl transition-all ${activeTab === 'chat' ? 'bg-accent text-black' : (theme === 'dark' ? 'hover:bg-white/5 text-zinc-400 hover:text-white' : 'hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900')}`}
                        >
                          <MessageSquare className="w-5 h-5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Chat</span>
                          {unreadCount > 0 && <span className="ml-auto bg-accent text-black px-2 py-0.5 rounded-full text-[8px] font-black">{unreadCount}</span>}
                        </button>
                      )}

                      <button 
                        onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); setIsHeaderMenuOpen(false); }}
                        className={`flex items-center gap-4 p-4 rounded-xl transition-all ${theme === 'dark' ? 'hover:bg-white/5 text-zinc-400 hover:text-white' : 'hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900'}`}
                      >
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        <span className="text-[10px] font-black uppercase tracking-widest">Tema {theme === 'dark' ? 'Chiaro' : 'Scuro'}</span>
                      </button>

                      <div className={`h-px my-2 ${theme === 'dark' ? 'bg-white/5' : 'bg-zinc-100'}`} />

                      <button 
                        onClick={() => { handleLogout(); setIsHeaderMenuOpen(false); }}
                        className={`flex items-center gap-4 p-4 rounded-xl transition-all text-red-500 hover:bg-red-500/10`}
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className={`max-w-7xl mx-auto flex-1 w-full overflow-x-hidden overflow-y-visible ${activeTab === 'dashboard' && user.role === 'pt' ? 'px-4 py-4 flex flex-col min-h-0 lg:overflow-hidden overflow-y-auto lg:pb-8 pb-40' : 'px-4 py-8 overflow-y-auto pb-32'}`}>
        <AnimatePresence mode="wait">
          {activeTab === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {user.role === 'pt' ? (
                <PTHome 
                  user={user} 
                  theme={theme} 
                  onAthleteClick={(client) => {
                    setSelectedClient(client);
                    setActiveTab('dashboard');
                  }}
                  onNotificationsClick={() => setActiveTab('notifications')}
                />
              ) : (
                <UserDashboard user={user} theme={theme} onAccountDeleted={handleAccountDeleted} />
              )}
            </motion.div>
          ) : activeTab === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={user.role === 'pt' ? "flex-1 min-h-0 flex flex-col overflow-x-hidden overflow-y-visible w-full" : "overflow-x-hidden overflow-y-visible w-full"}
            >
              {user.role === 'pt' ? (
                <PTDashboard 
                  pt={user} 
                  theme={theme} 
                  clients={clients} 
                  exercises={exercises} 
                  models={models} 
                  refreshClients={refreshClients} 
                  refreshExercises={refreshExercises} 
                  refreshModels={refreshModels}
                  selectedClient={selectedClient}
                  setSelectedClient={setSelectedClient}
                  initialView={ptTargetView}
                  onViewHandled={() => setPtTargetView(null)}
                  newMessagesCount={chatDividerCount}
                  onRead={() => {
                    if (selectedClient) {
                      const countForClient = unreadNotifications.filter(n => n.sender_id === selectedClient.id).length;
                      setUnreadNotifications(prev => prev.filter(n => n.sender_id !== selectedClient.id));
                      setUnreadCount(prev => Math.max(0, prev - countForClient));
                    }
                  }}
                />
              ) : (
                <UserDashboard user={user} theme={theme} onAccountDeleted={handleAccountDeleted} />
              )}
            </motion.div>
          ) : activeTab === 'models' ? (
            <motion.div
              key="models-standalone"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ModelsLibrary 
                models={models} 
                exercises={exercises} 
                onUpdate={refreshModels} 
                theme={theme}
              />
            </motion.div>
          ) : activeTab === 'about' ? (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AboutMe settings={settings} theme={theme} user={user} onBack={() => setActiveTab('home')} updateSettings={(s: any) => setSettings(s)} />
            </motion.div>
          ) : activeTab === 'chat' ? (
            <motion.div
              key="chat-page"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="max-w-4xl mx-auto mt-10">
                {coach ? (
                  <Chat currentUser={user} otherUser={coach} onBack={() => setActiveTab('dashboard')} theme={theme} newMessagesCount={chatDividerCount} />
                ) : (
                  <div className="text-center py-20 text-zinc-500 font-bold uppercase tracking-widest text-xs">Caricamento dati coach...</div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="notifications-page"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="max-w-4xl mx-auto mt-10">
                {user.role === 'pt' ? (
                  <CoachInbox 
                    unreadNotifications={unreadNotifications} 
                    onBack={() => setActiveTab('dashboard')} 
                    onSelectAthlete={(senderId) => {
                      const client = clients.find(c => c.id === senderId);
                      if (client) {
                        const countForClient = unreadNotifications.filter(n => n.sender_id === senderId).length;
                        setChatDividerCount(countForClient);
                        setSelectedClient(client);
                        setPtTargetView('chat');
                        setActiveTab('dashboard');
                        // Local update to clear badge
                        setUnreadNotifications(prev => prev.filter(n => n.sender_id !== senderId));
                        setUnreadCount(prev => Math.max(0, prev - countForClient));
                      }
                    }} 
                    theme={theme} 
                  />
                ) : (
                  <Notifications coachId={user.id} onBack={() => setActiveTab('dashboard')} onReply={(senderId) => {
                    const client = clients.find(c => c.id === senderId);
                    if (client) {
                      setSelectedClient(client);
                      setPtTargetView('chat');
                      setActiveTab('dashboard');
                    }
                  }} theme={theme} fullView={true} />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Universal Footer */}
      {!(activeTab === 'dashboard' && user?.role === 'pt') && (
        <footer className="max-w-7xl mx-auto px-4 py-8 text-center border-t border-white/5 pb-28 md:pb-8">
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <a href="/privacy-policy" className="text-zinc-500 hover:text-accent font-bold text-xs uppercase tracking-widest transition-colors">Privacy Policy</a>
            <a href="/terms" className="text-zinc-500 hover:text-accent font-bold text-xs uppercase tracking-widest transition-colors">Termini di Servizio</a>
          </div>
          <p className="text-zinc-600 text-[10px] uppercase font-black tracking-widest leading-relaxed max-w-2xl mx-auto mb-3">
            coach-bellu | Titolare: Bellu Riccardo | Via Gradisca 10, Varese, Italia | P.IVA: XXXX | Email: belluriccardo@gmail.com
          </p>
          <p className="text-zinc-600 text-[10px] uppercase font-black tracking-widest leading-relaxed max-w-2xl mx-auto">
            I contenuti di questo sito sono a solo scopo informativo e non costituiscono un consiglio medico. Consulta un medico prima di iniziare qualsiasi programma di allenamento.
          </p>
        </footer>
      )}

      {/* Mobile Footer Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-2xl border-t border-white/5 px-8 py-4 flex justify-around items-center z-30">
        {user.role === 'pt' && (
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-2 relative ${activeTab === 'home' ? 'text-accent' : 'text-zinc-600'}`}
          >
            <Home className="w-7 h-7" />
            <span className="text-[10px] font-black uppercase tracking-widest">Home</span>
            {unreadCount > 0 && (
              <div className="absolute -top-1 -left-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center text-[10px] font-black text-black shadow-lg shadow-accent/20 border-2 border-black">
                {unreadCount}
              </div>
            )}
          </button>
        )}
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-2 ${activeTab === 'dashboard' ? 'text-accent' : 'text-zinc-600'}`}
        >
          <ClipboardList className="w-7 h-7" />
          <span className="text-[10px] font-black uppercase tracking-widest">{user.role === 'pt' ? 'ATLETI' : 'SCHEDA'}</span>
        </button>
        {user.role === 'pt' && (
          <button 
            onClick={() => setActiveTab('models')}
            className={`flex flex-col items-center gap-2 ${activeTab === 'models' ? 'text-accent' : 'text-zinc-600'}`}
          >
            <Copy className="w-7 h-7" />
            <span className="text-[10px] font-black uppercase tracking-widest">Modelli</span>
          </button>
        )}
        {user.role === 'user' && (
          <button 
            onClick={handleChatClick}
            className={`flex flex-col items-center gap-2 relative ${activeTab === 'chat' ? 'text-accent' : 'text-zinc-600'}`}
          >
            <MessageSquare className="w-7 h-7" />
            <span className="text-[10px] font-black uppercase tracking-widest">Chat</span>
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center text-[10px] font-black text-black shadow-lg shadow-accent/20 border-2 border-black">
                {unreadCount}
              </div>
            )}
          </button>
        )}


        <button 
          onClick={() => setActiveTab('about')}
          className={`flex flex-col items-center gap-2 ${activeTab === 'about' ? 'text-accent' : 'text-zinc-600'}`}
        >
          <UserIcon className="w-7 h-7" />
          <span className="text-[10px] font-black uppercase tracking-widest">Chi Sono</span>
        </button>
      </div>
    </div>
  );
}
