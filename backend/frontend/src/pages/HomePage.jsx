import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Users, Award, ArrowRight, LogIn, UserPlus, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function HomePage() {
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const navigate = useNavigate();
  const loginMenuRef = useRef(null);
  
  // Close login menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (loginMenuRef.current && !loginMenuRef.current.contains(event.target)) {
        setShowLoginMenu(false);
      }
    };
    
    if (showLoginMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showLoginMenu]);
  
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const handleLoginClick = (portal) => {
    setShowLoginMenu(false);
    navigate(portal);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => scrollToSection('hero')}
              className="flex items-center gap-2 cursor-pointer hover:opacity-75 transition-opacity"
            >
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Quality Education</h1>
            </button>
            <div className="flex gap-4 items-center">
              <button
                onClick={() => scrollToSection('hero')}
                className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition"
              >
                About
              </button>
              <div className="relative" ref={loginMenuRef}>
                <button
                  onClick={() => setShowLoginMenu(!showLoginMenu)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
                >
                  Login
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {showLoginMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-60 border border-gray-200">
                    <button
                      onClick={() => handleLoginClick('/student')}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 transition flex items-center gap-2 text-gray-800 font-medium"
                    >
                      <LogIn className="w-4 h-4" />
                      Student Login
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-5xl font-bold text-gray-800 mb-6 leading-tight">
              Elevate Your Learning with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Quality Education
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Connect with expert tutors, track your progress, and achieve your educational goals. 
              Our platform provides feedback, ratings, and personalized learning experiences.
            </p>
            <div className="flex gap-4">
              <Link
                to="/student"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition transform hover:scale-105 font-semibold flex items-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                Student Login
              </Link>
              <Link
                to="/student"
                className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold flex items-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Register
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-xl">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                    <div className="p-3 bg-blue-600 rounded-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Expert Tutors</p>
                      <p className="text-sm text-gray-600">Learn from verified professionals</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg">
                    <div className="p-3 bg-purple-600 rounded-lg">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Quality Materials</p>
                      <p className="text-sm text-gray-600">Access curated study resources</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-lg">
                    <div className="p-3 bg-indigo-600 rounded-lg">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Track Progress</p>
                      <p className="text-sm text-gray-600">Monitor your learning journey</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-800 mb-4">Why Choose Quality Education?</h3>
            <p className="text-xl text-gray-600">Everything you need for academic success</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Expert Tutors',
                description: 'Learn from experienced tutors who are passionate about teaching and student success.',
                color: 'blue',
              },
              {
                icon: Award,
                title: 'Ratings & Feedback',
                description: 'Provide ratings and receive detailed feedback to improve your learning experience.',
                color: 'purple',
              },
              {
                icon: BookOpen,
                title: 'Study Materials',
                description: 'Access comprehensive study materials curated by experienced educators.',
                color: 'indigo',
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              const colorClasses = {
                blue: 'bg-blue-100 text-blue-600',
                purple: 'bg-purple-100 text-purple-600',
                indigo: 'bg-indigo-100 text-indigo-600',
              };
              return (
                <div key={index} className="p-8 rounded-xl border border-gray-200 hover:shadow-lg transition">
                  <div className={`w-12 h-12 rounded-lg ${colorClasses[feature.color]} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl font-bold text-white mb-4">Ready to Start Your Learning Journey?</h3>
          <p className="text-xl text-blue-100 mb-8">Join thousands of students and tutors on Quality Education</p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/student"
              className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-semibold"
            >
              Login as Student
            </Link>
            <Link
              to="/student"
              className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Register Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white">Quality Education</span>
            </div>
            <p className="text-sm">&copy; 2026 Quality Education. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
