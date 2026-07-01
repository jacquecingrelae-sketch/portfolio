import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  Home,
  BookOpen,
  UserPlus,
  Compass,
  CheckCircle,
  Clock,
  Send,
  User,
  LogOut,
  LogIn,
  Database,
  Moon,
  Sun,
  Shield,
  Search,
  PlusCircle,
  FileText,
  Mail,
  UserCheck,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  BarChart2,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  AlertCircle,
  Check,
  Users,
  Trash2,
  Phone,
  CreditCard,
  Tv,
  Award,
  Calendar,
  ClipboardList,
  Receipt,
  MessageSquare,
  Maximize,
  Minimize,
  Info,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { User as UserType, Formation, Candidature, Message, Payment, DashboardStats, TimetableEvent, AttendanceRecord, Receipt as ReceiptType } from './types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const memoryStorage: Record<string, string> = {};
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return memoryStorage[key] || null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      memoryStorage[key] = value;
    }
  },
  removeItem: (key: string): void => {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      delete memoryStorage[key];
    }
  }
};

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface SMSNotification {
  id: string;
  phone: string;
  text: string;
}

const formatAriary = (euroAmount: number | string) => {
  const num = typeof euroAmount === 'string' ? parseFloat(euroAmount) : euroAmount;
  if (isNaN(num)) return '0 Ar';
  const ariaryAmount = Math.round(num * 5000);
  return ariaryAmount.toLocaleString('fr-FR') + ' Ar';
};

export default function App() {
  // --- DATABASE & THEME STATES ---
  const [dbStatus, setDbStatus] = useState<any>({ type: 'LocalJSON', status: 'connected' });
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'admission' | 'formations' | 'candidature' | 'chat' | 'payment' | 'timetable' | 'attendance' | 'receipt' | 'diplomes' | 'cours' | 'videos' | 'examens' | 'notes' | 'etudiants' | 'connexion' | 'about' | 'contact'>('home');
  const [activeHomeTab, setActiveHomeTab] = useState<'student' | 'admin' | 'trainer'>('student');
  const [signedTrainerCourses, setSignedTrainerCourses] = useState<string[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // --- EXAMS, GRADES, & VIDEO LESSONS STATES ---
  const [exams, setExams] = useState<any[]>([
    { id: 'ex-1', title: 'Examen Final de Programmation React', filiere: 'Informatique', date: '2026-06-25', time: '14:00', duration: '2h00', coefficient: 3, type: 'Pratique', status: 'Prévu' },
    { id: 'ex-2', title: 'Contrôle Continu Algorithmes Avancés', filiere: 'Informatique', date: '2026-06-26', time: '09:00', duration: '1h30', coefficient: 2, type: 'Écrit', status: 'Prévu' },
    { id: 'ex-3', title: 'Architecture des Systèmes Cloud', filiere: 'Informatique', date: '2026-06-18', time: '10:00', duration: '3h00', coefficient: 4, type: 'Pratique', status: 'En cours de correction' },
    { id: 'ex-4', title: 'Management Stratégique des Organisations', filiere: 'Gestion & Management', date: '2026-06-20', time: '13:30', duration: '2h00', coefficient: 3, type: 'Écrit', status: 'Terminé' },
    { id: 'ex-5', title: 'Droit Fiscal & des Sociétés', filiere: 'Droit & Juridique', date: '2026-06-24', time: '15:00', duration: '2h00', coefficient: 3, type: 'Écrit', status: 'Prévu' }
  ]);

  const [grades, setGrades] = useState<any[]>([
    { id: 'gr-1', studentName: 'Jean Dupont', studentEmail: 'jean.dupont@etu.univ.fr', filiere: 'Informatique', moduleName: 'Développement Web Moderne', examTitle: 'Projet Intégrateur React & Tailwind', grade: 16.5, coefficient: 3, comments: 'Excellent travail, code propre et respect des critères de style !', status: 'Validé' },
    { id: 'gr-2', studentName: 'Sophie Martin', studentEmail: 'sophie.martin@etu.univ.fr', filiere: 'Informatique', moduleName: 'Développement Web Moderne', examTitle: 'Projet Intégrateur React & Tailwind', grade: 14.0, coefficient: 3, comments: 'Très bon projet, l\'architecture est correcte.', status: 'Validé' },
    { id: 'gr-3', studentName: 'Marc Leroy', studentEmail: 'marc.leroy@etu.univ.fr', filiere: 'Informatique', moduleName: 'Algorithmes Avancés', examTitle: 'Examen de mi-parcours', grade: 9.5, coefficient: 2, comments: 'Insuffisant sur les structures d\'arbres binaires. À travailler pour le rattrapage.', status: 'Rattrapage' },
    { id: 'gr-4', studentName: 'Amélie Petit', studentEmail: 'amelie.petit@etu.univ.fr', filiere: 'Gestion & Management', moduleName: 'Comptabilité Analytique', examTitle: 'Examen Final Semestre 1', grade: 18.0, coefficient: 4, comments: 'Copie parfaite ! Excellente maîtrise analytique.', status: 'Validé' },
    { id: 'gr-5', studentName: 'Thomas Dubreuil', studentEmail: 'thomas.dubreuil@etu.univ.fr', filiere: 'Droit & Juridique', moduleName: 'Introduction au Droit Public', examTitle: 'Examen de Synthèse', grade: 12.0, coefficient: 3, comments: 'Bonne rédaction, développements intéressants.', status: 'Validé' }
  ]);

  const [videoLessons, setVideoLessons] = useState<any[]>([
    { id: 'vid-1', title: 'Introduction à React 18 & Vite', filiere: 'Informatique', duration: '18:45', instructor: 'M. Jean-François Bertrand', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-his-computer-34285-large.mp4', description: 'Découvrez la philosophie de React, les composants fonctionnels et l\'écosystème Vite.', thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=400', viewed: true, progress: 100 },
    { id: 'vid-2', title: 'Maîtriser Tailwind CSS pour des designs Premium', filiere: 'Informatique', duration: '24:30', instructor: 'Mme Claire Fontaine', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-web-designer-working-on-new-project-40158-large.mp4', description: 'Apprenez à structurer des mises en page réactives et fluides avec les classes utilitaires Tailwind CSS.', thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=400', viewed: false, progress: 45 },
    { id: 'vid-3', title: 'Créer une API REST performante avec Node.js & Express', filiere: 'Informatique', duration: '32:15', instructor: 'M. Paul Sorel', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-programmer-typing-on-a-keyboard-34282-large.mp4', description: 'Mise en place d\'un serveur Express, gestion des routes, des middlewares et de la connexion DB.', thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=400', viewed: false, progress: 12 },
    { id: 'vid-4', title: 'Principes de Base de la CyberSécurité', filiere: 'Informatique', duration: '15:20', instructor: 'Mme Sophie Rostand', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-typing-code-on-a-cybersecurity-dashboard-43093-large.mp4', description: 'Comprendre les vecteurs d\'attaque courants, le chiffrement et les bonnes pratiques de sécurité.', thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=400', viewed: false, progress: 0 }
  ]);

  // --- STUDENT AND EXCELLENCE EXTENSION STATES ---
  const [timetables, setTimetables] = useState<TimetableEvent[]>([]);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [receipts, setReceipts] = useState<ReceiptType[]>([]);

  // Timetable scheduling state fields
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newProf, setNewProf] = useState('');
  const [newDay, setNewDay] = useState('Lundi');
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('11:00');
  const [newRoom, setNewRoom] = useState('Amphi d\'E-learning');
  const [newColor, setNewColor] = useState('blue');
  const [newCourseFiliere, setNewCourseFiliere] = useState('Tous');
  const [showEventModal, setShowEventModal] = useState(false);
  const [timetableSearch, setTimetableSearch] = useState('');
  const [selectedDayFilter, setSelectedDayFilter] = useState('Tous');
  const [selectedFiliereFilter, setSelectedFiliereFilter] = useState('Tous');
  const [studentDirFilter, setStudentDirFilter] = useState<'all' | 'admissible' | 'high_grade'>('all');

  const getNavigationLinks = () => {
    if (activeHomeTab === 'admin') {
      return [
        { name: 'Tableau de bord', page: 'home', icon: Home },
        { name: 'ADMISSION', page: 'admission', icon: UserPlus },
        { name: 'FORMATION', page: 'formations', icon: BookOpen },
        { name: 'ETUDIANT', page: 'etudiants', icon: Users },
        { name: 'Page de connexion', page: 'connexion', icon: LogIn },
        { name: 'Candidatures', page: 'candidature', icon: Clock },
        { name: 'Diplômes', page: 'diplomes', icon: Award },
        { name: 'Reçus & Caisse', page: 'receipt', icon: Receipt },
        { name: 'Paiements', page: 'payment', icon: CreditCard },
        { name: 'Emploi du temps', page: 'timetable', icon: Calendar },
        { name: 'Discussion IA', page: 'chat', icon: Mail },
        { name: 'À propos', page: 'about', icon: Info },
        { name: 'Contacter', page: 'contact', icon: Phone }
      ];
    } else if (activeHomeTab === 'trainer') {
      return [
        { name: 'Accueil Formateur', page: 'home', icon: Home },
        { name: 'ADMISSION', page: 'admission', icon: UserPlus },
        { name: 'FORMATION', page: 'formations', icon: BookOpen },
        { name: 'ETUDIANT', page: 'etudiants', icon: Users },
        { name: 'Page de connexion', page: 'connexion', icon: LogIn },
        { name: 'Examens', page: 'examens', icon: ClipboardList },
        { name: 'Gestion des Notes', page: 'notes', icon: BarChart2 },
        { name: 'Emploi du temps', page: 'timetable', icon: Calendar },
        { name: 'Discussion IA', page: 'chat', icon: Mail },
        { name: 'À propos', page: 'about', icon: Info },
        { name: 'Contacter', page: 'contact', icon: Phone }
      ];
    } else {
      return [
        { name: 'Accueil Étudiant', page: 'home', icon: Home },
        { name: 'ADMISSION', page: 'admission', icon: UserPlus },
        { name: 'FORMATION', page: 'formations', icon: BookOpen },
        { name: 'ETUDIANT', page: 'etudiants', icon: Users },
        { name: 'Page de connexion', page: 'connexion', icon: LogIn },
        { name: 'Mes Cours', page: 'cours', icon: FileText },
        { name: 'Vidéos de Cours', page: 'videos', icon: Tv },
        { name: 'Emploi du temps', page: 'timetable', icon: Calendar },
        { name: 'Suivi Dossier', page: 'candidature', icon: Clock },
        { name: 'Mon Émargement', page: 'attendance', icon: ClipboardList },
        { name: 'Mes Reçus', page: 'receipt', icon: Receipt },
        { name: 'Discussion IA', page: 'chat', icon: Mail },
        { name: 'À propos', page: 'about', icon: Info },
        { name: 'Contacter', page: 'contact', icon: Phone }
      ];
    }
  };

  // Interactive Course Adding States
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [addCourseTitle, setAddCourseTitle] = useState('');
  const [addCourseDesc, setAddCourseDesc] = useState('');
  const [addCourseCategory, setAddCourseCategory] = useState('informatique');
  const [addCoursePrice, setAddCoursePrice] = useState('2500');
  const [addCourseDuration, setAddCourseDuration] = useState('1 an');
  const [addCourseLevel, setAddCourseLevel] = useState('Licence');
  const [addCourseImage, setAddCourseImage] = useState('💻');

  // --- NEW CUSTOM PAGES AUXILIARY STATES ---
  const [selectedDiplomaStudent, setSelectedDiplomaStudent] = useState<any>({
    id: 'stud-1',
    prenom: 'Jean',
    nom: 'Dupont',
    filiere: 'Ingénierie Logicielle & Web',
    promotion: '2026',
    grade: 'Licence Supérieure',
    averageGrade: 16.5,
    certId: 'CERT-A88492048'
  });
  const [diplomaStudents, setDiplomaStudents] = useState<any[]>([
    { id: 'stud-1', prenom: 'Jean', nom: 'Dupont', filiere: 'Ingénierie Logicielle & Web', promotion: '2026', grade: 'Licence Supérieure', averageGrade: 16.5, certId: 'CERT-A88492048' },
    { id: 'stud-2', prenom: 'Sophie', nom: 'Martin', filiere: 'Intelligence Artificielle & Data', promotion: '2026', grade: 'Master d\'État', averageGrade: 15.8, certId: 'CERT-A77395011' },
    { id: 'stud-3', prenom: 'Marc', nom: 'Leroy', filiere: 'CyberSécurité & Réseaux', promotion: '2025', grade: 'Licence Pro RNCP', averageGrade: 13.9, certId: 'CERT-A11048293' },
    { id: 'stud-4', prenom: 'Jacquecin', nom: 'Grela', filiere: 'Marketing Digital & Tech', promotion: '2026', grade: 'Master Supérieur d\'État', averageGrade: 17.2, certId: 'CERT-A99411038' }
  ]);
  const [diplomaTemplate, setDiplomaTemplate] = useState<'traditional' | 'modern' | 'rncp'>('traditional');
  const [showDiplomaPreviewModal, setShowDiplomaPreviewModal] = useState(false);
  const [showAddDiplomaRecipient, setShowAddDiplomaRecipient] = useState(false);
  const [newDipFirst, setNewDipFirst] = useState('');
  const [newDipLast, setNewDipLast] = useState('');
  const [newDipFiliere, setNewDipFiliere] = useState('Informatique');
  const [newDipGrade, setNewDipGrade] = useState('Licence');
  const [newDipAvg, setNewDipAvg] = useState('15.5');

  // E-learning video states
  const [activeVideoId, setActiveVideoId] = useState('vid-1');
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(30); // 30% default progress
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);
  const [tutorQuestionText, setTutorQuestionText] = useState('');
  const [videoDiscussionList, setVideoDiscussionList] = useState<any[]>([
    { id: 'disc-1', user: 'Sophie Martin', question: 'Le cycle de vie de useEffect se déclenche-t-il après le premier rendu ?', reply: 'Oui Sophie, le useEffect s’exécute systématiquement après que le DOM a été mis à jour par le premier rendu.' },
    { id: 'disc-2', user: 'Marc Leroy', question: 'Quelle est la différence entre Vite et Create React App ?', reply: 'Vite utilise l’ESM natif dans le navigateur pour un chargement instantané en développement, évitant le bundling complet que faisait Webpack avec CRA !' }
  ]);

  // Trainer states
  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamFiliere, setNewExamFiliere] = useState('Informatique');
  const [newExamDate, setNewExamDate] = useState('');
  const [newExamTime, setNewExamTime] = useState('10:00');
  const [newExamDuration, setNewExamDuration] = useState('2h00');
  const [newExamCoef, setNewExamCoef] = useState('3');
  const [newExamType, setNewExamType] = useState('Pratique');

  const [examFilter, setExamFilter] = useState<'Tous' | 'Prévu' | 'En cours de correction' | 'Terminé'>('Tous');
  const [showNextExamModal, setShowNextExamModal] = useState(false);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [selectedCopyForGrading, setSelectedCopyForGrading] = useState<any | null>(null);
  const [gradingScore, setGradingScore] = useState('15');
  const [gradingComments, setGradingComments] = useState('');
  const [ungradedCopies, setUngradedCopies] = useState<any[]>([
    {
      id: 'copy-1',
      studentName: 'Marc Leroy',
      studentEmail: 'marc.leroy@etu.univ.fr',
      filiere: 'Informatique',
      moduleName: 'Architecture des Systèmes Cloud',
      examTitle: 'Examen de mi-parcours Cloud',
      submissionText: 'Rapport technique sur le déploiement multi-région AWS et GCP. Utilisation de Terraform pour automatiser l’infrastructure avec Load Balancers globaux et réplication de base de données PostgreSQL passive/active.',
      dateSubmitted: '2026-06-21'
    },
    {
      id: 'copy-2',
      studentName: 'Sophie Martin',
      studentEmail: 'sophie.martin@etu.univ.fr',
      filiere: 'Informatique',
      moduleName: 'Architecture des Systèmes Cloud',
      examTitle: 'Examen de mi-parcours Cloud',
      submissionText: 'Analyse comparative des coûts serverless (AWS Lambda) vs serveurs dédiés (EC2). Proposition d\'une architecture hybride avec cache Redis global pour limiter les requêtes sur l\'instance SQL.',
      dateSubmitted: '2026-06-21'
    },
    {
      id: 'copy-3',
      studentName: 'Jean Dupont',
      studentEmail: 'jean.dupont@etu.univ.fr',
      filiere: 'Informatique',
      moduleName: 'Architecture des Systèmes Cloud',
      examTitle: 'Examen de mi-parcours Cloud',
      submissionText: 'Mise en œuvre de conteneurs Docker orchestrés par Kubernetes (GKE). Configuration de HPA (Horizontal Pod Autoscaler) basé sur l\'utilisation CPU à 70% et intégration d\'Ingress Nginx.',
      dateSubmitted: '2026-06-22'
    },
    {
      id: 'copy-4',
      studentName: 'Amélie Petit',
      studentEmail: 'amelie.petit@etu.univ.fr',
      filiere: 'Gestion & Management',
      moduleName: 'Management Stratégique des Organisations',
      examTitle: 'Projet de Stratégie d’Entreprise',
      submissionText: 'Analyse SWOT et forces de Porter appliquées à une transition d\'un constructeur automobile traditionnel vers l\'électrique à 100%. Planification de la supply chain de batteries de rechange.',
      dateSubmitted: '2026-06-23'
    }
  ]);

  // Grade Edit states
  const [editingGrade, setEditingGrade] = useState<any | null>(null);
  const [editGradeVal, setEditGradeVal] = useState('15');
  const [editGradeComm, setEditGradeComm] = useState('');

  // Signable Attendance state fields
  const [activeSigningRecord, setActiveSigningRecord] = useState<AttendanceRecord | null>(null);
  const [typedSignName, setTypedSignName] = useState('');
  const [showSignModal, setShowSignModal] = useState(false);

  // Administrative Attendance control states
  const [adminRecordUser, setAdminRecordUser] = useState('student1');
  const [adminRecordName, setAdminRecordName] = useState('Gre Las Martin');
  const [adminRecordCourse, setAdminRecordCourse] = useState('Conception Web (React)');
  const [adminRecordStatus, setAdminRecordStatus] = useState<'present' | 'absent' | 'late'>('present');

  // Interactive printable voucher state
  const [activeVoucher, setActiveVoucher] = useState<any | null>(null);

  // --- USER AUTH STATES ---
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // --- REGISTRATION STATES ---
  const [regNom, setRegNom] = useState('');
  const [regPrenom, setRegPrenom] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regTelephone, setRegTelephone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showValidationStep, setShowValidationStep] = useState(false);
  const [generatedValidationCode, setGeneratedValidationCode] = useState('');
  const [enteredValidationCode, setEnteredValidationCode] = useState('');

  // --- ADMISSIONS STATES ---
  const [admissionStep, setAdmissionStep] = useState(1);
  const [candNom, setCandNom] = useState('');
  const [candPrenom, setCandPrenom] = useState('');
  const [candEmail, setCandEmail] = useState('');
  const [candPhone, setCandPhone] = useState('');
  const [candProgram, setCandProgram] = useState('informatique');
  const [candDocIdCard, setCandDocIdCard] = useState<File | null>(null);
  const [candDocDiploma, setCandDocDiploma] = useState<File | null>(null);
  const [candDocPhoto, setCandDocPhoto] = useState<File | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // --- CATALOG & VIDEO MOUNT STATES ---
  const [formations, setFormations] = useState<Formation[]>([]);
  const [filterDept, setFilterDept] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [activeVideoCourse, setActiveVideoCourse] = useState<Formation | null>(null);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>('');
  const [selectedVideoTitle, setSelectedVideoTitle] = useState<string>('');
  const [videoPlayOverlay, setVideoPlayOverlay] = useState(true);
  const [videoDuration, setVideoDuration] = useState('0:00');
  const [videoCurrentTime, setVideoCurrentTime] = useState('0:00');
  const [videoProgressPercent, setVideoProgressPercent] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lessonsVideoRef = useRef<HTMLVideoElement | null>(null);

  // --- INTERACTIVE TRACKER STATE ---
  // Steps: 0: Candidature, 1: Admission, 2: Inscription, 3: Formation, 4: Certificat
  const [trackerProgress, setTrackerProgress] = useState(0);
  const [allCandidatures, setAllCandidatures] = useState<Candidature[]>([]);
  const [studentCandidatures, setStudentCandidatures] = useState<Candidature[]>([]);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // --- CHAT SYSTEM STATES ---
  const [chatContacts, setChatContacts] = useState([
    { name: 'Prof. Martin', role: 'tutor', topic: 'Informatique & Web Dev', online: true },
    { name: 'Admin Université', role: 'admin', topic: 'Dossier Administration', online: true },
    { name: 'Prof. Dubois', role: 'tutor', topic: 'Marketing & Management', online: true }
  ]);
  const [activeContact, setActiveContact] = useState('Prof. Martin');
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // --- FLOATING AI ASSISTANT CHAT STATES ---
  const [showFloatingChat, setShowFloatingChat] = useState(false);
  const [floatingInput, setFloatingInput] = useState('');
  const [isFloatingAiTyping, setIsFloatingAiTyping] = useState(false);
  const [floatingMessages, setFloatingMessages] = useState<Message[]>([
    {
      id: 'welcome_1',
      senderName: 'Assistant Virtuel',
      senderRole: 'tutor',
      receiverName: 'Visiteur',
      text: "Bonjour ! Je suis l'Assistant Académique d'EDUOnline. Que souhaiteriez-vous savoir sur nos admissions, nos formations ou nos frais de scolarité ? Posez-moi vos questions !",
      date: new Date().toISOString()
    }
  ]);
  const floatingChatBottomRef = useRef<HTMLDivElement | null>(null);

  // --- PAYMENT FORMS ---
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentCard, setPaymentCard] = useState('');
  const [paymentExpiry, setPaymentExpiry] = useState('');
  const [paymentCvv, setPaymentCvv] = useState('');
  const [paymentCardHolder, setPaymentCardHolder] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // --- DASHBOARD ANALYTICS ---
  const [stats, setStats] = useState<DashboardStats>({
    totalEtudiants: 12,
    totalCandidatures: 3,
    totalAdmis: 2,
    totalCertifies: 1,
    totalRevenus: 3800,
    enAttente: 1
  });

  // --- SYSTEM POPS & SLIDERS ---
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [smsNotification, setSmsNotification] = useState<SMSNotification | null>(null);

  // --- DEFAULT DATA SEED FOR CHART DISPLAY ---
  const monthlyData = [
    { name: 'Jan', Inscriptions: 4 },
    { name: 'Fév', Inscriptions: 8 },
    { name: 'Mar', Inscriptions: 15 },
    { name: 'Avr', Inscriptions: 22 },
    { name: 'Mai', Inscriptions: 31 },
    { name: 'Juin', Inscriptions: 45 },
    { name: 'Juil', Inscriptions: dbStatus.type === 'MongoDB' ? 52 : 38 }
  ];

  const departmentData = [
    { name: 'Informatique', value: 45 },
    { name: 'Gestion', value: 25 },
    { name: 'Droit', value: 15 },
    { name: 'Marketing', value: 15 }
  ];

  const COLORS = ['#2563EB', '#F59E0B', '#10B981', '#EC4899'];

  // --- LOGIC LIFECYCLE INITIALIZER ---
  useEffect(() => {
    // Check local storage setting defaults
    const savedUser = safeStorage.getItem('edu_online_user');
    const savedTheme = safeStorage.getItem('edu_online_theme');
    const savedProg = safeStorage.getItem('edu_online_tracker');
    
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        setIsLoggedIn(true);
        if (parsed.role === 'admin') {
          setActiveHomeTab('admin');
        } else if (parsed.role === 'tutor') {
          setActiveHomeTab('trainer');
        } else {
          setActiveHomeTab('student');
        }
      } catch (e) {}
    }
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.body.classList.add('dark-mode');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    if (savedProg) {
      setTrackerProgress(Number(savedProg));
    }

    fetchDatabaseStatus();
    loadFormations();
    fetchStats();
    loadCandidatures();
    loadTimetable();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadCandidatures();
      loadMessages();
      loadFormations();
      loadTimetable();
      loadAttendance();
      loadReceipts();
      setCandNom(currentUser.nom);
      setCandPrenom(currentUser.prenom);
      setCandEmail(currentUser.email);
      setCandPhone(currentUser.telephone || '');
      if (currentUser.role === 'admin') {
        setActiveHomeTab('admin');
      } else if (currentUser.role === 'tutor') {
        setActiveHomeTab('trainer');
      } else {
        setActiveHomeTab('student');
      }
    } else {
      setAttendances([]);
      setReceipts([]);
      setActiveHomeTab('student');
    }
    fetchStats();
  }, [currentUser]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAiTyping]);

  useEffect(() => {
    if (floatingChatBottomRef.current) {
      floatingChatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [floatingMessages, isFloatingAiTyping]);

  useEffect(() => {
    if (lessonsVideoRef.current) {
      if (videoPlaying) {
        lessonsVideoRef.current.play().catch(() => {});
      } else {
        lessonsVideoRef.current.pause();
      }
    }
  }, [videoPlaying, activeVideoId]);

  // --- TOAST SYSTEMS ---
  const triggerNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  const triggerSMS = (phone: string, text: string) => {
    setSmsNotification({ id: Date.now().toString(), phone, text });
    setTimeout(() => {
      setSmsNotification(null);
    }, 6000);
  };

  // --- FETCH API PROXIES ---
  const fetchDatabaseStatus = async () => {
    try {
      const res = await fetch('/api/db-status');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
      }
    } catch (e) {
      console.warn("Database status query failed, local server fallback.");
    }
  };

  const loadFormations = async () => {
    try {
      const url = currentUser ? `/api/formations?userId=${currentUser.id}` : '/api/formations';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setFormations(data);
      }
    } catch (e) {
      triggerNotification('Erreur de communication avec la base de données.', 'error');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {}
  };

  const loadCandidatures = async () => {
    try {
      if (currentUser?.role === 'admin') {
        const res = await fetch('/api/candidatures');
        if (res.ok) {
          const data = await res.json();
          setAllCandidatures(data);
        }
      } else if (currentUser) {
        const res = await fetch(`/api/candidatures?userId=${currentUser.id}`);
        if (res.ok) {
          const data = await res.json();
          setStudentCandidatures(data);
        }
      }
    } catch (e) {}
  };

  const loadMessages = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/messages?userId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {}
  };

  const loadTimetable = async () => {
    try {
      const res = await fetch('/api/timetable');
      if (res.ok) {
        const data = await res.json();
        setTimetables(data);
      }
    } catch (e) {}
  };

  const loadAttendance = async () => {
    try {
      const url = currentUser && currentUser.role === 'admin' ? '/api/attendance' : (currentUser ? `/api/attendance?userId=${currentUser.id}` : '/api/attendance');
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setAttendances(data);
      }
    } catch (e) {}
  };

  const loadReceipts = async () => {
    try {
      const url = currentUser && currentUser.role === 'admin' ? '/api/receipts' : (currentUser ? `/api/receipts?userId=${currentUser.id}` : '/api/receipts');
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReceipts(data);
      }
    } catch (e) {}
  };

  const handleCreateTimetableEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle || !newProf) {
      triggerNotification("Renseignez le nom du cours et du professeur.", "warning");
      return;
    }
    try {
      const res = await fetch('/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseTitle: newCourseTitle,
          professorName: newProf,
          dayOfWeek: newDay,
          startTime: newStart,
          endTime: newEnd,
          room: newRoom,
          color: newColor,
          filiere: newCourseFiliere
        })
      });
      if (res.ok) {
        triggerNotification("Cours rédigé sur l'Emploi du Temps ! 📅", 'success');
        loadTimetable();
        setShowEventModal(false);
        setNewCourseTitle('');
        setNewProf('');
      } else {
        triggerNotification("Erreur d'insertion du créneau.", "error");
      }
    } catch (err) {
      triggerNotification("Échec réseau.", "error");
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addCourseTitle) {
      triggerNotification('Le titre du cours est obligatoire.', 'warning');
      return;
    }

    const priceNum = Number(addCoursePrice) || 2500;
    const lowerCategory = addCourseCategory.toLowerCase();

    const newCourseData = {
      titre: addCourseTitle,
      description: addCourseDesc || 'Un module académique spécialisé.',
      prix: priceNum,
      duree: addCourseDuration || '1 an',
      niveau: addCourseLevel || 'Licence',
      image: addCourseImage || '💻',
      categorie: lowerCategory,
      modules: [
        { nom: 'Théorie fondamentale', progression: 0 },
        { nom: 'Atelier applicatif', progression: 0 }
      ]
    };

    try {
      const response = await fetch('/api/formations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCourseData)
      });
      if (response.ok) {
        triggerNotification(`Cours "${addCourseTitle}" incorporé avec succès au programme ! ✨`, 'success');
        loadFormations();
        setShowAddCourseModal(false);
        // Clear state
        setAddCourseTitle('');
        setAddCourseDesc('');
        setAddCourseCategory('informatique');
        setAddCoursePrice('2500');
        setAddCourseDuration('1 an');
        setAddCourseLevel('Licence');
        setAddCourseImage('💻');
      } else {
        const errD = await response.json();
        triggerNotification(errD.error || 'Erreur lors de la création du cours', 'error');
      }
    } catch (err) {
      triggerNotification('Erreur de réseau ou serveur lors de la création du cours', 'error');
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('school-voucher-receipt-printable-frame');
    if (!element || !activeVoucher) {
      triggerNotification('Reçu introuvable pour l\'exportation.', 'error');
      return;
    }

    triggerNotification('Génération du fichier PDF... ⏳', 'info');

    try {
      const canvas = await html2canvas(element, {
        scale: 2.5, // Ultra sharp scale
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('school-voucher-receipt-printable-frame');
          if (clonedElement) {
            clonedElement.classList.remove('dark:bg-slate-900', 'dark:border-slate-800', 'text-slate-100');
            clonedElement.classList.add('bg-white', 'border-slate-200', 'text-slate-800');
            
            // Standardize elements for highly crisp light mode PDF output
            const allElements = clonedElement.querySelectorAll('*');
            allElements.forEach((el) => {
              if (el.classList.contains('text-white') && !el.classList.contains('bg-blue-600') && !el.classList.contains('bg-emerald-500')) {
                el.classList.remove('text-white');
                el.classList.add('text-slate-800');
              }
              el.classList.remove('dark:text-white', 'dark:text-slate-350', 'dark:text-slate-400', 'dark:bg-slate-900', 'dark:border-slate-800');
            });
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate scaled height to preserve aspect ratio within A4 margins
      const margin = 12; // 12mm page margin
      const usableWidth = pdfWidth - (margin * 2);
      const imgHeight = (canvas.height * usableWidth) / canvas.width;
      
      // Add printable image
      pdf.addImage(imgData, 'PNG', margin, margin, usableWidth, imgHeight);
      
      // Export PDF File
      const pdfName = `Facture_UnivOnline_${activeVoucher.receiptNumber || 'receipt'}.pdf`;
      pdf.save(pdfName);
      triggerNotification('Reçu PDF téléchargé avec succès ! 📄✨', 'success');
    } catch (err) {
      console.error('Error generating PDF', err);
      triggerNotification('Échec du rendu PDF. Ouverture de l\'impression système.', 'warning');
      window.print();
    }
  };

  const printSpecificElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const printClass = "print-only-this-element";
    const style = document.createElement("style");
    style.id = "dynamic-print-style";
    style.innerHTML = `
      @media print {
        body {
          background: white !important;
          color: black !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body > *:not(.${printClass}) {
          display: none !important;
        }
        body > .${printClass} {
          display: block !important;
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          height: auto !important;
          margin: 0 !important;
          padding: 20px !important;
          border: none !important;
          box-shadow: none !important;
          background: white !important;
        }
      }
    `;
    document.head.appendChild(style);

    const clone = element.cloneNode(true) as HTMLElement;
    clone.id = "print-clone-temp";
    clone.classList.add(printClass);
    clone.style.display = "block";
    clone.style.position = "absolute";
    clone.style.left = "-9999px";
    clone.style.top = "-9999px";
    
    // Remove buttons from cloned node so they don't get printed
    const buttons = clone.querySelectorAll('button');
    buttons.forEach(btn => btn.remove());

    document.body.appendChild(clone);

    window.print();

    setTimeout(() => {
      if (clone.parentNode) {
        document.body.removeChild(clone);
      }
      const styleElement = document.getElementById("dynamic-print-style");
      if (styleElement) {
        document.head.removeChild(styleElement);
      }
    }, 500);
  };

  const handlePrintDiploma = async (studentToPrint?: any) => {
    // Determine which element is currently visible/active to print
    let elementId = 'eduonline-diploma-recipient-frame';
    if (showDiplomaPreviewModal) {
      elementId = 'eduonline-diploma-recipient-frame-preview';
    } else if (showCertificateModal) {
      elementId = 'eduonline-diploma-recipient-frame-cert';
    }

    const element = document.getElementById(elementId);
    if (!element) {
      triggerNotification('Diplôme introuvable.', 'error');
      return;
    }

    triggerNotification('Génération de votre diplôme officiel... 🎓⏳', 'info');

    try {
      const canvas = await html2canvas(element, {
        scale: 3, // Premium print resolution scale
        useCORS: true,
        backgroundColor: '#fffdf4',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Diplomas are traditionally landscape A4
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const margin = 10;
      const usableWidth = pdfWidth - (margin * 2);
      const usableHeight = pdfHeight - (margin * 2);
      
      pdf.addImage(imgData, 'PNG', margin, margin, usableWidth, usableHeight);
      
      const activeStudent = studentToPrint || selectedDiplomaStudent;
      const nameStr = activeStudent 
        ? `${activeStudent.prenom}_${activeStudent.nom}` 
        : (currentUser ? `${currentUser.prenom}_${currentUser.nom}` : 'Etudiant');
      const diplomaName = `Diplome_UnivOnline_${nameStr}.pdf`;
      pdf.save(diplomaName);
      triggerNotification('Félicitations ! Votre diplôme PDF a été téléchargé avec succès ! 📜🎓', 'success');
    } catch (err) {
      console.error('Error generating diploma PDF', err);
    }

    // Trigger high-quality print dialog specifically for the diploma
    printSpecificElement(elementId);
  };

  const handleDeleteTimetableEvent = async (id: string) => {
    try {
      const res = await fetch(`/api/timetable/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          triggerNotification("Le cours a été retiré de l'agenda avec succès ! 📅", 'success');
          loadTimetable();
        } else {
          triggerNotification("Impossible de supprimer ce cours.", "error");
        }
      }
    } catch (err) {
      triggerNotification("Échec réseau lors de la suppression du cours.", "error");
    }
  };

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSigningRecord) return;
    if (!typedSignName.trim()) {
      triggerNotification("Le paraphe nominatif est requis pour certifier la présence.", "warning");
      return;
    }
    try {
      const res = await fetch('/api/attendance/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordId: activeSigningRecord.id,
          timeSigned: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + ' UTC',
          status: 'present'
        })
      });
      if (res.ok) {
        triggerNotification("Émargement numérique validé pour aujourd'hui ! ✅", 'success');
        loadAttendance();
        setShowSignModal(false);
        setTypedSignName('');
        setActiveSigningRecord(null);
      } else {
        triggerNotification("Impossible de certifier la présence.", "error");
      }
    } catch (err) {
      triggerNotification("Échec réseau lors de la validation.", "error");
    }
  };

  const handleCreateAttendanceRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminRecordCourse) return;
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: adminRecordUser,
          userName: adminRecordName,
          courseTitle: adminRecordCourse,
          status: adminRecordStatus,
          signed: adminRecordStatus === 'present'
        })
      });
      if (res.ok) {
        triggerNotification(`Fiche d'émargement générée pour ${adminRecordName} !`, 'success');
        loadAttendance();
        setAdminRecordCourse('');
      } else {
        triggerNotification("Une erreur s'est produite.", "error");
      }
    } catch (err) {
      triggerNotification("Échec de connexion.", "error");
    }
  };

  // --- UI INTERACTIVITY ---
  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    safeStorage.setItem('edu_online_theme', next ? 'dark' : 'light');
    if (next) {
      document.body.classList.add('dark-mode');
      document.documentElement.classList.add('dark');
    } else {
      document.body.classList.remove('dark-mode');
      document.documentElement.classList.remove('dark');
    }
    triggerNotification(next ? 'Mode sombre activé 🌙' : 'Mode clair activé ☀️', 'info');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      triggerNotification('Veuillez saisir vos identifiants.', 'warning');
      return;
    }
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        setIsLoggedIn(true);
        safeStorage.setItem('edu_online_user', JSON.stringify(data.user));
        setShowLoginModal(false);
        triggerNotification(`Bienvenue, ${data.user.prenom} ! Connecté avec succès.`, 'success');
        setCurrentPage('home');
        if (data.user.role === 'admin') {
          setActiveHomeTab('admin');
        } else if (data.user.role === 'tutor') {
          setActiveHomeTab('trainer');
        } else {
          setActiveHomeTab('student');
        }
      } else {
        triggerNotification(data.error || 'Courriel ou mot de passe incorrect.', 'error');
      }
    } catch (err) {
      triggerNotification('Erreur de connexion au serveur.', 'error');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNom || !regPrenom || !regEmail || !regPassword) {
      triggerNotification('Remplissez tous les champs obligatoires.', 'warning');
      return;
    }

    if (!showValidationStep) {
      // Générer le code d'inscription à 6 chiffres
      const code = String(Math.floor(100000 + Math.random() * 900000));
      setGeneratedValidationCode(code);
      setShowValidationStep(true);
      setEnteredValidationCode('');
      triggerNotification(`Code d'inscription généré avec succès ! Saisissez le code ${code} pour valider.`, 'success');
      return;
    }

    if (enteredValidationCode.trim() !== generatedValidationCode) {
      triggerNotification('Code de validation incorrect. Veuillez vérifier le code de validation affiché.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: regNom,
          prenom: regPrenom,
          email: regEmail,
          telephone: regTelephone,
          password: regPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        setIsLoggedIn(true);
        safeStorage.setItem('edu_online_user', JSON.stringify(data.user));
        setShowLoginModal(false);
        triggerNotification(`Bienvenue, ${data.user.prenom} ! Votre compte a été créé et connecté avec succès.`, 'success');
        setCurrentPage('home');
        
        // Reset inputs
        setRegNom('');
        setRegPrenom('');
        setRegEmail('');
        setRegTelephone('');
        setRegPassword('');
        setShowValidationStep(false);
        setGeneratedValidationCode('');
        setEnteredValidationCode('');
      } else {
        triggerNotification(data.error || "Erreur lors de la création du compte.", 'error');
      }
    } catch (e) {
      triggerNotification('Erreur réseau de création.', 'error');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    safeStorage.removeItem('edu_online_user');
    triggerNotification('Vous êtes à présent déconnecté.', 'info');
    setCurrentPage('home');
  };

  // --- PRESETS AUTOFIL FOR DEMO ---
  const autofillGrela = () => {
    setRegNom('Grela');
    setRegPrenom('Jacquecin');
    setRegEmail('jacquecingrelae@gmail.com');
    setRegTelephone('+33 6 45 61 75 88');
    setRegPassword('grela1234');
    triggerNotification('Identifiants pré-remplis pour Jacquecin Grela. Cliquez sur soumettre !', 'info');
  };

  const fastLoginStudent = () => {
    setLoginEmail('pierre.martin@univ-online.fr');
    setLoginPassword('Student123!');
    triggerNotification('Compte étudiant démo pré-rempli !', 'info');
  };

  const fastLoginAdmin = () => {
    setLoginEmail('admin@univ-online.fr');
    setLoginPassword('Admin123!');
    triggerNotification('Compte administrateur démo pré-rempli !', 'info');
  };

  // --- SUBMIT ONLINE ADMISSION WIZARD ---
  const handleAdmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn || !currentUser) {
      triggerNotification('Identifiez-vous d\'abord pour finaliser votre dossier.', 'warning');
      setShowLoginModal(true);
      return;
    }
    if (!candNom || !candPrenom || !candEmail || !candPhone || !acceptTerms) {
      triggerNotification('Veuillez compléter toutes les informations requises.', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/candidatures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          nom: candNom,
          prenom: candPrenom,
          email: candEmail,
          formation: candProgram,
          niveau: 'Licence 3',
          lettre: 'Je postule pour intégrer la division académique de EDUOnline.'
        })
      });
      const data = await res.json();
      if (res.ok) {
        triggerNotification('Dossier d\'excellence soumis ! Traitement en cours.', 'success');
        
        // Simuler la réception de SMS
        triggerSMS(
          candPhone,
          `Félicitations ${candPrenom} ! Votre dossier de candidature sur ${candProgram.toUpperCase()} a été reçu chez EDUOnline. Suivez l'évolution sur votre tracker.`
        );

        // Advance tracker progression to "Admission" (step: 1)
        if (trackerProgress < 1) {
          setTrackerProgress(1);
          safeStorage.setItem('edu_online_tracker', '1');
        }

        // Clean-up inputs
        setCandNom('');
        setCandPrenom('');
        setCandEmail('');
        setCandPhone('');
        setAcceptTerms(false);
        setAdmissionStep(1);

        loadCandidatures();
        fetchStats();
        // Shift to tracker view
        setCurrentPage('candidature');
      } else {
        triggerNotification(data.error || 'Erreur lors du dépôt du dossier d\'admission.', 'error');
      }
    } catch (e) {
      triggerNotification('Erreur réseau d\'inscription.', 'error');
    }
  };

  const handleUpdateCandidatureStatus = async (id: string, newStatus: 'en_attente' | 'admis' | 'refuse') => {
    try {
      const res = await fetch(`/api/candidatures/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: newStatus })
      });
      if (res.ok) {
        triggerNotification('Statut de la candidature mis à jour !', 'success');
        loadCandidatures();
      } else {
        const errData = await res.json();
        triggerNotification(errData.error || 'Erreur lors de la mise à jour.', 'error');
      }
    } catch (err) {
      triggerNotification('Erreur réseau de mise à jour.', 'error');
    }
  };

  // --- CLICKABLE TRACKER MILSTEONES SINK ---
  const handleTrackerStepClick = (stepIndex: number) => {
    if (stepIndex > trackerProgress + 1) {
      triggerNotification('Veuillez compléter les étapes scolaires précédentes.', 'warning');
      return;
    }
    setTrackerProgress(stepIndex);
    safeStorage.setItem('edu_online_tracker', String(stepIndex));

    const stepsLabels = ['Candidature', 'Admission', 'Inscription', 'Formation', 'Certificat'];
    triggerNotification(`Étape "${stepsLabels[stepIndex]}" activée !`, 'info');

    if (stepIndex === 1) {
      triggerNotification('Félicitations, votre profil étudiant est validé par le jury !', 'success');
    } else if (stepIndex === 2) {
      triggerNotification('Inscription et affectation de droits complétées. Accédez aux paiements !', 'success');
    } else if (stepIndex === 4) {
      triggerNotification('Félicitations ! Votre diplôme de réussite a été officiellement délivré.', 'success');
      setShowCertificateModal(true);
    }
  };

  // --- SUBMIT TUITION PAYMENT ---
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn || !currentUser) {
      triggerNotification('Veuillez vous connecter pour procéder au paiement d\'études.', 'warning');
      setShowLoginModal(true);
      return;
    }
    if (!paymentPhone || !paymentCard || !paymentExpiry || !paymentCvv) {
      triggerNotification('Veuillez renseigner toutes les informations de facturation.', 'warning');
      return;
    }

    setPaymentProcessing(true);
    setTimeout(async () => {
      try {
        const res = await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            formationId: Number(formations[0]?.id || 1),
            amount: 4300
          })
        });
        if (res.ok) {
          triggerNotification('Virement sécurisé de 21 500 000 Ar accepté ! Droits accordés.', 'success');
          
          triggerSMS(
            paymentPhone,
            `Paiement accepté ! Réf: WL${Date.now().toString().substring(5)}. Vos frais annuels chez EDUOnline ont été régularisés. Inscription validée !`
          );

          // Force tracker to registration step (step 2) or advance it
          if (trackerProgress < 2) {
            setTrackerProgress(2);
            safeStorage.setItem('edu_online_tracker', '2');
          }

          setPaymentPhone('');
          setPaymentCard('');
          setPaymentExpiry('');
          setPaymentCvv('');
          setPaymentCardHolder('');

          fetchStats();
          loadFormations();
          setCurrentPage('candidature');
        } else {
          triggerNotification('Erreur d\'approbation bancaire.', 'error');
        }
      } catch (e) {
        triggerNotification('Réseau bancaire indisponible.', 'error');
      } finally {
        setPaymentProcessing(false);
      }
    }, 2000);
  };

  // --- CHAT WITH AI BOT AND TUTOR CHANNELS ---
  const handleSendMessage = async () => {
    if (!chatInput.trim() || !currentUser) return;
    const originalText = chatInput.trim();
    setChatInput('');

    // Pre-insert local message bubble
    const userMsg: Message = {
      id: 'local_' + Date.now(),
      senderName: `${currentUser.prenom} ${currentUser.nom}`,
      senderRole: 'student',
      receiverName: activeContact,
      text: originalText,
      date: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsAiTyping(true);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          senderName: `${currentUser.prenom} ${currentUser.nom}`,
          senderRole: 'student',
          receiverName: activeContact,
          text: originalText
        })
      });
      if (res.ok) {
        const data = await res.json();
        // Replace current message flow with database records
        setMessages((prev) => {
          const base = prev.filter((m) => m.id !== userMsg.id);
          return [...base, data.userMessage, data.tutorMessage];
        });
      } else {
        triggerNotification('Le message n\'a pas pu être acheminé.', 'error');
      }
    } catch (e) {
      triggerNotification('Erreur réseau de messagerie.', 'error');
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleSendFloatingMessage = async (overrideText?: string) => {
    const textToSend = (overrideText || floatingInput).trim();
    if (!textToSend) return;
    
    setFloatingInput('');
    setIsFloatingAiTyping(true);

    const userName = currentUser ? `${currentUser.prenom} ${currentUser.nom}` : "Visiteur Intéressé";
    const userRole = currentUser ? "student" : "guest";

    const userMsg: Message = {
      id: 'local_float_' + Date.now(),
      senderName: userName,
      senderRole: userRole as any,
      receiverName: 'Assistant Virtuel',
      text: textToSend,
      date: new Date().toISOString()
    };

    setFloatingMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id || 'guest',
          senderName: userName,
          senderRole: userRole,
          receiverName: 'Administration',
          text: textToSend
        })
      });

      if (res.ok) {
        const data = await res.json();
        setFloatingMessages((prev) => {
          const base = prev.filter((m) => m.id !== userMsg.id);
          const replyText = data.tutorMessage?.text || "Je prends note de votre demande. Nos tuteurs et conseillers d'admission s'efforcent de vous orienter dans les meilleurs délais.";
          const replyMsg: Message = {
            id: 'ai_float_' + Date.now(),
            senderName: 'Assistant Virtuel',
            senderRole: 'tutor',
            receiverName: userName,
            text: replyText,
            date: new Date().toISOString()
          };
          return [...base, data.userMessage || userMsg, replyMsg];
        });
      } else {
        const lower = textToSend.toLowerCase();
        let aiText = "Je comprends. L'UNIV-ONLINE vous propose des parcours diplômants d'État en Informatique (Licence & Big Data), Droit international des Affaires, Gestion, et Marketing Digital. Souhaitez-vous candidater en ligne ?";
        if (lower.includes("inscription") || lower.includes("candidater") || lower.includes("admission") || lower.includes("postuler")) {
          aiText = "L'inscription en ligne prend moins de 5 minutes dans la section 'Admission'. Il vous suffit de renseigner vos coordonnées, choisir votre filière et déposer vos documents d'identité et de diplôme !";
        } else if (lower.includes("tarif") || lower.includes("prix") || lower.includes("payer") || lower.includes("euro") || lower.includes("cout") || lower.includes("coût")) {
          aiText = "Nos frais d'inscription s'élèvent de 10 000 000 Ar à 15 000 000 Ar par année universitaire selon la filière, payables de manière sécurisée par carte. Vous recevez un reçu fiscal agréé instantanément après chaque règlement.";
        } else if (lower.includes("react") || lower.includes("dev") || lower.includes("informatique") || lower.includes("code")) {
          aiText = "Le parcours d'Informatique & Génie Logiciel est articulé autour de React, Node.js/Express, MongoDB et architectures d'IA. C'est idéal pour devenir ingénieur logiciel !";
        }
        
        setTimeout(() => {
          setFloatingMessages((prev) => [
            ...prev,
            {
              id: 'fallback_float_' + Date.now(),
              senderName: 'Assistant Virtuel',
              senderRole: 'tutor',
              receiverName: userName,
              text: aiText,
              date: new Date().toISOString()
            }
          ]);
          setIsFloatingAiTyping(false);
        }, 1000);
      }
    } catch (e) {
      setTimeout(() => {
        setFloatingMessages((prev) => [
          ...prev,
          {
            id: 'fallback_error_' + Date.now(),
            senderName: 'Assistant Virtuel',
            senderRole: 'tutor',
            receiverName: userName,
            text: "Merci pour votre message ! Je transmets votre demande d'admission spécialisée à l'administration d'EDUOnline. N'hésitez pas à remplir directement le dossier dans l'onglet 'Admission' pour commencer.",
            date: new Date().toISOString()
          }
        ]);
        setIsFloatingAiTyping(false);
      }, 800);
    } finally {
      setIsFloatingAiTyping(false);
    }
  };

  // --- CUSTOM VIDEO EVENT LISTENERS ---
  const playVideoAction = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setVideoPlayOverlay(false);
    }
  };

  const skipVideoTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds));
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration || 1;
      const progress = (current / duration) * 100;
      setVideoProgressPercent(progress);

      const curMin = Math.floor(current / 60);
      const curSec = Math.floor(current % 60).toString().padStart(2, '0');
      const durMin = Math.floor(duration / 60);
      const durSec = Math.floor(duration % 60).toString().padStart(2, '0');

      setVideoCurrentTime(`${curMin}:${curSec}`);
      setVideoDuration(`${durMin}:${durSec}`);
    }
  };

  const handleVideoClickThrough = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const fraction = clickX / width;
      videoRef.current.currentTime = fraction * videoRef.current.duration;
    }
  };

  const markModuleProgress = async (courseId: number, moduleName: string) => {
    if (!currentUser) return;
    try {
      const currentProgress = 100; // Complete this specific video module
      const res = await fetch('/api/formations/update-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          formationId: courseId,
          moduleName: moduleName,
          progression: currentProgress
        })
      });
      if (res.ok) {
        triggerNotification(`Module "${moduleName}" complété à 100% ! ✨`, 'success');
        loadFormations();
        fetchStats();
      }
    } catch (e) {}
  };

  const formatCardNumber = (val: string) => {
    const formatted = val.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
    setPaymentCard(formatted.substring(0, 19));
  };

  const formatExpiry = (val: string) => {
    const clean = val.replace(/\D/g, '');
    if (clean.length > 2) {
      setPaymentExpiry(`${clean.slice(0, 2)}/${clean.slice(2, 4)}`);
    } else {
      setPaymentExpiry(clean);
    }
  };

  // --- FILTERS LOGIC FOR COURSES ---
  const displayedCourses = formations.filter((f) => {
    const catMatch = filterDept === 'all' || f.categorie === filterDept;
    const lvlMatch = filterLevel === 'all' || f.niveau.toLowerCase() === filterLevel;
    return catMatch && lvlMatch;
  });

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* ==================== SYSTEM TOASTS STACK ==================== */}
      <div className="fixed top-24 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80 }}
              className="pointer-events-auto"
            >
              <div className={`p-4 rounded-xl shadow-lg border flex items-center gap-3 ${
                n.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/80 dark:border-rose-900 dark:text-rose-200' :
                n.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/80 dark:border-amber-900 dark:text-amber-200' :
                n.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/80 dark:border-blue-900 dark:text-blue-200' :
                'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-900 dark:text-emerald-200'
              }`}>
                {n.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />}
                {n.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />}
                {n.type === 'info' && <Compass className="w-5 h-5 text-blue-500 shrink-0" />}
                {n.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />}
                <p className="text-xs font-semibold leading-snug">{n.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ==================== SIMULATED SMARTPHONE SMS POP-UP ==================== */}
      <AnimatePresence>
        {smsNotification && (
          <motion.div
            initial={{ opacity: 0, y: 150, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 150, x: '-50%' }}
            className="fixed bottom-6 left-1/2 z-50 w-full max-w-sm px-4 pointer-events-none"
          >
            <div className="bg-[#1c1c1e] text-white p-4 rounded-3xl shadow-2xl border border-neutral-800 pointer-events-auto space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <div className="flex items-center gap-1.5">
                  <div className="bg-[#ff9500] text-white p-1 rounded-full">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest">Message SMS</span>
                </div>
                <span className="text-[10px] text-neutral-500 font-bold">À l'instant</span>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-[#ff9500]">{smsNotification.phone}</p>
                <p className="text-xs text-neutral-200 font-medium leading-relaxed font-sans">{smsNotification.text}</p>
              </div>
              <div className="h-1 w-20 bg-neutral-700 mx-auto rounded-full mt-2"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== NAVIGATION BAR (MOCKUP REPLICATED: EDUMANAGE) ==================== */}
      <nav className={`sticky top-0 z-40 transition-all duration-300 shadow-xl ${
        activeHomeTab === 'student' ? 'bg-[#0d3e8e]' :
        activeHomeTab === 'trainer' ? 'bg-emerald-900' :
        'bg-slate-900'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setCurrentPage('home')}>
                <div className="bg-yellow-400 text-slate-950 p-2 rounded-xl transition-transform hover:scale-105 shadow-[0_0_15px_rgba(250,204,21,0.4)]">
                  <GraduationCap className="w-6 h-6 text-slate-950" />
                </div>
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white font-sans">
                  EDU <span className="text-yellow-400 font-black">CFA</span>
                </span>
              </div>

              {/* Space Selector Pill (Quick Switching) */}
              <div className="hidden md:flex items-center bg-black/20 p-1 rounded-xl gap-1 border border-white/10 ml-2">
                <motion.button
                  whileHover={{ scale: 1.05, opacity: 0.95 }}
                  whileTap={{ scale: 0.95, opacity: 0.85 }}
                  onClick={() => {
                    setActiveHomeTab('student');
                    setCurrentPage('home');
                    triggerNotification("Accès à l'Espace Étudiant", "success");
                  }}
                  className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                    activeHomeTab === 'student'
                      ? 'bg-[#0d3e8e] text-white shadow shadow-blue-500/20'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  🎓 Étudiant
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, opacity: 0.95 }}
                  whileTap={{ scale: 0.95, opacity: 0.85 }}
                  onClick={() => {
                    setActiveHomeTab('trainer');
                    setCurrentPage('home');
                    triggerNotification("Accès à l'Espace Formateur", "success");
                  }}
                  className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                    activeHomeTab === 'trainer'
                      ? 'bg-emerald-600 text-white shadow shadow-emerald-500/20'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  👨‍🏫 Formateur
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, opacity: 0.95 }}
                  whileTap={{ scale: 0.95, opacity: 0.85 }}
                  onClick={() => {
                    setActiveHomeTab('admin');
                    setCurrentPage('home');
                    triggerNotification("Accès à l'Espace Admin", "success");
                  }}
                  className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                    activeHomeTab === 'admin'
                      ? 'bg-amber-500 text-slate-950 font-black shadow'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  🛡️ Admin
                </motion.button>
              </div>
            </div>

            {/* Desktop Navigation Links - Dynamically Populated */}
            {currentPage !== 'home' && (
              <div className="hidden lg:flex items-center gap-2">
                {getNavigationLinks().map((item) => {
                  const IconComp = item.icon;
                  const isCur = currentPage === item.page;
                  return (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      key={item.name}
                      onClick={() => setCurrentPage(item.page as any)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                        isCur
                          ? activeHomeTab === 'student' ? 'bg-yellow-400 text-slate-950 shadow' :
                            activeHomeTab === 'trainer' ? 'bg-emerald-500 text-white shadow' :
                            'bg-amber-500 text-slate-950 shadow'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <IconComp className={`w-4 h-4 ${isCur ? 'text-current' : 'text-white'}`} />
                      <span>{item.name}</span>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Profile area & controls */}
            <div className="hidden lg:flex items-center gap-3 relative">
              {/* Desktop Direct Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 15, opacity: 0.9 }}
                whileTap={{ scale: 0.9, opacity: 0.8 }}
                onClick={toggleTheme}
                title={darkMode ? "Activer le mode clair" : "Activer le mode sombre"}
                className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer focus:outline-none"
              >
                {darkMode ? <Sun className="w-4.5 h-4.5 text-amber-300" /> : <Moon className="w-4.5 h-4.5 text-white" />}
              </motion.button>

              {/* User Dropdown Profile Toggle */}
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer focus:outline-none"
              >
                <div className="h-8 w-8 rounded-full bg-white/20 border border-white/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span>{isLoggedIn && currentUser ? `${currentUser.prenom} ${currentUser.nom}` : "John Doe"}</span>
                <ChevronDown className={`w-4 h-4 text-white/80 transition-transform duration-205 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown List */}
              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-12 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3 z-50 text-slate-800 dark:text-slate-100"
                  >
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-850">
                      <p className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold">Rôle Actuel</p>
                      <p className="text-xs font-extrabold text-blue-600 dark:text-yellow-400">
                        {isLoggedIn && currentUser ? (currentUser.role === 'admin' ? "Administrateur" : "Étudiant Inscrit") : "Visiteur Étudiant"}
                      </p>
                    </div>

                    <div className="py-2.5 space-y-1">
                      <button
                        onClick={() => {
                          toggleTheme();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-left"
                      >
                        {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-blue-600" />}
                        <span>Mode {darkMode ? 'Clair' : 'Sombre'}</span>
                      </button>

                      <button
                        onClick={() => {
                          fetchDatabaseStatus();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-left"
                      >
                        <RefreshCw className="w-4 h-4 text-blue-600" />
                        <span>Synchroniser DB</span>
                      </button>

                      {isLoggedIn ? (
                        <button
                          onClick={() => {
                            handleLogout();
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-rose-50 text-rose-600 dark:hover:bg-rose-950/20 rounded-lg text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Déconnexion</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setShowLoginModal(true);
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-extrabold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg text-left"
                        >
                          <User className="w-4 h-4" />
                          <span>Connexion Portail</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu controls */}
            <div className="lg:hidden flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                title="Changer de thème"
                className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
              >
                {darkMode ? <Sun className="w-5 h-5 text-amber-300" /> : <Moon className="w-5 h-5 text-white" />}
              </motion.button>
              {currentPage !== 'home' && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
                </button>
              )}
              <div
                onClick={() => {
                  if (isLoggedIn) {
                    setProfileDropdownOpen(!profileDropdownOpen);
                  } else {
                    setShowLoginModal(true);
                  }
                }}
                className="h-8 w-8 rounded-full bg-white/20 border border-white/25 flex items-center justify-center cursor-pointer hover:bg-white/30"
              >
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE DROPDOWN (EXACTLY REPLICATED FROM PICTURE) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`lg:hidden px-4 pb-6 pt-2 transition-colors ${
                activeHomeTab === 'student' ? 'bg-[#0d3e8e]' :
                activeHomeTab === 'trainer' ? 'bg-emerald-900' :
                'bg-slate-900'
              }`}
            >
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-2.5 space-y-3 border border-slate-100 dark:border-slate-800">
                {/* Mobile Space Switcher */}
                <div className="grid grid-cols-3 bg-slate-50 dark:bg-slate-950 p-1 rounded-2xl gap-1 border border-slate-100 dark:border-slate-850">
                  <motion.button
                    whileHover={{ scale: 1.05, opacity: 0.95 }}
                    whileTap={{ scale: 0.95, opacity: 0.85 }}
                    onClick={() => {
                      setActiveHomeTab('student');
                      setCurrentPage('home');
                      setMobileMenuOpen(false);
                      triggerNotification("Accès à l'Espace Étudiant", "success");
                    }}
                    className={`py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer text-center ${
                      activeHomeTab === 'student'
                        ? 'bg-[#0d3e8e] text-white shadow'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    Étudiant
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, opacity: 0.95 }}
                    whileTap={{ scale: 0.95, opacity: 0.85 }}
                    onClick={() => {
                      setActiveHomeTab('trainer');
                      setCurrentPage('home');
                      setMobileMenuOpen(false);
                      triggerNotification("Accès à l'Espace Formateur", "success");
                    }}
                    className={`py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer text-center ${
                      activeHomeTab === 'trainer'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    Formateur
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, opacity: 0.95 }}
                    whileTap={{ scale: 0.95, opacity: 0.85 }}
                    onClick={() => {
                      setActiveHomeTab('admin');
                      setCurrentPage('home');
                      setMobileMenuOpen(false);
                      triggerNotification("Accès à l'Espace Admin", "success");
                    }}
                    className={`py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer text-center ${
                      activeHomeTab === 'admin'
                        ? 'bg-amber-500 text-slate-950 font-black shadow'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    Admin
                  </motion.button>
                </div>

                <div className="space-y-1">
                  {getNavigationLinks().map((item, index, arr) => {
                    const IconComp = item.icon;
                    const isCur = currentPage === item.page;
                    return (
                      <motion.button
                        whileHover={{ scale: 1.02, x: 4, opacity: 0.95 }}
                        whileTap={{ scale: 0.98, opacity: 0.85 }}
                        key={item.name}
                        type="button"
                        onClick={() => {
                          setCurrentPage(item.page as any);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between py-3 px-4 font-bold text-xs ${
                          isCur
                            ? activeHomeTab === 'student' ? 'text-blue-600 dark:text-yellow-400 font-extrabold bg-blue-50/80 dark:bg-yellow-500/10 border-l-4 border-yellow-500 rounded-xl' :
                              activeHomeTab === 'trainer' ? 'text-emerald-600 font-extrabold bg-emerald-500/10 border-l-4 border-emerald-500 rounded-xl' :
                              'text-amber-500 font-extrabold bg-amber-550/10 border-l-4 border-amber-500 rounded-xl'
                            : 'text-slate-700 dark:text-slate-300'
                        } hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                          index !== arr.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <IconComp className={`w-4 h-4 ${isCur ? 'text-current' : 'text-slate-450'}`} />
                          <span>{item.name}</span>
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </motion.button>
                    );
                  })}
                </div>

                {/* Additional Quick Mobile log action */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-850 mt-2 flex items-center justify-between px-4 text-xs font-bold text-slate-500">
                  <span>{isLoggedIn ? `${currentUser?.prenom} ${currentUser?.nom}` : "Profil invité"}</span>
                  {isLoggedIn ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                      className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-2 py-1 rounded font-bold"
                    >
                      Déconnexion
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setShowLoginModal(true); setMobileMenuOpen(false); }}
                      className="text-blue-600 dark:text-yellow-400 hover:underline px-2 py-1 font-bold"
                    >
                      Connexion
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ==================== CORE SCREENS ROUTER WITH LEFT SIDEBAR ==================== */}
      <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* DESKTOP LEFT SIDEBAR - HIDDEN ON HOME PAGE, SHOWN ON STUDENT PAGES */}
        {currentPage !== 'home' && (
          <aside className="hidden lg:flex flex-col w-64 shrink-0 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-6 sticky top-28">
              <div className="space-y-3">
                <span className={`block text-[10px] font-black uppercase tracking-widest ${
                  activeHomeTab === 'student' ? 'text-blue-600 dark:text-yellow-400' :
                  activeHomeTab === 'trainer' ? 'text-emerald-500' :
                  'text-amber-500'
                }`}>
                  {activeHomeTab === 'student' ? '🎓 Espace Étudiant' :
                   activeHomeTab === 'trainer' ? '👨‍🏫 Espace Formateur' :
                   '🛡️ Espace Admin'}
                </span>
                <div className="space-y-1">
                  {getNavigationLinks().map((item) => {
                    const IconComponent = item.icon;
                    const isActive = currentPage === item.page;
                    return (
                      <motion.button
                        whileHover={{ scale: 1.05, x: 4, opacity: 0.95 }}
                        whileTap={{ scale: 0.95, opacity: 0.85 }}
                        key={item.name}
                        onClick={() => setCurrentPage(item.page as any)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                          isActive
                            ? activeHomeTab === 'student' ? 'bg-blue-600/10 text-blue-600 dark:text-yellow-400 border-l-4 border-yellow-500 shadow-sm' :
                              activeHomeTab === 'trainer' ? 'bg-emerald-600/10 text-emerald-600 border-l-4 border-emerald-500 shadow-sm' :
                              'bg-amber-500/10 text-amber-500 border-l-4 border-amber-500 shadow-sm'
                            : 'text-slate-600 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-current' : ''}`} />
                          <span>{item.name}</span>
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Status Info widget */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl space-y-1.5 border border-slate-150 dark:border-slate-850">
                  <span className="block text-[8px] uppercase tracking-wider font-extrabold text-slate-400">Services Cloud</span>
                  <div className="flex items-center justify-between text-[9px] font-bold text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1">
                      <Database className={`w-3 h-3 animate-pulse ${
                        activeHomeTab === 'student' ? 'text-blue-600 dark:text-yellow-400' :
                        activeHomeTab === 'trainer' ? 'text-emerald-500' : 'text-amber-500'
                      }`} />
                      {dbStatus.type === 'MongoDB' ? 'MongoDB Atlas' : 'Stockage Local'}
                    </span>
                    <span className="text-emerald-500">● Synchro</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* CORE CONTAINER FOR SCREENS */}
        <main className="flex-grow w-full max-w-full overflow-hidden">
          <AnimatePresence mode="wait">

        {/* ==================== 1. HOME & ANALYTICS DASHBOARD ==================== */}
        {currentPage === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-12"
          >
            
            {/* Visual Hero Banner - EXTREMELY HIGH FIDELITY REPRODUCTION */}
            <div className="relative rounded-3xl overflow-hidden text-white shadow-2xl">
              <div 
                className="absolute inset-0 bg-cover bg-center brightness-60 scale-105 transition-all duration-700" 
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1400&auto=format&fit=crop')" }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/60"></div>
              
              <div className="relative z-10 px-6 py-20 sm:px-12 sm:py-28 max-w-4xl mx-auto text-center space-y-8">
                <motion.h1 
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                  className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-200 to-yellow-400 cursor-default select-none"
                >
                  Commencer à étudier pour atteindre votre avenir en ligne
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                  className="text-sm sm:text-lg lg:text-xl text-slate-100 max-w-2xl mx-auto font-semibold leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                >
                  Nos programmes variés couvrent de nombreux domaines pour répondre à vos ambitions professionnelles.
                </motion.p>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                  className="pt-6"
                >
                  <motion.button
                    whileHover={{ scale: 1.08, shadow: "0px 0px 15px rgb(245,158,11)" }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setCurrentPage('formations')}
                    className="px-10 py-5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold rounded-xl text-xs sm:text-sm uppercase tracking-wider shadow-lg transition-all duration-150 cursor-pointer border-none"
                  >
                    Voir les formations
                  </motion.button>
                </motion.div>
              </div>
            </div>

            {/* Testimonials Section - EXACT MATCH WITH DEEP COCOA-BROWN STYLED THEMATIC BACKGROUND */}
            <div className="bg-[#3e2d24] rounded-3xl p-8 sm:p-14 text-white shadow-2xl space-y-12">
              <div className="text-center max-w-2xl mx-auto space-y-4">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Ce que disent nos étudiants
                </h2>
                <p className="text-sm sm:text-base text-stone-300 font-medium leading-relaxed">
                  Découvrez comment notre plateforme a transformé leur parcours et leur a permis d'atteindre leurs objectifs.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Testimonial Card 1 */}
                <div className="bg-yellow-50 dark:bg-slate-900 text-slate-805 dark:text-stone-300 rounded-2xl overflow-hidden shadow-xl border-4 border-yellow-450 dark:border-yellow-500/50 flex flex-col h-full hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300">
                  <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                    <p className="text-sm font-semibold italic text-slate-700 dark:text-slate-305 leading-relaxed">
                      "Les formations proposées sont d'une qualité académique exceptionnelle. La flexibilité de l'e-learning m'a permis d'obtenir mon diplôme RNCP d'Administrateur d'Entreprise tout en continuant mon emploi de jour."
                    </p>
                    <div className="border-t border-yellow-200 dark:border-slate-800 pt-4">
                      <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Julie Marquet</h4>
                      <p className="text-[10px] text-[#db6e27] dark:text-yellow-450 font-bold uppercase tracking-widest">Master Administration</p>
                    </div>
                  </div>
                </div>

                {/* Testimonial Card 2 */}
                <div className="bg-yellow-50 dark:bg-slate-900 text-slate-805 dark:text-stone-300 rounded-2xl overflow-hidden shadow-xl border-4 border-yellow-450 dark:border-yellow-500/50 flex flex-col h-full hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300">
                  <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                    <p className="text-sm font-semibold italic text-slate-700 dark:text-slate-305 leading-relaxed">
                      "L'accompagnement par les tuteurs et le suivi de l'assiduité m'ont permis de garder le cap. C'est l'école moderne par excellence, humaine et tournée vers les besoins de l'étudiant à distance."
                    </p>
                    <div className="border-t border-yellow-200 dark:border-slate-800 pt-4">
                      <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Lucas Bernard</h4>
                      <p className="text-[10px] text-[#db6e27] dark:text-yellow-450 font-bold uppercase tracking-widest">Master Ingénierie Logicielle</p>
                    </div>
                  </div>
                </div>

                {/* Testimonial Card 3 */}
                <div className="bg-yellow-50 dark:bg-slate-900 text-slate-805 dark:text-stone-300 rounded-2xl overflow-hidden shadow-xl border-4 border-yellow-450 dark:border-yellow-500/50 flex flex-col h-full hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300">
                  <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                    <p className="text-sm font-semibold italic text-slate-700 dark:text-slate-305 leading-relaxed">
                      "Avoir accès à un tuteur certifié m'a sauvé à de nombreuses reprises sur mes projets complexes en Python et SQL. Les reçus et diplômes scolarité sont signés numériquement et téléchargeables en un clic."
                    </p>
                    <div className="border-t border-yellow-200 dark:border-slate-800 pt-4">
                      <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Marc-Antoine Grela</h4>
                      <p className="text-[10px] text-[#db6e27] dark:text-yellow-450 font-bold uppercase tracking-widest">Licence Informatique</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Counters bar - Cleanly positioned below the Hero/Review showcases */}
            <div className="bg-yellow-50/95 dark:bg-slate-900/90 border border-yellow-200 dark:border-yellow-900 rounded-3xl px-6 py-6 shadow-lg">
              {activeHomeTab === 'student' ? (
                /* Custom student quick counters */
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                  <div className="cursor-pointer hover:opacity-85" onClick={() => setCurrentPage('formations')}>
                    <span className="block text-2xl font-black text-blue-650 dark:text-blue-400">
                      {formations.filter(f => f.enrolled).length}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Mes Cours Inscrits</span>
                  </div>
                  <div className="cursor-pointer hover:opacity-85" onClick={() => setCurrentPage('attendance')}>
                    <span className="block text-2xl font-black text-[#e07a34]">
                      {attendances.length > 0 ? Math.round((attendances.filter(a => a.signed).length / attendances.length) * 100) : 80}%
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Mon Taux d'Assiduité</span>
                  </div>
                  <span className="hidden lg:block h-6 w-px bg-slate-200 dark:bg-slate-800 self-center mx-auto"></span>
                  <div className="cursor-pointer hover:opacity-85" onClick={() => setCurrentPage('receipt')}>
                    <span className="block text-2xl font-black text-emerald-500">
                      {formatAriary(receipts.reduce((sum, r) => sum + r.amount, 0))}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Droits Payés</span>
                  </div>
                </div>
              ) : (
                /* Global administration/visitor counters */
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                  <div className="cursor-pointer hover:opacity-80" onClick={() => setCurrentPage('admission')}>
                    <span className="block text-2xl font-black text-blue-650 dark:text-blue-400">{stats.totalEtudiants}</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Étudiants Actifs</span>
                  </div>
                  <div className="cursor-pointer hover:opacity-80" onClick={() => setCurrentPage('formations')}>
                    <span className="block text-2xl font-black text-[#e07a34]">{formations.length || 5}</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Formations Actives</span>
                  </div>
                  <span className="hidden lg:block h-6 w-px bg-slate-200 dark:bg-slate-800 self-center mx-auto"></span>
                  <div className="cursor-pointer hover:opacity-80" onClick={() => setCurrentPage('payment')}>
                    <span className="block text-2xl font-black text-emerald-500">{formatAriary(stats.totalRevenus)}</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Dotation Globale</span>
                  </div>
                </div>
              )}
            </div>

            {/* --- SELECTION DES ESPACES UNIVERSITAIRES --- */}
            <div className="space-y-6">
              <div className="bg-yellow-50 dark:bg-slate-900 border border-yellow-200 dark:border-yellow-900 rounded-3xl p-3 shadow-md space-y-3 animate-fadeIn">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-4 py-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl">
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#F59E0B] flex items-center gap-1.5 font-sans">
                      <Sparkles className="w-3.5 h-3.5 fill-[#F59E0B]" />
                      Sélecteur d'Espaces Académiques
                    </h3>
                    <p className="text-[10px] text-slate-400 font-semibold font-sans">Basculez entre les espaces Étudiants, Administration et Formateurs</p>
                  </div>
                  <div className="flex flex-wrap gap-2 w-full md:w-auto font-sans">
                    <motion.button
                      whileHover={{ scale: 1.05, opacity: 0.95 }}
                      whileTap={{ scale: 0.95, opacity: 0.85 }}
                      id="home-tab-student"
                      onClick={() => setActiveHomeTab('student')}
                      className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                        activeHomeTab === 'student'
                          ? 'bg-blue-600 text-white font-black shadow-md shadow-blue-500/20'
                          : 'bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Étudiants</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05, opacity: 0.95 }}
                      whileTap={{ scale: 0.95, opacity: 0.85 }}
                      id="home-tab-admin"
                      onClick={() => setActiveHomeTab('admin')}
                      className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                        activeHomeTab === 'admin'
                          ? 'bg-[#F59E0B] text-slate-950 font-black shadow-md shadow-amber-500/20'
                          : 'bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Admin</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05, opacity: 0.95 }}
                      whileTap={{ scale: 0.95, opacity: 0.85 }}
                      id="home-tab-trainer"
                      onClick={() => setActiveHomeTab('trainer')}
                      className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                        activeHomeTab === 'trainer'
                          ? 'bg-emerald-600 text-white font-black shadow-md shadow-emerald-500/20'
                          : 'bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Formateur</span>
                    </motion.button>
                  </div>
                </div>
                
                <div className="px-4 py-1 text-[10px] text-slate-400 font-semibold italic font-sans animate-fadeIn">
                  {activeHomeTab === 'student' && "💡 Espace Étudiant : consultation de vos notes, signature d'émargements et téléchargement de reçus."}
                  {activeHomeTab === 'admin' && "🛡️ Espace Administration : indicateurs financiers globaux, audit d'assiduité et monitoring en temps réel."}
                  {activeHomeTab === 'trainer' && "👨‍🏫 Espace Formateur : feuilles de présences, gestion du planning hebdomadaire et messagerie académique."}
                </div>
              </div>

              {/* --- ESPACE ADMINISTRATEUR RENDERING --- */}
              {activeHomeTab === 'admin' && (
                <>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center py-2 border-b border-slate-200 dark:border-slate-850 gap-2">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">Indicateurs de Pilotage Administrateur</h2>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Performances réelles du portail universitaire</p>
                    </div>
                    <button
                      onClick={fetchDatabaseStatus}
                      className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider border border-slate-250 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 flex items-center gap-2 shadow-sm"
                    >
                      <RefreshCw className="w-3 h-3 text-blue-600" />
                      Synchroniser
                    </button>
                  </div>

                  {/* Graphical distribution section */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Chart 1: Monthly registration baseline area chart */}
                    <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-[#F59E0B]">Flux mensuel</span>
                      <p className="text-sm font-black text-slate-700 dark:text-white">Inscriptions et Candidats</p>
                      <div className="h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={monthlyData}>
                            <defs>
                              <linearGradient id="colorInscr" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                            <Tooltip />
                            <Area type="monotone" dataKey="Inscriptions" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorInscr)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Chart 2: Departments donut chart */}
                    <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-blue-600">Effectifs d'études</span>
                      <p className="text-sm font-black text-slate-700 dark:text-white">Répartition par Filière</p>
                      <div className="h-56 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={departmentData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {departmentData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-1.5 shrink-0 pl-1">
                          {departmentData.map((dept, i) => (
                            <div key={dept.name} className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i] }}></span>
                              <span>{dept.name} : {dept.value}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Chart 3: Success Bar Rate */}
                    <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-emerald-500">Progression</span>
                      <p className="text-sm font-black text-slate-700 dark:text-white">Milestones et Certifications</p>
                      <div className="h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { label: 'Projets code', taux: 85 },
                            { label: 'Gestion d\'aff.', taux: 70 },
                            { label: 'Droit civil', taux: 92 },
                            { label: 'Marketing ads', taux: 60 }
                          ]}>
                            <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} tickLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                            <Tooltip />
                            <Bar dataKey="taux" fill="#F59E0B" radius={[8, 8, 0, 0]} barSize={32} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                  </div>
                </>
              )}

              {/* --- ESPACE ETUDIANTS RENDERING --- */}
              {activeHomeTab === 'student' && (
                <>
                  {currentUser ? (
                    // Safe, beautiful personalized Student Home space
                    <div className="space-y-6 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center py-2 border-b border-slate-200 dark:border-slate-850 gap-2">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">Mon Espace d'Apprentissage</h2>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Suivi de votre scolarité & avancement individuel</p>
                    </div>
                    <div className="text-xs bg-blue-50/55 dark:bg-blue-950/20 text-blue-600 dark:text-yellow-400 px-3 py-1.5 rounded-full font-bold">
                      Rôle étudiant : Inscrit
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Personal Attendance card */}
                    <motion.div 
                      whileHover={{ scale: 1.03, opacity: 0.95 }}
                      whileTap={{ scale: 0.97, opacity: 0.85 }}
                      onClick={() => setCurrentPage('attendance')}
                      className="p-6 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/30 rounded-3xl shadow-sm space-y-4 cursor-pointer transition-all"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#F59E0B]">Mon Émargement</span>
                        <span className="p-1 px-2.5 rounded bg-[#F59E0B]/10 text-[#F59E0B] text-[9px] font-extrabold uppercase">80% Assiduité</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-black text-slate-800 dark:text-white">
                          {attendances.filter(a => a.signed).length} / {attendances.length || 3}
                        </p>
                        <p className="text-[11px] text-slate-400 font-semibold">Séances de cours validées</p>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-850 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#F59E0B] h-full rounded-full" 
                          style={{ width: `${attendances.length > 0 ? (attendances.filter(a => a.signed).length / attendances.length) * 100 : 80}%` }}
                        ></div>
                      </div>
                    </motion.div>

                    {/* Personal Payments card */}
                    <motion.div 
                      whileHover={{ scale: 1.03, opacity: 0.95 }}
                      whileTap={{ scale: 0.97, opacity: 0.85 }}
                      onClick={() => setCurrentPage('receipt')}
                      className="p-6 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/30 rounded-3xl shadow-sm space-y-4 cursor-pointer transition-all"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#10B981]">Mes Frais</span>
                        <span className="p-1 px-2.5 rounded bg-[#10B981]/10 text-[#10B981] text-[9px] font-extrabold uppercase">Acquitté</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-black text-slate-800 dark:text-white">
                          {formatAriary(receipts.reduce((sum, r) => sum + r.amount, 0))}
                        </p>
                        <p className="text-[11px] text-slate-400 font-semibold">Frais scolarité soldés</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase hover:text-blue-600 dark:hover:text-yellow-400 transition-colors">
                        <span>Consulter mes reçus PDF</span>
                        <span>→</span>
                      </div>
                    </motion.div>

                    {/* Quick welcome block */}
                    <div className="p-6 bg-gradient-to-br from-blue-700 to-blue-950 text-white rounded-3xl shadow-sm space-y-3 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <h4 className="font-extrabold text-sm uppercase text-yellow-400">Bonjour, {currentUser.prenom} !</h4>
                        <p className="text-xs text-slate-200 leading-relaxed font-medium">
                          Bienvenue sur votre portail d'enseignement. Vous pouvez de manière autonome consulter vos plannings, signer vos présences sous l'onglet Émargement, ou télécharger vos reçus de droits d'inscription.
                        </p>
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.05, opacity: 0.95 }}
                        whileTap={{ scale: 0.95, opacity: 0.85 }}
                        onClick={() => setCurrentPage('formations')}
                        className="w-full py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-extrabold text-[10px] tracking-wider uppercase rounded-xl transition-all"
                      >
                        S'inscrire à une formation
                      </motion.button>
                    </div>
                  </div>
                </div>
              ) : (
                // Visitor welcoming and login call-to-action
                <div className="p-8 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded-3xl text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-650 dark:text-yellow-400 flex items-center justify-center text-lg mx-auto shadow-sm">
                    🔒
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Portail Accrédité Sécurisé</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                      Vous naviguez actuellement en tant que visiteur anonyme. Authentifiez-vous pour suivre activement vos cours d'ingénierie RNCP, émarger vos fiches de présence et télécharger vos pièces comptables.
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05, opacity: 0.95 }}
                    whileTap={{ scale: 0.95, opacity: 0.85 }}
                    onClick={() => setShowLoginModal(true)}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-transform duration-100"
                  >
                    Se connecter à l'université
                  </motion.button>
                </div>
              )}
            </>
          )}

          {/* --- ESPACE FORMATEUR RENDERING --- */}
          {activeHomeTab === 'trainer' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center py-2 border-b border-slate-200 dark:border-slate-850 gap-2">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white font-sans">Espace d'Enseignement Formateur</h2>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-sans">Plan de cours, cahier de texte & suivi de présences de vos classes</p>
                </div>
                <div className="text-xs bg-emerald-50/55 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full font-bold">
                  Rôle Formateur : Enseignant Référent
                </div>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-2">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-[#F59E0B]">Volume Horaire</span>
                  <p className="text-2xl font-black text-slate-800 dark:text-white font-sans">124 h</p>
                  <p className="text-[11px] text-slate-400 font-semibold font-sans">Assurées cette année académique</p>
                </div>
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-2">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-emerald-500">Taux d'Assiduité</span>
                  <p className="text-2xl font-black text-emerald-500 font-sans">89.2%</p>
                  <p className="text-[11px] text-slate-400 font-semibold font-sans">Présence moyenne enregistrée</p>
                </div>
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-2">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-blue-500">Formations assignées</span>
                  <p className="text-2xl font-black text-slate-800 dark:text-white font-sans">3 Modules</p>
                  <p className="text-[11px] text-slate-400 font-semibold font-sans">Certifications RNCP accréditées</p>
                </div>
                <div className="p-5 bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-2xl shadow-sm space-y-2">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-emerald-250 font-sans">Tuteur IA Assistant</span>
                  <p className="text-lg font-bold flex items-center gap-1 font-sans">Prof. Martin <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /></p>
                  <p className="text-[10px] text-emerald-100 font-semibold font-sans">Assistant de jour & nuit opérationnel</p>
                </div>
              </div>

              {/* Teaching schedules and sign buttons */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* List of active courses for today / this week */}
                <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-5">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800 dark:text-white font-sans">Mes Sessions & Émargements d'Aujourd'hui</h3>
                    <p className="text-[11px] text-slate-400 font-semibold font-sans">Valisez d'un clic les feuilles de présences obligatoires</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { id: 'c1', title: 'Conception Web (React)', hours: '09:00 - 12:00', room: 'Amphi d\'E-learning', count: 15, dept: 'Informatique' },
                      { id: 'c2', title: 'Sciences des Données (Python & ML)', hours: '14:00 - 16:30', room: 'Salle 301 - Lab d\'excellence', count: 8, dept: 'Informatique' },
                      { id: 'c3', title: 'Droit Civil des Affaires', hours: '11:00 - 13:00', room: 'Visioconférence En Direct', count: 22, dept: 'Droit civil' },
                    ].map((course) => {
                      const isSigned = signedTrainerCourses.includes(course.id);
                      return (
                        <div key={course.id} className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-200 dark:hover:border-slate-800 transition-all">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-650 dark:text-yellow-400 text-[9px] font-black uppercase tracking-wide font-sans">
                                {course.dept}
                              </span>
                              <span className="text-[11px] font-bold text-slate-450 dark:text-slate-400 font-sans">{course.hours}</span>
                            </div>
                            <h4 className="font-extrabold text-sm text-slate-800 dark:text-white font-sans">{course.title}</h4>
                            <p className="text-xs text-slate-400 font-semibold font-sans">{course.room} • {course.count} étudiants inscrits</p>
                          </div>

                          <div className="flex items-center gap-2 self-stretch sm:self-auto">
                            {isSigned ? (
                              <span className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-3 py-2 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] tracking-wider uppercase rounded-xl font-sans">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Fiche signée
                              </span>
                            ) : (
                              <motion.button
                                whileHover={{ scale: 1.05, opacity: 0.95 }}
                                whileTap={{ scale: 0.95, opacity: 0.85 }}
                                onClick={() => {
                                  setSignedTrainerCourses(prev => [...prev, course.id]);
                                  triggerNotification(`Feuille de présence validée et signée pour le cours de "${course.title}" !`, 'success');
                                  // Simulate automatically appending an attendance record
                                  const newRecord: AttendanceRecord = {
                                    id: `sim-${Date.now()}`,
                                    userId: currentUser?.id || 'demo-stud',
                                    userName: currentUser ? `${currentUser.prenom} ${currentUser.nom}` : 'Julie Marquet',
                                    courseTitle: course.title,
                                    date: new Date().toLocaleDateString('fr-FR'),
                                    status: 'present',
                                    signed: true,
                                    timeSigned: new Date().toLocaleTimeString('fr-FR')
                                  };
                                  setAttendances(prev => [newRecord, ...prev]);
                                }}
                                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] tracking-wider uppercase rounded-xl cursor-pointer animate-fadeIn font-sans"
                              >
                                Émarger le cours
                              </motion.button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick message center / actions for tutors */}
                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-800 dark:text-white font-sans">Questions & Correspondence</h3>
                      <p className="text-[11px] text-slate-400 font-semibold font-sans">Communiquez avec vos étudiants et accédez au tutorat par IA</p>
                    </div>

                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl space-y-2">
                      <p className="text-xs font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-1.5 uppercase font-sans">
                        <Sparkles className="w-3.5 h-3.5 shrink-0 animate-spin" /> Copilote Enseignement IA
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-350 leading-relaxed font-semibold font-sans">
                        Générez des examens types ou révisez les livrables d'alternance. Discutez instantanément dans l'espace d'échange académique.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-sans">Questions en attente</p>
                      <div className="p-3 bg-slate-50 dark:bg-slate-950/30 rounded-xl space-y-1">
                        <p className="text-[11px] font-black text-slate-700 dark:text-slate-200 font-sans animate-fadeIn">Julie Marquet (étudiante L3) :</p>
                        <p className="text-xs text-slate-450 italic font-medium font-sans">"Monsieur, quand devons-nous rendre le livrable du projet d'ingénierie logiciel ?"</p>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05, opacity: 0.95 }}
                    whileTap={{ scale: 0.95, opacity: 0.85 }}
                    id="trainer-open-chatIA-btn"
                    onClick={() => {
                      setCurrentPage('chat');
                      triggerNotification("Redirection vers le centre de tutorat IA.", "info");
                    }}
                    className="w-full mt-4 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-extrabold text-[10px] tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 cursor-pointer font-sans"
                  >
                    <MessageSquare className="w-4 h-4 text-[#F59E0B]" />
                    Répondre dans le Chat IA
                  </motion.button>
                </div>
              </div>
            </div>
          )}
        </div>

            {/* Core Values / Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-2xl space-y-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-600 flex items-center justify-center font-bold">
                  🎓
                </div>
                <h4 className="font-extrabold text-sm uppercase text-slate-700 dark:text-slate-100">Cursus Diplômants d'État</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  EDUOnline opère à l'appui de référentiels RNCP vérifiables. Décrochez un diplôme en alternance ou initiale de bac+3 à bac+5.
                </p>
              </div>

              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-2xl space-y-3">
                <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-slate-800 text-amber-500 flex items-center justify-center font-bold">
                  🤖
                </div>
                <h4 className="font-extrabold text-sm uppercase text-slate-700 dark:text-slate-100">Tuteur Référent par IA</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Interrogez Prof. Martin ou Prof. Dubois sur l'agenda ou les concepts techniques. Alimentés par Gemini 3.5, ils répondent de jour comme de nuit.
                </p>
              </div>

              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-2xl space-y-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-slate-800 text-emerald-500 flex items-center justify-center font-bold">
                  📱
                </div>
                <h4 className="font-extrabold text-sm uppercase text-slate-700 dark:text-slate-100">Notifications SMS Réelles</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Simulez la réception de notifications par message sur votre téléphone dès qu'un versement est effectué ou qu'une candidature est approuvée.
                </p>
              </div>
            </div>

          </motion.div>
        )}

        {/* ==================== 2. ADMISSION EN LIGNE (WIZARD STEPS) ==================== */}
        {currentPage === 'admission' && (
          <motion.div
            key="admission"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-black tracking-tight">Admission en Ligne</h1>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Renseignez votre dossier scolaire en quelques clics</p>
            </div>

            {/* Stepper Wizard Bar */}
            <div className="relative flex justify-between items-center max-w-xl mx-auto py-2">
              <div className="absolute left-10 right-10 top-1/2 h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0"></div>
              
              <button
                onClick={() => setAdmissionStep(1)}
                className={`relative z-10 h-10 w-10 rounded-full font-bold flex items-center justify-center text-xs transition-colors duration-200 cursor-pointer ${
                  admissionStep >= 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-200 text-slate-400 dark:bg-slate-800'
                }`}
              >
                1
              </button>
              <button
                onClick={() => {
                  if (candNom && candPrenom && candEmail && candPhone) setAdmissionStep(2);
                  else triggerNotification('Complétez d\'abord vos coordonnées.', 'warning');
                }}
                className={`relative z-10 h-10 w-10 rounded-full font-bold flex items-center justify-center text-xs transition-colors duration-200 cursor-pointer ${
                  admissionStep >= 2 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-200 text-slate-400 dark:bg-slate-800'
                }`}
              >
                2
              </button>
              <button
                onClick={() => {
                  if (candNom && candPrenom && candEmail && candPhone) setAdmissionStep(3);
                  else triggerNotification('Complétez d\'abord vos coordonnées.', 'warning');
                }}
                className={`relative z-10 h-10 w-10 rounded-full font-bold flex items-center justify-center text-xs transition-colors duration-200 cursor-pointer ${
                  admissionStep === 3 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-200 text-slate-400 dark:bg-slate-800'
                }`}
              >
                3
              </button>
            </div>

            {/* Active wizard panels card */}
            <form onSubmit={handleAdmissionSubmit} className="bg-slate-950 border-2 border-yellow-500/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl text-yellow-300">
              
              {/* Step 1: Informations Personnelles */}
              {admissionStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-black border-b border-yellow-500/30 pb-2 text-yellow-400">Informations Personnelles</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-yellow-350 uppercase tracking-widest">Votre Nom *</label>
                      <input
                        type="text"
                        value={candNom}
                        onChange={(e) => setCandNom(e.target.value)}
                        placeholder="Grela"
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-yellow-500/40 bg-slate-900 text-yellow-100 placeholder-slate-500 focus:ring-2 focus:ring-yellow-400 outline-none font-medium"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-yellow-350 uppercase tracking-widest">Votre Prénom *</label>
                      <input
                        type="text"
                        value={candPrenom}
                        onChange={(e) => setCandPrenom(e.target.value)}
                        placeholder="Jacquecin"
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-yellow-500/40 bg-slate-900 text-yellow-100 placeholder-slate-500 focus:ring-2 focus:ring-yellow-400 outline-none font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-yellow-350 uppercase tracking-widest">Adresse Courriel *</label>
                      <input
                        type="email"
                        value={candEmail}
                        onChange={(e) => setCandEmail(e.target.value)}
                        placeholder="jacquecingrelae@gmail.com"
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-yellow-500/40 bg-slate-900 text-yellow-100 placeholder-slate-500 focus:ring-2 focus:ring-yellow-400 outline-none mb-1 font-medium"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-yellow-350 uppercase tracking-widest">Téléphone Mobile (Avis SMS) *</label>
                      <input
                        type="tel"
                        value={candPhone}
                        onChange={(e) => setCandPhone(e.target.value)}
                        placeholder="+33 6 ..."
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-yellow-500/40 bg-slate-900 text-yellow-100 placeholder-slate-500 focus:ring-2 focus:ring-yellow-400 outline-none font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-yellow-350 uppercase tracking-widest">Filière d'excellence envisagée *</label>
                    <select
                      value={candProgram}
                      onChange={(e) => setCandProgram(e.target.value)}
                      className="w-full px-4 py-3 text-sm rounded-xl border border-yellow-500/40 bg-slate-900 text-yellow-300 outline-none font-black text-xs uppercase tracking-wider block"
                    >
                      <option value="informatique">💻 Informatique & Génie Logiciel</option>
                      <option value="gestion">📊 Management & Administration</option>
                      <option value="droit">⚖️ Droit Fiscal & Affaires</option>
                      <option value="marketing">📱 Marketing Digital & Ads</option>
                    </select>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (candNom && candPrenom && candEmail && candPhone) setAdmissionStep(2);
                        else triggerNotification('Saisissez tous les renseignements requis.', 'warning');
                      }}
                      className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-extrabold rounded-xl text-xs uppercase tracking-widest shadow cursor-pointer transition-transform duration-100 active:scale-95"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Documents justificatifs */}
              {admissionStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-black border-b border-yellow-500/30 pb-2 text-yellow-400">Documents Justificatifs</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border-2 border-dashed border-yellow-500/40 bg-slate-900 hover:border-yellow-400 text-center space-y-2 cursor-pointer transition-all">
                      <div className="text-2xl">🪪</div>
                      <p className="text-xs font-bold uppercase text-yellow-300">Carte d'Identité / Passeport</p>
                      <label className="block">
                        <span className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-slate-950 text-[10px] font-bold uppercase rounded cursor-pointer">Parcourir</span>
                        <input
                          type="file"
                          onChange={(e) => setCandDocIdCard(e.target.files ? e.target.files[0] : null)}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] font-bold text-yellow-400 truncate">{candDocIdCard ? `✅ ${candDocIdCard.name}` : "Aucun fichier"}</p>
                    </div>

                    <div className="p-4 rounded-xl border-2 border-dashed border-yellow-500/40 bg-slate-900 hover:border-yellow-400 text-center space-y-2 cursor-pointer transition-all">
                      <div className="text-2xl">🎓</div>
                      <p className="text-xs font-bold uppercase text-yellow-300">Dernier diplôme</p>
                      <label className="block">
                        <span className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-slate-950 text-[10px] font-bold uppercase rounded cursor-pointer">Parcourir</span>
                        <input
                          type="file"
                          onChange={(e) => setCandDocDiploma(e.target.files ? e.target.files[0] : null)}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] font-bold text-yellow-400 truncate">{candDocDiploma ? `✅ ${candDocDiploma.name}` : "Aucun fichier"}</p>
                    </div>

                    <div className="p-4 rounded-xl border-2 border-dashed border-yellow-500/40 bg-slate-900 hover:border-yellow-400 text-center space-y-2 cursor-pointer transition-all">
                      <div className="text-2xl">📷</div>
                      <p className="text-xs font-bold uppercase text-yellow-300">Photo d’identité</p>
                      <label className="block">
                        <span className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-slate-950 text-[10px] font-bold uppercase rounded cursor-pointer">Parcourir</span>
                        <input
                          type="file"
                          onChange={(e) => setCandDocPhoto(e.target.files ? e.target.files[0] : null)}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] font-bold text-yellow-400 truncate">{candDocPhoto ? `✅ ${candDocPhoto.name}` : "Aucun fichier"}</p>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setAdmissionStep(1)}
                      className="px-6 py-3 border border-yellow-500/40 text-yellow-300 font-bold rounded-xl text-xs uppercase tracking-widest cursor-pointer hover:bg-slate-900"
                    >
                      Retour
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (candDocIdCard || candDocDiploma) setAdmissionStep(3);
                        else triggerNotification('Fournissez au moins votre carte d\'identité ou diplôme.', 'warning');
                      }}
                      className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-extrabold rounded-xl text-xs uppercase tracking-widest shadow cursor-pointer transition-transform duration-100 active:scale-95"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Confirmation récapitulative */}
              {admissionStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-black border-b border-yellow-500/30 pb-2 text-yellow-400">Récapitulatif & Engagement</h3>
                  
                  <div className="p-4 rounded-2xl bg-slate-900 border border-yellow-500/30 space-y-2 text-xs font-semibold text-yellow-250">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Candidat :</span>
                      <strong className="text-yellow-300">{candNom} {candPrenom}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Email :</span>
                      <strong className="text-yellow-300">{candEmail}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Téléphone de contact :</span>
                      <strong className="text-yellow-300">{candPhone}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Programme choisi :</span>
                      <strong className="text-yellow-400 font-extrabold uppercase tracking-widest">{candProgram} (Licence 3)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Paiement Scolaire requis :</span>
                      <strong className="text-yellow-400 font-black">{formatAriary(4300)} / an</strong>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-yellow-500/30 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0" />
                    <div>
                      <p className="text-xs font-black text-yellow-400">Avis d'Intégrité Scolaire</p>
                      <p className="text-[11px] text-yellow-200 leading-relaxed font-semibold mt-0.5">
                        Toute fausse déclaration ou falsification de dossier scolarité entraîne l'expulsion immédiate de nos portails universitaires ainsi que des poursuites civiles d'État.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="acceptTermsChk"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="h-4 w-4 rounded border-yellow-500 text-yellow-500 focus:ring-yellow-400 bg-slate-900 cursor-pointer"
                      required
                    />
                    <label htmlFor="acceptTermsChk" className="text-xs text-yellow-300 font-semibold cursor-pointer select-none">
                      Je certifie authentiques l'ensemble des documents scolaires fournis.
                    </label>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setAdmissionStep(2)}
                      className="px-6 py-3 border border-yellow-500/40 text-yellow-300 font-bold rounded-xl text-xs uppercase tracking-widest cursor-pointer hover:bg-slate-900"
                    >
                      Retour
                    </button>
                    <button
                      type="submit"
                      disabled={!acceptTerms}
                      className="px-8 py-3.5 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest shadow cursor-pointer transition-transform duration-100 active:scale-95"
                    >
                      Soumettre mon Dossier
                    </button>
                  </div>
                </div>
              )}
            </form>
          </motion.div>
        )}

        {/* ==================== 3. CATALOGUE DE FORMATIONS & VIDÉO MOUNT ==================== */}
        {currentPage === 'formations' && (
          <motion.div
            key="formations"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row justify-between sm:items-center py-2 border-b border-slate-200 dark:border-slate-850 gap-4">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">Catalogue de Formations</h1>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">S'inscrire et intégrer les modules fondamentaux</p>
              </div>
              
              {/* Dynamic Course insertion with beautiful modal */}
              <button
                onClick={() => setShowAddCourseModal(true)}
                className="px-4 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-1 shadow-md shadow-amber-500/10"
              >
                <PlusCircle className="w-4 h-4 shrink-0" />
                Matière Académique +
              </button>
            </div>

            {/* Visual filtering block */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-455">Filière:</span>
              <button
                onClick={() => setFilterDept('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                  filterDept === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-200'
                }`}
              >
                Toutes
              </button>
              <button
                onClick={() => setFilterDept('informatique')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                  filterDept === 'informatique' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-200'
                }`}
              >
                💻 Informatique
              </button>
              <button
                onClick={() => setFilterDept('gestion')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                  filterDept === 'gestion' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-200'
                }`}
              >
                📊 Management
              </button>
              <button
                onClick={() => setFilterDept('droit')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                  filterDept === 'droit' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-200'
                }`}
              >
                ⚖️ Droit
              </button>
              <button
                onClick={() => setFilterDept('marketing')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                  filterDept === 'marketing' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-200'
                }`}
              >
                📱 Marketing
              </button>
            </div>

            {/* Courses grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedCourses.map((f, idx) => {
                const globalProgress = f.modules ? Math.round(f.modules.reduce((sum, m) => sum + m.progression, 0) / f.modules.length) : 0;
                return (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(idx * 0.06, 0.6) }}
                    className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-500/50 dark:hover:border-blue-500/30 transition-all duration-200 group"
                  >
                    <div className="h-44 bg-gradient-to-br from-blue-700 via-indigo-900 to-slate-800 flex items-center justify-center text-5xl relative">
                      <span>{f.image || '📖'}</span>
                      <span className="absolute top-3 right-3 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-slate-900/40 text-slate-300 rounded">
                        {f.niveau}
                      </span>
                    </div>

                    <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">{f.categorie}</span>
                        <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm group-hover:text-blue-600 transition-colors">{f.titre}</h3>
                        <p className="text-xs text-slate-450 dark:text-slate-400 line-clamp-3 leading-relaxed">{f.description}</p>
                      </div>

                      {/* Course specific progress */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                          <span>Compréhension globale</span>
                          <span className="text-slate-800 dark:text-white">{globalProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[#F59E0B] h-full" style={{ width: `${globalProgress}%` }}></div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs font-semibold pt-1">
                        <div>
                          <span className="block text-slate-400 text-[10px] uppercase font-bold">Dotation annuelle</span>
                          <span className="text-emerald-500 font-extrabold text-sm">{formatAriary(f.prix)}</span>
                        </div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">{f.duree}</span>
                      </div>

                      {/* Video portal activation trigger */}
                      <button
                        onClick={() => {
                          if (!isLoggedIn) {
                            triggerNotification('Veuillez vous authentifier pour accéder aux cours.', 'warning');
                            setShowLoginModal(true);
                            return;
                          }
                          setActiveVideoCourse(f);
                          // Default setting active video chapter as 1st element
                          setSelectedVideoUrl('https://samplelib.com/lib/preview/mp4/sample-5s.mp4');
                          setSelectedVideoTitle(f.modules[0]?.nom || 'Séquence Introduction');
                          setVideoPlayOverlay(true);
                        }}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer shadow-md transition-all duration-100 active:scale-98"
                      >
                        Lancer le Cours (Vidéo)
                      </button>

                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ==================== 4. SUIVI DU DOSSIER & CERTIFICAT GENERATION ==================== */}
        {currentPage === 'candidature' && (
          <motion.div
            key="candidature"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl mx-auto space-y-8"
          >
            {activeHomeTab === 'admin' ? (
              // ADMIN VIEW OF CANDIDATURES
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center py-2 border-b border-slate-200 dark:border-slate-850 gap-4">
                  <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">Gestion des Candidatures</h1>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Espace Administration des dossiers d'admission</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-xs text-blue-600 dark:text-blue-300 leading-relaxed font-semibold">
                  🛡️ En tant qu'administrateur, vous disposez d'un accès de contrôle exclusif pour valider ou rejeter les candidatures soumises par les étudiants. Les étudiants n'ont pas accès à ces contrôles administratifs.
                </div>

                {/* Search & Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Dossiers Reçus</span>
                    <strong className="text-xl font-black text-slate-800 dark:text-white">{allCandidatures.length}</strong>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">En attente</span>
                    <strong className="text-xl font-black text-amber-500">
                      {allCandidatures.filter(c => c.statut === 'en_attente' || (c.statut as string) === 'pending' || !c.statut).length}
                    </strong>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Admis</span>
                    <strong className="text-xl font-black text-emerald-500">
                      {allCandidatures.filter(c => c.statut === 'admis').length}
                    </strong>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Refusés</span>
                    <strong className="text-xl font-black text-rose-500">
                      {allCandidatures.filter(c => c.statut === 'refuse').length}
                    </strong>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                  <div className="px-6 py-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="font-extrabold text-sm">Liste des Candidatures d'Admission</h3>
                  </div>

                  <div className="divide-y divide-slate-150 dark:divide-slate-850">
                    {allCandidatures.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 italic text-xs font-semibold">
                        Aucun dossier de candidature soumis pour le moment.
                      </div>
                    ) : (
                      allCandidatures.map((cand) => (
                        <div key={cand.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-sm text-slate-800 dark:text-white">{cand.prenom} {cand.nom}</span>
                              <span className="text-[10px] text-slate-400">📅 Reçu le {cand.date || '30-06-2026'}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{cand.email}</p>
                            <div className="pt-1 flex flex-wrap gap-2">
                              <span className="px-2 py-0.5 rounded text-[9px] bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-bold uppercase">
                                Filière : {cand.formation}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[9px] bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300 font-bold uppercase">
                                Niveau : {cand.niveau}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider ${
                              cand.statut === 'admis' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
                              cand.statut === 'refuse' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400' :
                              'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                            }`}>
                              {cand.statut === 'admis' ? 'Admis' : cand.statut === 'refuse' ? 'Refusé' : 'En attente'}
                            </span>

                            <div className="flex gap-1.5">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={cand.statut === 'admis'}
                                onClick={() => handleUpdateCandidatureStatus(cand.id, 'admis')}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-[10px] uppercase rounded-lg transition-colors cursor-pointer"
                              >
                                Accepter
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={cand.statut === 'refuse'}
                                onClick={() => handleUpdateCandidatureStatus(cand.id, 'refuse')}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold text-[10px] uppercase rounded-lg transition-colors cursor-pointer"
                              >
                                Refuser
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // STUDENT VIEW (THE CONFIDENTIAL TRACKER)
              <>
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">Suivi de Candidature</h1>
                  <p className="text-xs text-slate-450 uppercase tracking-widest font-bold">Consultez l'état de votre dossier d'inscription</p>
                </div>

                {/* Interactive tracker timeline */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl relative">
                  <div className="hidden md:block absolute left-12 right-12 top-[34px] h-1.5 bg-slate-100 dark:bg-slate-850 z-0"></div>

                  {['Candidature', 'Admission', 'Inscription', 'Formation', 'Certificat'].map((step, idx) => {
                    const isCompleted = idx < trackerProgress;
                    const isActive = idx === trackerProgress;
                    return (
                      <div
                        key={step}
                        onClick={() => handleTrackerStepClick(idx)}
                        className="relative z-10 flex flex-col items-center text-center space-y-2 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-850/50 cursor-pointer transition-all duration-150"
                      >
                        <div className={`h-11 w-11 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-250 ${
                          isCompleted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                          isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 animate-pulse' :
                          'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}>
                          {isCompleted ? <Check className="w-5 h-5" /> : idx + 1}
                        </div>

                        <div className="space-y-0.5">
                          <p className="text-xs font-black">{step}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {isCompleted ? "Confirmé" : isActive ? "En cours..." : "En attente"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Interactive Certificate generator block */}
                <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#F59E0B]/10 to-blue-600/5 border border-[#F59E0B]/20 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-2 text-center md:text-left">
                    <h3 className="text-lg font-extrabold text-[#F59E0B] flex items-center justify-center md:justify-start gap-1.5">
                      <Award className="w-5 h-5 shrink-0" />
                      Génération Académique de Diplôme
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-350 leading-relaxed font-semibold max-w-lg">
                      Si vous avez achevé l'intégralité de vos modules d'études à 100%, vous êtes déclaré éligible à la collation d'État. Imprimez votre diplôme d'excellence EDUOnline.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (trackerProgress < 4) {
                        setTrackerProgress(4);
                        safeStorage.setItem('edu_online_tracker', '4');
                      }
                      setShowCertificateModal(true);
                    }}
                    className="px-6 py-3 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 text-xs font-extrabold uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/10 shrink-0 cursor-pointer transition-transform duration-100 active:scale-95"
                  >
                    Générer Certificat
                  </button>
                </div>

                {/* Bottom help desk details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl">
                    <h4 className="font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">Statut de mon inscription</h4>
                    {studentCandidatures.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3">Aucune demande d'inscription active pour ce compte étudiant.</p>
                    ) : (
                      studentCandidatures.map((cand) => (
                        <div key={cand.id} className="text-xs space-y-2">
                          <div className="flex justify-between font-bold">
                            <span>Filière d'affectation :</span>
                            <span className="text-blue-600 uppercase font-black">{cand.formation}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Niveau universitaire admis :</span>
                            <span className="font-semibold text-slate-600 dark:text-slate-300">{cand.niveau}</span>
                          </div>
                          <div className="flex justify-between items-center pt-1.5">
                            <span>L'avis de scolarité :</span>
                            <span className="px-2 py-0.5 rounded uppercase font-extrabold text-[9px] bg-blue-600/10 text-blue-600">Dossier reçu</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-5 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">Scolarité d'excellence</h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                        Votre tuteur d'étude EDUOnline suit au jour le jour les validations de vos modules. Pour toute requête administrative ou changement de filière, ouvrez la cellule de discussion.
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentPage('chat')}
                      className="w-full text-center py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider mt-4"
                    >
                      Contacter le support
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* ==================== 5. CHAT SYSTEM VIA SERVER PROXY (GEMINI AI ACTIVE) ==================== */}
        {currentPage === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="h-[600px] flex flex-col md:flex-row rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 shadow-xl"
          >
            
            {/* Contacts list */}
            <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-950/40 border-r border-slate-200 dark:border-slate-800 shrink-0 flex flex-col">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400">Canal de Tutorat</span>
              </div>
              <div className="flex-grow overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850">
                {chatContacts.map((c) => (
                  <div
                    key={c.name}
                    onClick={() => setActiveContact(c.name)}
                    className={`p-4 flex items-center justify-between cursor-pointer transition-all ${
                      activeContact === c.name ? 'bg-blue-600/5 border-l-4 border-blue-600' : 'hover:bg-slate-100/50 dark:hover:bg-slate-850/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-blue-600 text-[#F59E0B] font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                        {c.name.charAt(5) || c.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate">{c.name}</span>
                        <p className="text-[10px] text-slate-400 truncate font-semibold mt-0.5">{c.topic}</p>
                      </div>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat discussion center */}
            <div className="flex- grow flex flex-col justify-between bg-slate-50 dark:bg-slate-900/10 w-full min-w-0">
              
              {/* Active Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Tutorat avec {activeContact}</h4>
                  <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest block">🟢 Tuteur en Ligne</span>
                </div>
                <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 dark:bg-slate-800 text-[10px] text-blue-600 dark:text-blue-400 font-black tracking-widest uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gemini AI</span>
                </div>
              </div>

              {/* Chat messages listing */}
              <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages
                  .filter((m) => m.senderName === activeContact || m.receiverName === activeContact)
                  .map((m) => {
                    const isUser = m.senderRole === 'student';
                    return (
                      <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs font-medium space-y-1 shadow-sm leading-relaxed ${
                          isUser ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none'
                        }`}>
                          <div className="flex justify-between gap-4 text-[9px] font-bold opacity-60">
                            <span>{m.senderName}</span>
                            <span>{new Date(m.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                        </div>
                      </div>
                    );
                  })}
                
                {isAiTyping && (
                  <div className="flex justify-start">
                    <div className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 text-[10px] text-slate-400 font-bold flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F59E0B] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F59E0B]"></span>
                      </span>
                      <span>{activeContact} formule des suggestions d'IA...</span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef}></div>
              </div>

              {/* Message inputs */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={`Posez vos questions de devoirs en français à ${activeContact}...`}
                  className="flex-grow px-4 py-2.5 rounded-xl border border-blue-450 outline-none bg-blue-100 dark:bg-blue-100 text-xs text-black dark:text-black placeholder-blue-700/70 focus:bg-blue-200"
                  disabled={isAiTyping}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || isAiTyping}
                  className="px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow cursor-pointer transition-transform duration-100 active:scale-95 flex items-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

            </div>

          </motion.div>
        )}

        {/* ==================== 6. FRAIS DE SCOLARITÉ & FACTURATION SÉCURISÉE ==================== */}
        {currentPage === 'payment' && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl mx-auto space-y-8"
          >
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">Droits Scolaires & Annuité</h1>
              <p className="text-xs text-slate-450 uppercase tracking-widest font-bold">Régularisation des dépenses scolaires avec envoi SMS interactif</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Tuition ledger split */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl space-y-6 shadow-xl">
                <h3 className="text-md font-bold flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <FileText className="w-4.5 h-4.5 text-[#F59E0B]" />
                  Récapitulatif de Facturation d'Études
                </h3>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-430 space-y-3">
                  <div className="flex justify-between pt-1">
                    <span>Frais administratifs de scolarité (annuels)</span>
                    <strong className="text-slate-800 dark:text-white">{formatAriary(3500)}</strong>
                  </div>
                  <div className="flex justify-between pt-3">
                    <span>Inscription & Droits de bibliothèque</span>
                    <strong className="text-slate-800 dark:text-white">{formatAriary(500)}</strong>
                  </div>
                  <div className="flex justify-between pt-3">
                    <span>Assurance & Édition des certificats RNCP</span>
                    <strong className="text-slate-800 dark:text-white">{formatAriary(300)}</strong>
                  </div>
                  <div className="flex justify-between pt-4 border-t-2 items-center text-[#F59E0B]">
                    <span className="text-sm font-black uppercase text-slate-400">Total à régulariser</span>
                    <strong className="text-xl font-black">{formatAriary(4300)}</strong>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-xs text-blue-600 dark:text-blue-300 leading-relaxed font-semibold">
                  📖 Les dépenses scolaires annuelles de EDUOnline constituent des dotations de scolarité reconnues par les administrations fiscales pour déductions d'impôts sur le revenu.
                </div>
              </div>

              {/* Checkout Security Form */}
              <form onSubmit={handlePaymentSubmit} className="p-6 bg-blue-600 dark:bg-blue-950 border-2 border-blue-700 dark:border-blue-900 rounded-3xl space-y-4 shadow-xl text-yellow-300">
                <h3 className="text-md font-extrabold flex items-center gap-2 border-b border-blue-500/40 pb-2 text-yellow-400">
                  <Lock className="w-4.5 h-4.5 text-yellow-400" />
                  Paiement Express Sécurisé
                </h3>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-yellow-350 text-yellow-300 uppercase tracking-widest">Numéro de téléphone mobile *</label>
                  <input
                    type="tel"
                    value={paymentPhone}
                    onChange={(e) => setPaymentPhone(e.target.value)}
                    placeholder="+33 6 45..."
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-blue-400 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-yellow-400"
                    required
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-yellow-300 uppercase tracking-widest">Numéro de Carte Bleue *</label>
                  <input
                    type="text"
                    value={paymentCard}
                    onChange={(e) => formatCardNumber(e.target.value)}
                    placeholder="4970 2311 4455 2100"
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-blue-400 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-yellow-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-yellow-300 uppercase tracking-widest">Expiry *</label>
                    <input
                      type="text"
                      value={paymentExpiry}
                      onChange={(e) => formatExpiry(e.target.value)}
                      placeholder="MM/AA"
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-blue-400 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-yellow-400"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-yellow-300 uppercase tracking-widest">CVV *</label>
                    <input
                      type="password"
                      maxLength={3}
                      value={paymentCvv}
                      onChange={(e) => setPaymentCvv(e.target.value.replace(/\D/g, ''))}
                      placeholder="123"
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-blue-400 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-yellow-450 text-center"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-yellow-300 uppercase tracking-widest">Titulaire Nominatif *</label>
                  <input
                    type="text"
                    value={paymentCardHolder}
                    onChange={(e) => setPaymentCardHolder(e.target.value)}
                    placeholder="NOM DE L'ETUDIANT"
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-blue-400 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-yellow-450"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={paymentProcessing}
                  className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-lg disabled:opacity-50 transition-all duration-100 cursor-pointer active:scale-98"
                >
                  {paymentProcessing ? "Réseau Bancaire d'État..." : `Régulariser mon inscription (${formatAriary(4300)})`}
                </button>
            </form>

          </div>
        </motion.div>
      )}

        {/* ==================== 7. EMPLOI DU TEMPS (TIMETABLE) ==================== */}
        {currentPage === 'timetable' && (
          <motion.div
            key="timetable"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            {/* Header section styled elegantly */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center py-4 border-b border-slate-250 dark:border-slate-800 gap-4">
              <div>
                <span className="text-[10px] bg-yellow-400/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400 border border-yellow-550/20 font-extrabold uppercase px-3 py-1 rounded-full tracking-widest">
                  Planification des Cours
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1.5">
                  Emploi du Temps Académique
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  EDT étudiant, planification hebdomadaire des modules d'enseignement et TDs
                </p>
              </div>

              {activeHomeTab === 'admin' && (
                <button
                  type="button"
                  onClick={() => setShowEventModal(true)}
                  className="px-5 py-3 bg-yellow-400 hover:bg-yellow-500 text-slate-950 text-xs font-black uppercase tracking-wider rounded-2xl cursor-pointer flex items-center gap-2 shadow-lg shadow-yellow-500/10 transition-all hover:scale-102"
                >
                  <PlusCircle className="w-4 h-4 shrink-0" />
                  Divulguer un Cours
                </button>
              )}
            </div>

            {/* Timetable visual cards widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-4.5 shadow-sm">
                <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-400 shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Volume Horaire</p>
                  <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">12,5 Heures / sem</p>
                </div>
              </div>

              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-4.5 shadow-sm">
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Créneaux Enregistrés</p>
                  <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{timetables.length} Modules</p>
                </div>
              </div>

              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-4.5 shadow-sm">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 shrink-0">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contrôle d'Assiduité</p>
                  <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">Validation 100%</p>
                </div>
              </div>
            </div>

            {/* INTERACTIVE CONTROLS: DAY SELECTION PILLS & SEARCH BAR */}
            <div className="flex flex-col lg:flex-row gap-4 p-4.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm justify-between items-center">
              {/* Day filter pills */}
              <div className="flex flex-wrap gap-1.5 w-full lg:w-auto">
                {['Tous', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].map((day) => {
                  const isSelected = selectedDayFilter.toLowerCase() === day.toLowerCase();
                  return (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      key={day}
                      type="button"
                      onClick={() => setSelectedDayFilter(day)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all select-none cursor-pointer ${
                        isSelected
                          ? 'bg-yellow-400 text-slate-950 font-black shadow-md'
                          : 'bg-slate-50 dark:bg-slate-855 text-slate-650 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {day === 'Tous' ? 'Tous les jours' : day}
                    </motion.button>
                  );
                })}
              </div>

              {/* Live search input */}
              <div className="relative w-full lg:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher cours, prof, salle..."
                  value={timetableSearch}
                  onChange={(e) => setTimetableSearch(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 text-xs bg-slate-50 dark:bg-slate-855 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 font-sans font-bold text-slate-800 dark:text-white"
                />
                {timetableSearch && (
                  <button
                    onClick={() => setTimetableSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px] font-bold"
                  >
                    Effacer
                  </button>
                )}
              </div>
            </div>

            {/* FILIÈRE/DEPARTMENT FILTER PILLS */}
            <div className="flex flex-wrap gap-2 p-4 bg-slate-50/70 dark:bg-slate-855/30 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-yellow-600 dark:text-yellow-400 mr-2">Filtrer par Filière :</span>
              {[
                { key: 'Tous', label: 'Toutes les filières', icon: '🎓' },
                { key: 'informatique', label: '💻 Informatique', icon: '' },
                { key: 'gestion', label: '📊 Gestion & Management', icon: '' },
                { key: 'droit', label: '⚖️ Droit & Juridique', icon: '' },
                { key: 'marketing', label: '📱 Marketing Digital', icon: '' }
              ].map((fil) => {
                const isSelected = selectedFiliereFilter.toLowerCase() === fil.key.toLowerCase();
                return (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    key={fil.key}
                    type="button"
                    onClick={() => setSelectedFiliereFilter(fil.key)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all select-none cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-yellow-400 text-slate-950 font-black shadow-md border border-yellow-500/20'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{fil.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Weekly agenda block rendering list */}
            <div className="space-y-6">
              {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']
                .filter((day) => selectedDayFilter === 'Tous' || selectedDayFilter.toLowerCase() === day.toLowerCase())
                .map((day) => {
                  // Filter timetable events for this day according to search term and filiere selection
                  let dayEvents = timetables.filter((t) => {
                    const matchesDay = t.dayOfWeek.toLowerCase() === day.toLowerCase();
                    const eventFiliere = t.filiere || 'Tous';
                    const matchesFiliere = selectedFiliereFilter === 'Tous' || eventFiliere.toLowerCase() === selectedFiliereFilter.toLowerCase() || eventFiliere === 'Tous';
                    return matchesDay && matchesFiliere;
                  });
                  if (timetableSearch.trim()) {
                    const matchText = timetableSearch.toLowerCase();
                    dayEvents = dayEvents.filter(
                      (ev) =>
                        ev.courseTitle.toLowerCase().includes(matchText) ||
                        ev.professorName.toLowerCase().includes(matchText) ||
                        ev.room.toLowerCase().includes(matchText)
                    );
                  }

                  // Sort events chronologically by start hour
                  dayEvents = [...dayEvents].sort((a, b) => a.startTime.localeCompare(b.startTime));

                  return (
                    <div
                      key={day}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
                    >
                      {/* Day Header */}
                      <div className="px-6 py-4 bg-slate-50/70 dark:bg-slate-850/30 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                          <span className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">{day}</span>
                        </div>
                        <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400 px-2.5 py-1 rounded-lg bg-yellow-400/10 border border-yellow-500/20">
                          {dayEvents.length === 0 ? "0 cours" : `${dayEvents.length} cours planifié(s)`}
                        </span>
                      </div>

                      <div className="p-6">
                        {dayEvents.length === 0 ? (
                          <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-neutral-50/50 dark:bg-neutral-950/20">
                            <p className="text-xs text-slate-400 font-semibold italic">
                              Aucun cours ne correspond ou n'est planifié pour ce jour.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {dayEvents.map((ev) => {
                              // Dynamic Course Icon assignment based on course name content
                              let CourseIcon = Tv;
                              const lowerTitle = ev.courseTitle.toLowerCase();
                              if (lowerTitle.includes('math') || lowerTitle.includes('stat')) CourseIcon = BarChart2;
                              else if (lowerTitle.includes('informatique') || lowerTitle.includes('systèm') || lowerTitle.includes('dev') || lowerTitle.includes('web') || lowerTitle.includes('api')) CourseIcon = Sparkles;
                              else if (lowerTitle.includes('anglais') || lowerTitle.includes('langue') || lowerTitle.includes('com')) CourseIcon = Mail;
                              else if (lowerTitle.includes('gestion') || lowerTitle.includes('manage') || lowerTitle.includes('pro') || lowerTitle.includes('marketing') || lowerTitle.includes('stratég')) CourseIcon = BookOpen;

                              return (
                                <div
                                  key={ev.id}
                                  className="group p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-850/10 hover:border-yellow-400/50 dark:hover:border-yellow-400/40 hover:bg-slate-50/80 dark:hover:bg-slate-855/20 transition-all duration-300 flex justify-between items-start gap-4 relative"
                                >
                                  {/* Color Left Accent Line */}
                                  <div className={`absolute top-0 bottom-0 left-0 w-1.5 rounded-l-2xl ${
                                    ev.color === 'emerald' ? 'bg-emerald-500' :
                                    ev.color === 'amber' ? 'bg-amber-500' :
                                    ev.color === 'violet' ? 'bg-violet-500' : 'bg-yellow-400'
                                  }`} />

                                  <div className="space-y-4 pl-2.5 w-full">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-yellow-400/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400 border border-yellow-500/15">
                                        {ev.startTime} - {ev.endTime}
                                      </span>
                                      <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                        📍 {ev.room}
                                      </span>
                                      {ev.filiere && ev.filiere !== 'Tous' && (
                                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-extrabold uppercase tracking-widest">
                                          {ev.filiere === 'informatique' ? '💻 Informatique' :
                                           ev.filiere === 'gestion' ? '📊 Gestion' :
                                           ev.filiere === 'droit' ? '⚖️ Droit' :
                                           ev.filiere === 'marketing' ? '📱 Marketing' : ev.filiere}
                                        </span>
                                      )}
                                    </div>

                                    <div>
                                      <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 leading-snug group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                                        {ev.courseTitle}
                                      </h4>
                                      <div className="flex items-center gap-1.5 mt-2">
                                        <div className="h-5 w-5 rounded-full bg-slate-200/60 dark:bg-slate-800 flex items-center justify-center">
                                          <User className="w-3 h-3 text-slate-500" />
                                        </div>
                                        <span className="text-[11px] font-semibold text-slate-500">
                                          Enseignant : <span className="font-bold text-slate-700 dark:text-slate-300">{ev.professorName}</span>
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex flex-col items-end justify-between h-full gap-5 shrink-0">
                                    <div className="flex items-center gap-1.5">
                                      <CourseIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors" />
                                      <span className={`h-2.5 w-2.5 rounded-full ${
                                        ev.color === 'emerald' ? 'bg-emerald-500' :
                                        ev.color === 'amber' ? 'bg-amber-500' :
                                        ev.color === 'violet' ? 'bg-violet-500' : 'bg-yellow-400'
                                      }`} />
                                    </div>

                                    {activeHomeTab === 'admin' && (
                                      <button
                                        type="button"
                                        title="Annuler ce cours"
                                        onClick={() => handleDeleteTimetableEvent(ev.id)}
                                        className="p-1.5 text-slate-450 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </motion.div>
        )}

        {/* ==================== 8. FEUILLE D'ÉMARGEMENT / PRÉSENCE (ATTENDANCE) ==================== */}
        {currentPage === 'attendance' && (
          <motion.div
            key="attendance"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row justify-between sm:items-center py-2 border-b border-slate-200 dark:border-slate-850 gap-4">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">Scolarité & Feuille d'Émargement</h1>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Registre d'émargement et assiduité en temps réel</p>
              </div>
            </div>

            {/* Dashboard metrics block */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Overall progress ring */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">Statistiques de Présence</h4>
                  <p className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">Matières suivies et justifiées</p>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Styled Attendance progress circular representation */}
                  <div className="relative h-16 w-16 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-100 dark:text-slate-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-emerald-500"
                        strokeDasharray="80, 100"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute font-black text-xs text-slate-800 dark:text-white">80%</span>
                  </div>

                  <div>
                    <span className="block text-xl font-black text-slate-800 dark:text-white">Valide ✅</span>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Taux d'assiduité supérieur au seuil</span>
                  </div>
                </div>
              </div>

              {/* Attendance hours totals */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex justify-between items-center sm:col-span-2">
                <div className="space-y-2">
                  <h4 className="font-bold text-sm">Contrôle de présence de l'Élève</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold max-w-sm">
                    En vertu du règlement intérieur, vous devez légaliser chaque séance académique. Pour signer une séance active, cliquez sur "Émarger".
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-850/60 rounded-2xl border border-slate-150 dark:border-slate-800 text-center shrink-0">
                  <span className="block text-2xl font-black text-emerald-500">
                    {attendances.filter(a => a.signed).length} / {attendances.length}
                  </span>
                  <span className="block text-[8px] uppercase tracking-widest text-[#F59E0B] font-bold">Séances Validées</span>
                </div>
              </div>
            </div>

            {/* Special block for Admin control panel */}
            {activeHomeTab === 'admin' && (
              <div className="p-6 bg-amber-500/5 dark:bg-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-3xl space-y-4">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B]">🔑</span>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">Panneau de Scolarité Administrateur</h3>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Émission de déclarations et fiches de présence</p>
                  </div>
                </div>

                <form onSubmit={handleCreateAttendanceRecord} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Étudiant visé</label>
                    <select
                      value={adminRecordUser}
                      onChange={(e) => {
                        setAdminRecordUser(e.target.value);
                        setAdminRecordName(e.target.value === 'student1' ? 'Gre Las Martin' : 'Élève Démo');
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-850 outline-none"
                    >
                      <option value="student1">Gre Las Martin (L3 Informatique)</option>
                      <option value="user_demo">Scolarité Démo Générale</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Objet Académique</label>
                    <input
                      type="text"
                      placeholder="e.g. Conception Web (React)"
                      value={adminRecordCourse}
                      onChange={(e) => setAdminRecordCourse(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-850 outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Status initial</label>
                    <select
                      value={adminRecordStatus}
                      onChange={(e: any) => setAdminRecordStatus(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-850 outline-none"
                    >
                      <option value="present">Présent (Approuvé d'office)</option>
                      <option value="absent">Absent (En attente de justificatif)</option>
                      <option value="late">Retard légalisé</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                  >
                    Générer la Fiche
                  </button>
                </form>
              </div>
            )}

            {/* Attendance registers database rows list */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-extrabold text-sm">Registre des Séquences de cours</h3>
              </div>

              <div className="divide-y divide-slate-150 dark:divide-slate-850 overflow-x-auto min-w-full">
                {attendances.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-xs text-slate-400 italic">Aucune fiche de présence enregistrée sous votre session.</p>
                  </div>
                ) : (
                  attendances.map((record) => (
                    <div key={record.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-sans text-xs">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-800 dark:text-slate-100">{record.courseTitle}</span>
                          <span className="text-[10px] text-slate-400 font-bold bg-transparent">📅 {record.date}</span>
                        </div>
                        <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider flex items-center gap-1">
                          Élève: <span className="text-slate-600 dark:text-slate-350">{record.userName}</span>
                        </p>
                        {record.signed && (
                          <span className="inline-block text-[9px] text-emerald-500 font-bold uppercase tracking-wider">
                            Signed at {record.timeSigned || "09:05"}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        {/* Status badge representation */}
                        <span className={`px-2 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-widest ${
                          record.status === 'present' ? 'bg-emerald-500/10 text-emerald-500' :
                          record.status === 'late' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-rose-500/10 text-rose-500'
                        }`}>
                          {record.status === 'present' ? "Présent" : record.status === 'late' ? "En Retard" : "Absent"}
                        </span>

                        {record.signed ? (
                          <span className="px-3 py-1.5 rounded-lg font-bold uppercase text-[9px] tracking-wider text-slate-400 bg-slate-100/50 dark:bg-slate-850 flex items-center gap-1 shrink-0">
                            🔒 Émargé
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveSigningRecord(record);
                              setShowSignModal(true);
                            }}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 font-bold text-white uppercase text-[9px] tracking-widest rounded-lg cursor-pointer transition-all animate-pulse shadow shadow-blue-500/25 shrink-0"
                          >
                            ✏️ Émarger
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ==================== 9. CAISSE & REÇUS DÉTAILLÉS (RECEIPT) ==================== */}
        {currentPage === 'receipt' && (
          <motion.div
            key="receipt"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row justify-between sm:items-center py-2 border-b border-slate-200 dark:border-slate-850 gap-4">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">Facturation & Reçus fiscaux</h1>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Vérification de paiement des droits scolarité universitaires</p>
              </div>
            </div>

            {/* Invoices metrics tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Total des Frais Acquittés</span>
                  <span className="block text-2xl font-black text-emerald-500">
                    {formatAriary(receipts.reduce((sum, r) => sum + r.amount, 0))}
                  </span>
                </div>
                <div className="h-10 w-10 bg-emerald-500/10 text-emerald-500 flex items-center justify-center rounded-xl font-bold">
                  🏦
                </div>
              </div>

              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Justificatifs Disponibles</span>
                  <span className="block text-2xl font-black text-blue-600">
                    {receipts.length} Documents
                  </span>
                </div>
                <div className="h-10 w-10 bg-blue-600/10 text-blue-600 flex items-center justify-center rounded-xl font-bold">
                  📄
                </div>
              </div>
            </div>

            {/* Receipts table layout */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-extrabold text-sm">Registre comptable de scolarité</h3>
              </div>

              <div className="divide-y divide-slate-150 dark:divide-slate-850 overflow-x-auto min-w-full">
                {receipts.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 italic text-xs font-semibold">
                    Aucune facture acquittée sous cette session. Veuillez d'abord solder vos frais académiques dans l'onglet "Frais".
                  </div>
                ) : (
                  receipts.map((rec) => (
                    <div key={rec.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                      <div className="space-y-1.5 font-sans">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {rec.receiptNumber}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">📅 Solder le {rec.date}</span>
                        </div>
                        <h4 className="font-extrabold text-slate-800 dark:text-slate-100">{rec.courseTitle}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                          Compte client: <span className="text-slate-600 dark:text-slate-350">{rec.userName}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                        <span className="text-slate-800 dark:text-slate-100 font-black text-sm">{formatAriary(rec.amount)}</span>
                        <button
                          onClick={() => {
                            setActiveVoucher(rec);
                          }}
                          className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white rounded-xl text-[10px] tracking-wider uppercase font-bold transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm"
                        >
                          <svg className="w-3 mx-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Voir Reçu
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ==================== 10. GESTION DES DIPLÔMES ACADÉMIQUES (ADMIN ONLY) ==================== */}
        {currentPage === 'diplomes' && (
          <motion.div
            key="diplomes"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <div className="flex flex-col sm:flex-row justify-between sm:items-center py-4 border-b border-slate-200 dark:border-slate-800 gap-4">
              <div>
                <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-900 font-extrabold uppercase px-3 py-1 rounded-full tracking-widest">
                  Parchemins d'État & RNCP
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1.5">
                  Gestion Académique des Diplômes
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Édition, validation et signature numérique sécurisée des diplômes universitaires d'État.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDiplomaRecipient(true)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl cursor-pointer shadow-md transition-all flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4 shrink-0" />
                  Attribuer un Diplôme
                </button>
              </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Modèles Validés</p>
                  <p className="text-lg font-extrabold text-slate-800 dark:text-white mt-0.5">3 Formats Officiels</p>
                </div>
              </div>

              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Diplômes Décernés</p>
                  <p className="text-lg font-extrabold text-slate-800 dark:text-white mt-0.5">{diplomaStudents.length} Élèves Admis</p>
                </div>
              </div>

              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Taux de Réussite global</p>
                  <p className="text-lg font-extrabold text-slate-800 dark:text-white mt-0.5">
                    {(diplomaStudents.length > 0 ? (diplomaStudents.filter(s => s.averageGrade >= 10).length / diplomaStudents.length * 100) : 100).toFixed(1)} % de Réussite
                  </p>
                </div>
              </div>
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Eligible Students List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Récipiendaires Actifs</h3>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Sélectionnez un élève pour générer</span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-3">
                    {diplomaStudents.map((student) => {
                      const isSelected = selectedDiplomaStudent?.id === student.id;
                      return (
                        <div
                          key={student.id}
                          className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-2xl transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-blue-50/70 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 shadow-sm'
                              : 'bg-transparent border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-850'
                          }`}
                          onClick={() => setSelectedDiplomaStudent(student)}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold text-slate-850 dark:text-slate-100">
                                {student.prenom} {student.nom}
                              </span>
                              <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold uppercase px-1.5 py-0.5 rounded">
                                Promotion {student.promotion}
                              </span>
                            </div>
                            <p className="text-[11px] font-semibold text-slate-500">
                              {student.filiere} — <span className="text-blue-600 dark:text-yellow-400 font-bold">{student.grade}</span>
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold">
                              Moyenne Académique: <span className="text-emerald-500">{student.averageGrade}/20</span> | ID: {student.certId}
                            </p>
                          </div>

                          <div className="mt-3 sm:mt-0 flex gap-2 w-full sm:w-auto justify-end">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDiplomaStudent(student);
                                setShowDiplomaPreviewModal(true);
                              }}
                              className="px-3.5 py-2 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 hover:bg-slate-100 rounded-xl text-[10px] tracking-wider uppercase font-extrabold transition-all cursor-pointer"
                            >
                              👁️ Aperçu
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDiplomaStudent(student);
                                setTimeout(() => {
                                  handlePrintDiploma(student);
                                }, 150);
                              }}
                              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] tracking-wider uppercase font-black transition-all shadow-sm cursor-pointer"
                            >
                              🎓 Télécharger PDF
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Style Options & Template Selector */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-sm border-b border-slate-100 dark:border-slate-850 pb-2">
                    Gabarit Graphique de Diplôme
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Choisissez le format d'exportation officiel à appliquer aux parchemins académiques.
                  </p>

                  <div className="space-y-3 pt-2">
                    {[
                      { key: 'traditional', label: 'Modèle d\'État Traditionnel', desc: 'Sceau d\'État, calligraphie académique classique, bordure dorée.' },
                      { key: 'modern', label: 'Modèle Moderne d\'Excellence', desc: 'Style épuré suisse, typographies géométriques, accents bleutés.' },
                      { key: 'rncp', label: 'Certification Spécialisée RNCP', desc: 'Mentions fiscales, bloc d\'heures professionnelles, code-barres.' }
                    ].map((tpl) => {
                      const isSelected = diplomaTemplate === tpl.key;
                      return (
                        <button
                          key={tpl.key}
                          type="button"
                          onClick={() => setDiplomaTemplate(tpl.key as any)}
                          className={`w-full text-left p-3 rounded-2xl border transition-all ${
                            isSelected
                              ? 'bg-blue-50/60 dark:bg-blue-950/15 border-blue-300 dark:border-blue-900 ring-2 ring-blue-500/10'
                              : 'bg-transparent border-slate-150 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-850'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-slate-850 dark:text-slate-100">{tpl.label}</span>
                            <span className={`h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-blue-500 text-blue-500' : 'border-slate-300'}`}>
                              {isSelected && <span className="h-2 w-2 bg-blue-500 rounded-full" />}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-450 mt-1 font-medium">{tpl.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900/60 dark:to-slate-850/60 border border-amber-200/50 dark:border-slate-800 rounded-3xl space-y-3">
                  <h4 className="text-xs font-black uppercase text-amber-700 dark:text-yellow-400 tracking-wider flex items-center gap-1.5">
                    🛡️ Authentification par Blockchain
                  </h4>
                  <p className="text-[11px] text-slate-650 dark:text-slate-300 leading-relaxed">
                    Chaque diplôme généré par notre système inclut un identifiant unique (Ref ID) qui est signé sur le registre de l'école. Cela permet aux recruteurs de valider l'authenticité de la certification en temps réel.
                  </p>
                </div>
              </div>
            </div>

            {/* Custom interactive Modal to see the LIVE DIPLOMA inside standard container */}
            {showDiplomaPreviewModal && selectedDiplomaStudent && (
              <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full max-w-2xl bg-white text-slate-900 rounded-3xl p-4 shadow-2xl relative flex flex-col"
                >
                  <button
                    onClick={() => setShowDiplomaPreviewModal(false)}
                    className="absolute top-6 right-6 h-7 w-7 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center outline-none cursor-pointer text-sm font-bold font-sans z-10"
                  >
                    ×
                  </button>

                  <div
                    id="eduonline-diploma-recipient-frame-preview"
                    className="space-y-6 flex flex-col p-8 bg-white text-slate-900 border-[12px] text-center font-serif rounded-2xl"
                    style={{
                      backgroundImage: diplomaTemplate === 'traditional'
                        ? "linear-gradient(135deg, #ffffff 0%, #fffdf4 100%)"
                        : diplomaTemplate === 'modern'
                        ? "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)"
                        : "linear-gradient(135deg, #fafafa 0%, #f4f4f5 100%)",
                      borderColor: diplomaTemplate === 'traditional' ? '#F59E0B' : diplomaTemplate === 'modern' ? '#3B82F6' : '#64748B'
                    }}
                  >
                    <GraduationCap className={`w-14 h-14 mx-auto ${diplomaTemplate === 'traditional' ? 'text-blue-600' : diplomaTemplate === 'modern' ? 'text-blue-500' : 'text-slate-700'}`} />
                    
                    <div className="space-y-1">
                      <h2 className={`text-3xl font-black tracking-tight uppercase ${diplomaTemplate === 'traditional' ? 'text-blue-600' : diplomaTemplate === 'modern' ? 'text-slate-900' : 'text-slate-800'}`}>
                        {diplomaTemplate === 'rncp' ? "Titre Professionnel RNCP" : "Diplôme Universitaire"}
                      </h2>
                      <p className="text-[10px] uppercase tracking-widest font-extrabold font-sans text-amber-600">
                        UNIV-ONLINE École de Formation Supérieure d’État
                      </p>
                    </div>

                    <div className="space-y-4 font-serif">
                      <p className="text-xs font-semibold italic">Vu les examens réglementaires et l'approbation du corps académique d'État,</p>
                      <p className="text-xs">Le présent parchemin est décerné avec les félicitations du jury à l'élève admis :</p>
                      <h3 className="text-xl font-black text-slate-850 tracking-wide underline px-4 py-2 uppercase font-serif">
                        {selectedDiplomaStudent.prenom} {selectedDiplomaStudent.nom}
                      </h3>
                      <p className="text-xs font-semibold leading-relaxed">
                        et lui confère le grade universitaire légal de <br />
                        <strong className="text-blue-600 text-md uppercase block mt-1.5 font-sans">
                          {selectedDiplomaStudent.filiere} ({selectedDiplomaStudent.grade})
                        </strong>
                      </p>
                      <p className="text-[10px] font-bold text-slate-500">
                        obtenu avec la moyenne d'excellence de <strong className="text-emerald-500">{selectedDiplomaStudent.averageGrade}/20</strong>.
                      </p>
                    </div>

                    {/* Footer block */}
                    <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-[10px] font-sans">
                      <div className="text-left space-y-1">
                        <span className="block text-slate-400 font-bold tracking-widest uppercase text-[7px]">Certificat Enregistré</span>
                        <p className="font-bold text-slate-700">Ref ID: {selectedDiplomaStudent.certId}</p>
                      </div>

                      <div className={`h-16 w-16 rounded-full border-4 flex items-center justify-center text-[8px] font-black leading-none text-center select-none rotate-12 mx-auto sm:mx-0 bg-transparent ${
                        diplomaTemplate === 'traditional' ? 'border-amber-500 text-amber-500' :
                        diplomaTemplate === 'modern' ? 'border-blue-500 text-blue-500' :
                        'border-slate-500 text-slate-500'
                      }`}>
                        CAMPUS<br />EDUOnline<br />UNIVERS
                      </div>

                      <div className="text-right space-y-1">
                        <span className="block text-slate-400 font-bold tracking-widest uppercase text-[7px]">Délivré le</span>
                        <p className="font-extrabold text-slate-700">
                          {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-[9px] italic font-semibold">Le Secrétariat Académique</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2.5 justify-center mt-6">
                    <button
                      onClick={() => handlePrintDiploma(selectedDiplomaStudent)}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-sans text-xs font-bold uppercase tracking-wider rounded-xl shadow cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-4 h-4" />
                      Imprimer mon Diplôme
                    </button>
                    <button
                      onClick={() => setShowDiplomaPreviewModal(false)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                    >
                      Fermer
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Custom Modal to add a new recipient */}
            {showAddDiplomaRecipient && (
              <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full max-w-md bg-gradient-to-br from-yellow-300 via-amber-50 to-blue-200 border-4 border-blue-600 rounded-3xl p-6 space-y-6 shadow-2xl relative text-slate-950"
                >
                  <button
                    onClick={() => setShowAddDiplomaRecipient(false)}
                    className="absolute top-4 right-4 h-7 w-7 rounded-full bg-white/80 border border-blue-400 hover:bg-blue-600 hover:text-white text-blue-900 flex items-center justify-center outline-none cursor-pointer text-lg font-bold transition-colors"
                  >
                    ×
                  </button>

                  <div className="space-y-1">
                    <h3 className="font-extrabold text-lg text-slate-950">Créer une Certification</h3>
                    <p className="text-xs text-blue-900 font-medium">Renseignez les données pour attribuer un titre ou diplôme.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">Prénom</label>
                        <input
                          type="text"
                          placeholder="Ex: Jacquecin"
                          value={newDipFirst}
                          onChange={(e) => setNewDipFirst(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white text-black placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 border-2 border-blue-600 font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">Nom de famille</label>
                        <input
                          type="text"
                          placeholder="Ex: Grela"
                          value={newDipLast}
                          onChange={(e) => setNewDipLast(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white text-black placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 border-2 border-blue-600 font-bold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">Filière / Spécialisation</label>
                      <select
                        value={newDipFiliere}
                        onChange={(e) => setNewDipFiliere(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 border-2 border-blue-600 font-bold"
                      >
                        <option value="Ingénierie Logicielle & Web" className="bg-white text-black">Ingénierie Logicielle & Web</option>
                        <option value="Intelligence Artificielle & Data" className="bg-white text-black">Intelligence Artificielle & Data</option>
                        <option value="CyberSécurité & Réseaux" className="bg-white text-black">CyberSécurité & Réseaux</option>
                        <option value="Marketing Digital & Tech" className="bg-white text-black">Marketing Digital & Tech</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">Grade universitaire</label>
                        <input
                          type="text"
                          placeholder="Ex: Licence Professionnelle"
                          value={newDipGrade}
                          onChange={(e) => setNewDipGrade(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white text-black placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 border-2 border-blue-600 font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">Moyenne (/20)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="Ex: 16.5"
                          value={newDipAvg}
                          onChange={(e) => setNewDipAvg(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white text-black placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 border-2 border-blue-600 font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddDiplomaRecipient(false)}
                      className="px-4 py-2 bg-white/80 border border-blue-400 text-blue-900 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newDipFirst || !newDipLast) {
                          triggerNotification('Veuillez remplir le prénom et le nom.', 'warning');
                          return;
                        }
                        const randomCertId = 'CERT-A' + Math.floor(10000000 + Math.random() * 90000000);
                        const addedRecipient = {
                          id: 'stud-' + Date.now(),
                          prenom: newDipFirst,
                          nom: newDipLast,
                          filiere: newDipFiliere,
                          promotion: '2026',
                          grade: newDipGrade,
                          averageGrade: parseFloat(newDipAvg) || 15.0,
                          certId: randomCertId
                        };
                        setDiplomaStudents(prev => [...prev, addedRecipient]);
                        setSelectedDiplomaStudent(addedRecipient);
                        setShowAddDiplomaRecipient(false);
                        triggerNotification('Nouveau diplôme créé avec succès ! Prêt pour téléchargement.', 'success');
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold cursor-pointer shadow transition-colors"
                    >
                      Créer & Enregistrer
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}

        {/* ==================== 11. MES COURS & PROGRAMME ACTIF (STUDENT ONLY) ==================== */}
        {currentPage === 'cours' && (
          <motion.div
            key="cours"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <div className="flex flex-col sm:flex-row justify-between sm:items-center py-4 border-b border-slate-200 dark:border-slate-800 gap-4">
              <div>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 font-extrabold uppercase px-3 py-1 rounded-full tracking-widest">
                  Parcours Universitaire
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1.5">
                  Mes Modules d'Études
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Suivi de progression pédagogique, crédits académiques ECTS accumulés et évaluations.
                </p>
              </div>
            </div>

            {/* Student performance indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl text-center shadow-sm">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Moyenne Annuelle</span>
                <span className="block text-3xl font-black text-blue-600 dark:text-yellow-400 mt-1">15.2 / 20</span>
                <span className="block text-[9px] text-emerald-500 font-bold mt-1">Excellent (Rang 4/32)</span>
              </div>

              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl text-center shadow-sm">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progression Globale</span>
                <span className="block text-3xl font-black text-slate-800 dark:text-white mt-1">68 %</span>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: '68%' }} />
                </div>
              </div>

              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl text-center shadow-sm">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Crédits validés</span>
                <span className="block text-3xl font-black text-slate-800 dark:text-white mt-1">24 / 30</span>
                <span className="block text-[9px] text-slate-400 font-bold mt-1">ECTS Semestre en cours</span>
              </div>

              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl text-center shadow-sm">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Présence Assidue</span>
                <span className="block text-3xl font-black text-emerald-500 mt-1">94.8 %</span>
                <span className="block text-[9px] text-slate-400 font-bold mt-1">Seulement 2 absences</span>
              </div>
            </div>

            {/* Syllabus Modules details */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="font-extrabold text-sm border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-blue-600" />
                Détail du Syllabus de Formation
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { name: 'Développement Web Moderne (React 18 & Node.js)', prof: 'M. Jean-François Bertrand', coef: 3, ects: 6, progress: 90, grade: '16.5/20', desc: 'Conception d’architectures modulaires complexes, Hooks avancés, communication REST, et intégration CSS de pointe.' },
                  { name: 'Algorithmique & Structures de Données complexes', prof: 'M. Sorel Paul', coef: 3, ects: 6, progress: 75, grade: '13.5/20', desc: 'Résolution de problèmes algorithmiques, graphes, programmation dynamique, et structures de données arborescentes.' },
                  { name: 'Systèmes de Stockage Cloud & PostgreSQL', prof: 'Mme Claire Fontaine', coef: 4, ects: 8, progress: 45, grade: 'En attente', desc: 'Conception de schémas relationnels SQL, optimisation des requêtes, indexation complexe et intégration Cloud.' },
                  { name: 'Design Graphique, UI/UX & Prototypage Figma', prof: 'Mme Rostand Sophie', coef: 2, ects: 5, progress: 100, grade: '18.0/20', desc: 'Recherche utilisateur, élaboration d’ateliers de co-conception, conception de maquettes haute fidélité et prototypage.' },
                  { name: 'Anglais Technique pour l’Ingénierie Logicielle', prof: 'M. Adams James', coef: 1, ects: 5, progress: 30, grade: 'En attente', desc: 'Vocabulaire professionnel, rédaction technique, présentation orale de projets technologiques et conduite de réunions.' }
                ].map((mod, idx) => (
                  <div
                    key={idx}
                    className="p-5 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-2xl space-y-3.5 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start gap-3">
                        <h4 className="font-black text-xs text-slate-850 dark:text-slate-100 leading-snug">{mod.name}</h4>
                        <span className="shrink-0 text-[9px] bg-blue-100/80 dark:bg-yellow-500/10 text-blue-700 dark:text-yellow-400 font-bold px-2 py-0.5 rounded">
                          {mod.ects} ECTS
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-450 font-bold">
                        Formateur: {mod.prof} | Coef: {mod.coef}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                        {mod.desc}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-slate-450 uppercase">Progression du Cours</span>
                        <span className="text-slate-800 dark:text-white">{mod.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200/60 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600" style={{ width: `${mod.progress}%` }} />
                      </div>

                      <div className="flex justify-between items-center pt-1">
                        <span className="text-[10px] text-slate-450 font-bold">Note de Contrôle Continu</span>
                        <span className={`text-xs font-black ${mod.grade.includes('En attente') ? 'text-slate-400' : 'text-emerald-500'}`}>
                          {mod.grade}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1 justify-end">
                      <button
                        onClick={() => triggerNotification(`Le syllabus pour "${mod.name}" est prêt au téléchargement.`, 'success')}
                        className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:border-blue-300 rounded-lg text-[10px] font-extrabold cursor-pointer"
                      >
                        Syllabus 📄
                      </button>
                      <button
                        onClick={() => {
                          setCurrentPage('videos');
                          if (mod.name.includes('Web') || mod.name.includes('React')) {
                            setActiveVideoId('vid-1');
                          } else if (mod.name.includes('Algorithmique') || mod.name.includes('Données')) {
                            setActiveVideoId('vid-2');
                          } else if (mod.name.includes('PostgreSQL') || mod.name.includes('Stockage')) {
                            setActiveVideoId('vid-3');
                          } else {
                            setActiveVideoId('vid-4');
                          }
                          setVideoPlaying(true);
                          triggerNotification(`Démarrage du cours : ${mod.name}`, 'success');
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-yellow-300 border border-yellow-450 rounded-lg text-[10px] font-extrabold cursor-pointer flex items-center gap-1 shadow"
                      >
                        Étudier le cours ▶️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ==================== 12. ELEVATE: VIDÉOS DE COURS PLAYER (STUDENT ONLY) ==================== */}
        {currentPage === 'videos' && (
          <motion.div
            key="videos"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <div className="flex flex-col sm:flex-row justify-between sm:items-center py-4 border-b border-slate-200 dark:border-slate-800 gap-4">
              <div>
                <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900 font-extrabold uppercase px-3 py-1 rounded-full tracking-widest">
                  Vidéos à la Demande (VOD)
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1.5">
                  Vidéos de Cours & E-Learning
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Accédez à nos enregistrements officiels en Ultra Haute Définition.
                </p>
              </div>
            </div>

            {/* Interactive video room layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left 2 Columns: Large Interactive Video Player */}
              <div className="lg:col-span-2 space-y-6">
                {(() => {
                  const currVid = videoLessons.find(v => v.id === activeVideoId) || videoLessons[0];
                  return (
                    <div className="space-y-4">
                      {/* Aesthetic player wrapper */}
                      <div className="relative aspect-video bg-black rounded-3xl overflow-hidden group shadow-2xl border border-slate-800">
                        {/* Real video player */}
                        <video
                          ref={lessonsVideoRef}
                          src={currVid.videoUrl}
                          poster={currVid.thumbnail}
                          playsInline
                          className="absolute inset-0 w-full h-full object-cover"
                          onTimeUpdate={() => {
                            if (lessonsVideoRef.current && lessonsVideoRef.current.duration) {
                              const pct = Math.floor((lessonsVideoRef.current.currentTime / lessonsVideoRef.current.duration) * 100);
                              setVideoProgress(isNaN(pct) ? 0 : pct);
                            }
                          }}
                          onEnded={() => setVideoPlaying(false)}
                        />

                        {/* Interactive Dark Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 flex flex-col justify-between p-6 z-10">
                          
                          {/* Top bar */}
                          <div className="flex justify-between items-center text-white">
                            <span className="px-2.5 py-1 bg-black/60 backdrop-blur rounded-lg text-[9px] font-black uppercase tracking-wider">
                              Haute Définition 1080p
                            </span>
                            <span className="text-[10px] font-mono font-bold text-neutral-300">
                              {videoPlaying ? "● Lecture en cours..." : "Pause"}
                            </span>
                          </div>

                          {/* Center play trigger overlay */}
                          <div className="flex justify-center items-center">
                            <button
                              onClick={() => {
                                setVideoPlaying(!videoPlaying);
                                triggerNotification(videoPlaying ? "Vidéo en pause" : "Lancement de la leçon vidéo", "info");
                              }}
                              className="h-16 w-16 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg transform transition-all active:scale-90 cursor-pointer border-none"
                            >
                              {videoPlaying ? (
                                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                </svg>
                              ) : (
                                <svg className="w-8 h-8 fill-current ml-1" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              )}
                            </button>
                          </div>

                          {/* Bottom controls panel */}
                          <div className="space-y-3.5">
                            {/* Seek slider */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] text-neutral-300 font-mono font-bold">
                                <span>{Math.floor((currVid.duration.split(':')[0] * videoProgress) / 100)}:{Math.floor((currVid.duration.split(':')[1] * videoProgress) / 100).toString().padStart(2, '0')}</span>
                                <span>{currVid.duration}</span>
                              </div>
                              <div
                                onClick={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const pct = Math.floor(((e.clientX - rect.left) / rect.width) * 100);
                                  setVideoProgress(pct);
                                  if (lessonsVideoRef.current && lessonsVideoRef.current.duration) {
                                    lessonsVideoRef.current.currentTime = (pct / 100) * lessonsVideoRef.current.duration;
                                  }
                                }}
                                className="w-full h-1.5 bg-neutral-700/80 rounded-full overflow-hidden cursor-pointer"
                              >
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${videoProgress}%` }} />
                              </div>
                            </div>

                            {/* Controls bottom shelf */}
                            <div className="flex justify-between items-center text-white text-xs">
                              <div className="flex items-center gap-4">
                                <button
                                  onClick={() => setVideoPlaying(!videoPlaying)}
                                  className="text-white hover:text-blue-400 cursor-pointer font-bold"
                                >
                                  {videoPlaying ? "Pause" : "Lecture"}
                                </button>

                                <span className="text-neutral-400 font-bold font-mono">|</span>

                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-neutral-300 font-bold">Volume</span>
                                  <div className="w-16 h-1 bg-neutral-600 rounded-full overflow-hidden">
                                    <div className="h-full bg-white" style={{ width: '80%' }} />
                                  </div>
                                </div>
                              </div>

                              <span className="text-[10px] text-neutral-400 font-mono font-bold uppercase tracking-widest">
                                Par: {currVid.instructor}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Video description card */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
                          <h2 className="text-md font-black text-slate-850 dark:text-slate-100">{currVid.title}</h2>
                          <span className="text-[10px] uppercase font-bold text-slate-400">Cours: {currVid.filiere}</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-650 dark:text-slate-300 leading-relaxed">
                          {currVid.description}
                        </p>
                      </div>

                      {/* Interactive Help Desk Forum / IA Help */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                        <h4 className="font-extrabold text-xs text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                          💡 Poser une Question au Tuteur IA
                        </h4>
                        
                        <div className="space-y-3 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl max-h-[220px] overflow-y-auto">
                          {videoDiscussionList.map((disc) => (
                            <div key={disc.id} className="space-y-1.5 border-b border-slate-100 dark:border-slate-850 pb-2 text-[11px]">
                              <p className="font-extrabold text-blue-600">👤 {disc.user}</p>
                              <p className="font-bold text-slate-700 dark:text-slate-300 italic">" {disc.question} "</p>
                              <p className="font-semibold text-slate-500 pl-4 border-l-2 border-slate-200 dark:border-slate-800 leading-relaxed">
                                <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest block">Réponse Tuteur:</span>
                                {disc.reply}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Posez votre question académique à l'équipe pédagogique..."
                            value={tutorQuestionText}
                            onChange={(e) => setTutorQuestionText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && tutorQuestionText) {
                                const newQ = {
                                  id: 'disc-' + Date.now(),
                                  user: currentUser ? `${currentUser.prenom} ${currentUser.nom}` : "Jacquecin Grela",
                                  question: tutorQuestionText,
                                  reply: `Merci pour votre question intéressante concernant "${currVid.title}". Nos formateurs ainsi que notre IA pédagogique l'analysent. Un retour complet contenant des références de cours additionnelles vous sera communiqué sous 15 minutes.`
                                };
                                setVideoDiscussionList([...videoDiscussionList, newQ]);
                                setTutorQuestionText('');
                                triggerNotification('Question envoyée à l’assistance pédagogique.', 'success');
                              }
                            }}
                            className="flex-grow px-3.5 py-2.5 text-xs bg-blue-100 border border-blue-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-bold text-black placeholder-blue-700/70 focus:bg-blue-200"
                          />
                          <button
                            onClick={() => {
                              if (!tutorQuestionText) return;
                              const newQ = {
                                id: 'disc-' + Date.now(),
                                user: currentUser ? `${currentUser.prenom} ${currentUser.nom}` : "Jacquecin Grela",
                                question: tutorQuestionText,
                                reply: `Merci pour votre question intéressante concernant "${currVid.title}". Nos formateurs ainsi que notre IA pédagogique l'analysent. Un retour complet contenant des références de cours additionnelles vous sera communiqué sous 15 minutes.`
                              };
                              setVideoDiscussionList([...videoDiscussionList, newQ]);
                              setTutorQuestionText('');
                              triggerNotification('Question envoyée à l’assistance pédagogique.', 'success');
                            }}
                            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase rounded-xl cursor-pointer"
                          >
                            Poser 🚀
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Right Sidebar: Video Syllabus Outline */}
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-sm border-b border-slate-100 dark:border-slate-850 pb-2">
                    Sommaire des Vidéos
                  </h3>

                  <div className="space-y-2 max-h-[450px] overflow-y-auto">
                    {videoLessons.map((vid) => {
                      const isActive = vid.id === activeVideoId;
                      return (
                        <div
                          key={vid.id}
                          onClick={() => {
                            setActiveVideoId(vid.id);
                            setVideoProgress(0);
                            setVideoPlaying(false);
                            triggerNotification(`Chargement: ${vid.title}`, 'info');
                          }}
                          className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                            isActive
                              ? 'bg-red-50/70 dark:bg-red-950/20 border-red-300 dark:border-red-900 shadow-sm'
                              : 'bg-transparent border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-850'
                          }`}
                        >
                          <div className="flex gap-3">
                            <span className="text-xl self-center">📹</span>
                            <div className="space-y-0.5 flex-grow">
                              <h4 className="text-[11px] font-black text-slate-850 dark:text-slate-100 leading-snug">
                                {vid.title}
                              </h4>
                              <p className="text-[9px] text-slate-400 font-bold">
                                Formateur: {vid.instructor}
                              </p>
                              <div className="flex justify-between items-center text-[9px] font-bold text-slate-450 mt-1.5">
                                <span>Durée: {vid.duration}</span>
                                {vid.progress > 0 && (
                                  <span className="text-emerald-500">Progressé à {vid.progress}%</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* ==================== 13. ELEVATE: EXAMENS ET ÉPREUVES (TRAINER ONLY) ==================== */}
        {currentPage === 'examens' && (
          <motion.div
            key="examens"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <div className="flex flex-col sm:flex-row justify-between sm:items-center py-4 border-b border-slate-200 dark:border-slate-800 gap-4">
              <div>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 font-extrabold uppercase px-3 py-1 rounded-full tracking-widest">
                  Espace d'Évaluation Continu
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1.5">
                  Planification des Examens
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Création d'examens semestriels, de contrôles continus et gestion des coefficients.
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setShowAddExamModal(true)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl cursor-pointer shadow flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  Programmer un Examen
                </button>
              </div>
            </div>

            {/* Quick Stats for Trainers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div 
                onClick={() => {
                  setExamFilter('Prévu');
                  triggerNotification('Filtrage du registre : Épreuves planifiées', 'info');
                }}
                className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center gap-4.5 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all"
              >
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Épreuves planifiées</p>
                  <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{exams.filter(e => e.status === 'Prévu').length} Examens</p>
                </div>
              </div>

              <div 
                onClick={() => setShowNextExamModal(true)}
                className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center gap-4.5 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all"
              >
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-450 rounded-xl">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prochain Examen</p>
                  <p className="text-sm font-black text-slate-800 dark:text-white mt-0.5 truncate max-w-[150px]">
                    {exams.find(e => e.status === 'Prévu')?.title || 'Aucun prévu'} 🔍
                  </p>
                </div>
              </div>

              <div 
                onClick={() => setShowGradingModal(true)}
                className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center gap-4.5 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all"
              >
                <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Copies à Corriger</p>
                  <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{ungradedCopies.length} Copies</p>
                </div>
              </div>
            </div>

            {/* Exams Table Layout */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="font-extrabold text-sm">Registre d'Évaluation de Promotion</h3>
                  <p className="text-[10px] uppercase font-bold text-slate-450 mt-0.5">Année Académique 2026</p>
                </div>

                <div className="flex flex-wrap gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  {(['Tous', 'Prévu', 'En cours de correction', 'Terminé'] as const).map((filterVal) => (
                    <button
                      key={filterVal}
                      onClick={() => setExamFilter(filterVal)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                        examFilter === filterVal
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      {filterVal === 'Tous' ? 'Tout' : filterVal}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-slate-150 dark:divide-slate-850 overflow-x-auto min-w-full">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-350">
                  <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 uppercase text-[9px] font-black tracking-widest">
                    <tr>
                      <th className="px-6 py-3.5">Intitulé de l'Épreuve</th>
                      <th className="px-6 py-3.5">Filière</th>
                      <th className="px-6 py-3.5">Date & Heure</th>
                      <th className="px-6 py-3.5">Coefficient</th>
                      <th className="px-6 py-3.5">Format</th>
                      <th className="px-6 py-3.5 text-right">Statut / Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                    {exams
                      .filter((ex) => examFilter === 'Tous' || ex.status === examFilter)
                      .map((ex) => (
                        <tr key={ex.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/40">
                          <td className="px-6 py-4 font-extrabold text-slate-850 dark:text-slate-100">
                            {ex.title}
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-500">{ex.filiere}</td>
                          <td className="px-6 py-4">
                            Le {new Date(ex.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} à {ex.time} ({ex.duration})
                          </td>
                          <td className="px-6 py-4 font-black text-blue-600 dark:text-yellow-400">× {ex.coefficient}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              ex.type === 'Pratique' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                            }`}>
                              {ex.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className={`px-2 py-1 rounded-full text-[9px] uppercase font-black ${
                                ex.status === 'Prévu' ? 'bg-blue-100/80 text-blue-700' :
                                ex.status === 'Terminé' ? 'bg-emerald-100/80 text-emerald-700' :
                                'bg-amber-150 text-amber-750'
                              }`}>
                                {ex.status}
                              </span>
                              <button
                                onClick={() => {
                                  setExams(exams.filter(item => item.id !== ex.id));
                                  triggerNotification("Examen retiré avec succès.", "warning");
                                }}
                                className="p-1 text-slate-350 hover:text-red-500 rounded cursor-pointer"
                                title="Annuler l'épreuve"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {exams.filter((ex) => examFilter === 'Tous' || ex.status === examFilter).length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-400 dark:text-slate-500">
                          Aucune épreuve trouvée pour ce filtre.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal to register new exam */}
            {showAddExamModal && (
              <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl relative"
                >
                  <button
                    onClick={() => setShowAddExamModal(false)}
                    className="absolute top-4 right-4 h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 flex items-center justify-center outline-none cursor-pointer text-lg font-bold"
                  >
                    ×
                  </button>

                  <div className="space-y-1">
                    <h3 className="font-extrabold text-lg">Créer une Épreuve</h3>
                    <p className="text-xs text-slate-450">Déterminez les modalités d'examen pour vos élèves.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Intitulé de l'Épreuve</label>
                      <input
                        type="text"
                        placeholder="Ex: Examen Final React Hooks"
                        value={newExamTitle}
                        onChange={(e) => setNewExamTitle(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-150 dark:border-slate-800 font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filière</label>
                        <select
                          value={newExamFiliere}
                          onChange={(e) => setNewExamFiliere(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-150 dark:border-slate-800 font-bold"
                        >
                          <option value="Informatique">💻 Informatique</option>
                          <option value="Gestion & Management">📊 Gestion</option>
                          <option value="Droit & Juridique">⚖️ Droit</option>
                          <option value="Marketing Digital">📱 Marketing</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Format d'Épreuve</label>
                        <select
                          value={newExamType}
                          onChange={(e) => setNewExamType(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-150 dark:border-slate-800 font-bold"
                        >
                          <option value="Pratique">Pratique & Projet</option>
                          <option value="Écrit">Écrit classique</option>
                          <option value="QCM">QCM interactif</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</label>
                        <input
                          type="date"
                          value={newExamDate}
                          onChange={(e) => setNewExamDate(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-150 dark:border-slate-800 font-bold"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Heure</label>
                        <input
                          type="text"
                          placeholder="Ex: 14:00"
                          value={newExamTime}
                          onChange={(e) => setNewExamTime(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-150 dark:border-slate-800 font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Durée</label>
                        <input
                          type="text"
                          placeholder="Ex: 2h00"
                          value={newExamDuration}
                          onChange={(e) => setNewExamDuration(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-150 dark:border-slate-800 font-bold"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Coefficient</label>
                        <input
                          type="number"
                          placeholder="Ex: 3"
                          value={newExamCoef}
                          onChange={(e) => setNewExamCoef(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-150 dark:border-slate-800 font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddExamModal(false)}
                      className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newExamTitle || !newExamDate) {
                          triggerNotification('Veuillez renseigner le titre et la date.', 'warning');
                          return;
                        }
                        const addedExam = {
                          id: 'ex-' + Date.now(),
                          title: newExamTitle,
                          filiere: newExamFiliere,
                          date: newExamDate,
                          time: newExamTime,
                          duration: newExamDuration,
                          coefficient: parseInt(newExamCoef) || 3,
                          type: newExamType,
                          status: 'Prévu'
                        };
                        setExams([addedExam, ...exams]);
                        setShowAddExamModal(false);
                        triggerNotification('Nouvelle épreuve d\'examen programmée avec succès !', 'success');
                      }}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-emerald-700 shadow"
                    >
                      Programmer
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Modal for Next Exam Details */}
            {showNextExamModal && (
              <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl relative"
                >
                  <button
                    onClick={() => setShowNextExamModal(false)}
                    className="absolute top-4 right-4 h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 flex items-center justify-center outline-none cursor-pointer text-lg font-bold"
                  >
                    ×
                  </button>

                  <div className="space-y-1">
                    <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                      Prochain Événement d'Évaluation
                    </span>
                    <h3 className="font-extrabold text-lg text-slate-850 dark:text-white">
                      Détails de l'Épreuve Imminente
                    </h3>
                    <p className="text-xs text-slate-450">Suivi et lancement rapide de la session d'examen.</p>
                  </div>

                  {exams.find(e => e.status === 'Prévu') ? (
                    (() => {
                      const ex = exams.find(e => e.status === 'Prévu');
                      return (
                        <div className="space-y-5">
                          <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-3">
                            <h4 className="text-sm font-black text-slate-900 dark:text-white">
                              {ex.title}
                            </h4>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div>
                                <span className="text-slate-400 font-bold block text-[10px] uppercase">Filière concernée</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300">{ex.filiere}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 font-bold block text-[10px] uppercase">Coefficient épreuve</span>
                                <span className="font-black text-blue-600 dark:text-yellow-400">× {ex.coefficient}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 font-bold block text-[10px] uppercase">Date programmée</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300">
                                  Le {new Date(ex.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 font-bold block text-[10px] uppercase">Heure de début & Durée</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300">
                                  {ex.time} ({ex.duration})
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 font-bold block text-[10px] uppercase">Format</span>
                                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 rounded font-bold text-[10px]">
                                  {ex.type}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-150 dark:border-blue-900 rounded-2xl p-4 text-xs space-y-2">
                            <h5 className="font-bold text-blue-800 dark:text-blue-300">💡 Simulateur d'Évaluation Automatisé</h5>
                            <p className="text-blue-750 dark:text-blue-350 leading-relaxed font-medium">
                              En cliquant sur le bouton de lancement ci-dessous, vous simulez le début et la fin de cette épreuve. Les élèves de la promotion informatique soumettront automatiquement 2 nouvelles copies d'évaluation que vous pourrez corriger instantanément.
                            </p>
                          </div>

                          <div className="flex justify-end gap-2.5">
                            <button
                              type="button"
                              onClick={() => setShowNextExamModal(false)}
                              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700"
                            >
                              Fermer
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                // Update status of nextExam
                                setExams(exams.map(e => e.id === ex.id ? { ...e, status: 'Terminé' } : e));
                                // Simulate 2 student copies submission
                                const examTitle = ex.title;
                                const filiere = ex.filiere;
                                const newSubmissions = [
                                  {
                                    id: 'copy-' + Date.now() + '-1',
                                    studentName: 'Marc Leroy',
                                    studentEmail: 'marc.leroy@etu.univ.fr',
                                    filiere: filiere,
                                    moduleName: examTitle,
                                    examTitle: examTitle,
                                    submissionText: `Rapport de travaux pratiques et livrables de projet pour l'épreuve "${examTitle}". Architecture modulaire réactive bien établie, composants documentés, gestion du state maîtrisée avec des hooks robustes.`,
                                    dateSubmitted: new Date().toISOString().split('T')[0]
                                  },
                                  {
                                    id: 'copy-' + Date.now() + '-2',
                                    studentName: 'Sophie Martin',
                                    studentEmail: 'sophie.martin@etu.univ.fr',
                                    filiere: filiere,
                                    moduleName: examTitle,
                                    examTitle: examTitle,
                                    submissionText: `Rendu d'évaluation pour "${examTitle}". Optimisation de la réactivité et de l'accessibilité de l'interface utilisateur. Styles implémentés entièrement en classes utilitaires Tailwind CSS avec une charte de couleur dynamique.`,
                                    dateSubmitted: new Date().toISOString().split('T')[0]
                                  }
                                ];
                                setUngradedCopies(prev => [...newSubmissions, ...prev]);
                                triggerNotification(`L'examen "${ex.title}" a été exécuté et clôturé. 2 nouvelles copies ont été soumises par les étudiants pour correction ! 📝`, 'success');
                                setShowNextExamModal(false);
                              }}
                              className="px-4 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-amber-700 shadow flex items-center gap-1.5"
                            >
                              <Play className="w-3.5 h-3.5" />
                              Lancer & Simuler la Fin d'Épreuve
                            </button>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="py-8 text-center text-slate-450 text-xs font-bold space-y-2">
                      <p>Aucun examen de statut "Prévu" n'est programmé actuellement.</p>
                      <button
                        onClick={() => {
                          setShowNextExamModal(false);
                          setShowAddExamModal(true);
                        }}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] uppercase font-black tracking-wider cursor-pointer shadow-sm mt-2"
                      >
                        Programmer une Épreuve
                      </button>
                    </div>
                  )}
                </motion.div>
              </div>
            )}

            {/* Modal for Grading Copies (Copies à Corriger) */}
            {showGradingModal && (
              <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
                >
                  <button
                    onClick={() => {
                      setShowGradingModal(false);
                      setSelectedCopyForGrading(null);
                    }}
                    className="absolute top-4 right-4 h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 flex items-center justify-center outline-none cursor-pointer text-lg font-bold"
                  >
                    ×
                  </button>

                  <div className="space-y-1">
                    <span className="text-[9px] bg-red-100 text-red-800 font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                      Correction de Devoirs & Projets
                    </span>
                    <h3 className="font-extrabold text-lg text-slate-850 dark:text-white">
                      Espace de Notation des Copies Élèves
                    </h3>
                    <p className="text-xs text-slate-450">Suivi et correction des livrables Cloud soumis par les apprenants.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    {/* Left Column: List of Copies */}
                    <div className="md:col-span-5 space-y-3">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        Copies en attente ({ungradedCopies.length})
                      </h4>
                      <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                        {ungradedCopies.map((copy) => (
                          <div
                            key={copy.id}
                            onClick={() => {
                              setSelectedCopyForGrading(copy);
                              setGradingScore('15');
                              setGradingComments('');
                            }}
                            className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                              selectedCopyForGrading?.id === copy.id
                                ? 'bg-indigo-50/70 border-indigo-300 dark:bg-indigo-950/40 dark:border-indigo-850'
                                : 'bg-slate-50 border-slate-150 hover:bg-slate-100 dark:bg-slate-850/50 dark:border-slate-800 dark:hover:bg-slate-850'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-extrabold text-slate-850 dark:text-white">
                                {copy.studentName}
                              </span>
                              <span className="text-[9px] text-slate-400 font-bold">
                                {copy.dateSubmitted}
                              </span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase">
                              {copy.filiere}
                            </p>
                            <p className="text-xs font-black text-slate-700 dark:text-slate-300 mt-1 truncate">
                              {copy.examTitle}
                            </p>
                          </div>
                        ))}
                        {ungradedCopies.length === 0 && (
                          <div className="py-12 text-center text-slate-450 text-xs font-bold space-y-2">
                            <p className="text-3xl">☕🎉</p>
                            <p>Toutes les copies ont été notées !</p>
                            <p className="text-[10px] font-normal text-slate-400">
                              Félicitations pour votre efficacité pédagogique.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Active Copy Details & Correction Form */}
                    <div className="md:col-span-7">
                      {selectedCopyForGrading ? (
                        <div className="space-y-4 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-850/40">
                          <div className="border-b border-slate-150 dark:border-slate-800 pb-3 space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-slate-850 dark:text-white">
                                {selectedCopyForGrading.studentName}
                              </span>
                              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded">
                                {selectedCopyForGrading.filiere}
                              </span>
                            </div>
                            <h4 className="text-sm font-black text-slate-800 dark:text-white">
                              {selectedCopyForGrading.examTitle}
                            </h4>
                            <p className="text-[10px] font-bold text-slate-450 uppercase">
                              Matière: {selectedCopyForGrading.moduleName}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Travail soumis par l'élève :</span>
                            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-mono leading-relaxed max-h-[140px] overflow-y-auto">
                              {selectedCopyForGrading.submissionText}
                            </div>
                          </div>

                          {/* Form fields */}
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-2">
                            <div className="sm:col-span-4 space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Note finale (/20)</label>
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                max="20"
                                value={gradingScore}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  if (val < 0) setGradingScore('0');
                                  else if (val > 20) setGradingScore('20');
                                  else setGradingScore(e.target.value);
                                }}
                                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 border border-slate-200 dark:border-slate-800 font-extrabold text-slate-850 dark:text-white"
                              />
                            </div>

                            <div className="sm:col-span-8 space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Commentaires d'évaluation</label>
                              <input
                                type="text"
                                placeholder="Ex: Excellent raisonnement, code très bien structuré."
                                value={gradingComments}
                                onChange={(e) => setGradingComments(e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 border border-slate-200 dark:border-slate-800 font-bold"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                const score = parseFloat(gradingScore) || 15;
                                const newGradeRecord = {
                                  id: 'gr-' + Date.now(),
                                  studentName: selectedCopyForGrading.studentName,
                                  studentEmail: selectedCopyForGrading.studentEmail,
                                  filiere: selectedCopyForGrading.filiere,
                                  moduleName: selectedCopyForGrading.moduleName,
                                  examTitle: selectedCopyForGrading.examTitle,
                                  grade: score,
                                  coefficient: 3,
                                  comments: gradingComments || 'Très bon devoir, les acquis d’apprentissage sont validés.',
                                  status: score >= 10 ? 'Validé' : 'Rattrapage'
                                };

                                // Save the grade in our global state
                                setGrades([newGradeRecord, ...grades]);
                                // Remove copy from ungraded copies
                                setUngradedCopies(ungradedCopies.filter(c => c.id !== selectedCopyForGrading.id));
                                triggerNotification(`Copie de ${selectedCopyForGrading.studentName} notée avec ${score}/20 ! Bulletin mis à jour ! 📑🎖️`, 'success');
                                setSelectedCopyForGrading(null);
                              }}
                              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow flex items-center gap-1.5"
                            >
                              Valider & Enregistrer la Note
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full min-h-[250px] border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-6 text-slate-400 text-xs font-bold text-center space-y-1">
                          <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                          <p>Aucune copie sélectionnée.</p>
                          <p className="text-[10px] font-normal text-slate-400">
                            Sélectionnez une copie d'élève dans la liste de gauche pour l'évaluer et lui attribuer une note officielle.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-850">
                    <button
                      type="button"
                      onClick={() => {
                        setShowGradingModal(false);
                        setSelectedCopyForGrading(null);
                      }}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Fermer le Panel
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}

        {/* ==================== 14. ELEVATE: GESTION DES NOTES ET BULLETINS (TRAINER ONLY) ==================== */}
        {currentPage === 'notes' && (
          <motion.div
            key="notes"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <div className="flex flex-col sm:flex-row justify-between sm:items-center py-4 border-b border-slate-200 dark:border-slate-800 gap-4">
              <div>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 font-extrabold uppercase px-3 py-1 rounded-full tracking-widest">
                  Bulletins & Notes scolaires
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1.5">
                  Registre d'Évaluations & Notes
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Enregistrement des notes de contrôles continus, validation de modules et commentaires.
                </p>
              </div>
            </div>

            {/* Quick Average Widget */}
            <div className="p-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-teal-100">Performance générale de la promotion</span>
                <h3 className="text-lg font-black font-sans">Moyenne Générale Actuelle</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-black font-mono">
                  {(grades.reduce((sum, g) => sum + g.grade, 0) / grades.length).toFixed(2)} <span className="text-xs">/ 20</span>
                </span>
                <span className="text-[10px] bg-white/20 px-2 py-1 rounded font-black uppercase tracking-wider text-white">
                  Conforme aux standards
                </span>
              </div>
            </div>

            {/* Grade Registry table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Registre des Notes d'Élèves</h3>
                <span className="text-[10px] text-slate-450 font-extrabold uppercase">Dernière mise à jour : En direct</span>
              </div>

              <div className="divide-y divide-slate-150 dark:divide-slate-850 overflow-x-auto min-w-full">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-350">
                  <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 uppercase text-[9px] font-black tracking-widest">
                    <tr>
                      <th className="px-6 py-3.5">Élève</th>
                      <th className="px-6 py-3.5">Filière / Module</th>
                      <th className="px-6 py-3.5">Intitulé de l'Épreuve</th>
                      <th className="px-6 py-3.5">Coefficient</th>
                      <th className="px-6 py-3.5">Note attribuée</th>
                      <th className="px-6 py-3.5">Appréciations & Avis</th>
                      <th className="px-6 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                    {grades.map((g) => (
                      <tr key={g.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/40">
                        <td className="px-6 py-4">
                          <p className="font-extrabold text-slate-850 dark:text-slate-100">{g.studentName}</p>
                          <p className="text-[10px] text-slate-400">{g.studentEmail}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-slate-700 dark:text-slate-300">{g.moduleName}</p>
                          <p className="text-[10px] text-slate-400">{g.filiere}</p>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-500">{g.examTitle}</td>
                        <td className="px-6 py-4 font-black">× {g.coefficient}</td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-black font-mono ${g.grade >= 10 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {g.grade.toFixed(1)} / 20
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-[11px] leading-relaxed max-w-xs font-medium">
                          {g.comments}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              setEditingGrade(g);
                              setEditGradeVal(g.grade.toString());
                              setEditGradeComm(g.comments);
                            }}
                            className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white rounded-xl text-[10px] tracking-wider uppercase font-extrabold cursor-pointer transition-all inline-flex items-center gap-1 shadow-sm border-none"
                          >
                            ✏️ Noter
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Inline grade modifier dialog */}
            {editingGrade && (
              <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl relative"
                >
                  <button
                    onClick={() => setEditingGrade(null)}
                    className="absolute top-4 right-4 h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 flex items-center justify-center outline-none cursor-pointer text-lg font-bold"
                  >
                    ×
                  </button>

                  <div className="space-y-1">
                    <h3 className="font-extrabold text-lg text-slate-850 dark:text-slate-100">Attribuer une Note</h3>
                    <p className="text-xs text-slate-450">Ajustez la performance et rédigez un commentaire constructif.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Élève évalué</span>
                      <p className="text-xs font-black text-slate-800 dark:text-white">{editingGrade.studentName}</p>
                      <p className="text-[10px] text-slate-500 font-bold">{editingGrade.moduleName}</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Note Attribuée (sur 20)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="20"
                        placeholder="Ex: 15.5"
                        value={editGradeVal}
                        onChange={(e) => setEditGradeVal(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 border border-slate-150 dark:border-slate-800 font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Appréciations & Commentaires du Jury</label>
                      <textarea
                        rows={3}
                        placeholder="Ex: Excellent raisonnement, rigueur de programmation impeccable."
                        value={editGradeComm}
                        onChange={(e) => setEditGradeComm(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 border border-slate-150 dark:border-slate-800 font-bold font-sans"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-4">
                    <button
                      type="button"
                      onClick={() => setEditingGrade(null)}
                      className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const score = parseFloat(editGradeVal);
                        if (isNaN(score) || score < 0 || score > 20) {
                          triggerNotification('La note doit être un nombre compris entre 0 et 20.', 'warning');
                          return;
                        }
                        const updated = grades.map((g) => {
                          if (g.id === editingGrade.id) {
                            return {
                              ...g,
                              grade: score,
                              comments: editGradeComm,
                              status: score >= 10 ? 'Validé' : 'Rattrapage'
                            };
                          }
                          return g;
                        });
                        setGrades(updated);
                        setEditingGrade(null);
                        triggerNotification('Note enregistrée avec succès !', 'success');
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-blue-700 shadow"
                    >
                      Enregistrer la Note
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}

        {currentPage === 'etudiants' && (() => {
          const allStudents = [
            { id: 'stud-1', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@etu.univ.fr', filiere: 'Ingénierie Logicielle & Web', level: 'Licence 3', status: 'Admis', grade: 16.5, image: 'JD' },
            { id: 'stud-2', prenom: 'Sophie', nom: 'Martin', email: 'sophie.martin@etu.univ.fr', filiere: 'Intelligence Artificielle & Data', level: 'Master 2', status: 'Admis', grade: 15.8, image: 'SM' },
            { id: 'stud-3', prenom: 'Marc', nom: 'Leroy', email: 'marc.leroy@etu.univ.fr', filiere: 'CyberSécurité & Réseaux', level: 'Licence 3', status: 'En cours', grade: 13.9, image: 'ML' },
            { id: 'stud-4', prenom: 'Jacquecin', nom: 'Grela', email: 'jacquecingrelae@gmail.com', filiere: 'Marketing Digital & Tech', level: 'Master 2', status: 'Inscrit', grade: 17.2, image: 'JG' },
            { id: 'stud-5', prenom: 'Julie', nom: 'Marquet', email: 'julie.marquet@etu.univ.fr', filiere: 'Administration d\'Entreprise', level: 'Master 1', status: 'Certifié', grade: 15.2, image: 'JM' },
            { id: 'stud-6', prenom: 'Lucas', nom: 'Bernard', email: 'lucas.bernard@etu.univ.fr', filiere: 'Ingénierie Logicielle', level: 'Master 1', status: 'Admis', grade: 14.1, image: 'LB' },
            { id: 'stud-7', prenom: 'Marc-Antoine', nom: 'Grela', email: 'marc.antoine@etu.univ.fr', filiere: 'Licence Informatique', level: 'Licence 2', status: 'Inscrit', grade: 14.8, image: 'MA' }
          ];

          const totalCount = allStudents.length;
          const admissibleStudents = allStudents.filter(s => s.status === 'Admis' || s.status === 'Certifié' || s.status === 'Inscrit');
          const validationRate = ((admissibleStudents.length / totalCount) * 100).toFixed(1);
          const averageGrade = (allStudents.reduce((sum, s) => sum + s.grade, 0) / totalCount).toFixed(1);

          let filteredStudents = allStudents;
          if (studentDirFilter === 'admissible') {
            filteredStudents = admissibleStudents;
          } else if (studentDirFilter === 'high_grade') {
            filteredStudents = allStudents.filter(s => s.grade >= 15);
          }

          const finalStudents = filteredStudents.filter(st => {
            const term = timetableSearch.toLowerCase();
            return st.prenom.toLowerCase().includes(term) || st.nom.toLowerCase().includes(term) || st.filiere.toLowerCase().includes(term) || st.email.toLowerCase().includes(term);
          });

          return (
            <motion.div
              key="etudiants"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Header section */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center py-4 border-b border-slate-200 dark:border-slate-800 gap-4">
                <div>
                  <span className="text-[10px] bg-blue-600 text-yellow-300 border border-blue-700 font-extrabold uppercase px-3 py-1 rounded-full tracking-widest shadow-sm">
                    Annuaire Scolaire • Bleu & Jaune
                  </span>
                  <h1 className="text-3xl font-black tracking-tight mt-2 font-sans">
                    <span className="text-blue-700 dark:text-blue-400">Répertoire Général des </span>
                    <span className="text-yellow-500 dark:text-yellow-400">Étudiants</span>
                  </h1>
                  <p className="text-xs text-blue-600/90 dark:text-yellow-400/80 font-bold mt-1">
                    Recherchez et suivez les parcours, résultats scolaires et statuts d'inscription des apprenants EDUOnline.
                  </p>
                </div>
              </div>

              {/* Metrics block - now fully interactive buttons with hover scaling */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button
                  type="button"
                  onClick={() => {
                    setStudentDirFilter('all');
                    triggerNotification("Affichage de tous les étudiants actifs", "info");
                  }}
                  className={`p-5 rounded-2xl shadow-sm flex items-center gap-4 text-left transition-all duration-300 transform hover:scale-[1.03] active:scale-98 border-2 ${
                    studentDirFilter === 'all'
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-600 dark:border-blue-400'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${
                    studentDirFilter === 'all' ? 'bg-blue-600 text-yellow-300' : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                  }`}>
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-600 dark:text-blue-450 uppercase tracking-wider">Total Étudiants</p>
                    <p className="text-lg font-black text-yellow-500 dark:text-yellow-400 mt-0.5">{totalCount} Élèves Actifs</p>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">Cliquez pour voir tout</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStudentDirFilter('admissible');
                    triggerNotification("Filtre activé : Taux d'Admissibilité (Admis, Certifié & Inscrit)", "info");
                  }}
                  className={`p-5 rounded-2xl shadow-sm flex items-center gap-4 text-left transition-all duration-300 transform hover:scale-[1.03] active:scale-98 border-2 ${
                    studentDirFilter === 'admissible'
                      ? 'bg-yellow-50/70 dark:bg-yellow-950/15 border-yellow-500 dark:border-yellow-400'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-yellow-300'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${
                    studentDirFilter === 'admissible' ? 'bg-yellow-500 text-blue-900' : 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-450'
                  }`}>
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-yellow-600 dark:text-yellow-500 uppercase tracking-wider">Taux d'Admissibilité</p>
                    <p className="text-lg font-black text-blue-700 dark:text-blue-400 mt-0.5">{validationRate} % de Validation</p>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">Cliquez pour filtrer</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStudentDirFilter('high_grade');
                    triggerNotification("Filtre activé : Excellents résultats (moyenne >= 15/20)", "info");
                  }}
                  className={`p-5 rounded-2xl shadow-sm flex items-center gap-4 text-left transition-all duration-300 transform hover:scale-[1.03] active:scale-98 border-2 ${
                    studentDirFilter === 'high_grade'
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-600 dark:border-blue-400'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${
                    studentDirFilter === 'high_grade' ? 'bg-blue-600 text-yellow-300' : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-455'
                  }`}>
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-600 dark:text-blue-450 uppercase tracking-wider">Moyenne Générale</p>
                    <p className="text-lg font-black text-yellow-500 dark:text-yellow-400 mt-0.5">{averageGrade} / 20</p>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">Cliquez pour filtrer (&ge; 15/20)</p>
                  </div>
                </button>
              </div>

              {/* Reset active filters display */}
              {studentDirFilter !== 'all' && (
                <div className="flex items-center gap-2 px-5 py-2.5 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-xl text-xs font-bold text-blue-800 dark:text-yellow-300">
                  <span>
                    Filtre actif : {
                      studentDirFilter === 'admissible' 
                        ? "Taux d'Admissibilité (Admis, Certifié & Inscrit)" 
                        : "Excellence Académique (Moyenne ≥ 15/20)"
                    }
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setStudentDirFilter('all');
                      triggerNotification("Filtre réinitialisé", "info");
                    }}
                    className="ml-auto px-2.5 py-1 bg-blue-600 text-yellow-300 rounded-lg hover:bg-blue-700 transition-all font-black text-[10px] uppercase tracking-wider cursor-pointer shadow"
                  >
                    Réinitialiser le filtre
                  </button>
                </div>
              )}

              {/* Student Directory Table / Grid with search & filters */}
              <div className="bg-yellow-50/45 dark:bg-slate-900 border border-yellow-250 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-yellow-200/50 dark:border-slate-850 pb-4">
                  <h3 className="font-extrabold text-sm text-blue-700 dark:text-yellow-400 flex items-center gap-2">
                    <span>Liste Nominative des Élèves</span>
                    <span className="text-[10px] bg-blue-600 text-yellow-300 font-extrabold px-2.5 py-0.5 rounded-full shadow-sm">
                      {finalStudents.length} Étudiants
                    </span>
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
                    {/* Search box */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-blue-600 dark:text-yellow-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Rechercher un étudiant..."
                        value={timetableSearch}
                        onChange={(e) => setTimetableSearch(e.target.value)}
                        className="pl-9.5 pr-4 py-2 bg-white dark:bg-slate-850 border border-yellow-250 dark:border-slate-800 rounded-xl text-xs font-bold text-blue-800 dark:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 font-sans w-full sm:w-56"
                      />
                    </div>
                  </div>
                </div>

                {/* Grid representation for premium visual layout */}
                {finalStudents.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs font-bold">
                    Aucun étudiant ne correspond à la recherche ou au filtre actuel.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                    {finalStudents.map((student) => (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        key={student.id}
                        className="p-5 bg-white dark:bg-slate-950/60 rounded-2xl border border-yellow-100 dark:border-slate-850 flex flex-col justify-between space-y-4 shadow-sm hover:border-yellow-400 dark:hover:border-blue-500 transition-all duration-300"
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-600 text-yellow-300 border-2 border-yellow-400 font-black flex items-center justify-center text-xs shrink-0 shadow-sm font-sans">
                            {student.image}
                          </div>
                          <div className="space-y-0.5 overflow-hidden">
                            <h4 className="font-extrabold text-sm text-blue-700 dark:text-blue-400 truncate">
                              {student.prenom} {student.nom}
                            </h4>
                            <p className="text-[10px] text-yellow-600 dark:text-yellow-450 font-bold truncate">
                              {activeHomeTab === 'admin' ? student.email : '••••••••@univ.fr'}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 border-t border-yellow-100 dark:border-slate-855 pt-3">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-blue-600 dark:text-blue-400 font-bold uppercase text-[9px]">Filière</span>
                            <span className="font-extrabold text-yellow-600 dark:text-yellow-450 truncate max-w-[150px]">{student.filiere}</span>
                          </div>
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-blue-600 dark:text-blue-400 font-bold uppercase text-[9px]">Niveau</span>
                            <span className="font-extrabold text-blue-800 dark:text-yellow-400">{student.level}</span>
                          </div>
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-blue-600 dark:text-blue-400 font-bold uppercase text-[9px]">Moyenne</span>
                            <span className="font-black text-yellow-500 dark:text-yellow-400">
                              {activeHomeTab === 'admin' ? `${student.grade}/20` : '🔒 Réservé Admin'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-blue-600 dark:text-blue-400 font-bold uppercase text-[9px]">Statut</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              student.status === 'Admis' || student.status === 'Certifié'
                                ? 'bg-blue-600 text-yellow-300 border border-yellow-400'
                                : 'bg-yellow-400 text-blue-900 border border-blue-600'
                            }`}>
                              {student.status}
                            </span>
                          </div>
                        </div>

                        {activeHomeTab === 'admin' && (
                          <div className="pt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const matchingRec = {
                                  id: student.id,
                                  prenom: student.prenom,
                                  nom: student.nom,
                                  filiere: student.filiere,
                                  promotion: '2026',
                                  grade: student.level.includes('Master') ? "Master d'État" : 'Licence Supérieure',
                                  averageGrade: student.grade,
                                  certId: 'CERT-A' + Math.floor(10000000 + Math.random() * 90000000)
                                };
                                setSelectedDiplomaStudent(matchingRec);
                                setCurrentPage('diplomes');
                                triggerNotification(`Sélection de ${student.prenom} pour l'espace diplômes`, 'info');
                              }}
                              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-yellow-300 border border-yellow-400 font-extrabold text-[10px] uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 shadow-sm font-sans"
                            >
                              <Award className="w-3.5 h-3.5 text-yellow-300" />
                              Gérer Diplôme
                            </button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })()}

        {currentPage === 'about' && (
          <motion.div
            key="about"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <div className="text-center space-y-2">
              <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-900 font-extrabold uppercase px-3 py-1 rounded-full tracking-widest">
                À Propos
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1.5 font-sans">
                Qui Sommes-Nous ?
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Découvrez la première plateforme d'enseignement d'excellence universitaire à distance.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  Notre Mission Académique
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  EDUOnline est un établissement d'enseignement supérieur d'excellence qui propose des cursus diplômants d'État en Informatique, Management, Droit, et Marketing Digital. Notre engagement est d'assurer l'égalité des chances en rendant les formations universitaires de haute technologie accessibles partout dans le monde.
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Grâce à notre équipe pédagogique composée d'enseignants chercheurs et de professionnels de renom, nous offrons un accompagnement personnalisé par tuteurs interposés et un système d'apprentissage propulsé par l'intelligence artificielle pour maximiser votre employabilité et votre réussite.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="p-5 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-2xl">
                  <h4 className="font-bold text-sm text-blue-600 dark:text-blue-450 mb-2">🎓 Cursus Accrédités RNCP</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                    Tous nos diplômes de Licence et de Master sont certifiés par l'État et reconnus à l'échelle européenne et internationale pour une intégration professionnelle réussie.
                  </p>
                </div>

                <div className="p-5 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-2xl">
                  <h4 className="font-bold text-sm text-yellow-600 dark:text-yellow-450 mb-2">🤖 Pédagogie Augmentée par l'IA</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                    Nos étudiants bénéficient d'un tuteur virtuel intelligent disponible 24h/24 pour répondre à leurs questions académiques et les guider pas à pas dans leur scolarité.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {currentPage === 'contact' && (
          <motion.div
            key="contact"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="max-w-xl mx-auto space-y-8"
          >
            <div className="text-center space-y-2">
              <span className="text-[10px] bg-yellow-400/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400 border border-yellow-500/20 font-extrabold uppercase px-3 py-1 rounded-full tracking-widest">
                Contactez-Nous
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1.5 font-sans">
                Entrer en Relation
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Notre secrétariat d'études et notre équipe d'assistance sont à votre entière disposition.
              </p>
            </div>

            <div className="bg-blue-600 dark:bg-blue-900 border border-yellow-400 rounded-3xl p-8 shadow-sm space-y-6">
              <div className="space-y-4">
                <h3 className="text-base font-extrabold text-yellow-300 dark:text-yellow-300 border-b border-blue-500 pb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-yellow-300" />
                  Coordonnées de l'Université
                </h3>
                <div className="space-y-3 text-xs text-yellow-100 dark:text-yellow-200 font-semibold">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">📍</span>
                    <span>Adresse : Antananarivo 101</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">📞</span>
                    <span>Secrétariat : 034906750 (Lundi au Vendredi de 9h à 18h)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">✉️</span>
                    <span>Courriel : grelaselson@gmail.com</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#F59E0B]" />
                  Envoyer un Message
                </h3>
                
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    triggerNotification('Votre message a été envoyé avec succès au secrétariat académique !', 'success');
                    (e.target as HTMLFormElement).reset();
                  }}
                  className="space-y-4 text-xs font-semibold"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase tracking-widest">Nom</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Dupont" 
                        className="w-full px-4 py-2.5 bg-blue-100 border border-blue-400 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 text-black font-medium placeholder-blue-700/70 focus:bg-blue-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase tracking-widest">Prénom</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Jean" 
                        className="w-full px-4 py-2.5 bg-blue-100 border border-blue-400 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 text-black font-medium placeholder-blue-700/70 focus:bg-blue-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase tracking-widest">Sujet de votre message</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Demande de renseignements pour inscription" 
                      className="w-full px-4 py-2.5 bg-blue-100 border border-blue-400 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 text-black font-medium placeholder-blue-700/70 focus:bg-blue-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase tracking-widest">Message</label>
                    <textarea 
                      required 
                      rows={4}
                      placeholder="Rédigez votre message ici..." 
                      className="w-full px-4 py-2.5 bg-blue-100 border border-blue-400 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 text-black font-medium placeholder-blue-700/70 focus:bg-blue-200"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold uppercase tracking-wider rounded-xl cursor-pointer shadow-sm text-[10px]"
                  >
                    Envoyer au Secrétariat
                  </motion.button>
                </form>
              </div>
            </div>
          </motion.div>
        )}

        {currentPage === 'connexion' && (
          <motion.div
            key="connexion"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="max-w-xl mx-auto space-y-8 py-6 font-sans"
          >
            {isLoggedIn ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-xl">
                <div className="h-16 w-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto text-3xl font-bold">
                  ✓
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white font-sans">Session Active</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Vous êtes déjà connecté à l'académie</p>
                </div>

                <div className="p-5 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-3 max-w-sm mx-auto text-left">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold uppercase">Utilisateur :</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">{currentUser?.prenom} {currentUser?.nom}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold uppercase">Courriel :</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">{currentUser?.email}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold uppercase">Rôle :</span>
                    <span className="font-extrabold text-blue-600 dark:text-yellow-400 uppercase tracking-wider">{currentUser?.role === 'admin' ? 'Administrateur d\'État' : currentUser?.role === 'tutor' ? 'Formateur Certifié' : 'Apprenant Académique'}</span>
                  </div>
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setCurrentPage('home');
                    }}
                    className="px-6 py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-extrabold text-xs uppercase tracking-widest rounded-xl cursor-pointer font-sans"
                  >
                    Retour à l'accueil
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      triggerNotification('Déconnexion effectuée.', 'info');
                    }}
                    className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl shadow cursor-pointer font-sans flex items-center gap-1.5"
                  >
                    <LogOut className="w-4 h-4" />
                    Se Déconnecter
                  </button>
                </div>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-gradient-to-br from-yellow-300 via-amber-50 to-blue-200 border-4 border-blue-600 rounded-3xl p-8 shadow-2xl space-y-6 text-slate-950 relative"
              >
                <div className="text-center space-y-2">
                  <motion.div 
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    className="h-12 w-12 rounded-2xl bg-blue-600 border border-yellow-400 text-yellow-300 flex items-center justify-center mx-auto text-xl shadow-md cursor-pointer transition-transform"
                  >
                    🔒
                  </motion.div>
                  <h3 className="font-extrabold text-xl text-slate-950 tracking-tight font-sans">Portail d'Authentification</h3>
                  <p className="text-[10px] text-blue-900 font-extrabold uppercase tracking-wider">Accès aux scolarités et tuteurs d'IA</p>
                </div>

                {/* Quick Demo Accounts */}
                <div className="space-y-3 p-4 bg-white/60 border border-blue-300/50 rounded-2xl">
                  <span className="block text-[8px] uppercase tracking-widest font-black text-center text-blue-900">Comptes de Démonstration Académique</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => {
                        fastLoginStudent();
                        setTimeout(() => {
                          const form = document.getElementById('sidebar-login-form') as HTMLFormElement;
                          if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                        }, 200);
                      }}
                      className="py-2.5 px-3 bg-white/80 hover:bg-blue-600 hover:text-white border border-blue-400 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider rounded-xl inline-flex items-center justify-center gap-1 cursor-pointer transition-all shadow-sm"
                    >
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      Étudiant
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => {
                        fastLoginAdmin();
                        setTimeout(() => {
                          const form = document.getElementById('sidebar-login-form') as HTMLFormElement;
                          if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                        }, 200);
                      }}
                      className="py-2.5 px-3 bg-white/80 hover:bg-blue-600 hover:text-white border border-blue-400 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider rounded-xl inline-flex items-center justify-center gap-1 cursor-pointer transition-all shadow-sm"
                    >
                      <Shield className="w-3.5 h-3.5 text-blue-600" />
                      Admin
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => {
                        // Fast login as trainer
                        setLoginEmail('trainer@univ-online.fr');
                        setLoginPassword('Trainer123!');
                        triggerNotification('Compte formateur démo pré-rempli !', 'info');
                        setTimeout(() => {
                          const form = document.getElementById('sidebar-login-form') as HTMLFormElement;
                          if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                        }, 200);
                      }}
                      className="py-2.5 px-3 bg-white/80 hover:bg-blue-600 hover:text-white border border-blue-400 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider rounded-xl inline-flex items-center justify-center gap-1 cursor-pointer transition-all shadow-sm"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                      Formateur
                    </motion.button>
                  </div>
                </div>

                <form id="sidebar-login-form" onSubmit={handleLogin} className="space-y-4 font-sans">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-950 font-sans">Adresse Courriel Universitaire</label>
                    <input
                      type="email"
                      placeholder="votre.nom@univ-online.fr"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full px-4 py-3 text-xs bg-white text-black placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 border-2 border-blue-600 font-bold font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-950 font-sans">Mot de Passe Sécurisé</label>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 text-xs bg-white text-black placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 border-2 border-blue-600 font-bold font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800 flex items-center justify-center border-none bg-transparent cursor-pointer outline-none"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-500 hover:to-yellow-400 text-slate-950 text-xs font-black uppercase tracking-widest rounded-xl shadow-lg transition-all cursor-pointer font-sans"
                  >
                    Se Connecter au Portail
                  </motion.button>
                </form>
              </motion.div>
            )}
          </motion.div>
        )}

          </AnimatePresence>
        </main>
      </div>

      {/* ==================== MODAL: ADD TIMETABLE SLOTS (ADMIN ONLY) ==================== */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl relative"
          >
            <button
              onClick={() => setShowEventModal(false)}
              className="absolute top-4 right-4 h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 flex items-center justify-center outline-none cursor-pointer text-lg font-bold"
            >
              ×
            </button>

            <div className="space-y-1">
              <h3 className="font-extrabold text-lg">Nouveau Créneau Académique</h3>
              <p className="text-[10px] text-slate-450 uppercase font-bold">Ajout permanent sur l'Emploi du Temps d'État</p>
            </div>

            <form onSubmit={handleCreateTimetableEvent} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Intitulé du Cours *</label>
                <input
                  type="text"
                  placeholder="e.g. Conception Web (React)"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-850 outline-none focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nom de l'Enseignant *</label>
                <input
                  type="text"
                  placeholder="e.g. Prof. Martin"
                  value={newProf}
                  onChange={(e) => setNewProf(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-850 outline-none focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jour de la Semaine</label>
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-850 outline-none"
                  >
                    <option value="Lundi">Lundi</option>
                    <option value="Mardi">Mardi</option>
                    <option value="Mercredi">Mercredi</option>
                    <option value="Jeudi">Jeudi</option>
                    <option value="Vendredi">Vendredi</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Badge Couleur</label>
                  <select
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-850 outline-none"
                  >
                    <option value="blue">Bleu Scolaire</option>
                    <option value="emerald">Vert Alternance</option>
                    <option value="amber">Ambre Scolarité</option>
                    <option value="violet">Violet Spécialisé</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Début *</label>
                  <input
                    type="text"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-850 outline-none text-center"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fin *</label>
                  <input
                    type="text"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-850 outline-none text-center"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Salle de classe</label>
                <input
                  type="text"
                  placeholder="e.g. Amphi d'Honneur"
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-850 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filière / Département académique</label>
                <select
                  value={newCourseFiliere}
                  onChange={(e) => setNewCourseFiliere(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-850 outline-none cursor-pointer"
                >
                  <option value="Tous">Toutes les filières (Commun)</option>
                  <option value="informatique">💻 Informatique</option>
                  <option value="gestion">📊 Gestion & Management</option>
                  <option value="droit">⚖️ Droit & Juridique</option>
                  <option value="marketing">📱 Marketing Digital</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-slate-950 text-xs font-black uppercase tracking-widest rounded-xl cursor-pointer"
              >
                Inscrire le cours programmé
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* ==================== MODAL: ADD COURSE / MATIÈRE (INTERACTIVE & SYNCHRONIZED) ==================== */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl relative"
          >
            <button
              onClick={() => setShowAddCourseModal(false)}
              className="absolute top-4 right-4 h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 flex items-center justify-center outline-none cursor-pointer text-lg font-bold"
            >
              ×
            </button>

            <div className="space-y-1">
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#F59E0B]" />
                Créer une Matière Académique
              </h3>
              <p className="text-[10px] text-slate-450 uppercase font-bold tracking-widest">
                Ajouter au catalogue et synchroniser avec la base de données
              </p>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Titre de la matière *</label>
                  <input
                    type="text"
                    placeholder="e.g. Algorithmique & structures"
                    value={addCourseTitle}
                    onChange={(e) => setAddCourseTitle(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-850 outline-none focus:bg-white text-slate-800 dark:text-white"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Niveau *</label>
                  <select
                    value={addCourseLevel}
                    onChange={(e) => setAddCourseLevel(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-850 outline-none text-slate-800 dark:text-white cursor-pointer"
                  >
                    <option value="Licence">Licence (L1 - L3)</option>
                    <option value="Master">Master (M1 - M2)</option>
                    <option value="Doctorat">Doctorat</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description Académique *</label>
                <textarea
                  placeholder="Objectifs d'apprentissage fondamentaux de cette matière..."
                  value={addCourseDesc}
                  onChange={(e) => setAddCourseDesc(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-850 outline-none focus:bg-white text-slate-800 dark:text-white resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filière / Département *</label>
                  <select
                    value={addCourseCategory}
                    onChange={(e) => {
                      setAddCourseCategory(e.target.value);
                      if (e.target.value === 'informatique') setAddCourseImage('💻');
                      else if (e.target.value === 'gestion') setAddCourseImage('📊');
                      else if (e.target.value === 'droit') setAddCourseImage('⚖️');
                      else if (e.target.value === 'marketing') setAddCourseImage('📱');
                    }}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-850 outline-none text-slate-800 dark:text-white cursor-pointer"
                  >
                    <option value="informatique">💻 Informatique</option>
                    <option value="gestion">📊 Gestion & Management</option>
                    <option value="droit">⚖️ Droit & Juridique</option>
                    <option value="marketing">📱 Marketing Digital</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Icône Représentative</label>
                  <select
                    value={addCourseImage}
                    onChange={(e) => setAddCourseImage(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-850 outline-none text-slate-800 dark:text-white cursor-pointer"
                  >
                    <option value="💻">💻 Ordinateur (Informatique)</option>
                    <option value="📊">📊 Graphique (Gestion)</option>
                    <option value="⚖️">⚖️ Balance (Droit/Justice)</option>
                    <option value="📱">📱 Smartphone (Marketing)</option>
                    <option value="📚">📚 Livres Académiques</option>
                    <option value="🧪">🧪 Fiole (Sciences)</option>
                    <option value="🎓">🎓 Mortier Académique</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tarif annuel (Ariary) *</label>
                  <input
                    type="number"
                    value={addCoursePrice}
                    onChange={(e) => setAddCoursePrice(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-850 outline-none text-slate-800 dark:text-white"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Durée de formation *</label>
                  <input
                    type="text"
                    value={addCourseDuration}
                    onChange={(e) => setAddCourseDuration(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-850 outline-none text-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-md shadow-amber-500/10 transition-transform duration-100 active:scale-98"
              >
                Intégrer & Synchroniser la matière
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* ==================== MODAL: STUDENT SIGNATURE REGISTER ==================== */}
      {showSignModal && activeSigningRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150"
          >
            <button
              onClick={() => { setShowSignModal(false); setActiveSigningRecord(null); }}
              className="absolute top-4 right-4 h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 flex items-center justify-center outline-none cursor-pointer font-bold text-lg"
            >
              ×
            </button>

            <div className="space-y-1.5 text-center">
              <span className="p-2.5 rounded-full bg-blue-50 dark:bg-slate-850 text-blue-600 inline-block text-xl">✍️</span>
              <h3 className="font-extrabold text-lg">Émargement numérique requis</h3>
              <p className="text-[10px] text-slate-450 uppercase font-black">Certificat solennel annuel de scolarité</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-150 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-300 leading-relaxed font-semibold">
              <p className="font-extrabold mb-1 bg-transparent uppercase">Charte de l'étudiant :</p>
              Je déclare sous foi de serment être présent à la séance académique du cours de <span className="text-blue-500 font-extrabold">"{activeSigningRecord.courseTitle}"</span> en ce jour du <span className="font-extrabold">{activeSigningRecord.date}</span>. Un faux émargement m'expose à l'exclusion définitive.
            </div>

            <form onSubmit={handleSign} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Paraphe d'identité (Saisir votre prénom et nom) *</label>
                <input
                  type="text"
                  placeholder="e.g. Gre Las Martin"
                  value={typedSignName}
                  onChange={(e) => setTypedSignName(e.target.value)}
                  className="w-full px-4 py-3 text-xs font-mono rounded-xl border border-slate-205 dark:border-slate-750 bg-slate-50 dark:bg-slate-850 outline-none text-center focus:bg-white focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Styled canvas-like digital signature sign box layout decoration */}
              <div className="border border-dashed border-slate-250 dark:border-slate-700 rounded-xl p-6 bg-slate-50/50 dark:bg-slate-950/30 text-center font-mono select-none relative overflow-hidden flex flex-col justify-center items-center group cursor-crosshair">
                <span className="absolute bottom-1 right-2 text-[7px] text-slate-400 uppercase font-bold tracking-widest">Zone tactile de signature</span>
                {typedSignName ? (
                  <span className="text-2xl font-black italic tracking-widest text-slate-650 dark:text-slate-100 font-sans opacity-70 rotate-[-4deg] select-none block py-2 select-none pointer-events-none uppercase">
                    {typedSignName}
                  </span>
                ) : (
                  <div className="text-center space-y-1 text-slate-400 pointer-events-none">
                    <span className="block text-xl">🖊️</span>
                    <span className="block text-[8px] uppercase tracking-wider font-extrabold">Saisissez votre paraphe ci-dessus pour simuler la griffe</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl cursor-pointer"
              >
                Signer et Soumettre ma présence
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* ==================== MODAL: DYNAMIC SWISS MOUNT VOUCHER PRINTING LAYOUT ==================== */}
      {activeVoucher && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => setActiveVoucher(null)}
              className="absolute top-4 right-4 h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-450 hover:text-slate-800 flex items-center justify-center outline-none cursor-pointer hover:bg-slate-200"
            >
              ×
            </button>

            {/* Print area layout frame */}
            <div id="school-voucher-receipt-printable-frame" className="p-6 border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 text-slate-800 font-sans space-y-6 relative overflow-hidden">
              {/* Certificate watermark overlay background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03]">
                <div className="text-[170px] font-black uppercase tracking-widest -rotate-45">UNIV</div>
              </div>

              {/* Invoice header logo */}
              <div className="flex justify-between items-start gap-4 border-b border-slate-200 pb-5">
                <div>
                  <div className="flex items-center gap-1.5">
                    <div className="bg-blue-600 text-white p-1 rounded-lg shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <span className="font-extrabold text-lg text-slate-900">EDUOnline France</span>
                  </div>
                  <span className="block text-[8px] uppercase tracking-widest text-[#F59E0B] font-bold mt-0.5">Scolarité Supérieure d'État</span>
                </div>

                <div className="text-right">
                  <span className="block text-xs font-black text-rose-500 uppercase tracking-widest">REÇU FISCAL SÉCURISÉ</span>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase mt-0.5 mt-1">Solder Intégralement</span>
                </div>
              </div>

              {/* Administrative grids details */}
              <div className="grid grid-cols-2 gap-6 text-xs leading-relaxed">
                <div>
                  <span className="block text-[9px] uppercase font-bold text-slate-455 tracking-widest">ORGANISME PAYEUR</span>
                  <p className="font-extrabold text-slate-800 font-sans">{activeVoucher.userName}</p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Élève Enrolled (ID : student1)</p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Université en Ligne</p>
                </div>

                <div className="text-right sm:text-right">
                  <div className="space-y-0.5">
                    <p><span className="text-slate-400 font-bold uppercase text-[9px]">FACTURE RÉF :</span> <span className="font-black font-mono text-slate-700">{activeVoucher.receiptNumber}</span></p>
                    <p><span className="text-slate-400 font-bold uppercase text-[9px]">DATE D'ACQUITTEMENT :</span> <span className="font-semibold">{activeVoucher.date}</span></p>
                    <p><span className="text-slate-400 font-bold uppercase text-[9px]">MODE DE SOLDER :</span> <span className="font-semibold">{activeVoucher.paymentMethod}</span></p>
                  </div>
                </div>
              </div>

              {/* Transactions grid ledger */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden font-sans">
                <div className="grid grid-cols-3 bg-slate-50 dark:bg-slate-850 p-3 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-200">
                  <span>DESSIN ACADÉMIQUE</span>
                  <span className="text-center">QUANTITÉ</span>
                  <span className="text-right">MONTANT SOLDE</span>
                </div>
                <div className="p-3 grid grid-cols-3 text-xs font-semibold text-slate-705 items-center">
                  <span>
                    <span className="block font-bold text-slate-805 text-slate-800">{activeVoucher.courseTitle}</span>
                    <span className="text-[9px] opacity-60">Cycle Master d'Excellence universitaire</span>
                  </span>
                  <span className="text-center font-bold">1 Modules scolaires</span>
                  <span className="text-right font-black text-slate-900">{formatAriary(activeVoucher.amount)}</span>
                </div>
              </div>

              {/* Totals tally */}
              <div className="flex justify-between items-center bg-slate-55 bg-indigo-50/20 px-5 py-4 border border-indigo-100 rounded-2xl text-xs">
                <div>
                  <span className="block text-[8px] uppercase tracking-widest text-[#F59E0B] font-extrabold">TVA acquittée (Art. 261-4-4° du CGI)</span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Taxe d'apprentissage incluse</p>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase text-slate-400 font-bold tracking-widest">SOLDER TOTAL T.C.</span>
                  <p className="text-xl font-extrabold text-slate-900">{formatAriary(activeVoucher.amount)}</p>
                </div>
              </div>

              {/* Stamp and signature elements */}
              <div className="flex justify-between items-end pt-2 text-[9px] text-slate-400 font-sans uppercase">
                <div className="space-y-1">
                  <p className="font-bold flex items-center gap-1 text-emerald-500">
                    <span>🟢 SECURE PROTOCOL VERIFIED</span>
                  </p>
                  <p className="font-semibold text-slate-400">Épargné sous le sceau de l'Université Française numérique</p>
                </div>

                {/* Sceau / Stamp representation */}
                <div className="h-16 w-16 border-4 border-dashed border-red-500/30 rounded-full flex flex-col items-center justify-center text-center text-red-500/40 transform rotate-[10deg] font-sans">
                  <span className="text-[6px] font-black tracking-widest">SCOLARITÉ</span>
                  <span className="text-[8px] font-bold tracking-widest">AGRÉÉ</span>
                </div>
              </div>

            </div>

            {/* Direct printable trigger button and tools */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownloadPDF}
                className="flex-grow py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4 shrink-0 animate-bounce" />
                Télécharger le Reçu PDF
              </button>

              <button
                onClick={() => {
                  printSpecificElement('school-voucher-receipt-printable-frame');
                }}
                className="py-3 px-5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-widest rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                title="Déclencher l'impression native du navigateur"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimer
              </button>

              <button
                onClick={() => {
                  setActiveVoucher(null);
                }}
                className="px-6 py-3 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer font-sans transition-colors"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ==================== STYLIZED LOGIN & DEMO ACCOUNT ACCOUNT POPUP MODAL ==================== */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-gradient-to-br from-yellow-300 via-amber-50 to-blue-200 border-4 border-blue-600 rounded-3xl p-6 space-y-6 shadow-2xl relative text-slate-950"
          >
            {/* Close */}
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 h-7 w-7 rounded-full bg-white/80 border border-blue-400 hover:bg-blue-600 hover:text-white text-blue-900 flex items-center justify-center outline-none cursor-pointer transition-colors"
            >
              ×
            </button>

            <div className="text-center space-y-2">
              <div className="h-12 w-12 rounded-2xl bg-blue-600 border border-yellow-400 text-yellow-300 flex items-center justify-center mx-auto text-xl shadow-md">
                🔒
              </div>
              <h3 className="font-extrabold text-lg text-slate-950 tracking-tight">Portail d'Authentification</h3>
              <p className="text-[10px] text-blue-900 font-bold uppercase tracking-wider">Accès aux scolarités et tuteurs d'IA</p>
            </div>

            {/* Quick Demo Accounts */}
            <div className="space-y-2 p-3 bg-white/60 border border-blue-300/50 rounded-xl">
              <span className="block text-[8px] uppercase tracking-widest font-black text-center text-blue-900">Authentification Rapide Démo</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={fastLoginStudent}
                  className="py-2 border border-blue-400 text-slate-950 font-bold text-[10px] uppercase tracking-wider hover:bg-blue-600 hover:text-white rounded-xl inline-flex items-center justify-center gap-1 cursor-pointer transition-all bg-white/80 shadow-sm"
                >
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  Gre Las (Élève)
                </button>
                <button
                  type="button"
                  onClick={fastLoginAdmin}
                  className="py-2 border border-blue-400 text-slate-950 font-bold text-[10px] uppercase tracking-wider hover:bg-blue-600 hover:text-white rounded-xl inline-flex items-center justify-center gap-1 cursor-pointer transition-all bg-white/80 shadow-sm"
                >
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  Admin Faculté
                </button>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-slate-900">Courriel</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full px-4 py-2.5 text-xs rounded-xl border-2 border-blue-600 bg-white outline-none focus:ring-2 focus:ring-blue-700 text-black placeholder-slate-400 font-bold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-slate-900">Mot de passe</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 text-xs rounded-xl border-2 border-blue-600 bg-white outline-none focus:ring-2 focus:ring-blue-700 text-black placeholder-slate-400 font-bold"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-500 hover:to-yellow-400 text-slate-950 text-xs font-black uppercase tracking-widest rounded-xl shadow-lg cursor-pointer transition-transform active:scale-98"
              >
                S'authentifier
              </button>
            </form>

            {/* Form de création de compte */}
            <form onSubmit={handleRegister} className="pt-2 border-t border-blue-300 text-center space-y-4">
              <span className="block text-[10px] text-blue-900 font-extrabold uppercase">
                {showValidationStep ? "🔒 Validation d'Inscription" : "Pas encore de dossier ?"}
              </span>
              
              <div className="space-y-3">
                {!showValidationStep ? (
                  <>
                    <div className="grid grid-cols-2 gap-2 text-left">
                      <input
                        type="text"
                        value={regPrenom}
                        onChange={(e) => setRegPrenom(e.target.value)}
                        placeholder="Prénom"
                        className="w-full px-3 py-2 text-[11px] rounded-lg border-2 border-blue-600 bg-white outline-none text-black placeholder-slate-400 font-bold"
                        required
                      />
                      <input
                        type="text"
                        value={regNom}
                        onChange={(e) => setRegNom(e.target.value)}
                        placeholder="Nom"
                        className="w-full px-3 py-2 text-[11px] rounded-lg border-2 border-blue-600 bg-white outline-none text-black placeholder-slate-400 font-bold"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-left">
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="Courriel d'études"
                        className="w-full px-3 py-2 text-[11px] rounded-lg border-2 border-blue-600 bg-white outline-none text-black placeholder-slate-400 font-bold"
                        required
                      />
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Choisir mot de passe"
                        className="w-full px-3 py-2 text-[11px] rounded-lg border-2 border-blue-600 bg-white outline-none text-black placeholder-slate-400 font-bold"
                        required
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        className="flex-1 py-3 text-[10px] font-black uppercase bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-500 hover:to-yellow-400 text-slate-950 rounded-xl cursor-pointer transition-transform active:scale-98"
                      >
                        Créer Compte
                      </button>
                      <button
                        type="button"
                        onClick={autofillGrela}
                        className="flex-1 py-1 px-1 bg-white/80 border border-blue-400 text-blue-900 hover:bg-blue-600 hover:text-white font-black text-[9px] uppercase tracking-wider rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        🚀 Auto-remplir
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4 text-center">
                    <p className="text-[10px] text-blue-950 leading-relaxed max-w-xs mx-auto">
                      Un code de validation d'inscription a été généré pour votre compte étudiant d'État.
                    </p>
                    
                    <div className="p-3.5 bg-white/70 border border-blue-400 rounded-2xl flex flex-col items-center justify-center gap-1">
                      <span className="text-[8px] tracking-widest font-bold uppercase text-slate-900">Votre Code de Validation</span>
                      <span className="text-xl font-mono font-black text-blue-900 tracking-widest px-4 py-1 bg-white rounded-lg border border-blue-400 shadow-sm">
                        {generatedValidationCode}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-[8px] font-bold uppercase tracking-widest text-slate-950">Saisir le code d'inscription *</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={enteredValidationCode}
                        onChange={(e) => setEnteredValidationCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 123456"
                        className="w-full px-4 py-2 bg-white border-2 border-blue-600 text-black placeholder-slate-400 rounded-xl outline-none text-center font-mono font-bold text-sm tracking-widest focus:ring-2 focus:ring-blue-700"
                        required
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        className="flex-1 py-3 text-[10px] font-black uppercase bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-500 hover:to-yellow-400 text-slate-950 rounded-xl cursor-pointer transition-transform active:scale-98"
                      >
                        Valider mon inscription
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowValidationStep(false);
                          setEnteredValidationCode('');
                        }}
                        className="py-1 px-3 bg-white/80 border border-blue-400 text-blue-900 hover:bg-blue-600 hover:text-white font-bold text-[10px] uppercase tracking-wider rounded-lg cursor-pointer transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>

          </motion.div>
        </div>
      )}

      {/* ==================== STYLIZED VIDEO MOUNT MODAL (HTML5 COMPLIANT) ==================== */}
      {activeVideoCourse && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{activeVideoCourse.image}</span>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">{activeVideoCourse.titre}</h3>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#F59E0B]">{selectedVideoTitle}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveVideoCourse(null);
                  setVideoPlayOverlay(true);
                }}
                className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer outline-none"
              >
                ×
              </button>
            </div>

            {/* Custom Video Viewport */}
            <div className="relative aspect-video bg-black flex items-center justify-center group/player">
              <video
                ref={videoRef}
                src={selectedVideoUrl}
                onTimeUpdate={handleVideoTimeUpdate}
                className="w-full h-full object-contain"
                onClick={playVideoAction}
              />

              {videoPlayOverlay && (
                <div
                  onClick={playVideoAction}
                  className="absolute inset-0 bg-slate-950/40 flex items-center justify-center cursor-pointer z-10 transition-opacity"
                >
                  <div className="h-16 w-16 rounded-full bg-[#F59E0B] text-slate-950 flex items-center justify-center text-3xl shadow-lg hover:scale-105 transition-all">
                    ▶
                  </div>
                </div>
              )}

              {/* Precise controller rail */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col gap-2 opacity-100 sm:opacity-0 group-hover/player:opacity-100 transition-opacity duration-200 z-10">
                <div className="flex items-center justify-between text-white text-[10px] font-bold">
                  <span>{videoCurrentTime} / {videoDuration}</span>
                  <div className="flex gap-2">
                    <button onClick={() => skipVideoTime(-10)} className="hover:text-[#F59E0B] text-xs cursor-pointer px-1">⏪ -10s</button>
                    <button onClick={() => videoRef.current?.paused ? videoRef.current.play() : videoRef.current?.pause()} className="hover:text-[#F59E0B] text-xs cursor-pointer px-1">⏸ Pause</button>
                    <button onClick={() => skipVideoTime(10)} className="hover:text-[#F59E0B] text-xs cursor-pointer px-1">⏩ +10s</button>
                  </div>
                </div>

                {/* Progress bar container */}
                <div
                  onClick={handleVideoClickThrough}
                  className="w-full bg-neutral-700 h-1.5 rounded-full overflow-hidden cursor-pointer relative"
                >
                  <div className="bg-[#F59E0B] h-full rounded-full" style={{ width: `${videoProgressPercent}%` }}></div>
                </div>
              </div>
            </div>

            {/* Lectures chapters selection & completion actions */}
            <div className="p-4 space-y-4">
              <p className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400">Lectures & Modules</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto">
                {activeVideoCourse.modules.map((m, idx) => (
                  <div
                    key={m.nom}
                    onClick={() => {
                      // Switch sequence url parameters
                      setSelectedVideoUrl(idx === 1 ? 'https://samplelib.com/lib/preview/mp4/sample-10s.mp4' : 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4');
                      setSelectedVideoTitle(m.nom);
                      setVideoPlayOverlay(true);
                      triggerNotification(`Séquence active : ${m.nom}`);
                    }}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-[11px] font-bold cursor-pointer transition-all ${
                      selectedVideoTitle === m.nom ? 'border-blue-600 bg-blue-600/5' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <span>Chapitre {idx + 1} : {m.nom}</span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                      {m.progression === 100 ? "Complet" : "À voir"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Quick direct update action */}
              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => markModuleProgress(Number(activeVideoCourse.id), selectedVideoTitle)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold uppercase tracking-wider rounded-xl cursor-pointer text-center"
                >
                  Valider la lecture active (+100%)
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Invisible Printable Container for instant PDF generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', opacity: 0, pointerEvents: 'none' }}>
        <div 
          id="eduonline-diploma-recipient-frame" 
          className="w-[850px] bg-white text-slate-900 border-[12px] p-10 text-center flex flex-col font-serif rounded-xl"
          style={{
            backgroundImage: diplomaTemplate === 'traditional'
              ? "linear-gradient(135deg, #ffffff 0%, #fffdf4 100%)"
              : diplomaTemplate === 'modern'
              ? "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)"
              : "linear-gradient(135deg, #fafafa 0%, #f4f4f5 100%)",
            borderColor: diplomaTemplate === 'traditional' ? '#F59E0B' : diplomaTemplate === 'modern' ? '#3B82F6' : '#64748B'
          }}
        >
          <GraduationCap className={`w-14 h-14 mx-auto ${diplomaTemplate === 'traditional' ? 'text-blue-600' : diplomaTemplate === 'modern' ? 'text-blue-500' : 'text-slate-700'}`} />
          
          <div className="space-y-1">
            <h2 className={`text-3xl font-black tracking-tight uppercase ${diplomaTemplate === 'traditional' ? 'text-blue-600' : diplomaTemplate === 'modern' ? 'text-slate-900' : 'text-slate-800'}`}>
              {diplomaTemplate === 'rncp' ? "Titre Professionnel RNCP" : "Diplôme Universitaire"}
            </h2>
            <p className="text-[10px] uppercase tracking-widest font-extrabold font-sans text-amber-600">
              UNIV-ONLINE École de Formation Supérieure d’État
            </p>
          </div>

          <div className="space-y-4 font-serif">
            <p className="text-xs font-semibold italic">Vu les examens réglementaires et l'approbation du corps académique d'État,</p>
            <p className="text-xs">Le présent parchemin est décerné avec les félicitations du jury à l'élève admis :</p>
            <h3 className="text-xl font-black text-slate-850 tracking-wide underline px-4 py-2 uppercase font-serif">
              {selectedDiplomaStudent ? `${selectedDiplomaStudent.prenom} ${selectedDiplomaStudent.nom}` : (currentUser ? `${currentUser.prenom} ${currentUser.nom}` : "M. Jacquecin Grela")}
            </h3>
            <p className="text-xs font-semibold leading-relaxed">
              et lui confère le grade universitaire légal de <br />
              <strong className="text-blue-600 text-md uppercase block mt-1.5 font-sans">
                {selectedDiplomaStudent ? `${selectedDiplomaStudent.filiere} (${selectedDiplomaStudent.grade})` : "Marketing Digital & Tech (Master Supérieur d'État)"}
              </strong>
            </p>
            <p className="text-[10px] font-bold text-slate-500">
              obtenu avec la moyenne d'excellence de <strong className="text-emerald-500">{selectedDiplomaStudent ? selectedDiplomaStudent.averageGrade : 17.2}/20</strong>.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-200 flex flex-row justify-between items-center text-[10px] font-sans">
            <div className="text-left space-y-1">
              <span className="block text-slate-400 font-bold tracking-widest uppercase text-[7px]">Certificat Enregistré</span>
              <p className="font-bold text-slate-700">Ref ID: {selectedDiplomaStudent ? selectedDiplomaStudent.certId : "CERT-A99411038"}</p>
            </div>

            <div className={`h-16 w-16 rounded-full border-4 flex items-center justify-center text-[8px] font-black leading-none text-center select-none rotate-12 bg-transparent ${
              diplomaTemplate === 'traditional' ? 'border-amber-500 text-amber-500' :
              diplomaTemplate === 'modern' ? 'border-blue-500 text-blue-500' :
              'border-slate-500 text-slate-500'
            }`}>
              CAMPUS<br />EDUOnline<br />UNIVERS
            </div>

            <div className="text-right space-y-1">
              <span className="block text-slate-400 font-bold tracking-widest uppercase text-[7px]">Délivré le</span>
              <p className="font-extrabold text-slate-700">
                {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-[9px] italic font-semibold font-sans">Le Secrétariat Académique</p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== STYLIZED TRADITIONAL FRENCH COMPLETION DIPLOME ==================== */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-white text-slate-900 rounded-3xl p-4 shadow-2xl relative flex flex-col font-serif"
          >
            <button
              onClick={() => setShowCertificateModal(false)}
              className="absolute top-6 right-6 h-7 w-7 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center outline-none cursor-pointer z-10 font-sans"
            >
              ×
            </button>

            {/* Printable diploma canvas wrapper (excluding buttons but including styling/borders) */}
            <div
              id="eduonline-diploma-recipient-frame-cert"
              className="space-y-6 flex flex-col p-8 bg-white text-slate-900 border-[12px] border-amber-500 text-center font-serif rounded-2xl"
              style={{ backgroundImage: "linear-gradient(135deg, #ffffff 0%, #fffdf4 100%)" }}
            >
              <GraduationCap className="w-16 h-16 mx-auto text-blue-600" />
              
              <div className="space-y-1">
                <h2 className="text-3xl font-extrabold tracking-tight text-blue-600 uppercase">Diplôme Universitaire</h2>
                <p className="text-xs uppercase tracking-widest font-semibold font-sans text-amber-600">UNIV-ONLINE École de Formation Supérieure d’État</p>
              </div>

              <div className="space-y-4 font-serif">
                <p className="text-sm font-semibold italic">Vu les examens réglementaires et l'approbation du corps académique d'État,</p>
                <p className="text-sm">Le présent parchemin est décerné avec les félicitations du jury à l'élève admis :</p>
                <h3 className="text-2xl font-black text-slate-800 tracking-wide underline px-4 py-2 uppercase">
                  {currentUser ? `${currentUser.prenom} ${currentUser.nom}` : "M. Jacquecin Grela"}
                </h3>
                <p className="text-sm font-semibold leading-relaxed font-serif">
                  et lui confère le grade universitaire légal de <br />
                  <strong className="text-blue-600 text-lg uppercase font-sans">Licence Supérieure d’Ingénierie Logicielle & Web</strong>
                </p>
                <p className="text-xs font-semibold">avec l'ensemble des prérogatives scolaires et fiscales attachées à cette division d'excellence.</p>
              </div>

              {/* Diploma bottom footer */}
              <div className="pt-6 border-t border-slate-200 sm:flex sm:justify-between items-center space-y-4 sm:space-y-0 text-xs font-sans">
                <div className="text-left space-y-1">
                  <span className="block text-slate-400 font-bold tracking-widest uppercase text-[8px]">Certificat Enregistré</span>
                  <p className="font-bold text-slate-700">Ref ID: CERT-A{Date.now().toString().substring(7)}</p>
                </div>

                {/* Classical round seal */}
                <div className="h-20 w-20 rounded-full border-4 border-amber-500 flex items-center justify-center text-[10px] font-black text-[#F59E0B] leading-none text-center select-none rotate-12 mx-auto sm:mx-0 bg-transparent">
                  CAMPUS<br />EDUOnline<br />UNIVERS
                </div>

                <div className="text-right space-y-1">
                  <span className="block text-slate-455 font-bold tracking-widest uppercase text-[8px]">Délivré le</span>
                  <p className="font-extrabold text-slate-700">{new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className="text-[10px] italic font-semibold font-serif">Le Recteur Académique</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => handlePrintDiploma(null)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-sans text-xs font-bold uppercase tracking-widest rounded-xl shadow cursor-pointer mx-auto mt-4"
            >
              Imprimer mon Diplôme
            </button>
          </motion.div>
        </div>
      )}

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 pt-16 pb-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-10">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 text-[#F59E0B] p-2 rounded-lg">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white">EDUOnline</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              EDUOnline est l'université ouverte de classe mondiale. Connectez vos objectifs d'études aux meilleures technologies de tutorat scolaire alimenté par l'IA.
            </p>
            <p className="text-[9px] text-[#F59E0B] font-bold uppercase tracking-wider">Candidat Principal: ELSON Jacquecin Grela</p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs text-slate-100 uppercase tracking-widest font-black">Liens Scolaires</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 font-medium">
              <button onClick={() => { setCurrentPage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-left hover:text-[#F59E0B]">Tableau de Bord</button>
              <button onClick={() => { setCurrentPage('admission'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-left hover:text-[#F59E0B]">Admission</button>
              <button onClick={() => { setCurrentPage('formations'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-left hover:text-[#F59E0B]">Catalogue Cours</button>
              <button onClick={() => { setCurrentPage('candidature'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-left hover:text-[#F59E0B]">Suivi Dossier</button>
            </div>
          </div>

          <div className="space-y-4 text-xs font-semibold">
            <h4 className="text-xs text-slate-100 uppercase tracking-widest font-black">Coordonnées</h4>
            <p>📧 grelaselson@gmail.com</p>
            <p>☎️ 034906750</p>
            <p>🏛️ Antananarivo 101</p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 mt-10 pt-6 text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          <span>© {new Date().getFullYear()} EDUOnline Inc. Tous droits réservés. Établissement agréé d'État.</span>
        </div>
      </footer>

      {/* ==================== PERSISTENT FLOATING AI SUPPORT CHAT WIDGET ("OUR CHAT") ==================== */}
      <div className="fixed bottom-6 right-6 z-45 font-sans">
        <AnimatePresence>
          {!showFloatingChat ? (
            <motion.button
              key="chat-trigger-btn"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, y: [0, -4, 0] }}
              transition={{
                scale: { duration: 0.3 },
                y: { repeat: Infinity, duration: 4, ease: "easeInOut" }
              }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => setShowFloatingChat(true)}
              className="h-14 w-14 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 hover:from-blue-700 hover:to-amber-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/30 cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-500/20 active:scale-95 transition-all group relative border-2 border-white dark:border-slate-850"
              title="Discuter avec l'IA d'Admission"
            >
              <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-rose-500 border-2 border-white dark:border-slate-900 text-[10px] text-white font-black flex items-center justify-center animate-bounce">
                1
              </span>
              <MessageSquare className="w-6 h-6 transform group-hover:scale-110 transition-transform" />
            </motion.button>
          ) : (
            <motion.div
              key="chat-widget-panel"
              initial={{ opacity: 0, y: 80, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="w-80 sm:w-96 h-[480px] bg-white dark:bg-slate-900 border-2 border-black dark:border-black rounded-3xl shadow-2xl overflow-hidden flex flex-col justify-between"
            >
              {/* Header with gradient */}
              <div className="px-5 py-4 bg-black text-yellow-400 flex items-center justify-between shadow border-b border-black">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-slate-950 flex items-center justify-center text-lg shadow-sm border border-yellow-450 text-yellow-400 font-extrabold">
                    🎓
                  </div>
                  <div className="text-left">
                    <span className="block text-xs font-black tracking-wider uppercase text-yellow-400">Assistant Virtuel</span>
                    <span className="block text-[9px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      UNIV-ONLINE IA
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFloatingMessages([
                        {
                          id: 'welcome_custom_' + Date.now(),
                          senderName: 'Assistant Virtuel',
                          senderRole: 'tutor',
                          receiverName: 'Visiteur',
                          text: "Messages réinitialisés ! Que puis-je vous expliquer d'autre sur les cours ou les frais d'études ?",
                          date: new Date().toISOString()
                        }
                      ]);
                    }}
                    className="p-1 rounded bg-yellow-400/10 hover:bg-yellow-400/20 text-[9px] uppercase tracking-wider font-extrabold text-yellow-400 hover:text-yellow-300"
                    title="Nouveau fil"
                  >
                    Effacer
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFloatingChat(false)}
                    className="h-7 w-7 rounded-full bg-yellow-400/10 hover:bg-yellow-400/20 flex items-center justify-center text-sm font-bold text-yellow-400 cursor-pointer focus:outline-none transition-all"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Chat messages */}
              <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
                {floatingMessages.map((m) => {
                  const isUser = m.senderRole === 'student' || m.senderRole === 'guest';
                  return (
                    <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs font-medium space-y-1 shadow-sm leading-relaxed ${
                        isUser 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-black text-yellow-400 rounded-tl-none font-bold border-2 border-black dark:border-yellow-500/20 shadow-md'
                      }`}>
                        <div className="flex justify-between gap-3 text-[8px] font-bold opacity-60">
                          <span className={isUser ? 'text-white' : 'text-yellow-400'}>{m.senderName}</span>
                          <span className={isUser ? 'text-white' : 'text-yellow-400'}>{new Date(m.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className={`whitespace-pre-wrap ${isUser ? 'text-white' : 'text-yellow-300 font-semibold'}`}>{m.text}</p>
                      </div>
                    </div>
                  );
                })}
                {isFloatingAiTyping && (
                  <div className="flex justify-start">
                    <div className="px-3 py-1.5 rounded-2xl bg-white dark:bg-slate-800 text-[10px] text-slate-400 font-bold flex items-center gap-1.5 shadow-sm border border-slate-100 dark:border-slate-800">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                      </span>
                      <span>L'IA rédige une réponse...</span>
                    </div>
                  </div>
                )}
                <div ref={floatingChatBottomRef}></div>
              </div>

              {/* Helper Quick Questions Chips */}
              <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-1.5 overflow-x-auto select-none no-scrollbar">
                <button
                  type="button"
                  onClick={() => handleSendFloatingMessage("Quels sont les cursus disponibles ?")}
                  className="px-2.5 py-1 text-[9px] font-bold border border-slate-200 dark:border-slate-750 rounded-full hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0 transition-colors"
                >
                  🚀 Formations
                </button>
                <button
                  type="button"
                  onClick={() => handleSendFloatingMessage("Comment candidater en ligne ?")}
                  className="px-2.5 py-1 text-[9px] font-bold border border-slate-200 dark:border-slate-750 rounded-full hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0 transition-colors"
                >
                  📝 Inscription
                </button>
                <button
                  type="button"
                  onClick={() => handleSendFloatingMessage("Quels sont les frais de scolarité ?")}
                  className="px-2.5 py-1 text-[9px] font-bold border border-slate-200 dark:border-slate-750 rounded-full hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0 transition-colors"
                >
                  💳 Frais d’études
                </button>
                <button
                  type="button"
                  onClick={() => handleSendFloatingMessage("Aide au devoirs en JavaScript")}
                  className="px-2.5 py-1 text-[9px] font-bold border border-slate-200 dark:border-slate-750 rounded-full hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0 transition-colors"
                >
                  💻 Aide React
                </button>
              </div>

              {/* Message inputs */}
              <div className="p-3 border-t border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
                <input
                  type="text"
                  value={floatingInput}
                  onChange={(e) => setFloatingInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendFloatingMessage()}
                  placeholder="Écrivez votre message..."
                  className="flex-grow px-3 py-2 rounded-xl border border-blue-400 outline-none bg-blue-100 text-xs text-black placeholder-blue-700/70 focus:bg-blue-200"
                  disabled={isFloatingAiTyping}
                />
                <button
                  type="button"
                  onClick={() => handleSendFloatingMessage()}
                  disabled={!floatingInput.trim() || isFloatingAiTyping}
                  className="px-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow cursor-pointer transition-transform duration-100 active:scale-95 flex items-center"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
