// Single source of truth for everything the site says about you.
// Edit this file to update the portfolio; no other file needs to change.

export const profile = {
  name: 'Sheraz Ahmad',
  firstName: 'Sheraz',
  initials: 'SA',
  title: 'AI Engineer',
  tagline: 'AI Automation · WhatsApp Chatbots · Generative AI & Agentic Systems',
  roles: [
    'WhatsApp chatbots',
    'LangGraph agents',
    'RAG pipelines',
    'AI voice agents',
    'GoHighLevel CRM automations',
    'computer vision systems',
  ],
  intro:
    'Software Engineering graduate who turns LLMs, automation tools and computer vision into products customers actually use: a 24/7 WhatsApp sales bot in Dubai, a CRM engine that lifted revenue 30% in a month, and a voice agent that now makes outbound calls for its own company.',
  about: [
    'I am an AI engineer based in Lahore, Pakistan. I design and ship AI automation systems, WhatsApp chatbots and generative AI applications for real businesses, and I care most about the moment they go live and start saving someone hours a week.',
    'My recent work includes an end-to-end WhatsApp sales and support system for a Dubai car battery company, a GoHighLevel CRM lead-generation engine at DevelMO that lifted revenue by 30% in its first month, and an ElevenLabs voice agent with 95% call-handling accuracy.',
    'Under the hood I work with multi-agent workflows in LangGraph, retrieval-augmented generation with Qdrant and hybrid search, vision language models, and real-time computer vision with OpenCV and MediaPipe. I wire all of it to REST APIs, CRMs and webhooks through FastAPI and n8n, and I evaluate it with LangSmith.',
  ],
  whatIDo: [
    { title: 'AI automation', text: 'n8n and GoHighLevel workflows wired to LLMs, CRMs and webhooks.' },
    { title: 'Chatbots & voice agents', text: 'WhatsApp Cloud API bots and ElevenLabs voice agents with human handoff.' },
    { title: 'Agents & RAG', text: 'LangGraph multi-agent pipelines grounded in your own data.' },
    { title: 'Computer vision', text: 'Real-time detection, tracking and AR with OpenCV and MediaPipe.' },
  ],
  location: 'Lahore, Pakistan',
  availability: 'Open to remote roles and freelance projects',
  email: 'sherazseo51@gmail.com',
  phone: '+92 311 7510900',
  whatsapp: '923117510900',
  linkedin: 'https://linkedin.com/in/sheraz--ahmad',
  linkedinHandle: 'sheraz--ahmad',
  github: 'https://github.com/25sheraz',
  githubHandle: '25sheraz',
  cv: 'Sheraz_Ahmad_CV.pdf',
};

export const stats = [
  { value: 30, suffix: '%', label: 'revenue lift in month one', note: 'DevelMO CRM lead generation' },
  { value: 95, suffix: '%', label: 'voice-agent call accuracy', note: 'ElevenLabs outbound agent' },
  { value: 500, suffix: '+', label: 'support queries a month', note: '90% resolved with no human' },
  { value: 25, suffix: 'h', label: 'manual work saved weekly', note: 'n8n automations at Tecclub' },
];

export const experience = [
  {
    company: 'DevelMO',
    role: 'Generative AI & Automation Engineer',
    period: 'Mar 2026 – Oct 2026',
    metrics: ['+30% revenue', '95% voice accuracy'],
    bullets: [
      'Built a GoHighLevel CRM lead-generation system that increased revenue by 30% in its first month.',
      'Built the DevelMO AI Voice Agent on ElevenLabs with 95% accuracy in understanding callers; the company now uses it for its own outbound calling.',
      'Built n8n automation workflows and multi-step, multi-agent LangGraph pipelines connecting LLMs to business processes via webhooks and APIs.',
      'Fine-tuned deep learning models for domain-specific tasks, improving accuracy from 78% to 88%.',
      'Traced, debugged and evaluated LLM application quality with LangSmith, cutting failed responses by 30%.',
    ],
  },
  {
    company: 'Tecclub Technology',
    role: 'AI Developer / ML Developer',
    period: 'Feb 2025 – Jan 2026',
    metrics: ['25 h/week saved', '73% F1'],
    bullets: [
      'Built and deployed ML models in TensorFlow and scikit-learn, owning the full pipeline from preprocessing and feature engineering to training and evaluation.',
      'Developed structured, multi-step generative AI workflows with LangChain and LangGraph, using tool calling to connect agents to external systems.',
      'Integrated AI models with backend systems through REST APIs and webhooks, automating workflows in n8n and saving 25 hours of manual work per week.',
    ],
  },
  {
    company: 'Fenris Group',
    role: 'AI & Deep Learning Intern',
    period: 'Apr 2023 – Jun 2023',
    metrics: ['82% → 91% detection'],
    bullets: [
      'Built a real-time motion detection and tracking system for live video, combining frame differencing and optical flow with CNN-based object detection.',
      'Annotated and preprocessed video data and tuned OpenCV parameters to improve accuracy under varying lighting and motion.',
      'Covered the full computer vision lifecycle: data collection, annotation, training and evaluation.',
    ],
  },
];

export const projectCategories = [
  { id: 'all', label: 'All' },
  { id: 'automation', label: 'Automation' },
  { id: 'genai', label: 'GenAI & Agents' },
  { id: 'vision', label: 'Computer Vision' },
];

export const projects = [
  {
    id: 'carbatterysquad',
    title: 'CarBatterySquad',
    subtitle: 'End-to-end WhatsApp sales & support automation',
    client: 'Dubai, UAE',
    category: 'automation',
    featured: true,
    description:
      'A WhatsApp bot that runs the full customer journey for a Dubai car battery company, from the first enquiry to a closed sale, 24/7. Every conversation is stored in PostgreSQL so the bot remembers returning customers, sends sale and complaint alerts to the team, and hands over cleanly when a human takes the chat.',
    metric: '24/7 · first message to closed sale',
    tech: ['n8n', 'WhatsApp Cloud API', 'LLM', 'PostgreSQL', 'Webhooks'],
    links: [],
  },
  {
    id: 'develmo-crm',
    title: 'DevelMO CRM Lead Engine',
    subtitle: 'GoHighLevel lead generation & outreach automation',
    client: 'DevelMO',
    category: 'automation',
    featured: true,
    description:
      'Pulls B2B leads from Apollo, cleans them into GoHighLevel, sends AI-personalised emails with automated follow-ups, runs sentiment analysis on replies and books a developer meeting for every positive response.',
    metric: '+30% revenue in the first month',
    tech: ['Apollo', 'GoHighLevel', 'LLMs', 'Sentiment analysis'],
    links: [],
  },
  {
    id: 'develmo-voice',
    title: 'AI Voice Cold-Calling Agent',
    subtitle: 'Outbound voice agent, now a DevelMO product',
    client: 'DevelMO',
    category: 'genai',
    featured: true,
    description:
      'An ElevenLabs voice agent that pulls each lead from the CRM, generates a personalised opening line and handles the live conversation end to end. Packaged as a product and used by DevelMO for its own outbound calls.',
    metric: '95% accuracy understanding callers',
    tech: ['ElevenLabs', 'Voice AI', 'CRM API'],
    links: [{ label: 'Product page', url: 'https://develmo.com/our-products/ai-voice-agent' }],
  },
  {
    id: 'neoline',
    title: 'Neoline',
    subtitle: 'WhatsApp AI customer service chatbot',
    category: 'automation',
    description:
      "A WhatsApp Cloud API bot that answers any question about Neoline's services instantly. Every reply is grounded with RAG: service docs and FAQs are embedded with OpenAI and stored in Qdrant, and the most relevant passages are retrieved before the LLM answers.",
    metric: 'Instant, grounded answers 24/7',
    tech: ['n8n', 'WhatsApp Cloud API', 'RAG', 'Qdrant', 'OpenAI Embeddings'],
    links: [],
  },
  {
    id: 'support-bots',
    title: 'Sylink & SecureTapVPN',
    subtitle: 'AI customer support chatbots',
    category: 'genai',
    description:
      "RAG chatbots that answer FAQ and product questions from each client's knowledge base, deployed on their websites. Includes webhook-triggered document ingestion and a human-in-the-loop escalation flow with an admin panel for live agent takeover and automatic hand-back.",
    metric: '500+ queries/month · 90% resolved without a human',
    tech: ['n8n', 'RAG', 'Qdrant', 'OpenAI Embeddings', 'Webhooks'],
    links: [
      { label: 'Sylink', url: 'https://sylink.tecclubx.site' },
      { label: 'SecureTapVPN', url: 'https://securetapvpn.com' },
    ],
  },
  {
    id: 'foodmate',
    title: 'FoodMate',
    subtitle: 'AI meal & nutrition analysis backend',
    category: 'vision',
    description:
      'A backend that identifies a meal from a single photo with a vision language model and estimates calories, protein, fat and carbohydrates, plus an in-app AI nutrition coach exposed through a REST API to the existing app.',
    metric: '90% accuracy on clear images · 79% on blurry',
    tech: ['Vision Language Model', 'REST API', 'FastAPI'],
    links: [{ label: 'Live app', url: 'https://foodmate.xapcoders.com' }],
  },
  {
    id: 'optivortium',
    title: 'Optivortium Alliance',
    subtitle: 'AI eyewear platform · final year project',
    category: 'vision',
    description:
      'Real-time virtual try-on that overlays glasses on a live webcam feed using a 478-point facial landmark model and affine transforms, with a geometry-based face shape classifier that drives personalised frame recommendations.',
    metric: '87% face-shape accuracy on 700+ images',
    tech: ['OpenCV', 'MediaPipe', 'Dlib', 'scikit-learn', 'Flask', 'React', 'Node.js'],
    links: [],
  },
  {
    id: 'ppc-rag',
    title: 'Pakistan Penal Code Legal RAG',
    subtitle: 'Legal assistant grounded in PPC 1860',
    category: 'genai',
    description:
      "A retrieval-augmented legal assistant that advises on applicable sections and citizens' rights. Combines PyMuPDF extraction with a RapidOCR fallback for scanned pages, cosine-similarity semantic search and GPT-4o-mini answers with exact section citations and punishment ranges.",
    metric: 'Exact section citations on every answer',
    tech: ['Python', 'GPT-4o-mini', 'OpenAI Embeddings', 'PyMuPDF', 'RapidOCR', 'Flask'],
    links: [{ label: 'GitHub', url: 'https://github.com/25sheraz/RAG-CRIMINAL-CHAT-BOT' }],
  },
  {
    id: 'self-learning-agent',
    title: 'Self-Learning Coding Agent',
    subtitle: 'Autonomous agent that learns from its own failures',
    category: 'genai',
    description:
      'A LangChain coding agent that writes Python, runs it in an isolated sandbox and self-corrects from tracebacks. A persistent memory distils each failure into a reusable lesson, measured with a HumanEval harness tracking pass@1 and self-correction recovery.',
    metric: 'pass@1 62% → 74% with memory enabled',
    tech: ['Python', 'LangChain', 'Kimi K2.7-Code', 'HumanEval', 'Rich CLI'],
    links: [{ label: 'GitHub', url: 'https://github.com/25sheraz/Self-Learning-Agent' }],
  },
];

export const skills = [
  {
    id: 'automation',
    name: 'Automation & CRM',
    blurb: 'Wiring AI into the tools businesses already run on.',
    items: ['n8n', 'GoHighLevel CRM', 'WhatsApp Cloud API', 'ElevenLabs Voice AI', 'Apollo', 'Zapier', 'Webhooks', 'REST APIs', 'Human-in-the-loop handoff', 'Workflow automation'],
  },
  {
    id: 'genai',
    name: 'Generative AI & Agents',
    blurb: 'Agents and retrieval that stay grounded and measurable.',
    items: ['RAG', 'Hybrid search (dense + BM25)', 'Reranking', 'Embeddings', 'LangChain', 'LangGraph', 'LangSmith', 'Multi-agent workflows', 'Tool calling', 'VLMs', 'OpenAI API', 'Prompt & context engineering', 'Agent evaluation harness', 'Sentiment analysis'],
  },
  {
    id: 'ml',
    name: 'ML & Computer Vision',
    blurb: 'Models trained, tuned and evaluated end to end.',
    items: ['Python', 'TensorFlow', 'scikit-learn', 'OpenCV', 'MediaPipe', 'CNNs', 'Feature engineering', 'Model training & evaluation', 'Fine-tuning'],
  },
  {
    id: 'backend',
    name: 'Backend & Data',
    blurb: 'APIs and storage that keep the models honest.',
    items: ['FastAPI', 'Flask', 'Node.js', 'Express.js', 'React', 'JavaScript', 'C++', 'PostgreSQL', 'Qdrant', 'Redis', 'ChromaDB', 'MongoDB', 'MySQL'],
  },
  {
    id: 'tools',
    name: 'Deployment & Tools',
    blurb: 'Shipping it and keeping it running.',
    items: ['Docker', 'UltaHost', 'Vercel', 'Git', 'GitHub', 'VS Code', 'Jupyter Notebook'],
  },
];

export const education = [
  { school: 'The University of Faisalabad', degree: 'BS Software Engineering', period: '2022 – 2026', result: 'CGPA 3.61 / 4.00' },
  { school: 'Punjab Group of Colleges', degree: 'Intermediate (Pre-Engineering)', period: '2020 – 2022', result: '87%' },
];
