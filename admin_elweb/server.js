import express from 'express';
import session from 'express-session';
import axios from 'axios';

const app = express();
const apiBase = process.env.API_BASE_URL || 'http://localhost:4000';

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({ secret: process.env.SESSION_SECRET || 'elweb', resave: false, saveUninitialized: false, cookie: { httpOnly: true } }));
app.use('/static', express.static('public'));

const guard = (req, res, next) => (req.session.adminCookie ? next() : res.redirect('/login'));

app.get('/login', (_req, res) => res.render('login', { error: null }));
app.post('/login', async (req, res) => {
  try {
    const response = await axios.post(`${apiBase}/admin/login`, req.body, { withCredentials: true });
    req.session.adminCookie = response.headers['set-cookie'];
    res.redirect('/orders');
  } catch {
    res.render('login', { error: 'Identifiants invalides' });
  }
});

app.get('/orders', guard, async (req, res) => {
  const response = await axios.get(`${apiBase}/admin/orders`, { headers: { Cookie: req.session.adminCookie } });
  res.render('orders/index', { orders: response.data });
});

app.post('/orders/:id/status', guard, async (req, res) => {
  await axios.patch(`${apiBase}/admin/orders/${req.params.id}/status`, { status: req.body.status }, { headers: { Cookie: req.session.adminCookie } });
  res.redirect('/orders');
});

app.get('/notifications', guard, async (req, res) => {
  const response = await axios.get(`${apiBase}/admin/notifications/logs`, { headers: { Cookie: req.session.adminCookie } });
  res.render('notifications/index', { logs: response.data });
});

app.post('/notifications/send', guard, async (req, res) => {
  await axios.post(`${apiBase}/admin/notifications/send`, req.body, { headers: { Cookie: req.session.adminCookie } });
  res.redirect('/notifications');
});

app.listen(4100, () => console.log('Elweb running on 4100'));
