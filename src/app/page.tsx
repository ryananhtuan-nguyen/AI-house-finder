import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-6xl mx-auto flex flex-col gap-12">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center py-16 gap-6">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">
            Finding Your Perfect NZ Home Just Got Smarter
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl">
            The AI-powered rental finder that understands what you really want
            in a home
          </p>
          <div className="flex gap-4 mt-4 flex-col sm:flex-row">
            <a
              href="#get-started"
              className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 text-lg transition-all"
            >
              Find My Home
            </a>
            <a
              href="#how-it-works"
              className="rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium py-3 px-8 text-lg transition-all"
            >
              How It Works
            </a>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex flex-col items-center text-center gap-4">
            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full">
              <svg
                className="w-8 h-8 text-blue-600 dark:text-blue-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold">AI-Powered Search</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Our AI understands your preferences in natural language. Tell us
              what you love (or hate) and we'll find the perfect match.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex flex-col items-center text-center gap-4">
            <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold">Save Time</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Stop scrolling through endless listings. Our AI filters out
              mismatches so you only see properties worth your time.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex flex-col items-center text-center gap-4">
            <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-full">
              <svg
                className="w-8 h-8 text-purple-600 dark:text-purple-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold">NZ-Focused</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Specifically designed for New Zealand's unique rental market, with
              data from all major NZ listing sites.
            </p>
          </div>
        </section>

        {/* Why Use Our Tool Section */}
        <section className="py-12">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why House Finder AI?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex flex-col gap-6">
              <div className="flex gap-4 items-start">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mt-1">
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    Understand What Really Matters
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Tell us what's important in your own words. "Close to
                    schools", "quiet neighborhood", "natural light" — our AI
                    understands it all.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mt-1">
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    Filter Out Deal-Breakers
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Specify what you don't want and never waste time on
                    unsuitable properties again. Our AI reads between the lines
                    of listings.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex gap-4 items-start">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mt-1">
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Real-Time Updates</h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Get notified the moment a property matching your criteria
                    hits the market, giving you the edge in NZ's competitive
                    rental scene.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mt-1">
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    Smart Recommendations
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    The more you use our tool, the better it gets at
                    understanding your preferences and recommending perfect
                    matches.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="bg-blue-50 dark:bg-blue-900/30 rounded-2xl p-8 md:p-12 my-8">
          <h2 className="text-3xl font-bold text-center mb-8">
            What Our Users Say
          </h2>
          <blockquote className="text-center max-w-3xl mx-auto">
            <p className="text-xl italic text-gray-600 dark:text-gray-300">
              "After weeks of frustration searching for a rental in Wellington,
              House Finder found me the perfect place in just 2 days. The AI
              actually understood that when I said 'sunny' I meant it!"
            </p>
            <footer className="mt-4">
              <cite className="font-semibold">— Sarah from Wellington</cite>
            </footer>
          </blockquote>
        </section>

        {/* CTA Section */}
        <section className="text-center py-16" id="get-started">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Find Your Perfect NZ Home?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Stop wasting time on listings that don't match your needs. Let our
            AI do the hard work so you can focus on what matters.
          </p>
          <a
            href="/search"
            className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-10 text-lg transition-all inline-block"
          >
            Start Searching Now
          </a>
        </section>
      </main>

      <footer className="mt-20 py-8 border-t border-gray-200 dark:border-gray-800 text-center text-gray-500 dark:text-gray-400">
        <p>
          © {new Date().getFullYear()} House Finder AI - Finding your perfect NZ
          home
        </p>
      </footer>
    </div>
  )
}
