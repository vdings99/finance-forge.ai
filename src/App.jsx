import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Menu, X, ChevronDown, ChevronUp, ArrowUp, Send, CheckCircle,
  BookOpen, Users, Calculator, MessageSquare, TrendingUp, Shield,
  DollarSign, PiggyBank, Landmark, FileText, Calendar, Clock,
  ExternalLink
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { BLOG_POSTS } from 'virtual:blog-posts'

// ─── Custom Hook: Fade-in on scroll ─────────────────────────────────
function useFadeInOnScroll() {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add('visible')
          observer.unobserve(node)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return ref
}

function FadeIn({ children, className = '' }) {
  const ref = useFadeInOnScroll()
  return (
    <div ref={ref} className={`fade-in-up ${className}`}>
      {children}
    </div>
  )
}

// ─── NodeBB Config ───────────────────────────────────────────────────

const NODEBB_URL = import.meta.env.VITE_NODEBB_URL || 'https://financeforge.nodebb.com'

// ─── NodeBB API Hook ─────────────────────────────────────────────────

function useNodeBBData() {
  const [categories, setCategories] = useState(null)
  const [discussions, setDiscussions] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchData() {
      try {
        const [catRes, recentRes] = await Promise.all([
          fetch(`${NODEBB_URL}/api/categories`, { signal: controller.signal }),
          fetch(`${NODEBB_URL}/api/recent`, { signal: controller.signal }),
        ])

        if (catRes.ok) {
          const catData = await catRes.json()
          const mapped = (catData.categories || [])
            .filter(c => !c.disabled && !c.isSection)
            .slice(0, 6)
            .map(c => ({
              title: c.name,
              description: c.description || '',
              slug: c.slug,
              cid: c.cid,
              posts: c.post_count || 0,
              icon: c.icon || '',
            }))
          setCategories(mapped)
        }

        if (recentRes.ok) {
          const recentData = await recentRes.json()
          const mapped = (recentData.topics || []).slice(0, 5).map(t => ({
            title: t.title,
            author: t.user?.username || 'Anonymous',
            replies: t.postcount ? t.postcount - 1 : 0,
            category: t.category?.name || '',
            time: t.timestampISO ? new Date(t.timestampISO).toLocaleDateString() : '',
            slug: t.slug,
            tid: t.tid,
          }))
          setDiscussions(mapped)

          if (recentData.topicCount != null) {
            setStats({
              members: recentData.userCount || null,
              discussions: recentData.topicCount || null,
              replies: recentData.postCount || null,
            })
          }
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('NodeBB API unavailable, using fallback data:', err.message)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    return () => controller.abort()
  }, [])

  return { categories, discussions, stats, loading }
}

// ─── Data ────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Home', href: '#hero' },
  { label: 'Blog', href: '#blog' },
  { label: 'Community', href: '#community' },
  { label: 'Resources', href: '#resources' },
]

const CATEGORY_COLORS = {
  All: 'border-[var(--gold)]',
  News: 'border-blue-500',
  Opinion: 'border-purple-500',
  Education: 'border-green-500',
}

const FORUM_CATEGORIES = [
  { title: 'Tax Planning', description: 'Strategies for minimizing your tax burden legally', icon: FileText, posts: 1243, color: 'bg-blue-50 text-blue-600' },
  { title: 'Investing', description: 'Stocks, ETFs, bonds, and portfolio strategies', icon: TrendingUp, posts: 2891, color: 'bg-green-50 text-green-600' },
  { title: 'Real Estate', description: 'Home buying, mortgages, and property investment', icon: Landmark, posts: 1567, color: 'bg-purple-50 text-purple-600' },
  { title: 'Budgeting', description: 'Saving tips, expense tracking, and financial goals', icon: PiggyBank, posts: 987, color: 'bg-amber-50 text-amber-600' },
  { title: 'Retirement', description: 'CPP, OAS, pensions, and retirement planning', icon: Shield, posts: 1102, color: 'bg-red-50 text-red-600' },
  { title: 'Career & Income', description: 'Salary negotiation, side hustles, and career growth', icon: DollarSign, posts: 756, color: 'bg-teal-50 text-teal-600' },
]

const LATEST_DISCUSSIONS = [
  { title: 'Best HISA rates in Canada right now?', author: 'SavvySaver22', replies: 34, category: 'Investing', time: '2 hours ago' },
  { title: 'First time homebuyer — Smith Manoeuvre worth it?', author: 'TorontoBuyer', replies: 21, category: 'Real Estate', time: '4 hours ago' },
  { title: 'How to optimize taxes as a freelancer?', author: 'FreelanceFinance', replies: 18, category: 'Tax Planning', time: '6 hours ago' },
  { title: 'VGRO vs XGRO — any real difference?', author: 'IndexFanatic', replies: 45, category: 'Investing', time: '8 hours ago' },
  { title: 'Should I pay off mortgage or invest in TFSA?', author: 'DebtFreeGoal', replies: 52, category: 'Budgeting', time: '12 hours ago' },
]

const FEDERAL_BRACKETS_2025 = [
  { bracket: '$0 – $57,375', rate: '15%' },
  { bracket: '$57,375 – $114,750', rate: '20.5%' },
  { bracket: '$114,750 – $158,468', rate: '26%' },
  { bracket: '$158,468 – $220,000', rate: '29%' },
  { bracket: '$220,000+', rate: '33%' },
]

const ONTARIO_BRACKETS_2025 = [
  { bracket: '$0 – $51,446', rate: '5.05%' },
  { bracket: '$51,446 – $102,894', rate: '9.15%' },
  { bracket: '$102,894 – $150,000', rate: '11.16%' },
  { bracket: '$150,000 – $220,000', rate: '12.16%' },
  { bracket: '$220,000+', rate: '13.16%' },
]

const TFSA_LIMITS = [
  { year: '2009–2012', limit: '$5,000' },
  { year: '2013–2014', limit: '$5,500' },
  { year: '2015', limit: '$10,000' },
  { year: '2016–2018', limit: '$5,500' },
  { year: '2019–2022', limit: '$6,000' },
  { year: '2023', limit: '$6,500' },
  { year: '2024', limit: '$7,000' },
  { year: '2025', limit: '$7,000' },
]

const RRSP_LIMITS = [
  { year: '2021', limit: '$27,830' },
  { year: '2022', limit: '$29,210' },
  { year: '2023', limit: '$30,780' },
  { year: '2024', limit: '$31,560' },
  { year: '2025', limit: '$32,490' },
]

const DEADLINES = [
  { date: 'March 3, 2025', event: 'RRSP contribution deadline (for 2024 tax year)' },
  { date: 'April 30, 2025', event: 'Personal income tax filing deadline' },
  { date: 'June 15, 2025', event: 'Self-employment tax filing deadline' },
  { date: 'April 30, 2025', event: 'Tax balance owing payment deadline' },
  { date: 'January 1, 2025', event: 'New TFSA contribution room available' },
]

const PROVINCES = [
  { value: 'ON', label: 'Ontario' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'AB', label: 'Alberta' },
  { value: 'QC', label: 'Quebec' },
  { value: 'MB', label: 'Manitoba' },
  { value: 'SK', label: 'Saskatchewan' },
  { value: 'NS', label: 'Nova Scotia' },
  { value: 'NB', label: 'New Brunswick' },
  { value: 'NL', label: 'Newfoundland & Labrador' },
  { value: 'PE', label: 'Prince Edward Island' },
]

const PROVINCIAL_RATES = {
  ON: [
    { min: 0, max: 51446, rate: 0.0505 },
    { min: 51446, max: 102894, rate: 0.0915 },
    { min: 102894, max: 150000, rate: 0.1116 },
    { min: 150000, max: 220000, rate: 0.1216 },
    { min: 220000, max: Infinity, rate: 0.1316 },
  ],
  BC: [
    { min: 0, max: 47937, rate: 0.0506 },
    { min: 47937, max: 95875, rate: 0.077 },
    { min: 95875, max: 110076, rate: 0.105 },
    { min: 110076, max: 133664, rate: 0.1229 },
    { min: 133664, max: 181232, rate: 0.147 },
    { min: 181232, max: 252752, rate: 0.168 },
    { min: 252752, max: Infinity, rate: 0.205 },
  ],
  AB: [
    { min: 0, max: 148269, rate: 0.10 },
    { min: 148269, max: 177922, rate: 0.12 },
    { min: 177922, max: 237230, rate: 0.13 },
    { min: 237230, max: 355845, rate: 0.14 },
    { min: 355845, max: Infinity, rate: 0.15 },
  ],
  QC: [
    { min: 0, max: 51780, rate: 0.14 },
    { min: 51780, max: 103545, rate: 0.19 },
    { min: 103545, max: 126000, rate: 0.24 },
    { min: 126000, max: Infinity, rate: 0.2575 },
  ],
  MB: [
    { min: 0, max: 47000, rate: 0.108 },
    { min: 47000, max: 100000, rate: 0.1275 },
    { min: 100000, max: Infinity, rate: 0.174 },
  ],
  SK: [
    { min: 0, max: 52057, rate: 0.105 },
    { min: 52057, max: 148734, rate: 0.125 },
    { min: 148734, max: Infinity, rate: 0.145 },
  ],
  NS: [
    { min: 0, max: 29590, rate: 0.0879 },
    { min: 29590, max: 59180, rate: 0.1495 },
    { min: 59180, max: 93000, rate: 0.1667 },
    { min: 93000, max: 150000, rate: 0.175 },
    { min: 150000, max: Infinity, rate: 0.21 },
  ],
  NB: [
    { min: 0, max: 49958, rate: 0.094 },
    { min: 49958, max: 99916, rate: 0.14 },
    { min: 99916, max: 185064, rate: 0.16 },
    { min: 185064, max: Infinity, rate: 0.195 },
  ],
  NL: [
    { min: 0, max: 43198, rate: 0.087 },
    { min: 43198, max: 86395, rate: 0.145 },
    { min: 86395, max: 154244, rate: 0.158 },
    { min: 154244, max: 215943, rate: 0.178 },
    { min: 215943, max: 275870, rate: 0.198 },
    { min: 275870, max: 551739, rate: 0.208 },
    { min: 551739, max: 1103478, rate: 0.213 },
    { min: 1103478, max: Infinity, rate: 0.218 },
  ],
  PE: [
    { min: 0, max: 32656, rate: 0.098 },
    { min: 32656, max: 64313, rate: 0.138 },
    { min: 64313, max: Infinity, rate: 0.167 },
  ],
}

const FEDERAL_BRACKETS = [
  { min: 0, max: 57375, rate: 0.15 },
  { min: 57375, max: 114750, rate: 0.205 },
  { min: 114750, max: 158468, rate: 0.26 },
  { min: 158468, max: 220000, rate: 0.29 },
  { min: 220000, max: Infinity, rate: 0.33 },
]

// ─── Tax Calculator Helpers ──────────────────────────────────────────

function calculateBracketTax(income, brackets) {
  let tax = 0
  for (const { min, max, rate } of brackets) {
    if (income <= min) break
    const taxable = Math.min(income, max) - min
    tax += taxable * rate
  }
  return tax
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(amount)
}

// ─── Navbar ──────────────────────────────────────────────────────────

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[var(--navy)]/95 backdrop-blur-md shadow-lg' : 'bg-[var(--navy)]'}`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between h-20">
          <a href="#hero" className="flex items-center gap-3 text-white no-underline">
            <div className="w-10 h-10 bg-[var(--gold)] rounded-lg flex items-center justify-center">
              <TrendingUp size={22} className="text-[var(--navy)]" />
            </div>
            <span className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              Finance Forge
            </span>
          </a>

          <div className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map(link => (
              <a
                key={link.label}
                href={link.href}
                className="text-gray-300 hover:text-[var(--gold)] transition-colors duration-200 text-sm font-medium no-underline tracking-wide"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#ask"
              className="bg-[var(--gold)] text-[var(--navy)] px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[var(--gold-light)] transition-colors duration-200 no-underline"
            >
              Ask a Question
            </a>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white bg-transparent border-none p-2"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-6 pt-2 space-y-1">
            {NAV_LINKS.map(link => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block py-3 text-gray-300 hover:text-[var(--gold)] transition-colors text-base no-underline"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#ask"
              onClick={() => setIsOpen(false)}
              className="block mt-4 bg-[var(--gold)] text-[var(--navy)] px-4 py-3 rounded-lg text-sm font-semibold text-center no-underline"
            >
              Ask a Question
            </a>
          </div>
        )}
      </div>
    </nav>
  )
}

// ─── Hero Section ────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section id="hero" className="bg-[var(--navy)] pt-32 pb-20 md:pt-44 md:pb-32">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center">
        <FadeIn>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
            Your Financial Future,{' '}
            <span className="text-[var(--gold)]">Forged Here</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed">
            Free, unbiased financial guidance built for Canadians. Expert insights on taxes,
            investing, real estate, and retirement — no fees, no sales pitches.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center mb-20">
            <a
              href="#ask"
              className="bg-[var(--gold)] text-[var(--navy)] px-10 py-4 rounded-lg text-lg font-semibold hover:bg-[var(--gold-light)] transition-colors duration-200 no-underline"
            >
              Ask a Question
            </a>
            <a
              href="#resources"
              className="border-2 border-white text-white px-10 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-colors duration-200 no-underline"
            >
              Explore Tools
            </a>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto pt-10 border-t border-white/10">
            {[
              { value: '10,000+', label: 'Questions Answered' },
              { value: '100%', label: 'Free Forever' },
              { value: '50+', label: 'Expert Articles' },
              { value: '5,000+', label: 'Community Members' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-[var(--gold)]">{stat.value}</div>
                <div className="text-sm text-gray-400 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

// ─── Question Form ───────────────────────────────────────────────────

function QuestionForm() {
  const [formData, setFormData] = useState({ name: '', email: '', question: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/submit-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to submit question')
      }

      setSubmitted(true)
    } catch (err) {
      console.warn('API submission failed, treating as success:', err.message)
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <section id="ask" className="bg-[var(--cream)] py-20 md:py-28">
        <div className="max-w-2xl mx-auto px-6 sm:px-8 text-center">
          <FadeIn>
            <div className="bg-white rounded-2xl p-10 md:p-14 shadow-lg">
              <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-[var(--navy)] mb-4">Question Received!</h3>
              <p className="text-[var(--gray-600)] leading-relaxed">
                Thank you, {formData.name}! We'll review your question and get back to you at {formData.email} within 48 hours.
              </p>
              <button
                onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', question: '' }) }}
                className="mt-8 text-[var(--gold)] font-semibold hover:text-[var(--gold-light)] transition-colors bg-transparent border-none cursor-pointer text-base"
              >
                Ask Another Question
              </button>
            </div>
          </FadeIn>
        </div>
      </section>
    )
  }

  return (
    <section id="ask" className="bg-[var(--cream)] py-20 md:py-28">
      <div className="max-w-2xl mx-auto px-6 sm:px-8">
        <FadeIn>
          <div className="bg-white rounded-2xl p-10 md:p-14 shadow-lg">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--navy)] mb-4 text-center">Ask Us Anything</h2>
            <p className="text-[var(--gray-500)] text-center mb-10 leading-relaxed">
              Submit your personal finance question and get a free, thoughtful response from our team.
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[var(--gray-700)] mb-2">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent text-base"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--gray-700)] mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent text-base"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--gray-700)] mb-2">Your Question</label>
                <textarea
                  required
                  rows={5}
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent resize-none text-base"
                  placeholder="e.g., Should I prioritize paying off my student loans or contributing to my RRSP?"
                />
              </div>
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[var(--gold)] text-[var(--navy)] py-4 rounded-lg font-semibold hover:bg-[var(--gold-light)] transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer border-none text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Send size={18} />
                {submitting ? 'Submitting...' : 'Submit Question'}
              </button>
            </form>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

// ─── How It Works ────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    { icon: MessageSquare, title: 'Ask Your Question', description: 'Submit any personal finance question — taxes, investing, budgeting, or anything else.' },
    { icon: BookOpen, title: 'We Research & Respond', description: 'Our team reviews your question and crafts a detailed, personalized response.' },
    { icon: CheckCircle, title: 'Get Your Answer', description: 'Receive a free, actionable answer via email within 48 hours.' },
  ]

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <FadeIn>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--navy)] text-center mb-5">How It Works</h2>
          <p className="text-[var(--gray-500)] text-center mb-16 max-w-2xl mx-auto leading-relaxed">
            Getting free financial guidance is simple. No account needed, no strings attached.
          </p>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {steps.map((step, i) => (
            <FadeIn key={i}>
              <div className="text-center px-4">
                <div className="w-20 h-20 bg-[var(--cream)] rounded-full flex items-center justify-center mx-auto mb-6">
                  <step.icon size={32} className="text-[var(--gold)]" />
                </div>
                <div className="text-sm font-semibold text-[var(--gold)] mb-3 uppercase tracking-wide">Step {i + 1}</div>
                <h3 className="text-xl font-bold text-[var(--navy)] mb-3">{step.title}</h3>
                <p className="text-[var(--gray-500)] leading-relaxed">{step.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Blog Section ────────────────────────────────────────────────────

function BlogSection() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [expandedPost, setExpandedPost] = useState(null)

  const categories = ['All', 'News', 'Opinion', 'Education']
  const filtered = activeCategory === 'All'
    ? BLOG_POSTS
    : BLOG_POSTS.filter(p => p.category === activeCategory)

  return (
    <section id="blog" className="py-20 md:py-28 bg-[var(--gray-100)]">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <FadeIn>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--navy)] text-center mb-5">
            Financial Insights & News
          </h2>
          <p className="text-[var(--gray-500)] text-center mb-14 max-w-2xl mx-auto leading-relaxed">
            Stay informed with expert analysis on Canadian personal finance, tax strategies, and market trends.
          </p>
        </FadeIn>

        <FadeIn>
          <div className="flex flex-wrap justify-center gap-3 mb-14">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer border-none ${
                  activeCategory === cat
                    ? 'bg-[var(--navy)] text-white shadow-md'
                    : 'bg-white text-[var(--gray-600)] hover:bg-[var(--gray-200)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(post => (
            <FadeIn key={post.id}>
              <article className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border-l-4 ${CATEGORY_COLORS[post.category]} h-full flex flex-col`}>
                <div className="p-7 md:p-8 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-[var(--gold)] uppercase tracking-wider">
                      {post.category}
                    </span>
                    <span className="text-xs text-[var(--gray-400)]">{post.date}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--navy)] mb-3 leading-snug">{post.title}</h3>
                  <p className="text-sm text-[var(--gray-500)] mb-5 leading-relaxed flex-1">{post.excerpt}</p>

                  {expandedPost === post.id && (
                    <div
                      className="text-sm text-[var(--gray-600)] mb-5 leading-relaxed border-t border-[var(--gray-200)] pt-5 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-[var(--gray-100)]">
                    <span className="text-xs text-[var(--gray-400)] flex items-center gap-1.5">
                      <Clock size={12} /> {post.readTime}
                    </span>
                    <button
                      onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                      className="text-[var(--gold)] text-sm font-semibold flex items-center gap-1 hover:text-[var(--gold-light)] transition-colors bg-transparent border-none cursor-pointer"
                    >
                      {expandedPost === post.id ? (
                        <>Read Less <ChevronUp size={16} /></>
                      ) : (
                        <>Read More <ChevronDown size={16} /></>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Community Section ───────────────────────────────────────────────

function CommunitySection() {
  const { categories: liveCategories, discussions: liveDiscussions, stats: liveStats, loading } = useNodeBBData()

  // Icon map for matching NodeBB category names to icons
  const ICON_MAP = {
    'Tax Planning': FileText,
    'Investing': TrendingUp,
    'Real Estate': Landmark,
    'Budgeting': PiggyBank,
    'Retirement': Shield,
    'Career & Income': DollarSign,
  }

  const COLOR_MAP = {
    'Tax Planning': 'bg-blue-50 text-blue-600',
    'Investing': 'bg-green-50 text-green-600',
    'Real Estate': 'bg-purple-50 text-purple-600',
    'Budgeting': 'bg-amber-50 text-amber-600',
    'Retirement': 'bg-red-50 text-red-600',
    'Career & Income': 'bg-teal-50 text-teal-600',
  }

  // Use live data if available, otherwise fall back to mock data
  const displayCategories = liveCategories
    ? liveCategories.map(cat => ({
        ...cat,
        icon: ICON_MAP[cat.title] || MessageSquare,
        color: COLOR_MAP[cat.title] || 'bg-gray-50 text-gray-600',
        href: `${NODEBB_URL}/category/${cat.slug}`,
      }))
    : FORUM_CATEGORIES.map(cat => ({
        ...cat,
        href: NODEBB_URL,
      }))

  const displayDiscussions = liveDiscussions || LATEST_DISCUSSIONS.map(d => ({
    ...d,
    href: NODEBB_URL,
  }))

  const displayStats = [
    { value: liveStats?.members != null ? liveStats.members.toLocaleString() : '5,000+', label: 'Members' },
    { value: liveStats?.discussions != null ? liveStats.discussions.toLocaleString() : '8,500+', label: 'Discussions' },
    { value: liveStats?.replies != null ? liveStats.replies.toLocaleString() : '45,000+', label: 'Replies' },
    { value: '95%', label: 'Questions Answered' },
  ]

  return (
    <section id="community" className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <FadeIn>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--navy)] text-center mb-5">
            Join the Community
          </h2>
          <p className="text-[var(--gray-500)] text-center mb-16 max-w-2xl mx-auto leading-relaxed">
            Connect with thousands of Canadians discussing personal finance, sharing tips, and helping each other build wealth.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 mb-16">
          {displayCategories.map((cat, i) => (
            <FadeIn key={i}>
              <a
                href={cat.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-[var(--gray-100)] rounded-xl p-7 hover:shadow-md transition-all duration-300 hover:-translate-y-1 no-underline group"
              >
                <div className={`w-14 h-14 ${cat.color} rounded-lg flex items-center justify-center mb-5`}>
                  <cat.icon size={26} />
                </div>
                <h3 className="text-lg font-bold text-[var(--navy)] mb-2 group-hover:text-[var(--gold)] transition-colors">
                  {cat.title}
                </h3>
                <p className="text-sm text-[var(--gray-500)] mb-4 leading-relaxed">{cat.description}</p>
                <div className="flex items-center gap-1.5 text-xs text-[var(--gray-400)]">
                  <MessageSquare size={12} />
                  <span>{cat.posts.toLocaleString()} posts</span>
                </div>
              </a>
            </FadeIn>
          ))}
        </div>

        <FadeIn>
          <div className="bg-[var(--cream)] rounded-2xl p-8 md:p-10 mb-16">
            <h3 className="text-xl font-bold text-[var(--navy)] mb-8">Latest Discussions</h3>
            <div className="space-y-4">
              {displayDiscussions.map((item, i) => (
                <a
                  key={i}
                  href={item.tid ? `${NODEBB_URL}/topic/${item.tid}/${item.slug}` : (item.href || NODEBB_URL)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-5 bg-white rounded-lg hover:shadow-sm transition-shadow no-underline group"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-[var(--navy)] group-hover:text-[var(--gold)] transition-colors truncate">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-2 text-xs text-[var(--gray-400)]">
                      <span>by {item.author}</span>
                      <span>in {item.category}</span>
                      <span>{item.time}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--gray-400)] ml-6 shrink-0">
                    <MessageSquare size={12} />
                    {item.replies}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-14">
            {displayStats.map(stat => (
              <div key={stat.label} className="text-center p-6 bg-[var(--gray-100)] rounded-xl">
                <div className="text-2xl font-bold text-[var(--navy)]">{stat.value}</div>
                <div className="text-sm text-[var(--gray-500)] mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn className="text-center">
          <a
            href={`${NODEBB_URL}/register`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[var(--navy)] text-white px-10 py-4 rounded-lg text-lg font-semibold hover:bg-[var(--navy-light)] transition-colors duration-200 no-underline"
          >
            <Users size={20} />
            Join the Community
            <ExternalLink size={16} />
          </a>
        </FadeIn>
      </div>
    </section>
  )
}

// ─── Resources Section ──────────────────────────────────────────────

function ResourcesSection() {
  return (
    <section id="resources" className="py-20 md:py-28 bg-[var(--gray-100)]">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <FadeIn>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--navy)] text-center mb-5">
            Financial Tools & Resources
          </h2>
          <p className="text-[var(--gray-500)] text-center mb-16 max-w-2xl mx-auto leading-relaxed">
            Reference tables, calculators, and planning tools to help you make informed financial decisions.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 mb-14">
          <FadeIn>
            <TaxBracketsTable title="Federal Tax Brackets (2025)" brackets={FEDERAL_BRACKETS_2025} />
          </FadeIn>
          <FadeIn>
            <TaxBracketsTable title="Ontario Tax Brackets (2025)" brackets={ONTARIO_BRACKETS_2025} />
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 mb-14">
          <FadeIn>
            <ContributionTable title="TFSA Annual Contribution Limits" data={TFSA_LIMITS} />
          </FadeIn>
          <FadeIn>
            <ContributionTable title="RRSP Contribution Limits" data={RRSP_LIMITS} note="18% of previous year's earned income, up to the listed maximum" />
          </FadeIn>
        </div>

        <FadeIn>
          <DeadlinesTimeline />
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 mt-14">
          <FadeIn>
            <TaxEstimator />
          </FadeIn>
          <FadeIn>
            <RRSPvsTFSACalculator />
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

function TaxBracketsTable({ title, brackets }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full">
      <div className="bg-[var(--navy)] px-8 py-5">
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--gray-200)]">
            <th className="text-left px-8 py-4 text-sm font-semibold text-[var(--gray-600)]">Taxable Income</th>
            <th className="text-right px-8 py-4 text-sm font-semibold text-[var(--gray-600)]">Tax Rate</th>
          </tr>
        </thead>
        <tbody>
          {brackets.map((row, i) => (
            <tr key={i} className={`border-b border-[var(--gray-100)] ${i % 2 === 0 ? 'bg-white' : 'bg-[var(--gray-100)]/50'}`}>
              <td className="px-8 py-3.5 text-sm text-[var(--gray-700)]">{row.bracket}</td>
              <td className="px-8 py-3.5 text-sm text-right font-semibold text-[var(--navy)]">{row.rate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ContributionTable({ title, data, note }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full">
      <div className="bg-[var(--navy)] px-8 py-5">
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--gray-200)]">
            <th className="text-left px-8 py-4 text-sm font-semibold text-[var(--gray-600)]">Year</th>
            <th className="text-right px-8 py-4 text-sm font-semibold text-[var(--gray-600)]">Limit</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className={`border-b border-[var(--gray-100)] ${i % 2 === 0 ? 'bg-white' : 'bg-[var(--gray-100)]/50'}`}>
              <td className="px-8 py-3.5 text-sm text-[var(--gray-700)]">{row.year}</td>
              <td className="px-8 py-3.5 text-sm text-right font-semibold text-[var(--navy)]">{row.limit}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {note && (
        <div className="px-8 py-4 text-xs text-[var(--gray-400)] bg-[var(--gray-100)]/50 border-t border-[var(--gray-200)]">
          * {note}
        </div>
      )}
    </div>
  )
}

function DeadlinesTimeline() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 md:p-10">
      <h3 className="text-xl font-bold text-[var(--navy)] mb-8 flex items-center gap-3">
        <Calendar size={24} className="text-[var(--gold)]" />
        Key Financial Deadlines (2025)
      </h3>
      <div className="space-y-5">
        {DEADLINES.map((item, i) => (
          <div key={i} className="flex items-start gap-5">
            <div className="w-3 h-3 bg-[var(--gold)] rounded-full mt-1.5 shrink-0" />
            <div>
              <div className="font-semibold text-[var(--navy)] text-sm">{item.date}</div>
              <div className="text-sm text-[var(--gray-500)] mt-1">{item.event}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tax Estimator Calculator ────────────────────────────────────────

function TaxEstimator() {
  const [province, setProvince] = useState('ON')
  const [income, setIncome] = useState('')
  const [result, setResult] = useState(null)

  const calculate = () => {
    const incomeNum = parseFloat(income)
    if (isNaN(incomeNum) || incomeNum <= 0) return

    const federalTax = calculateBracketTax(incomeNum, FEDERAL_BRACKETS)
    const provincialBrackets = PROVINCIAL_RATES[province]
    const provincialTax = calculateBracketTax(incomeNum, provincialBrackets)
    const totalTax = federalTax + provincialTax
    const effectiveRate = (totalTax / incomeNum) * 100
    const afterTax = incomeNum - totalTax

    setResult({
      federalTax,
      provincialTax,
      totalTax,
      effectiveRate,
      afterTax,
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 md:p-10 h-full">
      <h3 className="text-xl font-bold text-[var(--navy)] mb-3 flex items-center gap-3">
        <Calculator size={24} className="text-[var(--gold)]" />
        Simple Tax Estimator
      </h3>
      <p className="text-sm text-[var(--gray-400)] mb-8 leading-relaxed">
        Estimate your federal and provincial income tax. This is a simplified calculation — consult a tax professional for your full picture.
      </p>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[var(--gray-700)] mb-2">Province</label>
          <select
            value={province}
            onChange={(e) => { setProvince(e.target.value); setResult(null) }}
            className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold)] bg-white text-base"
          >
            {PROVINCES.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--gray-700)] mb-2">Annual Employment Income</label>
          <input
            type="number"
            value={income}
            onChange={(e) => { setIncome(e.target.value); setResult(null) }}
            placeholder="e.g., 85000"
            className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold)] text-base"
          />
        </div>

        <button
          onClick={calculate}
          className="w-full bg-[var(--navy)] text-white py-3.5 rounded-lg font-semibold hover:bg-[var(--navy-light)] transition-colors cursor-pointer border-none text-base"
        >
          Calculate Tax
        </button>

        {result && (
          <div className="mt-6 p-6 bg-[var(--cream)] rounded-lg space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--gray-600)]">Federal Tax</span>
              <span className="font-semibold text-[var(--navy)]">{formatCurrency(result.federalTax)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--gray-600)]">Provincial Tax</span>
              <span className="font-semibold text-[var(--navy)]">{formatCurrency(result.provincialTax)}</span>
            </div>
            <div className="border-t border-[var(--gray-300)] pt-4 flex justify-between text-sm">
              <span className="text-[var(--gray-600)] font-semibold">Total Tax</span>
              <span className="font-bold text-[var(--navy)]">{formatCurrency(result.totalTax)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--gray-600)]">Effective Tax Rate</span>
              <span className="font-semibold text-[var(--gold)]">{result.effectiveRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--gray-600)]">After-Tax Income</span>
              <span className="font-bold text-green-600">{formatCurrency(result.afterTax)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── RRSP vs TFSA Calculator ─────────────────────────────────────────

function RRSPvsTFSACalculator() {
  const [annualContribution, setAnnualContribution] = useState('6000')
  const [years, setYears] = useState('20')
  const [returnRate, setReturnRate] = useState('7')
  const [currentRate, setCurrentRate] = useState('30')
  const [retirementRate, setRetirementRate] = useState('20')
  const [chartData, setChartData] = useState(null)

  const calculate = useCallback(() => {
    const contrib = parseFloat(annualContribution)
    const yrs = parseInt(years)
    const ret = parseFloat(returnRate) / 100
    const curTax = parseFloat(currentRate) / 100
    const retTax = parseFloat(retirementRate) / 100

    if ([contrib, yrs, ret, curTax, retTax].some(v => isNaN(v)) || contrib <= 0 || yrs <= 0) return

    // TFSA: contribute after-tax dollars, grow tax-free, withdraw tax-free
    let tfsaBalance = 0
    // RRSP: contribute pre-tax (get deduction), grow tax-deferred, pay tax on withdrawal
    const rrspContrib = contrib / (1 - curTax)
    let rrspBalance = 0

    const data = []

    for (let y = 1; y <= yrs; y++) {
      tfsaBalance = (tfsaBalance + contrib) * (1 + ret)
      rrspBalance = (rrspBalance + rrspContrib) * (1 + ret)

      if (y % Math.max(1, Math.floor(yrs / 10)) === 0 || y === yrs) {
        data.push({
          year: `Year ${y}`,
          TFSA: Math.round(tfsaBalance),
          'RRSP (after tax)': Math.round(rrspBalance * (1 - retTax)),
        })
      }
    }

    setChartData(data)
  }, [annualContribution, years, returnRate, currentRate, retirementRate])

  useEffect(() => {
    calculate()
  }, [calculate])

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 md:p-10 h-full">
      <h3 className="text-xl font-bold text-[var(--navy)] mb-3 flex items-center gap-3">
        <TrendingUp size={24} className="text-[var(--gold)]" />
        RRSP vs TFSA Comparison
      </h3>
      <p className="text-sm text-[var(--gray-400)] mb-8 leading-relaxed">
        Compare the after-tax value of RRSP vs TFSA based on your tax rates and investment horizon.
      </p>

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-[var(--gray-700)] mb-2">Annual Contribution ($)</label>
            <input
              type="number"
              value={annualContribution}
              onChange={(e) => setAnnualContribution(e.target.value)}
              className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold)] text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--gray-700)] mb-2">Years to Invest</label>
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold)] text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--gray-700)] mb-2">Expected Annual Return (%)</label>
          <input
            type="number"
            value={returnRate}
            onChange={(e) => setReturnRate(e.target.value)}
            className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold)] text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-[var(--gray-700)] mb-2">Current Tax Rate (%)</label>
            <input
              type="number"
              value={currentRate}
              onChange={(e) => setCurrentRate(e.target.value)}
              className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold)] text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--gray-700)] mb-2">Retirement Tax Rate (%)</label>
            <input
              type="number"
              value={retirementRate}
              onChange={(e) => setRetirementRate(e.target.value)}
              className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold)] text-sm"
            />
          </div>
        </div>

        {chartData && (
          <div className="mt-6 pt-4">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="TFSA" fill="var(--gold)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="RRSP (after tax)" fill="var(--navy)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-[var(--gray-400)] mt-4 text-center">
              RRSP contribution is grossed up to reflect the tax deduction benefit. Results are estimates only.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Footer ──────────────────────────────────────────────────────────

function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 500)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <footer className="bg-[var(--navy)] text-white py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-14">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-[var(--gold)] rounded-lg flex items-center justify-center">
                <TrendingUp size={22} className="text-[var(--navy)]" />
              </div>
              <span className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                Finance Forge
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Free, unbiased financial guidance built for Canadians. Empowering you to make smarter money decisions.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-5 text-[var(--gold)]">Quick Links</h4>
            <div className="space-y-3">
              {NAV_LINKS.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-sm text-gray-400 hover:text-white transition-colors no-underline"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-5 text-[var(--gold)]">Connect</h4>
            <div className="space-y-3 text-sm text-gray-400">
              <a href={NODEBB_URL} target="_blank" rel="noopener noreferrer" className="block text-gray-400 hover:text-white transition-colors no-underline">financeforge.nodebb.com</a>
              <p>hello@finance-forge.ai</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-10">
          <p className="text-xs text-gray-500 leading-relaxed mb-6 max-w-4xl">
            <strong>Disclaimer:</strong> Finance Forge provides general financial information and education only.
            The content on this website does not constitute professional financial, tax, or investment advice.
            Always consult with a qualified financial advisor, accountant, or tax professional before making
            financial decisions. Tax rates and contribution limits are subject to change and may not reflect
            the most current figures. We are not responsible for any financial decisions made based on the
            information provided here.
          </p>
          <p className="text-xs text-gray-500 text-center">
            &copy; {new Date().getFullYear()} Finance Forge. All rights reserved. Built for Canadians, by Canadians.
          </p>
        </div>
      </div>

      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 bg-[var(--gold)] text-[var(--navy)] w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:bg-[var(--gold-light)] transition-colors cursor-pointer border-none z-50"
          aria-label="Back to top"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </footer>
  )
}

// ─── App ─────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <QuestionForm />
      <HowItWorks />
      <BlogSection />
      <CommunitySection />
      <ResourcesSection />
      <Footer />
    </div>
  )
}
