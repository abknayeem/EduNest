import React from 'react';

const Section = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-3">{title}</h2>
    <div className="text-gray-600 dark:text-gray-400 space-y-4">
      {children}
    </div>
  </section>
);

const PrivacyPolicy = () => {
  return (
    <div className="bg-white dark:bg-[#020817] py-12">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Privacy Policy</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-10">
          Welcome to the EduNest app, owned and operated by EduNest. We are committed to protecting your privacy and ensuring that your data is safe and secure. This Privacy Policy outlines how we collect, use, and protect your information when you use our App and services.
        </p>

        <Section title="1. Ownership and Data Collection">
          <p>
            All content, features, and services available on this App are the exclusive property of EduNest. By using our App, you acknowledge and agree that EduNest owns all rights, titles, and interests in and to the App and its content.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p>
            <b>Personal Information:</b> When you register an account or interact with our App, we may collect personal information such as your name, email address, phone number, and payment details.
          </p>
          <p>
            <b>Usage Data:</b> We may collect data about how you use our App, including which courses you access, the time spent on the platform, and other related activities.
          </p>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>The information collected will be used for the following purposes:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>To provide and improve our services, courses, and live events.</li>
            <li>To personalize your experience and deliver relevant content.</li>
            <li>To manage payments and subscriptions.</li>
            <li>To communicate with you regarding updates, promotions, and new features.</li>
            <li>To analyze user behavior and enhance the overall functionality of our App.</li>
          </ul>
        </Section>

        <Section title="4. Data Protection and Security">
            <p>Your data security is our top priority. We implement robust technical, administrative, and physical safeguards to protect your data from unauthorized access, alteration, disclosure, or destruction. All collected data is stored securely, and only authorized personnel have access to it.</p>
        </Section>
        
        <Section title="5. Third-Party Services">
            <p>Our App may contain links to third-party websites or services. Please note that this Privacy Policy does not apply to those third-party sites, and we are not responsible for their privacy practices.</p>
        </Section>

        <Section title="6. Changes to This Privacy Policy">
            <p>EduNest reserves the right to update or modify this Privacy Policy at any time. We will notify you of any significant changes through our App or other communication channels. Your continued use of the App after such changes indicates your acceptance of the revised policy.</p>
        </Section>

        <Section title="7. Contact Us">
            <p>If you have any questions or requests regarding this Privacy Policy, please contact us at: <a href="mailto:operations@edunest.com" className="text-blue-600 hover:underline">operations@edunest.com</a>.</p>
        </Section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;