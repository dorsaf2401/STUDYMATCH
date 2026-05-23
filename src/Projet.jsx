import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home, Users, FileText, User, Flame, GraduationCap, Settings, 
  Lock, Plus, ShieldCheck, Star, XCircle, Trash2, Save, Calendar,
  Fingerprint, Send, Sun, Moon, Check, Clock, Camera, Mail, Edit3,
  Bell, ChevronRight, Search, Filter, MessageSquare, BookOpen, 
  Award, ShieldAlert, Zap, Heart, Share2, MoreHorizontal, Info, LogOut
} from 'lucide-react';

// ========================================================================
// 1. CONSTANTES ET DONNÉES DE RÉFÉRENCE (MOCK DATA)
// ========================================================================

const UFR_LIST = [ "SEGMI", "LCE", "DSP", "PHILLIA", "STAPS", "SPSE","DROIT","SSA","SITEC"];
const ANNEE_LIST = ["L1", "L2", "L3", "M1", "M2", "Doctorat"];
const DISPO_SLOTS = ["08h-10h", "10h-12h", "12h-14h", "14h-16h", "16h-18h", "18h-20h"];
const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

const INITIAL_ANNONCES = [
  { 
    id: 1, 
    matiere: "Algèbre Linéaire", 
    auteur: "Marie Curie", 
    ufr: "MIASHS", 
    niveau: "L2",
    description: "Besoin d'aide pour comprendre les matrices de passage et les changements de base.",
    date: "Il y a 2h",
    urgent: true,
    vues: 42
  },
  { 
    id: 2, 
    matiere: "Macroéconomie", 
    auteur: "Jean Tirole", 
    ufr: "SEGMI", 
    niveau: "L3",
    description: "Révision collective pour le partiel sur le modèle IS-LM.",
    date: "Il y a 5h",
    urgent: false,
    vues: 128
  },
  { 
    id: 3, 
    matiere: "Python L1", 
    auteur: "Guido Van Rossum", 
    ufr: "MIASHS", 
    niveau: "L1",
    description: "Je bloque sur les fonctions récursives, quelqu'un pour m'expliquer ?",
    date: "Hier",
    urgent: false,
    vues: 89
  }
];

// ========================================================================
// 2. COMPOSANTS RÉUTILISABLES (UI KIT)
// ========================================================================

const CustomInput = ({ label, value, onChange, type = "text", icon: Icon, placeholder, darkMode }) => (
  <div className="space-y-1.5 w-full">
    {label && <label className="text-[10px] font-black text-blue-600 uppercase italic ml-2">{label}</label>}
    <div className="relative">
      <input 
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full p-4 rounded-2xl border-2 font-bold text-xs outline-none transition-all duration-300
          ${darkMode 
            ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' 
            : 'bg-slate-100 border-slate-200 text-slate-900 focus:border-blue-600'}`}
      />
      {Icon && <Icon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />}
    </div>
  </div>
);

const Badge = ({ children, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    red: "bg-red-50 text-red-600 border-red-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100"
  };
  return (
    <span className={`${colors[color]} px-2.5 py-1 rounded-lg text-[9px] font-black uppercase italic border`}>
      {children}
    </span>
  );
};

// ========================================================================
// 3. APPLICATION PRINCIPALE
// ========================================================================

const App = () => {
  // --- ÉTATS SYSTÈME ---
  const [page, setPage] = useState('auth');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [allMatches, setAllMatches] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [score, setScore] = useState(null); // <--- LIGNE AJOUTÉE POUR LE MATCHING

  // --- ÉTATS UTILISATEUR ---
  const [user, setUser] = useState({
    prenom: "Alexandre",
    nom: "Samba",
    idEtudiant: "20240982",
    ufr: "MIASHS",
    annee: "L2",
    groupeTD: "B1",
    email: "a.samba@nanterre.univ.fr",
    motDePasse: "Nanterre2026!",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alexandre",
    bio: "Étudiant sérieux en MIASHS, je cherche à m'améliorer en Macro.",
    pointsForts: ["Algèbre Linéaire", "Python", "Probabilités"],
    pointsFaibles: ["Macroéconomie", "Anglais Technique", "Droit des Affaires"],
    fiabilite: 96,
    nbEvaluations: 12,
    dispos: {
      "Lun": ["08h-10h", "14h-16h"],
      "Mar": ["10h-12h", "16h-18h"],
      "Mer": ["08h-10h", "14h-18h"],
      "Jeu": [],
      "Ven": ["10h-12h", "18h-20h"],
      "Sam": ["10h-14h"]
    }
  });

  // ÉTAT POUR L'ÉDITION DU PROFIL (SETTINGS)
  const [editUser, setEditUser] = useState({ ...user });
  
  // ÉTAT POUR LE QUESTIONNAIRE
  const [evalForm, setEvalForm] = useState({
    implication: 0,
    qualite: 0,
    communication: 0,
    veracite: 0,
    commentaire: ""
  });

  // --- LOGIQUE MATCHING ---
  useEffect(() => {
    if (page === 'groups' && user && user.idEtudiant) {
      setLoading(true);
      fetch('http://localhost:5000/api/get-all-matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: user })
      })
      .then(res => res.json())
      .then(data => {
        // Nettoyage complet : on transforme toutes les chaînes JSON en objets JS
        // Cela empêche l'erreur ".map is not a function"
        const cleanedMatches = data.map(m => ({
          ...m,
          interests: typeof m.interests === 'string' ? JSON.parse(m.interests) : m.interests || [],
          pointsForts: typeof m.pointsForts === 'string' ? JSON.parse(m.pointsForts) : m.pointsForts || [],
          pointsFaibles: typeof m.pointsFaibles === 'string' ? JSON.parse(m.pointsFaibles) : m.pointsFaibles || [],
          dispos: typeof m.dispos === 'string' ? JSON.parse(m.dispos) : m.dispos || {}
        }));
        
        setAllMatches(cleanedMatches);
        setLoading(false);
      })
      .catch(err => { 
        console.error("Erreur lors de la récupération des matchs :", err); 
        setLoading(false); 
      });
    }
  }, [page, user]);

  // --- THEME LOGIQUE ---
  const colors = {
    bg: darkMode ? 'bg-slate-950' : 'bg-slate-50',
    card: darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100',
    text: darkMode ? 'text-white' : 'text-slate-950',
    sub: darkMode ? 'text-slate-400' : 'text-slate-500',
    nav: darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/95 border-slate-50'
  };

  // --- ACTIONS ---
  const handleAuth = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setPage('home');
      setLoading(false);
    }, 1500);
  };

  const saveSettings = () => {
    setLoading(true);
    setTimeout(() => {
      setUser({ ...editUser });
      setPage('profile');
      setLoading(false);
    }, 1000);
  };

  const toggleDispo = (jour, slot) => {
    const currentDispos = { ...editUser.dispos };
    if (currentDispos[jour].includes(slot)) {
      currentDispos[jour] = currentDispos[jour].filter(s => s !== slot);
    } else {
      currentDispos[jour] = [...currentDispos[jour], slot];
    }
    setEditUser({ ...editUser, dispos: currentDispos });
  };

  const handleRating = (key, val) => {
    setEvalForm({ ...evalForm, [key]: val });
  };

  // ========================================================================
  // 4. RENDU DES SOUS-COMPOSANTS (PAGES)
  // ========================================================================

  const NotificationScreen = ({ colors, notifications, setPage }) => (
  <div className={`p-6 pb-24 h-full ${colors.bg}`}>
    <h2 className={`text-2xl font-[1000] italic uppercase mb-6 ${colors.text}`}>Demandes</h2>
    {notifications.length === 0 ? (
      <p className="text-center text-slate-400 text-xs italic">Aucune notification.</p>
    ) : (
      <div className="space-y-4">
        {notifications.map((n, i) => (
          <div key={i} className="p-4 bg-white rounded-2xl border border-blue-100 shadow-sm">
             <p className="font-bold text-xs">Demande de {n.sender_id}</p>
          </div>
        ))}
      </div>
    )}
  </div>
);

  // --- COMPOSANT : AUTHENTIFICATION ---
  const AuthScreen = () => (
    <div className="h-full flex flex-col p-10 bg-white items-center justify-center animate-in fade-in duration-700">
      <div className="relative mb-12">
        <div className="bg-blue-600 w-24 h-24 rounded-[35px] flex items-center justify-center shadow-2xl rotate-6 animate-bounce">
          <GraduationCap color="white" size={48}/>
        </div>
        <div className="absolute -bottom-2 -right-2 bg-green-500 p-2 rounded-full border-4 border-white">
          <Zap size={16} color="white" fill="white" />
        </div>
      </div>
      
      <div className="text-center mb-10">
        <h1 className="text-4xl font-[1000] italic tracking-tighter text-slate-950">
          STUDY<span className="text-blue-600">MATCH</span>
        </h1>
        <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-[0.3em]">Nanterre Campus Edition</p>
      </div>

      <form onSubmit={handleAuth} className="w-full space-y-5">
        <div className="space-y-4">
          <CustomInput 
            icon={Fingerprint} 
            placeholder="Numéro Étudiant (ex: 2024...)" 
            darkMode={false}
          />
          <CustomInput 
            type="password" 
            icon={Lock} 
            placeholder="Mot de passe" 
            darkMode={false}
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-slate-950 text-white py-6 rounded-[30px] font-black uppercase text-xs shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 overflow-hidden group"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Accéder au Campus <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform"/></>
          )}
        </button>

        <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
          <p className="text-[9px] text-center font-bold text-slate-400 uppercase italic">OU SE CONNECTER AVEC</p>
            <div className="flex gap-3">
               <button 
                  type="button" 
                  className="flex-1 bg-blue-50 text-blue-600 p-4 rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase italic border border-blue-100"
            >
                 <Mail size={14} /> ENT
                </button>
            </div>
        </div>

      </form>
    </div>
  );

  // --- COMPOSANT : ACCUEIL (FLUX) ---
  const HomeScreen = () => (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
      
      {/* C'EST ICI QUE LE SCORE VA S'AFFICHER EN BLEU */}
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-center">
        {score !== null ? (
          <p className="text-xs font-black text-blue-600 italic">🔥 Compatibilité avec ce binôme : {score}%</p>
        ) : (
          <p className="text-xs text-slate-400 italic">Analyse de compatibilité en cours...</p>
        )}
      </div>

      {/* Le reste de votre code HomeScreen original continue ici... */}
      <div className="relative group">
        {/* ... */}
      </div>
      {/* ... */}

      <div className="p-6 space-y-6">
      <h2 className="text-xl font-black uppercase">Mes Matchs</h2>
      {matchs.map((m, i) => (
        <div key={i} className="p-4 bg-white rounded-2xl border border-blue-100 flex justify-between items-center">
          <div>
            <p className="font-bold">{m.nom}</p>
            <p className="text-[10px] text-slate-400">Étudiant Nanterre</p>
          </div>
          <div className="bg-blue-600 text-white px-3 py-1 rounded-lg font-black italic">
            {m.score}%
          </div>
        </div>
      ))}
      <h2 className="text-xl font-black uppercase mt-10">Flux Live</h2>
      {/* ... votre reste du flux ... */}
    </div>

      <div className="relative group">
        <div className="absolute inset-0 bg-blue-600 rounded-[40px] blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
        <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[40px] text-white shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ShieldCheck size={120} className="rotate-12" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-white/20 px-3 py-1 rounded-full text-[9px] font-black uppercase italic tracking-widest backdrop-blur-md border border-white/20 flex items-center gap-1.5">
                <Bell size={10} className="animate-swing" /> Action Requise
              </span>
            </div>
            <h3 className="text-2xl font-black italic leading-none mb-2">VALIDATION<br/>FIN DE PROJET</h3>
            <p className="text-[11px] font-bold opacity-80 mb-6 max-w-[200px]">
              Ton binôme attend ton évaluation sur le projet <b>R-Studio</b> pour valider sa fiabilité.
            </p>
            <button 
              onClick={() => setShowEvalModal(true)}
              className="w-full bg-white text-blue-600 py-4 rounded-2xl font-[1000] uppercase text-[10px] italic shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Lancer le Questionnaire <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <h2 className={`text-2xl font-[1000] italic uppercase tracking-tighter ${colors.text}`}>
            Le Flux <span className="text-blue-600">Live</span>
          </h2>
          <span className="text-[10px] font-black text-slate-400 uppercase italic mb-1">{INITIAL_ANNONCES.length} Offres</span>
        </div>
        
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {['Toutes', 'Ma Filière', 'Urgent', 'Favoris'].map((tab, i) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase italic whitespace-nowrap transition-all
                ${(tab === activeTab || (i===0 && activeTab==='all')) 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                  : `${darkMode ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-100 text-slate-400'} border`}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-5 pb-20">
        {INITIAL_ANNONCES.map((annonce) => (
          <div 
            key={annonce.id} 
            className={`${colors.card} p-6 rounded-[35px] border shadow-sm hover:shadow-md transition-all active:scale-[0.98] group`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-2">
                <Badge color={annonce.urgent ? "red" : "blue"}>{annonce.ufr}</Badge>
                <Badge color="orange">{annonce.niveau}</Badge>
              </div>
              {annonce.urgent && <Flame size={18} className="text-orange-500 animate-pulse" />}
            </div>
            
            <h4 className={`text-lg font-black italic leading-tight ${colors.text} group-hover:text-blue-600 transition-colors`}>
              {annonce.matiere}
            </h4>
            <p className={`text-[11px] mt-2 leading-relaxed line-clamp-2 ${colors.sub}`}>
              "{annonce.description}"
            </p>

            <div className="mt-6 pt-5 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-black text-xs text-slate-500 italic">
                  {annonce.auteur.charAt(0)}
                </div>
                <div>
                  <p className={`text-[10px] font-black uppercase italic ${colors.text}`}>{annonce.auteur}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase italic">{annonce.date}</p>
                </div>
              </div>
              <button className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                <MessageSquare size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // --- COMPOSANT : PARAMÈTRES ---
  const SettingsScreen = () => (
    <div className="p-6 space-y-10 pb-40 animate-in slide-in-from-right duration-500">
      <div className="flex justify-between items-center">
        <h2 className={`text-3xl font-[1000] italic uppercase tracking-tighter ${colors.text}`}>Réglages</h2>
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className={`p-3 rounded-2xl border transition-all ${darkMode ? 'bg-slate-900 border-slate-700 text-yellow-400' : 'bg-white border-slate-100 text-slate-600'}`}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <img src={editUser.avatar} className="w-24 h-24 rounded-[35px] border-4 border-blue-600 object-cover shadow-2xl" />
            <button className="absolute -bottom-2 -right-2 bg-slate-950 text-white p-2.5 rounded-xl border-4 border-white shadow-lg">
              <Camera size={16} />
            </button>
          </div>
          <div className="flex-1 space-y-2">
            <h3 className={`text-xl font-black italic ${colors.text}`}>{editUser.prenom} {editUser.nom}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase italic">ID : {editUser.idEtudiant}</p>
          </div>
        </div>
      </div>
      <button 
        onClick={saveSettings}
        className="w-full bg-blue-600 text-white py-8 rounded-[40px] font-[1000] uppercase italic shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
      >
        <Save size={24}/> Enregistrer mon profil
      </button>
    </div>
  );

  // --- MODALE : QUESTIONNAIRE ---
  const EvalModal = () => (
    <div className={`fixed inset-0 z-[2000] flex flex-col animate-in slide-in-from-bottom duration-500 ${darkMode ? 'bg-slate-950' : 'bg-white'}`}>
      <div className="p-8 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
        <h2 className={`text-2xl font-[1000] italic uppercase ${colors.text}`}>VÉRIFICATION<br/><span className="text-blue-600">DE FIABILITÉ</span></h2>
        <button onClick={() => setShowEvalModal(false)} className="p-4 bg-slate-100 rounded-full"><XCircle size={32} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-8">
        {/* Contenu du questionnaire ici */}
      </div>
      <div className="p-8 border-t">
        <button 
          onClick={() => { alert("Transmis !"); setShowEvalModal(false); }}
          className="w-full bg-blue-600 text-white py-6 rounded-[30px] font-[1000] uppercase italic shadow-2xl"
        >
          Transmettre l'évaluation <Send size={20}/>
        </button>
      </div>
    </div>
  );

  // ========================================================================
  // 5. RENDU FINAL
  // ========================================================================

  return (
    <div className={`max-w-[375px] mx-auto ${colors.bg} h-[812px] relative font-sans shadow-2xl overflow-hidden border-[8px] border-white rounded-[50px]`}>
      {page === 'auth' ? <AuthScreen /> : (
        <>
          <header className={`${colors.nav} p-6 flex justify-between items-center border-b sticky top-0 z-[100] backdrop-blur-md`}>
            <h1 className={`text-xl font-[1000] italic ${colors.text}`}>STUDY<span className="text-blue-600">MATCH</span></h1>
            <div className="flex items-center gap-3">
              <button onClick={() => setPage('notifications')} className="relative"><Bell size={22}/></button>
              <button onClick={() => setPage('settings')} className="text-slate-400"><Settings size={22}/></button>
              <img src={user.avatar} onClick={() => setPage('profile')} className="w-10 h-10 rounded-xl border-2 border-blue-600 object-cover cursor-pointer" alt="Profile" />
            </div>
          </header>

          <main className="h-[calc(100%-180px)] overflow-y-auto no-scrollbar">
            {page === 'notifications' && (
              <div className="p-6">
                <h2 className={`text-xl font-black mb-4 ${colors.text}`}>Mes Demandes</h2>
                {notifications.map((n, i) => <div key={i} className="p-4 bg-white rounded-2xl mb-2">Demande de {n.sender_id}</div>)}
              </div>
            )}
            {page === 'home' && <HomeScreen />}
            {page === 'groups' && (
              <div className="p-6 pb-24">
                <h2 className={`text-2xl font-[1000] italic uppercase mb-6 ${colors.text}`}>Trouver un binôme</h2>
                <div className="space-y-4">
                  {allMatches.map((match, i) => (
                    <div key={i} className={`${colors.card} p-4 rounded-2xl flex items-center justify-between border`}>
                      <p className={`font-black italic ${colors.text}`}>{match.nom}</p>
                      <div className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs">{match.score}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {page === 'profile' && <div className="p-6">Profil de {user.prenom}</div>}
          </main>

          <nav className="app-nav">
             <button onClick={() => setPage('home')} className={`nav-item ${page === 'home' ? 'active' : ''}`}><Home size={22}/></button>
             <button onClick={() => setPage('offers')} className={`nav-item ${page === 'offers' ? 'active' : ''}`}><FileText size={22}/></button>
             <div className="nav-center-holder"><button className="btn-nav-center"><Plus size={20} color="white" /></button></div>
             <button onClick={() => setPage('groups')} className={`nav-item ${page === 'groups' ? 'active' : ''}`}><Users size={22}/></button>
             <button onClick={() => setPage('profile')} className={`nav-item ${page === 'profile' ? 'active' : ''}`}><User size={22}/></button>
          </nav>
        </>
      )}
    </div>
  );
};
export default App;