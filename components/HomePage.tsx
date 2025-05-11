import Link from "next/link";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-sky-50 to-pink-100 text-gray-800">
      {/* Navbar */}
      <nav className="backdrop-blur-sm bg-white/60 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-2xl font-bold text-purple-600">NexChat</div>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-purple-600 transition">
              Home
            </Link>
            <Link href="/signup" className="hover:text-purple-600 transition">
              Sign Up / Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Section */}
      <main className="flex flex-col items-center justify-center text-center mt-20 px-4">
        <h1 className="text-5xl font-extrabold text-purple-700 mb-6">
          Welcome to NexChat
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mb-8">
          NexChat is a simple, fast, and secure way to stay connected with your
          friends, family, and colleagues. Our platform offers a smooth and
          seamless chat experience, making it easy to communicate, share ideas,
          and collaborate in real time.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex gap-6 mb-16">
          <Link
            href="/signup"
            className="bg-purple-600 text-white px-8 py-3 rounded-full hover:bg-purple-700 transition"
          >
            Get Started
          </Link>
        </div>

        {/* Why Choose NexChat Section */}
        <section className="w-full bg-white py-16 px-4 text-center">
          <h2 className="text-3xl font-semibold text-purple-700 mb-6">
            Why Choose NexChat?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">
                Instant Communication
              </h3>
              <p className="text-lg text-gray-700">
                Chat instantly with no delays, making conversations smoother
                than ever.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">
                Secure Conversations
              </h3>
              <p className="text-lg text-gray-700">
                Your messages are private, encrypted, and fully protected.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2">Custom Rooms</h3>
              <p className="text-lg text-gray-700">
                Create and join rooms to match your specific needs, whether for
                work or leisure.
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16 px-4 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 text-center">
          <h2 className="text-3xl font-semibold text-purple-700 mb-8">
            Amazing Features of NexChat
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto text-lg text-gray-700">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">📂</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">File Sharing</h3>
                <p>
                  Easily share documents, images, and videos with your contacts,
                  making collaboration and communication more effective.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-4xl">🌍</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Global Connectivity
                </h3>
                <p>
                  Connect with friends or colleagues from around the world, no
                  matter where you are.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-4xl">💬</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Voice & Video Calls
                </h3>
                <p>
                  Take your conversations to the next level with built-in voice
                  and video call support.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-4xl">📱</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Mobile Friendly</h3>
                <p>
                  Stay connected on the go with NexChat's responsive design,
                  perfect for mobile devices.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-16 px-4 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 text-center">
          <h2 className="text-3xl font-semibold text-purple-700 mb-8">
            How NexChat Works
          </h2>
          <div className="max-w-4xl mx-auto text-lg text-gray-600 space-y-6">
            <p>
              1. <strong>Sign Up:</strong> Create your account in minutes and
              join NexChat.
            </p>
            <p>
              2. <strong>Create or Join Rooms:</strong> Whether for personal or
              professional use, choose rooms that suit you.
            </p>
            <p>
              3. <strong>Start Chatting:</strong> Engage in conversations, share
              media, and more.
            </p>
            <p>
              4. <strong>Stay Connected:</strong> Keep conversations going
              effortlessly from any device.
            </p>
          </div>
        </section>

        {/* Get in Touch Section */}
        <section className="w-full py-16 px-4 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
          <h2 className="text-3xl font-semibold text-purple-700 mb-6 text-center">
            Need Help?
          </h2>
          <div className="max-w-3xl mx-auto text-center text-lg text-gray-600 mb-8">
            <p>
              If you have any questions or need support, we’re here to help!
              Reach out to our support team, and we’ll get back to you as soon
              as possible.
            </p>
          </div>
          <Link
            href="mailto:support@nexchat.com"
            className="bg-purple-600 text-white py-3 px-8 rounded-full hover:bg-purple-700 transition"
          >
            Contact Support
          </Link>
        </section>

        {/* Footer Section */}
        <footer className="w-full text-center py-6 text-sm bg-purple-600 text-white">
          <p>© 2025 NexChat. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
};

export default HomePage;
