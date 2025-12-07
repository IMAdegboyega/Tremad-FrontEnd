import Image from 'next/image'
import Link from 'next/link'

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
              <li><Link href="/sign-in" className="hover:text-green-200 transition">Home</Link></li>
              <li><Link href="#about" className="hover:text-green-200 transition">About us</Link></li>
              <li><Link href="#facilities" className="hover:text-green-200 transition">Our facilities</Link></li>
              <li><Link href="#contact" className="hover:text-green-200 transition">Contact us</Link></li>
            </ul>
            <button className="text-white px-6 py-2 rounded hover:bg-white/10 transition">
              Button
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-green-800 text-white pt-16 pb-0 relative overflow-visible min-h-[800px]">
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
            width={200}
            height={200}
            className="absolute top-90 right-35 opacity-80"
          />
        </div>
        
        {/* Wave pattern - positioned to split through the middle */}
        <div className="absolute bottom-0 left-0 right-0 h-[400px] pointer-events-none">
          <svg 
            viewBox="0 0 1440 400" 
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <path 
              fill="#FBFCE9" 
              d="M0,150 
                 C200,50 400,250 720,200 
                 S1200,100 1440,180 
                 L1440,400 
                 L0,800 
                 Z"
            />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Hero content */}
          <div className="text-center mb-12">
            <div className='w-full flex justify-center'>
              <div className="flex items-center space-x-3 bg-white/10 px-4 py-2 rounded-full text-sm mb-4">
                <Image src="/icon/nigerianflag.svg" alt='Nigerian Flag' height={10} width={10}/> 
                <span>Nurturing Excellence Since 2006</span>
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

          {/* Three circular images - these sit ABOVE the wave */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-18 relative z-20">
            {/* Image 1 */}
            <div className="relative w-64 h-120">
              <div className="w-full h-full rounded-[150px] overflow-hidden relative z-10">
                <Image 
                  src="/img/student1.png"
                  alt="Student"
                  width={200}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
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
              <div className="w-full h-full rounded-[150px] overflow-hidden relative z-10">
                <Image 
                  src="/img/student2.png"
                  alt="Student"
                  width={200}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
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
              <div className="w-full h-full rounded-[150px] overflow-hidden relative z-10">
                <Image 
                  src="/img/student3.png"
                  alt="Student"
                  width={200}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
              <Image 
                src="/icon/arch.svg"
                alt="arch"
                width={800}
                height={800}
                className="absolute -top-5 -right-3 z-20"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className='bg-[#FBFCE9] px-20 py-32 z-0'>
        <div className="flex flex-row items-center justify-center gap-8 rounded-2xl p-8 relative">
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
      </section>

      {/* Welcome Section */}
      <section className="py-20 bg-white">
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
                Tremad schools is a learner based environment powered by modern technology. 
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
            {/* Modern Classrooms Card */}
            <div className="relative rounded-3xl overflow-hidden h-[500px]">
              <Image 
                src="/img/modern-classroom.webp" 
                alt="Modern Classrooms" 
                width={400}
                height={500}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-6 left-6">
                <h3 className="text-white font-semibold text-2xl">
                  Modern<br />classrooms
                </h3>
              </div>
              <button className="absolute bottom-6 right-6 w-12 h-12 bg-black/80 rounded-full flex items-center justify-center text-white text-xl hover:bg-black transition">
                +
              </button>
            </div>

            {/* Science Lab Card */}
            <div className="relative rounded-3xl overflow-hidden h-[500px]">
              <Image 
                src="/img/science-lab.jpg" 
                alt="Science Labs" 
                width={400}
                height={500}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-6 left-6">
                <h3 className="text-white font-semibold text-2xl">
                  State-Of-The-Art<br />Science <br/> Laboratories
                </h3>
              </div>
              <button className="absolute bottom-6 right-6 w-12 h-12 bg-black/80 rounded-full flex items-center justify-center text-white text-xl hover:bg-black transition">
                +
              </button>
            </div>
            

            {/* Computer Lab Card */}
            <div className="relative rounded-3xl overflow-hidden h-[500px]">
              <Image 
                src="/img/comp-lab.jpg" 
                alt="computer and ICT Labs" 
                width={400}
                height={500}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-6 left-6">
                <h3 className="text-white font-semibold text-2xl">
                  Computer and ICT<br />Labs
                </h3>
              </div>
              <button className="absolute bottom-6 right-6 w-12 h-12 bg-black/80 rounded-full flex items-center justify-center text-white text-xl hover:bg-black transition">
                +
              </button>
            </div>
            

            {/* Library Card */}
            <div className="relative rounded-3xl overflow-hidden h-[500px]">
              <Image 
                src="/img/lib-room.jpg" 
                alt="Library Rooms" 
                width={400}
                height={500}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-6 left-6">
                <h3 className="text-white font-semibold text-2xl">
                  Library<br />Rooms
                </h3>
              </div>
              <button className="absolute bottom-6 right-6 w-12 h-12 bg-black/80 rounded-full flex items-center justify-center text-white text-xl hover:bg-black transition">
                +
              </button>
            </div>
            
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-40 pb-50 px-10 bg-[#006437] relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src="/icon/spiralarrow.svg"
            alt="spiral arrow"
            width={120}
            height={120}
            className="absolute top-30 right-80 opacity-90 -rotate-x-180 -rotate-y-180 -rotate-[60deg]"
          />
          <Image
            src="/icon/spiralarrow.svg"
            alt="spiral arrow"
            width={100}
            height={100}
            className="absolute top-20 left-20 opacity-90"
          />
          <Image
            src="/icon/spiralarrow.svg"
            alt="spiral arrow"
            width={100}
            height={100}
            className="absolute bottom-20 right-110 opacity-90 -rotate-y-180 -rotate-x-180"
          />
          <Image
            src="/icon/rocket.svg"
            alt="rocket"
            width={200}
            height={200}
            className="absolute top-130 left-50 opacity-90 -rotate-y-180 -rotate-[20deg]"
          />
          <Image
            src="/icon/rocket.svg"
            alt="rocket"
            width={200}
            height={200}
            className="absolute bottom-75 right-54 opacity-90 -rotate-y-180 -rotate-[20deg]"
          />
        </div>

        <div className="max-w-7xl mx-auto sm:px-8 lg:px-0 relative z-10">
          <p className="text-white/60 text-lg mb-2 text-center">Africa Rising</p>
          <h2 className="text-5xl font-bold text-white mb-20 text-center">Our Programs</h2>
          
          <div className="space-y-60">
            {/* Primary School */}
            <div className="grid mx-auto md:grid-cols-2 sm:gap-20 gap-60 space-x-20 items-center">
              {/* Tilted Image */}
              <div className="relative flex justify-center">
                <div className="relative hover:rotate-[3deg] transition-transform duration-300">
                  <Image
                    src="/img/PrimarySchool.png"
                    alt='Primary School'
                    width={400}
                    height={400}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="text-white">
                <p className="text-white/60 text-base mb-1">About us</p>
                <h3 className="text-5xl font-semibold mb-6">Primary School</h3>
                <ul className="space-y-6">
                <li className="flex items-start text-lg">
                    <svg className="w-4 h-4 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Basic 1-6 Nigerian Curriculum</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Strong foundation in English, Mathematics & Sciences</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Introduction to Computer Studies</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Creative Arts and Physical Education</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Character and Moral Development</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Regular assessments and progress reports</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Secondary School */}
            <div className="grid md:grid-cols-2 sm:gap-20 gap-60 items-center">
              {/* Content */}
              <div className="text-white order-2 md:order-1">
                <p className="text-white/60 text-base mb-1">About us</p>
                <h3 className="text-5xl font-bold mb-6">Secondary School</h3>
                <ul className="space-y-6">
                <li className="flex items-start text-lg">
                    <svg className="w-4 h-4 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Junior & Senior Secondary (JSS 1 - SS 3)</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Science, Commercial & Arts Departments</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>WAEC & NECO Examination Preparation</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Advanced Computer & ICT Training</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Career Counseling and University Guidance</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Leadership and Entrepreneurship Programs</span>
                  </li>
                </ul>
              </div>

              {/* Tilted Image with torn paper effect */}
              <div className="relative flex justify-center order-1 md:order-2">
                <div className="relative hover:rotate-[3deg] transition-transform duration-300">
                  <Image
                    src="/img/SecondarySchool.png"
                    alt='Secondary School'
                    width={409}
                    height={400}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden text-center rounded-3xl p-16 py-20 bg-gradient-to-b from-white via-[#F7FEE7]/70 to-[#89c082]">
            {/* Soft vertical bars */}
            <div className="absolute inset-0 flex justify-between opacity-40 pointer-events-none">
              <div className="w-1 bg-gradient-to-b from-transparent via-green-100 to-transparent"></div>
              <div className="w-1 bg-gradient-to-b from-transparent via-green-100/80 to-transparent"></div>
              <div className="w-1 bg-gradient-to-b from-transparent via-green-100 to-transparent"></div>
              <div className="w-1 bg-gradient-to-b from-transparent via-green-100/80 to-transparent"></div>
              <div className="w-1 bg-gradient-to-b from-transparent via-green-100 to-transparent"></div>
              <div className="w-1 bg-gradient-to-b from-transparent via-green-100/80 to-transparent"></div>
              <div className="w-1 bg-gradient-to-b from-transparent via-green-100 to-transparent"></div>
              <div className="w-1 bg-gradient-to-b from-transparent via-green-100/80 to-transparent"></div>
              <div className="w-1 bg-gradient-to-b from-transparent via-green-100 to-transparent"></div>
              <div className="w-1 bg-gradient-to-b from-transparent via-green-100/80 to-transparent"></div>
              <div className="w-1 bg-gradient-to-b from-transparent via-green-100 to-transparent"></div>
              <div className="w-1 bg-gradient-to-b from-transparent via-green-100/80 to-transparent"></div>
              <div className="w-1 bg-gradient-to-b from-transparent via-green-100 to-transparent"></div>
              <div className="w-1 bg-gradient-to-b from-transparent via-green-100/80 to-transparent"></div>
              <div className="w-1 bg-gradient-to-b from-transparent via-green-100 to-transparent"></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-4xl font-semibold text-black mb-8">
                LET&apos;S SHAPE THE FUTURE OF<br />
                EDUCATION TOGETHER
              </h2>
              <button className="bg-green-800 text-white px-8 py-4 rounded-lg font-medium hover:-translate-y-1 hover:shadow-lg transition transform">
                Apply for admission →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-40 bg-[#FBFCE9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="text-[#45BF5B] text-sm mb-2">Contact us</p>
              <h2 className="text-5xl font-semibold text-[#10534A] mb-6">Get in touch with us</h2>
              <p className="text-gray-600 mb-8">
                Ready to learn more about Tremad Schools, our programs, or how to apply? 
                Fill out this form, and our admissions team will be in touch!
              </p>
              <div className="relative flex gap-4">
                <Image 
                  src="/img/Contact1.png" 
                  alt="School" 
                  width={200} 
                  height={200}
                  className="absolute top-15 z-20"
                />
                <Image 
                  src="/img/Contact2.png" 
                  alt="School" 
                  width={200} 
                  height={200}
                  className="absolute left-25 z-0"
                />
              </div>
            </div>
            
            <form className="space-y-4 max-w-xl max-h-xl p-8 bg-white rounded-xl">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">First name</label>
                  <input 
                    type="text" 
                    placeholder='Enter Your First Name'
                    className="w-full px-4 py-2 bg-gray-100 border-0 rounded focus:outline-none focus:ring-2 focus:ring-green-700"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Last Name</label>
                  <input 
                    type="text" 
                    placeholder='Enter Your Last Name'
                    className="w-full px-4 py-2 bg-gray-100 border-0 rounded focus:outline-none focus:ring-2 focus:ring-green-700"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="w-full px-4 py-2 bg-gray-100 border-0 rounded focus:outline-none focus:ring-2 focus:ring-green-700"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">How can we help you?</label>
                <textarea 
                  placeholder="Enter your message" 
                  rows={5}
                  className="w-full px-4 py-2 bg-gray-100 border-0 rounded resize-none focus:outline-none focus:ring-2 focus:ring-green-700"
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <button 
                  type="submit" 
                  className="bg-green-700 text-white px-6 py-2 rounded text-sm font-medium"
                >
                  Send message
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative overflow-hidden bg-[#001E11] text-white py-20">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <Image src="/icon/logo.svg" alt="Tremad Schools" width={50} height={50} />
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
                <Link 
                  href="/"
                >
                  <Image
                    src="/icon/linkedin.svg"
                    alt='LinkedIn'
                    width={15}
                    height={15}
                  />
                </Link>
                <Link 
                  href="/"
                >
                  <Image
                    src="/icon/insta.svg"
                    alt='Instagram'
                    width={15}
                    height={15}
                  />
                </Link>
                <Link 
                  href="/"
                >
                  <Image
                    src="/icon/X.svg"
                    alt='X'
                    width={15}
                    height={15}
                  />
                </Link>
                <Link 
                  href="/"
                >
                  <Image
                    src="/icon/tiktok.svg"
                    alt='TikTok'
                    width={15}
                    height={15}
                  />
                </Link>
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
        <Image
          src="/icon/TremadSchools.svg"
          alt='Tremad Schools'
          width={1800}
          height={400}
          className='absolute bottom-0 left-0 w-full pointer-events-none z-0'
        />
      </footer>
    </div>
  )
}
