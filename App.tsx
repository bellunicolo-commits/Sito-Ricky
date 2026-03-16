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
  AlertCircle
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { User, Plan, Exercise, PlanItem, Role, ModelPlan } from './types';

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
          <h2 className="text-4xl font-display font-black italic uppercase tracking-tighter leading-none mb-2">Libreria Esercizi</h2>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Gestisci il tuo database di movimenti</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              className="w-full py-4 pl-12 pr-4 bg-white border border-zinc-100 rounded-2xl text-xs font-bold uppercase tracking-widest outline-none focus:border-accent transition-all"
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
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block ml-1">Gruppo Muscolare</label>
              <input 
                placeholder="Es. Pettorali, Dorsali..." 
                className="input-field bg-zinc-50 border-zinc-100"
                value={newMuscleGroup}
                onChange={(e) => setNewMuscleGroup(e.target.value)}
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
              <span className="px-4 py-1.5 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full">{cat}</span>
              <div className="h-px flex-1 bg-zinc-100" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {catExercises.map(ex => (
                <div key={ex.id} className="bg-white p-6 rounded-2xl border border-zinc-100 flex justify-between items-center group hover:shadow-md transition-all">
                  <div>
                    <p className="font-black italic uppercase tracking-tighter text-lg">{ex.name}</p>
                    {ex.muscle_group && <p className="text-[8px] font-black text-accent uppercase tracking-widest">{ex.muscle_group}</p>}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setEditingEx(ex); setNewName(ex.name); setNewCategory(ex.category); setNewMuscleGroup(ex.muscle_group || ''); setIsAdding(false); }}
                      className="p-2 text-zinc-300 hover:text-accent transition-colors"
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
            );
        })}

      </div>
    </div>
  );
};

const ModelsLibrary = ({ models, exercises, onUpdate, theme }: { models: ModelPlan[], exercises: Exercise[], onUpdate: () => void, theme?: 'dark' | 'light' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [viewingModel, setViewingModel] = useState<ModelPlan | null>(null);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [modelItems, setModelItems] = useState<PlanItem[]>([]);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [expandedDays, setExpandedDays] = useState<string[]>(['Giorno A']);

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
    await fetch('/api/models', {
      method: 'POST',
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
            <h2 className="text-3xl font-display font-black italic uppercase tracking-tighter text-white">Anteprima Modello</h2>
          </div>
          <div className="glass p-12 rounded-[4rem] space-y-12">
            <div>
              <h1 className="text-5xl font-display font-black italic uppercase tracking-tighter text-accent mb-4">{newName}</h1>
              <p className="text-zinc-400 font-bold text-xl italic">{newDesc}</p>
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
                    <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
                      <span className="font-bold text-lg text-white uppercase italic">{item.exercise_name}</span>
                      <span className="text-accent font-black tracking-tighter">{item.sets} x {item.reps}</span>
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
            <h2 className={`text-4xl font-display font-black italic uppercase tracking-tighter leading-none mb-2 ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>Editor Modello</h2>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Stai creando un modello master riutilizzabile</p>
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
            <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none">
              <Search className="w-6 h-6 text-accent" />
            </div>
            <input
              type="text"
              placeholder="Cerca esercizio da aggiungere al modello..."
              className={`input-field pl-20 py-8 text-xl font-bold rounded-[2.5rem] transition-all ${theme === 'light' ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900/80 border-white/5 text-white focus:bg-zinc-900'}`}
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
                        setModelItems([...modelItems, { exercise_name: ex.name, category: ex.category || '', day: 'Giorno A', sets: '', reps: '', pt_notes: '' }]);
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
                          
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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

                            <div className="md:col-span-1 flex gap-2">
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
        <div className="glass p-12 rounded-[4rem] border-accent/20">
          <div className="mb-12 border-b border-white/10 pb-10">
            <h2 className="text-6xl font-display font-black italic uppercase tracking-tighter text-white mb-4">{viewingModel.name}</h2>
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
                    <div key={i} className="glass p-8 rounded-[3rem] border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div>
                        <span className="text-[10px] font-black text-accent uppercase tracking-widest block mb-1">{item.category}</span>
                        <h4 className="text-3xl font-display font-black italic uppercase text-white">{item.exercise_name}</h4>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-3xl font-black italic text-accent">{item.sets} x {item.reps}</span>
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h2 className={`text-6xl font-display font-black italic uppercase tracking-tighter leading-none mb-3 ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>Modelli Master</h2>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Libreria Schede Riutilizzabili</p>
        </div>
        <button onClick={() => setIsCreating(true)} className="bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 flex items-center gap-3">
          <Plus className="w-6 h-6" /> Crea Nuovo Modello
        </button>
      </div>
      <div className="relative">
        <div className="absolute left-8 top-1/2 -translate-y-1/2">
          <Search className="w-6 h-6 text-zinc-400" />
        </div>
        <input 
          className={`input-field pl-20 py-8 text-xl font-bold rounded-[2.5rem] transition-all ${theme === 'light' ? 'bg-white border-zinc-200' : 'bg-zinc-900/50 border-white/5 focus:bg-zinc-900'}`} 
          placeholder="Cerca modello per nome, descrizione, keyword..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredModels.map(m => (
          <motion.div 
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass p-10 rounded-[4rem] border relative group transition-all duration-500 hover:shadow-2xl ${theme === 'light' ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-white/5 hover:border-accent/20'}`}
          >
            <div className="mb-10">
              <h3 className="text-4xl font-display font-black italic uppercase tracking-tighter text-blue-500 leading-none mb-4 group-hover:text-accent transition-colors">{m.name}</h3>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-3 h-3"/> {new Date(m.created_at).toLocaleDateString()}
              </p>
            </div>
            <p className="text-zinc-500 font-bold italic text-lg leading-relaxed line-clamp-3 mb-12">{m.description || 'Nessuna descrizione specificata per questo modello master.'}</p>
            <div className="flex justify-between items-center pt-8 border-t border-white/5">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setViewingModel(m)}
                  className="w-12 h-12 rounded-2xl bg-zinc-800 text-accent flex items-center justify-center hover:bg-accent hover:text-black transition-all shadow-lg"
                  title="Visualizza Modello"
                >
                  <Eye className="w-6 h-6" />
                </button>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDelete(m.id); }} 
                className="p-3 text-zinc-600 hover:text-red-500 transition-colors"
                title="Elimina Modello"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <div className="absolute top-6 right-6 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <span className="text-[10px] font-black text-blue-500 uppercase">Master</span>
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
    onSelect(items);
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

const SettingsView = ({ user, onBack, theme, settings: initialSettings, updateSettings }: { user: User, onBack: () => void, theme: 'dark' | 'light', settings: any, updateSettings: (s: any) => void }) => {
  const [settings, setSettings] = useState<any>(initialSettings || {});
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
    about_image: 'https://picsum.photos/seed/coachbellu/800/800',
    about_font_family: 'Inter',
    about_text_color: '#ffffff',
    about_accent_color: '#2350D1',
    about_title_size: '6rem',
    about_desc_size: '1.125rem',
    about_box_size: 220,
    about_box_width: 100,
    box1_enabled: true, box1_label: 'Specialty', box1_value: 'Calisthenics', box1_bg: '#2350D1', box1_color: '#ffffff',
    box2_enabled: true, box2_label: 'Focus', box2_value: 'Performance', box2_bg: '#2350D1', box2_color: '#ffffff',
    box3_enabled: true, box3_label: 'Quality', box3_value: 'Elite', box3_bg: '#2350D1', box3_color: '#ffffff',
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
    alert('Impostazioni salvate!');
  };

  const handleReset = () => {
    if (confirm('Ripristinare le impostazioni predefinite?')) {
      setSettings(defaultSettings);
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
          </div>
        </div>

        {/* Global Styles */}
        <div className="pt-10 border-t border-white/5 space-y-10">
          <h3 className={`text-2xl font-display font-black italic uppercase tracking-tighter ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>Dimensioni e Stile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block ml-1">Altezza Box (px)</label>
              <input 
                type="range" min="150" max="500" step="10"
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-accent"
                value={settings.about_box_size || 220}
                onChange={e => setSettings({...settings, about_box_size: parseInt(e.target.value)})}
              />
              <span className="text-[10px] font-bold text-accent mt-2 block ml-1">{settings.about_box_size || 220}px</span>
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block ml-1">Larghezza Box (%)</label>
              <input 
                type="range" min="50" max="100" step="5"
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-accent"
                value={settings.about_box_width || 100}
                onChange={e => setSettings({...settings, about_box_width: parseInt(e.target.value)})}
              />
              <span className="text-[10px] font-bold text-accent mt-2 block ml-1">{settings.about_box_width || 100}%</span>
            </div>
          </div>
        </div>

        {/* Detailing Boxes Customization */}
        <div className="pt-10 border-t border-white/5 space-y-10">
          <h3 className={`text-2xl font-display font-black italic uppercase tracking-tighter ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>Box Informativi</h3>
          
          {[1, 2, 3].map(i => (
            <div key={i} className={`p-8 rounded-3xl border transition-all ${settings[`box${i}_enabled`] ? (theme === 'light' ? 'border-accent/30 bg-accent/5' : 'border-accent/30 bg-accent/5') : (theme === 'light' ? 'border-zinc-200 bg-transparent opacity-60' : 'border-white/5 bg-transparent opacity-60')}`}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${settings[`box${i}_enabled`] ? 'bg-accent text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                    {i}
                  </div>
                  <h4 className={`text-lg font-black uppercase tracking-widest ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>Box {i === 1 ? 'Sinistro' : i === 2 ? 'Centrale' : 'Destro'}</h4>
                </div>
                <button 
                  type="button"
                  onClick={() => setSettings({...settings, [`box${i}_enabled`]: !settings[`box${i}_enabled`]}) }
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${settings[`box${i}_enabled`] ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-accent text-black'}`}
                >
                  {settings[`box${i}_enabled`] ? 'Disabilita' : 'Abilita'}
                </button>
              </div>

              {settings[`box${i}_enabled`] && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block ml-1">Etichetta (es. Specialty)</label>
                    <input className="input-field" value={settings[`box${i}_label`] || ''} onChange={e => setSettings({...settings, [`box${i}_label`]: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block ml-1">Valore (es. Calisthenics)</label>
                    <input className="input-field" value={settings[`box${i}_value`] || ''} onChange={e => setSettings({...settings, [`box${i}_value`]: e.target.value})} />
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
              )}
            </div>
          ))}
        </div>

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
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block ml-1">Colore Testo</label>
              <input 
                type="color" 
                className="w-full h-12 rounded-xl bg-zinc-900 border border-white/10"
                value={settings.about_text_color || '#ffffff'}
                onChange={e => setSettings({...settings, about_text_color: e.target.value})}
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

const PTHome = ({ user, theme }: { user: User, theme: 'dark' | 'light' }) => {
  const [view, setView] = useState<'home' | 'chat'>('home');
  const [chatUser, setChatUser] = useState<User | null>(null);
  const [clients, setClients] = useState<User[]>([]);

  useEffect(() => {
    fetch('/api/users').then(res => res.json()).then(setClients);
  }, []);

  if (view === 'chat' && chatUser) {
    return <Chat currentUser={user} otherUser={chatUser} onBack={() => setView('home')} theme={theme} />;
  }

  const expiringAthletes = clients.filter(c => {
    if (!c.contract_end) return false;
    const end = new Date(c.contract_end);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return diff > 0 && diff < (7 * 1000 * 60 * 60 * 24); // next 7 days
  });

  const recentAthletes = [...clients]
    .sort((a, b) => {
      // Use created_at if available or ID
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA || b.id - a.id;
    })
    .slice(0, 2);

  return (
    <div className={`max-w-6xl mx-auto space-y-12 transition-all duration-500`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className={`text-6xl font-display font-black italic uppercase tracking-tighter leading-none transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>COACH HOME</h2>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-3">Benvenuto, {user.name} 👋</p>
        </div>
        <div className="flex gap-4">
          <div className="p-6 bg-accent/10 border border-accent/20 rounded-[2rem] text-center min-w-[140px]">
            <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-1">Atleti Totali</p>
            <p className="text-3xl font-display font-black italic">{clients.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <section className="space-y-6">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-3">
              <TrendingUp className="w-4 h-4" /> Ultimi Atleti Inseriti
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentAthletes.map(athlete => (
                <div key={athlete.id} className={`glass p-8 rounded-[2.5rem] flex items-center gap-6 group hover:shadow-2xl transition-all border-white/5 ${theme === 'light' ? 'bg-white border-zinc-200 hover:shadow-zinc-200' : ''}`}>
                  <div className="w-16 h-16 rounded-[1.5rem] bg-accent text-black flex items-center justify-center font-black text-2xl italic">
                    {athlete.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className={`text-2xl font-display font-black italic uppercase tracking-tighter leading-none mb-1 ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>{athlete.name}</h4>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest line-clamp-1">{athlete.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-red-500" /> Contratti in Scadenza (7gg)
            </h3>
            <div className="space-y-4">
              {expiringAthletes.length > 0 ? expiringAthletes.map(athlete => (
                <div key={athlete.id} className="glass p-6 rounded-3xl flex items-center justify-between border-red-500/20 bg-red-500/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black italic uppercase tracking-tighter text-lg leading-none">{athlete.name}</h4>
                      <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">
                        Scade il {new Date(athlete.contract_end!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all">Rinnova</button>
                </div>
              )) : (
                <div className="p-8 text-center glass rounded-3xl border-white/5">
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Nessun contratto in scadenza imminente.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          <Notifications 
            coachId={user.id} 
            onBack={() => {}} 
            theme={theme} 
            onReply={(userId) => {
              const client = clients.find(c => c.id === userId);
              if (client) {
                setChatUser(client);
                setView('chat');
              }
            }} 
          />
        </div>
      </div>
    </div>
  );
};


const PTDashboard = ({ pt, theme, clients, exercises, models, refreshClients, refreshExercises, refreshModels }: { pt: User, theme: 'dark' | 'light', clients: User[], exercises: Exercise[], models: ModelPlan[], refreshClients: () => void, refreshExercises: () => void, refreshModels: () => void }) => {
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [newPlanItems, setNewPlanItems] = useState<PlanItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'editor' | 'library' | 'models' | 'history' | 'preview' | 'chat' | 'load_model' | 'bio'>('bio');
  const [editingAthlete, setEditingAthlete] = useState<User | null>(null);
  const [chatUser, setChatUser] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [athleteSearch, setAthleteSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'experience' | 'age'>('all');
  const [filterValue, setFilterValue] = useState('');
  const [expandedDays, setExpandedDays] = useState<string[]>(['Giorno A']);

  const fetchUnread = () => {
    fetch(`/api/notifications/${pt.id}`)
      .then(res => res.json())
      .then(data => setUnreadCount(data.length));
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
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
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    if (selectedClient?.id === id) setSelectedClient(null);
    refreshClients();
  };

  const filteredExercises = useMemo(() => {
    if (!searchTerm) return [];
    return exercises.filter(ex => 
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (ex.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ex.muscle_group || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, exercises]);

  const filteredClients = useMemo(() => {
    let result = clients.filter(c => c.name.toLowerCase().includes(athleteSearch.toLowerCase()));
    if (filterType === 'experience' && filterValue) {
      result = result.filter(c => c.experience_years?.toString() === filterValue);
    } else if (filterType === 'age' && filterValue) {
      result = result.filter(c => c.age?.toString() === filterValue);
    }
    return result;
  }, [clients, athleteSearch, filterType, filterValue]);

  const getDaysRemaining = (endDate?: string) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

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

  if (view === 'models') {
    return (
      <div className="space-y-6">
        <button onClick={() => setView('editor')} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-bold uppercase tracking-widest text-xs">
          <ArrowLeft className="w-4 h-4" /> Torna alla Dashboard
        </button>
        <ModelsLibrary models={models} exercises={exercises} onUpdate={refreshModels} />
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
            pt_notes: item.pt_notes || ''
          }));
          setNewPlanItems([...newPlanItems, ...cleanedItems]);
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
            onClick={() => setView('models')}
            className="p-3 bg-white border border-zinc-200 rounded-2xl transition-all text-zinc-500 hover:text-zinc-900 hover:shadow-lg"
            title="Gestisci Modelli"
          >
            <ClipboardList className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setView('library')}
            className="p-3 bg-white border border-zinc-200 rounded-2xl transition-all text-zinc-500 hover:text-zinc-900 hover:shadow-lg"
            title="Gestisci Libreria"
          >
            <Dumbbell className="w-5 h-5" />
          </button>
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

        <div className="space-y-4">
          {filteredClients.map(client => {
            const daysLeft = getDaysRemaining(client.contract_end);
            return (
              <div key={client.id} className="relative group">
                <button
                  onClick={() => { setSelectedClient(client); setView('bio'); }}
                  className={`w-full text-left athlete-box flex items-center justify-between group border-2 transition-all duration-300 ${
                    selectedClient?.id === client.id 
                      ? 'bg-accent text-black border-accent shadow-2xl shadow-accent/40 scale-[1.02]' 
                      : (theme === 'dark' ? 'border-transparent bg-zinc-900/40' : 'border-transparent bg-white shadow-sm hover:shadow-md')
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl transition-colors duration-500 ${
                        selectedClient?.id === client.id 
                          ? 'bg-black/10 text-black' 
                          : (theme === 'dark' ? 'bg-zinc-800 text-accent' : 'bg-zinc-100 text-accent')
                      }`}>
                        {client.name.charAt(0)}
                      </div>
                      {daysLeft !== null && (
                        <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter shadow-md ${
                          daysLeft <= 7 ? 'bg-red-500 text-white animate-pulse' : (theme === 'dark' ? 'bg-zinc-900 text-accent' : 'bg-white text-accent border border-zinc-100')
                        }`}>
                          {daysLeft}g
                        </div>
                      )}
                    </div>
                    <div>
                      <p className={`font-black text-xl italic uppercase tracking-tighter transition-colors duration-500 ${
                        theme === 'dark' ? 'text-white' : (selectedClient?.id === client.id ? 'text-black' : 'text-zinc-900')
                      }`}>{client.name}</p>
                      <div className="flex flex-col gap-1">
                        <p className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${
                          selectedClient?.id === client.id ? 'text-black/60' : 'text-zinc-500'
                        }`}>
                          {client.email}
                        </p>
                        <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${
                          selectedClient?.id === client.id ? 'text-black/80' : 'text-accent'
                        }`}>
                          {client.age && <span>{client.age} anni</span>}
                          {client.age && client.experience_years && <span className="mx-1">•</span>}
                          {client.experience_years && <span>{client.experience_years} anni exp</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setChatUser(client); setView('chat'); }}
                      className={`p-3 rounded-xl transition-all ${
                        selectedClient?.id === client.id 
                          ? 'text-black/40 hover:text-black hover:bg-black/10' 
                          : 'text-zinc-500 hover:text-accent hover:bg-accent/5'
                      }`}
                      title="Apri Chat"
                    >
                      <MessageSquare className="w-5 h-5" />
                    </button>
                    <ChevronRight className={`w-6 h-6 transition-transform group-hover:translate-x-1 ${
                      selectedClient?.id === client.id ? 'text-black' : (theme === 'dark' ? 'text-zinc-700' : 'text-zinc-300')
                    }`} />
                  </div>
                </button>
                
                {/* Always visible edit/delete icons in top right corner of the card */}
                <div className="absolute top-4 right-4 flex gap-1 z-10 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setEditingAthlete(client); }}
                    className={`p-2 rounded-lg transition-all ${
                      selectedClient?.id === client.id 
                        ? 'text-black/30 hover:text-black hover:bg-black/5' 
                        : 'text-zinc-600 hover:text-blue-500 hover:bg-blue-500/5'
                    }`}
                    title="Modifica"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteAthlete(client.id); }}
                    className={`p-2 rounded-lg transition-all ${
                      selectedClient?.id === client.id 
                        ? 'text-black/30 hover:text-red-700 hover:bg-red-500/10' 
                        : 'text-zinc-600 hover:text-red-500 hover:bg-red-500/5'
                    }`}
                    title="Elimina"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
                className="glass w-full max-w-md p-10 rounded-[3.5rem] shadow-2xl border-white/10"
              >
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-4xl font-display font-black italic uppercase tracking-tighter text-white">Modifica Atleta</h3>
                  <button onClick={() => setEditingAthlete(null)} className="p-3 hover:bg-white/5 rounded-2xl transition-all text-zinc-500 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
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
      </div>

      {/* Plan Editor / Bio View */}
      <div className="lg:col-span-2 space-y-6">
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
                <div className="flex gap-3">
                  <button 
                    onClick={() => setView('editor')}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" /> Crea Scheda
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
                  
                  {/* Credentials Section - Hidden by default as requested */}
                  <div className="pt-4">
                    <button 
                      onClick={() => {
                        const el = document.getElementById('credentials-box');
                        if (el) el.classList.toggle('hidden');
                      }}
                      className="text-[10px] font-black text-accent uppercase tracking-widest hover:underline flex items-center gap-2"
                    >
                      <Key className="w-3 h-3" /> Mostra Credenziali Accesso
                    </button>
                    <div id="credentials-box" className="hidden mt-4 p-6 rounded-3xl bg-zinc-900 border border-white/10 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-[10px] font-black text-zinc-500">EMAIL:</span>
                        <span className="text-[10px] font-black text-white uppercase">{selectedClient.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[10px] font-black text-zinc-500">PASSWORD:</span>
                        <span className="text-[10px] font-black text-accent">{selectedClient.password}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Stato Contratto</h3>
                  <div className={`p-6 rounded-3xl border space-y-6 ${theme === 'dark' ? 'bg-zinc-900/50 border-white/5' : 'bg-zinc-50 border-zinc-200'}`}>
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
              <div className="flex gap-3">
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
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <Search className="w-6 h-6 text-accent" />
              </div>
              <input
                type="text"
                placeholder="Cerca esercizio (es. panca, squat, schiena, bicipiti...)"
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
                          <div className="md:col-span-1 flex gap-2">
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
                        onClick={() => setSearchTerm('')} // This just focuses search or we can make it open search
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
  const [age, setAge] = useState(user.age || 0);
  const [experience_years, setExperienceYears] = useState(user.experience_years || 0);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, age, experience_years }),
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
            <input type="number" className="input-field" value={age || ''} onChange={e => setAge(parseInt(e.target.value))} />
          </div>
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Anni di Esperienza</label>
            <input type="number" className="input-field" value={experience_years || ''} onChange={e => setExperienceYears(parseInt(e.target.value))} />
          </div>
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

  const customStyles = {
    fontFamily: settings.about_font_family || 'Inter',
    color: settings.about_text_color || (theme === 'dark' ? '#ffffff' : '#18181b')
  };

  return (
    <div className="relative overflow-hidden flex items-center justify-center p-6 md:p-12" style={customStyles}>
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/5 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center relative z-10">
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
          <div className="space-y-4">
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} className="h-1 w-24 bg-accent origin-left" />
            <h1 className={`font-display font-black italic uppercase tracking-tighter leading-[0.85] transition-colors duration-500 ${!settings.about_text_color ? (theme === 'dark' ? 'text-white' : 'text-zinc-900') : ''}`} style={{ fontSize: settings.about_title_size || 'clamp(4rem, 15vw, 10rem)', color: settings.about_text_color }}>
              {settings.about_title || 'Pietro Cassago'}
            </h1>
            <p className="text-accent font-black uppercase tracking-[0.3em] text-sm md:text-xl italic">
              {settings.about_subtitle || 'Performance Elite'}
            </p>
          </div>

          <p className="font-medium leading-relaxed opacity-80" style={{ fontSize: settings.about_desc_size || '1.25rem' }}>
            {settings.about_description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => {
              if (settings[`box${i}_enabled`] === false) return null;
              return (
                <div 
                  key={i} 
                  className="p-12 flex flex-col justify-center rounded-[3.5rem] shadow-xl group hover:scale-105 transition-all"
                  style={{ 
                    backgroundColor: settings[`box${i}_bg`] || '#2350D1',
                    minHeight: `${settings.about_box_size || 220}px`,
                    width: `${settings.about_box_width || 100}%`
                  }}
                >
                  <span 
                    className="text-[12px] font-black uppercase tracking-[0.2em] mb-3 opacity-70"
                    style={{ color: settings[`box${i}_color`] || '#ffffff' }}
                  >
                    {settings[`box${i}_label`] || (i === 1 ? 'Specialty' : i === 2 ? 'Focus' : 'Quality')}
                  </span>
                  <span 
                    className="text-3xl font-display font-black italic uppercase tracking-tighter"
                    style={{ color: settings[`box${i}_color`] || '#ffffff' }}
                  >
                    {settings[`box${i}_value`] || (i === 1 ? 'Calisthenics' : i === 2 ? 'Performance' : 'Elite')}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative">
          {user?.role === 'pt' && (
            <button 
              onClick={() => setIsEditing(true)}
              className="absolute -top-6 -right-6 z-20 bg-accent text-black p-4 rounded-2xl shadow-xl shadow-accent/20 hover:scale-110 transition-all font-black"
            >
              <Settings className="w-6 h-6" />
            </button>
          )}
          <div className="relative aspect-square md:aspect-[4/5] lg:aspect-square">
            <div className="absolute inset-0 border-[20px] border-accent/10 rounded-[4rem]" />
            <div className="absolute inset-[20px] bg-zinc-900 rounded-[3rem] overflow-hidden">
              <img src={settings.about_image || "https://picsum.photos/seed/coachbellu/800/800"} alt="Coach" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};


// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('fitplan_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTab, setActiveTab] = useState<'home' | 'dashboard' | 'about' | 'models'>('home');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('fitplan_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });
  const [settings, setSettings] = useState<any>({});
  const [clients, setClients] = useState<User[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [models, setModels] = useState<ModelPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshClients = () => fetch('/api/users').then(res => res.json()).then(setClients);
  const refreshExercises = () => fetch('/api/exercises').then(res => res.json()).then(setExercises);
  const refreshModels = () => fetch('/api/models').then(res => res.json()).then(setModels);

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(setSettings);
    if (user?.role === 'pt') {
      Promise.all([refreshClients(), refreshExercises(), refreshModels()]).then(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

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
              onClick={() => setActiveTab('home')}
              className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                activeTab === 'home' ? 'bg-accent text-black shadow-xl shadow-accent/20' : (theme === 'dark' ? 'text-zinc-500 hover:text-white hover:bg-white/5' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100')
              }`}
            >
              Home
            </button>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                activeTab === 'dashboard' ? 'bg-accent text-black shadow-xl shadow-accent/20' : (theme === 'dark' ? 'text-zinc-500 hover:text-white hover:bg-white/5' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100')
              }`}
            >
              Atleti
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
          {activeTab === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {user.role === 'pt' ? <PTHome user={user} theme={theme} /> : <UserDashboard user={user} theme={theme} />}
            </motion.div>
          ) : activeTab === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {user.role === 'pt' ? <PTDashboard pt={user} theme={theme} clients={clients} exercises={exercises} models={models} refreshClients={refreshClients} refreshExercises={refreshExercises} refreshModels={refreshModels} /> : <UserDashboard user={user} theme={theme} />}
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
              />
            </motion.div>
          ) : (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AboutMe settings={settings} theme={theme} user={user} onBack={() => setActiveTab('home')} updateSettings={(s: any) => setSettings(s)} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Footer Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-2xl border-t border-white/5 px-8 py-4 flex justify-around items-center z-30">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-2 ${activeTab === 'home' ? 'text-accent' : 'text-zinc-600'}`}
        >
          <UserIcon className="w-7 h-7" />
          <span className="text-[10px] font-black uppercase tracking-widest">Home</span>
        </button>
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
