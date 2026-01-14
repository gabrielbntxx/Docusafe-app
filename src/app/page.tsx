import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
            Justif&apos;
          </h1>
        </div>

        {/* Hero Text */}
        <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
          Tous vos justificatifs au bon endroit,{" "}
          <span className="text-primary-600">au bon moment</span>
        </h2>

        <p className="text-xl text-neutral-600 mb-12 max-w-2xl mx-auto">
          Centralisez, organisez et digitalisez tous vos documents administratifs
          avec l&apos;intelligence artificielle pour tout catégoriser automatiquement.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link
            href="/register"
            className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-2xl shadow-soft-lg hover:shadow-soft-xl transition-all duration-200 transform hover:scale-105"
          >
            Commencer gratuitement
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-white hover:bg-neutral-50 text-neutral-900 font-semibold rounded-2xl shadow-soft border border-neutral-200 transition-all duration-200"
          >
            Se connecter
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="p-6 bg-white rounded-2xl shadow-soft-md border border-neutral-100">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Upload intelligent</h3>
            <p className="text-neutral-600">
              Uploadez vos documents, notre IA les analyse et les classe automatiquement
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl shadow-soft-md border border-neutral-100">
            <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Dossiers pré-configurés</h3>
            <p className="text-neutral-600">
              Dossiers location, crédit, CAF... tout est prêt pour vos démarches
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl shadow-soft-md border border-neutral-100">
            <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Alertes intelligentes</h3>
            <p className="text-neutral-600">
              Ne manquez plus jamais une date d&apos;expiration ou un document manquant
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
