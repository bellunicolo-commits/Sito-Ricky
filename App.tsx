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
  ArrowLeft,
  UserPlus,
  Settings,
  History,
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
  ShieldCheck
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { User, Plan, Exercise, PlanItem, Role } from './types';

// --- Components ---

const Auth = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
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
    const body = isLogin ? { email, password } : { email, password, name };

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
              src="https://ais-dev-7vys44a4emaxsgt7nqudfa-321251937071.us-east1.run.app/api/files/67c49e29-7104-45e0-843e-721245039572" 
              alt="Coach Bellu Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
        <h1 className="text-4xl font-display font-black text-center mb-2 text-white italic tracking-tighter uppercase">Coach Bellu</h1>
        <p className="text-zinc-500 text-center mb-10 font-bold uppercase tracking-widest text-[10px]">
          {isForgot ? 'Recupero Password' : (isLogin ? 'Bentornato, Atleta' : 'Inizia la tua trasformazione')}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && !isForgot && (
            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Nome Completo</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Mario Rossi"
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
              placeholder="atleta@esempio.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {!isForgot && (
            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Password</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required
              />
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
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/5 flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-700">
          <button onClick={() => { setEmail('pt@coachbellu.com'); setPassword('password'); setIsLogin(true); }} className="hover:text-accent">Demo Coach</button>
          <button onClick={() => { setEmail('user@coachbellu.com'); setPassword('password'); setIsLogin(true); }} className="hover:text-accent">Demo Atleta</button>
        </div>
      </motion.div>
    </div>
  );
};

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const token = new URLSearchParams(window.location.search).get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return setError('Le password non coincidono');
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
            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Password</label>
              <input type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Conferma Password</label>
              <input type="password" className="input-field" value={confirm} onChange={e => setConfirm(e.target.value)} required />
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

const Chat = ({ currentUser, otherUser, onBack, theme }: { currentUser: User, otherUser: User, onBack: () => void, theme?: 'dark' | 'light' }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const fetchMessages = () => {
    fetch(`/api/messages/${currentUser.id}?otherId=${otherUser.id}`)
      .then(res => res.json())
      .then(data => {
        setMessages(data);
        // Mark as read
        fetch('/api/messages/read', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ receiverId: currentUser.id, senderId: otherUser.id })
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
          <div key={i} className={`flex ${m.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              m.sender_id === currentUser.id 
                ? 'bg-accent text-black rounded-tr-none' 
                : (theme === 'light' ? 'bg-zinc-200 text-zinc-900 rounded-tl-none' : 'bg-zinc-800 text-white rounded-tl-none')
            }`}>
              <p className="text-sm font-bold">{m.content}</p>
              <p className={`text-[8px] mt-1 font-black uppercase opacity-40 ${m.sender_id === currentUser.id ? 'text-black' : (theme === 'light' ? 'text-zinc-900' : 'text-white')}`}>
                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className={`p-6 border-t flex gap-3 ${theme === 'light' ? 'bg-zinc-100/50 border-zinc-200' : 'bg-zinc-900/50 border-white/5'}`}>
        <input 
          className="input-field flex-1" 
          placeholder="Scrivi un messaggio..." 
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
        />
        <button type="submit" disabled={loading} className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center text-black hover:scale-105 transition-all shadow-lg shadow-accent/20">
          <Send className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
};

const Notifications = ({ coachId, onReply, onBack, theme }: { coachId: number, onReply: (userId: number) => void, onBack: () => void, theme?: 'dark' | 'light' }) => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/notifications/${coachId}`)
      .then(res => res.json())
      .then(setNotifications);
  }, [coachId]);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-6">
        <button onClick={onBack} className={`w-14 h-14 flex items-center justify-center border rounded-2xl hover:shadow-lg transition-all ${theme === 'light' ? 'bg-white border-zinc-200 hover:shadow-zinc-200' : 'bg-zinc-900 border-white/10 hover:shadow-accent/20'}`}>
          <ArrowLeft className="w-6 h-6 text-accent" />
        </button>
        <h2 className={`text-4xl font-display font-black italic uppercase tracking-tighter ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>Notifiche</h2>
      </div>
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
                <div>
                  <p className={`font-black italic uppercase tracking-tighter ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>Messaggio da {n.sender_name}</p>
                  <p className="text-zinc-500 text-xs font-bold line-clamp-1">"{n.content}"</p>
                </div>
              </div>
              <button 
                onClick={() => onReply(n.sender_id)}
                className="bg-accent text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all"
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

const ExerciseLibrary = ({ exercises, onUpdate }: { exercises: Exercise[], onUpdate: () => void }) => {
  const [editingEx, setEditingEx] = useState<Exercise | null>(null);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSave = async () => {
    const endpoint = editingEx ? `/api/exercises/${editingEx.id}` : '/api/exercises';
    const method = editingEx ? 'PATCH' : 'POST';
    
    await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, category: newCategory }),
    });
    
    setEditingEx(null);
    setIsAdding(false);
    setNewName('');
    setNewCategory('');
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
          <h2 className="text-4xl font-display font-black italic uppercase tracking-tighter leading-none mb-2">Libreria Esercizi</h2>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Gestisci il tuo database di movimenti</p>
        </div>
        <button 
          onClick={() => { setIsAdding(true); setEditingEx(null); setNewName(''); setNewCategory(''); }}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Nuovo Esercizio
        </button>
      </div>

      {(isAdding || editingEx) && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-2xl space-y-6"
        >
          <h3 className="text-xl font-display font-black italic uppercase tracking-tighter">{editingEx ? 'Modifica' : 'Aggiungi'} Esercizio</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block ml-1">Nome</label>
              <input 
                placeholder="Es. Panca Piana" 
                className="input-field bg-zinc-50 border-zinc-100"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block ml-1">Tag / Categoria</label>
              <input 
                placeholder="Es. Petto, Schiena, Gambe..." 
                className="input-field bg-zinc-50 border-zinc-100"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => { setIsAdding(false); setEditingEx(null); }} className="px-6 py-3 text-zinc-400 font-bold uppercase tracking-widest text-xs">Annulla</button>
            <button onClick={handleSave} className="bg-zinc-900 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all">Salva</button>
          </div>
        </motion.div>
      )}

      <div className="space-y-12">
        {categories.sort().map(cat => (
          <div key={cat} className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="px-4 py-1.5 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full">{cat}</span>
              <div className="h-px flex-1 bg-zinc-100" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exercises.filter(ex => ex.category === cat).map(ex => (
                <div key={ex.id} className="bg-white p-6 rounded-2xl border border-zinc-100 flex justify-between items-center group hover:shadow-md transition-all">
                  <p className="font-black italic uppercase tracking-tighter text-lg">{ex.name}</p>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setEditingEx(ex); setNewName(ex.name); setNewCategory(ex.category); setIsAdding(false); }}
                      className="p-2 text-zinc-300 hover:text-blue-600 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(ex.id)}
                      className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PlanHistory = ({ userId, clientName, onLoadPlan, onBack }: { userId: number, clientName: string, onLoadPlan: (items: PlanItem[]) => void, onBack: () => void }) => {
  const [history, setHistory] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = () => {
    fetch(`/api/plans/${userId}/history`)
      .then(res => res.json())
      .then(data => {
        setHistory(data);
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
        <button onClick={onBack} className="w-14 h-14 flex items-center justify-center bg-white border border-zinc-200 rounded-2xl hover:shadow-lg transition-all">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-3xl font-display font-black italic uppercase tracking-tighter">Storico Schede: {clientName}</h2>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Gestisci le programmazioni passate</p>
        </div>
      </div>

      {history.length === 0 ? (
        <p className="text-zinc-500 font-medium">Nessuna scheda precedente trovata.</p>
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
              <div key={plan.id} className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-xl relative group">
                <div className="absolute top-0 right-10 -translate-y-1/2 flex gap-2">
                  <div className="bg-zinc-900 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
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
                          <div key={i} className="flex flex-col gap-1 p-4 rounded-2xl bg-zinc-50/50 border border-zinc-100">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-zinc-900">
                                <strong className="uppercase italic tracking-tight">{item.exercise_name}</strong>: {item.sets} x {item.reps}
                              </p>
                              {item.pt_notes && <span className="text-xs text-zinc-400 italic">Note PT: {item.pt_notes}</span>}
                            </div>
                            {item.user_notes && (
                              <div className="mt-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Feedback Atleta:</p>
                                <p className="text-xs text-zinc-600 italic">"{item.user_notes}"</p>
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

const PlanPreview = ({ items, clientName, onBack }: { items: PlanItem[], clientName: string, onBack: () => void }) => {
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
        const text = `• ${item.exercise_name}: ${item.sets} x ${item.reps} ${item.pt_notes ? `(${item.pt_notes})` : ''}`;
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
          <button onClick={onBack} className="w-14 h-14 flex items-center justify-center bg-white border border-zinc-200 rounded-2xl hover:shadow-lg transition-all">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-4xl font-display font-black italic uppercase tracking-tighter leading-none mb-2">Anteprima Atleta</h2>
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
      
      <div className="bg-white p-12 rounded-[3rem] border border-zinc-100 shadow-2xl space-y-12">
        <div className="flex justify-between items-start border-b border-zinc-100 pb-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center overflow-hidden">
              <img 
                src="https://ais-dev-7vys44a4emaxsgt7nqudfa-321251937071.us-east1.run.app/api/files/67c49e29-7104-45e0-843e-721245039572" 
                alt="Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className="text-2xl font-display font-black italic uppercase tracking-tighter leading-none">Pietro Cassago</h3>
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
              <h4 className="text-3xl font-display font-black italic uppercase tracking-tighter text-zinc-900 border-l-4 border-blue-600 pl-4">{day}</h4>
              <ul className="space-y-4 ml-8">
                {dayItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-lg font-medium text-zinc-700">
                    <span className="text-blue-600 font-black mt-1">•</span>
                    <span>
                      <strong className="text-zinc-900 uppercase italic tracking-tight">{item.exercise_name}</strong> {item.sets} x {item.reps} {item.pt_notes && <span className="text-zinc-400 italic">({item.pt_notes})</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-10 border-t border-zinc-100">
          <h4 className="text-xl font-display font-black italic uppercase tracking-tighter mb-6">NOTA BENE:</h4>
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

const SettingsView = ({ user, onBack }: { user: User, onBack: () => void }) => {
  const [settings, setSettings] = useState<any>({});
  const [notifSettings, setNotifSettings] = useState({
    notification_email: user.notification_email || user.email,
    email_notifications_enabled: user.email_notifications_enabled === 1
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const defaultSettings = {
    about_title: 'Pietro Cassago',
    about_subtitle: 'Performance Elite',
    about_description: "Coach Bellu. Specialista in Calisthenics, Strength & Conditioning. Trasformo atleti attraverso un approccio scientifico e una programmazione d'élite personalizzata.",
    about_specialty: 'Calisthenics',
    about_focus: 'Performance',
    about_standard: 'Elite',
    about_image: 'https://picsum.photos/seed/coachbellu/800/800'
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
    
    // Save site settings
    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });

    // Save notification settings
    await fetch(`/api/users/${user.id}/notifications`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notifSettings),
    });

    setSaving(false);
    alert('Impostazioni salvate!');
  };

  const handleReset = () => {
    if (confirm('Ripristinare le impostazioni predefinite? Le modifiche attuali verranno perse.')) {
      setSettings(defaultSettings);
    }
  };

  if (loading) return <div className="text-center py-12 text-zinc-500">Caricamento impostazioni...</div>;

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-6">
        <button onClick={onBack} className="w-14 h-14 flex items-center justify-center bg-zinc-900 border border-white/10 rounded-2xl hover:shadow-accent/20 hover:shadow-lg transition-all">
          <ArrowLeft className="w-6 h-6 text-accent" />
        </button>
        <div>
          <h2 className="text-4xl font-display font-black italic uppercase tracking-tighter leading-none mb-2 text-white">Impostazioni Sito</h2>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Personalizza la tua pagina "Chi Sono"</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="glass p-10 rounded-[3rem] space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block ml-1">Titolo (Nome)</label>
              <input 
                className="input-field" 
                value={settings.about_title || ''} 
                onChange={e => setSettings({...settings, about_title: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block ml-1">Sottotitolo</label>
              <input 
                className="input-field" 
                value={settings.about_subtitle || ''} 
                onChange={e => setSettings({...settings, about_subtitle: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block ml-1">URL Immagine Profilo</label>
              <input 
                className="input-field" 
                value={settings.about_image || ''} 
                onChange={e => setSettings({...settings, about_image: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block ml-1">Descrizione Bio</label>
              <textarea 
                className="input-field min-h-[150px] py-4" 
                value={settings.about_description || ''} 
                onChange={e => setSettings({...settings, about_description: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block ml-1">Specialità</label>
            <input 
              className="input-field" 
              value={settings.about_specialty || ''} 
              onChange={e => setSettings({...settings, about_specialty: e.target.value})}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block ml-1">Focus</label>
            <input 
              className="input-field" 
              value={settings.about_focus || ''} 
              onChange={e => setSettings({...settings, about_focus: e.target.value})}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block ml-1">Standard</label>
            <input 
              className="input-field" 
              value={settings.about_standard || ''} 
              onChange={e => setSettings({...settings, about_standard: e.target.value})}
            />
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

const PTDashboard = ({ pt, theme }: { pt: User, theme: 'dark' | 'light' }) => {
  const [clients, setClients] = useState<User[]>([]);
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [newPlanItems, setNewPlanItems] = useState<PlanItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'editor' | 'library' | 'history' | 'preview' | 'settings' | 'notifications' | 'chat'>('editor');
  const [editingAthlete, setEditingAthlete] = useState<User | null>(null);
  const [chatUser, setChatUser] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshClients = () => {
    fetch('/api/users').then(res => res.json()).then(setClients);
  };

  const refreshExercises = () => {
    fetch('/api/exercises').then(res => res.json()).then(setExercises);
  };

  const fetchUnread = () => {
    fetch(`/api/notifications/${pt.id}`)
      .then(res => res.json())
      .then(data => setUnreadCount(data.length));
  };

  useEffect(() => {
    refreshClients();
    refreshExercises();
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, [pt.id]);

  const handleUpdateAthlete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAthlete) return;
    await fetch(`/api/users/${editingAthlete.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: editingAthlete.name, 
        email: editingAthlete.email,
        bio: editingAthlete.bio 
      }),
    });
    setEditingAthlete(null);
    refreshClients();
  };

  const handleDeleteAthlete = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare questo atleta e tutti i suoi dati?')) return;
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    if (selectedClient?.id === id) setSelectedClient(null);
    refreshClients();
  };

  const filteredExercises = useMemo(() => {
    if (!searchTerm) return [];
    return exercises.filter(ex => 
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      ex.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, exercises]);

  const addExercise = (ex: Exercise) => {
    setNewPlanItems([...newPlanItems, {
      exercise_name: ex.name,
      category: ex.category,
      day: 'Giorno A',
      sets: '',
      reps: '',
      pt_notes: ''
    }]);
    setSearchTerm('');
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

  if (view === 'settings') {
    return <SettingsView user={pt} onBack={() => setView('editor')} />;
  }

  if (view === 'notifications') {
    return <Notifications coachId={pt.id} onBack={() => setView('editor')} theme={theme} onReply={(userId) => {
      const client = clients.find(c => c.id === userId);
      if (client) {
        setChatUser(client);
        setView('chat');
      }
    }} />;
  }

  if (view === 'chat' && chatUser) {
    return <Chat currentUser={pt} otherUser={chatUser} onBack={() => setView('editor')} theme={theme} />;
  }

  if (view === 'library') {
    return (
      <div className="space-y-6">
        <button onClick={() => setView('editor')} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-bold uppercase tracking-widest text-xs">
          <ArrowLeft className="w-4 h-4" /> Torna alla Dashboard
        </button>
        <ExerciseLibrary exercises={exercises} onUpdate={refreshExercises} />
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
            pt_notes: item.pt_notes
          })));
          setView('editor');
        }}
        onBack={() => setView('editor')} 
      />
    );
  }

  if (view === 'preview' && selectedClient) {
    return <PlanPreview items={newPlanItems} clientName={selectedClient.name} onBack={() => setView('editor')} />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Client List */}
      <div className="lg:col-span-1 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-display font-black italic uppercase tracking-tighter flex items-center gap-2">
            <UserIcon className="w-5 h-5" /> Atleti
          </h2>
          <button 
            onClick={() => setView('settings')}
            className="p-3 bg-white border border-zinc-200 rounded-2xl transition-all text-zinc-500 hover:text-zinc-900 hover:shadow-lg"
            title="Impostazioni Sito"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setView('notifications')}
            className={`p-3 border rounded-2xl transition-all hover:shadow-lg relative ${theme === 'dark' ? 'bg-zinc-900 border-white/10 text-zinc-500 hover:text-white' : 'bg-white border-zinc-200 text-zinc-400 hover:text-zinc-900'}`}
            title="Notifiche"
          >
            <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'animate-bounce text-accent' : ''}`} />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-lg shadow-red-500/40">
                {unreadCount}
              </div>
            )}
          </button>
          <button 
            onClick={() => setView('library')}
            className="p-3 bg-white border border-zinc-200 rounded-2xl transition-all text-zinc-500 hover:text-zinc-900 hover:shadow-lg"
            title="Gestisci Libreria"
          >
            <Dumbbell className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          {clients.map(client => (
            <div key={client.id} className="relative group">
              <button
                onClick={() => setSelectedClient(client)}
                className={`w-full text-left athlete-box flex items-center justify-between group border-2 ${
                  selectedClient?.id === client.id 
                    ? 'bg-accent text-black border-accent shadow-2xl shadow-accent/40 scale-[1.02]' 
                    : 'border-transparent'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl ${
                    selectedClient?.id === client.id 
                      ? 'bg-black/10 text-black' 
                      : (theme === 'dark' ? 'bg-zinc-800 text-accent' : 'bg-zinc-100 text-accent')
                  }`}>
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <p className={`font-black text-xl italic uppercase tracking-tighter ${
                      selectedClient?.id === client.id ? 'text-black' : (theme === 'dark' ? 'text-white' : 'text-zinc-900')
                    }`}>{client.name}</p>
                    <div className="flex flex-col gap-1">
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${
                        selectedClient?.id === client.id ? 'text-black/60' : 'text-zinc-500'
                      }`}>
                        {client.email}
                      </p>
                      <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${
                        selectedClient?.id === client.id ? 'text-black/80' : 'text-accent'
                      }`}>
                        <Key className="w-3 h-3" /> {client.password}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setChatUser(client); setView('chat'); }}
                    className={`p-2 rounded-xl transition-all ${
                      selectedClient?.id === client.id ? 'text-black/40 hover:text-black' : (theme === 'dark' ? 'text-zinc-500 hover:text-accent' : 'text-zinc-400 hover:text-accent')
                    }`}
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>
                  <ChevronRight className={`w-6 h-6 transition-transform group-hover:translate-x-1 ${
                    selectedClient?.id === client.id ? 'text-black' : (theme === 'dark' ? 'text-zinc-700' : 'text-zinc-300')
                  }`} />
                </div>
              </button>
              <div className="absolute right-20 top-1/2 -translate-y-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); setEditingAthlete(client); }}
                  className={`p-3 rounded-xl ${selectedClient?.id === client.id ? 'text-black/40 hover:text-black' : 'text-zinc-500 hover:text-accent'}`}
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteAthlete(client.id); }}
                  className={`p-3 rounded-xl ${selectedClient?.id === client.id ? 'text-black/40 hover:text-red-600' : 'text-zinc-500 hover:text-red-500'}`}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Athlete Modal */}
        <AnimatePresence>
          {editingAthlete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass w-full max-w-md p-10 rounded-[3.5rem] shadow-2xl border-white/10"
              >
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-4xl font-display font-black italic uppercase tracking-tighter text-white">Modifica Atleta</h3>
                  <button onClick={() => setEditingAthlete(null)} className="p-3 hover:bg-white/5 rounded-2xl transition-all text-zinc-500 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleUpdateAthlete} className="space-y-8">
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
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Bio / Info Atleta</label>
                    <textarea 
                      className="input-field min-h-[120px] py-4 italic font-bold" 
                      placeholder="Obiettivi, infortuni, note particolari..."
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
      </div>

      {/* Plan Editor */}
      <div className="lg:col-span-2 space-y-6">
        {selectedClient ? (
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
              <div className="flex gap-3">
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
                  onClick={savePlan}
                  disabled={newPlanItems.length === 0 || loading}
                  className="bg-zinc-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/20 disabled:opacity-30 flex items-center gap-2"
                >
                  <Save className="w-5 h-5" /> {loading ? '...' : 'Salva'}
                </button>
              </div>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <Search className="w-6 h-6 text-accent" />
              </div>
              <input
                type="text"
                placeholder="Cerca esercizio (es. panca, squat, schiena...)"
                className="input-field pl-16 py-6 bg-zinc-900/80 border-white/5 focus:bg-zinc-900 text-xl font-bold rounded-[2rem]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <AnimatePresence>
                {searchTerm && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-10 w-full mt-4 bg-zinc-900 border border-white/10 rounded-[2.5rem] shadow-2xl max-h-96 overflow-y-auto p-4 backdrop-blur-2xl"
                  >
                    {filteredExercises.length > 0 ? (
                      filteredExercises.map(ex => (
                        <button
                          key={ex.id}
                          onClick={() => addExercise(ex)}
                          className="w-full text-left p-5 hover:bg-white/5 rounded-2xl flex items-center justify-between group transition-all"
                        >
                          <div>
                            <p className="font-black text-xl italic uppercase tracking-tighter text-white">{ex.name}</p>
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
              ) as [string, (PlanItem & { originalIndex: number })[]][]).sort().map(([day, items]) => (
                <div key={day} className="space-y-8">
                  <div className="flex items-center gap-6">
                    <h3 className="text-3xl font-display font-black italic uppercase tracking-tighter text-accent">{day}</h3>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>
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
                            <p className="font-black text-3xl italic uppercase tracking-tighter text-white">{item.exercise_name}</p>
                          </div>
                          <button 
                            onClick={() => removeExercise(item.originalIndex)}
                            className="p-4 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                          >
                            <Trash2 className="w-6 h-6" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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
                          <div className="md:col-span-1 flex gap-3">
                            <div className="flex-1">
                              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Set</label>
                              <input 
                                placeholder="3" 
                                className="input-field text-center font-black text-2xl py-4"
                                value={item.sets}
                                onChange={(e) => {
                                  const updated = [...newPlanItems];
                                  updated[item.originalIndex].sets = e.target.value;
                                  setNewPlanItems(updated);
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Rip</label>
                              <input 
                                placeholder="12" 
                                className="input-field text-center font-black text-2xl py-4"
                                value={item.reps}
                                onChange={(e) => {
                                  const updated = [...newPlanItems];
                                  updated[item.originalIndex].reps = e.target.value;
                                  setNewPlanItems(updated);
                                }}
                              />
                            </div>
                          </div>
                          <div className="md:col-span-3">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Note Tecniche</label>
                            <input 
                              placeholder="Es. Recupero 90'', focus eccentrica..." 
                              className="input-field py-4 italic font-bold"
                              value={item.pt_notes}
                              onChange={(e) => {
                                const updated = [...newPlanItems];
                                updated[item.originalIndex].pt_notes = e.target.value;
                                  setNewPlanItems(updated);
                                }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      
                      {/* Add Exercise Button under the last one in the day */}
                      <button 
                        onClick={() => setSearchTerm('')} // This just focuses search or we can make it open search
                        className="w-full py-8 border-2 border-dashed border-white/5 rounded-[3rem] text-zinc-700 hover:text-accent hover:border-accent/20 hover:bg-accent/5 transition-all flex flex-col items-center justify-center gap-3 group"
                      >
                        <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-all">
                          <Plus className="w-6 h-6 group-hover:text-black" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Aggiungi Esercizio a {day}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
          </motion.div>
        ) : (
          <div className="h-full flex items-center justify-center text-zinc-800 border-2 border-dashed border-white/5 rounded-[4rem] p-12 bg-zinc-900/20">
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
  );
};

const UserProfile = ({ user, onBack, theme }: { user: User, onBack: () => void, theme?: 'dark' | 'light' }) => {
  const [email, setEmail] = useState(user.email);
  const [name, setName] = useState(user.name);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
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

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-6">
        <button onClick={onBack} className={`w-14 h-14 flex items-center justify-center border rounded-2xl hover:shadow-lg transition-all ${theme === 'light' ? 'bg-white border-zinc-200 shadow-zinc-200' : 'bg-zinc-900 border-white/10 shadow-accent/20'}`}>
          <ArrowLeft className="w-6 h-6 text-accent" />
        </button>
        <div>
          <h2 className={`text-4xl font-display font-black italic uppercase tracking-tighter ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>Il Tuo Profilo</h2>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Gestisci le tue informazioni per il recupero account</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="glass p-10 rounded-[3rem] space-y-8 max-w-2xl">
        <div>
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Nome Completo</label>
          <input className="input-field" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Email (Usata per il recupero)</label>
          <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-5">
          {loading ? 'Salvataggio...' : 'Salva Modifiche'}
        </button>
      </form>
    </div>
  );
};

const UserDashboard = ({ user, theme }: { user: User, theme?: 'dark' | 'light' }) => {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'dashboard' | 'contact' | 'chat' | 'profile' | 'notifications'>('dashboard');
  const [coach, setCoach] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = () => {
      fetch(`/api/notifications/${user.id}`)
        .then(res => res.json())
        .then(data => setUnreadCount(data.length));
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
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
    try {
      await fetch(`/api/plan-items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_notes: note }),
      });
      // Update local state
      if (plan) {
        setPlan({
          ...plan,
          items: plan.items.map(item => item.id === itemId ? { ...item, user_notes: note } : item)
        });
      }
    } catch (err) {
      console.error(err);
    }
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
        const text = `• ${item.exercise_name}: ${item.sets} x ${item.reps} ${item.pt_notes ? `(${item.pt_notes})` : ''}`;
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
    return <UserProfile user={user} onBack={() => setView('dashboard')} theme={theme} />;
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
    <div className="max-w-4xl mx-auto space-y-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="flex items-center gap-8">
          <div className="w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-2xl overflow-hidden border-2 transition-colors duration-500" style={{ backgroundColor: theme === 'light' ? '#fff' : '#18181b', borderColor: theme === 'light' ? '#e4e4e7' : 'rgba(255,255,255,0.1)' }}>
            <img 
              src="https://ais-dev-7vys44a4emaxsgt7nqudfa-321251937071.us-east1.run.app/api/files/67c49e29-7104-45e0-843e-721245039572" 
              alt="Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h2 className={`text-6xl font-display font-black italic uppercase tracking-tighter leading-none mb-3 ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>La Tua Scheda</h2>
            {plan && (
              <div className="flex items-center gap-3 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                <Clock className="w-4 h-4 text-accent" /> 
                <span>Aggiornata il {new Date(plan.created_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setView('notifications')}
            className={`p-4 border rounded-2xl transition-all hover:shadow-lg relative ${theme === 'light' ? 'bg-white border-zinc-200 text-zinc-400 hover:text-accent hover:shadow-zinc-200' : 'bg-zinc-900 border-white/10 text-zinc-500 hover:text-accent hover:shadow-accent/20'}`}
            title="Notifiche"
          >
            <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'animate-bounce text-accent' : ''}`} />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-red-500/40">
                {unreadCount}
              </div>
            )}
          </button>
          <button 
            onClick={() => setView('profile')}
            className={`p-4 border rounded-2xl transition-all hover:shadow-lg ${theme === 'light' ? 'bg-white border-zinc-200 text-zinc-400 hover:text-accent hover:shadow-zinc-200' : 'bg-zinc-900 border-white/10 text-zinc-500 hover:text-accent hover:shadow-accent/20'}`}
            title="Profilo"
          >
            <Settings className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setView('chat')}
            className={`px-8 py-4 rounded-2xl flex items-center gap-3 shadow-xl border transition-all relative ${theme === 'light' ? 'bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50 hover:shadow-zinc-200' : 'bg-zinc-900 border-white/10 text-white hover:bg-zinc-800 hover:shadow-accent/10'}`}
          >
            <MessageSquare className="w-5 h-5 text-accent" />
            <span className="text-xs font-black uppercase tracking-widest">Chat Coach</span>
            {unreadCount > 0 && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-black animate-bounce shadow-lg shadow-red-500/40">
                {unreadCount}
              </div>
            )}
          </button>
          <button 
            onClick={() => setView('contact')}
            className={`px-8 py-4 rounded-2xl flex items-center gap-3 shadow-xl border transition-all ${theme === 'light' ? 'bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50 hover:shadow-zinc-200' : 'bg-zinc-900 border-white/10 text-white hover:bg-zinc-800 hover:shadow-accent/10'}`}
          >
            <Mail className="w-5 h-5 text-accent" />
            <span className="text-xs font-black uppercase tracking-widest">Contattami</span>
          </button>
          {plan && (
            <button 
              onClick={downloadPDF}
              className={`px-8 py-4 rounded-2xl flex items-center gap-3 shadow-xl border transition-all ${theme === 'light' ? 'bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50 hover:shadow-zinc-200' : 'bg-zinc-900 border-white/10 text-white hover:bg-zinc-800 hover:shadow-accent/10'}`}
            >
              <Download className="w-5 h-5 text-accent" />
              <span className="text-xs font-black uppercase tracking-widest">Scarica PDF</span>
            </button>
          )}
          {plan && (
            <div className="bg-accent text-black px-8 py-4 rounded-2xl flex items-center gap-3 shadow-xl shadow-accent/20">
              <CheckCircle2 className="w-6 h-6" />
              <span className="text-xs font-black uppercase tracking-widest">Programma Attivo</span>
            </div>
          )}
        </div>
      </div>

      {user.bio && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 rounded-[3rem] border-accent/20"
        >
          <p className="text-[10px] font-black text-accent uppercase tracking-[0.3em] mb-3">Note del Coach / Bio</p>
          <p className="text-zinc-300 font-bold italic text-lg leading-relaxed">{user.bio}</p>
        </motion.div>
      )}

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
        <div className="space-y-20">
          {(Object.entries(groupedItems) as [string, PlanItem[]][]).sort().map(([day, items]) => (
            <div key={day} className="space-y-10">
              <div className="flex items-center gap-6">
                <h3 className="text-5xl font-display font-black italic uppercase tracking-tighter text-accent">{day}</h3>
                <div className={`h-px flex-1 ${theme === 'light' ? 'bg-zinc-200' : 'bg-white/5'}`} />
              </div>
              <div className="grid gap-8">
                {items.map((item) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-10 rounded-[3.5rem] relative overflow-hidden group"
                  >
                    <div className="flex flex-col md:flex-row gap-10">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <span className="w-3 h-3 rounded-full bg-accent shadow-lg shadow-accent/50" />
                          <h4 className={`text-3xl font-display font-black italic uppercase tracking-tighter ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>{item.exercise_name}</h4>
                        </div>
                        <p className="text-2xl font-black italic text-zinc-500 mb-8 ml-7">
                          {item.sets} x {item.reps} {item.pt_notes && <span className="text-accent/60 ml-2">({item.pt_notes})</span>}
                        </p>
                        <div className="relative ml-7">
                          <textarea 
                            className={`w-full border focus:ring-accent/20 focus:border-accent/20 rounded-3xl p-6 text-lg font-bold italic transition-all min-h-[120px] ${theme === 'light' ? 'bg-white border-zinc-200 text-zinc-600 placeholder:text-zinc-300' : 'bg-black/40 border-white/5 text-zinc-400 placeholder:text-zinc-700'}`}
                            placeholder="Annotazioni (carichi, sensazioni)..."
                            value={item.user_notes || ''}
                            onChange={(e) => updateNote(item.id!, e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
          
          <div className={`p-16 rounded-[4rem] shadow-2xl relative overflow-hidden border transition-all ${theme === 'light' ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-white/5 text-white'}`}>
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full -mr-48 -mt-48 blur-[100px]" />
            <h4 className={`text-3xl font-display font-black italic uppercase tracking-tighter mb-10 flex items-center gap-4 ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>
              <Info className="w-8 h-8 text-accent" /> NOTA BENE
            </h4>
            <ul className="space-y-6 text-zinc-500 font-bold text-lg">
              <li className="flex gap-4">
                <span className="text-accent font-black">•</span>
                <span>La dicitura è serie x ripetizioni.</span>
              </li>
              <li className="flex gap-4">
                <span className="text-accent font-black">•</span>
                <span>Se non indicato diversamente i tempi di recupero sono circa 1:30.</span>
              </li>
              <li className="flex gap-4">
                <span className="text-accent font-black">•</span>
                <span>Le progressioni vanno svolte tra le settimane, non tra un giorno e l'altro della stessa settimana.</span>
              </li>
              <li className="flex gap-4">
                <span className="text-accent font-black">•</span>
                <span>Quando un max è davvero un max: quando non ce la fai più a fare il movimento concentrico dell'esercizio.</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

const AboutMe = () => {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(setSettings);
  }, []);

  if (!settings) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto glass p-10 md:p-20 rounded-[4rem] overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full -mr-80 -mt-80 blur-[150px]" />
      <div className="relative z-10 flex flex-col lg:flex-row gap-20 items-center">
        <div className="relative">
          <div className="absolute inset-0 bg-accent rounded-[4rem] rotate-6 scale-105 opacity-10 blur-2xl" />
          <div className="w-72 h-72 md:w-96 md:h-96 rounded-[4rem] overflow-hidden shadow-2xl relative z-10 border-4 border-white/10">
            <img 
              src={settings.about_image || "https://picsum.photos/seed/coachbellu/800/800"} 
              alt={settings.about_title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
        <div className="flex-1 text-center lg:text-left">
          <span className="inline-block px-6 py-2 bg-accent text-black text-[10px] font-black uppercase tracking-[0.4em] rounded-full mb-8 shadow-lg shadow-accent/20">{settings.about_subtitle}</span>
          <h2 className="text-6xl md:text-8xl font-display font-black mb-8 italic uppercase tracking-tighter leading-none text-white">{settings.about_title}</h2>
          <p className="text-2xl md:text-3xl text-zinc-500 mb-12 leading-relaxed font-bold italic">
            {settings.about_description}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="glass p-8 rounded-[2.5rem] border-white/5">
              <p className="text-4xl font-black italic tracking-tighter text-white">{settings.about_specialty}</p>
              <p className="text-[10px] font-black text-accent uppercase tracking-widest mt-2">Specialità</p>
            </div>
            <div className="glass p-8 rounded-[2.5rem] border-white/5">
              <p className="text-4xl font-black italic tracking-tighter text-white">{settings.about_focus}</p>
              <p className="text-[10px] font-black text-accent uppercase tracking-widest mt-2">Focus</p>
            </div>
            <div className="hidden sm:block bg-accent text-black p-8 rounded-[2.5rem] shadow-2xl shadow-accent/20">
              <p className="text-4xl font-black italic tracking-tighter">{settings.about_standard}</p>
              <p className="text-[10px] font-black text-black/60 uppercase tracking-widest mt-2">Standard</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('fitplan_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'about'>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('fitplan_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  const isResetPage = window.location.pathname === '/reset-password';

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

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('fitplan_user');
  };

  if (isResetPage) {
    return <ResetPassword />;
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className={`min-h-screen pb-24 transition-colors duration-500 ${theme === 'dark' ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
      {/* Header */}
      <header className={`backdrop-blur-2xl border-b sticky top-0 z-20 transition-colors duration-500 ${theme === 'dark' ? 'bg-black/80 border-white/5' : 'bg-white/80 border-zinc-200'}`}>
        <div className="max-w-7xl mx-auto px-6 h-28 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl overflow-hidden border transition-colors duration-500 ${theme === 'dark' ? 'bg-zinc-900 border-white/5 shadow-accent/10' : 'bg-white border-zinc-200 shadow-zinc-200'}`}>
              <img 
                src="https://ais-dev-7vys44a4emaxsgt7nqudfa-321251937071.us-east1.run.app/api/files/67c49e29-7104-45e0-843e-721245039572" 
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

          <nav className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                activeTab === 'dashboard' ? 'bg-accent text-black shadow-xl shadow-accent/20' : (theme === 'dark' ? 'text-zinc-500 hover:text-white hover:bg-white/5' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100')
              }`}
            >
              Area Atleta
            </button>
            <button 
              onClick={() => setActiveTab('about')}
              className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                activeTab === 'about' ? 'bg-accent text-black shadow-xl shadow-accent/20' : (theme === 'dark' ? 'text-zinc-500 hover:text-white hover:bg-white/5' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100')
              }`}
            >
              Chi Sono
            </button>
          </nav>

          <div className="flex items-center gap-8">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all border ${theme === 'dark' ? 'bg-zinc-900 text-accent border-white/5 hover:bg-zinc-800' : 'bg-white text-zinc-900 border-zinc-200 hover:bg-zinc-50'}`}
              title="Cambia Tema"
            >
              {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
            <div className="hidden md:block text-right">
              <p className={`text-lg font-black italic uppercase tracking-tighter transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{user.name}</p>
              <p className="text-[10px] font-black text-accent uppercase tracking-widest">{user.role === 'pt' ? 'Coach' : 'Atleta'}</p>
            </div>
            <button 
              onClick={handleLogout}
              className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all border ${theme === 'dark' ? 'bg-zinc-900 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 border-white/5' : 'bg-white text-zinc-400 hover:text-red-500 hover:bg-red-50 border-zinc-200'}`}
              title="Logout"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {user.role === 'pt' ? <PTDashboard pt={user} theme={theme} /> : <UserDashboard user={user} theme={theme} />}
            </motion.div>
          ) : (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AboutMe />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Footer Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-2xl border-t border-white/5 px-8 py-4 flex justify-around items-center z-30">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-2 ${activeTab === 'dashboard' ? 'text-accent' : 'text-zinc-600'}`}
        >
          <ClipboardList className="w-7 h-7" />
          <span className="text-[10px] font-black uppercase tracking-widest">Dashboard</span>
        </button>
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
