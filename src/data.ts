import { Course, Opportunity, User, ForumPost, MentorshipSession } from './types.ts';

// Helper to generate 50 Rwandan pilot users
export const getMockUsers = (): User[] => {
  const users: User[] = [
    {
      id: 'usr_admin_1',
      email: 'admin@herrise.org',
      name: 'Kamikazi Karangwa (Admin)',
      role: 'admin',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150',
      bio: 'Co-founder of HerRise. Passionate about leveraging technology to uplift women across Rwanda and East Africa.',
      skills: ['Leadership', 'Program Design', 'Strategic Management', 'FinTech'],
      country: 'Rwanda',
      language: 'en',
      isVerified: true,
      isActive: true,
      createdAt: '2026-01-10T10:00:00Z',
    },
    {
      id: 'usr_kamikazi_mentor',
      email: 'kamikazikarangwa@gmail.com',
      name: 'Kamikazi Karangwa',
      role: 'mentor',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150',
      bio: 'Co-founder and Specialist Coach. Guiding entrepreneurs and software engineers across East Africa.',
      skills: ['Mentorship', 'Leadership', 'Business Growth', 'Public Speaking'],
      country: 'Rwanda',
      language: 'en',
      isVerified: true,
      isActive: true,
      createdAt: '2026-01-10T10:00:00Z',
    },
    {
      id: 'usr_mentor_1',
      email: 'mentor1@herrise.org',
      name: 'Divine Mugisha',
      role: 'mentor',
      photo: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=150',
      bio: 'Senior Software Engineer at Irembo. Mentoring women in coding, React, and databases. Located in Kigali.',
      skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'Public Speaking'],
      country: 'Rwanda',
      language: 'en',
      isVerified: true,
      isActive: true,
      createdAt: '2026-02-01T08:30:00Z',
    },
    {
      id: 'usr_mentor_2',
      email: 'claudine.uwera@gmail.com',
      name: 'Claudine Uwera',
      role: 'mentor',
      photo: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=150',
      bio: 'SME Advisor & Entrepreneur. I help business owners draft proposals, manage cashflow, and secure local micro-grants.',
      skills: ['Business Strategy', 'Financial Planning', 'Micro-loans', 'French Instruction'],
      country: 'Rwanda',
      language: 'fr',
      isVerified: true,
      isActive: true,
      createdAt: '2026-02-15T11:40:00Z',
    },
    {
      id: 'usr_mentor_3',
      email: 'aline@wellbeingafrica.org',
      name: 'Aline Umutoni',
      role: 'mentor',
      photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150',
      bio: 'Leadership coach & HR Specialist. Dedicated to mental well-being, work-life integration, and confidence building.',
      skills: ['Mentorship', 'Confidence Coaching', 'HR Management', 'Communication'],
      country: 'Rwanda',
      language: 'en',
      isVerified: true,
      isActive: true,
      createdAt: '2026-03-01T14:20:00Z',
    }
  ];

  // Generate 46 additional learners from Rwanda (Kigali, Rubavu, Musanze, Huye, Rwamagana)
  const names = [
    'Aisha Umutesi', 'Béatrice Uwamahoro', 'Chantal Mutoni', 'Delphine Ishimwe', 'Esther Nyiramana',
    'Fiona Gasana', 'Grace Gakire', 'Hope Keza', 'Inez Giramata', 'Josianne Tuyishime',
    'Kezia Uwimana', 'Lydia Mukamana', 'Marie Claire Uwera', 'Nadia Umutoniwase', 'Olivia Gaju',
    'Pacifique Uwiringiyimana', 'Queen Gakondo', 'Ruth Mutesi', 'Solange Mukasine', 'Tatiana Umwari',
    'Valentine Niyonsenga', 'Winnie Kayitesi', 'Yvonne Mutegwaraba', 'Zahra Umubyeyi',
    'Alice Uwineza', 'Bella Kanyange', 'Clara Gatesi', 'Diana Umubyeyi', 'Eva Niyomugabo',
    'Faith Ashimwe', 'Gloria Mutesi', 'Innocente Uwase', 'Joannah Umurerwa', 'Kelila Mugeni',
    'Lana Gisa', 'Mercy Tuyisenge', 'Nelly Umwari', 'Olla Gaju', 'Praise Mutoni',
    'Rhea Umuhire', 'Sharon Kabasinga', 'Tessa Umutoni', 'Vanessa Gakuba', 'Vivian Shima',
    'Ysolde Murebwayire', 'Zulaika Umurerwa'
  ];

  const districts = ['Kigali', 'Huye', 'Rubavu', 'Musanze', 'Rwamagana'];
  const sectors = ['Web Dev', 'Tailoring', 'Retail Business', 'Agribusiness', 'Tourism', 'Data Entry'];

  for (let i = 0; i < 46; i++) {
    const name = names[i] || `Learner ${i + 1}`;
    const email = `${name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`;
    const district = districts[i % districts.length];
    const sector = sectors[i % sectors.length];
    
    users.push({
      id: `usr_learner_${i + 1}`,
      email,
      name,
      role: 'learner',
      photo: `https://images.unsplash.com/photo-${1500000000000 + i * 100000}?q=80&w=150&fit=crop&auto=format`,
      bio: `Aspiring entrepreneur from ${district}, Rwanda interested in ${sector} and expanding my digital skills with HerRise.`,
      skills: [sector, 'Basic Computer Skills'],
      country: 'Rwanda',
      language: i % 4 === 0 ? 'fr' : 'en', // Mix of French and English
      isVerified: true,
      isActive: true,
      createdAt: new Date(2026, 4, 1 + (i % 28)).toISOString(),
    });
  }

  return users;
};

export const mockCourses: Course[] = [
  {
    id: 'course_1',
    title: 'Digital Literacy for Entrepreneurs',
    titleFr: 'Alphabétisation Numérique pour Entrepreneures',
    description: 'Master the digital tools needed to build, manage, and promote your business in Africa. Learn Google Workspace, digital banking, and social media marketing.',
    descriptionFr: 'Maîtrisez les outils numériques nécessaires pour créer, gérer et promouvoir votre entreprise en Afrique. Apprenez Google Workspace, la banque numérique et le marketing.',
    category: 'digital',
    level: 'beginner',
    duration: '6 hours',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600',
    published: true,
    enrollmentsCount: 124,
    completionsCount: 82,
    modules: [
      {
        id: 'c1_m1',
        title: 'Introduction to Mobile Tools',
        titleFr: 'Introduction aux Outils Mobiles',
        order: 1,
        lessons: [
          {
            id: 'c1_m1_l1',
            title: 'Using Google Workspace on Mobile',
            titleFr: 'Utiliser Google Workspace sur Mobile',
            duration: '15 mins',
            order: 1,
            content: `### Getting Started with Google Workspace on your Smartphone
Many modern businesses operate entirely from a mobile phone. In this lesson, we cover:
1. **Google Drive**: Storing contracts, invoices, and product photos securely in the cloud.
2. **Google Sheets**: Creating a simple, offline-accessible balance sheet to track your daily sales.
3. **Google Meet**: Conducting video sessions with low bandwidth settings.

**Pro-Tip for 2G/3G Connections:**
Turn on 'Data Saver' in your Google Drive settings. This prevents auto-downloading large PDF attachments until you click them.`,
            contentFr: `### Prise en main de Google Workspace sur Smartphone
De nombreuses entreprises modernes fonctionnent entièrement depuis un téléphone. Dans cette leçon :
1. **Google Drive** : Stockez vos contrats et photos de produits en toute sécurité.
2. **Google Sheets** : Créez un bilan simple, accessible hors ligne, pour suivre vos ventes.
3. **Google Meet** : Organisez des réunions vidéo en mode bas débit.

**Conseil pour les connexions 2G/3G :**
Activez l'économiseur de données dans Google Drive.`
          },
          {
            id: 'c1_m1_l2',
            title: 'Mobile Banking & Mobile Money Solutions',
            titleFr: 'Solutions Bancaires Mobiles et Mobile Money',
            duration: '20 mins',
            order: 2,
            content: `### Leveraging Mobile Money (MTN MoMo & Airtel Money)
Mobile Money is the cornerstone of commerce in East and West Africa. Let's study how to use merchant accounts:
- **MTN MoMo Pay**: Setting up a free merchant code (*182*8# in Rwanda) so customers can pay you without transaction charges.
- **Airtel Money Merchant**: Expanding accessibility for customers on rival networks.
- **Micro-loans**: Understanding options like *M-Shwari* or *Mobicash* for short-term inventory financing.

**Security reminder:** Never share your Mobile Money PIN with anyone, including customer support agents or lenders.`,
            contentFr: `### Exploiter le Mobile Money (MTN MoMo et Airtel Money)
Le Mobile Money est le pilier du commerce en Afrique. Apprenons à utiliser les comptes marchands :
- **MTN MoMo Pay** : Créez un code marchand gratuit afin que vos clients puissent vous payer sans frais.
- **Airtel Money** : Élargissez l'accessibilité pour les clients d'autres réseaux.
- **Micro-crédits** : Comprendre les options de financement à court terme.

**Rappel de sécurité :** Ne partagez jamais votre code PIN.`
          }
        ]
      },
      {
        id: 'c1_m2',
        title: 'Digital Marketing & Community Building',
        titleFr: 'Marketing Numérique et Communauté',
        order: 2,
        lessons: [
          {
            id: 'c1_m2_l1',
            title: 'WhatsApp Business for Sales',
            titleFr: 'WhatsApp Business pour les Ventes',
            duration: '25 mins',
            order: 1,
            content: `### WhatsApp Business Strategy
With over 90% messaging market share in Rwanda and other African nations, WhatsApp is your most powerful storefront.
- **Product Catalogs**: Upload up to 500 items with photos, descriptions, and pricing.
- **Automated Greetings**: Set up away messages and quick replies for frequently asked questions (pricing, delivery terms, sizes).
- **Labels**: Tag customers as "New Order", "Payment Pending", or "Shipped" to stay organized.`,
            contentFr: `### Stratégie WhatsApp Business
Avec plus de 90 % de part de marché, WhatsApp est votre vitrine la plus puissante.
- **Catalogues de Produits** : Téléchargez vos articles avec photos, descriptions et prix.
- **Messages Automatisés** : Configurez des réponses rapides pour les questions fréquentes.
- **Étiquettes** : Classez vos clients ("Nouvelle commande", "Paiement en attente").`
          }
        ]
      }
    ]
  },
  {
    id: 'course_2',
    title: 'Introduction to Web Coding with React & TypeScript',
    titleFr: 'Introduction au Codage Web avec React et TypeScript',
    description: 'Learn the fundamentals of frontend web development. Create highly interactive layouts, handle data states, and deploy optimized offline-first PWAs.',
    descriptionFr: 'Apprenez les bases du développement web frontend. Créez des interfaces interactives, gérez les états et déployez des PWA optimisées hors ligne.',
    category: 'coding',
    level: 'intermediate',
    duration: '12 hours',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600',
    published: true,
    enrollmentsCount: 88,
    completionsCount: 42,
    modules: [
      {
        id: 'c2_m1',
        title: 'Modern JavaScript and TypeScript Core',
        titleFr: 'Bases de JavaScript et TypeScript Moderne',
        order: 1,
        lessons: [
          {
            id: 'c2_m1_l1',
            title: 'Variables, Types, and Strict Systems',
            titleFr: 'Variables, Types et Systèmes Stricts',
            duration: '30 mins',
            order: 1,
            content: `### Why TypeScript?
JavaScript is highly flexible, but can easily fail at runtime. TypeScript acts as a strict compiler to check errors before the code runs in your user's browser.

**Core Syntax Example:**
\`\`\`typescript
interface LearnerProfile {
  id: string;
  name: string;
  coursesEnrolled: number;
}

const student: LearnerProfile = {
  id: "student_01",
  name: "Gaju Marie",
  coursesEnrolled: 3
};
\`\`\`
By enforcing strict types, you prevent "undefined is not a function" errors which drain precious 3G data for debugging!`,
            contentFr: `### Pourquoi utiliser TypeScript ?
JavaScript est flexible mais peut échouer à l'exécution. TypeScript sert de compilateur strict pour détecter les erreurs en amont.

**Exemple de Syntaxe :**
\`\`\`typescript
interface ProfilApprenante {
  id: string;
  nom: string;
  coursInscrits: number;
}
\`\`\`
En appliquant des types stricts, vous évitez les erreurs fatales !`
          }
        ]
      },
      {
        id: 'c2_m2',
        title: 'Building Interactive UIs with React',
        titleFr: 'Créer des UIs Interactives avec React',
        order: 2,
        lessons: [
          {
            id: 'c2_m2_l1',
            title: 'Component State and Re-renders',
            titleFr: 'État du Composant et Re-rendus',
            duration: '40 mins',
            order: 1,
            content: `### React Hooks: useState
State represents the dynamic memory of a React component. Whenever state updates, React re-renders that component to match the state.

**Rule of Thumb:**
Never update state directly! Always use the set modifier function.
\`\`\`typescript
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}
\`\`\`
This lets React know it must update the DOM element.`,
            contentFr: `### Hooks React : useState
L'état (state) représente la mémoire dynamique d'un composant. Lorsqu'un état est modifié, React rafraîchit le composant.

**Règle d'or :**
Ne modifiez jamais l'état directement !`
          }
        ]
      }
    ]
  },
  {
    id: 'course_3',
    title: 'Agribusiness Entrepreneurship',
    titleFr: 'Entrepreneuriat Agroalimentaire',
    description: 'Transform your farming activities into a high-yield sustainable agricultural business. Topics include crop selection, smart water usage, and reaching local markets.',
    descriptionFr: 'Transformez vos activités agricoles en une entreprise agroalimentaire durable à haut rendement. Les sujets incluent la sélection des cultures et les marchés.',
    category: 'entrepreneurship',
    level: 'beginner',
    duration: '8 hours',
    imageUrl: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=600',
    published: true,
    enrollmentsCount: 145,
    completionsCount: 110,
    modules: [
      {
        id: 'c3_m1',
        title: 'Sustainable Agricultural Planning',
        titleFr: 'Planification Agricole Durable',
        order: 1,
        lessons: [
          {
            id: 'c3_m1_l1',
            title: 'Selecting High-Value Cash Crops',
            titleFr: 'Sélectionner des Cultures de Haute Valeur',
            duration: '20 mins',
            order: 1,
            content: `### High-Yield Agricultural Planning in East Africa
To build a sustainable farming business, you must focus on yield per square meter. In East Africa, some of the highest-demand crops with local market density include:
1. **Chili Peppers (Bird's Eye)**: Excellent export market potential from Kigali, high price stability.
2. **French Beans (Haricots Verts)**: Quick turnaround (60 days), high regional demand.
3. **Mushrooms (Oyster)**: Requires very little land area, excellent protein source with premium pricing in urban centers.

**Planning Checklist:**
- Test soil pH before applying fertilizers.
- Coordinate planting seasons to avoid market gluts where prices drop significantly.`,
            contentFr: `### Planification Agricole Durable en Afrique de l'Est
Pour créer une entreprise agricole rentable, concentrez-vous sur le rendement au mètre carré.
1. **Piments (Bird's Eye)** : Excellent potentiel d'exportation.
2. **Haricots Verts** : Cycle court (60 jours), forte demande.
3. **Champignons** : Nécessite peu de surface, prix de vente élevé.

**Check-list de planification :**
- Testez le pH du sol avant d'appliquer des engrais.`
          }
        ]
      }
    ]
  },
  {
    id: 'course_4',
    title: 'Financial Literacy & Bookkeeping',
    titleFr: 'Éducation Financière et Tenue de Livres',
    description: 'Master budgeting, cash flow forecasting, debt management, and financial projections for micro-enterprises.',
    descriptionFr: 'Maîtrisez le budget, les prévisions de trésorerie, la gestion des dettes et les projections financières pour les micro-entreprises.',
    category: 'finance',
    level: 'beginner',
    duration: '5 hours',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=600',
    published: true,
    enrollmentsCount: 95,
    completionsCount: 68,
    modules: [
      {
        id: 'c4_m1',
        title: 'Daily Financial Tracking',
        titleFr: 'Suivi Financier Quotidien',
        order: 1,
        lessons: [
          {
            id: 'c4_m1_l1',
            title: 'Keeping a Ledger and Cash Book',
            titleFr: 'Tenir un Registre de Caisse',
            duration: '15 mins',
            order: 1,
            content: `### Separating Personal and Business Finance
The most common point of failure for small business owners is mixing family expenses with enterprise cash.
- **Rule 1**: Pay yourself a fixed salary from the business profits. Do not buy household milk directly using MoMo pay business wallet.
- **Rule 2**: Log every receipt immediately.
- **Rule 3**: Reconcile your cash balance every evening.

**Ledger Example:**
| Date | Item Description | Category | Cash In (MoMo) | Cash Out | Balance |
|---|---|---|---|---|---|
| July 10 | Seed Stock | Inventory | - | 15,000 RWF | 35,000 RWF |
| July 10 | Sale: 5kg Beans | Sales | 8,000 RWF | - | 43,000 RWF |`,
            contentFr: `### Séparer les Finances Personnelles et Professionnelles
La cause d'échec la plus fréquente est le mélange des dépenses familiales et professionnelles.
- **Règle 1** : Versez-vous un salaire fixe.
- **Règle 2** : Enregistrez chaque reçu immédiatement.
- **Règle 3** : Faites votre caisse tous les soirs.`
          }
        ]
      }
    ]
  },
  {
    id: 'course_5',
    title: 'Professional Communication & Pitching',
    titleFr: 'Communication Professionnelle et Pitch',
    description: 'Learn the art of expressing your business ideas clearly. Write professional emails, design digital decks, and pitch to regional angel investors.',
    descriptionFr: 'Apprenez l\'art d\'exprimer clairement vos idées. Écrivez des e-mails professionnels, créez des présentations et pitchez devant des investisseurs.',
    category: 'communication',
    level: 'intermediate',
    duration: '4 hours',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600',
    published: true,
    enrollmentsCount: 76,
    completionsCount: 55,
    modules: [
      {
        id: 'c5_m1',
        title: 'The Art of the 1-Minute Pitch',
        titleFr: 'L\'Art du Pitch de 1 Minute',
        order: 1,
        lessons: [
          {
            id: 'c5_m1_l1',
            title: 'Structuring a Elevator Pitch',
            titleFr: 'Structurer un Pitch d\'Ascenseur',
            duration: '10 mins',
            order: 1,
            content: `### Getting Your Business Noticed in 60 Seconds
When meeting a potential mentor, client, or bank officer, you must explain your value proposition quickly. Follow the 4-part structure:
1. **The Hook**: A surprising stat or local fact. ("70% of farmers in Huye lose 25% of their tomato crop before reaching market...")
2. **The Problem**: What pain point are you solving?
3. **The Solution**: How do you solve it uniquely?
4. **The Ask**: What do you want? ("I am looking for a mentor to guide me in cold storage supply chains.")`,
            contentFr: `### Présenter votre Projet en 60 Secondes
Rencontrer un mentor, un client ou un banquier exige de la clarté. Utilisez la structure en 4 étapes :
1. **L'accroche** : Un chiffre marquant. ("70% des agriculteurs perdent un quart des récoltes...")
2. **Le problème** : Quel est le défi ?
3. **La solution** : Comment le résolvez-vous ?
4. **L'appel à l'action** : Que recherchez-vous ?`
          }
        ]
      }
    ]
  }
];

export const mockOpportunities: Opportunity[] = [
  {
    id: 'opp_1',
    title: 'Junior Web Developer Internship',
    titleFr: 'Stage de Développeuse Web Junior',
    company: 'Irembo Ltd',
    companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=150',
    type: 'internship',
    category: 'tech',
    location: 'Kigali, Rwanda (Hybrid)',
    country: 'Rwanda',
    sector: 'Software Development',
    deadline: '2026-08-15',
    description: 'Apply your HTML/CSS, JavaScript, and React skills to help build Rwanda’s flagship public service portal. Females are highly encouraged to apply. This is a paid hybrid internship.',
    descriptionFr: 'Appliquez vos compétences React pour aider à construire le portail public phare du Rwanda. Stage rémunéré hybride.',
    applyLink: 'https://irembo.com/careers',
    createdAt: '2026-07-01T09:00:00Z'
  },
  {
    id: 'opp_2',
    title: 'Agri-Business Expansion Grant',
    titleFr: 'Subvention d’Expansion Agroalimentaire',
    company: 'BK TecHouse & Mastercard Foundation',
    companyLogo: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=150',
    type: 'grant',
    category: 'business',
    location: 'All provinces, Rwanda',
    country: 'Rwanda',
    sector: 'Agriculture & Food tech',
    deadline: '2026-09-30',
    description: 'Providing direct financial grants up to 5,000,000 RWF for female-led agribusinesses. Eligible companies must be operational for at least 1 year in Rwanda and demonstrate sustainable community farming links.',
    descriptionFr: 'Subventions directes allant jusqu\'à 5 000 000 RWF pour les agro-entreprises dirigées par des femmes. Doit être actif depuis au moins un an au Rwanda.',
    applyLink: 'https://bktechouse.rw/grants-agri',
    createdAt: '2026-07-05T10:00:00Z'
  },
  {
    id: 'opp_3',
    title: 'Customer Success Specialist',
    titleFr: 'Spécialiste du Succès Client',
    company: 'MTN Rwanda',
    companyLogo: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?q=80&w=150',
    type: 'job',
    category: 'communication',
    location: 'Kigali, Rwanda (Onsite)',
    country: 'Rwanda',
    sector: 'Telecommunications',
    deadline: '2026-08-01',
    description: 'Seeking a customer-focused communicator fluent in Kinyarwanda and English or French. Perfect for communications or marketing graduates. Focuses on onboarding small merchants to MTN MoMo Pay.',
    descriptionFr: 'Recherche d\'une personne à l\'écoute parlant couramment kinyarwanda et anglais ou français. Idéal pour débuter en communication.',
    applyLink: 'https://mtn.co.rw/careers',
    createdAt: '2026-07-08T14:30:00Z'
  },
  {
    id: 'opp_4',
    title: 'Financial Management Assistant',
    titleFr: 'Assistante de Gestion Financière',
    company: 'Inkomoko Business Development',
    companyLogo: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=150',
    type: 'job',
    category: 'finance',
    location: 'Rubavu District, Rwanda',
    country: 'Rwanda',
    sector: 'Consulting & Finance',
    deadline: '2026-08-20',
    description: 'Assist local micro-businesses in Rubavu with digital accounting and bookkeeping training. Strong Excel skills and understanding of local micro-finance is a plus. Native Kinyarwanda, fluent French or English.',
    descriptionFr: 'Aidez les micro-entreprises locales à Rubavu à se former en comptabilité numérique. Compétences Excel requises.',
    applyLink: 'https://inkomoko.com/careers',
    createdAt: '2026-07-09T11:00:00Z'
  }
];

export const mockForumPosts: ForumPost[] = [
  {
    id: 'post_1',
    authorId: 'usr_learner_1',
    authorName: 'Aisha Umutesi',
    authorRole: 'learner',
    channel: 'tech',
    title: 'How can I access lessons without network data?',
    content: 'Hi HerRise family! My mobile data is quite expensive and often fluctuates in Huye. Is there a way to view lessons offline? Thank you so much!',
    reportsCount: 0,
    isFlagged: false,
    createdAt: '2026-07-09T08:00:00Z',
    replies: [
      {
        id: 'reply_1',
        postId: 'post_1',
        authorId: 'usr_admin_1',
        authorName: 'Kamikazi Karangwa',
        authorRole: 'admin',
        content: 'Hi Aisha! Yes, HerRise is a Progressive Web App (PWA). Once you load a course while online, all lessons are stored directly in your smartphone browser storage! Look for the "Offline Mode Available" indicator on your dashboard, and you can study without any mobile connection!',
        reportsCount: 0,
        isFlagged: false,
        createdAt: '2026-07-09T09:15:00Z'
      },
      {
        id: 'reply_2',
        postId: 'post_1',
        authorId: 'usr_mentor_1',
        authorName: 'Divine Mugisha',
        authorRole: 'mentor',
        content: 'Adding to Kamikazi’s point: I am writing a cheat sheet on low-bandwidth settings. Turning on the "Data Saver" option in the header will disable image downloads for lessons so that the text loads in less than 2 seconds, even on older 2G/3G networks!',
        reportsCount: 0,
        isFlagged: false,
        createdAt: '2026-07-09T10:05:00Z'
      }
    ]
  },
  {
    id: 'post_2',
    authorId: 'usr_learner_2',
    authorName: 'Béatrice Uwamahoro',
    authorRole: 'learner',
    channel: 'business',
    title: 'Securing MTN MoMo Pay Merchant code',
    content: 'Hello, has anyone successfully set up a MoMo Pay code for a home tailoring business? Do I need to register my business with RDB first or can I apply with my national ID?',
    reportsCount: 0,
    isFlagged: false,
    createdAt: '2026-07-08T11:20:00Z',
    replies: [
      {
        id: 'reply_3',
        postId: 'post_2',
        authorId: 'usr_mentor_2',
        authorName: 'Claudine Uwera',
        authorRole: 'mentor',
        content: 'Bonjour Béatrice ! Vous pouvez postuler pour un code personnel "MoMo Pay Casual Merchant" simplement avec votre carte d\'identité nationale (NID) ! Composez le *182*8# et suivez les instructions. Pas besoin d\'enregistrement RDB pour débuter.',
        reportsCount: 0,
        isFlagged: false,
        createdAt: '2026-07-08T13:40:00Z'
      }
    ]
  },
  {
    id: 'post_3',
    authorId: 'usr_learner_3',
    authorName: 'Chantal Mutoni',
    authorRole: 'learner',
    channel: 'wellbeing',
    title: 'Dealing with fear of speaking in public',
    content: 'I am launching a grocery store delivery startup and have been asked to pitch to local leaders next week. I am extremely terrified of speaking in public. How do you handle anxiety?',
    reportsCount: 0,
    isFlagged: false,
    createdAt: '2026-07-07T15:10:00Z',
    replies: [
      {
        id: 'reply_4',
        postId: 'post_3',
        authorId: 'usr_mentor_3',
        authorName: 'Aline Umutoni',
        authorRole: 'mentor',
        content: 'Chantal, this is incredibly common! Remember that local leaders want you to succeed. To manage anxiety: 1. Practice your elevator pitch in front of a mirror twice daily. 2. Breathe slowly: breathe in for 4 seconds, hold for 4, and exhale for 4. 3. Reach out in the mentorship tab! I am happy to hop on a 1-on-1 mockup video call with you to practice.',
        reportsCount: 0,
        isFlagged: false,
        createdAt: '2026-07-07T16:45:00Z'
      }
    ]
  }
];
