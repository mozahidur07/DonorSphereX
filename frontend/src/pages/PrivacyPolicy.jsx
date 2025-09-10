import React from 'react';

const PrivacyPolicyPage = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-3xl font-bold text-primary mb-6">Privacy Policy</h1>
        
        <div className="prose max-w-none">
          <p className="mb-4">Last updated: 9/9/2025</p>
          
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p>
              Welcome to the Blood & Organ Donation Platform - Donorspherex. We are committed to protecting your privacy 
              and ensuring the security of your personal information. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use our service.
            </p>
            <p className="mt-2">
              Please read this Privacy Policy carefully. By accessing or using our platform, you acknowledge that 
              you have read, understood, and agree to be bound by all the terms outlined in this Privacy Policy.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <p>We collect several types of information for various purposes:</p>
            
            <h3 className="text-xl font-medium mt-4 mb-2">Personal Information</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Full name</li>
              <li>Date of birth</li>
              <li>Contact information (email address, phone number, address)</li>
              <li>Government-issued identification details</li>
              <li>Blood type and medical history</li>
              <li>Organ donation preferences</li>
            </ul>
            
            <h3 className="text-xl font-medium mt-4 mb-2">Health Information</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Blood type and RH factor</li>
              <li>Medical conditions and history</li>
              <li>Medication history</li>
              <li>Previous donation records</li>
            </ul>
            
            <h3 className="text-xl font-medium mt-4 mb-2">Usage Information</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>IP address</li>
              <li>Browser type</li>
              <li>Access times</li>
              <li>Pages viewed</li>
              <li>Links clicked</li>
            </ul>
          </section>
          
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Facilitate and manage blood and organ donation processes</li>
              <li>Match donors with recipients based on medical compatibility</li>
              <li>Communicate with you about donation opportunities and requests</li>
              <li>Verify your identity and eligibility to donate</li>
              <li>Process and respond to your inquiries</li>
              <li>Send you alerts and notifications about donation needs</li>
              <li>Improve our platform and user experience</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>
          
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Disclosure of Your Information</h2>
            <p>We may share your information with:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Hospitals and medical facilities for donation coordination</li>
              <li>Healthcare providers involved in the donation process</li>
              <li>Third-party service providers who assist us in operating our platform</li>
              <li>Legal authorities when required by law</li>
              <li>Emergency contacts you've designated</li>
            </ul>
            <p className="mt-2">
              We will not sell, trade, or otherwise transfer your personally identifiable information to outside 
              parties without your consent, except as described above.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to maintain the safety of your personal 
              information. However, no method of transmission over the Internet or electronic storage is 100% secure, 
              and we cannot guarantee absolute security.
            </p>
            <p className="mt-2">
              Your health and personal information is encrypted both in transit and at rest. We regularly review 
              our security practices to enhance protection of your data.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <p>Depending on your location, you may have the following rights regarding your data:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Access to your personal information</li>
              <li>Correction of inaccurate or incomplete data</li>
              <li>Deletion of your personal information</li>
              <li>Restriction or objection to certain processing activities</li>
              <li>Data portability</li>
              <li>Withdrawal of consent</li>
            </ul>
            <p className="mt-2">
              To exercise these rights, please contact us using the information provided in the "Contact Us" section.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
            <p>
              Our platform is not intended for individuals under the age of 18. We do not knowingly collect personal 
              information from children under 18. If you are a parent or guardian and believe your child has provided 
              us with personal information, please contact us immediately.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
              Privacy Policy on this page and updating the "Last updated" date at the top of this Policy. You are advised 
              to review this Privacy Policy periodically for any changes.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <address className="not-italic mt-2">
              <strong>Blood & Organ Donation Platform</strong><br />
              Email: privacy@donorspherex.com<br />
              Phone: (555) 123-4567<br />
              Address: 12 Rail Gate, K.B. Basu Road, Barasat, North 24 Parganas, West Bengal, India
            </address>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
