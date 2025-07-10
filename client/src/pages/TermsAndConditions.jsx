import React from 'react';

const Section = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-3">{title}</h2>
    <div className="text-gray-600 dark:text-gray-400 space-y-4">
      {children}
    </div>
  </section>
);

const TermsAndConditions = () => {
  return (
    <div className="bg-white dark:bg-[#020817] py-12">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Terms & Conditions</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-10">
          Welcome to EduNest! We, EduNest, honor and understand the importance of your privacy and the terms that govern your use of our service. This policy outlines our practices regarding how we collect, store, use, share, and secure your personal information on our website, along with your choices to use, access, and correct your personal information.
        </p>

        <Section title="Collection of Information">
          <p>
            You can browse our website as a visitor without providing any personal information. However, for security and analytical purposes, we collect non-personal identification information, such as browser name, type of computer, and technical information about your means of connection to our site.
          </p>
        </Section>

        <Section title="Personal Identification Information">
          <p>
            We collect personal information when you register, purchase a course, or participate in the activities on our website. Our goal is to provide you with a safe and smooth learning experience. This data allows us to provide courses, study materials, and tutorials that meet your needs.
          </p>
          <p>We may collect the following information:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Your Name, Contact Information (including Email), and Password.</li>
            <li>Your preferences regarding our courses, such as syllabus interests and account settings.</li>
            <li>Information provided through our service, including interactions with customer service and participation in surveys.</li>
          </ul>
        </Section>

        <Section title="What We Do with the Information">
          <p>
            With the provided data, we aim to deliver the best possible experience. We use your information to:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Send you occasional course offers, new updates, and suggestions.</li>
            <li>Use for market research purposes to improve our services.</li>
            <li>Contact you via call, message, or text to know your experience as a customer.</li>
          </ul>
        </Section>

        <Section title="Security">
          <p>
            We are committed to ensuring the security of your information. To prevent unauthorized access or disclosure, we have implemented suitable physical, electronic, and managerial procedures to safeguard the information we collect. All credit/debit card details and personally identifiable information will not be stored, sold, shared, rented, or leased to any third parties.
          </p>
        </Section>
        
        <Section title="User Accounts and Conduct">
            <p>To access most features of the platform, you must register for an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to use the platform for lawful purposes only and not to post or transmit any material that violates or infringes on the rights of others.</p>
        </Section>

        <Section title="Contact Us">
          <p>
            For any queries, please go to our FAQ section or contact us at <a href="mailto:operations@edunest.com" className="text-blue-600 hover:underline">operations@edunest.com</a>.
          </p>
        </Section>
      </div>
    </div>
  );
};

export default TermsAndConditions;