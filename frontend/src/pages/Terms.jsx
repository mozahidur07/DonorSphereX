import React from 'react';

const TermsConditionsPage = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-3xl font-bold text-primary mb-6">Terms and Conditions</h1>
        
        <div className="prose max-w-none">
          <p className="mb-4">Last updated: 9/9/2025</p>
          
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>
              Welcome to the Blood & Organ Donation Platform. These Terms and Conditions govern your use of our platform 
              and provide information about our blood and organ donation service.
            </p>
            <p className="mt-2">
              By accessing or using our platform, you agree to be bound by these Terms and Conditions. If you disagree 
              with any part of these terms, you may not access or use our service.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">2. Definitions</h2>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Platform:</strong> The Blood & Organ Donation website and application.</li>
              <li><strong>User:</strong> An individual who registers on the platform as a donor, recipient, medical staff, or administrator.</li>
              <li><strong>Donor:</strong> A user who registers to donate blood, organs, or tissues.</li>
              <li><strong>Recipient:</strong> A user who registers to receive blood, organs, or tissues.</li>
              <li><strong>Staff:</strong> Medical professionals and administrators who facilitate the donation process.</li>
              <li><strong>Donation:</strong> The voluntary giving of blood, organs, or tissues for medical use.</li>
              <li><strong>Service:</strong> All features, applications, and services provided by our platform.</li>
            </ul>
          </section>
          
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <h3 className="text-xl font-medium mt-4 mb-2">3.1 Registration</h3>
            <p>
              To use certain features of our platform, you must register for an account. When you register, you must 
              provide accurate, current, and complete information. You are responsible for maintaining the confidentiality 
              of your account credentials and for all activities that occur under your account.
            </p>
            
            <h3 className="text-xl font-medium mt-4 mb-2">3.2 Account Types</h3>
            <p>Users may register as:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Donor:</strong> Individuals willing to donate blood, organs, or tissues.</li>
              <li><strong>Staff:</strong> Medical professionals who facilitate and oversee donations.</li>
              <li><strong>Administrator:</strong> Platform administrators with elevated privileges.</li>
            </ul>
            
            <h3 className="text-xl font-medium mt-4 mb-2">3.3 Account Termination</h3>
            <p>
              We reserve the right to suspend or terminate your account at our sole discretion, without notice, for 
              conduct that we determine violates these Terms or is harmful to other users, us, or third parties, or 
              for any other reason.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">4. Donation Process</h2>
            <h3 className="text-xl font-medium mt-4 mb-2">4.1 Eligibility</h3>
            <p>
              To be eligible to donate blood or organs, you must meet certain health and age requirements as specified 
              by relevant medical authorities. The platform serves only to facilitate connections between eligible donors 
              and recipients; final eligibility determinations are made by medical professionals.
            </p>
            
            <h3 className="text-xl font-medium mt-4 mb-2">4.2 Consent</h3>
            <p>
              By registering as a donor, you acknowledge that you are providing informed consent for the donation of blood 
              or specified organs. You may withdraw this consent at any time before the donation process begins.
            </p>
            
            <h3 className="text-xl font-medium mt-4 mb-2">4.3 Medical Screening</h3>
            <p>
              All donors must undergo appropriate medical screening before donation. Our platform facilitates the scheduling 
              of these screenings but is not responsible for the medical assessment itself.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">5. User Responsibilities</h2>
            <p>As a user of our platform, you agree to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide accurate and truthful information about your health history and personal details.</li>
              <li>Update your profile information if any changes occur that may affect your eligibility to donate.</li>
              <li>Keep appointments for donation or notify of cancellations in a timely manner.</li>
              <li>Treat other users, including staff, with respect and dignity.</li>
              <li>Not use the platform for any unlawful purpose or in violation of these Terms.</li>
              <li>Not attempt to access restricted areas of the platform or interfere with its functionality.</li>
            </ul>
          </section>
          
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">6. Prohibited Activities</h2>
            <p>The following activities are strictly prohibited on our platform:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Offering or requesting payment for blood, organs, or tissues.</li>
              <li>Falsifying personal or medical information.</li>
              <li>Harassment or intimidation of other users.</li>
              <li>Attempting to bypass or manipulate the matching process.</li>
              <li>Sharing account credentials with others.</li>
              <li>Using the platform for commercial solicitation.</li>
              <li>Posting content that is offensive, defamatory, or violates others' rights.</li>
            </ul>
          </section>
          
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
            <p>
              The platform, including its content, features, and functionality, is owned by the Blood & Organ Donation 
              Platform and protected by copyright, trademark, and other intellectual property laws. You may not reproduce, 
              distribute, modify, create derivative works of, publicly display, or otherwise use any content from our 
              platform without our prior written consent.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">8. Disclaimer of Warranties</h2>
            <p>
              Our platform is provided "as is" and "as available" without any warranties of any kind, either express or 
              implied. We do not guarantee that the platform will be uninterrupted, error-free, or free of harmful components.
            </p>
            <p className="mt-2">
              While we strive to facilitate safe and effective donation processes, we do not guarantee the success of any 
              donation or transplant procedure. Medical outcomes are dependent on numerous factors beyond our control.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, 
              consequential, or punitive damages, including but not limited to, loss of profits, data, or use, arising 
              out of or in connection with your use of our platform.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">10. Changes to These Terms</h2>
            <p>
              We may revise these Terms from time to time. The most current version will always be posted on our platform. 
              By continuing to use our platform after any changes become effective, you agree to be bound by the revised terms.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">11. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without 
              regard to its conflict of law principles.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
            <p>
              If you have any questions about these Terms and Conditions, please contact us at:
            </p>
            <address className="not-italic mt-2">
              <strong>Blood & Organ Donation Platform</strong><br />
              Email: terms@donorspherex.com<br />
              Phone: (555) 123-4567<br />
              Address: 12 Rail Gate, K.B. Basu Road, Barasat, North 24 Parganas, West Bengal, India
            </address>
          </section>
          
          <div className="mt-8 text-center">
            <p>
              By using our platform, you acknowledge that you have read and understood these Terms and Conditions 
              and agree to be bound by them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditionsPage;
