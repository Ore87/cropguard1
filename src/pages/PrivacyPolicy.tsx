import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/auth">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
        </Link>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-muted-foreground">
                KwaVest ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you use our agricultural 
                pest detection and farm management service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
              
              <h3 className="text-lg font-semibold mt-4 mb-2">2.1 Personal Information</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Name and email address</li>
                <li>Phone number (optional)</li>
                <li>Farm location and size</li>
                <li>Account credentials</li>
                <li>Profile information</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4 mb-2">2.2 Agricultural Data</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Farm images and crop photos uploaded for analysis</li>
                <li>Pest detection results and analysis reports</li>
                <li>Sensor data (temperature, humidity, soil moisture)</li>
                <li>Weather information and alerts</li>
                <li>Market price submissions</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4 mb-2">2.3 Technical Information</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Device information and IP address</li>
                <li>Browser type and version</li>
                <li>Usage data and interaction patterns</li>
                <li>Log files and error reports</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-2">We use the collected information to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Provide and maintain our pest detection and farm management services</li>
                <li>Process and analyze crop images for pest identification</li>
                <li>Send alerts about weather conditions and potential threats</li>
                <li>Provide personalized agricultural advice and recommendations</li>
                <li>Improve our AI models and service quality</li>
                <li>Communicate with you about your account and services</li>
                <li>Ensure security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Data Sharing and Disclosure</h2>
              <p className="text-muted-foreground mb-2">We may share your information with:</p>
              
              <h3 className="text-lg font-semibold mt-4 mb-2">4.1 Service Providers</h3>
              <p className="text-muted-foreground">
                Third-party companies that help us operate our service, such as cloud hosting providers, AI 
                processing services, and analytics providers. These parties are bound by confidentiality agreements.
              </p>

              <h3 className="text-lg font-semibold mt-4 mb-2">4.2 Agricultural Experts</h3>
              <p className="text-muted-foreground">
                With your consent, we may share your farm data with agronomists and agricultural experts who 
                provide consultation services through our platform.
              </p>

              <h3 className="text-lg font-semibold mt-4 mb-2">4.3 Legal Requirements</h3>
              <p className="text-muted-foreground">
                When required by law, regulation, legal process, or governmental request, or to protect our rights 
                and safety.
              </p>

              <h3 className="text-lg font-semibold mt-4 mb-2">4.4 Aggregated Data</h3>
              <p className="text-muted-foreground">
                We may share anonymized, aggregated data for research, agricultural studies, and market analysis.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Data Security</h2>
              <p className="text-muted-foreground">
                We implement appropriate technical and organizational measures to protect your information, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Secure data storage and backup procedures</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute 
                security of your data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Data Retention</h2>
              <p className="text-muted-foreground">
                We retain your personal information for as long as necessary to provide our services and comply with 
                legal obligations. Agricultural data and analysis reports are retained to improve our AI models and 
                provide historical insights, unless you request deletion. You may request deletion of your data at 
                any time, subject to legal retention requirements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Your Rights</h2>
              <p className="text-muted-foreground mb-2">You have the right to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your information</li>
                <li>Export your data in a portable format</li>
                <li>Withdraw consent at any time</li>
                <li>Lodge a complaint with data protection authorities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Cookies and Tracking</h2>
              <p className="text-muted-foreground">
                We use cookies and similar tracking technologies to improve your experience, analyze usage patterns, 
                and personalize content. You can control cookie preferences through your browser settings. Disabling 
                cookies may limit some functionality of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Third-Party Links</h2>
              <p className="text-muted-foreground">
                Our Service may contain links to third-party websites or services. We are not responsible for the 
                privacy practices of these third parties. We encourage you to review their privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Children's Privacy</h2>
              <p className="text-muted-foreground">
                Our Service is not intended for children under 13 years of age. We do not knowingly collect personal 
                information from children. If you believe we have collected information from a child, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. International Data Transfers</h2>
              <p className="text-muted-foreground">
                Your information may be transferred to and processed in countries other than your country of residence. 
                We ensure appropriate safeguards are in place to protect your information in accordance with this 
                Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of significant changes by 
                posting the new policy on this page and updating the "Last updated" date. Your continued use after 
                changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">13. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions about this Privacy Policy or wish to exercise your rights, please contact us at:
              </p>
              <ul className="list-none text-muted-foreground mt-2 space-y-1">
                <li>Email: privacy@kwavest.com</li>
                <li>Address: KwaVest Privacy Team</li>
              </ul>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
