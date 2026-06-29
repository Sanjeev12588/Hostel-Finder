
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function TermsAndConditionsPage() {
  return (
    <AppLayout>
      <div className="container mx-auto max-w-3xl p-4">
        <header className="relative flex items-center justify-center mb-6">
            <Button variant="ghost" size="icon" asChild className="absolute left-0">
                <Link href="/profile">
                    <ChevronLeft className="h-6 w-6" />
                </Link>
            </Button>
            <h1 className="font-headline text-2xl font-bold">Terms and Conditions</h1>
        </header>

        <Card>
            <CardContent className="p-6 space-y-4 text-muted-foreground">
                <p className="text-sm">Last Updated: July 29, 2024</p>
                
                <p>Welcome to Hostel Finder! These Terms and Conditions ("Terms") govern your access to and use of our mobile application and services (collectively, the "App"). By accessing or using the App, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to all of these Terms, do not use the App.</p>

                <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
                <p>By creating an account, posting an advertisement, searching for a listing, or otherwise using any aspect of the App, you acknowledge that you have read, understood, and agree to be bound by these Terms.</p>

                <h2 className="text-xl font-semibold text-foreground">2. Eligibility</h2>
                <p>You must be at least 18 years old and have the legal capacity to enter into a binding agreement to use the App. By using the App, you represent and warrant that you meet this eligibility requirement.</p>

                <h2 className="text-xl font-semibold text-foreground">3. Services Provided</h2>
                <p>The App provides a platform that allows:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li><strong>Users (Seekers):</strong> To search for available hostels, rooms, or shared accommodations ("Listings").</li>
                    <li><strong>Owners (Posters):</strong> To create and post advertisements for their hostels, rooms, or shared accommodations ("Ads").</li>
                    <li><strong>Contact:</strong> Users to directly contact Owners regarding Listings.</li>
                </ul>
                <p><strong>Please Note:</strong> The App acts solely as an intermediary platform for connecting Users and Owners. We are not a party to any rental agreement or transaction between Users and Owners. We do not own, manage, or inspect any of the listed properties.</p>

                <h2 className="text-xl font-semibold text-foreground">4. User Responsibilities (Seekers)</h2>
                <p>As a User searching for a Listing, you agree to:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Provide accurate and truthful information in your profile and when making inquiries.</li>
                    <li>Conduct yourself respectfully and professionally when contacting Owners.</li>
                    <li>Exercise due diligence in verifying any Listing, including inspecting the property, confirming amenities, and reviewing terms with the Owner before entering into any agreement.</li>
                    <li>Understand that the App does not guarantee the availability, accuracy, safety, or suitability of any Listing.</li>
                    <li>Comply with all applicable local, state, and national laws and regulations.</li>
                </ul>

                <h2 className="text-xl font-semibold text-foreground">5. Owner Responsibilities (Posters)</h2>
                <p>As an Owner posting an Ad, you agree to:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Ensure all information provided in your Ads is accurate, complete, truthful, and not misleading.</li>
                    <li>Accurately describe the property, amenities, pricing, availability, and any specific rules or requirements.</li>
                    <li>Have all necessary rights, licenses, and permits to rent out the property advertised.</li>
                    <li>Ensure the property complies with all applicable local, state, and national laws, including housing, health, and safety regulations.</li>
                    <li>Respond to inquiries from Users in a timely and professional manner.</li>
                    <li>Keep your Ads updated, including marking properties as unavailable once rented.</li>
                    <li>Maintain the property in good condition and as described in your Ad.</li>
                    <li>Understand that the App does not guarantee any leads, inquiries, or rentals as a result of your Ad.</li>
                </ul>

                <h2 className="text-xl font-semibold text-foreground">6. Content Guidelines</h2>
                <p>You are solely responsible for the content you upload, post, or transmit through the App. You agree not to post, transmit, or otherwise make available any content that:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Is false, inaccurate, misleading, or deceptive.</li>
                    <li>Is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, libelous, or invasive of another's privacy.</li>
                    <li>Infringes on any patent, trademark, trade secret, copyright, or other proprietary rights of any party.</li>
                    <li>Contains any viruses, malware, or other harmful computer code, files, or programs.</li>
                    <li>Promotes discrimination, racism, hatred, harassment, or harm against any individual or group.</li>
                    <li>Is commercial in nature (other than legitimate Ads by Owners) or constitutes spam, chain letters, pyramid schemes, or any other form of unauthorized solicitation.</li>
                </ul>
                <p>The App reserves the right, but is not obligated, to remove or modify any content that violates these Terms or is otherwise objectionable.</p>
                
                <h2 className="text-xl font-semibold text-foreground">7. Contacting Owners/Users</h2>
                <p>The App provides tools for Users to contact Owners directly. While we aim to facilitate communication, we are not responsible for:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>The content or outcome of any communication between Users and Owners.</li>
                    <li>Any disputes that arise between Users and Owners.</li>
                    <li>Any personal information exchanged between Users and Owners outside of the App's secure messaging features.</li>
                </ul>
                <p>We strongly advise Users and Owners to exercise caution and good judgment when communicating and sharing personal information.</p>
                
                <h2 className="text-xl font-semibold text-foreground">8. Payments and Fees</h2>
                <p>[Optional Section - If your app charges fees, describe them here.]</p>
                <p>For Owners: Details regarding listing fees, subscription plans, payment methods, and billing cycles.</p>
                <p>For Users: Details regarding any service fees, booking fees, or payment processing.</p>
                <p>All fees are non-refundable unless otherwise stated.</p>

                <h2 className="text-xl font-semibold text-foreground">9. Privacy Policy</h2>
                <p>Your use of the App is also governed by our Privacy Policy, which is incorporated into these Terms by this reference. Please review our <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link> to understand how we collect, use, and disclose your information.</p>
                
                <h2 className="text-xl font-semibold text-foreground">10. Disclaimers</h2>
                <p>THE APP AND ITS SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMISSIBLE PURSUANT TO APPLICABLE LAW, HOSTEL FINDER DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>
                <p>HOSTEL FINDER DOES NOT WARRANT THAT THE APP WILL BE UNINTERRUPTED OR ERROR-FREE, THAT DEFECTS WILL BE CORRECTED, OR THAT THE APP OR THE SERVERS THAT MAKE IT AVAILABLE ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.</p>

                <h2 className="text-xl font-semibold text-foreground">11. Limitation of Liability</h2>
                <p>TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL HOSTEL FINDER BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (A) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE APP; (B) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE APP, INCLUDING WITHOUT LIMITATION, ANY DEFAMATORY, OFFENSIVE, OR ILLEGAL CONDUCT OF OTHER USERS OR OWNERS; OR (C) UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT.</p>

                <h2 className="text-xl font-semibold text-foreground">12. Indemnification</h2>
                <p>You agree to indemnify, defend, and hold harmless Hostel Finder, its affiliates, officers, directors, employees, and agents from and against any and all claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising from your use of the App, your violation of these Terms, or your violation of any rights of any third party.</p>

                <h2 className="text-xl font-semibold text-foreground">13. Modifications to Terms</h2>
                <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our App after those revisions become effective, you agree to be bound by the revised terms.</p>

                <h2 className="text-xl font-semibold text-foreground">14. Termination</h2>
                <p>We may terminate or suspend your account and bar access to the App immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms. If you wish to terminate your account, you may simply discontinue using the App.</p>

                <h2 className="text-xl font-semibold text-foreground">15. Governing Law</h2>
                <p>These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.</p>
                
                <h2 className="text-xl font-semibold text-foreground">16. Dispute Resolution</h2>
                <p>Any dispute arising out of or in connection with these Terms, including any question regarding their existence, validity, or termination, shall be referred to and finally resolved by arbitration in India in accordance with the rules of the Arbitration and Conciliation Act, 1996.</p>

                <h2 className="text-xl font-semibold text-foreground">17. Miscellaneous</h2>
                <p><strong>Severability:</strong> If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions of these Terms will remain in full force and effect.</p>
                <p><strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and Hostel Finder regarding our App and supersede and replace any prior agreements we might have between us regarding the App.</p>
                <p><strong>Waiver:</strong> No waiver of any term of these Terms shall be deemed a further or continuing waiver of such term or any other term, and Hostel Finder's failure to assert any right or provision under these Terms shall not constitute a waiver of such right or provision.</p>
                
                <h2 className="text-xl font-semibold text-foreground">Contact Us</h2>
                <p>If you have any questions about these Terms, please contact us at nivaas1415@gmail.com.</p>
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
