import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

void main() {
  runApp(const ProviderScope(child: BaytTanjiaApp()));
}

final routerProvider = Provider((ref) => GoRouter(routes: [
      GoRoute(path: '/', builder: (_, __) => const SplashScreen()),
      GoRoute(path: '/home', builder: (_, __) => const HomeScreen()),
      GoRoute(path: '/order', builder: (_, __) => const OrderScreen()),
      GoRoute(path: '/delivery', builder: (_, __) => const DeliveryScreen()),
      GoRoute(path: '/summary', builder: (_, __) => const SummaryScreen()),
      GoRoute(path: '/history', builder: (_, __) => const HistoryScreen()),
    ]));

class BaytTanjiaApp extends ConsumerWidget {
  const BaytTanjiaApp({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      title: 'Bayt Tanjia',
      routerConfig: ref.watch(routerProvider),
      theme: ThemeData(
        scaffoldBackgroundColor: const Color(0xFF0B0B0B),
        textTheme: GoogleFonts.tajawalTextTheme().apply(bodyColor: const Color(0xFFF5F1E8)),
        colorScheme: const ColorScheme.dark(primary: Color(0xFFB08D3B), secondary: Color(0xFFF5F1E8)),
        cardTheme: const CardTheme(color: Color(0xFF121212), shape: RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(14)))),
      ),
    );
  }
}

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(body: Center(child: ElevatedButton(onPressed: ()=> context.go('/home'), child: const Text('Bayt Tanjia'))));
}
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('Accueil')), body: Center(child: ElevatedButton(onPressed: ()=> context.go('/order'), child: const Text('Commander'))));
}
class OrderScreen extends StatelessWidget {
  const OrderScreen({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('Commander Tangia')), body: const Center(child: Text('Quantité min 1kg, prix 200 DH/kg + 15 DH livraison')));
}
class DeliveryScreen extends StatelessWidget {
  const DeliveryScreen({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('Livraison')), body: const Center(child: Text('Nom, téléphone, adresse, ville + GPS')));
}
class SummaryScreen extends StatelessWidget {
  const SummaryScreen({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('Récapitulatif')), body: const Center(child: Text('Paiement: Payzone ou COD')));
}
class HistoryScreen extends StatelessWidget {
  const HistoryScreen({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('Historique')), body: const Center(child: Text('Commandes passées')));
}
