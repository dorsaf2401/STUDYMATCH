import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Home, Users, FileText, User, Flame, GraduationCap, Settings, 
  Lock, Plus, ShieldCheck, Star, XCircle, Trash2, Save, Calendar,
  Fingerprint, Send, Sun, Moon, Check, Clock, Camera, Mail, Edit3,
  Bell, ChevronRight, Search, Filter, MessageSquare, BookOpen, 
  Award, ShieldAlert, Zap, Heart, Share2, MoreHorizontal, Info, LogOut, Target, TrendingUp, 
  Globe, Languages, Activity, Move
} from 'lucide-react';

const QuizScreen = React.memo(({ questions, setIsQuizActive }) => {
  // 1. Les données sont figées dans une REF pour éviter les re-rendus inutiles
  const quizDataRef = useRef(shuffleArray(questions || []));
  
  const [currentIdx, setCurrentIdx] = useState(0); 
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef(null);

  // Nettoyage automatique des timers si le quiz est fermé ou démonté
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // La question actuelle est lue depuis la REF
  const q = quizDataRef.current[currentIdx];

  // 2. Mélange des réponses stable pour la question en cours
  const shuffledAnswers = useMemo(() => {
    if (!q) return [];
    return shuffleArray(q.a.map((ans, i) => ({ text: ans, isCorrect: i === q.correct })));
  }, [currentIdx, q]); 

  if (!q) return null;

  const handleAnswer = (option) => {
    if (feedback !== null) return; 

    setSelectedIndex(option.text);
    const isCorrect = option.isCorrect;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    
    if (isCorrect) setScore(prev => prev + 1);

  timerRef.current = setTimeout(() => {
  if (currentIdx + 1 < quizDataRef.current.length) {
    setCurrentIdx(prev => prev + 1);
    setFeedback(null);
    setSelectedIndex(null);
  } else {
    setIsFinished(true); 
  }
}, 800);
  };

  const progress = ((currentIdx + 1) / quizDataRef.current.length) * 100;

  return (
    <div className="quiz-container" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', background: '#f8fafc' }}>
      
      {isFinished ? (
        // ÉCRAN DE RÉSULTAT
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginBottom: '20px' }}>Défi terminé ! 🏆</h2>
          <p style={{ fontSize: '18px', color: '#64748b', marginBottom: '30px' }}>
            Score final : <strong>{score} / {quizDataRef.current.length}</strong>
          </p>
          <button 
            onClick={() => setIsQuizActive(false)} 
            style={{ background: '#2563eb', color: 'white', padding: '14px 28px', borderRadius: '16px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
          >
            Retour au menu
          </button>
        </div>
      ) : (
        // ÉCRAN DE JEU
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <button 
              onClick={() => setIsQuizActive(false)} 
              style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '8px 12px', cursor: 'pointer', color: '#64748b', fontSize: '12px', fontWeight: 'bold' }}
            >
              Quitter
            </button>
            <span style={{ fontSize: '14px', fontWeight: '800', color: '#2563eb' }}>
              Question {currentIdx + 1} / {quizDataRef.current.length}
            </span>
          </div>
          
          <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '10px', marginBottom: '40px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: '#2563eb', transition: 'width 0.4s ease' }}></div>
          </div>

          <div className="question-card" style={{ background: 'white', padding: '30px 20px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '30px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{q.q}</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {shuffledAnswers.map((option, i) => {
              const isSelected = feedback !== null;
              let bgColor = 'white';
              let borderColor = '#e2e8f0';
              
              if (feedback === 'correct' && option.isCorrect) { 
                bgColor = '#dcfce7'; borderColor = '#22c55e'; 
              } else if (feedback === 'wrong') {
                 if (option.isCorrect) { bgColor = '#dcfce7'; borderColor = '#22c55e'; }
                 else if (option.text === selectedIndex) { bgColor = '#fee2e2'; borderColor = '#ef4444'; }
              }

              return (
                <button 
                  key={i} 
                  onClick={() => handleAnswer(option)} 
                  disabled={isSelected} 
                  style={{ width: '100%', padding: '18px', borderRadius: '18px', border: `2px solid ${borderColor}`, background: bgColor, fontWeight: '700', cursor: isSelected ? 'default' : 'pointer' }}
                >
                  {option.text}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Cette condition empêche tout re-rendu non désiré venant du parent
  return prevProps.questions === nextProps.questions && prevProps.setIsQuizActive === nextProps.setIsQuizActive;
});

const SubjectSelector = ({ quizData, onSelect, onBack, getSubjectIcon }) => (
  <div className="p-6 h-full flex flex-col bg-slate-50 overflow-y-auto animate-in fade-in duration-500">
    <div style={{ marginBottom: '24px' }}>
      <button 
        onClick={onBack} 
        style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '800', fontSize: '12px', cursor: 'pointer', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '5px' }}
      >
        <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /> Retour à l'accueil
      </button>
      <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' }}>
        Tes Quiz d'entraînement
      </h2>
      <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Sélectionne une matière</p>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingBottom: '100px' }}>
      {Object.keys(quizData).map((subject) => (
        <button 
          key={subject}
          onClick={() => onSelect(subject)}
          style={{
            backgroundColor: '#ffffff', padding: '20px 12px', borderRadius: '24px', border: '1px solid #e2e8f0',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
            {getSubjectIcon(subject)}
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: '900', fontSize: '13px', color: '#0f172a', margin: 0 }}>{subject}</p>
          </div>
          <div style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '6px 12px', borderRadius: '12px', fontWeight: '800', fontSize: '10px', width: '100%' }}>
            Démarrer →
          </div>
        </button>
      ))}
    </div>
  </div>
);

const LevelSelector = ({ subject, onSelect, onBack }) => (
  <div className="p-6 h-full flex flex-col bg-slate-50 overflow-y-auto animate-in slide-in-from-right duration-300">
    <div style={{ marginBottom: '24px' }}>
      <button 
        onClick={onBack} 
        style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '800', fontSize: '12px', cursor: 'pointer', marginBottom: '16px' }}
      >
        ← Retour aux matières
      </button>
      <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' }}>
        Niveau : {subject}
      </h2>
      <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Choisis la difficulté</p>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
      {["Facile", "Moyen", "Difficile"].map((level) => (
        <button 
          key={level}
          onClick={() => onSelect(level)}
          style={{
            backgroundColor: '#ffffff', padding: '20px', borderRadius: '24px', border: '1px solid #e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: level === 'Facile' ? '#dcfce7' : level === 'Moyen' ? '#fef3c7' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {level === 'Facile' ? <Star size={20} color="#16a34a" /> : level === 'Moyen' ? <Award size={20} color="#d97706" /> : <Flame size={20} color="#dc2626" />}
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontWeight: '900', fontSize: '15px', color: '#0f172a', margin: 0 }}>{level}</p>
              <p style={{ fontSize: '10px', color: '#64748b', fontWeight: '700' }}>10 questions</p>
            </div>
          </div>
          <ChevronRight size={20} color="#94a3b8" />
        </button>
      ))}
    </div>
  </div>
);

// ========================================================================
// 1. CONSTANTES ET DONNÉES DE RÉFÉRENCE (MOCK DATA)
// ========================================================================


const btnStyleEval = {
  green: { width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #bbf7d0', backgroundColor: '#f0fdf4', color: '#166534', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', textAlign: 'left' },
  blue: { width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', color: '#1e40af', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', textAlign: 'left' },
  orange: { width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #fed7aa', backgroundColor: '#fff7ed', color: '#c2410c', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', textAlign: 'left' },
  red: { width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #fecaca', backgroundColor: '#fef2f2', color: '#991b1b', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', textAlign: 'left' },
  gray: { width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#475569', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', textAlign: 'left' }
};

const estAnneeSuperieure = (anneeUser, anneeAuteur) => {
  const ordre = ["L1", "L2", "L3", "M1", "M2", "Doctorat"];
  return ordre.indexOf(anneeUser) > ordre.indexOf(anneeAuteur);
};

const UFR_LIST = [ "SEGMI", "LCE", "DSP", "PHILLIA", "STAPS", "SPSE","DROIT","SSA","SITEC"];
const ANNEE_LIST = ["L1", "L2", "L3", "M1", "M2", "Doctorat"];
const DISPO_SLOTS = ["08h-10h", "10h-12h", "12h-14h", "14h-16h", "16h-18h", "18h-20h"];

// Le dimanche est bien conservé ici
const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

// Listes fermées de sélection pour l'inscription et les réglages (StudyMatch AI)
const INTERESTS_LIST = ["Sport", "Pilates", "Danse", "Gaming", "Musique", "Littérature", "Cinéma", "Cuisine"];
const METHODS_LIST = ["Solo / Calme", "En groupe / Bibli", "Proactif / Organisé", "Dernière minute"];

// Nouvelle liste exacte de matières demandée pour les points forts et points faibles
const SUBJECTS_LIST = [
  "Droit", 
  "Mathématiques", 
  "Informatique", 
  "Économie", 
  "Management", 
  "Histoire", 
  "Philosophie", 
  "Français", 
  "Anglais", 
  "Espagnol", 
  "Italien", 
  "Psychologie", 
  "Sociologie", 
  "Anatomie", 
  "Biomécanique"
];

// Liste fixe et stable de 20 avatars diversifiés pour la sélection interactive
const AVATARS_GALLERY = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Alexandre",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Melanie",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Chloe",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Maxime",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Antoine",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Ines",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Hugo",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Camille",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Enzo",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Lea",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Nathan",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Manon",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Louis",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Clara",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Gabriel",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jade"
];

// Données initiales pour la messagerie
const INITIAL_CHATS = [
  {
    id: 1,
    name: "Marie Curie",
    type: "binome",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marie",
    unread: true,
    messages: [
      { sender: "Marie Curie", text: "Salut ! On se capte à la BU pour les maths ?", time: "14:32" }
    ]
  },
  {
    id: 2,
    name: "Groupe Économie (IS-LM)",
    type: "annonce",
    avatar: null,
    unread: false,
    messages: [
      { sender: "Jean Tirole", text: "J'amène mes fiches de révision !", time: "Hier" },
      { sender: "Alexandre Samba", text: "Parfait, j'arrive dans 15 min.", time: "Hier" }
    ]
  }
];



const INITIAL_ANNONCES = [
  { 
    id: 1, 
    matiere: "Mathématiques", 
    auteur: "Marie Curie", 
    ufr: "MIASHS", 
    niveau: "L2",
    description: "Besoin d'aide pour comprendre les matrices de passage et les changements de base.",
    date: "Il y a 2h",
    urgent: true,
    vues: 42,
    placesMax: 3,      
    participants: []
  },
  { 
    id: 2, 
    matiere: "Économie", 
    auteur: "Jean Tirole", 
    ufr: "SEGMI", 
    niveau: "L3",
    description: "Révision collective pour le partiel sur le modèle IS-LM.",
    date: "Il y a 5h",
    urgent: false,
    vues: 128,
    placesMax: 5,      
    participants: []
  },
  { 
    id: 3, 
    matiere: "Informatique", 
    auteur: "Guido Van Rossum", 
    ufr: "MIASHS", 
    niveau: "L1",
    description: "Je bloque sur les fonctions récursives, quelqu'un pour m'expliquer ?",
    date: "Hier",
    urgent: false,
    vues: 89,
    placesMax: 4,
    participants: []
  },

  {
    id: 101, 
    matiere: "Économie", 
    auteur: "Jean Tirole", 
    ufr: "SEGMI", 
    niveau: "M1",
    description: "Tutorat intensif sur la théorie des jeux.",
    date: "Publié il y a 10min",
    urgent: false,
    vues: 0,
    placesMax: 2,
    participants: [],
    isTutorat: true // <-- Indispensable pour le filtre
  },

  { 
    id: 102, 
    matiere: "Droit", 
    auteur: "Portalis", 
    ufr: "DROIT", 
    niveau: "L3",
    description: "Aide à la rédaction de mémoires et méthodologie.",
    date: "Publié il y a 30min",
    urgent: true,
    vues: 0,
    placesMax: 2,
    participants: [],
    isTutorat: true // <-- Indispensable pour le filtre
  }
];



// ========================================================================
// 2. COMPOSANTS SECONDAIRES RESTANTS
// ========================================================================

const Badge = ({ children, color = "blue" }) => <span className={`badge badge-${color}`}>{children}</span>;

// ========================================================================
// 2.5. COMPOSANT DU CALENDRIER INTERACTIF (AVEC DIMANCHE ET STYLE BLEU CHIPS)
// ========================================================================

const AvailabilityManager = ({ initialDispos, onChange, readOnly = false }) => {
  const toggleSlot = (jour, slot) => {
    if (readOnly) return;
    
    const currentSlots = [...(initialDispos[jour] || [])];
    let newSlots;
    
    if (currentSlots.includes(slot)) {
      newSlots = currentSlots.filter(s => s !== slot);
    } else {
      newSlots = [...currentSlots, slot];
    }
    
    onChange(jour, newSlots);
  };

  return (
    <div className="dispo-section" style={{ marginTop: '16px', background: 'white', padding: '16px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
      <div style={{ marginBottom: '12px' }}>
        <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase' }}>
          {readOnly ? "Planning de révision" : "Choisir mes horaires"}
        </h3>
        {!readOnly && <p style={{ fontSize: '10px', color: '#64748b' }}>Appuie sur les cases pour basculer tes dispos (créneaux de 2h)</p>}
      </div>

      <div className="table-wrapper" style={{ overflowX: 'auto' }}>
        <table className="dispo-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '4px' }}></th>
              {DISPO_SLOTS.map(slot => (
                <th key={slot} style={{ fontSize: '8px', color: '#64748b', padding: '6px 2px', textAlign: 'center', fontWeight: 'bold' }}>
                  {slot}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {JOURS.map(jour => (
              <tr key={jour}>
                <td className="day-line" style={{ fontSize: '11px', fontWeight: 'bold', color: '#2563eb', padding: '8px 4px', width: '35px', textTransform: 'uppercase' }}>
                  {jour}
                </td>
                
                {DISPO_SLOTS.map(slot => {
                  const isActive = initialDispos[jour]?.includes(slot);
                  return (
                    <td key={slot} style={{ padding: '4px', textAlign: 'center' }}>
                      <button
                        type="button"
                        disabled={readOnly}
                        onClick={() => toggleSlot(jour, slot)}
                        style={{
                          width: '100%',
                          height: '26px',
                          minWidth: '40px',
                          border: isActive ? 'none' : '1px solid #cbd5e1',
                          borderRadius: '8px',
                          background: isActive ? '#2563eb' : '#f8fafc',
                          color: isActive ? 'white' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: readOnly ? 'default' : 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: isActive ? '0 2px 4px rgba(37, 99, 235, 0.2)' : 'none'
                        }}
                      >
                        {isActive && <Check size={12} strokeWidth={4} />}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!readOnly && (
        <div style={{ marginTop: '12px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '12px', height: '12px', background: '#2563eb', borderRadius: '3px' }}></div>
            <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#64748b' }}>Disponible</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '12px', height: '12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '3px' }}></div>
            <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#64748b' }}>Occupé(e)</span>
          </div>
        </div>
      )}
    </div>
  );
};


const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);


// ========================================================================
// 3. APPLICATION PRINCIPALE
// ========================================================================

const App = () => {
  const [sortOrder, setSortOrder] = useState("desc"); // "desc" (plus élevé) ou "asc" (moins élevé)
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [students, setStudents] = useState([]);
  const [pendingTutorat, setPendingTutorat] = useState(null);
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [isQuizActive, setIsQuizActive] = useState(false);
const [selectedSubject, setSelectedSubject] = useState(null);
const [selectedLevel, setSelectedLevel] = useState(null);
const [showSubjectList, setShowSubjectList] = useState(false);
const [currentChatId, setCurrentChatId] = useState(null);
const [newMessageText, setNewMessageText] = useState("");
  const [matches, setMatches] = useState([]);
  const [tutoratToConfirm, setTutoratToConfirm] = useState(null);
  const [tutoratOnly, setTutoratOnly] = useState(false);
  const [page, setPage] = useState('auth');
  const [isSending, setIsSending] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allMatches, setAllMatches] = useState([]);
  const [annonces, setAnnonces] = useState(INITIAL_ANNONCES);
const [annonceForm, setAnnonceForm] = useState({ matiere: SUBJECTS_LIST[0], description: "", placesMax: 2, urgent: false, isTutorat: false });
const [isCreatingAnnonce, setIsCreatingAnnonce] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [evalStep, setEvalStep] = useState(1);
const [evalAnswers, setEvalAnswers] = useState({});
  const [user, setUser] = useState({
    prenom: "Alexandre",
    nom: "Samba",
    idEtudiant: "20240982",
    ufr: "MIASHS",
    annee: "L2",
    groupeTD: "B1",
    email: "20240982@nanterre.univ.fr",
    motDePasse: "Nanterre2026!",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alexandre",
    bio: "Étudiant sérieux en MIASHS, je cherche à m'améliorer.",
    pointsForts: ["Mathématiques", "Informatique"],
    pointsFaibles: ["Économie"],
    interests: ["Sport", "Gaming"],
    methode: "Solo / Calme",
    fiabilite: 96,
    nbEvaluations: 12,
    dispos: {
      "Lun": ["08h-10h", "14h-16h"],
      "Mar": ["10h-12h", "16h-18h"],
      "Mer": ["08h-10h", "14h-18h"],
      "Jeu": [],
      "Ven": ["10h-12h", "18h-20h"],
      "Sam": ["10h-14h"],
      "Dim": []
    },
    wallet:0
  });

  const [editUser, setEditUser] = useState({ ...user });

  // --- ÉTAT LOCAL DU FORMULAIRE D'INSCRIPTION ---
  const [signupForm, setSignupForm] = useState({
    prenom: "",
    nom: "",
    idEtudiant: "",
    annee: "L1",
    ufr: "SEGMI",
    motDePasse: "",
    confirmerMotDePasse: "",
    interests: [],
    methode: "Solo / Calme",
    pointsForts: [],
    pointsFaibles: [],
    avatar: AVATARS_GALLERY[0],
    dispos: {
      "Lun": [], "Mar": [], "Mer": [], "Jeu": [], "Ven": [], "Sam": [], "Dim": []
    }
  });

  const [authForm, setAuthForm] = useState({
    idEtudiant: "",
    motDePasse: ""
  });

  // --- ÉTAT LOCAL POUR MOT DE PASSE OUBLIÉ ---
const [forgotPasswordForm, setForgotPasswordForm] = useState({
  idEtudiant: "",
  nouveauMotDePasse: "",
  confirmerNouveauMotDePasse: ""
});

  
const [score, setScore] = useState(null); 
const [notifications, setNotifications] = useState([]);

      
  
// 2. ENSUITE LES USEEFFECT
useEffect(() => {
  if (!user || !user.idEtudiant) return;

  const fetchRequests = () => {
    fetch(`http://localhost:5000/api/get-requests/${user.idEtudiant}`)
      .then(res => res.json())
      .then(data => {
        console.log("Données reçues par React :", data);
        setNotifications(data);
      })
      .catch(err => console.error("Erreur notifs:", err));
  };

  const interval = setInterval(fetchRequests, 10000);
  fetchRequests();

  return () => clearInterval(interval);
}, [user.idEtudiant]);

  useEffect(() => {
    const savedDatabaseString = localStorage.getItem(DATABASE_STORAGE_KEY);
    if (!savedDatabaseString) {
      localStorage.setItem(DATABASE_STORAGE_KEY, JSON.stringify([user, ...PROFILS_TYPES]));
    }
    const activeSession = localStorage.getItem(ACTIVE_USER_KEY);
    if (activeSession) {
      try {
        const parsedActive = JSON.parse(activeSession);
        setUser(parsedActive);
        setEditUser(parsedActive);
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    if (page === 'groups' && user && user.idEtudiant) {
      setLoading(true);
      fetch('http://localhost:5000/api/get-all-matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: user })
      })
      .then(res => res.json())
      .then(data => { setAllMatches(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
    }
  }, [page, user]);

  useEffect(() => {
  fetchMatches();
}, [user]);

useEffect(() => {
  fetchStudents();
  fetchMatches();
}, []);

  const [showEvalModal, setShowEvalModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  const [errorMessage, setErrorMessage] = useState("");

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scoreQuiz, setScoreQuiz] = useState(0);

  const [quizData] = useState({
 "Mathématiques": {
   "Facile": [
     { q: "Combien font 5 * 5 ?", a: ["20", "25", "30"], correct: 1 },
     { q: "Quelle est la racine carrée de 16 ?", a: ["2", "4", "8"], correct: 1 },
     { q: "Combien font 12 * 12 ?", a: ["124", "144", "164"], correct: 1 },
     { q: "Quel est le périmètre d'un carré de côté 3 ?", a: ["9", "12", "6"], correct: 1 },
     { q: "Combien font 15 + 15 ?", a: ["20", "30", "40"], correct: 1 },
     { q: "Quel est le résultat de 100 / 4 ?", a: ["20", "25", "30"], correct: 1 },
     { q: "Combien font 7 * 8 ?", a: ["54", "56", "58"], correct: 1 },
     { q: "Quel est le carré de 9 ?", a: ["81", "72", "90"], correct: 0 },
     { q: "Quel est le résultat de 20 - 7 ?", a: ["13", "14", "12"], correct: 0 },
     { q: "Combien font 11 * 11 ?", a: ["121", "111", "131"], correct: 0 }
   ],
   "Moyen": [
     { q: "Quelle est la dérivée de x² ?", a: ["2x", "x", "2"], correct: 0 },
     { q: "Que vaut Pi (approx) ?", a: ["3.14", "3.16", "3.12"], correct: 0 },
     { q: "Quelle est la primitive de 2x ?", a: ["x²", "2", "x"], correct: 0 },
     { q: "Quel est le volume d'un cube de côté 2 ?", a: ["4", "8", "6"], correct: 1 },
     { q: "Combien font 2³ ?", a: ["6", "8", "9"], correct: 1 },
     { q: "Résoudre 2x + 5 = 15", a: ["5", "10", "2"], correct: 0 },
     { q: "Quelle est la somme des angles d'un triangle ?", a: ["180°", "90°", "360°"], correct: 0 },
     { q: "Combien font 4 * 12 ?", a: ["48", "44", "46"], correct: 0 },
     { q: "Quel est le cosinus de 0 ?", a: ["1", "0", "-1"], correct: 0 },
     { q: "Que vaut 10² + 5 ?", a: ["105", "100", "110"], correct: 0 }
   ],
   "Difficile": [
     { q: "Quelle est la dérivée de sin(x) ?", a: ["cos(x)", "-cos(x)", "sin(x)"], correct: 0 },
     { q: "Que vaut e^0 ?", a: ["1", "0", "e"], correct: 0 },
     { q: "Quelle est la primitive de 1/x ?", a: ["ln(x)", "1/x²", "x"], correct: 0 },
     { q: "Quel est le déterminant d'une matrice identité 2x2 ?", a: ["1", "0", "2"], correct: 0 },
     { q: "Combien vaut log10(100) ?", a: ["2", "10", "1"], correct: 0 },
     { q: "Que vaut la limite de 1/x en +infini ?", a: ["0", "1", "infini"], correct: 0 },
     { q: "Quel est le module de 3+4i ?", a: ["5", "7", "3"], correct: 0 },
     { q: "Quelle est la dérivée de exp(x) ?", a: ["exp(x)", "1", "x"], correct: 0 },
     { q: "Combien vaut 5!", a: ["120", "24", "60"], correct: 0 },
     { q: "Que vaut l'intégrale de 0 à 1 de x dx ?", a: ["0.5", "1", "0"], correct: 0 }
   ]
 },
 "Informatique": {
   "Facile": [
     { q: "Que signifie CPU ?", a: ["Central Process Unit", "Core Power", "Central Power"], correct: 0 },
     { q: "Quel langage pour le web ?", a: ["HTML", "C++", "Python"], correct: 0 },
     { q: "Qu'est-ce qu'une RAM ?", a: ["Mémoire vive", "Disque dur", "Écran"], correct: 0 },
     { q: "Symboles pour une instruction C ?", a: [";", ".", ":"], correct: 0 },
     { q: "Un bug est ?", a: ["Une erreur", "Un jeu", "Un outil"], correct: 0 },
     { q: "Quel langage pour l'IA ?", a: ["Python", "HTML", "CSS"], correct: 0 },
     { q: "Que signifie OS ?", a: ["Operating System", "Open System", "Overall"], correct: 0 },
     { q: "C'est quoi un serveur ?", a: ["Ordinateur distant", "Écran", "Souris"], correct: 0 },
     { q: "Que signifie SQL ?", a: ["Structured Query Language", "Simple Query List", "Logic"], correct: 0 },
     { q: "Qu'est-ce qu'un pixel ?", a: ["Point image", "Ligne", "Page"], correct: 0 }
   ],
   "Moyen": [
     { q: "Qu'est-ce qu'une boucle 'for' ?", a: ["Répétition", "Condition", "Variable"], correct: 0 },
     { q: "Que signifie HTTP ?", a: ["Transfer protocol", "HyperText", "High Tech"], correct: 0 },
     { q: "C'est quoi un algorithme ?", a: ["Suite instructions", "Jeu", "Code"], correct: 0 },
     { q: "Qu'est-ce qu'un IDE ?", a: ["Environnement dév", "Jeu", "Page"], correct: 0 },
     { q: "C'est quoi le binaire ?", a: ["Base 2", "Base 10", "Base 16"], correct: 0 },
     { q: "Qu'est-ce qu'une fonction ?", a: ["Bloc code réutilisable", "Variable", "Page"], correct: 0 },
     { q: "C'est quoi un réseau ?", a: ["Machines connectées", "Logiciel", "Jeu"], correct: 0 },
     { q: "Qu'est-ce qu'un index (BDD) ?", a: ["Accès rapide", "Table", "Lien"], correct: 0 },
     { q: "Qu'est-ce que le chiffrement ?", a: ["Sécurité données", "Copie", "Jeu"], correct: 0 },
     { q: "C'est quoi un objet (POO) ?", a: ["Instance classe", "Variable", "Lien"], correct: 0 }
   ],
   "Difficile": [
     { q: "Qu'est-ce qu'une pile (Stack) ?", a: ["LIFO", "FIFO", "LIFO/FIFO"], correct: 0 },
     { q: "C'est quoi le polymorphisme ?", a: ["Plusieurs formes", "Classe", "Variable"], correct: 0 },
     { q: "Qu'est-ce qu'une récursion ?", a: ["Appel soi-même", "Boucle", "Lien"], correct: 0 },
     { q: "C'est quoi une API REST ?", a: ["Interface web", "Base données", "Jeu"], correct: 0 },
     { q: "Qu'est-ce que la complexité O(n) ?", a: ["Linéaire", "Constant", "Exponentiel"], correct: 0 },
     { q: "Qu'est-ce qu'un deadlock ?", a: ["Blocage mutuel", "Bug", "Jeu"], correct: 0 },
     { q: "C'est quoi le multithreading ?", a: ["Tâches parallèles", "Séquentiel", "Lien"], correct: 0 },
     { q: "Qu'est-ce qu'un pointeur (C) ?", a: ["Adresse mémoire", "Variable", "Jeu"], correct: 0 },
     { q: "C'est quoi une transaction (BDD) ?", a: ["Unité atomique", "Table", "Index"], correct: 0 },
     { q: "Qu'est-ce que le Garbage Collector ?", a: ["Gestion mémoire", "Nettoyage disque", "Bug"], correct: 0 }
   ]
 },
 "Droit": {
   "Facile": [
     { q: "Qu'est-ce qu'une loi ?", a: ["Règle obligatoire", "Conseil", "Opinion"], correct: 0 },
     { q: "Qui vote la loi ?", a: ["Le Parlement", "Le Président", "Le Maire"], correct: 0 },
     { q: "Quelle est la loi suprême ?", a: ["La Constitution", "Le Code Civil", "Un contrat"], correct: 0 },
     { q: "Qu'est-ce qu'un avocat ?", a: ["Un défenseur", "Un juge", "Un policier"], correct: 0 },
     { q: "C'est quoi la justice ?", a: ["Pouvoir judiciaire", "Police", "Armée"], correct: 0 },
     { q: "Le Code Civil régit ?", a: ["Les rapports privés", "Le pénal", "La guerre"], correct: 0 },
     { q: "Un crime est jugé par ?", a: ["Cour d'assises", "Mairie", "Tribunal"], correct: 0 },
     { q: "Qu'est-ce qu'un contrat ?", a: ["Accord de volonté", "Loi", "Sanction"], correct: 0 },
     { q: "Qui est le chef de l'État ?", a: ["Président", "Ministre", "Député"], correct: 0 },
     { q: "Qui fait appliquer les lois ?", a: ["Le gouvernement", "La mairie", "Le club de sport"], correct: 0 }
   ],
   "Moyen": [
     { q: "Qu'est-ce que la hiérarchie des normes ?", a: ["Classement des textes", "Un escalier", "Une loi"], correct: 0 },
     { q: "Qu'est-ce qu'une ordonnance ?", a: ["Loi par gouvernement", "Prescription", "Contrat"], correct: 0 },
     { q: "Qu'est-ce que le droit pénal ?", a: ["Sanction infractions", "Droit travail", "Contrat"], correct: 0 },
     { q: "C'est quoi la responsabilité civile ?", a: ["Réparer dommage", "Payer impôt", "Voter"], correct: 0 },
     { q: "Qu'est-ce qu'un règlement européen ?", a: ["Applicable direct", "Loi locale", "Conseil"], correct: 0 },
     { q: "Qu'est-ce que le droit administratif ?", a: ["Régit administration", "Droit privé", "Sport"], correct: 0 },
     { q: "C'est quoi un vice de consentement ?", a: ["Erreur/dol/violence", "Contrat valide", "Loi"], correct: 0 },
     { q: "Qui nomme les ministres ?", a: ["Président", "Sénat", "Maire"], correct: 0 },
     { q: "Qu'est-ce qu'un référé ?", a: ["Procédure urgence", "Contrat", "Loi"], correct: 0 },
     { q: "C'est quoi le droit objectif ?", a: ["Ensemble des règles", "Droit de vote", "Argent"], correct: 0 }
   ],
   "Difficile": [
     { q: "Qu'est-ce que l'effet relatif des contrats ?", a: ["Valable entre parties", "Pour tous", "Nul"], correct: 0 },
     { q: "Qu'est-ce que la personnalité morale ?", a: ["Groupement avec droits", "Humain", "Animal"], correct: 0 },
     { q: "Qu'est-ce que l'abus de droit ?", a: ["Détourner son droit", "Contrat", "Loi"], correct: 0 },
     { q: "C'est quoi le droit de suite (sûretés) ?", a: ["Suivre le bien", "Vendre", "Acheter"], correct: 0 },
     { q: "Qu'est-ce que la nullité absolue ?", a: ["Ordre public", "Protection privée", "Contrat"], correct: 0 },
     { q: "Qu'est-ce que la subrogation ?", a: ["Substitution créancier", "Droit", "Loi"], correct: 0 },
     { q: "Qu'est-ce que le droit de rétention ?", a: ["Garder le bien", "Vendre", "Voter"], correct: 0 },
     { q: "Qu'est-ce qu'une obligation de moyens ?", a: ["Tout faire pour", "Garantir résultat", "Rien"], correct: 0 },
     { q: "Qu'est-ce que le contrôle de conventionnalité ?", a: ["Vérifier traité", "Voter", "Chanter"], correct: 0 },
     { q: "Qu'est-ce qu'une exception d'inexécution ?", a: ["Refuser prestation", "Payer", "Voter"], correct: 0 }
   ],
 },
 "Économie": {
   "Facile": [
     { q: "Qu'est-ce que le PIB ?", a: ["Produit Intérieur Brut", "Prix Bas", "Part Budget"], correct: 0 },
     { q: "Qui contrôle l'inflation ?", a: ["BCE", "Trésor", "Banque"], correct: 0 },
     { q: "L'offre et la demande déterminent ?", a: ["Le prix", "Météo", "Population"], correct: 0 },
     { q: "C'est quoi le chômage ?", a: ["Sans emploi", "Vacances", "Travail"], correct: 0 },
     { q: "C'est quoi une taxe ?", a: ["Impôt", "Salaire", "Don"], correct: 0 },
     { q: "C'est quoi l'export ?", a: ["Vente dehors", "Achat", "Production"], correct: 0 },
     { q: "Qui est économiste classique ?", a: ["Smith", "Freud", "Hugo"], correct: 0 },
     { q: "C'est quoi le marché ?", a: ["Lieu échange", "Maison", "Forêt"], correct: 0 },
     { q: "C'est quoi la monnaie ?", a: ["Échange", "Troc", "Or"], correct: 0 },
     { q: "Qu'est-ce que la croissance ?", a: ["Hausse richesses", "Baisse", "Stagnation"], correct: 0 }
   ],
   "Moyen": [
     { q: "C'est quoi la déflation ?", a: ["Baisse des prix", "Hausse", "Stabilité"], correct: 0 },
     { q: "C'est quoi le taux directeur ?", a: ["Taux banque centrale", "Impôt", "Salaire"], correct: 0 },
     { q: "C'est quoi le déficit public ?", a: ["Dépenses > Recettes", "Recettes > Dépenses", "Équilibre"], correct: 0 },
     { q: "C'est quoi la valeur ajoutée ?", a: ["Richesse créée", "Prix", "Coût"], correct: 0 },
     { q: "C'est quoi la mondialisation ?", a: ["Ouverture marchés", "Fermeture", "Sport"], correct: 0 },
     { q: "C'est quoi la main invisible ?", a: ["Marché régulateur", "État", "Monopole"], correct: 0 },
     { q: "Qu'est-ce qu'une firme multinationale ?", a: ["Présence mondiale", "Locale", "Petit"], correct: 0 },
     { q: "C'est quoi le protectionnisme ?", a: ["Barrières douanières", "Libre échange", "Dons"], correct: 0 },
     { q: "C'est quoi le cycle économique ?", a: ["Expansion/Récession", "Météo", "Sport"], correct: 0 },
     { q: "Qu'est-ce que le capital ?", a: ["Moyen production", "Salaire", "Taxes"], correct: 0 }
   ],
   "Difficile": [
     { q: "Qu'est-ce que l'élasticité prix ?", a: ["Sensibilité demande", "Prix fixe", "Profit"], correct: 0 },
     { q: "Qu'est-ce que le multiplicateur keynésien ?", a: ["Effet dépenses", "Taxe", "Salaire"], correct: 0 },
     { q: "C'est quoi la stagflation ?", a: ["Stagnation + Inflation", "Croissance", "Repos"], correct: 0 },
     { q: "Qu'est-ce que l'aléa moral ?", a: ["Risque caché", "Contrat", "Loi"], correct: 0 },
     { q: "C'est quoi la courbe de Laffer ?", a: ["Impôts/Recettes", "Chômage", "Prix"], correct: 0 },
     { q: "Qu'est-ce qu'un monopole naturel ?", a: ["Coût fixe élevé", "Concurrence", "Libre"], correct: 0 },
     { q: "C'est quoi l'avantage comparatif ?", a: ["Spécialisation", "Protection", "Autarcie"], correct: 0 },
     { q: "Qu'est-ce que la politique monétaire ?", a: ["Gestion masse monétaire", "Budget", "Sport"], correct: 0 },
     { q: "C'est quoi l'économie comportementale ?", a: ["Psychologie éco", "Maths", "Histoire"], correct: 0 },
     { q: "Qu'est-ce que la théorie des jeux ?", a: ["Stratégies interaction", "Jeu", "Sport"], correct: 0 }
   ]
 },
 "Management": {
   "Facile": [
     { q: "Qu'est-ce qu'un manager ?", a: ["Il encadre", "Il dort", "Il joue"], correct: 0 },
     { q: "Quel est le but d'une entreprise ?", a: ["Profit", "Dormir", "Sport"], correct: 0 },
     { q: "Que signifie RH ?", a: ["Ressources Humaines", "Réunion", "Repos"], correct: 0 },
     { q: "Une réunion sert à ?", a: ["Échanger", "Manger", "Dormir"], correct: 0 },
     { q: "Qu'est-ce qu'un objectif ?", a: ["But à atteindre", "Rêve", "Option"], correct: 0 },
     { q: "Le marketing sert à ?", a: ["Vendre", "Acheter", "Dormir"], correct: 0 },
     { q: "Qu'est-ce qu'un client ?", a: ["Acheteur", "Vendeur", "Patron"], correct: 0 },
     { q: "C'est quoi la communication ?", a: ["Échange", "Silence", "Cris"], correct: 0 },
     { q: "Un organigramme montre ?", a: ["La hiérarchie", "La météo", "Le menu"], correct: 0 },
     { q: "Qu'est-ce qu'une équipe ?", a: ["Groupe", "Individu", "Foule"], correct: 0 }
   ],
   "Moyen": [
     { q: "C'est quoi le style persuasif ?", a: ["Convaincre", "Autoritaire", "Délégatif"], correct: 0 },
     { q: "Qu'est-ce qu'un processus ?", a: ["Séquence actions", "Contrat", "Salaire"], correct: 0 },
     { q: "C'est quoi la culture d'entreprise ?", a: ["Valeurs communes", "Décor", "Loi"], correct: 0 },
     { q: "Qu'est-ce qu'un feedback ?", a: ["Retour info", "Erreur", "Vente"], correct: 0 },
     { q: "C'est quoi le pilotage ?", a: ["Suivi performance", "Conduite", "Dormir"], correct: 0 },
     { q: "Qu'est-ce qu'un conflit ?", a: ["Désaccord", "Accord", "Pause"], correct: 0 },
     { q: "C'est quoi la délégation ?", a: ["Confier tâche", "Garder tout", "Dormir"], correct: 0 },
     { q: "Qu'est-ce qu'une fiche de poste ?", a: ["Description mission", "Contrat", "Loi"], correct: 0 },
     { q: "Qu'est-ce que le recrutement ?", a: ["Embauche", "Licenciement", "Sport"], correct: 0 },
     { q: "Qu'est-ce que la productivité ?", a: ["Rapport prod/moyen", "Salaire", "Taxes"], correct: 0 }
   ],
   "Difficile": [
     { q: "Théorie X et Y (McGregor) ?", a: ["Vision humaine", "Compta", "Marketing"], correct: 0 },
     { q: "Qu'est-ce que la gestion par objectifs (MBO) ?", a: ["Peter Drucker", "Freud", "Hugo"], correct: 0 },
     { q: "C'est quoi le Lean Management ?", a: ["Chasse gaspillages", "Vitesse", "Sport"], correct: 0 },
     { q: "C'est quoi la théorie de la contingence ?", a: ["S'adapter contexte", "Fixe", "Rigide"], correct: 0 },
     { q: "Qu'est-ce qu'un système d'information ?", a: ["Gestion données", "Ordinateur", "Bureau"], correct: 0 },
     { q: "Qu'est-ce que la motivation (Maslow) ?", a: ["Pyramide besoins", "Salaire", "Dormir"], correct: 0 },
     { q: "Qu'est-ce que le management agile ?", a: ["Flexibilité", "Rigueur", "Autorité"], correct: 0 },
     { q: "C'est quoi la partie prenante ?", a: ["Impacté décision", "Client", "Fournisseur"], correct: 0 },
     { q: "Qu'est-ce que l'intelligence émotionnelle ?", a: ["Gestion émotions", "Maths", "Droit"], correct: 0 },
     { q: "Qu'est-ce que le changement organisationnel ?", a: ["Mutation structure", "Repos", "Sport"], correct: 0 }
   ]
 },
 "Histoire": {
   "Facile": [
     { q: "Date de la Révolution française ?", a: ["1789", "1815", "1914"], correct: 0 },
     { q: "Qui était Napoléon Ier ?", a: ["Empereur", "Peintre", "Scientifique"], correct: 0 },
     { q: "Début de la Seconde Guerre mondiale ?", a: ["1939", "1918", "1945"], correct: 0 },
     { q: "Qui a découvert l'Amérique ?", a: ["Colomb", "Hugo", "Zola"], correct: 0 },
     { q: "C'est quoi un siècle ?", a: ["100 ans", "10 ans", "50 ans"], correct: 0 },
     { q: "L'Antiquité est une ?", a: ["Période ancienne", "Futur", "Présent"], correct: 0 },
     { q: "Qui est Louis XIV ?", a: ["Roi Soleil", "Peintre", "Savant"], correct: 0 },
     { q: "Qu'est-ce que la préhistoire ?", a: ["Avant écriture", "Après", "Pendant"], correct: 0 },
     { q: "Les croisades sont ?", a: ["Guerres religieuses", "Voyages", "Commerce"], correct: 0 },
     { q: "La Renaissance est ?", a: ["Renouveau arts", "Fin", "Début"], correct: 0 }
   ],
   "Moyen": [
     { q: "C'est quoi la féodalité ?", a: ["Système vassalité", "Démocratie", "Sport"], correct: 0 },
     { q: "Qu'est-ce que les Lumières ?", a: ["Courant philosophique", "Ampoule", "Sport"], correct: 0 },
     { q: "Date fin Première Guerre mondiale ?", a: ["1918", "1939", "1945"], correct: 0 },
     { q: "Qu'est-ce que la Déclaration des droits de l'homme ?", a: ["Texte 1789", "Loi", "Sport"], correct: 0 },
     { q: "C'est quoi la Guerre froide ?", a: ["Tension USA/URSS", "Combat", "Sport"], correct: 0 },
     { q: "Qu'est-ce que la Commune de Paris ?", a: ["Révolte 1871", "Mairie", "Sport"], correct: 0 },
     { q: "Qui est Jeanne d'Arc ?", a: ["Héroïne française", "Roi", "Sport"], correct: 0 },
     { q: "C'est quoi l'industrialisation ?", a: ["Passage usine", "Artisanat", "Sport"], correct: 0 },
     { q: "Qu'est-ce que le colonialisme ?", a: ["Expansion territoriale", "Commerce", "Sport"], correct: 0 },
     { q: "La chute du mur de Berlin ?", a: ["1989", "1945", "1991"], correct: 0 }
   ],
   "Difficile": [
     { q: "Que signifie l'Edit de Nantes ?", a: ["Liberté culte", "Guerre", "Impôt"], correct: 0 },
     { q: "C'est quoi le traité de Westphalie ?", a: ["États souverains", "Contrat", "Sport"], correct: 0 },
     { q: "Qu'est-ce que la Restauration ?", a: ["Retour monarchie", "République", "Sport"], correct: 0 },
     { q: "C'est quoi le plan Marshall ?", a: ["Aide reconstruction", "Impôt", "Sport"], correct: 0 },
     { q: "Qu'est-ce que le traité de Versailles ?", a: ["Fin WW1", "Contrat", "Sport"], correct: 0 },
     { q: "C'est quoi l'absolutisme ?", a: ["Pouvoir total", "Démocratie", "Sport"], correct: 0 },
     { q: "Qu'est-ce que le Front Populaire ?", a: ["Coalition gauche 1936", "Roi", "Sport"], correct: 0 },
     { q: "C'est quoi le mercantilisme ?", a: ["Accumulation or", "Libre-échange", "Sport"], correct: 0 },
     { q: "Qu'est-ce que la Décolonisation ?", a: ["Accès indépendance", "Colonisation", "Sport"], correct: 0 },
     { q: "C'est quoi la crise de 1929 ?", a: ["Krach boursier", "Victoire", "Sport"], correct: 0 }
   ]
 },
 "Philosophie": {
   "Facile": [
     { q: "Qui a dit 'Je pense, donc je suis' ?", a: ["Descartes", "Platon", "Kant"], correct: 0 },
     { q: "Qu'est-ce que l'éthique ?", a: ["Morale", "Physique", "Logique"], correct: 0 },
     { q: "Qui a écrit la République ?", a: ["Platon", "Socrate", "Aristote"], correct: 0 },
     { q: "La liberté est ?", a: ["Faire choix", "Prison", "Obéir"], correct: 0 },
     { q: "Socrate était ?", a: ["Philosophe", "Roi", "Peintre"], correct: 0 },
     { q: "Qu'est-ce que la vérité ?", a: ["Réalité", "Mensonge", "Opinion"], correct: 0 },
     { q: "Aristote était ?", a: ["Philosophe", "Savant", "Roi"], correct: 0 },
     { q: "C'est quoi l'âme ?", a: ["Conscience", "Corps", "Table"], correct: 0 },
     { q: "La raison est ?", a: ["Logique", "Emotion", "Cœur"], correct: 0 },
     { q: "Qui est Kant ?", a: ["Philosophe", "Artiste", "Sportif"], correct: 0 }
   ],
   "Moyen": [
     { q: "Qu'est-ce que le nihilisme ?", a: ["Négation valeurs", "Espoir", "Joie"], correct: 0 },
     { q: "Qu'est-ce que le stoïcisme ?", a: ["Maîtrise soi", "Plaisir", "Dormir"], correct: 0 },
     { q: "Qu'est-ce que la dialectique ?", a: ["Thèse/Antithèse", "Maths", "Loi"], correct: 0 },
     { q: "C'est quoi l'existentialisme ?", a: ["Existence précède essence", "Destin", "Sport"], correct: 0 },
     { q: "Qui est Nietzsche ?", a: ["Surhomme", "Roi", "Peintre"], correct: 0 },
     { q: "C'est quoi la phénoménologie ?", a: ["Étude conscience", "Physique", "Droit"], correct: 0 },
     { q: "Qu'est-ce que la métaphysique ?", a: ["Étude être", "Science", "Sport"], correct: 0 },
     { q: "Qu'est-ce que l'empirisme ?", a: ["Expérience sensorielle", "Idées", "Lois"], correct: 0 },
     { q: "C'est quoi la vertu ?", a: ["Qualité morale", "Vice", "Sport"], correct: 0 },
     { q: "Qui est Spinoza ?", a: ["Philosophe", "Artiste", "Savant"], correct: 0 }
   ],
   "Difficile": [
     { q: "L'impératif catégorique ?", a: ["Loi morale", "Loi physique", "Sport"], correct: 0 },
     { q: "Le concept de 'Volonté de puissance' ?", a: ["Nietzsche", "Kant", "Platon"], correct: 0 },
     { q: "Qu'est-ce que le 'Cogito' ?", a: ["Preuve existence", "Doute", "Sport"], correct: 0 },
     { q: "La 'Nausée' est un livre de ?", a: ["Sartre", "Hugo", "Zola"], correct: 0 },
     { q: "L'allégorie de la caverne ?", a: ["Platon", "Socrate", "Aristote"], correct: 0 },
     { q: "Le concept de 'Contrat social' ?", a: ["Rousseau", "Descartes", "Platon"], correct: 0 },
     { q: "Qu'est-ce que l'ontologie ?", a: ["Étude de l'être", "Science", "Sport"], correct: 0 },
     { q: "La 'Critique de la raison pure' ?", a: ["Kant", "Hugo", "Zola"], correct: 0 },
     { q: "Le 'Prince' de Machiavel ?", a: ["Politique", "Religion", "Sport"], correct: 0 },
     { q: "Qu'est-ce que l'herméneutique ?", a: ["Interprétation", "Calcul", "Droit"], correct: 0 }
   ]
 },
 "Français": {
   "Facile": [
     { q: "Quel est l'infinitif de 'je mange' ?", a: ["Manger", "Mange", "Mangeons"], correct: 0 },
     { q: "Nature du mot 'bleu' dans 'ciel bleu' ?", a: ["Adjectif", "Verbe", "Nom"], correct: 0 },
     { q: "Combien y a-t-il de groupes verbaux ?", a: ["3", "2", "4"], correct: 0 },
     { q: "Quel est l'auteur des Misérables ?", a: ["Hugo", "Molière", "Zola"], correct: 0 },
     { q: "Le contraire de 'grand' ?", a: ["Petit", "Haut", "Large"], correct: 0 },
     { q: "C'est quoi un nom ?", a: ["Chose/être", "Action", "Qualité"], correct: 0 },
     { q: "Quel est le pluriel de 'cheval' ?", a: ["Chevaux", "Chevals", "Cheval"], correct: 0 },
     { q: "C'est quoi un verbe ?", a: ["Action", "Nom", "Lieu"], correct: 0 },
     { q: "Comment s'appelle le signe '?' ?", a: ["Point d'interrogation", "Point", "Virgule"], correct: 0 },
     { q: "Quelle est la capitale de la France ?", a: ["Paris", "Lyon", "Marseille"], correct: 0 }
   ],
   "Moyen": [
     { q: "Qu'est-ce qu'une métaphore ?", a: ["Image sans comparaison", "Comparaison", "Nom"], correct: 0 },
     { q: "C'est quoi l'imparfait ?", a: ["Temps passé", "Futur", "Présent"], correct: 0 },
     { q: "Quelle est la fonction du complément d'objet ?", a: ["Subit action", "Qualifie nom", "Lieu"], correct: 0 },
     { q: "C'est quoi un adverbe ?", a: ["Modifie verbe", "Nom", "Lieu"], correct: 0 },
     { q: "Qui a écrit 'Le Cid' ?", a: ["Corneille", "Racine", "Hugo"], correct: 0 },
     { q: "C'est quoi une phrase interrogative ?", a: ["Pose question", "Ordre", "Affirmation"], correct: 0 },
     { q: "Accord 'Elles se sont ____' (apercevoir) ?", a: ["aperçues", "aperçu", "aperçus"], correct: 0 },
     { q: "C'est quoi le subjonctif ?", a: ["Mode doute/souhait", "Indicatif", "Impératif"], correct: 0 },
     { q: "C'est quoi un synonyme ?", a: ["Même sens", "Sens opposé", "Nom"], correct: 0 },
     { q: "C'est quoi une phrase passive ?", a: ["Sujet subit action", "Sujet agit", "Nom"], correct: 0 }
   ],
   "Difficile": [
     { q: "Qu'est-ce que le surréalisme ?", a: ["Exploration inconscient", "Réalisme", "Maths"], correct: 0 },
     { q: "C'est quoi une métonymie ?", a: ["Conteneur pour contenu", "Image", "Nom"], correct: 0 },
     { q: "Le plus-que-parfait de 'être' ?", a: ["Avais été", "Suis été", "Fus été"], correct: 0 },
     { q: "C'est quoi une proposition subordonnée ?", a: ["Dépend principale", "Indépendante", "Nom"], correct: 0 },
     { q: "Qu'est-ce que le style indirect libre ?", a: ["Pensée directe", "Style direct", "Sport"], correct: 0 },
     { q: "C'est quoi l'anaphore ?", a: ["Répétition début phrase", "Comparaison", "Nom"], correct: 0 },
     { q: "Qui est l'auteur de 'Madame Bovary' ?", a: ["Flaubert", "Zola", "Hugo"], correct: 0 },
     { q: "C'est quoi une périphrase ?", a: ["Expression développée", "Mot simple", "Sport"], correct: 0 },
     { q: "Qu'est-ce qu'une assonance ?", a: ["Répétition voyelles", "Consonnes", "Nom"], correct: 0 },
     { q: "Qu'est-ce que le théâtre de l'absurde ?", a: ["Absence de logique", "Comédie", "Drame"], correct: 0 }
   ]
 },
 "Anglais": {
   "Facile": [
     { q: "Traduction de 'Book' ?", a: ["Livre", "Cahier", "Stylo"], correct: 0 },
     { q: "Comment dit-on 'Merci' ?", a: ["Thank you", "Please", "Hello"], correct: 0 },
     { q: "Traduction 'Chat' ?", a: ["Cat", "Dog", "Bird"], correct: 0 },
     { q: "Traduction 'Maison' ?", a: ["House", "Car", "Tree"], correct: 0 },
     { q: "Traduction 'Rouge' ?", a: ["Red", "Blue", "Green"], correct: 0 },
     { q: "Traduction 'Amour' ?", a: ["Love", "Hate", "Like"], correct: 0 },
     { q: "Traduction 'Maintenant' ?", a: ["Now", "Then", "Later"], correct: 0 },
     { q: "Traduction 'Demain' ?", a: ["Tomorrow", "Yesterday", "Today"], correct: 0 },
     { q: "Traduction 'École' ?", a: ["School", "Work", "Home"], correct: 0 },
     { q: "Traduction 'Ciel' ?", a: ["Sky", "Sun", "Cloud"], correct: 0 }
   ],
   "Moyen": [
     { q: "Passé de 'go' ?", a: ["Went", "Gone", "Going"], correct: 0 },
     { q: "Quel est le comparatif de 'good' ?", a: ["Better", "Gooder", "More good"], correct: 0 },
     { q: "Traduction 'Il pleut' ?", a: ["It is raining", "It rain", "It raining"], correct: 0 },
     { q: "Traduction 'Je joue' ?", a: ["I play", "I am play", "I playing"], correct: 0 },
     { q: "Pluriel de 'child' ?", a: ["Children", "Childs", "Childen"], correct: 0 },
     { q: "Traduction 'J'ai vu' ?", a: ["I have seen", "I see", "I saw"], correct: 0 },
     { q: "Traduction 'Il travaille ici' ?", a: ["He works here", "He work here", "He working here"], correct: 0 },
     { q: "Traduction 'Où es-tu ?' ?", a: ["Where are you?", "Who are you?", "What are you?"], correct: 0 },
     { q: "Traduction 'J'aime' ?", a: ["I like", "Me like", "I am like"], correct: 0 },
     { q: "Traduction 'Il est grand' ?", a: ["He is tall", "He tall", "He be tall"], correct: 0 }
   ],
   "Difficile": [
     { q: "Traduction 'He had been sleeping' ?", a: ["Plus-que-parfait continu", "Présent", "Futur"], correct: 0 },
     { q: "Signification 'To hit the nail on the head' ?", a: ["Dire la vérité", "Se blesser", "Exploit"], correct: 0 },
     { q: "Usage du 'Present Perfect' ?", a: ["Action passée impact présent", "Futur", "Sport"], correct: 0 },
     { q: "Traduction 'Si j'avais su' ?", a: ["If I had known", "If I knew", "If I would know"], correct: 0 },
     { q: "C'est quoi un 'phrasal verb' ?", a: ["Verbe + particule", "Nom", "Loi"], correct: 0 },
     { q: "Traduction 'Il faut que tu fasses' ?", a: ["You must do", "You make", "You doing"], correct: 0 },
     { q: "C'est quoi le 'Passive Voice' ?", a: ["Sujet subit action", "Actif", "Sport"], correct: 0 },
     { q: "Traduction 'Bien que ce soit' ?", a: ["Although it is", "If it is", "When it is"], correct: 0 },
     { q: "C'est quoi un 'gerund' ?", a: ["Nom dérivé verbe", "Adjectif", "Adverbe"], correct: 0 },
     { q: "Traduction 'J'aurais dû' ?", a: ["I should have", "I had to", "I must"], correct: 0 }
   ]
 },
 "Espagnol": {
   "Facile": [
     { q: "Comment dit-on 'Bonjour' ?", a: ["Hola", "Adiós", "Gracias"], correct: 0 },
     { q: "Traduction de 'Chat' ?", a: ["Gato", "Perro", "Pájaro"], correct: 0 },
     { q: "Comment dit-on 'Merci' ?", a: ["Gracias", "Hola", "Adiós"], correct: 0 },
     { q: "Traduction de 'Eau' ?", a: ["Agua", "Pan", "Sol"], correct: 0 },
     { q: "Traduction de 'Livre' ?", a: ["Libro", "Mesa", "Silla"], correct: 0 },
     { q: "Traduction de 'Rouge' ?", a: ["Rojo", "Azul", "Verde"], correct: 0 },
     { q: "Traduction de 'Mère' ?", a: ["Madre", "Padre", "Hijo"], correct: 0 },
     { q: "Traduction de 'Ami' ?", a: ["Amigo", "Enemigo", "Gente"], correct: 0 },
     { q: "Traduction de 'Soir' ?", a: ["Noche", "Dia", "Mañana"], correct: 0 },
     { q: "Capitale Espagne ?", a: ["Madrid", "Barcelone", "Séville"], correct: 0 }
   ],
   "Moyen": [
     { q: "Conjugaison : Yo ____ (ser) estudiante.", a: ["soy", "eres", "es"], correct: 0 },
     { q: "Comment dit-on 'J'ai faim' ?", a: ["Tengo hambre", "Soy hambre", "Estoy hambre"], correct: 0 },
     { q: "Le verbe 'Ser' exprime ?", a: ["Essence", "État", "Action"], correct: 0 },
     { q: "Traduction de 'Demain' ?", a: ["Mañana", "Ayer", "Hoy"], correct: 0 },
     { q: "Le féminin de 'el chico' ?", a: ["la chica", "la chique", "el chica"], correct: 0 },
     { q: "Pluriel de 'el libro' ?", a: ["los libros", "las libros", "el libros"], correct: 0 },
     { q: "Comment dit-on 'Il fait beau' ?", a: ["Hace buen tiempo", "Es buen tiempo", "Tiene buen tiempo"], correct: 0 },
     { q: "Verbe pour 'aller' ?", a: ["Ir", "Ver", "Tener"], correct: 0 },
     { q: "Traduction de 'c'est facile' ?", a: ["Es fácil", "Está fácil", "Ser fácil"], correct: 0 },
     { q: "Comment dire 'à bientôt' ?", a: ["Hasta pronto", "Adiós", "Hola"], correct: 0 }
   ],
   "Difficile": [
     { q: "Usage du subjonctif : 'Espero que ____ (tener) suerte'.", a: ["tengas", "tienes", "tener"], correct: 0 },
     { q: "Traduction de 'J'aurais voulu' ?", a: ["Habría querido", "He querido", "Querría"], correct: 0 },
     { q: "C'est quoi le 'pretérito perfecto' ?", a: ["Passé composé", "Futur", "Présent"], correct: 0 },
     { q: "Traduction 'Bien que j'étudie' ?", a: ["Aunque estudie", "Aunque estudio", "Aunque estudiar"], correct: 0 },
     { q: "Différence entre 'por' et 'para' ?", a: ["Causalité vs But", "Taille", "Couleur"], correct: 0 },
     { q: "Traduction 'Si j'avais su' ?", a: ["Si hubiera sabido", "Si sabría", "Si supe"], correct: 0 },
     { q: "C'est quoi un 'verbe pronominal' ?", a: ["Verbe avec se", "Verbe sans se", "Adverbe"], correct: 0 },
     { q: "Traduction 'Il faut que tu fasses' ?", a: ["Es necesario que hagas", "Es necesario haces", "Es necesario hacer"], correct: 0 },
     { q: "C'est quoi le 'voseo' ?", a: ["Usage de 'vos'", "Usage de 'tú'", "Accent"], correct: 0 },
     { q: "Traduction 'Il a été dit' (passif) ?", a: ["Se ha dicho", "Ha dicho", "Es dicho"], correct: 0 }
   ]
 },
 "Italien": {
   "Facile": [
     { q: "Bonjour ?", a: ["Buongiorno", "Ciao", "Grazie"], correct: 0 },
     { q: "Traduction 'Amour' ?", a: ["Amore", "Vita", "Cuore"], correct: 0 },
     { q: "Traduction 'Maison' ?", a: ["Casa", "Città", "Mare"], correct: 0 },
     { q: "Merci ?", a: ["Grazie", "Prego", "Ciao"], correct: 0 },
     { q: "Vin ?", a: ["Vino", "Acqua", "Birra"], correct: 0 },
     { q: "Soleil ?", a: ["Sole", "Luna", "Stella"], correct: 0 },
     { q: "Père ?", a: ["Padre", "Madre", "Figlio"], correct: 0 },
     { q: "Nuit ?", a: ["Notte", "Giorno", "Mattina"], correct: 0 },
     { q: "Chat ?", a: ["Gatto", "Cane", "Uccello"], correct: 0 },
     { q: "Capitale Italie ?", a: ["Rome", "Milan", "Venise"], correct: 0 }
   ],
   "Moyen": [
     { q: "Pluriel de 'libro' ?", a: ["Libri", "Libra", "Libre"], correct: 0 },
     { q: "Conjugaison : Io ____ (essere) felice.", a: ["sono", "sei", "è"], correct: 0 },
     { q: "Traduction 'Je mange' ?", a: ["Mangio", "Mangi", "Mangia"], correct: 0 },
     { q: "Article défini masculin pluriel ?", a: ["i", "lo", "la"], correct: 0 },
     { q: "Traduction 'C'est beau' ?", a: ["È bello", "Sono bello", "Siamo bello"], correct: 0 },
     { q: "Verbe pour 'avoir' ?", a: ["Avere", "Essere", "Andare"], correct: 0 },
     { q: "Comment dit-on 'Comment ça va ?' ?", a: ["Come stai?", "Come sei?", "Come va?"], correct: 0 },
     { q: "Traduction 'Où est le restaurant ?' ?", a: ["Dov'è il ristorante?", "Chi è il ristorante?", "Che è il ristorante?"], correct: 0 },
     { q: "Comment dit-on 's'il vous plaît' ?", a: ["Per favore", "Grazie", "Prego"], correct: 0 },
     { q: "Traduction 'Je m'appelle' ?", a: ["Mi chiamo", "Mi chiami", "Si chiama"], correct: 0 }
   ],
   "Difficile": [
     { q: "C'est quoi le 'Passato remoto' ?", a: ["Passé lointain", "Présent", "Futur"], correct: 0 },
     { q: "Usage du 'Congiuntivo' ?", a: ["Doute/Souhait", "Réalité", "Maths"], correct: 0 },
     { q: "Traduction 'Si je savais' ?", a: ["Se sapessi", "Se saprei", "Se sapevo"], correct: 0 },
     { q: "Traduction 'Il aurait fait' ?", a: ["Avrebbe fatto", "Ha fatto", "Faceva"], correct: 0 },
     { q: "C'est quoi le 'Gerundio' ?", a: ["Action en cours", "Nom", "Loi"], correct: 0 },
     { q: "Traduction 'Il faut que tu ailles' ?", a: ["Bisogna che tu vada", "Bisogna che vai", "Bisogna andare"], correct: 0 },
     { q: "C'est quoi le 'Futuro anteriore' ?", a: ["Futur accompli", "Passé", "Sport"], correct: 0 },
     { q: "Traduction 'Bien que ce soit' ?", a: ["Sebbene sia", "Sebbene è", "Sebbene era"], correct: 0 },
     { q: "C'est quoi un pronom réfléchi ?", a: ["Action sur soi", "Objet", "Sujet"], correct: 0 },
     { q: "Traduction 'Il a été vu' (passif) ?", a: ["È stato visto", "Ha visto", "È visto"], correct: 0 }
   ]
 },
 "Psychologie": {
   "Facile": [
     { q: "Père de la psychanalyse ?", a: ["Freud", "Jung", "Pavlov"], correct: 0 },
     { q: "Objet psychologie ?", a: ["Comportement", "Planète", "Chimie"], correct: 0 },
     { q: "C'est quoi une phobie ?", a: ["Peur irrationnelle", "Plaisir", "Sport"], correct: 0 },
     { q: "C'est quoi le stress ?", a: ["Tension", "Repos", "Sport"], correct: 0 },
     { q: "C'est quoi la mémoire ?", a: ["Capacité souvenir", "Oubli", "Rêve"], correct: 0 },
     { q: "C'est quoi l'intelligence ?", a: ["Capacité cognitive", "Force", "Taille"], correct: 0 },
     { q: "C'est quoi l'émotion ?", a: ["Sentiment", "Moteur", "Objet"], correct: 0 },
     { q: "Qui est Piaget ?", a: ["Psychologue enfant", "Roi", "Savant"], correct: 0 },
     { q: "C'est quoi un test ?", a: ["Évaluation", "Jeu", "Repas"], correct: 0 },
     { q: "C'est quoi la dépression ?", a: ["Tristesse profonde", "Joie", "Sport"], correct: 0 }
   ],
   "Moyen": [
     { q: "Qu'est-ce que le conscient ?", a: ["Perception active", "Sommeil", "Rêve"], correct: 0 },
     { q: "C'est quoi le conditionnement ?", a: ["Apprentissage réflexe", "Dormir", "Droit"], correct: 0 },
     { q: "Qu'est-ce que l'inconscient ?", a: ["Processus non perçu", "Réalité", "Sport"], correct: 0 },
     { q: "C'est quoi la personnalité ?", a: ["Traits psychiques", "Taille", "Poids"], correct: 0 },
     { q: "C'est quoi la psychologie sociale ?", a: ["Influence groupe", "Individu", "Cerveau"], correct: 0 },
     { q: "Qu'est-ce que l'empathie ?", a: ["Compréhension autrui", "Égoïsme", "Sport"], correct: 0 },
     { q: "C'est quoi la motivation ?", a: ["Processus d'action", "Repos", "Droit"], correct: 0 },
     { q: "Qu'est-ce que le narcissisme ?", a: ["Amour soi excessif", "Humilité", "Maths"], correct: 0 },
     { q: "C'est quoi l'anxiété ?", a: ["Inquiétude", "Calme", "Sport"], correct: 0 },
     { q: "Qu'est-ce que le développement cognitif ?", a: ["Évolution pensée", "Taille", "Droit"], correct: 0 }
   ],
   "Difficile": [
     { q: "Qu'est-ce que la psychophysique ?", a: ["Mesure perception", "Chimie", "Droit"], correct: 0 },
     { q: "C'est quoi la dissonance cognitive ?", a: ["Conflit interne", "Joie", "Sport"], correct: 0 },
     { q: "Qu'est-ce que l'archétype (Jung) ?", a: ["Modèle universel", "Idée", "Droit"], correct: 0 },
     { q: "Qu'est-ce que la Gestalt ?", a: ["Psychologie forme", "Comportement", "Sport"], correct: 0 },
     { q: "C'est quoi la résilience ?", a: ["Rebondir après traumatisme", "Soumission", "Droit"], correct: 0 },
     { q: "Qu'est-ce que le behaviorisme ?", a: ["Étude comportements", "Rêves", "Sport"], correct: 0 },
     { q: "Qu'est-ce que l'attachement (Bowlby) ?", a: ["Lien affectif", "Indifférence", "Sport"], correct: 0 },
     { q: "C'est quoi le refoulement ?", a: ["Mécanisme défense", "Mémoire", "Sport"], correct: 0 },
     { q: "Qu'est-ce que la psychologie cognitive ?", a: ["Processus mentaux", "Émotions", "Droit"], correct: 0 },
     { q: "Qu'est-ce que le biais de confirmation ?", a: ["Favoriser ses idées", "Logique", "Sport"], correct: 0 }
   ]
 },
 "Sociologie": {
   "Facile": [
     { q: "Objet d'étude de la sociologie ?", a: ["La société", "Les atomes", "Les nombres"], correct: 0 },
     { q: "Qu'est-ce qu'une norme sociale ?", a: ["Règle de conduite", "Une loi", "Une opinion"], correct: 0 },
     { q: "C'est quoi la culture ?", a: ["Mode de vie", "Sport", "Maths"], correct: 0 },
     { q: "Qu'est-ce qu'un groupe social ?", a: ["Ensemble d'individus", "Un individu", "Seul"], correct: 0 },
     { q: "La famille est ?", a: ["Groupe de base", "Entreprise", "École"], correct: 0 },
     { q: "C'est quoi l'école ?", a: ["Lieu éducation", "Gare", "Hôtel"], correct: 0 },
     { q: "Qu'est-ce que le travail ?", a: ["Activité productive", "Repos", "Vacance"], correct: 0 },
     { q: "C'est quoi une classe sociale ?", a: ["Groupe social", "Salle", "Voiture"], correct: 0 },
     { q: "C'est quoi l'inégalité ?", a: ["Différence d'accès", "Égalité", "Sport"], correct: 0 },
     { q: "Qu'est-ce qu'un rôle social ?", a: ["Comportement attendu", "Jeu", "Sport"], correct: 0 }
   ],
   "Moyen": [
     { q: "C'est quoi la socialisation ?", a: ["Apprentissage normes", "Sport", "Manger"], correct: 0 },
     { q: "Qu'est-ce que la mobilité sociale ?", a: ["Changement position", "Repos", "Sport"], correct: 0 },
     { q: "C'est quoi la déviance ?", a: ["Non-respect normes", "Loi", "Droit"], correct: 0 },
     { q: "Qu'est-ce que la stratification ?", a: ["Hiérarchie sociale", "Architecture", "Sport"], correct: 0 },
     { q: "C'est quoi le contrôle social ?", a: ["Pression groupe", "Police", "Dormir"], correct: 0 },
     { q: "Qu'est-ce qu'un fait social (Durkheim) ?", a: ["Manière d'agir", "Opinion", "Jeu"], correct: 0 },
     { q: "C'est quoi l'intégration ?", a: ["Appartenance groupe", "Exclusion", "Sport"], correct: 0 },
     { q: "Qu'est-ce que le capital culturel ?", a: ["Savoirs/diplômes", "Argent", "Sport"], correct: 0 },
     { q: "C'est quoi le genre ?", a: ["Construction sociale", "Biologie", "Sport"], correct: 0 },
     { q: "Qu'est-ce que l'ethnocentrisme ?", a: ["Valoriser sa culture", "Ouverture", "Sport"], correct: 0 }
   ],
   "Difficile": [
     { q: "Qu'est-ce que l'habitus (Bourdieu) ?", a: ["Dispositions acquises", "Sport", "Droit"], correct: 0 },
     { q: "Qu'est-ce que l'anomie ?", a: ["Absence de règles", "Loi", "Sport"], correct: 0 },
     { q: "C'est quoi l'individualisme méthodologique ?", a: ["Action individuelle", "Groupe", "Sport"], correct: 0 },
     { q: "Qu'est-ce que le capital social ?", a: ["Réseau relations", "Argent", "Sport"], correct: 0 },
     { q: "C'est quoi l'interactionnisme ?", a: ["Étude interactions", "Groupe", "Sport"], correct: 0 },
     { q: "Qu'est-ce que le conflit de classe (Marx) ?", a: ["Lutte intérêts", "Amitié", "Sport"], correct: 0 },
     { q: "C'est quoi la rationalité limitée ?", a: ["Choix non optimal", "Logique", "Sport"], correct: 0 },
     { q: "Qu'est-ce que la sécularisation ?", a: ["Recul religieux", "Religion", "Sport"], correct: 0 },
     { q: "C'est quoi le holisme méthodologique ?", a: ["Prise en compte structure", "Individu", "Sport"], correct: 0 },
     { q: "Qu'est-ce que le déterminisme social ?", a: ["Influence milieu", "Liberté", "Sport"], correct: 0 }
   ]
 },
 "Anatomie": {
   "Facile": [
     { q: "Combien d'os possède un humain adulte ?", a: ["206", "150", "300"], correct: 0 },
     { q: "Quel organe pompe le sang ?", a: ["Cœur", "Foie", "Poumon"], correct: 0 },
     { q: "Quel est le plus grand organe ?", a: ["Peau", "Cerveau", "Estomac"], correct: 0 },
     { q: "C'est quoi le cerveau ?", a: ["Organe pensant", "Os", "Muscle"], correct: 0 },
     { q: "C'est quoi le foie ?", a: ["Organe filtrant", "Cœur", "Poumon"], correct: 0 },
     { q: "C'est quoi le poumon ?", a: ["Respiration", "Digestion", "Vision"], correct: 0 },
     { q: "C'est quoi un muscle ?", a: ["Tissu actif", "Os", "Peau"], correct: 0 },
     { q: "C'est quoi le sang ?", a: ["Liquide vital", "Eau", "Huile"], correct: 0 },
     { q: "C'est quoi l'estomac ?", a: ["Digestion", "Cœur", "Poumon"], correct: 0 },
     { q: "C'est quoi le squelette ?", a: ["Structure os", "Muscle", "Peau"], correct: 0 }
   ],
   "Moyen": [
     { q: "C'est quoi le système nerveux ?", a: ["Contrôle influx", "Digestion", "Sport"], correct: 0 },
     { q: "Combien de chambres a le cœur ?", a: ["4", "2", "3"], correct: 0 },
     { q: "C'est quoi l'intestin grêle ?", a: ["Digestion nutriments", "Rein", "Os"], correct: 0 },
     { q: "Quel est le rôle des reins ?", a: ["Filtrer le sang", "Penser", "Courir"], correct: 0 },
     { q: "C'est quoi le derme ?", a: ["Couche peau", "Os", "Muscle"], correct: 0 },
     { q: "Qu'est-ce qu'une vertèbre ?", a: ["Os colonne", "Muscle", "Nerf"], correct: 0 },
     { q: "Où se situe le fémur ?", a: ["Cuisse", "Bras", "Main"], correct: 0 },
     { q: "C'est quoi le pancréas ?", a: ["Glande digestive", "Poumon", "Os"], correct: 0 },
     { q: "Qu'est-ce qu'une artère ?", a: ["Vaisseau cœur vers corps", "Retour", "Nerf"], correct: 0 },
     { q: "Le rôle des globules rouges ?", a: ["Transporter oxygène", "Défense", "Digestion"], correct: 0 }
   ],
   "Difficile": [
     { q: "Qu'est-ce que le lobe occipital ?", a: ["Vision", "Audition", "Mouvement"], correct: 0 },
     { q: "C'est quoi l'homéostasie ?", a: ["Équilibre interne", "Mouvement", "Croissance"], correct: 0 },
     { q: "Quel est le rôle du cervelet ?", a: ["Coordination motrice", "Mémoire", "Digestion"], correct: 0 },
     { q: "C'est quoi la synaxe ?", a: ["Connexion neurones", "Muscle", "Os"], correct: 0 },
     { q: "Qu'est-ce que le liquide céphalo-rachidien ?", a: ["Protection cerveau", "Sang", "Digestion"], correct: 0 },
     { q: "Qu'est-ce qu'une synapse chimique ?", a: ["Neurotransmetteurs", "Choc", "Sport"], correct: 0 },
     { q: "C'est quoi le périoste ?", a: ["Membrane entourant os", "Muscle", "Peau"], correct: 0 },
     { q: "Qu'est-ce que l'hypophyse ?", a: ["Glande maîtresse", "Muscle", "Os"], correct: 0 },
     { q: "C'est quoi un néphron ?", a: ["Unité fonctionnelle rein", "Neurone", "Os"], correct: 0 },
     { q: "Qu'est-ce que l'épithélium ?", a: ["Tissu revêtement", "Os", "Muscle"], correct: 0 }
   ]
 },
 "Biomécanique": {
   "Facile": [
     { q: "Que signifie 'bio' ?", a: ["Vie", "Bois", "Terre"], correct: 0 },
     { q: "Objet biomécanique ?", a: ["Mouvement humain", "Étoile", "Cuisine"], correct: 0 },
     { q: "C'est quoi une articulation ?", a: ["Pivot", "Muscle", "Os"], correct: 0 },
     { q: "C'est quoi un os ?", a: ["Soutien", "Muscle", "Peau"], correct: 0 },
     { q: "C'est quoi un tendon ?", a: ["Lien os-muscle", "Os", "Cœur"], correct: 0 },
     { q: "C'est quoi un ligament ?", a: ["Lien os-os", "Muscle", "Peau"], correct: 0 },
     { q: "C'est quoi la force ?", a: ["Action physique", "Repos", "Sport"], correct: 0 },
     { q: "C'est quoi la vitesse ?", a: ["Mouvement rapide", "Repos", "Sport"], correct: 0 },
     { q: "C'est quoi la gravité ?", a: ["Attirance", "Repos", "Sport"], correct: 0 },
     { q: "C'est quoi l'équilibre ?", a: ["Stabilité", "Chute", "Sport"], correct: 0 }
   ],
   "Moyen": [
     { q: "C'est quoi le centre de gravité ?", a: ["Point équilibre", "Muscle", "Os"], correct: 0 },
     { q: "Qu'est-ce qu'un levier ?", a: ["Amplificateur force", "Muscle", "Os"], correct: 0 },
     { q: "C'est quoi le plan sagittal ?", a: ["Droit/Gauche", "Haut/Bas", "Avant/Arrière"], correct: 0 },
     { q: "Qu'est-ce que l'abduction ?", a: ["Éloignement", "Rapprochement", "Rotation"], correct: 0 },
     { q: "C'est quoi la cinématique ?", a: ["Étude mouvement", "Force", "Os"], correct: 0 },
     { q: "Qu'est-ce que la dynamique ?", a: ["Forces mouvement", "Repos", "Muscle"], correct: 0 },
     { q: "Qu'est-ce qu'une force de réaction ?", a: ["Sol sur pied", "Muscle", "Os"], correct: 0 },
     { q: "C'est quoi la flexion ?", a: ["Angle diminue", "Augmente", "Rotation"], correct: 0 },
     { q: "Qu'est-ce que l'extension ?", a: ["Angle augmente", "Diminue", "Rotation"], correct: 0 },
     { q: "Qu'est-ce que le moment de force ?", a: ["Torque", "Vitesse", "Force"], correct: 0 }
   ],
   "Difficile": [
     { q: "Qu'est-ce que le travail mécanique ?", a: ["Force x distance", "Force/Temps", "Vitesse"], correct: 0 },
     { q: "C'est quoi la puissance mécanique ?", a: ["Travail / Temps", "Force", "Vitesse"], correct: 0 },
     { q: "Qu'est-ce que l'inertie ?", a: ["Résistance mouvement", "Vitesse", "Force"], correct: 0 },
     { q: "C'est quoi le tenseur de contrainte ?", a: ["État de tension", "Force", "Os"], correct: 0 },
     { q: "Qu'est-ce que la loi de Hooke (tissu) ?", a: ["Élasticité", "Force", "Vitesse"], correct: 0 },
     { q: "Qu'est-ce qu'une chaîne cinétique ?", a: ["Segments liés", "Muscle", "Os"], correct: 0 },
     { q: "C'est quoi le couple ?", a: ["Force rotation", "Linéaire", "Vitesse"], correct: 0 },
     { q: "Qu'est-ce que l'accélération angulaire ?", a: ["Changement vitesse rot.", "Linéaire", "Force"], correct: 0 },
     { q: "Qu'est-ce que la viscosité tissulaire ?", a: ["Résistance écoulement", "Force", "Os"], correct: 0 },
     { q: "Qu'est-ce qu'une analyse inverse ?", a: ["Force depuis cinématique", "Directe", "Sport"], correct: 0 }
   ]
 }
  });



  const rejoindreGroupe = (annonceId) => {
  const userName = `${user.prenom} ${user.nom}`;
  
  setAnnonces(prevAnnonces => prevAnnonces.map(ann => {
    if (ann.id === annonceId) {
      const participantsActuels = ann.participants || [];
      
      if (participantsActuels.includes(userName)) {
        showToast("Tu as déjà rejoint ce groupe !", "error"); 
        return ann;
      }
      if (participantsActuels.length >= ann.placesMax) {
        showToast("Désolé, ce groupe est déjà complet !", "error");
        return ann;
      }
      
      const updatedParticipants = [...participantsActuels, userName];
      
      // Si complet, chat
      if (updatedParticipants.length >= ann.placesMax) {
        setTimeout(() => {
          if (typeof setActiveChatGroup === 'function') setActiveChatGroup(`ann-${ann.id}`);
          setPage('chat-room');
        }, 100);
      } else {
        // SUCCÈS : Le toast apparaît en haut de l'écran
        showToast(`Félicitations ! Tu as rejoint le groupe de ${ann.matiere}`, "success");
      }

      return { ...ann, participants: updatedParticipants };
    }
    return ann;
  }));
};
const currentQuestions = useMemo(() => {
  return quizData[selectedSubject]?.[selectedLevel] || [];
}, [selectedSubject, selectedLevel, quizData]);
  
const renderFullGroups = () => {
  const monNomComplet = `${user.prenom} ${user.nom}`;

  // 1. Filtre les binômes algorithmiques à 100%
  const completsMatches = allMatches ? allMatches.filter(match => match.score === 100) : [];

  // 2. Filtre les annonces du flux live qui sont complètes ET où je suis présent
  const completsAnnonces = annonces ? annonces.filter(ann => 
    ann.participants && ann.participants.includes(monNomComplet) && ann.participants.length >= ann.placesMax
  ) : [];

  const totalGroupes = completsMatches.length + completsAnnonces.length;


  return (
    <div style={{ marginTop: '24px', borderTop: '2px dashed #e2e8f0', paddingTop: '20px' }}>
      <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <ShieldCheck size={16} color="#10b981" /> Mes Groupes Formés ({totalGroupes})
      </h3>

      {totalGroupes === 0 ? (
        <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
            Aucun groupe n'est encore complet. Dès qu'un profil atteint 100% ou qu'une annonce est pleine, il apparaîtra ici.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
          {completsMatches.map((group, idx) => (
            <div key={`match-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '16px' }}>
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${group.nom}`} alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ffffff', border: '2px solid #10b981' }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 'bold', fontSize: '12px', color: '#166534', margin: 0 }}>Binôme validé avec {group.nom}</p>
                <p style={{ fontSize: '10px', color: '#15803d', margin: 0, textTransform: 'uppercase' }}>Matière : {group.matiere}</p>
              </div>
              <span style={{ fontSize: '10px', background: '#10b981', color: 'white', padding: '4px 8px', borderRadius: '20px', fontWeight: 'bold' }}>Binôme</span>
            </div>
          ))}

          {completsAnnonces.map((ann, idx) => (
            <div key={`ann-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px', borderRadius: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
                {ann.matiere.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 'bold', fontSize: '12px', color: '#1e40af', margin: 0 }}>Groupe complet ({ann.participants ? ann.participants.length : 0} pers.)</p>
                <p style={{ fontSize: '10px', color: '#2563eb', margin: 0, textTransform: 'uppercase' }}>Matière : {ann.matiere}</p>
              </div>
              <span style={{ fontSize: '10px', background: '#2563eb', color: 'white', padding: '4px 8px', borderRadius: '20px', fontWeight: 'bold' }}>Annonce</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

  const PROFILS_TYPES = [
  {
    prenom: "Marie", nom: "Curie", idEtudiant: "11111111", ufr: "MIASHS", annee: "L2", groupeTD: "A1",
    fiabilite: 95, pointsForts: ["Mathématiques", "Informatique"], pointsFaibles: ["Économie"],
    interests: ["Sport", "Cinéma"], methode: "Solo / Calme", dispos: { "Lun": ["08h-10h"], "Mar": ["14h-16h"], "Mer": [], "Jeu": [], "Ven": [], "Sam": [], "Dim": [] }
  },
  {
    prenom: "Jean", nom: "Tirole", idEtudiant: "22222222", ufr: "SEGMI", annee: "L3", groupeTD: "B2",
    fiabilite: 90, pointsForts: ["Économie", "Management"], pointsFaibles: ["Informatique"],
    interests: ["Gaming", "Musique"], methode: "En groupe / Bibli", dispos: { "Lun": ["10h-12h"], "Mar": ["16h-18h"], "Mer": [], "Jeu": [], "Ven": [], "Sam": [], "Dim": [] }
  },
  {
    prenom: "Ada", nom: "Lovelace", idEtudiant: "33333333", ufr: "SITEC", annee: "M1", groupeTD: "C1",
    fiabilite: 98, pointsForts: ["Informatique", "Mathématiques"], pointsFaibles: ["Anglais"],
    interests: ["Gaming", "Littérature"], methode: "Proactif / Organisé", dispos: { "Lun": ["14h-16h"], "Mar": ["08h-10h"], "Mer": [], "Jeu": [], "Ven": [], "Sam": [], "Dim": [] }
  }
];

  const DATABASE_STORAGE_KEY = 'studymatch_accounts_database';
  const ACTIVE_USER_KEY = 'studymatch_active_session_user';

  // --- FONCTION DE VALIDATION ANATOMIQUE ET STRICTE DU MOT DE PASSE ---
  const validatePasswordStrength = (password) => {
    const missingCriteria = [];
    
    if (password.length < 12) {
      missingCriteria.push("12 caractères minimum");
    }
    if (!/[A-Z]/.test(password)) {
      missingCriteria.push("au moins une lettre majuscule");
    }
    if (!/[a-z]/.test(password)) {
      missingCriteria.push("au moins une lettre minuscule");
    }
    if (!/[0-9]/.test(password)) {
      missingCriteria.push("au moins un chiffre");
    }
    if (!/[@!*\-().?&]/.test(password)) {
      missingCriteria.push("un caractère spécial parmi @ ! * - ( ) . ? &");
    }

    return missingCriteria;
  };

  const fetchMatches = () => {
  if (!user || !user.idEtudiant) return;
  
  fetch(`http://localhost:5000/api/get-matches/${user.idEtudiant}`)
    .then(res => res.json())
    .then(data => {
      // Filtrer les doublons par ID avant de mettre à jour le state
      const uniqueMatches = Array.from(new Set(data.map(a => a.idEtudiant)))
        .map(id => {
          return data.find(a => a.idEtudiant === id);
        });
      setMatches(uniqueMatches);
    })
    .catch(err => console.error("Erreur matches:", err));
};

const handleResetPassword = async (e) => {
  e.preventDefault();
  setErrorMessage("");

  // 1. Vérifications de base (ID et Mots de passe)
  if (!forgotPasswordForm.idEtudiant.trim()) {
    setErrorMessage("Veuillez entrer votre numéro étudiant.");
    return;
  }
  if (forgotPasswordForm.nouveauMotDePasse !== forgotPasswordForm.confirmerNouveauMotDePasse) {
    setErrorMessage("Les deux mots de passe ne correspondent pas.");
    return;
  }
  const passwordErrors = validatePasswordStrength(forgotPasswordForm.nouveauMotDePasse);
  if (passwordErrors.length > 0) {
    setErrorMessage(`Le mot de passe doit contenir : ${passwordErrors.join(', ')}.`);
    return;
  }

  // 2. Appel au serveur au lieu de chercher dans le localStorage
  setLoading(true);
  try {
    const response = await fetch('http://localhost:5000/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        idEtudiant: forgotPasswordForm.idEtudiant, 
        nouveauMotDePasse: forgotPasswordForm.nouveauMotDePasse 
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert("Mot de passe modifié avec succès !");
      setForgotPasswordForm({ idEtudiant: "", nouveauMotDePasse: "", confirmerNouveauMotDePasse: "" });
      setPage('auth');
    } else {
      setErrorMessage(data.error || "Une erreur est survenue.");
    }
  } catch (err) {
    setErrorMessage("Erreur de connexion au serveur.");
  } finally {
    setLoading(false);
  }
};

const handleTutoratPayment = (annonce) => {
  showToast("💳 Transaction réussie : 10,00 € transférés !", "success");
};

const sendNotification = (recipientId, message, type, annonceId) => {
  fetch('http://localhost:5000/api/send-notification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      recipient_id: recipientId, 
      message: message, 
      type: type, 
      annonce_id: annonceId 
    })
  })
  .then(res => console.log("Notif envoyée au serveur"))
  .catch(err => console.error("Erreur notif:", err));
};

  const handleAuth = async (e) => {
  e.preventDefault();
  setErrorMessage("");

  // 1. Garde tes validations locales (Numéro étudiant, etc.)
  if (!authForm.idEtudiant.trim()) {
    setErrorMessage("Le champ [Numéro Étudiant] n'a pas été rempli.");
    return;
  }
  
  const digitsOnly = authForm.idEtudiant.replace(/\D/g, "");
  if (authForm.idEtudiant.length !== 8 || digitsOnly.length !== 8) {
    setErrorMessage("Le numéro étudiant doit faire exactement 8 chiffres.");
    return;
  }

  if (!authForm.motDePasse.trim()) {
    setErrorMessage("Le champ [Mot de passe] n'a pas été rempli.");
    return;
  }

  // 2. Remplace la recherche locale par une requête vers ton serveur Flask
  setLoading(true);
  try {
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        idEtudiant: authForm.idEtudiant, 
        motDePasse: authForm.motDePasse 
      })
    });

    const data = await response.json();

    if (response.ok) {
      const rawUser = data.user;

      // Fonction pour transformer le texte JSON de la BDD en objets/tableaux JS
      const parseField = (field) => {
        if (typeof field === 'string') {
          try { return JSON.parse(field); } catch (e) { return field; }
        }
        return field || [];
      };

      // Création d'un objet utilisateur "propre"
      const parsedUser = {
        ...rawUser,
        interests: parseField(rawUser.interests),
        pointsForts: parseField(rawUser.pointsForts),
        pointsFaibles: parseField(rawUser.pointsFaibles),
        dispos: parseField(rawUser.dispos)
      };

      setUser(parsedUser);
      setEditUser(parsedUser);
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(parsedUser));
      setPage('home');
      setAuthForm({ idEtudiant: "", motDePasse: "" });
    } else {
      setErrorMessage(data.error || "Identifiants incorrects.");
    }
  } catch (err) {
    setErrorMessage("Erreur de connexion au serveur.");
  } finally {
    setLoading(false);
  }
};

const handleSendMessage = (chatId, text, senderName = "Moi") => {
  const messageToSend = text || "";
  if (!messageToSend.trim()) return;

  const now = new Date();
  const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const newMsg = { sender: senderName, text: messageToSend, time: timeString };

  // 1. Mise à jour des messages
  setChats(prevChats => prevChats.map(c => {
    if (c.id === chatId) {
      return { ...c, messages: [...c.messages, newMsg] };
    }
    return c;
  }));

  // 2. Gestion du compteur de non-lus
  // On vérifie : 
  // - L'expéditeur n'est PAS "Moi"
  // - Le chat qui reçoit le message n'est PAS celui qui est ouvert actuellement
  console.log("Debug Badge - Sender:", senderName, "ActiveID:", currentChatId, "TargetID:", chatId);
  
  if (senderName !== "Moi") { 
    setUnreadMessages(prev => prev + 1); 
}

  setNewMessageText("");
};

const updateWallet = (amount) => {
  setUser(prev => ({
    ...prev,
    wallet: (prev.wallet || 0) + amount
  }));
  showToast(`Félicitations ! Ton portefeuille a été crédité de ${amount} €`, "success");
};

const validerInscription = (annonceId) => {

  const userName = `${user.prenom} ${user.nom}`;
  
  setAnnonces(prevAnnonces => prevAnnonces.map(ann => {
    if (ann.id === annonceId) {
      const updatedParticipants = [...ann.participants, userName];
      
      const messagePourAuteur = ann.isTutorat 
        ? `${userName} accepte de devenir ton tuteur pour : ${ann.matiere}` 
        : `${userName} a rejoint ton groupe : ${ann.matiere}`;

      // Envoi de la notif
      const nouvelleNotif = {
        recipient_id: ann.auteur_id, 
        message: messagePourAuteur,
        type: 'join',
        annonce_id: ann.id
      };

      fetch('http://localhost:5000/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nouvelleNotif)
      })
      .catch(err => console.error("Erreur envoi notif :", err));

      // 1. Feedback visuel
      if (ann.isTutorat) {
        handleTutoratPayment(ann);
        // 2. CRÉDIT DU PORTEFEUILLE (Placé ici, dans le bloc où 'ann' est défini)
        updateWallet(5);
      }

      showToast(`Félicitations ! Tu as rejoint ${ann.isTutorat ? 'le tutorat de' : 'le groupe de'} ${ann.matiere}`, "success");
      
      return { ...ann, participants: updatedParticipants };
    }
    return ann;
  }));
};

const handleJoinAnnonce = (annonceId) => {
  const userName = `${user.prenom} ${user.nom}`;
  const annonce = annonces.find(ann => ann.id === annonceId);

  if (!annonce) return;

  // Vérifications de blocage
  if (annonce.participants.includes(userName)) {
    showToast("Tu as déjà rejoint ce groupe !", "error");
    return;
  }
  if (annonce.participants.length >= annonce.placesMax) {
    showToast("Désolé, ce groupe est déjà complet !", "error");
    return;
  }

  // Vérification tutorat
  if (annonce.isTutorat) {
    if (!estAnneeSuperieure(user.annee, annonce.niveau)) {
      showToast(`Action impossible : Seuls les niveaux > ${annonce.niveau} peuvent postuler comme tuteur.`, "error");
      return;
    }
    // Ouvre la modale pour le paiement
    setTutoratToConfirm(annonce);
  } else {
    // Inscription directe pour entraide classique
    validerInscription(annonceId);
  }
};

const deleteAnnonce = (id) => {
  setAnnonces(prevAnnonces => prevAnnonces.filter(ann => ann.id !== id));
  showToast("Annonce supprimée avec succès.", "success");
};

const quitterGroupe = (annonceId) => {
  const userName = `${user.prenom} ${user.nom}`;
  
  setAnnonces(prevAnnonces => prevAnnonces.map(ann => {
    if (ann.id === annonceId) {
      const updatedParticipants = (ann.participants || []).filter(name => name !== userName);
      
      showToast(`Tu as bien quitté le groupe de ${ann.matiere}.`, "info");
      return { ...ann, participants: updatedParticipants };
    }
    return ann;
  }));
};

const fetchStudents = () => {
  fetch('http://localhost:5000/api/students') // Ou ton URL habituelle
    .then(res => res.json())
    .then(data => setStudents(data))
    .catch(err => console.error(err));
};

  const handleRegister = async (studentData) => {
  try {
    const response = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log("Inscription réussie !");
      setPage('groups');
    } else {
      // C'est ici que tu nettoies le message
      if (data.error && data.error.includes("UNIQUE constraint failed: students.idEtudiant")) {
        setErrorMessage("Ce numéro étudiant est déjà utilisé par un autre compte.");
      } else {
        setErrorMessage(data.error || "Erreur lors de l'enregistrement.");
      }
    }
  } catch (error) {
    setErrorMessage("Impossible de joindre le serveur.");
  }
};

  const addMatch = (newMatch) => {
  fetch('http://localhost:5000/api/add-match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: user.idEtudiant,
      match_id: newMatch.sender_id // L'id de la personne qui a envoyé la notif
    })
  })
  .then(() => {
    // Une fois enregistré, on rafraîchit la liste des binômes
    fetchMatches(); 
  });
};

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!signupForm.prenom.trim()) {
      setErrorMessage("Le champ [Prénom] n'a pas été rempli.");
      return;
    }
    if (!signupForm.nom.trim()) {
      setErrorMessage("Le champ [Nom] n'a pas été rempli.");
      return;
    }
    if (!signupForm.idEtudiant.trim()) {
      setErrorMessage("Le champ [Numéro Étudiant] n'a pas été rempli.");
      return;
    }

    if (signupForm.motDePasse !== signupForm.confirmerMotDePasse) {
      setErrorMessage("Les deux mots de passe ne correspondent pas.");
      return; // On arrête l'exécution ici si ça ne correspond pas
    }

    const digitsOnly = signupForm.idEtudiant.replace(/\D/g, "");
    if (signupForm.idEtudiant.length !== 8 || digitsOnly.length !== 8) {
      setErrorMessage("Le numéro étudiant doit faire exactement 8 chiffres.");
      return;
    }

    const passwordErrors = validatePasswordStrength(signupForm.motDePasse);
    if (passwordErrors.length > 0) {
      setErrorMessage(`Le mot de passe doit contenir : ${passwordErrors.join(', ')}.`);
      return;
    }

    if (signupForm.interests.length === 0) {
      setErrorMessage("Tu dois sélectionner au moins un centre d'intérêt.");
      return;
    }
    if (signupForm.pointsForts.length === 0) {
      setErrorMessage("Tu dois sélectionner au moins un Point Fort.");
      return;
    }
    if (signupForm.pointsFaibles.length === 0) {
      setErrorMessage("Tu dois sélectionner au moins un Point Faible.");
      return;
    }

    let totalSlotsChosen = 0;
    JOURS.forEach(j => {
      totalSlotsChosen += (signupForm.dispos[j]?.length || 0);
    });
    if (totalSlotsChosen === 0) {
      setErrorMessage("Tu dois choisir au moins un créneau de disponibilité.");
      return;
    }

    const savedDatabaseString = localStorage.getItem(DATABASE_STORAGE_KEY);
    let database = [];
    if (savedDatabaseString) {
      try { database = JSON.parse(savedDatabaseString); } catch(e) {}
    }

    const isDuplicate = database.some(account => account.idEtudiant === signupForm.idEtudiant);
    if (isDuplicate) {
      setErrorMessage("Un compte existe déjà avec ce numéro étudiant.");
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      const newUserObject = {
        prenom: signupForm.prenom,
        nom: signupForm.nom,
        idEtudiant: signupForm.idEtudiant,
        ufr: signupForm.ufr,
        annee: signupForm.annee,
        methode: signupForm.methode || "Solo / Calme",
        groupeTD: "A1",
        motDePasse: signupForm.motDePasse,
        interests: signupForm.interests,
        pointsForts: signupForm.pointsForts,
        pointsFaibles: signupForm.pointsFaibles,
        dispos: signupForm.dispos
      };

      handleRegister(newUserObject);

      setUser(newUserObject);
      setEditUser(newUserObject);
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(newUserObject));
      setLoading(false);
    }, 1200);
  };

  const saveSettings = async () => {
  setErrorMessage("");
  
  // 1. Validations de base
  if (!editUser.prenom.trim()) {
    setErrorMessage("Le champ [Prénom] n'a pas été rempli.");
    return;
  }
  if (!editUser.nom.trim()) {
    setErrorMessage("Le champ [Nom] n'a pas été rempli.");
    return;
  }
  
  const passwordErrors = validatePasswordStrength(editUser.motDePasse);
  if (passwordErrors.length > 0) {
    setErrorMessage(`Le mot de passe doit contenir : ${passwordErrors.join(', ')}.`);
    return;
  }

  if (editUser.interests.length === 0) {
    setErrorMessage("Tu dois garder au moins un centre d'intérêt.");
    return;
  }
  if (editUser.pointsForts.length === 0) {
    setErrorMessage("Tu dois garder au moins un Point Fort.");
    return;
  }
  if (editUser.pointsFaibles.length === 0) {
    setErrorMessage("Tu dois garder au moins un Point Faible.");
    return;
  }

  let totalSlotsChosen = 0;
  JOURS.forEach(j => {
    totalSlotsChosen += (editUser.dispos[j]?.length || 0);
  });
  if (totalSlotsChosen === 0) {
    setErrorMessage("Tu dois garder au moins un créneau de disponibilité.");
    return;
  }

  setLoading(true);

  try {
    // 2. Préparation de l'objet utilisateur à sauvegarder
    const userToSave = { 
      ...editUser, 
      wallet: user.wallet !== undefined ? user.wallet : 0 
    };

    // 3. Envoi vers le serveur SQL (Flask)
    const response = await fetch('http://localhost:5000/api/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userToSave)
    });

    if (response.ok) {
      // 4. Succès : mise à jour de l'état local et localStorage
      setUser(userToSave);
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(userToSave));

      // Mise à jour de la base de données locale (si tu en utilises toujours une pour les autres profils)
      const savedDatabaseString = localStorage.getItem(DATABASE_STORAGE_KEY);
      if (savedDatabaseString) {
        try {
          let database = JSON.parse(savedDatabaseString);
          const updatedDatabase = database.map(account => 
            account.idEtudiant === userToSave.idEtudiant ? userToSave : account
          );
          localStorage.setItem(DATABASE_STORAGE_KEY, JSON.stringify(updatedDatabase));
        } catch(e) { console.error("Erreur mise à jour BDD locale", e); }
      }

      showToast("Profil enregistré avec succès !", "success");
      setPage('profile');
    } else {
      const data = await response.json();
      setErrorMessage(data.error || "Erreur lors de la sauvegarde sur le serveur.");
    }
  } catch (err) {
    console.error(err);
    setErrorMessage("Impossible de joindre le serveur pour sauvegarder.");
  } finally {
    setLoading(false);
  }
};

  const handleStudentIdTyping = (formType, value) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 8) {
      if (formType === 'auth') {
        setAuthForm({ ...authForm, idEtudiant: cleaned });
      } else {
        setSignupForm({ ...signupForm, idEtudiant: cleaned });
      }
    }
  };

  const handleToggleListSelection = (formType, field, value) => {
    if (formType === 'signup') {
      const currentList = [...signupForm[field]];
      const newList = currentList.includes(value) ? currentList.filter(v => v !== value) : [...currentList, value];
      setSignupForm({ ...signupForm, [field]: newList });
    } else {
      const currentList = [...editUser[field]];
      const newList = currentList.includes(value) ? currentList.filter(v => v !== value) : [...currentList, value];
      setEditUser({ ...editUser, [field]: newList });
    }
  };

  const handleCalendarChange = (jour, newSlots) => {
    setEditUser(prev => ({
      ...prev,
      dispos: { ...prev.dispos, [jour]: newSlots }
    }));
  };

  const handleSignupCalendarChange = (jour, newSlots) => {
    setSignupForm(prev => ({
      ...prev,
      dispos: { ...prev.dispos, [jour]: newSlots }
    }));
  };

  const getSubjectIcon = (subject) => {
    const icons = {
      "Mathématiques": <Target size={24} />,
      "Informatique": <Zap size={24} />,
      "Droit": <ShieldCheck size={24} />,
      "Économie": <TrendingUp size={24} />,
      "Management": <Users size={24} />,
      "Histoire": <BookOpen size={24} />,
      "Philosophie": <Info size={24} />,
      "Français": <Edit3 size={24} />,
      "Anglais": <Globe size={24} />,
      "Espagnol": <Languages size={24} />,
      "Italien": <Languages size={24} />,
      "Psychologie": <Heart size={24} />,
      "Sociologie": <Users size={24} />,
      "Anatomie": <Activity size={24} />,
      "Biomécanique": <Move size={24} />
    };
    return icons[subject] || <BookOpen size={24} />;
  };


  const showToast = (msg, type) => {
  setToast({ message: msg, type: type });
  setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

const startOrCreateChat = (name, type, avatar = null) => {
  const existingChat = chats.find(c => c.name === name);
  if (existingChat) {
    setCurrentChatId(existingChat.id);
  } else {
    const newChat = {
      id: Date.now(),
      name: name,
      type: type,
      avatar: avatar,
      unread: false,
      messages: []
    };
    setChats([newChat, ...chats]);
    setCurrentChatId(newChat.id);
  }
  setPage('chats');
};


  return (
<div className="phone-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>      
      {errorMessage && (
        <div style={{ position: 'absolute', top: '70px', left: '16px', right: '16px', background: '#fef2f2', border: '1px solid #f87171', color: '#b91c1c', padding: '10px 14px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', zIndex: 99999, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <span>⚠️ {errorMessage}</span>
          <button onClick={() => setErrorMessage("")} style={{ background: 'none', border: 'none', color: '#b91c1c', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ÉCRAN 1 : AUTHENTIFICATION */}
      {/* ==================================================================== */}
      {page === 'auth' && (
        <div className="auth-screen">
          <div className="auth-logo-circle-css" style={{ background: '#2563eb' }}>
            <GraduationCap color="white" size={38} strokeWidth={2.5}/>
          </div>
          
          <div className="auth-title-container">
            <h1 className="brand-title">STUDY<span style={{ color: '#2563eb' }}>MATCH</span></h1>
            <p className="brand-subtitle">Nanterre Campus Edition</p>
          </div>

          <form onSubmit={handleAuth} className="auth-form" style={{ width: '100%' }}>
  <div className="input-container">
    <div className="input-wrapper">
      <input
        type="text"
        value={authForm.idEtudiant}
        onChange={e => handleStudentIdTyping('auth', e.target.value)}
        placeholder="Numéro Étudiant (8 chiffres)"
        className="app-input"
      />
      <Fingerprint className="input-icon" size={16} />
    </div>
  </div>

  <div className="input-container">
    <div className="input-wrapper">
      <input
        type="password"
        value={authForm.motDePasse}
        onChange={e => setAuthForm({...authForm, motDePasse: e.target.value})}
        placeholder="Mot de passe"
        className="app-input"
      />
      <Lock className="input-icon" size={16} />
    </div>
  </div>

  {/* LIEN AJOUTÉ ICI */}
  <div style={{ textAlign: 'right', marginBottom: '16px', marginTop: '-8px' }}>
    <button
      type="button"
      onClick={() => { setErrorMessage(""); setPage('forgot-password'); }}
      style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
    >
      Mot de passe oublié ?
    </button>
  </div>

  <button type="submit" className="btn-primary" style={{ marginBottom: '10px', background: '#2563eb' }}>
    Accéder au Campus <ChevronRight size={16}/>
  </button>

  <button
    type="button"
    onClick={() => {
      setErrorMessage("");
      setSignupForm({
        prenom: "", nom: "", idEtudiant: "", annee: "L1", ufr: "SEGMI", motDePasse: "", interests: [], methode: "Solo / Calme", pointsForts: [], pointsFaibles: [], avatar: AVATARS_GALLERY[0], dispos: { "Lun": [], "Mar": [], "Mer": [], "Jeu": [], "Ven": [], "Sam": [], "Dim": [] }
      });
      setPage('register');
    }}
    className="btn-primary"
    style={{ background: '#cbd5e1', color: '#334155', boxShadow: 'none' }}
  >
    Créer un compte étudiant
  </button>
</form>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ÉCRAN 2 : INSCRIPTION */}
      {/* ==================================================================== */}
      {page === 'forgot-password' && (
        <div className="auth-screen" style={{ padding: '20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' }}>Réinitialisation</h2>
            <p style={{ fontSize: '11px', color: '#64748b' }}>Modifie ton mot de passe étudiant</p>
          </div>

          <form onSubmit={handleResetPassword} className="auth-form" style={{ width: '100%' }}>
            <div className="input-container">
              <div className="input-wrapper">
                <input
                  type="text"
                  value={forgotPasswordForm.idEtudiant}
                  onChange={e => {
                    const cleaned = e.target.value.replace(/\D/g, "");
                    if (cleaned.length <= 8) setForgotPasswordForm({...forgotPasswordForm, idEtudiant: cleaned});
                  }}
                  placeholder="Ton Numéro Étudiant (8 chiffres)"
                  className="app-input"
                />
                <Fingerprint className="input-icon" size={16} />
              </div>
            </div>

            <div className="input-container">
              <div className="input-wrapper">
                <input
                  type="password"
                  value={forgotPasswordForm.nouveauMotDePasse}
                  onChange={e => setForgotPasswordForm({...forgotPasswordForm, nouveauMotDePasse: e.target.value})}
                  placeholder="Nouveau mot de passe sécurisé"
                  className="app-input"
                />
                <Lock className="input-icon" size={16} />
              </div>
            </div>

            <div className="input-container">
              <div className="input-wrapper">
                <input
                  type="password"
                  value={forgotPasswordForm.confirmerNouveauMotDePasse}
                  onChange={e => setForgotPasswordForm({...forgotPasswordForm, confirmerNouveauMotDePasse: e.target.value})}
                  placeholder="Confirmer le nouveau mot de passe"
                  className="app-input"
                />
                <Lock className="input-icon" size={16} />
              </div>
            </div>


            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button type="submit" className="btn-primary" style={{ flex: 2, background: '#2563eb' }}>
                Changer le mot de passe
              </button>
              <button type="button" onClick={() => { setErrorMessage(""); setPage('auth'); }} className="btn-primary" style={{ flex: 1, background: '#64748b', boxShadow: 'none' }}>
                Retour
              </button>
            </div>
          </form>
        </div>
      )}

      {page === 'register' && (
        <div className="screen-content" style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' }}>Création de compte</h2>
            <p style={{ fontSize: '11px', color: '#64748b' }}>Rejoins l'entraide de Paris Nanterre</p>
          </div>

           {/* ==================================================================== */}
      {/* ÉCRAN INTERMÉDIAIRE : MOT DE PASSE OUBLIÉ */}
      {/* ==================================================================== */}


          <form onSubmit={handleSignupSubmit} className="form-grid" style={{ gap: '12px' }}>
            
            <div className="select-box">
              <label className="input-label" style={{ fontWeight: 'bold', color: '#0f172a' }}>Choisis ton avatar étudiant *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginTop: '8px', background: 'white', padding: '10px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                {AVATARS_GALLERY.map((avatarUrl, idx) => {
                  const isSelected = signupForm.avatar === avatarUrl;
                  return (
                    <img
                      key={idx}
                      src={avatarUrl}
                      alt={`Avatar ${idx}`}
                      onClick={() => setSignupForm({ ...signupForm, avatar: avatarUrl })}
                      style={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: '50%',
                        background: '#f8fafc',
                        cursor: 'pointer',
                        border: isSelected ? '3px solid #2563eb' : '2px solid transparent',
                        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                        transition: 'all 0.15s ease'
                      }}
                    />
                  );
                })}
              </div>
            </div>

            <div className="input-container">
              <label className="input-label">Prénom *</label>
              <div className="input-wrapper">
                <input type="text" value={signupForm.prenom} onChange={e => setSignupForm({...signupForm, prenom: e.target.value})} placeholder="Ex: Jean" className="app-input" />
              </div>
            </div>

            <div className="input-container">
              <label className="input-label">Nom *</label>
              <div className="input-wrapper">
                <input type="text" value={signupForm.nom} onChange={e => setSignupForm({...signupForm, nom: e.target.value})} placeholder="Ex: Dupont" className="app-input" />
              </div>
            </div>

            <div className="select-row">
              <div className="select-box">
                <label className="input-label">Niveau d'études *</label>
                <select value={signupForm.annee || "L1"} onChange={e => setSignupForm({...signupForm, annee: e.target.value})} className="app-select">
                  {ANNEE_LIST.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              <div className="select-box">
                <label className="input-label">UFR / Faculté *</label>
                <select value={signupForm.ufr || "SEGMI"} onChange={e => setSignupForm({...signupForm, ufr: e.target.value})} className="app-select">
                  {UFR_LIST.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div className="select-box">
              <label className="input-label">Mes centres d'intérêt (Minimum 1) *</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {INTERESTS_LIST.map(item => {
                  const active = signupForm.interests.includes(item);
                  return (
                    <button type="button" key={item} onClick={() => handleToggleListSelection('signup', 'interests', item)} style={{ padding: '5px 10px', fontSize: '10px', borderRadius: '8px', border: active ? 'none' : '1px solid #cbd5e1', background: active ? '#2563eb' : '#f8fafc', color: active ? 'white' : '#475569', cursor: 'pointer' }}>{item}</button>
                  );
                })}
              </div>
            </div>

            <div className="select-box">
              <label className="input-label">Méthode de révision préférée *</label>
              <select value={signupForm.methode || "Solo / Calme"} onChange={e => setSignupForm({...signupForm, methode: e.target.value})} className="app-select">
                {METHODS_LIST.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="select-box">
              <label className="input-label" style={{ color: '#10b981' }}>Mes Points Forts (Minimum 1) *</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {SUBJECTS_LIST.map(sub => {
                  const active = signupForm.pointsForts.includes(sub);
                  return (
                    <button type="button" key={sub} onClick={() => handleToggleListSelection('signup', 'pointsForts', sub)} style={{ padding: '4px 10px', fontSize: '9px', borderRadius: '8px', border: active ? 'none' : '1px solid #cbd5e1', background: active ? '#10b981' : '#f8fafc', color: active ? 'white' : '#475569', cursor: 'pointer' }}>{sub}</button>
                  );
                })}
              </div>
            </div>

            <div className="select-box">
              <label className="input-label" style={{ color: '#ef4444' }}>Mes Points Faibles (Minimum 1) *</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {SUBJECTS_LIST.map(sub => {
                  const active = signupForm.pointsFaibles.includes(sub);
                  return (
                    <button type="button" key={sub} onClick={() => handleToggleListSelection('signup', 'pointsFaibles', sub)} style={{ padding: '4px 10px', fontSize: '9px', borderRadius: '8px', border: active ? 'none' : '1px solid #cbd5e1', background: active ? '#ef4444' : '#f8fafc', color: active ? 'white' : '#475569', cursor: 'pointer' }}>{sub}</button>
                  );
                })}
              </div>
            </div>

            <div className="input-container">
              <label className="input-label">ID - Numéro Étudiant (Sert d'identifiant unique) *</label>
              <div className="input-wrapper">
                <input type="text" value={signupForm.idEtudiant} onChange={e => handleStudentIdTyping('signup', e.target.value)} placeholder="Ex: 20240591" className="app-input" />
              </div>
            </div>

            <div className="input-container">
              <label className="input-label">Mot de passe (Critères sécurisés requis) *</label>
              <div className="input-wrapper">
                <input type="password" value={signupForm.motDePasse} onChange={e => setSignupForm({...signupForm, motDePasse: e.target.value})} placeholder="••••••••" className="app-input" />
              </div>
            </div>

            <div className="input-container">
  <label className="input-label">Confirmer le mot de passe *</label>
  <div className="input-wrapper">
    <input 
      type="password" 
      value={signupForm.confirmerMotDePasse} 
      onChange={e => setSignupForm({...signupForm, confirmerMotDePasse: e.target.value})} 
      placeholder="••••••••" 
      className="app-input" 
    />
  </div>
</div>

            <AvailabilityManager 
              initialDispos={signupForm.dispos}
              onChange={handleSignupCalendarChange}
              readOnly={false}
            />

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button type="submit" className="btn-primary" style={{ flex: 2, background: '#2563eb' }}>
                Valider l'inscription
              </button>
              <button type="button" onClick={() => { setErrorMessage(""); setPage('auth'); }} className="btn-primary" style={{ flex: 1, background: '#64748b', boxShadow: 'none' }}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {toast.message && (
  <div 
    className="animate-in slide-in-from-top duration-300"
    style={{ 
      position: 'absolute', 
      top: '20px', 
      left: '20px', 
      right: '20px', 
      padding: '16px', 
      borderRadius: '16px', 
      backgroundColor: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
      border: toast.type === 'error' ? '1px solid #f87171' : '1px solid #4ade80',
      color: toast.type === 'error' ? '#b91c1c' : '#15803d',
      fontWeight: 'bold',
      fontSize: '12px',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}
  >
    {toast.type === 'error' ? <ShieldAlert size={18} /> : <Check size={18} />}
    {toast.message}
  </div>
)}

{page === 'chats' && (
  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#f8fafc', overflow: 'hidden' }}>
    {currentChatId === null ? (
      <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '20px' }}>Messages</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {chats
          .map(c => (
            <div key={c.id} onClick={() => { setCurrentChatId(c.id); c.unread = false; }} 
              style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'white', padding: '16px', borderRadius: '20px', border: '1px solid #f1f5f9', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: c.type === 'binome' ? '#e2e8f0' : '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {c.type === 'binome' ? <img src={c.avatar} style={{ width: '48px', height: '48px', borderRadius: '50%' }} alt="" /> : <MessageSquare color="#2563eb" size={24} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ fontWeight: '800', fontSize: '13px', margin: 0 }}>{c.name}</p>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>{c.messages.length > 0 ? c.messages[c.messages.length - 1].time : ""}</span>
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
                  {c.messages.length > 0 ? c.messages[c.messages.length - 1].text : "Aucun message"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : (
      (() => {
        const activeChat = chats.find(c => c.id === currentChatId);
        return (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', background: 'white' }}>
            {/* Header Chat */}
            <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
              <button onClick={() => setCurrentChatId(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '8px 12px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>←</button>
              <p style={{ fontWeight: '900', fontSize: '14px', margin: 0 }}>{activeChat.name}</p>
            </div>
            
            {/* Messages */}
            <div style={{ flex:1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
{activeChat.messages.map((m, index) => {

  console.log("Message de:", m.sender, "Est-ce égal à 'Moi' ?", m.sender === "Moi");

  const isMe = (m.sender === "Moi" || m.sender === `${user.prenom} ${user.nom}`);

  return (
    <div key={index} style={{ 
      alignSelf: isMe ? 'flex-end' : 'flex-start',
      maxWidth: '80%',
      marginBottom: '10px'
    }}>
      {/* Affiche le nom seulement si ce n'est PAS moi */}
      {!isMe && (
        <p style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px', marginLeft: '4px' }}>
          {m.sender}
        </p>
      )}
      
      <div style={{ 
        padding: '10px 16px', 
        borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px', 
        background: isMe ? '#2563eb' : '#f1f5f9', // Bleu pour moi, Gris pour l'autre
        color: isMe ? 'white' : '#1e293b', 
        fontSize: '13px' 
      }}>
        {m.text}
      </div>
    </div>
  );
})}
            </div>

            {/* Input */}
<div style={{ flexShrink: 0, padding: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px' }}>
  <input 
    type="text" 
    value={newMessageText} 
    onChange={(e) => setNewMessageText(e.target.value)} 
    placeholder="Ton message..." 
    style={{ flex: 1, padding: '12px', borderRadius: '15px', border: '1px solid #e2e8f0', outline: 'none' }} 
  />
<button 
  onClick={() => handleSendMessage(activeChat.id, newMessageText, `${user.prenom} ${user.nom}`)}
  style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '15px', padding: '0 20px' }}
>
  <Send size={18} />
</button>
</div>
          </div>
        );
      })()
    )}
  </div>
)}

      {/* ==================================================================== */}
      {/* MODE CONNECTÉ : CORE FLUX NAVIGATION PRINCIPALE */}
      {/* ==================================================================== */}
      {page !== 'auth' && page !== 'register' && page !== 'chats' && page !== 'forgot-password' && (

        <header className="app-header" style={{ flexShrink: 0 }}>  {/* Partie Gauche : Titre et Statut */}
  <div>
    <h1 className="header-brand">STUDY<span>MATCH</span></h1>
    <p className="header-status">● Serveur Nanterre : Connecté</p>
  </div>
  
  {/* Partie Droite : Actions (Avion + Cloche + Réglages + Profil) */}
<div className="header-actions">

  <button 
  onClick={() => { setPage('chats'); setUnreadMessages(0); }} 
  style={{ 
    background: 'transparent', 
    border: 'none', 
    cursor: 'pointer', 
    marginRight: '15px', 
    position: 'relative' 
  }}
>
  <Send size={20} color="#64748b" />
  
  {/* On affiche le badge SEULEMENT si unreadMessages > 0 */}
  {unreadMessages > 0 && (
    <div style={{ 
      position: 'absolute', 
      top: '-5px', 
      right: '-5px', 
      background: 'red', 
      color: 'white', 
      borderRadius: '50%', 
      width: '16px', 
      height: '16px', 
      fontSize: '10px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      zIndex: 9999
    }}>
      {unreadMessages}
    </div>
  )}
</button>

  <button onClick={() => setPage('notifications')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '10px' }}>
    <Bell size={20} color="#64748b" />
    {notifications.length > 0 && (
      <span style={{ background: 'red', color: 'white', borderRadius: '50%', fontSize: '9px', padding: '2px 5px' }}>
        {notifications.length}
      </span>
    )}
  </button>

    {/* Réglages */}
    <button 
      onClick={() => { setErrorMessage(""); setEditUser({ ...user }); setPage('settings'); }} 
      className={`btn-icon-nav ${page === 'settings' ? 'active' : ''}`} 
      style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
    >
      <Settings size={20}/>
    </button>
    
    {/* Avatar Profil */}
<img 
  onClick={() => { setErrorMessage(""); setPage('profile'); }} 
  // Si user.avatar est vide, on utilise DiceBear comme solution de secours
  src={user.avatar && user.avatar !== "" ? user.avatar : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.nom}`} 
  className="header-avatar" 
  alt="User" 
  style={{ cursor: 'pointer', border: '2px solid #2563eb' }}
  // Cette fonction gère aussi le cas où l'URL existe mais est cassée
  onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.nom}`; }}
/>
    
  </div>
</header>
)}

  <main className="app-main no-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
    {showSubjectList ? (
    <SubjectSelector 
      quizData={quizData} 
      onBack={() => setShowSubjectList(false)} 
      onSelect={(sub) => { setSelectedSubject(sub); setShowSubjectList(false); }} 
      getSubjectIcon={getSubjectIcon}
    />
  ) : (selectedSubject && !isQuizActive) ? (
    <LevelSelector 
      subject={selectedSubject} 
      onBack={() => { setSelectedSubject(null); setShowSubjectList(true); }} 
      onSelect={(lvl) => { setSelectedLevel(lvl); setIsQuizActive(true); }} 
    />
  ) : isQuizActive ? (
    <QuizScreen 
  key="quiz-statique-unique" // Utilise une chaîne fixe, pas de variable dynamique ici
  questions={quizData[selectedSubject]?.[selectedLevel]} 
  setIsQuizActive={setIsQuizActive} 
/>
  ) : (
    <>
  
  {/* --- PAGE NOTIFICATIONS --- */}
  {page === 'notifications' && (
  <div className="p-6 pb-24 animate-in slide-in-from-right duration-500">
    <h2 className="text-2xl font-[1000] italic uppercase mb-6 text-slate-950">Demandes</h2>
    
    {(!notifications || notifications.length === 0) ? (
      <p className="text-center text-slate-400 text-xs italic">Aucune demande.</p>
    ) : (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        {notifications.map((n, i) => (
  <div 
    key={i}
    // On ajoute un état local pour gérer la couleur au survol
    onMouseOver={(e) => {
      e.currentTarget.style.borderColor = '#2563eb';
      e.currentTarget.style.backgroundColor = '#f8fbff'; // Un bleu très très clair
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.borderColor = '#e2e8f0';
      e.currentTarget.style.backgroundColor = 'white';
    }}
    style={{ 
      backgroundColor: 'white', 
      padding: '20px', 
      borderRadius: '24px', 
      border: '1px solid #e2e8f0', // Bordure initiale
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: '12px', 
      textAlign: 'center',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.3s ease', // Animation douce
      cursor: 'pointer'
    }}
  >
    {/* Avatar */}
<img 
  src={n.sender_avatar} 
  onClick={() => {
    // On crée un objet "propre" que la page profil comprendra
    const fullProfile = {
      ...n, // On garde tout ce qu'on a déjà
      prenom: n.sender_firstname,
      nom: n.sender_name,
      idEtudiant: n.sender_id,
      // Si ton API a envoyé le profil complet (comme on a fait dans le serveur), 
      // le reste (dispos, pointsForts...) est déjà là !
    };
    
    setSelectedStudent(fullProfile); 
    setPage('student-profile');
  }}
  className="w-16 h-16 rounded-full bg-slate-50 border-2 border-slate-50 cursor-pointer hover:scale-105 transition-transform" 
  alt="Avatar" 
/>
    
    {/* Nom et ID */}
    <div>
      <p style={{ fontWeight: '900', fontSize: '14px', color: '#0f172a', margin: 0 }}>
        {n.sender_firstname} {n.sender_name}
      </p>
      <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>ID: {n.sender_id}</p>
    </div>

    {/* Boutons Action */}
    <div style={{ display: 'flex', gap: '10px', width: '100%' }}>

      {/* Bouton Refuser */}
      {/* Bouton Refuser */}
<button 
  onClick={() => {
    // 1. On supprime du serveur
    fetch(`http://localhost:5000/api/delete-request/${n.sender_id}/${user.idEtudiant}`, { method: 'DELETE' })
      .then(() => {
        // 2. Si succès, on met à jour l'interface
        setNotifications(notifications.filter((_, index) => index !== i));
      })
      .catch(err => console.error("Erreur suppression :", err));
  }}
  onMouseOver={(e) => {
    e.currentTarget.style.backgroundColor = '#ef4444';
    e.currentTarget.style.color = 'white';
  }}
  onMouseOut={(e) => {
    e.currentTarget.style.backgroundColor = '#f1f5f9';
    e.currentTarget.style.color = '#64748b';
  }}
  style={{ 
    flex: 1, padding: '12px', borderRadius: '16px', border: 'none', 
    backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'pointer', 
    transition: 'all 0.3s ease' 
  }}
>
  <XCircle size={20} style={{ margin: '0 auto' }} />
</button>

      {/* Bouton Accepter */}
<button 
  onClick={() => {
    addMatch(n);

    // 1. On appelle le serveur pour supprimer la demande
    fetch(`http://localhost:5000/api/accept-request/${n.sender_id}/${user.idEtudiant}`, { method: 'DELETE' })
      .then(() => {
        // 2. Si le serveur confirme, on affiche le toast
        showToast("Félicitations ! Vous avez un nouveau binôme :)", "success");
        
        // 3. On retire la notification de l'interface
          setNotifications(notifications.filter((_, index) => index !== i));
        });
}}
  onMouseOver={(e) => {
    e.currentTarget.style.backgroundColor = '#22c55e';
    e.currentTarget.style.color = 'white';
  }}
  onMouseOut={(e) => {
    e.currentTarget.style.backgroundColor = '#f1f5f9';
    e.currentTarget.style.color = '#64748b';
  }}
  style={{ 
    flex: 1, padding: '12px', borderRadius: '16px', border: 'none', 
    backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'pointer', 
    transition: 'all 0.3s ease' 
  }}
>
  <Check size={20} style={{ margin: '0 auto' }} />
</button>
    </div>
  </div>
))}
      </div>
    )}
  </div>
)}
            {/* ÉCRAN RÉGLAGES */}
            {page === 'settings' && (
              <div className="screen-content pb-40">
                <h2 className="section-title">Réglages</h2>

                <div className="select-box" style={{ marginBottom: '16px' }}>
                  <label className="input-label">Changer d'avatar étudiant</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginTop: '8px', background: 'white', padding: '10px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    {AVATARS_GALLERY.map((avatarUrl, idx) => {
                      const isSelected = editUser.avatar === avatarUrl;
                      return (
                        <img
                          key={idx}
                          src={avatarUrl}
                          alt={`Avatar ${idx}`}
                          onClick={() => setEditUser({ ...editUser, avatar: avatarUrl })}
                          style={{
                            width: '100%',
                            height: 'auto',
                            borderRadius: '50%',
                            background: '#f8fafc',
                            cursor: 'pointer',
                            border: isSelected ? '3px solid #2563eb' : '2px solid transparent',
                            transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                            transition: 'all 0.15s ease'
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="form-grid">
                  <div className="input-container">
                    <label className="input-label">Prénom *</label>
                    <div className="input-wrapper">
                      <input type="text" value={editUser.prenom} onChange={(e) => setEditUser({...editUser, prenom: e.target.value})} className="app-input" />
                    </div>
                  </div>

                  <div className="input-container">
                    <label className="input-label">Nom *</label>
                    <div className="input-wrapper">
                      <input type="text" value={editUser.nom} onChange={(e) => setEditUser({...editUser, nom: e.target.value})} className="app-input" />
                    </div>
                  </div>

                  <div className="input-container">
                    <label className="input-label">Mot de passe *</label>
                    <div className="input-wrapper">
                      <input type="password" value={editUser.motDePasse} onChange={(e) => setEditUser({...editUser, motDePasse: e.target.value})} className="app-input" />
                    </div>
                  </div>
                  
                  <div className="select-row">
                    <div className="select-box">
                      <label className="input-label">Année *</label>
                      <select value={editUser.annee || "L1"} onChange={(e) => setEditUser({...editUser, annee: e.target.value})} className="app-select">
                        {ANNEE_LIST.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                    
                    <div className="input-container">
                      <label className="input-label">Groupe TD *</label>
                      <div className="input-wrapper">
                        <input type="text" value={editUser.groupeTD} onChange={(e) => setEditUser({...editUser, groupeTD: e.target.value})} className="app-input" />
                      </div>
                    </div>
                  </div>

                  <div className="select-box">
                    <label className="input-label">UFR / Faculté *</label>
                    <select value={editUser.ufr || "SEGMI"} onChange={(e) => setEditUser({...editUser, ufr: e.target.value})} className="app-select">
                      {UFR_LIST.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>

                  <div className="select-box">
                    <label className="input-label">Modifier mes centres d'intérêt *</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                      {INTERESTS_LIST.map(item => {
                        const active = editUser.interests?.includes(item);
                        return (
                          <button type="button" key={item} onClick={() => handleToggleListSelection('edit', 'interests', item)} style={{ padding: '5px 10px', fontSize: '10px', borderRadius: '8px', border: active ? 'none' : '1px solid #cbd5e1', background: active ? '#2563eb' : '#f8fafc', color: active ? 'white' : '#475569', cursor: 'pointer' }}>{item}</button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="select-box">
                    <label className="input-label">Modifier la méthode de révision *</label>
                    <select value={editUser.methode || "Solo / Calme"} onChange={e => setEditUser({...editUser, methode: e.target.value})} className="app-select">
                      {METHODS_LIST.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                <div className="skills-box" style={{ marginTop: '16px' }}>
                  <h3 className="sub-section-title" style={{ color: '#10b981', marginBottom: '6px' }}>Points Forts (Matières maîtrisées) *</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {SUBJECTS_LIST.map(sub => {
                      const active = editUser.pointsForts?.includes(sub);
                      return (
                        <button type="button" key={sub} onClick={() => handleToggleListSelection('edit', 'pointsForts', sub)} style={{ padding: '4px 10px', fontSize: '9px', borderRadius: '8px', border: active ? 'none' : '1px solid #cbd5e1', background: active ? '#10b981' : '#f8fafc', color: active ? 'white' : '#475569', cursor: 'pointer' }}>{sub}</button>
                      );
                    })}
                  </div>
                  
                  <h3 className="sub-section-title" style={{ color: '#ef4444', marginTop: '14px', marginBottom: '6px' }}>Points Faibles (Besoin d'aide) *</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {SUBJECTS_LIST.map(sub => {
                      const active = editUser.pointsFaibles?.includes(sub);
                      return (
                        <button type="button" key={sub} onClick={() => handleToggleListSelection('edit', 'pointsFaibles', sub)} style={{ padding: '4px 10px', fontSize: '9px', borderRadius: '8px', border: active ? 'none' : '1px solid #cbd5e1', background: active ? '#ef4444' : '#f8fafc', color: active ? 'white' : '#475569', cursor: 'pointer' }}>{sub}</button>
                      );
                    })}
                  </div>
                </div>

                <AvailabilityManager 
                  initialDispos={editUser.dispos}
                  onChange={handleCalendarChange}
                  readOnly={false}
                />

                <button onClick={saveSettings} className="btn-primary mt-6" style={{ background: '#2563eb' }}>
                  <Save size={16}/> Enregistrer mon profil
                </button>
              </div>
            )}

{page === 'offers' && (
  <div style={{ padding: '20px' }}>
    <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Mes Annonces</h2>
    
    {annonces.filter(ann => ann.auteur === `${user.prenom} ${user.nom}` || ann.participants?.includes(`${user.prenom} ${user.nom}`)).length === 0 ? (
      <p style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', marginTop: '20px' }}>
        Aucune annonce créée ou rejointe pour le moment.
      </p>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {annonces
          .filter(ann => ann.auteur === `${user.prenom} ${user.nom}` || ann.participants?.includes(`${user.prenom} ${user.nom}`))
          .map(annonce => {
            const estComplet = annonce.participants ? annonce.participants.length >= annonce.placesMax : false;
            
            return (
              <div key={annonce.id} style={{ background: 'white', padding: '16px', borderRadius: '20px', border: '1px solid #e2e8f0', position: 'relative' }}>
                {/* Header carte */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    {annonce.ufr} - {annonce.niveau}
                  </span>
                  <span style={{ fontSize: '10px', background: '#f0fdf4', color: '#166534', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                    Rejoint
                  </span>
                </div>
                
                {/* Titre et Description */}
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '900', color: '#0f172a' }}>{annonce.matiere}</h4>
                <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>"{annonce.description}"</p>
                
                {/* Footer état */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>
                    Membres : {annonce.participants ? annonce.participants.length : 1} / {annonce.placesMax}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: estComplet ? '#10b981' : '#eab308', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: estComplet ? '#10b981' : '#eab308' }}></span>
                    {estComplet ? "Complet" : "En recherche..."}
                  </span>
                </div>
              </div>
            );
          })}
      </div>
    )}
    
    {/* Ne pas oublier d'afficher les groupes complets en bas */}
    {renderFullGroups()}
  </div>
)}      

            {page === 'groups' && (
  <div className="screen-content p-6 pb-24">
    
    {/* SECTION MES BINÔMES */}
    <h1 className="text-2xl font-bold mb-6">Mes Binômes</h1>
    

    <div className="matches-grid">
      {matches.length > 0 ? (
        matches
          .sort((a, b) => sortOrder === "desc" ? b.score - a.score : a.score - b.score)
          .map((m, index) => (
            <div key={index} className="match-card-square" style={{ background: 'white', padding: '12px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.nom}`} 
                alt="avatar" 
                style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f1f5f9' }}
              />
              <div className="mt-2 text-center">
                <p className="font-bold text-xs">{m.prenom} {m.nom}</p>
                
                <button 
                  onClick={() => startOrCreateChat(`${m.prenom} ${m.nom}`, "binome", `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.nom}`)}
                  style={{
                    marginTop: '8px', background: '#eff6ff', border: 'none', borderRadius: '8px', padding: '6px 10px',
                    color: '#2563eb', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '4px', width: '100%', justifyContent: 'center'
                  }}
                >
                  <MessageSquare size={10} /> Chat
                </button>
              </div>
            </div>
          ))
      ) : (
        <p className="text-slate-400 italic">Aucun binôme disponible.</p>
      )}
      {/* Tri pour les binômes validés */}
    <div style={{ marginBottom: '16px' }}>
      <select 
        value={sortOrder} 
        onChange={(e) => setSortOrder(e.target.value)}
        style={{ padding: '8px 12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 'bold', width: '100%', cursor: 'pointer' }}
      >
        <option value="desc">Tri : Match plus élevé au moins élevé</option>
        <option value="asc">Tri : Match moins élevé au plus élevé</option>
      </select>
    </div>
    </div>

    {/* SECTION TROUVER UN BINÔME (TOUS LES MATCHES) */}
    <h2 className="text-xl font-black uppercase mt-10 mb-6">Trouver un binôme</h2>
    
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
      {allMatches && [...allMatches]
        .sort((a, b) => sortOrder === "desc" ? b.score - a.score : a.score - b.score)
        .map((match, index) => (
        <button 
          key={index}
          onClick={() => { setSelectedStudent(match); setPage('student-profile'); }}
          className="match-card"
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
          style={{ 
            backgroundColor: '#ffffff', padding: '15px', borderRadius: '20px', border: '1px solid #e2e8f0',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer'
          }}
        >
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${match.nom}`} 
            alt="avatar" 
            style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#f1f5f9' }}
          />
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: '900', fontSize: '13px', margin: 0 }}>{match.nom}</p>
            <p style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', margin: 0 }}>{match.matiere}</p>
          </div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '11px' }}>
              {match.score}% match
            </div>
            <div style={{ backgroundColor: '#f8fafc', color: '#64748b', padding: '2px 12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '9px' }}>
              Fiabilité : {match.fiabilite}%
            </div>
          </div>
        </button>
      ))}
    </div>
  </div>
)}  
            {/* ÉCRAN MON PROFIL (PROFILE) */}
            {page === 'profile' && (
              <div className="screen-content">
                <div className="profile-card-top">
{/* Dans ta vue profil */}
<img 
  src={user.avatar && user.avatar !== "" ? user.avatar : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.nom}`} 
  className="profile-avatar-view" 
  alt="Profil" 
  onError={(e) => { 
    // Si l'image source (user.avatar) est cassée, on force le remplacement par l'avatar généré
    e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.nom}`; 
  }}
/>                  <h2>{user.prenom} {user.nom}</h2>
                  <p className="id-badge">ID : {user.idEtudiant}</p>
                  <div className="stats-strip">
                    <div><span>UFR</span><p>{user.ufr}</p></div>
                    <div><span>TD</span><p>{user.groupeTD}</p></div>
                    <div><span>Fiabilité</span><p className="text-green">{user.fiabilite}%</p></div>
                  </div>
                </div>
<div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '16px', border: '1px solid #bbf7d0', marginTop: '16px' }}>
  <p style={{ fontSize: '10px', color: '#166534', fontWeight: 'bold', textTransform: 'uppercase' }}>Mon Portefeuille</p>
  <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#166534', margin: '4px 0 0 0' }}>
    {(user.wallet || 0).toFixed(2)} €
  </h2>
</div>
                <div style={{ background: 'white', padding: '12px', borderRadius: '16px', marginTop: '12px', fontSize: '11px', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', fontSize: '9px', marginBottom: '4px' }}>Méthode & Intérêts</p>
                  <p><strong>Méthode :</strong> {user.methode || "Non renseignée"}</p>
<p style={{ marginTop: '2px' }}>
  <strong>Passions :</strong> {Array.isArray(user.interests) ? user.interests.join(', ') : "Aucune"}
</p>                
</div>

                <div className="grid-2-cols mt-6">
                  <div className="info-card border-green">
  <h4>Points Forts</h4>
  {Array.isArray(user.pointsForts) ? user.pointsForts.map((p, i) => <p key={i}>• {p}</p>) : <p>Aucun</p>}
</div>
                  <div className="info-card border-red">
  <h4>Besoins</h4>
  {Array.isArray(user.pointsFaibles) ? user.pointsFaibles.map((p, i) => <p key={i}>• {p}</p>) : <p>Aucun</p>}
</div>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <AvailabilityManager 
                    initialDispos={user.dispos}
                    readOnly={true}
                  />
                </div>
                
                {/* BOUTON OFFICIEL DE DÉCONNEXION À LA FIN DE L'APPLICATION */}
                <button 
                  onClick={() => {
                    localStorage.removeItem(ACTIVE_USER_KEY);
                    setPage('auth');
                  }}
                  className="btn-primary" 
                  style={{ background: '#2563eb', marginTop: '20px', marginBottom: '4px', gap: '10px' }}
                >
                  <LogOut size={16} /> Se déconnecter de l'application
                </button>
              </div>
            )}


{/* ÉCRAN FLUX LIVE (HOME) */}
            {page === 'home' && (

  <div className="screen-content pb-32">
    <div className="banner-card">
      <div className="banner-badge"><Bell size={10} /> Action Requise</div>
      <h3 className="banner-title">VALIDATION FIN DE PROJET</h3>
      <p className="banner-text">Ton binôme attend ton évaluation sur le projet R-Studio pour valider sa fiabilité.</p>
      <div style={{ width: '100%' }}>
        <button onClick={() => setShowEvalModal(true)} className="btn-banner" style={{ border: 'none', cursor: 'pointer' }}>
          Lancer le Questionnaire <Send size={12} />
        </button>
      </div>
    </div>

          {/* BANNIÈRE DE LANCEMENT DU QUIZ */}
          <div style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', padding: '24px', borderRadius: '24px', margin: '20px', color: 'white', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 8px 0' }}>Défi du jour 🧠</h3>
            <p style={{ fontSize: '13px', opacity: 0.9, marginBottom: '20px' }}>Teste tes connaissances pour booster ton profil campus.</p>
            <button onClick={() => setShowSubjectList(true)} style={{ width: '100%', background: 'white', color: '#2563eb', border: 'none', padding: '12px', borderRadius: '16px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              Démarrer un Quiz <Zap size={14} />
            </button>
          </div>
      <div style={{ marginTop: '16px', marginBottom: '8px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: 0 }}>
        Ravi de te revoir, <span style={{ color: '#2563eb' }}>{user.prenom}</span> 👋
      </h2>
      <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
        Prêt pour une session de révision collective aujourd'hui ?
      </p>
    </div>

    {/* SECTION FILTRES */}
    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', marginTop: '16px' }}>
      <button 
        onClick={() => setTutoratOnly(false)}
        style={{ flex: 1, padding: '10px', fontSize: '11px', fontWeight: 'bold', borderRadius: '12px', border: 'none', background: !tutoratOnly ? '#2563eb' : '#e2e8f0', color: !tutoratOnly ? 'white' : '#475569', cursor: 'pointer' }}
      >
        Entraide classique
      </button>
      <button 
        onClick={() => setTutoratOnly(true)}
        style={{ flex: 1, padding: '10px', fontSize: '11px', fontWeight: 'bold', borderRadius: '12px', border: 'none', background: tutoratOnly ? '#2563eb' : '#e2e8f0', color: tutoratOnly ? 'white' : '#64748b', cursor: 'pointer' }}
      >
        🎓 Tutorat (10€)
      </button>
    </div>

    <div className="section-header" style={{ marginTop: '16px' }}>
      <h2 className="section-title">Le Flux <span className="text-blue">Live</span></h2>
    </div>

    <div className="cards-stack">
      {annonces
        .filter(ann => tutoratOnly ? ann.isTutorat : !ann.isTutorat)
        .map((annonce) => (
        <div key={annonce.id} className="annonce-card" style={{ border: annonce.isTutorat ? '2px solid #2563eb' : '1px solid #e2e8f0' }}>
          <div className="card-top">
            <div className="badges-row">
              <Badge color={annonce.urgent ? "red" : "blue"}>{annonce.ufr}</Badge>
              <Badge color="orange">{annonce.niveau}</Badge>
              {annonce.isTutorat && <Badge color="green">Tutorat 10€</Badge>}
            </div>
            {annonce.urgent && <Flame size={16} className="text-orange" />}
          </div>
          
          <h4 className="text-dark card-title">{annonce.matiere}</h4>
          <p className="card-desc">"{annonce.description}"</p>
          <div style={{ 
    margin: '10px 0', 
    fontSize: '11px', 
    fontWeight: 'bold', 
    color: (annonce.participants?.length >= annonce.placesMax) ? '#10b981' : '#64748b',
    background: '#f8fafc', 
    padding: '6px 10px', 
    borderRadius: '8px',
    display: 'inline-block' 
}}>
{(annonce.participants?.length >= annonce.placesMax) ? '✅ Groupe complet' : `👥 ${annonce.participants?.length || 1} / ${annonce.placesMax} personnes`}
</div>

          <div className="card-footer">
            <div className="author-info">
              <div className="author-avatar">{annonce.auteur.charAt(0)}</div>
              <div>
                <p className="author-name">{annonce.auteur}</p>
                <p className="author-date">{annonce.date}</p>
              </div>
            </div>


{/* Condition : On affiche le bouton seulement si l'utilisateur est l'auteur */}
{annonce.auteur === `${user.prenom} ${user.nom}` && (
  <button 
    onClick={() => deleteAnnonce(annonce.id)}
    style={{ 
      background: '#fee2e2', 
      color: '#b91c1c', 
      border: 'none', 
      padding: '8px', 
      borderRadius: '8px', 
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      marginTop: '10px'
    }}
  >
    <Trash2 size={14} style={{ marginRight: '4px' }} />
    Supprimer mon annonce
  </button>
)}

            {/* BOUTON REJOINDRE CONDITIONNEL (INCLUT L'AUTEUR) */}
            {/* Logique : Auteur voit "Inscrit(e) ✓", Participants voient "Inscrit(e) ✓" + Bouton "Quitter" */}
{((annonce.participants || []).includes(`${user.prenom} ${user.nom}`) || annonce.auteur === `${user.prenom} ${user.nom}`) ? (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <div style={{ background: '#f1f5f9', color: '#64748b', padding: '8px 16px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
      Inscrit(e) ✓
    </div>
    
    {/* Bouton Quitter (seulement pour les participants, pas pour l'auteur de l'annonce) */}
    {annonce.auteur !== `${user.prenom} ${user.nom}` && (
      <button 
        onClick={() => quitterGroupe(annonce.id)}
        style={{ 
          background: '#fee2e2', 
          color: '#b91c1c', 
          border: 'none', 
          padding: '8px 10px', 
          borderRadius: '10px', 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <XCircle size={14} />
      </button>
    )}
  </div>
) : (
  <button 
    onClick={() => handleJoinAnnonce(annonce.id)}
    disabled={(annonce.participants || []).length >= annonce.placesMax}
    style={{ 
      background: (annonce.participants || []).length >= annonce.placesMax ? '#e2e8f0' : (annonce.isTutorat ? '#10b981' : '#2563eb'),
      color: (annonce.participants || []).length >= annonce.placesMax ? '#94a3b8' : 'white',
      padding: '8px 16px',
      borderRadius: '10px',
      border: 'none',
      cursor: (annonce.participants || []).length >= annonce.placesMax ? 'not-allowed' : 'pointer',
      fontSize: '11px',
      fontWeight: 'bold'
    }}
  >
    {annonce.isTutorat ? "Postuler comme Tuteur (10€)" : "Rejoindre"}
  </button>
)}
          </div>
        </div>
      ))}
    </div>
  </div>
)}


{page === 'student-profile' && selectedStudent && (
  <div className="screen-content">
    {console.log("Données reçues pour le profil :", selectedStudent)}
    {/* Bouton retour (ajusté pour revenir aux notifications si on vient de là) */}
    <button 
  onClick={() => setPage(notifications.length > 0 ? 'notifications' : 'groups')} 
  style={{ 
    background: 'transparent', 
    border: 'none', 
    color: '#64748b', 
    fontSize: '12px', 
    fontWeight: 'bold', 
    cursor: 'pointer',
    display: 'flex', 
    alignItems: 'center',
    gap: '4px',
    padding: '8px 0',
    marginBottom: '0px'
  }}
>
  <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /> Retour
</button>

    <button
  onClick={() => startOrCreateChat(selectedStudent.nom || selectedStudent.sender_name, "binome", `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStudent.nom || selectedStudent.sender_name}`)}
  className="btn-primary"
  style={{ background: '#2563eb', marginTop: '0px' }}
>
  <MessageSquare size={16} style={{ marginRight: '8px' }} /> Contacter l'étudiant
</button>

<button 
  disabled={isSending}
  onClick={() => {
    setIsSending(true);
    fetch('http://localhost:5000/api/send-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        sender_id: user.idEtudiant, 
        receiver_id: selectedStudent.idEtudiant 
      })
    })
    .then(res => {
      if (res.ok) {
        showToast("Félicitations, demande envoyée !", "success");
      } else {
        showToast("Demande déjà envoyée pour ce binôme.", "error");
      }
    })
    .catch(err => showToast("Erreur de connexion serveur.", "error"))
    .finally(() => setIsSending(false));
  }}
  className="btn-primary"
  style={{ background: isSending ? '#94a3b8' : '#f59e0b', marginTop: '10px', width: '100%' }}
>
  <Heart size={16} /> {isSending ? "Envoi..." : "Proposer un binôme"}
</button>

    {/* Header (Identique au design de votre profil) */}
    <div className="profile-card-top">
      <img 
        // On vérifie les deux sources possibles pour l'avatar
        src={selectedStudent.sender_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStudent.nom}`} 
        className="profile-avatar-view" 
        alt="Avatar" 
        style={{ border: '3px solid #2563eb' }} 
      />
      <h2>{selectedStudent.sender_firstname ? `${selectedStudent.sender_firstname} ${selectedStudent.sender_name}` : selectedStudent.nom}</h2>
      
      <p className="id-badge">ID : {selectedStudent.idEtudiant || selectedStudent.sender_id || "Non renseigné"}</p>
      
      <div className="stats-strip">
        <div><span>UFR</span><p>{selectedStudent.ufr || "-"}</p></div>
        <div><span>TD</span><p>{selectedStudent.groupeTD || "-"}</p></div>
        <div><span>Match</span><p className="text-green">{selectedStudent.score || 0}%</p></div>
      </div>
    </div>

    {/* Section Méthode & Intérêts */}
    <div style={{ background: 'white', padding: '12px', borderRadius: '16px', marginTop: '12px', fontSize: '11px', border: '1px solid #e2e8f0' }}>
      <p style={{ fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', fontSize: '9px', marginBottom: '4px' }}>Méthode & Intérêts</p>
      <p><strong>Méthode :</strong> {selectedStudent.methode || "Non renseignée"}</p>
      <p style={{ marginTop: '2px' }}><strong>Passions :</strong> {Array.isArray(selectedStudent.interests) ? selectedStudent.interests.join(', ') : selectedStudent.interests}</p>
    </div>

    {/* Points Forts & Besoins */}
    <div className="grid-2-cols mt-6">
      <div className="info-card border-green">
        <h4>Points Forts</h4>
        {selectedStudent.pointsForts && selectedStudent.pointsForts.length > 0 ? selectedStudent.pointsForts.map(p => <p key={p}>• {p}</p>) : <p style={{ fontStyle: 'italic', color: '#94a3b8' }}>Aucun</p>}
      </div>
      <div className="info-card border-red">
        <h4>Besoins</h4>
        {selectedStudent.pointsFaibles && selectedStudent.pointsFaibles.length > 0 ? selectedStudent.pointsFaibles.map(p => <p key={p}>• {p}</p>) : <p style={{ fontStyle: 'italic', color: '#94a3b8' }}>Aucun</p>}
      </div>
    </div>

    {/* Planning */}
    <div style={{ marginTop: '16px' }}>
      <AvailabilityManager 
        initialDispos={selectedStudent.dispos || {}}
        readOnly={true}
      />
    </div>
  </div>
)}
<div style={{ height: '120px' }}></div>
</>
  )}
          </main>

          {/* BARRE DE NAVIGATION BASSE PARFAITEMENT POSITIONNÉE EN BAS DU TÉLÉPHONE */}
{page !== 'auth' && page !== 'register' && (
<nav className="app-nav" style={{ flexShrink: 0 }}>            
<button 
    onClick={() => { 
      setShowSubjectList(false); 
      setIsQuizActive(false); 
      setSelectedSubject(null); 
      setPage('home'); 
    }} 
    className={`nav-item ${page === 'home' ? 'active' : ''}`}
  >
    <Home size={22}/>
  </button>            
<button 
    onClick={() => { 
      setShowSubjectList(false); 
      setIsQuizActive(false); 
      setSelectedSubject(null); 
      setPage('offers'); 
    }} 
    className={`nav-item ${page === 'offers' ? 'active' : ''}`}
  >
    <FileText size={22}/>
  </button>
  <div className="nav-center-holder">
  <button 
    onClick={() => setIsCreatingAnnonce(true)} 
    className="btn-nav-center" 
    style={{ background: '#2563eb' }}
  >
    <Plus size={20} color="white" strokeWidth={3} />
  </button>
</div>
<button 
    onClick={() => { 
      setShowSubjectList(false); 
      setIsQuizActive(false); 
      setSelectedSubject(null); 
      setPage('groups'); 
    }} 
    className={`nav-item ${page === 'groups' ? 'active' : ''}`}
  >
    <Users size={22}/>
  </button>            
<button 
    onClick={() => { 
      setShowSubjectList(false); 
      setIsQuizActive(false); 
      setSelectedSubject(null); 
      setPage('profile'); 
    }} 
    className={`nav-item ${page === 'profile' ? 'active' : ''}`}
  >
    <User size={22}/>
  </button>          
  </nav>
      )}

      {/* ==================================================================== */}
      {/* MODAL DU QUESTIONNAIRE DE FIABILITÉ (VERSION COMPORTEMENTALE) */}
      {/* ==================================================================== */}
      {showEvalModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white', width: '100%', maxWidth: '360px',
            borderRadius: '24px', padding: '20px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            {/* En-tête */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', margin: 0 }}>
                📊 Fiabilité • Étape {evalStep} sur 4
              </h3>
              <button 
                onClick={() => { setShowEvalModal(false); setEvalStep(1); }}
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>

            {/* Barre de progression visuelle */}
            <div style={{ width: '100%', height: '4px', background: '#e2e8f0', borderRadius: '2px', marginBottom: '16px', overflow: 'hidden' }}>
              <div style={{ width: `${(evalStep / 4) * 100}%`, height: '100%', background: '#2563eb', transition: 'width 0.3s ease' }}></div>
            </div>

            {/* ÉTAPE 1 : Ponctualité et Présence */}
            {evalStep === 1 && (
              <div>
                <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '12px' }}>
                  L'étudiant s'est-il présenté au rendez-vous convenu ?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button onClick={() => setEvalStep(2)} style={btnStyleEval.green}>🟢 Oui, à l'heure</button>
                  <button onClick={() => setEvalStep(2)} style={btnStyleEval.orange}>🟡 Oui, avec du retard</button>
                  <button onClick={() => setEvalStep(2)} style={btnStyleEval.red}>🔴 Absent sans prévenir</button>
                  <button onClick={() => setEvalStep(2)} style={btnStyleEval.gray}>⚪ Non, mais a prévenu à l'avance</button>
                </div>
              </div>
            )}

            {/* ÉTAPE 2 : Réactivité */}
            {evalStep === 2 && (
              <div>
                <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '12px' }}>
                  Comment évalues-tu sa réactivité pour organiser le rendez-vous dans le chat ?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button onClick={() => setEvalStep(3)} style={btnStyleEval.blue}>⚡ Très rapide</button>
                  <button onClick={() => setEvalStep(3)} style={btnStyleEval.blue}>👍 Correcte</button>
                  <button onClick={() => setEvalStep(3)} style={btnStyleEval.orange}>⏳ Très lent</button>
                  <button onClick={() => setEvalStep(3)} style={btnStyleEval.red}>❌ A gâché l'organisation</button>
                </div>
              </div>
            )}

            {/* ÉTAPE 3 : Investissement */}
            {evalStep === 3 && (
              <div>
                <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '12px' }}>
                  Quel était le niveau de préparation et d'investissement de ton partenaire ?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button onClick={() => setEvalStep(4)} style={btnStyleEval.green}>📚 Avait bien préparé le sujet</button>
                  <button onClick={() => setEvalStep(4)} style={btnStyleEval.blue}>🤝 Connaissait les bases / Actif</button>
                  <button onClick={() => setEvalStep(4)} style={btnStyleEval.orange}>🥱 Passif / Distrait pendant la session</button>
                  <button onClick={() => setEvalStep(4)} style={btnStyleEval.red}>🎒 N'avait absolument rien préparé</button>
                </div>
              </div>
            )}

            {/* ÉTAPE 4 : Recommandation Globale */}
{evalStep === 4 && (
  <div>
    <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '12px' }}>
      Souhaites-tu retravailler avec cet étudiant pour une prochaine session ?
    </p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <button onClick={() => { 
        showToast("Merci ! Évaluation enregistrée. Score de fiabilité mis à jour.", "success"); 
        setShowEvalModal(false); 
        setEvalStep(1); 
      }} style={btnStyleEval.green}>🔥 Avec plaisir (Recommandé)</button>
      
      <button onClick={() => { 
        showToast("Merci ! Évaluation enregistrée. Score de fiabilité mis à jour.", "success"); 
        setShowEvalModal(false); 
        setEvalStep(1); 
      }} style={btnStyleEval.blue}>🤔 Pourquoi pas</button>
      
      <button onClick={() => { 
        showToast("Merci ! Signalement pris en compte. Profil écarté.", "error"); 
        setShowEvalModal(false); 
        setEvalStep(1); 
      }} style={btnStyleEval.red}>🙅 Plus jamais</button>
    </div>
  </div>
)}
          </div>
        </div>
      )}

      {loading && (
        <div className="loader-screen">
          <div className="spinner" style={{ borderLeftColor: '#2563eb' }}></div>
        </div>
      )}

    {pendingTutorat && (
  <div className="modal-overlay">
    <div className="modal-content">
      <p>Confirmer le tutorat de 10,00 € ?</p>
      <button onClick={() => { handleTutoratPayment(pendingTutorat); /* ... logique de rejoindre ... */; setPendingTutorat(null); }}>
        Confirmer
      </button>
      <button onClick={() => setPendingTutorat(null)}>Annuler</button>
    </div>
  </div>
)}

    {isCreatingAnnonce && (
  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#f8fafc', zIndex: 9999, padding: '20px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
    
    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>Créer une annonce</h2>
      <p style={{ fontSize: '11px', color: '#64748b' }}>Trouve des partenaires de révision sur le campus</p>
    </div>

    {/* Matière */}
    <label style={{ fontSize: '11px', fontWeight: '800', color: '#2563eb', marginBottom: '6px', textTransform: 'uppercase' }}>Matière concernée *</label>
    <select className="app-select" value={annonceForm.matiere || ""} onChange={e => setAnnonceForm({...annonceForm, matiere: e.target.value})}>
      {SUBJECTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
    </select>

    {/* Checkbox Tutorat */}
    <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '16px', border: '1px solid #dcfce7', marginTop: '16px' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
        <input type="checkbox" checked={annonceForm.isTutorat} onChange={e => setAnnonceForm({...annonceForm, isTutorat: e.target.checked})} />
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#166534' }}>Transformer en demande de Tutorat Payant</span>
      </label>
      <p style={{ fontSize: '9px', color: '#15803d', marginTop: '4px' }}>Tarif fixe de 10€ - Seuls les étudiants d'un niveau supérieur à L3 pourront postuler.</p>
    </div>

    {/* Description */}
    <label style={{ fontSize: '11px', fontWeight: '800', color: '#2563eb', marginTop: '16px', marginBottom: '6px', textTransform: 'uppercase' }}>Description du besoin *</label>
    <textarea 
      placeholder="Ex: Dispo ce jeudi à la BU pour bosser les fiches d'Anatomie avant le contrôle..." 
      className="app-input" 
      style={{ height: '100px', resize: 'none' }}
      onChange={e => setAnnonceForm({...annonceForm, description: e.target.value})}
    />

    {/* Personnes requises */}
    <label style={{ fontSize: '11px', fontWeight: '800', color: '#2563eb', marginTop: '16px', marginBottom: '6px', textTransform: 'uppercase' }}>Nombre total de personnes requises *</label>
    <select className="app-select" value={annonceForm.placesMax} onChange={e => setAnnonceForm({...annonceForm, placesMax: parseInt(e.target.value)})}>
      {[2, 3, 4, 5].map(n => <option key={n} value={n}>{n} personnes (Toi + {n-1} binôme{n > 2 ? 's' : ''})</option>)}
    </select>

    {/* Checkbox Urgence */}
    <div style={{ background: 'white', padding: '12px', borderRadius: '16px', border: '1px solid #e2e8f0', marginTop: '16px' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
        <input type="checkbox" checked={annonceForm.urgent} onChange={e => setAnnonceForm({...annonceForm, urgent: e.target.checked})} />
        <Flame size={14} color="#f97316" />
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>Marquer cette annonce comme URGENTE</span>
      </label>
    </div>

    {/* Boutons Action */}
    <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
      <button className="btn-primary" style={{ flex: 1, background: '#2563eb' }} onClick={() => {
        const auteurNom = `${user.prenom} ${user.nom}`;
        const newAnnonce = { ...annonceForm, id: Date.now(), auteur: `${user.prenom} ${user.nom}`, ufr: user.ufr, niveau: user.annee, date: "À l'instant", participants: [auteurNom] };
        setAnnonces([newAnnonce, ...annonces]);
        setIsCreatingAnnonce(false);
        setPage('offers');
      }}>Publier l'annonce</button>
      
      <button className="btn-primary" style={{ flex: 1, background: '#64748b', boxShadow: 'none' }} onClick={() => setIsCreatingAnnonce(false)}>Annuler</button>
    </div>
  </div>

  
)}
{tutoratToConfirm && (
  <div style={{
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px'
  }}>
    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', width: '100%', maxWidth: '320px', textAlign: 'center' }}>
      <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', marginBottom: '12px' }}>Paiement Tutorat</h3>
      <p style={{ fontSize: '12px', color: '#475569', marginBottom: '24px' }}>
        Confirmer le paiement de 10,00 € pour rejoindre le cours de <strong>{tutoratToConfirm.matiere}</strong> ?
      </p>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => { 
            handleTutoratPayment(tutoratToConfirm); 
            validerInscription(tutoratToConfirm.id); 
            setTutoratToConfirm(null); 
          }}
          style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#10b981', color: 'white', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
        >
          Confirmer
        </button>
        <button 
          onClick={() => setTutoratToConfirm(null)}
          style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#e2e8f0', color: '#475569', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
        >
          Annuler
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};


export default App;

