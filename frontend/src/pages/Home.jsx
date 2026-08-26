import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './common/Navbar';
import SearchBar from './common/SearchBar';
import Slider from './common/Slider';
import VendorCard from './common/VendorCard';
import EstimateSidebar from './common/EstimateSidebar';
import Footer from './common/Footer';
import './Home.css';
import { fetchSliders, fetchDiscountedServices, fetchTrendingSearches, fetchRecommendations } from '../services/api';
import heroBanner from '../assets/images/couple-banner.png';

const categories = [
  'Recommendations', 'Discounts', 'Wedding Venues', 'Photographers', 'Bridal Makeup',
  'Henna Artists', 'Bridal Wear', 'Wedding Cards', 'Car Rental'
];

const vendorCategories = [
  { name: 'Wedding Venues', icon: 'fa-building', path: '/services?category=Wedding Venues' },
  { name: 'Photographers', icon: 'fa-camera', path: '/services?category=Photographers' },
  { name: 'Bridal Makeup', icon: 'fa-paint-brush', path: '/services?category=Bridal Makeup' },
  { name: 'Henna Artists', icon: 'fa-hand-paper', path: '/services?category=Henna Artists' },
  { name: 'Bridal Wear', icon: 'fa-person-dress', path: '/services?category=Bridal Wear' },
  { name: 'Car Rental', icon: 'fa-car', path: '/services?category=Car Rental' },
  { name: 'Wedding Invitations', icon: 'fa-envelope', path: '/services?category=Wedding Cards' },
];

const stats = [
  { value: '10,000+', label: 'Couples Planned', icon: 'fa-heart' },
  { value: '2,500+', label: 'Verified Vendors', icon: 'fa-store' },
  { value: '50+', label: 'Cities Covered', icon: 'fa-location-dot' },
  { value: '4.8 ★', label: 'Average Rating', icon: 'fa-star' },
];

const Home = () => {
  const navigate = useNavigate();
  const [sliderData, setSliderData] = useState({});
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'ShaadiPlanner - Plan Your Dream Wedding in India';
    const fetchData = async () => {
      try {
        setLoading(true);
        const sliders = await Promise.all(categories.map(async (cat) => {
          if (cat === 'Discounts') return { category: cat, data: (await fetchDiscountedServices()).data };
          if (cat === 'Recommendations') return { category: cat, data: await fetchRecommendations() };
          if (cat === 'Wedding Cards') return { category: cat, data: await fetchSliders('Wedding Cards') };
          return { category: cat, data: await fetchSliders(cat) };
        }));
        const trending = await fetchTrendingSearches();
        setSliderData(Object.fromEntries(sliders.map(s => [s.category, s.data])));
        setTrendingSearches(trending);
      } catch (error) {
        console.error('Failed to fetch slider data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (query) => {
    navigate(`/services?${new URLSearchParams(query).toString()}`);
  };

  return (
    <div className="home">
      <Navbar />
      <EstimateSidebar />

      {/* ── Hero Section ── */}
      <section className="hero-wrapper">
        <div className="hero-banner-container">
          <img src={heroBanner} alt="ShaadiPlanner Hero" className="hero-img" />
          <div className="hero-overlay">
            <div className="hero-content-center">
              <span className="hero-badge">✦ India's #1 Wedding Platform</span>
              <h1 className="hero-heading">
                Plan Your <span className="hero-heading-accent">Dream Shaadi</span><br/>in Just Minutes
              </h1>
              <p className="hero-subheading">
                Discover top-rated venues, photographers, makeup artists & more — all in one place.
              </p>
              <SearchBar onSearch={handleSearch} trendingSearches={trendingSearches} />
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="stats-bar">
          {stats.map((stat) => (
            <div className="stat-item" key={stat.label}>
              <i className={`fas ${stat.icon} stat-icon`}></i>
              <div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Category Shortcut Grid ── */}
      <section className="vendorArea">
        <div className="section-label">Browse by Category</div>
        <h2 className="vendorTitle">Find Every Wedding Vendor You Need</h2>
        <div className="vendorList">
          {vendorCategories.map((vendor) => (
            <VendorCard key={vendor.name} {...vendor} />
          ))}
        </div>
      </section>

      {/* ── Service Sliders ── */}
      {loading ? (
        <div className="home-loading">
          <div className="loading-spinner"></div>
          <p>Loading amazing vendors for you…</p>
        </div>
      ) : error ? (
        <div className="home-error">{error}</div>
      ) : (
        categories.map((category, index) => (
          sliderData[category]?.length > 0 && (
            <Slider
              key={category}
              category={category}
              data={sliderData[category]}
              index={index}
            />
          )
        ))
      )}

      <Footer />
    </div>
  );
};

export default Home;
