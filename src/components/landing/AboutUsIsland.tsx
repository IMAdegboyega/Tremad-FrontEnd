'use client';

/**
 * AboutUsIsland — the pinned "scrollytelling" section on the landing page.
 *
 * Layout technique:
 *   - The <section> is deliberately taller than the viewport (its exact
 *     height is computed once we know how tall the content is — see the
 *     first useEffect). While the user scrolls THROUGH that height, the
 *     inner div is `position: sticky; top: 0` so it stays glued to the
 *     viewport ("pinned").
 *   - As the user keeps scrolling, we translate the actual content upward
 *     inside the sticky viewport, in lockstep with page scroll. So the
 *     reader is effectively scrolling the About Us content while the rest
 *     of the page appears frozen behind it.
 *   - When the page-scroll passes the section's total height, the sticky
 *     pin releases naturally and the next section (Apply CTA) slides up.
 *
 * The Skip button is anchored to the sticky viewport, semi-transparent, and
 * always visible while inside the island. It calls scrollIntoView on #apply
 * so the user jumps past the entire wrapper and lands cleanly at the CTA.
 *
 * The section height is dynamic on purpose: we want scroll pace to feel
 * roughly 1:1 no matter how much prose the school updates the copy with
 * later. (Sizing = viewportHeight + contentHeight.)
 */

import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';

export default function AboutUsIsland() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [translateY, setTranslateY] = useState(0);
  // Sensible default so the initial render doesn't leave a dead zone
  // before the useEffect measures the real content height.
  const [sectionHeight, setSectionHeight] = useState<string>('400vh');

  // Measure the real content height and size the wrapper to it. That way
  // the scroll pace is always 1:1 whatever the reader's viewport size and
  // however much prose lives inside.
  useEffect(() => {
    const measure = () => {
      const content = contentRef.current;
      if (!content) return;
      const contentH = content.scrollHeight;
      const viewportH = window.innerHeight;
      // sectionHeight = one viewport (for the pinned frame) + content height
      // (the amount the content actually needs to travel).
      setSectionHeight(`${viewportH + contentH}px`);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Wire scroll → translate mapping. Throttled via requestAnimationFrame so
  // we're never doing math more than once per frame.
  useEffect(() => {
    let rafId = 0;
    let scheduled = false;

    const compute = () => {
      scheduled = false;
      const section = sectionRef.current;
      const content = contentRef.current;
      if (!section || !content) return;

      const rect = section.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const contentH = content.scrollHeight;
      const sectionH = section.offsetHeight;

      // How far the top of the section sits above the viewport top.
      // Negative = section hasn't started yet; positive = we're inside.
      const scrolled = Math.max(0, -rect.top);
      const maxScroll = Math.max(1, sectionH - viewportH);
      const progress = Math.min(1, scrolled / maxScroll);

      const maxTranslate = Math.max(0, contentH - viewportH);
      setTranslateY(-maxTranslate * progress);
    };

    const onScroll = () => {
      if (scheduled) return;
      scheduled = true;
      rafId = requestAnimationFrame(compute);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    compute();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const skipToApply = () => {
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative bg-[#001E11] text-white scroll-mt-20 md:scroll-mt-24"
      style={{ height: sectionHeight }}
      aria-label="About Tremad Schools"
    >
      {/* Pinned viewport during the section's scroll range. */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Subtle brand accents — matches the dark green + gold vocabulary. */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#006437]/30 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] rounded-full bg-[#F4C95D]/10 blur-3xl" />
        </div>

        {/* The actual content — translates upward as user scrolls. */}
        <div
          ref={contentRef}
          className="relative z-10 w-full will-change-transform"
          style={{ transform: `translate3d(0, ${translateY}px, 0)` }}
        >
          <div className="max-w-4xl mx-auto px-6 md:px-10 py-20 md:py-28">
            {/* ================== HERO ================== */}
            <div className="mb-24 md:mb-32">
              <p className="text-[#F4C95D] text-xs md:text-sm uppercase tracking-[0.35em] mb-4">
                Welcome to our school
              </p>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
                About<br />
                <span className="text-[#F4C95D]">Tremad Schools</span>
              </h2>
              <p className="text-white/80 text-base md:text-lg lg:text-xl mt-8 max-w-2xl leading-relaxed">
                We are a government-approved School / College committed to
                giving every child a strong academic, moral, and social
                foundation. Our school provides quality education for pupils
                and students from the early years through senior secondary
                school.
              </p>
              <p className="text-white/80 text-base md:text-lg lg:text-xl mt-4 max-w-2xl leading-relaxed">
                We offer Nursery, Kindergarten, Basic School, Junior Secondary
                School, and Senior Secondary School education in a safe,
                disciplined, and supportive learning environment.
              </p>
            </div>

            {/* ================== OUR SCHOOL ================== */}
            <SectionBlock title="Our School">
              <p>
                Our school was established to help children grow into
                knowledgeable, responsible, confident, and well-behaved
                members of society. We understand that every stage of a
                child&apos;s education matters, from their first classroom
                experience to their preparation for higher education and
                future careers.
              </p>
              <p>
                Our teachers use clear and practical teaching methods that
                help learners understand their subjects, ask questions, solve
                problems, and take part in classroom activities.
              </p>
            </SectionBlock>

            {/* ================== ACADEMIC SECTIONS ================== */}
            <SectionBlock title="Our Academic Sections">
              <div className="grid gap-5 md:gap-6 md:grid-cols-2 mt-8">
                <AcademicCard
                  name="Nursery and Kindergarten"
                  body="Young children are introduced to learning through play, stories, songs, numbers, reading activities, creative work, and social interaction. The environment is designed to develop communication skills, confidence, good behaviour, coordination, and an interest in learning."
                />
                <AcademicCard
                  name="Basic School"
                  body="Pupils build a strong foundation in English, Mathematics, Basic Science, Social Studies, Civic Education, Computer Studies, and other approved subjects. Focus areas include reading, writing, calculation, communication, creativity, and character development. Also prepared for Common Entrance."
                />
                <AcademicCard
                  name="Junior Secondary School"
                  body="Students are prepared for more advanced academic work with guided development of knowledge, study habits, talents, and personal interests. Teaching follows the approved Nigerian curriculum and prepares them for BECE."
                />
                <AcademicCard
                  name="Senior Secondary School"
                  body="Students are prepared for higher education, professional training, employment, and responsible adulthood. Instruction covers approved subjects based on chosen study areas, with preparation for WAEC, NECO, and other approved assessments."
                />
              </div>
            </SectionBlock>

            {/* ================== GOVERNMENT APPROVED ================== */}
            <SectionBlock title="Government Approved">
              <p>
                Our school is approved by the relevant government education
                authorities. We follow the approved Nigerian curriculum and
                maintain the academic, administrative, safety, and teaching
                standards required for recognised schools.
              </p>
              <p>
                Parents can be confident that their children are receiving
                education from a properly recognised school.
              </p>
            </SectionBlock>

            {/* ================== MISSION + VISION ================== */}
            <div className="grid gap-10 md:gap-14 md:grid-cols-2 mt-20 md:mt-24">
              <div>
                <h3 className="text-3xl md:text-4xl font-semibold mb-5">
                  <span className="text-[#F4C95D]">Our</span> Mission
                </h3>
                <p className="text-white/80 text-base md:text-lg leading-relaxed">
                  To provide quality and affordable education that develops
                  every learner academically, morally, socially, and
                  physically. We aim to build a strong foundation that helps
                  each child become disciplined, independent, respectful, and
                  prepared for the future.
                </p>
              </div>
              <div>
                <h3 className="text-3xl md:text-4xl font-semibold mb-5">
                  <span className="text-[#F4C95D]">Our</span> Vision
                </h3>
                <p className="text-white/80 text-base md:text-lg leading-relaxed">
                  To raise well-educated and responsible young people who can
                  succeed in school, serve their communities, and make
                  positive contributions to Nigeria and the world.
                </p>
              </div>
            </div>

            {/* ================== LEARNING ENVIRONMENT ================== */}
            <SectionBlock title="Our Learning Environment">
              <p>
                We provide a calm, secure, and child-friendly environment
                where learners are treated with care and respect. Our
                classrooms support active learning, teamwork, creativity, and
                proper communication between teachers and students.
              </p>
              <p>
                We also encourage good hygiene, punctuality, discipline,
                honesty, respect, and responsibility.
              </p>
            </SectionBlock>

            {/* ================== TEACHERS ================== */}
            <SectionBlock title="Our Teachers">
              <p>
                Our teachers are trained, experienced, patient, and committed
                to the progress of every learner. They work closely with
                parents and school leaders to monitor academic performance,
                behaviour, attendance, and personal development.
              </p>
              <p>
                Extra support is provided where needed to help learners
                improve and build confidence.
              </p>
            </SectionBlock>

            {/* ================== BEYOND THE CLASSROOM ================== */}
            <SectionBlock title="Beyond the Classroom">
              <p>
                Education goes beyond textbooks and examinations. Our
                students also take part in sports, cultural activities,
                debates, quizzes, clubs, creative arts, leadership
                activities, and other programmes that support their talents
                and personal development.
              </p>
            </SectionBlock>

            {/* ================== COMMITMENT TO PARENTS ================== */}
            <SectionBlock title="Our Commitment to Parents">
              <p>
                We maintain open communication with parents and guardians.
                Regular reports, meetings, assessments, and school updates
                help families understand their child&apos;s progress.
              </p>
              <p>
                We believe that children perform better when the school and
                parents work together.
              </p>
            </SectionBlock>

            {/* ================== WHY CHOOSE US — CLOSER ================== */}
            <div className="mt-24 md:mt-32 mb-16">
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
                Why choose<br />
                <span className="text-[#F4C95D]">our school?</span>
              </h3>
              <p className="text-white/80 text-base md:text-lg lg:text-xl mt-8 max-w-2xl leading-relaxed">
                Parents choose our school because we provide
                government-approved education, qualified teachers, a
                structured curriculum, proper discipline, a safe environment,
                and individual attention for learners.
              </p>
              <p className="text-white/80 text-base md:text-lg lg:text-xl mt-6 max-w-2xl leading-relaxed">
                From Nursery and Kindergarten to Basic, Junior Secondary, and
                Senior Secondary School, we are committed to helping every
                child learn, grow, and prepare for a successful future.
              </p>
            </div>
          </div>
        </div>

        {/* Skip button — semi-transparent, always in the corner while pinned. */}
        <button
          onClick={skipToApply}
          type="button"
          aria-label="Skip About Us section"
          className="absolute bottom-6 right-6 md:bottom-8 md:right-8 z-30
                     flex items-center gap-1.5
                     px-4 py-2 rounded-full
                     text-sm font-medium text-white/70 hover:text-white
                     bg-white/10 hover:bg-white/25
                     backdrop-blur-md
                     border border-white/20 hover:border-white/40
                     transition-all cursor-pointer"
        >
          Skip
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}

/** Section block: gold bullet, header, prose stack. Consistent rhythm between sections. */
function SectionBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-20 md:mt-24">
      <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-5 md:mb-6 flex items-baseline gap-3">
        <span className="text-[#F4C95D] text-lg md:text-xl">◆</span>
        {title}
      </h3>
      <div className="space-y-4 text-white/80 leading-relaxed text-base md:text-lg max-w-3xl">
        {children}
      </div>
    </div>
  );
}

/** Card used for the four Academic Sections. */
function AcademicCard({ name, body }: { name: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] transition-colors p-5 md:p-6">
      <h4 className="text-lg md:text-xl font-semibold text-[#F4C95D] mb-3">
        {name}
      </h4>
      <p className="text-white/75 text-sm md:text-[0.95rem] leading-relaxed">
        {body}
      </p>
    </div>
  );
}
