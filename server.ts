import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { readDb, writeDb, initializeDbConnection } from './server-db';
import { User, Lesson, Tournament, ForumPost, StoreItem } from './src/types';
import { isSupabaseConfigured, supabase, fetchSupabaseDb, saveSupabaseDb } from './supabase-server';

dotenv.config();

const app = express();
const PORT = 3000;

// Raise limits to handle real video/image base64 uploads easily
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Serve static uploaded videos/photos under /uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Serve the user's uploaded logo images directly to human eyes
app.get('/input_file_0.png', (req, res) => {
  const filePath = path.join(process.cwd(), 'input_file_0.png');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Logo Team Paulo Souza not found');
  }
});

app.get('/input_file_1.png', (req, res) => {
  const filePath = path.join(process.cwd(), 'input_file_1.png');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Logo Cobra Kai not found');
  }
});

// Shared Gemini AI platform instance
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// ----------------------------------------------------
// REST APIs: DATABASE & AUTHENTICATION (Real persistence)
// ----------------------------------------------------

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// GET /api/database - Get full lists of state
app.get('/api/database', (req, res) => {
  const db = readDb();
  res.json(db);
});

// GET /api/supabase/status - Get current Supabase credentials and health stats
app.get('/api/supabase/status', async (req, res) => {
  if (!isSupabaseConfigured) {
    return res.json({
      configured: false,
      message: 'Credenciais do Supabase não configuradas no arquivo .env local ou do servidor.'
    });
  }

  try {
    const { error } = await supabase!
      .from('dojo_state')
      .select('key')
      .eq('key', 'main_data')
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      return res.json({
        configured: true,
        connected: false,
        error: error.message,
        message: 'Conectado ao Supabase, mas a tabela `dojo_state` não existe ou não pôde ser lida no momento.'
      });
    }

    res.json({
      configured: true,
      connected: true,
      message: 'Supabase conectado com sucesso! Tabela `dojo_state` verificada.'
    });
  } catch (err: any) {
    res.json({
      configured: true,
      connected: false,
      error: err.message || String(err),
      message: 'Falha crítica ao tentar conectar ao Supabase.'
    });
  }
});

// POST /api/supabase/sync-from-cloud - Direct action to replace local db cache with cloud
app.post('/api/supabase/sync-from-cloud', async (req, res) => {
  if (!isSupabaseConfigured) {
    return res.status(400).json({ error: 'Supabase não está configurado.' });
  }

  try {
    const cloudDb = await fetchSupabaseDb();
    if (cloudDb) {
      writeDb(cloudDb); // writes locally and back
      res.json({ success: true, message: 'Dados baixados e sincronizados do Supabase com sucesso!', data: cloudDb });
    } else {
      res.status(404).json({ error: 'Nenhum dado salvo encontrado no Supabase para sincronização.' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro inesperado na sincronização.' });
  }
});

// POST /api/supabase/sync-to-cloud - Direct action to upload current local db cache to cloud
app.post('/api/supabase/sync-to-cloud', async (req, res) => {
  if (!isSupabaseConfigured) {
    return res.status(400).json({ error: 'Supabase não está configurado.' });
  }

  try {
    const localDb = readDb();
    const success = await saveSupabaseDb(localDb);
    if (success) {
      res.json({ success: true, message: 'Dados locais enviados e salvos no Supabase com sucesso!' });
    } else {
      res.status(500).json({ error: 'Falha ao salvar no Supabase. Verifique se criou a tabela dojo_state.' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro inesperado no salvamento.' });
  }
});

// POST /api/auth/register - Register a real user
app.post('/api/auth/register', (req, res) => {
  const { email, name, password, role, belt } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Faltam dados obrigatórios para registro.' });
  }

  const db = readDb();
  const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (existingUser) {
    return res.status(400).json({ error: 'Este e-mail já está cadastrado. Por favor, use a tela de Login.' });
  }

  const isOwnerAdmin = email.toLowerCase() === 'joaopedromoladeoliveira@gmail.com' || email.toLowerCase() === 'joaopedromolaoliveira@gmail.com';
  
  const newUser: User = {
    id: 'student-' + Date.now().toString(),
    name,
    email: email.toLowerCase(),
    password: password || '',
    role: isOwnerAdmin ? 'admin' : (role || 'student'),
    belt: isOwnerAdmin ? 'preta' : (belt || 'branca'),
    xp: 0,
    level: 1,
    enrolledDate: new Date().toISOString().split('T')[0],
    completedLessons: [],
    certificates: [],
    followersCount: 0,
    followingCount: 3,
    country: 'Brasil',
    wins: 0,
    losses: 0,
    trophies: 0,
    streak: 1
  };

  db.users.push(newUser);
  writeDb(db);
  res.status(201).json(newUser);
});

// POST /api/auth/login - Real login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email é necessário para o login.' });
  }

  const db = readDb();
  let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (user) {
    if (user.password && password && user.password !== password) {
      return res.status(401).json({ error: 'Senha incorreta! Por favor, tente novamente de maneira correta.' });
    }
    // Set password if not already present
    if (!user.password && password) {
      user.password = password;
      writeDb(db);
    }
    res.json(user);
  } else {
    // Under user request, if the user doesn't exist, we do NOT auto-register them anymore.
    res.status(404).json({ error: 'Usuário não encontrado no banco de dados do Dojo! Por favor, realize a matrícula clicando no botão "Criar Nova Matrícula" abaixo.' });
  }
});

// POST /api/users/update-xp
app.post('/api/users/update-xp', (req, res) => {
  const { userId, xpGain } = req.body;
  const db = readDb();
  const uIndex = db.users.findIndex(u => u.id === userId);
  
  if (uIndex === -1) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  const user = db.users[uIndex];
  const nextXP = user.xp + (Number(xpGain) || 0);
  const nextLvl = Math.floor(nextXP / 150) + 1;

  db.users[uIndex] = {
    ...user,
    xp: nextXP,
    level: Math.max(user.level, nextLvl)
  };

  writeDb(db);
  res.json(db.users[uIndex]);
});

// POST /api/users/graduate
app.post('/api/users/graduate', (req, res) => {
  const { userId, belt } = req.body;
  const db = readDb();
  const uIndex = db.users.findIndex(u => u.id === userId);
  
  if (uIndex === -1) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  db.users[uIndex].belt = belt;
  writeDb(db);
  res.json(db.users[uIndex]);
});

// POST /api/users/update-admin-details
app.post('/api/users/update-admin-details', (req, res) => {
  const { userId, xp, level, belt, role } = req.body;
  const db = readDb();
  const uIndex = db.users.findIndex(u => u.id === userId);
  
  if (uIndex === -1) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  const user = db.users[uIndex];
  db.users[uIndex] = {
    ...user,
    xp: xp !== undefined ? Number(xp) : user.xp,
    level: level !== undefined ? Number(level) : user.level,
    belt: belt !== undefined ? belt : user.belt,
    role: role !== undefined ? role : user.role
  };

  writeDb(db);
  res.json(db.users[uIndex]);
});

// POST /api/users/toggle-follow
app.post('/api/users/toggle-follow', (req, res) => {
  const { currentUserId, targetUserId } = req.body;
  const db = readDb();
  
  const curIndex = db.users.findIndex(u => u.id === currentUserId);
  const tarIndex = db.users.findIndex(u => u.id === targetUserId);

  if (curIndex !== -1 && tarIndex !== -1) {
    // We just simulate follower incrementing for simplicity
    db.users[tarIndex].followersCount += 1;
    writeDb(db);
    return res.json({ success: true, targetUser: db.users[tarIndex] });
  }
  res.status(404).json({ error: 'Faltam dados de id.' });
});

// ----------------------------------------------------
// REST APIs: LESSONS (Real persistence)
// ----------------------------------------------------

// POST /api/lessons - Add a real lesson
app.post('/api/lessons', (req, res) => {
  const newL: Lesson = req.body;
  const db = readDb();
  db.lessons.push(newL);
  writeDb(db);
  res.status(201).json(newL);
});

// DELETE /api/lessons/:id - Delete lesson
app.delete('/api/lessons/:id', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  db.lessons = db.lessons.filter(l => l.id !== id);
  writeDb(db);
  res.json({ success: true });
});

// POST /api/lessons/:id/complete - Mark completed
app.post('/api/lessons/:id/complete', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  const db = readDb();
  
  const uIndex = db.users.findIndex(u => u.id === userId);
  if (uIndex !== -1) {
    const user = db.users[uIndex];
    if (!user.completedLessons.includes(id)) {
      user.completedLessons.push(id);
      user.xp += 80; // +80 XP
      user.level = Math.max(user.level, Math.floor(user.xp / 150) + 1);
      writeDb(db);
    }
    return res.json(user);
  }
  res.status(404).json({ error: 'Usuário não encontrado.' });
});

// POST /api/lessons/:id/comment - Add real comment
app.post('/api/lessons/:id/comment', (req, res) => {
  const { id } = req.params;
  const { comment } = req.body; // text, userName, userBelt
  const db = readDb();
  
  const lIndex = db.lessons.findIndex(l => l.id === id);
  if (lIndex !== -1) {
    const newComment = {
      id: Date.now().toString(),
      userName: comment.userName,
      userBelt: comment.userBelt,
      text: comment.text,
      date: 'Agora'
    };
    db.lessons[lIndex].comments.unshift(newComment);
    writeDb(db);
    return res.json(db.lessons[lIndex]);
  }
  res.status(404).json({ error: 'Aula não encontrada.' });
});

// POST /api/lessons/:id/like - Like lesson
app.post('/api/lessons/:id/like', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const lIndex = db.lessons.findIndex(l => l.id === id);
  if (lIndex !== -1) {
    db.lessons[lIndex].likes += 1;
    writeDb(db);
    return res.json(db.lessons[lIndex]);
  }
  res.status(404).json({ error: 'Aula não encontrada.' });
});

// ----------------------------------------------------
// REST APIs: SHOP STORE (Real persistence)
// ----------------------------------------------------

// POST /api/store - Add store item
app.post('/api/store', (req, res) => {
  const newItem: StoreItem = req.body;
  const db = readDb();
  db.storeItems.push(newItem);
  writeDb(db);
  res.status(201).json(newItem);
});

// DELETE /api/store/:id - Delete store item
app.delete('/api/store/:id', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  db.storeItems = db.storeItems.filter(item => item.id !== id);
  writeDb(db);
  res.json({ success: true });
});

// ----------------------------------------------------
// REST APIs: TOURNAMENTS
// ----------------------------------------------------

// POST /api/tournaments - Create tournament
app.post('/api/tournaments', (req, res) => {
  const newT: Tournament = req.body;
  const db = readDb();
  db.tournaments.push(newT);
  writeDb(db);
  res.status(201).json(newT);
});

// POST /api/tournaments/:id/join - Join
app.post('/api/tournaments/:id/join', (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  const db = readDb();
  
  const tIndex = db.tournaments.findIndex(t => t.id === id);
  if (tIndex !== -1) {
    const tour = db.tournaments[tIndex];
    if (!tour.participants.includes(email)) {
      tour.participants.push(email);
      tour.registeredUsersCount += 1;
      writeDb(db);
    }
    return res.json(tour);
  }
  res.status(404).json({ error: 'Torneio não encontrado.' });
});

// ----------------------------------------------------
// REST APIs: FORUM POSTS (Real persistence)
// ----------------------------------------------------

// GET /api/forum
app.get('/api/forum', (req, res) => {
  const db = readDb();
  res.json(db.posts);
});

// POST /api/forum - Submit post
app.post('/api/forum', (req, res) => {
  const post: ForumPost = req.body;
  const db = readDb();
  db.posts.unshift(post);
  writeDb(db);
  res.status(201).json(post);
});

// POST /api/forum/:id/like - Like post
app.post('/api/forum/:id/like', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const pIndex = db.posts.findIndex(p => p.id === id);
  if (pIndex !== -1) {
    db.posts[pIndex].likes += 1;
    writeDb(db);
    return res.json(db.posts[pIndex]);
  }
  res.status(404).json({ error: 'Post do fórum não encontrado.' });
});

// POST /api/forum/:id/reply - Add reply
app.post('/api/forum/:id/reply', (req, res) => {
  const { id } = req.params;
  const { reply } = req.body; // id, userName, content, date
  const db = readDb();
  
  const pIndex = db.posts.findIndex(p => p.id === id);
  if (pIndex !== -1) {
    db.posts[pIndex].replies.push(reply);
    writeDb(db);
    return res.json(db.posts[pIndex]);
  }
  res.status(404).json({ error: 'Post do fórum não encontrado.' });
});

// POST /api/broadcast - Add global alert message
app.post('/api/broadcast', (req, res) => {
  const { message } = req.body;
  const db = readDb();
  db.broadcastMessages.unshift(message);
  writeDb(db);
  res.json(db.broadcastMessages);
});

// ----------------------------------------------------
// REST APIs: PHYSICAL MULTIMEDIA FILE UPLOADER (Real)
// ----------------------------------------------------
app.post('/api/upload', (req, res) => {
  const { fileName, fileData } = req.body;
  if (!fileName || !fileData) {
    return res.status(400).json({ error: 'Falta o fileName ou fileData do arquivo.' });
  }

  try {
    // Decode base64 and write securely to server disk under /uploads/
    const rawData = fileData.replace(/^data:.*;base64,/, '');
    const buffer = Buffer.from(rawData, 'base64');
    
    const ext = path.extname(fileName) || '.mp4';
    const uniqueName = `upload-${Date.now()}-${Math.floor(Math.random() * 100000)}${ext}`;
    const destination = path.join(process.cwd(), 'uploads', uniqueName);
    
    fs.writeFileSync(destination, buffer);
    res.json({ url: `/uploads/${uniqueName}` });
  } catch (err: any) {
    console.error('Real disk upload failed:', err);
    res.status(500).json({ error: 'Falha ao salvar o arquivo fisicamente na máquina de hospedagem.' });
  }
});


// ----------------------------------------------------
// AI SENSEI ENDPOINT PROXIED TO PREVENT KEY LEAKS
// ----------------------------------------------------
app.post('/api/sensei', async (req, res) => {
  const { prompt, userBelt, userLevel, context, imageUrl } = req.body;
  
  if (!ai) {
    return res.json({ 
      text: "Oss! No momento, o sistema de fumaça AI está em manutenção. Siga treinando duro!\n\nRecomendação: Pratique 50 agachamentos e 50 socos no makiwara. Lembre-se: sem compaixão!" 
    });
  }

  try {
    const systemInstruction = `Você é o SENSEI AI, um mestre lendário que mistura a tradição impecável do Karate Shotokan com a mentalidade focada e implacável do Cobra Kai (Do dojo Team Paulo Souza).
Você responde em Português brasileiro. Seu tom é inspirador, exigente e firme. Você usa termos em japonês tradicionais (Oss, Kihon, Kata, Kumite, Hikite, Kime).
Adapte as respostas sabendo que o aluno atual é Faixa ${userBelt || 'Branca'} (Dojo nível ${userLevel || 1}).
Seja objetivo nas recomendações técnicas, e encoraje sempre a treinar diariamente sem dar desculpas! Se o contexto for 'posture' (avaliação técnica por foto), elogie as bases bem feitas e faça correções estruturais claras de bases (Zenkutsu, Kokutsu, Kiba), costas eretas e hikite firme.`;

    let contentInput: any = prompt;

    // Handle optional multimodality base64 photo analyzing for posture
    if (imageUrl && imageUrl.includes(';base64,')) {
      const base64Data = imageUrl.split(';base64,')[1];
      const mimeType = imageUrl.split(';base64,')[0].split(':')[1];
      
      const imagePart = {
        inlineData: {
          mimeType: mimeType || 'image/png',
          data: base64Data
        }
      };
      
      contentInput = {
        parts: [
          { text: prompt || "Analise a técnica deste golpe de karate detalhadamente." },
          imagePart
        ]
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contentInput,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8
      }
    });

    const replyText = response.text || "Oss! Minhas reflexões falharam temporariamente. Concentre seu Kime e tente novamente!";
    res.json({ text: replyText });
  } catch (err: any) {
    console.error('Error querying Gemini API:', err);
    res.json({ 
      text: "Oss! Ocorreu um corte de foco espiritual na minha conexão. Mantenha os cotovelos fechados no Hikite e tente novamente daqui a pouco! Oss!" 
    });
  }
});

// Mount Vite middleware for Assets and Static bundle serves
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cobra Kai Shotokan Server running at http://0.0.0.0:${PORT}`);
  });
}

setupVite();
