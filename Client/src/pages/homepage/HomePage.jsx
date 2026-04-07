import { motion } from "framer-motion";
import { 
  BookOpen, Users, Video, FileText, 
  CheckCircle2, ArrowRight, Star, 
  MapPin, Clock, Calendar, Sun, Moon
} from "lucide-react";
import { useDarkMode } from "../../context/DarkModeContext";
import { useState, useEffect } from "react";


export default function HomePage({ onNavigate, onNavigateToLogin, onNavigateToRegister }) {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "features", "tutors"];
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-transparent dark:border-slate-800">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-xl text-white">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-400 dark:to-indigo-600">
                TutorConnect
              </span>

            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className={`font-medium transition-colors cursor-pointer ${activeSection === "home" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"}`}>Home</a>
              <a href="#features" className={`font-medium transition-colors cursor-pointer ${activeSection === "features" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"}`}>Features</a>
              <a href="#tutors" className={`font-medium transition-colors cursor-pointer ${activeSection === "tutors" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"}`}>Tutors</a>
            </div>



            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleDarkMode}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border border-transparent dark:border-slate-700"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.button>

              <button 
                onClick={onNavigateToLogin}
                className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
              >
                Log in
              </button>
              <button 
                onClick={onNavigateToRegister}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-md shadow-indigo-200 dark:shadow-none"
              >
                Sign up
              </button>

            </div>

          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div 
              className="flex-1 text-center lg:text-left"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium text-sm mb-6">
                <span className="flex h-2 w-2 rounded-full bg-indigo-600"></span>
                Web Based Peer-Learning
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6 text-slate-900 dark:text-white">
                Better <span className="text-indigo-600 dark:text-indigo-400">Learning</span> Future Starts With TutorConnect
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto lg:mx-0">

                Empowering school students through collaborative peer-learning and expert tutoring. Find the right materials, connect with tutors, and track your progress all in one place.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button 
                  onClick={onNavigateToRegister}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full font-semibold transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2"
                >
                  Get Started Now <ArrowRight className="w-5 h-5" />
                </button>


                <a 
                  href="#features"
                  className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 px-8 py-4 rounded-full font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  Explore Features
                </a>

              </div>
              
              <div className="mt-10 flex items-center justify-center lg:justify-start gap-4 text-sm text-slate-500 font-medium">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-xs font-bold text-indigo-700">A</div>
                  <div className="w-8 h-8 rounded-full bg-pink-100 border-2 border-white flex items-center justify-center text-xs font-bold text-pink-700">T</div>
                  <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-xs font-bold text-emerald-700">S</div>
                </div>
                <span>Joined by 1,000+ Students</span>
              </div>
            </motion.div>

            <motion.div 
              className="flex-1 relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Decorative blobs */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-indigo-200/50 via-indigo-50/20 to-pink-50/20 dark:from-indigo-900/40 dark:via-transparent dark:to-transparent rounded-full blur-3xl -z-10 opacity-70"></div>
              
              <div className="relative z-10 w-full rounded-3xl overflow-hidden shadow-2xl border border-white/50 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm p-4 text-center">
                 <img 
                    src="/assets/hero_upscaled.png" 
                    alt="Students studying together" 
                    className="w-full h-auto rounded-2xl object-cover mix-blend-normal dark:opacity-90"
                 />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-indigo-600 dark:text-indigo-400 font-bold tracking-wide uppercase text-sm mb-2">Our Capabilities</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Find The Best Features Of TutorConnect</h3>
            <p className="text-slate-600 dark:text-slate-400">Access a full suite of tools designed to enhance your learning experience through collaboration, expert guidance, and rich resources.</p>
          </div>


          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {[
              { icon: Users, title: "Interactive Peer Learning", desc: "Connect with classmates, form study groups, and learn together in a collaborative environment.", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
              { icon: Video, title: "Live Tutoring Sessions", desc: "Book 1-on-1 or group video sessions with experienced tutors tailored to your specific needs.", color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" },
              { icon: FileText, title: "Rich Study Materials", desc: "Access a verified library of study notes, past papers, and video tutorials categorized by grade and subject.", color: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400" },
            ].map((feature, idx) => (
              <motion.div 
                key={idx} 
                variants={itemVariants}
                className="border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`${feature.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}

          </motion.div>
        </div>
      </section>

      {/* Top Tutors Section */}
      <section id="tutors" className="py-20 bg-slate-50 dark:bg-slate-950">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-indigo-600 dark:text-indigo-400 font-bold tracking-wide uppercase text-sm mb-2">Expert Instructors</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Learn From Top Tutors</h3>
            </div>
            <button 
              onClick={onNavigateToLogin}
              className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
            >
              See all tutors <ArrowRight className="w-4 h-4" />
            </button>
          </div>


          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: "Chaminda Silva", role: "Math & Physics", rating: 4.9, students: 120, photo: "/assets/tutor_1.png" },
              { name: "Ruwan Jayasinghe", role: "Computer Science", rating: 4.8, students: 85, photo: "/assets/tutor_2.png" },
              { name: "Hasara Gunawardena", role: "English Literature", rating: 5.0, students: 200, photo: "/assets/tutor_3.png" },
              { name: "Vithusha Kanagaratnam", role: "Chemistry", rating: 4.7, students: 95, photo: "/assets/tutor_4.png" }
            ].map((tutor, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow group"
              >
                <div className="h-48 bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                  <div className="absolute inset-0 bg-indigo-900/10 group-hover:bg-transparent transition-colors z-10"></div>
                  <img 
                    src={tutor.photo} 
                    alt={tutor.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                <div className="p-5 text-center">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">{tutor.name}</h4>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-3">{tutor.role}</p>
                  
                  <div className="flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium border-t border-slate-100 dark:border-slate-800 pt-3">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500" fill="currentColor" /> {tutor.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {tutor.students} Students
                    </span>
                  </div>
                </div>

              </motion.div>
            ))}
          </div>
         </div>
      </section>

      {/* CTA / Quick Access */}
      <section className="py-24 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-indigo-600"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Supercharge Your Learning?</h2>
          <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of students who are already using TutorConnect to improve their grades, learn collaboratively, and succeed together.
          </p>
          <button 
            onClick={onNavigateToRegister}
            className="bg-white text-indigo-600 hover:bg-slate-50 px-10 py-5 rounded-full font-bold text-lg transition-transform transform hover:scale-105 shadow-xl"
          >
            Create Your Free Account
          </button>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-black text-slate-300 py-12 border-t border-slate-800">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-6 h-6 text-indigo-400" />
              <span className="text-xl font-bold text-white">TutorConnect</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              A dedicated web-based peer-learning and tutoring platform designed to elevate school students' educational journeys.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Study Materials</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Peer Learning Groups</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Tutoring Sessions</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Progress Tracking</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4 underline decoration-indigo-600 underline-offset-8">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => onNavigate("about")} className="hover:text-white dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer">About Us</button></li>
              <li><button onClick={() => onNavigate("privacy")} className="hover:text-white dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer">Privacy Policy</button></li>
              <li><button onClick={() => onNavigate("terms")} className="hover:text-white dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer">Terms of Service</button></li>
            </ul>
          </div>

          
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-indigo-400" /> Colombo, Srilanka</li>
              <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-400" /> Mon-Fri: 9AM - 5PM</li>
              <li className="flex items-center gap-2 text-indigo-400 font-medium">support@tutorconnect.com</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} TutorConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
