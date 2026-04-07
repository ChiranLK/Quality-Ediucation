import PageLayout from "./PageLayout";

export default function AboutUs({ onBack }) {
  return (
    <PageLayout title="About Us" onBack={onBack}>
      <p className="text-xl leading-relaxed text-slate-700 mb-6">
        At **TutorConnect**, our mission is to empower the next generation of students by providing a seamless, interactive platform for learning and growth.
      </p>
      
      <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Our Vision</h2>
      <p className="text-slate-600 mb-6 font-medium leading-loose">
        We believe that education should be accessible, collaborative, and engaging. Our platform bridges the gap between students and expert tutors, fostering a community where knowledge is shared and academic success is achieved together.
      </p>

      <div className="grid md:grid-cols-2 gap-8 my-10">
        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
          <h3 className="font-bold text-indigo-700 text-lg mb-2">Interactive Learning</h3>
          <p className="text-slate-600 text-sm">We provide tools that make learning interactive, from live 1-on-1 sessions to collaborative peer groups.</p>
        </div>
        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
          <h3 className="font-bold text-indigo-700 text-lg mb-2">Verified Experts</h3>
          <p className="text-slate-600 text-sm">Every tutor on our platform is carefully vetted to ensure they provide high-quality, accurate educational guidance.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">What Sets Us Apart?</h2>
      <ul className="list-disc pl-6 space-y-4 text-slate-600 mb-8">
        <li>**Collaborative Peer-Learning:** Students can connect with their peers to study together, share notes, and solve problems as a team.</li>
        <li>**Expert Tutoring:** Access specialized help from subject matter experts in various academic disciplines.</li>
        <li>**Resource Library:** A comprehensive repository of study materials, past papers, and video tutorials available at your fingertips.</li>
        <li>**Progress Tracking:** View your academic journey and track improvement over time through our intuitive dashboard.</li>
      </ul>

      <div className="bg-slate-50 p-8 rounded-3xl text-center border border-slate-200 mt-12">
        <h3 className="text-xl font-bold text-slate-900 mb-2">Join Our Community Today</h3>
        <p className="text-slate-600 mb-6">Whether you're looking to learn from your peers, or seeking guidance from an expert tutor, TutorConnect is here to help you succeed.</p>
        <button 
          onClick={onBack}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-bold transition-all shadow-md"
        >
          Get Started
        </button>
      </div>
    </PageLayout>
  );
}
