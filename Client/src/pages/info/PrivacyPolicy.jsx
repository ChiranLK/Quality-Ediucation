import PageLayout from "./PageLayout";

export default function PrivacyPolicy({ onBack }) {
  return (
    <PageLayout title="Privacy Policy" onBack={onBack}>
      <p className="text-slate-600 mb-6 text-sm">Last Updated: April 5, 2026</p>
      
      <p className="text-slate-700 leading-relaxed mb-6">
        Your privacy is important to us. This Privacy Policy explanation describes how **TutorConnect** collects, uses, and shares your personal information.
      </p>

      <section className="mt-8 mb-4">
        <h2 className="text-xl font-bold text-slate-900 border-b border-indigo-100 pb-2 mb-4">Information Collection</h2>
        <p className="text-slate-600 mb-4">
          We collect information that you directly provide to us, such as your **name**, **email address**, **phone number**, **location**, and **educational goals**. This information is used solely to facilitate learning and connect you with tutors and peers.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="text-xl font-bold text-slate-900 border-b border-indigo-100 pb-2 mb-4">Use of Your Information</h2>
        <ul className="list-disc pl-6 space-y-3 text-slate-600 mb-4 text-sm">
          <li>To personalize your experience on our platform.</li>
          <li>To facilitate communication between students AND tutors.</li>
          <li>To process sessions, provide study materials, and manage your account.</li>
          <li>To improve our platform's functionality and security.</li>
          <li>To send you important notifications regarding your learning journey.</li>
        </ul>
      </section>

      <section className="mb-4">
        <h2 className="text-xl font-bold text-slate-900 border-b border-indigo-100 pb-2 mb-4">Security of Information</h2>
        <p className="text-slate-600 mb-4">
          We take reasonable measures to protect your personal information from unauthorized access, use, or disclosure. All data transmissions are encrypted using standard industry protocols.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="text-xl font-bold text-slate-900 border-b border-indigo-100 pb-2 mb-4">Sharing Your Information</h2>
        <p className="text-slate-600 mb-4">
          We do not sell your personal information to third parties. We only share information with partners and service providers who assist us in delivering our services, as described in this policy.
        </p>
      </section>

      <section className="mb-4 text-sm border-t border-slate-100 pt-8 mt-12 bg-slate-50 p-6 rounded-2xl">
        <h2 className="text-lg font-bold text-slate-800 mb-2">Contact Us</h2>
        <p className="text-slate-600 mb-2">If you have any questions or concerns about this Privacy Policy, please contact our support team:</p>
        <p className="font-bold text-indigo-700">support@tutorconnect.com</p>
        <p className="text-slate-500">Colombo, Sri Lanka</p>
      </section>
    </PageLayout>
  );
}
