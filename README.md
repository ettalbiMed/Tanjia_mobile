# Bayt Tanjia Monorepo

Structure:
- `mobile_flutter` : app Flutter Android/iOS (Riverpod + go_router + thème premium noir/or)
- `backend_node` : API Express TypeScript + Prisma MySQL + Payzone abstraction + FCM
- `admin_elweb` : panneau admin web Express + EJS
- `docs` : documentation architecture

## 1) Backend
```bash
cd backend_node
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

### Variables env backend (exemple)
```env
DATABASE_URL=mysql://root:root@localhost:3306/bayt_tanjia
JWT_SECRET=change_me
ADMIN_SESSION_SECRET=change_me
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<bcrypt hash>
PAYZONE_MODE=mock
PAYZONE_PUBLIC_BASE_URL=https://sandbox.payzone.ma
FIREBASE_SERVICE_ACCOUNT_JSON={...}
```

## 2) Elweb Admin
```bash
cd admin_elweb
npm install
API_BASE_URL=http://localhost:4000 npm run dev
```

## 3) Mobile Flutter
```bash
cd mobile_flutter
flutter pub get
flutter run
```

### Firebase mobile config
- Android: placer `google-services.json` dans `mobile_flutter/android/app/`
- iOS: placer `GoogleService-Info.plist` dans `mobile_flutter/ios/Runner/`

## 4) Test push notifications
1. Lancer backend + app mobile et authentifier utilisateur.
2. Enregistrer token FCM via `POST /devices/register`.
3. Dans Elweb, changer le statut d'une commande ou envoyer une notification manuelle.
4. Vérifier réception foreground/background + logs `GET /admin/notifications/logs`.

## 5) Tester commande COD & Payzone mock
- COD: `POST /orders` avec `paymentMethod=COD` (paymentStatus=UNPAID)
- Payzone: `POST /payments/payzone/init`, ouvrir `paymentUrl`, callback mock `POST /payments/payzone/callback`
