export function Newsletter() {
  return (
    <section className="py-16 bg-[#e9b824]">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl text-[#1a5d1a] mb-4">Join Our Tribe</h2>
          <p className="text-xl text-[#85603f] mb-8">
            Subscribe to our newsletter for exclusive deals, travel tips, and the latest on our tours.
          </p>

          <form className="flex flex-col md:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow py-3 px-4 rounded-md border-2 border-[#85603f] focus:outline-none focus:border-[#d83f31]"
              required
            />
            <button
              type="submit"
              className="bg-[#1a5d1a] hover:bg-[#d83f31] text-[#f8ede3] font-bold py-3 px-6 rounded-md shadow-md transition-all duration-300 border-2 border-[#85603f] uppercase tracking-wider"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
