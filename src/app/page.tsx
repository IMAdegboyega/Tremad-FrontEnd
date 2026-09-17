import Image from "next/image";
import Link from "next/link";
import AboutUsIsland from "@/components/landing/AboutUsIsland";
import LandingNav from "@/components/landing/LandingNav";
import LandingContactForm from "@/components/landing/LandingContactForm";
import ShapedImage, { BLOB_ASPECT } from "@/components/landing/ShapedImage";
import FramedPhoto from "@/components/landing/FramedPhoto";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation — extracted to LandingNav (client) so nav clicks can call
          scrollIntoView({behavior:'smooth'}) directly, sidestepping the App
          Router's hash-navigation which doesn't animate reliably. */}
      <LandingNav />

      {/* Hero Section */}
      <section className="bg-primary-green text-white pt-16 pb-0 relative overflow-visible min-h-[800px]">
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
          {/* Government-approved sticker — hero placement, sits to the right of
              the "Building Future Leaders" heading. Hidden on mobile since the
              hero content is center-aligned and there's no side room; on md+
              it floats in the top-right of the content area with a subtle
              stamp tilt. */}
          <Image
            src="/icon/govt-approved.png"
            alt="Government approved"
            width={140}
            height={140}
            className="hidden md:block absolute top-[70px] right-4 lg:top-[120px] lg:right-8 z-20 drop-shadow-2xl pointer-events-none"
          />

          {/* Hero content */}
          <div className="text-center mb-12">
            <div className="w-full flex justify-center">
              <div className="flex items-center space-x-3 bg-white/10 px-4 py-2 rounded-full text-sm mb-4">
                <Image
                  src="/icon/nigerianflag.svg"
                  alt="Nigerian Flag"
                  height={10}
                  width={10}
                />
                <span>Nurturing Excellence Since 2006</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight">
              Building Future Leaders Through
              <br />
              Quality Education
            </h1>
            <Link
              href="/apply"
              className="inline-block bg-white text-green-800 px-8 py-4 rounded-lg font-medium hover:-translate-y-1 hover:shadow-lg transition transform"
            >
              Apply for admission →
            </Link>
          </div>

          {/* Three circular images - these sit ABOVE the wave */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-18 relative z-20">
            {/* Each photo is now an ORDINARY rectangle — the pill and its
                outline are CSS. Drop any jpg/png in and it takes the shape.
                See components/landing/ShapedImage.tsx. */}
            <ShapedImage
              src="/TREMAD-new-file/9.png"
              sourceAspect={1448 / 1086}
              alt="Tremad pupils playing on the school playground"
              className="w-64 h-120"
              shape="pill"
              outline={{ color: '#D9D9D9' }}
              focus="30% 30%"
              priority
            />
            <ShapedImage
              src="/TREMAD-new-file/18.png"
              sourceAspect={1448 / 1086}
              alt="Tremad pupils on the playground roundabout"
              className="w-64 h-120"
              shape="pill"
              outline={{ color: '#D9D9D9' }}
              focus="50% 30%"
              priority
            />
            <ShapedImage
              src="/TREMAD-new-file/13.png"
              sourceAspect={1448 / 1086}
              alt="Tremad students outside a classroom block"
              className="w-64 h-120"
              shape="pill"
              outline={{ color: '#D9D9D9' }}
              focus="10% 30%"
              priority
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/*
        Three columns in a hardcoded `flex-row` with `px-20` meant each stat got
        roughly 50px on a 375px phone, so the copy broke to one or two words a
        line. Below `md` each stat is now its own full-width row — icon on the
        left, number and label on one baseline, sentence beneath — which reads
        as a deliberate list rather than a squeezed table. Every change is
        behind a breakpoint, so `md` and up renders exactly as before.
      */}
      <section className="bg-[#FBFCE9] px-6 sm:px-10 md:px-20 py-16 md:py-32 z-0">
        <div className="flex flex-col gap-8 md:flex-row md:items-center justify-center md:gap-8 rounded-2xl p-0 md:p-8 relative max-w-md mx-auto md:max-w-none">
          <div className="flex items-start gap-4 text-left md:block md:text-center text-gray-800">
            <div className="shrink-0 flex items-center justify-center md:text-4xl md:mb-2">
              <Image
                src="/icon/studentcountlp.svg"
                alt="studentcount"
                width={50}
                height={50}
                className="w-10 h-10 md:w-[50px] md:h-[50px]"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-2 md:block">
                <h3 className="text-3xl font-bold">100+</h3>
                <p className="font-medium text-lg">Students</p>
              </div>
              <small className="text-gray-600 text-sm">
                A vibrant community of learners from Nursery through Senior
                Secondary, shaping their futures together.
              </small>
            </div>
          </div>
          <div className="flex items-start gap-4 text-left md:block md:text-center text-gray-800">
            <div className="shrink-0 flex items-center justify-center md:text-4xl md:mb-2">
              <Image
                src="/icon/teachercountlp.svg"
                alt="teachercount"
                width={50}
                height={50}
                className="w-10 h-10 md:w-[50px] md:h-[50px]"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-2 md:block">
                <h3 className="text-3xl font-bold">30+</h3>
                <p className="font-medium text-lg">Qualified Teachers</p>
              </div>
              <small className="text-gray-600 text-sm">
                Trained, patient educators working closely with parents to
                nurture every child&apos;s progress.
              </small>
            </div>
          </div>
          <div className="flex items-start gap-4 text-left md:block md:text-center text-gray-800">
            <div className="shrink-0 flex items-center justify-center md:text-4xl md:mb-2">
              <Image
                src="/icon/successcountlp.svg"
                alt="successcount"
                width={50}
                height={50}
                className="w-10 h-10 md:w-[50px] md:h-[50px]"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-2 md:block">
                <h3 className="text-3xl font-bold">97%</h3>
                <p className="font-medium text-lg">Success Rate</p>
              </div>
              <small className="text-gray-600 text-sm">
                Consistent results in BECE, WAEC, and NECO — the outcome of
                steady teaching and personal attention.
              </small>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section id="welcome" className="py-20 bg-white scroll-mt-20 md:scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/*
              Was a pre-cut PNG with the blob and its green line baked into the
              alpha channel, which meant changing this photo meant re-cutting
              the shape in an image editor. The shape is now a clip-path traced
              from that PNG, so any ordinary rectangular photo drops in here.
              Swap `src` and adjust `focus` if the subject sits off-centre.
            */}
            <ShapedImage
              src="/TREMAD-new-file/1.png"
              alt="Students at Tremad"
              shape="blob"
              className="w-full aspect-[5965/5127]"
              sourceAspect={1448 / 1086}
              boxAspect={BLOB_ASPECT}
              renderWidth={584}
              focus="50% 35%"
              outline={{ color: '#006437', width: 1.5 }}
            />
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-800 mb-6 leading-tight">
                Welcome to
                <br />
                Tremad Schools
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We provide Nursery, Kindergarten, Basic School, Junior Secondary
                School, and Senior Secondary School education in a safe,
                disciplined, and supportive learning environment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section id="facilities" className="py-20 bg-white scroll-mt-20 md:scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-green-800 text-sm mb-2">About Rising</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-8 md:mb-12">
            Our facilities
          </h2>

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
                  Modern
                  <br />
                  classrooms
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
                  State-Of-The-Art
                  <br />
                  Science <br /> Laboratories
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
                  Computer and ICT
                  <br />
                  Labs
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
                  Library
                  <br />
                  Rooms
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
      <section id="program" className="py-20 pb-24 px-5 sm:py-28 sm:pb-32 sm:px-8 md:py-40 md:pb-50 md:px-10 bg-primary-green relative overflow-hidden scroll-mt-20 md:scroll-mt-24">
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
          <p className="text-white/60 text-lg mb-2 text-center">
            Africa Rising
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-12 md:mb-20 text-center">
            Our Programs
          </h2>

          {/*
            `space-y-60` put 240px between the two programs and `gap-60` put
            another 240px between each photo and its own copy — on a phone that
            is most of a screen of empty green, so the text never appears in the
            same viewport as the picture it belongs to.
          */}
          <div className="space-y-24 sm:space-y-40 md:space-y-60">
            {/* Primary School */}
            {/*
              `space-x-20` was doing real damage below md: it is a margin-left
              on every child but the first, and while the grid is still ONE
              column that lands an 80px indent on the text block alone. It only
              makes sense once there are two columns, so it is md-only now —
              which leaves the md+ spacing (gap-20 + the 80px margin) exactly as
              it was.
            */}
            <div className="grid mx-auto md:grid-cols-2 gap-10 sm:gap-20 md:space-x-20 items-center">
              {/* Tilted Image */}
              <div className="relative flex justify-center">
                <div className="relative hover:rotate-[3deg] transition-transform duration-300">
                  <Image
                    src="/img/PrimarySchool.png"
                    alt="Primary School"
                    width={400}
                    height={400}
                    // 400px intrinsic against ~335px of usable width on a 375px
                    // phone; the section's overflow-hidden was silently
                    // cropping it rather than letting it scale.
                    className="w-full h-auto max-w-[400px]"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="text-white">
                <p className="text-white/60 text-base mb-1">About us</p>
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-6">
                  Primary School
                </h3>
                <ul className="space-y-6">
                  <li className="flex items-start text-lg">
                    <svg
                      className="w-4 h-4 text-white mr-3 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Basic 1-6 Nigerian Curriculum</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-4 h-4 text-white mr-3 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>
                      Strong foundation in English, Mathematics & Sciences
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-4 h-4 text-white mr-3 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Introduction to Computer Studies</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-4 h-4 text-white mr-3 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Creative Arts and Physical Education</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-4 h-4 text-white mr-3 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Character and Moral Development</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-4 h-4 text-white mr-3 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Regular assessments and progress reports</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Secondary School */}
            <div className="grid md:grid-cols-2 gap-10 sm:gap-20 items-center">
              {/* Content */}
              <div className="text-white order-2 md:order-1">
                <p className="text-white/60 text-base mb-1">About us</p>
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                  Secondary School
                </h3>
                <ul className="space-y-6">
                  <li className="flex items-start text-lg">
                    <svg
                      className="w-4 h-4 text-white mr-3 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Junior & Senior Secondary (JSS 1 - SS 3)</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-4 h-4 text-white mr-3 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Science, Commercial & Arts Departments</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-4 h-4 text-white mr-3 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>WAEC & NECO Examination Preparation</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-4 h-4 text-white mr-3 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Advanced Computer & ICT Training</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-4 h-4 text-white mr-3 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Career Counseling and University Guidance</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-4 h-4 text-white mr-3 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
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
                    alt="Secondary School"
                    width={409}
                    height={400}
                    className="w-full h-auto max-w-[409px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us — pinned scrollytelling island (see AboutUsIsland.tsx) */}
      <AboutUsIsland />

      {/* CTA Section */}
      <section id="apply" className="py-20 bg-white scroll-mt-20 md:scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/*
            `p-16` took 128px of horizontal padding out of a 375px phone,
            leaving ~215px for a 36px headline — so "EDUCATION" nearly filled a
            line on its own and the whole block ran five lines tall. Padding and
            type size now step up with the viewport, and the forced <br /> is
            suppressed below md so the headline wraps where it fits instead of
            where the desktop layout wanted it. Everything is behind a
            breakpoint; md and up is untouched.
          */}
          <div className="relative overflow-hidden text-center rounded-3xl p-6 py-12 sm:p-10 sm:py-16 md:p-16 md:py-20 bg-gradient-to-b from-white via-[#F7FEE7]/70 to-[#89c082]">
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
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-black mb-6 md:mb-8 text-balance md:text-wrap">
                LET&apos;S SHAPE THE FUTURE OF
                <br className="hidden md:inline" />{' '}
                EDUCATION TOGETHER
              </h2>
              {/*
                `whitespace-nowrap` keeps the arrow attached to the label — it
                was orphaning onto a line of its own once the button narrowed.
                Full width below sm gives a proper thumb target; sm and up keeps
                the original shrink-to-fit button exactly.
              */}
              <Link
                href="/apply"
                className="inline-block w-full sm:w-auto text-center whitespace-nowrap bg-primary-green text-white px-8 py-4 rounded-lg font-medium hover:-translate-y-1 hover:shadow-lg transition transform"
              >
                Apply for admission →
              </Link>
              <p className="text-sm text-gray-700 mt-4 max-w-sm mx-auto text-balance">
                Book lists, scheme of work and school fees are all in there too.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 sm:py-24 md:py-40 bg-[#FBFCE9] scroll-mt-20 md:scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div>
              <p className="text-[#45BF5B] text-sm mb-2">Contact us</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[#10534A] mb-4 md:mb-6">
                Get in touch with us
              </h2>
              <p className="text-gray-600 mb-8">
                Ready to learn more about Tremad Schools, our programs, or how
                to apply? Fill out this form, and our admissions team will be in
                touch!
              </p>
              {/*
                Decorative pair. Both children are absolutely positioned, so
                this wrapper MUST carry its own height — without one it
                collapses to 0px and the images spill out over the form below,
                which is exactly what happened on narrow screens.
              */}
              <div className="relative h-[200px] sm:h-[240px] md:h-[260px] mt-2">
                <FramedPhoto
                  src="/TREMAD-new-file/4.png"
                  alt=""
                  className="absolute top-4 left-0 z-20 w-[150px] sm:w-[180px] md:w-[200px] aspect-square"
                  sourceAspect={1448 / 1086}
                  focus="50% 40%"
                />
                <FramedPhoto
                  src="/TREMAD-new-file/7.png"
                  alt=""
                  className="absolute top-12 left-24 sm:left-32 md:left-40 z-0 w-[150px] sm:w-[180px] md:w-[200px] aspect-square"
                  tilt={9.75}
                  sourceAspect={1448 / 1086}
                  focus="50% 40%"
                />
              </div>
            </div>

            <LandingContactForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative overflow-hidden bg-[#001E11] text-white py-20">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <Image
                src="/icon/logo.svg"
                alt="Tremad Schools"
                width={50}
                height={50}
              />
              <p className="mt-4 text-white/80">
                <p className="font-semibold">TREMAD SCHOOLS</p>
                <br />
                Wisdom Unto Greater Heights
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
                <Link href="/">
                  <Image
                    src="/icon/linkedin.svg"
                    alt="LinkedIn"
                    width={15}
                    height={15}
                  />
                </Link>
                <Link href="/">
                  <Image
                    src="/icon/insta.svg"
                    alt="Instagram"
                    width={15}
                    height={15}
                  />
                </Link>
                <Link href="/">
                  <Image src="/icon/X.svg" alt="X" width={15} height={15} />
                </Link>
                <Link href="/">
                  <Image
                    src="/icon/tiktok.svg"
                    alt="TikTok"
                    width={15}
                    height={15}
                  />
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#about" className="text-white/80 hover:text-white">
                    About us
                  </a>
                </li>
                <li>
                  <a href="#blog" className="text-white/80 hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#careers" className="text-white/80 hover:text-white">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#privacy" className="text-white/80 hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#terms" className="text-white/80 hover:text-white">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <Image
          src="/icon/TremadSchools.svg"
          alt="Tremad Schools"
          width={1800}
          height={400}
          className="absolute bottom-0 left-0 w-full pointer-events-none z-0"
        />
      </footer>
    </div>
  );
}
