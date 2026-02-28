# Bayt Tanjia — Guide de test complet (A à Z)

Ce guide permet de tester **backend API**, **admin web Elweb** et **mobile Flutter** en local, de zéro jusqu’aux notifications push.

## A) Prérequis

- Node.js 20+
- npm 10+
- MySQL 8+
- Flutter SDK (stable) + Android Studio/Xcode selon votre plateforme
- (Optionnel) Firebase projet configuré pour push réel

## B) Cloner et installer

```bash
git clone <votre-repo>
cd Tanjia_mobile
```

## C) Préparer MySQL

1. Créer la base : `bayt_tanjia`
2. Vérifier que MySQL est accessible avec l’utilisateur choisi.

Exemple rapide :

```sql
CREATE DATABASE bayt_tanjia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## D) Configurer le backend

```bash
cd backend_node
cp .env.example .env
```

Éditer `.env` :

- `DATABASE_URL=mysql://<user>:<password>@localhost:3306/bayt_tanjia`
- `JWT_SECRET`
- `ADMIN_SESSION_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH` (bcrypt) **ou** `ADMIN_PASSWORD` (plain text local)
- `PAYZONE_MODE=mock` (recommandé en local)
- `FIREBASE_SERVICE_ACCOUNT_JSON` (laisser vide si pas de push réel)

> Note : Prisma peut aussi lire `backend_node/prisma/.env` comme fallback local.

## E) Installer dépendances + Prisma

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

## F) Démarrer le backend

```bash
npm run dev
```

Vérifier la santé API :

```bash
curl http://localhost:4000/health
```

Réponse attendue : `{"ok":true}`

## G) Démarrer Elweb (admin web)

Nouveau terminal :

```bash
cd admin_elweb
npm install
API_BASE_URL=http://localhost:4000 npm run dev
```

Ouvrir : `http://localhost:4100/login`

## H) Login admin Elweb

- Username = `ADMIN_USERNAME` (backend `.env`)
- Password =
  - la valeur de `ADMIN_PASSWORD` si cette variable est définie, sinon
  - le mot de passe correspondant à `ADMIN_PASSWORD_HASH`

Après login, vous devez voir la liste des commandes.

## I) Tester le flow Auth mobile/API (OTP mock)

### 1) Request OTP

```bash
curl -X POST http://localhost:4000/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"0612345678"}'
```

### 2) Verify OTP (mock = `123456`)

```bash
curl -X POST http://localhost:4000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"0612345678","name":"Client Test","otp":"123456"}'
```

Copier le `token` JWT retourné.

## J) Vérifier catalogue + slots

```bash
curl http://localhost:4000/products
curl "http://localhost:4000/delivery-slots?date=2026-01-01"
```

## K) Enregistrer un device FCM (test API)

```bash
curl -X POST http://localhost:4000/devices/register \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"token":"fake-device-token-1","platform":"ANDROID"}'
```

## L) Créer une commande COD

Récupérer un `productId` et `deliverySlotId`, puis :

```bash
curl -X POST http://localhost:4000/orders \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId":"<PRODUCT_ID>",
    "quantityKg":2,
    "notes":{"spices":"medium"},
    "deliveryDate":"2026-01-01",
    "deliverySlotId":"<SLOT_ID>",
    "name":"Client Test",
    "phone":"0612345678",
    "addressText":"Avenue Mohammed V",
    "city":"Rabat",
    "paymentMethod":"COD"
  }'
```

Vérifier `paymentStatus=UNPAID`.

## M) Lister historique commandes client

```bash
curl -H "Authorization: Bearer <JWT_TOKEN>" http://localhost:4000/orders
```

## N) Vérifier détail commande

```bash
curl -H "Authorization: Bearer <JWT_TOKEN>" http://localhost:4000/orders/<ORDER_ID>
```

## O) Tester Payzone (mode mock)

### 1) Init paiement

```bash
curl -X POST http://localhost:4000/payments/payzone/init \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"orderId":"<ORDER_ID>"}'
```

### 2) Callback mock

```bash
curl -X POST http://localhost:4000/payments/payzone/callback \
  -H "Content-Type: application/json" \
  -d '{"orderId":"<ORDER_ID>","orderRef":"mock-ref-001"}'
```

### 3) Status paiement

```bash
curl -H "Authorization: Bearer <JWT_TOKEN>" \
  "http://localhost:4000/payments/payzone/status?orderId=<ORDER_ID>"
```

## P) Tester changement de statut depuis Elweb

Dans Elweb (`/orders`) :
- Changer statut : `CONFIRMED`, `PREPARING`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`.

Attendu :
- statut commande mis à jour
- tentative d’envoi push automatique
- entrée ajoutée dans logs notifications

## Q) Tester envoi manuel de notification (Elweb)

Dans `/notifications` :
- saisir `title` + `body`
- cibler `userId` ou `orderId`

Attendu : création d’un log notification.

## R) Vérifier logs notifications côté API

```bash
# 1) Se connecter admin pour récupérer le cookie session
curl -i -X POST http://localhost:4000/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 2) Réutiliser le cookie dans l'appel logs
curl -H "Cookie: connect.sid=<SESSION_COOKIE>" \
  http://localhost:4000/admin/notifications/logs
```

## S) Lancer mobile Flutter

```bash
cd mobile_flutter
flutter pub get
flutter run
```

## T) Config Firebase mobile (push réel)

- Android : `mobile_flutter/android/app/google-services.json`
- iOS : `mobile_flutter/ios/Runner/GoogleService-Info.plist`
- Activer FCM côté Firebase Console

## U) Tester push foreground/background mobile

1. Ouvrir app sur device réel.
2. S’authentifier (OTP mock).
3. Vérifier appel `/devices/register` avec token FCM.
4. Envoyer une notif depuis Elweb ou changer statut commande.
5. Vérifier réception :
   - app ouverte (foreground)
   - app en arrière-plan
   - tap notification => ouverture écran concerné (si `orderId` transmis)

## V) Check-list de validation fonctionnelle

- [ ] Quantité min = 1kg
- [ ] Total = `quantity * 200 + 15`
- [ ] Villes autorisées : Rabat / Salé / Témara
- [ ] COD crée une commande `UNPAID`
- [ ] Payzone mock init + callback + status OK
- [ ] Admin login fonctionne en cookie session httpOnly
- [ ] Changement statut => log notification créé

## W) Commandes utiles de debug

```bash
# API health
curl http://localhost:4000/health

# Prisma studio
cd backend_node && npx prisma studio

# Logs runtime backend (terminal npm run dev)
# Logs runtime elweb (terminal npm run dev)
```

## X) Problèmes fréquents

1. **Erreur Prisma P1012 (`mysql://`)**
   - vérifier `DATABASE_URL` dans `backend_node/.env`
   - vérifier format : `mysql://user:pass@host:3306/db`

2. **Admin login refuse le mot de passe**
   - vérifier que le backend lit bien `backend_node/.env`
   - vérifier que votre fichier `.env` contient de **vraies retours à la ligne** (pas des `\n` littéraux dans une seule ligne)
   - si vous utilisez `ADMIN_PASSWORD_HASH`, régénérer le hash bcrypt
   - en local, vous pouvez définir `ADMIN_PASSWORD` pour éviter les erreurs de hash
   - vérifier `ADMIN_USERNAME`

3. **Push non reçu**
   - token non enregistré
   - Firebase service account absent/invalide
   - config Android/iOS Firebase manquante

## Y) Scénario de démo rapide (10 min)

1. Backend + DB up
2. Elweb up
3. OTP verify + récupérer JWT
4. Créer commande COD
5. Ouvrir Elweb, passer statut à `CONFIRMED`
6. Voir log notification
7. (Optionnel) Init paiement Payzone mock + callback

## Z) Critère “prêt recette”

L’application est prête pour une recette interne quand :
- backend tourne sans erreur
- migrations/seed OK
- admin web opérationnel
- mobile lance le parcours commande
- logs notifications visibles après changement de statut admin
