import PageLayout from "./PageLayout";

export default function TermsOfService({ onBack }) {
  return (
    <PageLayout title="Terms of Service" onBack={onBack}>
      <p className="text-slate-600 mb-6 text-sm">Last Updated: April 5, 2026</p>

      <p className="text-slate-700 leading-relaxed mb-6">
        Please read these Terms of Service carefully before using our platform. By accessing or using **TutorConnect**, you agree to be bound by these Terms of Service.
      </p>

      <section className="mb-4">
        <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">1. Use of Our Services</h2>
        <p className="text-slate-600 mb-4">
          Our services are intended for students and tutors to facilitate a collaborative learning environment. You must use our services for lawful educational purposes only and in accordance with these Terms.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">2. User Accounts</h2>
        <p className="text-slate-600 mb-4">
          To access certain features of our platform, you will need to create an account. You are responsible for maintaining the confidentiality of your account information, including your password. You must provide accurate and complete information during registration.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">3. Code of Conduct</h2>
        <p className="text-slate-600 mb-4">
          We expect all users to interact in a respectful and professional manner. Prohibited activities include, but are not limited to:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-600 mb-4 text-sm">
          <li>Harassment or discrimination against any user.</li>
          <li>Sharing of illegal, harmful, or inappropriate content.</li>
          <li>Unauthorized sharing of non-public classroom materials.</li>
          <li>Impersonation of any other person or entity.</li>
          <li>Engaging in academic dishonesty or cheating.</li>
        </ul>
      </section>

      <section className="mb-4">
        <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">4. Content Ownership</h2>
        <p className="text-slate-600 mb-4">
          Users retain ownership of the content they create and share on our platform. By posting content, you grant TutorConnect a non-exclusive, worldwide, royalty-free license to use, reproduce, and distribute that content to provide our services.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">5. Disclaimer of Warranties</h2>
        <p className="text-slate-600 mb-4">
          Our services are provided on an "as-is" and "as-available" basis, without any warranties of any kind. TutorConnect does not guarantee that our services will meet your academic expectations or be uninterrupted and error-free.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">6. Limitation of Liability</h2>
        <p className="text-slate-600 mb-4">
          In no event shall TutorConnect be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of data or academic standing, resulting from your use of our services.
        </p>
      </section>

      <section className="mt-12 text-center p-8 bg-indigo-50 rounded-3xl border border-indigo-100">
        <p className="text-slate-600 mb-4">By continuing to use TutorConnect, you acknowledge that you have read, understood, and agreed to these Terms of Service.</p>
        <button 
          onClick={onBack}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-3 rounded-full font-bold shadow-lg"
        >
          I Accept
        </button>
      </section>
    </PageLayout>
  );
}
