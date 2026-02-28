# Bayt Tanjia - Plan d'architecture

## Plan (avant développement)
1. **Backend Node + Prisma + MySQL** : modèles, seed, auth OTP mock, endpoints REST, abstraction Payzone.
2. **Push FCM** : register device token, service Firebase Admin, push auto sur changement statut + push manuel admin.
3. **Admin Elweb** : login session httpOnly, dashboard commandes, changement statut, centre notifications, logs.
4. **Mobile Flutter** : Riverpod + go_router, parcours complet (splash à historique), design noir/or/ivoire avec Tajawal.
5. **Qualité** : validations zod, erreurs centralisées, tests basiques, documentation setup.

## Stratégie notifications
- L'app mobile récupère le token FCM, puis appelle `POST /devices/register`.
- Le backend stocke plusieurs devices par user.
- Lors d'un changement de statut (`PATCH /admin/orders/:id/status`), le backend envoie une notif FCM et loggue le résultat.
- Depuis Elweb, l'admin peut déclencher `POST /admin/notifications/send` (userId ou orderId).
- Les tokens invalides sont supprimés automatiquement côté backend.
