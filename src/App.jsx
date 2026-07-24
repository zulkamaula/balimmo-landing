import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import InvestRegions from './components/InvestRegions.jsx'
import WhyChoose from './components/WhyChoose.jsx'
import FeaturedListings from './components/FeaturedListings.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import GroupServices from './components/GroupServices.jsx'
import ContactSection from './components/ContactSection.jsx'
import Footer from './components/Footer.jsx'
import FilterSheet from './components/FilterSheet.jsx'
import { SearchProvider } from './context/SearchContext.jsx'

export default function App() {
  return (
    <SearchProvider>
      <div className="min-h-screen bg-white">
        <header className="sticky top-0 z-50 bg-white/95 shadow-sm backdrop-blur">
        <Navbar />
        </header>
        <main>
          <Hero />
          <InvestRegions />
          <WhyChoose />
          <FeaturedListings />
          <HowItWorks />
          <GroupServices />
          <ContactSection />
          <FilterSheet />
        </main>
        <Footer />
      </div>
    </SearchProvider>
  )
}
