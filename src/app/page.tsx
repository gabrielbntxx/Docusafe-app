import Link from "next/link";
import { Shield, FolderOpen, Bell, ChevronRight, Upload } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-violet-500/15 to-blue-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-gradient-to-br from-blue-500/10 to-violet-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/70 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-2xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">DocuSafe</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
              Fonctionnalités
            </a>
            <a href="#security" className="text-gray-600 hover:text-gray-900 transition-colors">
              Sécurité
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2.5 text-gray-700 font-medium hover:text-blue-600 transition-colors border border-gray-300 rounded-full hover:border-blue-500 bg-white"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-full transition-all duration-300 hover:-translate-y-0.5 shadow-md hover:shadow-lg"
            >
              Commencer
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full border border-gray-200 mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-600">100% sécurisé et chiffré</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
            Vos documents.
            <br />
            <span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
              En sécurité.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed">
            Centralisez, organisez et protégez tous vos documents administratifs
            en un seul endroit sécurisé.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            <Link
              href="/register"
              className="group px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex items-center gap-2"
            >
              Commencer gratuitement
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-full border-2 border-gray-300 hover:border-blue-500 transition-all duration-300 shadow-sm"
            >
              J&apos;ai déjà un compte
            </Link>
          </div>

          {/* App Preview */}
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none" />
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl border border-gray-200 shadow-xl p-8 md:p-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Factures', 'Contrats', 'Identité', 'Banque'].map((folder, i) => (
                  <div
                    key={folder}
                    className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  >
                    <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${
                      i === 0 ? 'bg-blue-100' :
                      i === 1 ? 'bg-purple-100' :
                      i === 2 ? 'bg-green-100' : 'bg-orange-100'
                    }`}>
                      <FolderOpen className={`w-6 h-6 ${
                        i === 0 ? 'text-blue-600' :
                        i === 1 ? 'text-purple-600' :
                        i === 2 ? 'text-green-600' : 'text-orange-600'
                      }`} />
                    </div>
                    <p className="font-semibold text-gray-900">{folder}</p>
                    <p className="text-sm text-gray-500 mt-1">{Math.floor(Math.random() * 10) + 2} fichiers</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Une solution complète pour gérer vos documents en toute simplicité
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Upload className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Upload rapide</h3>
              <p className="text-gray-500 leading-relaxed">
                Glissez-déposez vos fichiers ou prenez une photo. Tout est automatiquement organisé.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <FolderOpen className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Organisation intelligente</h3>
              <p className="text-gray-500 leading-relaxed">
                Créez des dossiers personnalisés et retrouvez vos documents en quelques secondes.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <Bell className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Notifications</h3>
              <p className="text-gray-500 leading-relaxed">
                Recevez des alertes pour ne jamais oublier un document important ou une échéance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/30 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/20">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Sécurité maximale
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
                Vos documents sont chiffrés de bout en bout et stockés sur des serveurs sécurisés.
                Personne d&apos;autre que vous n&apos;y a accès.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-full border border-white/20">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white font-medium">Chiffrement AES-256</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-full border border-white/20">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white font-medium">RGPD compliant</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-full border border-white/20">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white font-medium">Hébergé en Europe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Prêt à sécuriser vos documents ?
          </h2>
          <p className="text-xl text-gray-500 mb-10">
            Rejoignez des milliers d&apos;utilisateurs qui font confiance à DocuSafe.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-10 py-5 bg-blue-500 hover:bg-blue-600 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            Créer mon compte gratuit
            <ChevronRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">DocuSafe</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2024 DocuSafe. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
              Confidentialité
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
              Conditions
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
