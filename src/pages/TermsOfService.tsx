import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const TermsOfService = () => {
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
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using CropGuard ("the Service"), you accept and agree to be bound by the terms and 
                provision of this agreement. If you do not agree to these terms, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
              <p className="text-muted-foreground">
                CropGuard provides agricultural pest detection, farm management, weather monitoring, and advisory 
                services to farmers and agronomists. The Service includes AI-powered image analysis, sensor data 
                monitoring, expert consultations, and market information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
              <p className="text-muted-foreground">
                You are responsible for maintaining the confidentiality of your account credentials and for all 
                activities that occur under your account. You must notify us immediately of any unauthorized use 
                of your account. We reserve the right to terminate accounts that violate these terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Acceptable Use</h2>
              <p className="text-muted-foreground mb-2">You agree not to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Attempt to gain unauthorized access to any part of the Service</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Upload malicious code, viruses, or any harmful content</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Data Accuracy and Disclaimers</h2>
              <p className="text-muted-foreground">
                While we strive to provide accurate pest detection and agricultural advice, CropGuard's AI analysis 
                and recommendations are provided "as is" without warranties. The Service should be used as a tool 
                to assist decision-making, not as the sole basis for agricultural decisions. Users should verify 
                information and consult with local agricultural experts when necessary.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Intellectual Property</h2>
              <p className="text-muted-foreground">
                The Service and its original content, features, and functionality are owned by CropGuard and are 
                protected by international copyright, trademark, patent, trade secret, and other intellectual 
                property laws. You retain ownership of content you upload but grant us a license to use it for 
                providing and improving the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Payment and Subscription</h2>
              <p className="text-muted-foreground">
                Some features of the Service may require payment. You agree to provide accurate payment information 
                and authorize us to charge the applicable fees. Subscriptions automatically renew unless cancelled 
                before the renewal date. Refunds are provided at our discretion.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                CropGuard shall not be liable for any indirect, incidental, special, consequential, or punitive 
                damages resulting from your use of or inability to use the Service. Our total liability shall not 
                exceed the amount you paid for the Service in the past 12 months.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Modifications to Service</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify or discontinue the Service at any time, with or without notice. 
                We shall not be liable to you or any third party for any modification, suspension, or 
                discontinuation of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Termination</h2>
              <p className="text-muted-foreground">
                We may terminate or suspend your account and access to the Service immediately, without prior notice, 
                for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in 
                which CropGuard operates, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. Contact Information</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms, please contact us at: support@cropguard.com
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">13. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these Terms at any time. We will notify users of any material changes 
                by posting the new Terms on this page and updating the "Last updated" date. Your continued use of 
                the Service after such modifications constitutes acceptance of the updated Terms.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
