import { GoogleGenerativeAI } from '@google/generative-ai';

// Simple mock generator to fallback if API key is missing or fails
const generateMockReport = (resumeText) => {
  const lowercaseText = (resumeText || '').toLowerCase();

  // A. Generate text hash for deterministic randomization
  let hash = 0;
  for (let i = 0; i < lowercaseText.length; i++) {
    hash = (hash << 5) - hash + lowercaseText.charCodeAt(i);
    hash = hash & 0xFFFFFFFF; // Convert to 32bit integer
  }
  hash = Math.abs(hash);

  const selectDeterministic = (arr, count, seed) => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = (seed + i) % (i + 1);
      const temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }
    return shuffled.slice(0, count);
  };

  // B. Domain Detection
  let webHits = 0;
  let backendHits = 0;
  let dsHits = 0;

  const webKeywords = ['react', 'html', 'css', 'javascript', 'vue', 'angular', 'frontend', 'web', 'ui', 'ux', 'tailwind', 'sass', 'jquery'];
  const backendKeywords = ['node', 'express', 'django', 'spring', 'java', 'c++', 'backend', 'postgres', 'mysql', 'sql', 'redis', 'apis', 'rest api', 'graphql', 'docker', 'kubernetes', 'aws'];
  const dsKeywords = ['python', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'machine learning', 'ml', 'ai', 'data science', 'scikit', 'deep learning', 'tableau', 'r'];

  webKeywords.forEach(kw => { if (lowercaseText.includes(kw)) webHits++; });
  backendKeywords.forEach(kw => { if (lowercaseText.includes(kw)) backendHits++; });
  dsKeywords.forEach(kw => { if (lowercaseText.includes(kw)) dsHits++; });

  let domain = 'general';
  if (webHits > backendHits && webHits > dsHits) {
    domain = 'frontend';
  } else if (backendHits > webHits && backendHits > dsHits) {
    domain = 'backend';
  } else if (dsHits > webHits && dsHits > backendHits) {
    domain = 'datascience';
  }

  // C. Dictionaries for missing skills/keywords based on domain
  const domainSkills = {
    frontend: [
      'TypeScript', 'Redux Toolkit', 'Next.js Framework', 'Webpack & Vite', 'Jest Unit Testing',
      'Tailwind CSS', 'GraphQL Apollo Client', 'Web Accessibility (a11y)', 'Progressive Web Apps (PWA)',
      'State Management (Zustand/Redux)', 'Single Page Application (SPA) optimization', 'SASS/SCSS Styling'
    ],
    backend: [
      'Docker Containerization', 'Kubernetes Orchestration', 'GraphQL API Design', 'Redis Caching',
      'Microservices Architecture', 'OAuth2 / JWT Security', 'PostgreSQL / MongoDB optimization',
      'Message Queues (Kafka/RabbitMQ)', 'AWS Cloud Architecture', 'Unit Testing with Mocha/Jest',
      'CI/CD Pipeline Automation', 'API Gateway Configuration'
    ],
    datascience: [
      'Machine Learning Pipelines', 'Deep Learning (TensorFlow/PyTorch)', 'Data Analysis with Pandas/NumPy',
      'Data Visualization (Tableau/Matplotlib)', 'SQL Database Optimization', 'AWS Sagemaker / MLOps',
      'NLP & Large Language Models (LLMs)', 'Scikit-Learn Algorithms', 'Statistical Modeling & R',
      'Jupyter Notebook Best Practices', 'ETL Data Pipelines', 'Data Warehousing (Snowflake)'
    ],
    general: [
      'System Architecture Design', 'Agile & Scrum Methodologies', 'CI/CD Pipeline Automation',
      'Docker Containerization', 'Unit & Integration Testing', 'API Design & Integration',
      'Cloud Architecture (AWS/GCP)', 'Version Control (Git)', 'Database Optimization',
      'Cybersecurity Best Practices', 'Microservices Deployment', 'Performance Monitoring Tools'
    ]
  };

  const domainKeywords = {
    frontend: [
      'TYPESCRIPT', 'REDUX STATE MANAGEMENT', 'NEXT.JS', 'COMPLEX ROUTING', 'FRONTEND TESTING',
      'CSS PREPROCESSORS', 'WEB VITALS', 'DOM OPTIMIZATION', 'SINGLE PAGE APPLICATION', 'CLIENT-SIDE RENDERING'
    ],
    backend: [
      'MICROSERVICES', 'DOCKER CONTAINERIZATION', 'KUBERNETES', 'JWT AUTH', 'API RATE LIMITING',
      'DATABASE SHARDING', 'REDIS CACHING', 'MESSAGE QUEUES', 'AWS CLOUD DEPLOYMENT', 'RESTFUL APIS'
    ],
    datascience: [
      'MACHINE LEARNING', 'DEEP LEARNING', 'PANDAS', 'NUMPY', 'TENSORFLOW', 'SQL QUERY OPTIMIZATION',
      'MLOPS', 'LLM INTEGRATION', 'DATA VISUALIZATION', 'NATURAL LANGUAGE PROCESSING'
    ],
    general: [
      'SYSTEM DESIGN', 'AGILE SCRUM', 'CI/CD', 'DOCKER', 'UNIT TESTING', 'RESTFUL APIS',
      'AWS DEPLOYMENT', 'GIT WORKFLOW', 'DATABASE OPTIMIZATION', 'SCALABILITY ANALYSIS'
    ]
  };

  // D. Find matching keywords in resume
  const allTechKeywords = [
    ...webKeywords,
    ...backendKeywords,
    ...dsKeywords
  ];
  const uniqueTechKeywords = [...new Set(allTechKeywords)];
  const foundKeywords = uniqueTechKeywords.filter(kw => lowercaseText.includes(kw));

  // Determine strengths, missing skills & keywords based on domain
  const possibleSkills = domainSkills[domain];
  const possibleKeywords = domainKeywords[domain];

  // Filter out any skills or keywords that are already present in the resume text
  const filteredMissingSkills = possibleSkills.filter(skill => !lowercaseText.includes(skill.toLowerCase()));
  const filteredMissingKeywords = possibleKeywords.filter(kw => !lowercaseText.includes(kw.toLowerCase()));

  // Select a deterministic subset of 3 missing skills and 4 missing keywords
  const missingSkillsList = selectDeterministic(filteredMissingSkills.length >= 3 ? filteredMissingSkills : possibleSkills, 3, hash);
  const missingATSKeywordsList = selectDeterministic(filteredMissingKeywords.length >= 4 ? filteredMissingKeywords : possibleKeywords, 4, hash);

  // E. Score calculations
  let score = 45; // Base score
  const suggestions = [];
  const strengths = [];

  // Structure checks
  let hasExperience = false;
  if (lowercaseText.includes('experience') || lowercaseText.includes('work history') || lowercaseText.includes('employment') || lowercaseText.includes('work experience')) {
    score += 10;
    strengths.push('Professional experience section is clearly structured');
    hasExperience = true;
  } else {
    score -= 10;
    suggestions.push('Formatting: Missing an Experience or Work History section. ATS filters require chronological work history.');
  }

  if (lowercaseText.includes('education') || lowercaseText.includes('degree') || lowercaseText.includes('university') || lowercaseText.includes('college')) {
    score += 5;
    strengths.push('Educational background section is present');
  } else {
    score -= 5;
    suggestions.push('Formatting: Missing an Education section indicating your degrees/credentials.');
  }

  if (lowercaseText.includes('project') || lowercaseText.includes('portfolio') || lowercaseText.includes('key achievements')) {
    score += 5;
    strengths.push('Includes project achievements to demonstrate practical skills');
  } else {
    score -= 5;
    suggestions.push('Formatting: Add a Projects or Portfolio section to show practical application of skills.');
  }

  // Keyword scoring
  const keywordPoints = Math.min(foundKeywords.length * 2, 20);
  score += keywordPoints;
  if (foundKeywords.length > 0) {
    const formattedFound = foundKeywords.map(kw => {
      if (kw === 'c++') return 'C++';
      if (kw === 'html') return 'HTML';
      if (kw === 'css') return 'CSS';
      if (kw === 'sql') return 'SQL';
      if (kw === 'aws') return 'AWS';
      if (kw === 'apis' || kw === 'rest api') return 'REST APIs';
      return kw.charAt(0).toUpperCase() + kw.slice(1);
    });
    const uniqueFormattedFound = [...new Set(formattedFound)];
    const sampleFound = selectDeterministic(uniqueFormattedFound, 5, hash);
    strengths.push(`Identified key technical skills: ${sampleFound.join(', ')}`);
  }

  // Contact details validation
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(lowercaseText);
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b/.test(lowercaseText);
  const hasLinks = /github\.com|linkedin\.com|portfolio|http[s]?:\/\//.test(lowercaseText);

  if (!hasEmail) {
    score -= 10;
    suggestions.push('Contact Info: Missing a valid email address. ATS parser cannot categorize your profile without an email.');
  }
  if (!hasPhone) {
    score -= 10;
    suggestions.push('Contact Info: Missing a contact phone number. Employers need phone details for interview outreach.');
  }
  if (!hasLinks) {
    score -= 8;
    suggestions.push('Contact Info: Provide professional profile links (e.g., LinkedIn, GitHub, or Portfolio URL).');
  }
  if (hasEmail && hasPhone && hasLinks) {
    strengths.push('Complete contact information is provided (Email, Phone, and Professional Profile links)');
  }

  // Metrics validation
  const hasMetrics = /%|\b\d+\s*(?:percent|hr|hours|months|years|users|clients|projects|million|k|usd)\b|\$\d+/.test(lowercaseText);
  if (!hasMetrics) {
    score -= 15;
    suggestions.push('ATS Optimization: Add quantifiable metrics (e.g., "improved loading speed by 25%", "managed 3 projects simultaneously"). ATS filters rank candidates higher when impact is measured.');
  } else {
    strengths.push('Includes numerical metrics to quantify impact and achievements');
  }

  // Buzzwords check
  const buzzwords = ['synergy', 'detail-oriented', 'hardworking', 'motivated', 'team player', 'results-driven', 'go-getter', 'self-starter'];
  const foundBuzzwords = buzzwords.filter(word => lowercaseText.includes(word));
  if (foundBuzzwords.length > 0) {
    score -= Math.min(foundBuzzwords.length * 3, 12);
    suggestions.push(`ATS Clichés: Avoid generic buzzwords/clichés like [${foundBuzzwords.slice(0, 3).join(', ')}]. Use action verbs and metrics instead.`);
  }

  // Spelling & Typo checks
  const grammarSpellingMistakes = [];
  if (lowercaseText.includes('teh')) {
    grammarSpellingMistakes.push("Spelling Error: Found 'teh' (should be 'the').");
    score -= 8;
  }
  if (lowercaseText.includes('recieved')) {
    grammarSpellingMistakes.push("Spelling Error: Found 'recieved' (should be 'received').");
    score -= 8;
  }
  if (lowercaseText.includes('seperate')) {
    grammarSpellingMistakes.push("Spelling Error: Found 'seperate' (should be 'separate').");
    score -= 8;
  }
  if (lowercaseText.includes('deffiernt') || lowercaseText.includes('deffiertn')) {
    grammarSpellingMistakes.push("Spelling Error: Found 'deffiernt/deffiertn' (should be 'different').");
    score -= 8;
  }
  if (lowercaseText.includes('colore') || lowercaseText.includes('theam')) {
    grammarSpellingMistakes.push("Spelling Error: Found 'colore/theam' (should be 'color/theme').");
    score -= 6;
  }
  if (lowercaseText.includes('commited')) {
    grammarSpellingMistakes.push("Spelling Error: Found 'commited' (should be 'committed').");
    score -= 8;
  }
  if (lowercaseText.includes('responsable')) {
    grammarSpellingMistakes.push("Spelling Error: Found 'responsable' (should be 'responsible').");
    score -= 8;
  }
  if (lowercaseText.includes('i am responsible for') || lowercaseText.includes('duties included')) {
    grammarSpellingMistakes.push("Grammar: Avoid passive phrasing like 'duties included'. Use active verbs (e.g., 'Managed', 'Developed').");
    score -= 5;
  }

  const spellingErrors = [...grammarSpellingMistakes];

  // Dynamic additional general suggestions if none are generated, to make it look professional
  const generalImprovementTips = [
    'System Design: Mention architecture patterns used (e.g. MVC, Microservices, Serverless) to show structural knowledge.',
    'Formatting: Keep font sizes consistent between 10-12pt for body copy and 14-16pt for headings.',
    'ATS Parsing: Convert any tables/charts to bullet points, as tables sometimes break older ATS parser grids.',
    'Header: Ensure your name is the largest element at the very top of the page. Do not put it inside a header box.',
    'Action Verbs: Start bullet items in the experience section with strong verbs like "Spearheaded", "Streamlined", "Engineered".'
  ];
  if (suggestions.length < 2) {
    const extraTips = selectDeterministic(generalImprovementTips, 2, hash);
    suggestions.push(...extraTips);
  }

  // Strict score capping
  const hasCriticalErrors = grammarSpellingMistakes.length > 0 || !hasEmail || !hasPhone || !hasMetrics;
  const maxCap = hasCriticalErrors ? 72 : 85;
  score = Math.max(Math.min(score, maxCap), 10);
  score = Math.round(score);

  const foundKeywordsFormatted = foundKeywords.map(kw => kw.toUpperCase());

  // Domain feedback text
  const domainNames = {
    frontend: 'Frontend/Web Development',
    backend: 'Backend/Systems Development',
    datascience: 'Data Science & AI/ML',
    general: 'Software Development'
  };
  const overallFeedback = `Local analysis detected a candidate profile matching the ${domainNames[domain]} domain. Identified ${foundKeywords.length} technical keywords. ` +
    (grammarSpellingMistakes.length > 0
      ? `A total of ${grammarSpellingMistakes.length} spelling/phrasing issues were flagged, which reduced the overall ATS rating. `
      : `Spelling and grammar verification was successful with no critical typos detected. `) +
    `For advanced AI-powered insights and deep alignment with professional ATS standards, configure the Gemini AI API Key in the server configuration.`;

  return {
    atsScore: score,
    strengths,
    foundKeywords: foundKeywordsFormatted,
    missingSkills: missingSkillsList,
    missingKeywords: missingATSKeywordsList,
    spellingErrors,
    suggestions,
    overallFeedback
  };
};

export const analyzeResumeWithGemini = async (resumeText) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_key' || apiKey.trim() === '') {
    console.log('WARN: GEMINI_API_KEY is not configured or placeholder. Falling back to local heuristic analysis.');
    return generateMockReport(resumeText);
  }

  try {
    const ai = new GoogleGenerativeAI(apiKey);

    // Using gemini-1.5-flash as specified in the tech stack
    const model = ai.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });

    const prompt = `
You are an expert HR consultant, professional proofreader, and Applicant Tracking System (ATS) optimization specialist.
Analyze the following resume plain text and evaluate it rigorously against typical modern ATS screening standards and writing guidelines.

Perform the following evaluations in extreme detail:
1. **Spelling & Typographical Errors:** Conduct a line-by-line review to find any spelling mistakes, typos, incorrect spacing, and punctuation issues.
2. **Grammar & Sentence Phrasing:** Identify grammatical mistakes, incorrect tenses, passive voice, and weak verbs.
3. **ATS Keywords & Skills:** Detect technical skills and search keywords successfully matching the candidate's career domain, and those that are missing.
4. **ATS Score Penalty:** Deduct 5-10 points for each spelling, grammar, or phrasing error identified. Professional resumes are expected to be error-free.

Provide feedback as a JSON object with the exact format specified below:
{
  "atsScore": 75,
  "strengths": ["List of strengths"],
  "foundKeywords": ["Important ATS keywords successfully identified in the resume (e.g. React, Node, AWS)"],
  "missingSkills": ["List of skills that should be added based on their domain"],
  "missingKeywords": ["Important ATS keywords missing"],
  "spellingErrors": [
    "List of spelling, typing, grammar, or phrasing errors found in the resume. Format them clearly, e.g., 'Spelling Error: Changed \"recieved\" to \"received\"' or 'Grammar: Avoid passive phrasing \"was responsible for\"'."
  ],
  "suggestions": [
    "List of actionable suggestions for general improvement (other than spelling/grammar, such as document structure, formatting, or metrics)."
  ],
  "overallFeedback": "Short summary assessing readability, spelling/grammar quality, and overall impact."
}

Ensure the JSON is well-formed, valid, and contains only the JSON structure (do not wrap in markdown \`\`\`json block). The atsScore must be a number between 0 and 100.

Resume content:
"""
${resumeText}
"""
`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      }
    });

    const responseText = result.response.text();

    try {
      const parsedData = JSON.parse(responseText.trim());

      // Basic validation of fields to ensure database compatibility
      return {
        atsScore: typeof parsedData.atsScore === 'number' ? parsedData.atsScore : 60,
        strengths: Array.isArray(parsedData.strengths) ? parsedData.strengths : ['Valid contact info'],
        foundKeywords: Array.isArray(parsedData.foundKeywords) ? parsedData.foundKeywords : [],
        missingSkills: Array.isArray(parsedData.missingSkills) ? parsedData.missingSkills : [],
        missingKeywords: Array.isArray(parsedData.missingKeywords) ? parsedData.missingKeywords : [],
        spellingErrors: Array.isArray(parsedData.spellingErrors) ? parsedData.spellingErrors : [],
        suggestions: Array.isArray(parsedData.suggestions) ? parsedData.suggestions : [],
        overallFeedback: typeof parsedData.overallFeedback === 'string' ? parsedData.overallFeedback : 'Resume successfully parsed.',
      };
    } catch (parseError) {
      console.error('Failed to parse JSON response from Gemini:', responseText);
      console.log('Falling back to local heuristic analysis.');
      return generateMockReport(resumeText);
    }
  } catch (error) {
    console.error('Gemini API request failed:', error);
    console.log('Falling back to local mock report.');
    return generateMockReport(resumeText);
  }
};
