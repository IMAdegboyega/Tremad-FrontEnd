import Image from 'next/image'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-green-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Image src="/icon/logo.svg" alt="Tremad Schools" width={50} height={50} />
            </div>
            <ul className="hidden md:flex space-x-8 text-white">
              <li><a href="#home" className="hover:text-green-200 transition">Home</a></li>
              <li><a href="#about" className="hover:text-green-200 transition">About us</a></li>
              <li><a href="#facilities" className="hover:text-green-200 transition">Our facilities</a></li>
              <li><a href="#contact" className="hover:text-green-200 transition">Contact us</a></li>
            </ul>
            <button className="text-white px-6 py-2 rounded hover:bg-white/10 transition">
              Button
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-green-800 text-white pt-16 pb-32 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <Image
            src="/icon/spiralarrow.svg"
            alt="spiral arrow"
            width={100}
            height={100}
            className="absolute top-15 left-30 opacity-80"
          />
          <Image
            src="/icon/spiralarrow.svg"
            alt="spiral arrow"
            width={100}
            height={100}
            className="absolute top-60 right-120 opacity-80 scale-y-[-1] scale-x-[-1]"
          />
          <Image
            src="/icon/rocket.svg"
            alt="rocket"
            width={150}
            height={150}
            className="absolute top-90 right-60 opacity-80"
          />
        </div>
        
        {/* Wave pattern at bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto">
            <path 
              fill="#f9fafb" 
              d="M0,40 C480,120 960,120 1440,40 L1440,120 L0,120 Z"
            />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Hero content */}
          <div className="text-center mb-12">
            <div className='w-full flex justify-center'>
                <div className="flex items-center space-x-3 bg-white/10 px-4 py-2 rounded-full text-sm mb-4">
                    <Image src="/icon/nigerianflag.svg" alt='Nigerian Flag' height={10} width={10}/> <span>Nurturing Excellence Since 2006</span>
                </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight">
              Building Future Leaders Through<br />
              Quality Education
            </h1>
            <button className="bg-white text-green-800 px-8 py-4 rounded-lg font-medium hover:-translate-y-1 hover:shadow-lg transition transform">
              Apply for admission →
            </button>
          </div>

          {/* Three circular images */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-18 mb-16">

            {/* Image 1 */}
            <div className="relative w-64 h-120">

                {/* Circle Image */}
                <div className="w-full h-full rounded-[150px] overflow-hidden relative z-10">
                  <Image 
                    src="/img/student1.png"
                    alt="Student"
                    width={200}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Arch (Now ABOVE and NOT clipped) */}
                <Image 
                  src="/icon/arch.svg"
                  alt="arch"
                  width={800}
                  height={800}
                  className="absolute -top-5 -left-5 z-20"
                />
            </div>
            {/* Image 2 */}
            <div className="relative w-64 h-120">

                {/* Circle Image */}
                <div className="w-full h-full rounded-[150px] overflow-hidden relative z-10">
                  <Image 
                    src="/img/student2.png"
                    alt="Student"
                    width={200}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Arch (Now ABOVE and NOT clipped) */}
                <Image 
                  src="/icon/arch.svg"
                  alt="arch"
                  width={800}
                  height={800}
                  className="absolute -top-2 -left-1 z-20"
                />
            </div>
            {/* Image 3 */}
            <div className="relative w-64 h-120">

                {/* Circle Image */}
                <div className="w-full h-full rounded-[150px] overflow-hidden relative z-10">
                  <Image 
                    src="/img/student3.png"
                    alt="Student"
                    width={200}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Arch (Now ABOVE and NOT clipped) */}
                <Image 
                  src="/icon/arch.svg"
                  alt="arch"
                  width={800}
                  height={800}
                  className="absolute -top-5 -right-3 z-20"
                />
            </div>
          </div>


          {/* Stats Section */}
          <div className="grid md:grid-cols-3 gap-8 bg-gray-50 rounded-2xl p-8 relative z-20 shadow-xl">
            <div className="text-center text-gray-800">
              <div className="text-4xl mb-2 flex items-center justify-center">
                <Image src="/icon/studentcountlp.svg" alt='studentcount' width={50} height={50}/>
              </div>
              <h3 className="text-3xl font-bold">500+</h3>
              <p className="font-medium text-lg">Students</p>
              <small className="text-gray-600 text-sm">
                Nurturing minds, shaping futures, a vibrant community of learners dedicated to growth and success
              </small>
            </div>
            <div className="text-center text-gray-800">
              <div className="text-4xl mb-2 flex items-center justify-center">
                <Image src="/icon/teachercountlp.svg" alt='teachercount' width={50} height={50}/>
              </div>
              <h3 className="text-3xl font-bold">100+</h3>
              <p className="font-medium text-lg">Qualified Teachers</p>
              <small className="text-gray-600 text-sm">
                Harvested from organic farms, ensuring the highest quality of natural sweetness without
              </small>
            </div>
            <div className="text-center text-gray-800">
              <div className="text-4xl mb-2 flex items-center justify-center">
                <Image src="/icon/successcountlp.svg" alt='successcount' width={50} height={50}/>
              </div>
              <h3 className="text-3xl font-bold">98%</h3>
              <p className="font-medium text-lg">Success Rate</p>
              <small className="text-gray-600 text-sm">
                A delightful mix of nations from wallflowers, offering a unique flavor profile and a life is
              </small>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-20 bg-gray-50 -mt-20 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="rounded-[200px_200px_0_200px] overflow-hidden">
                <Image 
                  src="/img/welcometoschool.png" 
                  alt="Students" 
                  width={500} 
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-green-800 mb-6 leading-tight">
                Welcome to<br />
                Tremad Schools
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Tredema schools is a learner based environment powered by modern technology. 
                Without mincing words, the graduating set of 2023 will definitely fit in 
                perfectly well into the digital system populated they have been groomed and 
                I am so confident that they will show forth the light. Many thanks to our 
                committed and seasoned management team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-green-800 text-sm mb-2">About Rising</p>
          <h2 className="text-4xl font-bold text-gray-800 mb-12">Our facilities</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="relative bg-gray-50 rounded-2xl overflow-hidden group">
              <Image 
                src="/classroom.jpg" 
                alt="Modern classrooms" 
                width={400} 
                height={300}
                className="w-full h-48 object-cover"
              />
              <h3 className="p-6 font-medium text-gray-800 min-h-[100px] flex items-center">
                Modern classrooms
              </h3>
              <button className="absolute bottom-4 right-4 w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center text-xl hover:bg-green-800 hover:text-white hover:border-green-800 transition">
                +
              </button>
            </div>
            <div className="relative bg-gray-50 rounded-2xl overflow-hidden group">
              <Image 
                src="/lab.jpg" 
                alt="Science Lab" 
                width={400} 
                height={300}
                className="w-full h-48 object-cover"
              />
              <h3 className="p-6 font-medium text-gray-800 min-h-[100px] flex items-center">
                State-of-the-Art Science Laboratories
              </h3>
              <button className="absolute bottom-4 right-4 w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center text-xl hover:bg-green-800 hover:text-white hover:border-green-800 transition">
                +
              </button>
            </div>
            <div className="relative bg-gray-50 rounded-2xl overflow-hidden group">
              <Image 
                src="/computer-lab.jpg" 
                alt="Computer Lab" 
                width={400} 
                height={300}
                className="w-full h-48 object-cover"
              />
              <h3 className="p-6 font-medium text-gray-800 min-h-[100px] flex items-center">
                Computer and ICT Labs
              </h3>
              <button className="absolute bottom-4 right-4 w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center text-xl hover:bg-green-800 hover:text-white hover:border-green-800 transition">
                +
              </button>
            </div>
            <div className="relative bg-gray-50 rounded-2xl overflow-hidden group">
              <Image 
                src="/library.jpg" 
                alt="Library" 
                width={400} 
                height={300}
                className="w-full h-48 object-cover"
              />
              <h3 className="p-6 font-medium text-gray-800 min-h-[100px] flex items-center">
                Library and Resource Room
              </h3>
              <button className="absolute bottom-4 right-4 w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center text-xl hover:bg-green-800 hover:text-white hover:border-green-800 transition">
                +
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 bg-green-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-white/80 text-sm mb-2 text-center">About Rising</p>
          <h2 className="text-4xl font-bold text-white mb-12 text-center">Our Programs</h2>
          
          <div className="space-y-12">
            {/* Primary School */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="relative rounded-2xl overflow-hidden border-8 border-yellow-400">
                <Image 
                  src="/primary.jpg" 
                  alt="Primary School" 
                  width={600} 
                  height={400}
                  className="w-full h-96 object-cover"
                />
              </div>
              <div className="text-white">
                <p className="inline-block bg-white/10 px-4 py-2 rounded-full text-sm mb-4">
                  Ages 5-10
                </p>
                <h3 className="text-3xl font-bold mb-6">Primary School</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="mr-3">✓</span>
                    <span>Basic 1-6 Nigerian Curriculum</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">✓</span>
                    <span>Strong foundation in English, Mathematics & Sciences</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">✓</span>
                    <span>Introduction to Computer Studies</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">✓</span>
                    <span>Creative Arts and Physical Education</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">✓</span>
                    <span>Character and Moral Development</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">✓</span>
                    <span>Regular assessments and progress reports</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Secondary School */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-white order-2 md:order-1">
                <p className="inline-block bg-white/10 px-4 py-2 rounded-full text-sm mb-4">
                  Ages 11+
                </p>
                <h3 className="text-3xl font-bold mb-6">Secondary School</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="mr-3">✓</span>
                    <span>Junior & Senior Secondary (JSS 1 - SS 3)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">✓</span>
                    <span>Science, Commercial & Arts Departments</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">✓</span>
                    <span>WAEC & NECO Examination Preparation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">✓</span>
                    <span>Advanced Computer & ICT Training</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">✓</span>
                    <span>Career Counseling and University Guidance</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">✓</span>
                    <span>Leadership and Entrepreneurship Programs</span>
                  </li>
                </ul>
              </div>
              <div className="relative rounded-2xl overflow-hidden border-8 border-yellow-400 order-1 md:order-2">
                <Image 
                  src="/secondary.jpg" 
                  alt="Secondary School" 
                  width={600} 
                  height={400}
                  className="w-full h-96 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-16 text-center">
            <h2 className="text-3xl font-bold text-green-800 mb-8">
              LET&apos;S SHAPE THE FUTURE OF<br />
              EDUCATION TOGETHER
            </h2>
            <button className="bg-green-800 text-white px-8 py-4 rounded-full font-medium hover:-translate-y-1 hover:shadow-lg transition transform">
              Apply for admission →
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="text-green-800 text-sm mb-2">Contact us</p>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Get in touch with us</h2>
              <p className="text-gray-600 mb-8">
                Ready to learn more about Tremad Schools, our programs, or how to apply? 
                Fill out this form, and our admissions team will be in touch!
              </p>
              <div className="flex gap-4">
                <Image 
                  src="/contact1.jpg" 
                  alt="School" 
                  width={200} 
                  height={200}
                  className="rounded-lg"
                />
                <Image 
                  src="/contact2.jpg" 
                  alt="School" 
                  width={200} 
                  height={200}
                  className="rounded-lg"
                />
              </div>
            </div>
            
            <form className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="First name" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-800"
                />
                <input 
                  type="text" 
                  placeholder="Last Name" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-800"
                />
              </div>
              <input 
                type="email" 
                placeholder="Email" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-800"
              />
              <textarea 
                placeholder="How can we help you?" 
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-800"
              ></textarea>
              <button 
                type="submit" 
                className="bg-green-800 text-white px-8 py-3 rounded-full font-medium hover:-translate-y-1 hover:shadow-lg transition transform"
              >
                Send message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <Image src="/logo.png" alt="Tremad Schools" width={50} height={50} />
              <p className="mt-4 text-white/80">
                Loresepum lorem lorem lorem lorem ipsperi lorem ipsum ipsum
              </p>
              <p className="mt-4 text-white/60 text-sm">
                © 2023 All Rights Reserved
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact us</h4>
              <p className="text-white/80">info@tremadschools.com</p>
              <p className="mt-2 text-white/80">Follow us</p>
              <div className="flex gap-3 mt-2">
                {/* Social icons */}
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#about" className="text-white/80 hover:text-white">About us</a></li>
                <li><a href="#blog" className="text-white/80 hover:text-white">Blog</a></li>
                <li><a href="#careers" className="text-white/80 hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#privacy" className="text-white/80 hover:text-white">Privacy Policy</a></li>
                <li><a href="#terms" className="text-white/80 hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}