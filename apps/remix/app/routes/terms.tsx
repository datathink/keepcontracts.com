import { msg } from '@lingui/core/macro';
import { Link } from 'react-router';

import { BrandingLogo } from '~/components/general/branding-logo';
import { appMetaTags } from '~/utils/meta';

export function meta() {
  return appMetaTags(msg`Terms of Service`);
}

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 md:py-16">
      <Link to="/" className="mb-8 flex items-center gap-x-2">
        <BrandingLogo className="h-8 w-auto" />
      </Link>

      <article className="prose dark:prose-invert max-w-none">
        <h1>Terms of Service</h1>
        <p>
          <strong>Last updated:</strong> July 30, 2026
        </p>

        <p>
          These Terms of Service ("Terms") form a binding agreement between you and DataThink LLC ("DataThink," "we,"
          "us," or "our") and govern your access to and use of KeepContracts, our document preparation, electronic
          signature, and contract management platform available at keepcontracts.com (the "Service").
        </p>
        <p>
          By creating an account or using the Service, you agree to these Terms and to our Privacy Policy. If you do not
          agree, do not use the Service.
        </p>

        <h2>1. Eligibility and Acceptance</h2>
        <p>
          You must be at least 18 years old and able to form a binding contract to use the Service. If you use the
          Service on behalf of an organization, you represent that you are authorized to bind that organization to these
          Terms, and "you" refers to both you and that organization.
        </p>

        <h2>2. The Service</h2>
        <p>
          KeepContracts lets you and your organization prepare documents, collect electronic signatures, and manage
          contracts, recipients, and templates. We may add, change, or remove features at any time, and we may set
          limits on usage to keep the Service reliable and secure.
        </p>

        <h2>3. Accounts and Security</h2>
        <ul>
          <li>You must provide accurate and complete information when creating an account and keep it up to date.</li>
          <li>
            You are responsible for safeguarding your credentials and for all activity that occurs under your account.
          </li>
          <li>
            Notify us promptly at <a href="mailto:mangelsona@datathink.dev">mangelsona@datathink.dev</a> if you suspect
            unauthorized use of your account.
          </li>
          <li>You may verify your email address and use multi-step verification features where offered.</li>
        </ul>

        <h2>4. Organizations, Roles, and Members</h2>
        <p>
          The Service is organized into organizations, which may have administrators and members. Administrators can
          invite and remove members, assign roles, manage teams, and configure document and signing settings.
        </p>
        <p>
          If you are an administrator, you are responsible for your organization's use of the Service, including
          managing member access and the accuracy and lawfulness of the documents your organization sends and signs. If
          you are a member, your access is determined by your administrators.
        </p>

        <h2>5. Your Content and Data</h2>
        <p>
          You retain ownership of the content and data you submit to the Service, including documents, fields,
          recipients, and signatures ("Your Content"). You grant us a limited, non-exclusive license to host, process,
          and display Your Content solely to provide and improve the Service.
        </p>
        <p>
          You are responsible for the accuracy and legality of Your Content. When you enter personal information about
          other people, such as recipients or signers, you represent that you have the right to provide that information
          and to allow us to process it as described in our Privacy Policy.
        </p>

        <h2>6. Confidentiality</h2>
        <p>
          Documents and other non-public information exchanged through the Service may be confidential. Each party will
          protect the other's confidential information with at least the same degree of care it uses to protect its own
          confidential information, and in no event with less than a reasonable degree of care, and will use it only as
          necessary to provide or use the Service. This does not apply to information that is or becomes publicly
          available through no fault of the receiving party, or that must be disclosed by law.
        </p>

        <h2>7. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Service in violation of any applicable law or regulation;</li>
          <li>Access or use another user's account or data without authorization;</li>
          <li>Upload malicious code or attempt to disrupt, overload, or impair the Service;</li>
          <li>Probe, scan, or test the vulnerability of the Service, or circumvent its security or access controls;</li>
          <li>Scrape, harvest, or collect data from the Service by automated means without our permission;</li>
          <li>Resell or commercially exploit the Service except as expressly permitted.</li>
        </ul>

        <h2>8. AI-Assisted Features</h2>
        <p>
          The Service can use generative AI to suggest form fields and recipients within uploaded documents. These
          suggestions are produced automatically, may contain errors, and are provided for your convenience only. You
          are responsible for reviewing and confirming them before sending a document, and they do not constitute legal
          advice about the placement or sufficiency of any field or signature.
        </p>

        <h2>9. Documents, Signatures, and Records</h2>
        <p>
          The Service helps you prepare, send, and execute documents electronically, but you are solely responsible for
          determining whether an electronic signature is legally sufficient for your particular use case and
          jurisdiction, and for the accuracy of the documents you create. DataThink is not a party to any agreement
          between you and your recipients or counterparties and is not responsible for enforcing or resolving disputes
          arising from such agreements.
        </p>

        <h2>10. Fees</h2>
        <p>
          KeepContracts is not currently a paid product. If paid plans are introduced in the future, this section will
          be updated and you will be notified in advance of any charges. Unless required by law, fees are
          non-refundable.
        </p>

        <h2>11. Third-Party Services</h2>
        <p>
          The Service relies on third-party providers, such as hosting, email delivery, document conversion,
          authentication, and generative AI providers, and may let you sign in using third-party accounts such as
          Google. Your use of those services may be subject to their own terms and privacy policies, and we are not
          responsible for third-party services.
        </p>

        <h2>12. Intellectual Property</h2>
        <p>
          The Service, including its design, branding, and the KeepContracts and DataThink names and logos, is owned by
          DataThink and protected by intellectual property laws. Except for the rights expressly granted to you in these
          Terms — including the open source rights described in Section 13 — we reserve all rights in the Service. You
          may not use our trademarks without our prior written permission.
        </p>

        <h2>13. Open Source Software</h2>
        <p>
          KeepContracts is built on{' '}
          <a href="https://documenso.com" target="_blank" rel="noreferrer">
            Documenso
          </a>
          , which we use and modify under the GNU Affero General Public License v3.0 ("AGPL-3.0"). The AGPL-3.0 governs
          your rights in that underlying software independently of these Terms, which govern your use of the hosted
          Service. Nothing in these Terms limits any right you have under the AGPL-3.0, including the right to obtain,
          inspect, modify, and redistribute the corresponding source code.
        </p>
        <p>
          The source code for the version of the software running the Service is available at{' '}
          <a href="https://github.com/datathink/keepcontracts.com" target="_blank" rel="noreferrer">
            github.com/datathink/keepcontracts.com
          </a>
          .
        </p>

        <h2>14. Feedback</h2>
        <p>
          If you send us suggestions, ideas, or other feedback about the Service, you agree that we may use it for any
          purpose, including to improve the Service, without any obligation to compensate you.
        </p>

        <h2>15. Termination</h2>
        <p>
          You may stop using the Service at any time and may delete your account from the settings page. We may suspend
          or terminate your access if you violate these Terms, if required by law, or if necessary to protect the
          Service or other users.
        </p>
        <p>
          Upon termination, your right to use the Service ends. Sections of these Terms that by their nature should
          survive termination, including ownership, disclaimers, limitation of liability, and indemnification, will
          continue to apply. Our handling of your data after termination is described in our Privacy Policy.
        </p>

        <h2>16. Disclaimers</h2>
        <p>
          The Service is provided "as is" and "as available" without warranties of any kind, whether express, implied,
          or statutory, including any implied warranties of merchantability, fitness for a particular purpose, and
          non-infringement. We do not warrant that the Service will be uninterrupted, error-free, or secure, or that any
          content or output will be accurate.
        </p>

        <h2>17. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, DataThink and its affiliates will not be liable for any indirect,
          incidental, special, consequential, or punitive damages, or for any loss of profits, revenue, data, or
          goodwill, arising out of or relating to your use of the Service.
        </p>
        <p>
          To the maximum extent permitted by law, our total liability for any claim arising out of or relating to the
          Service will not exceed the greater of the amount you paid us for the Service in the twelve months before the
          claim or one hundred US dollars (US$100).
        </p>

        <h2>18. Indemnification</h2>
        <p>
          You agree to indemnify and hold harmless DataThink and its affiliates from any claims, damages, liabilities,
          and expenses (including reasonable legal fees) arising out of your use of the Service, Your Content, or your
          violation of these Terms or applicable law.
        </p>

        <h2>19. Governing Law and Disputes</h2>
        <p>
          These Terms are governed by the laws of the State of Idaho, United States, without regard to its conflict of
          law rules. You agree that any dispute arising out of or relating to these Terms or the Service will be subject
          to the exclusive jurisdiction of the state and federal courts located in Idaho, and you consent to personal
          jurisdiction there.
        </p>

        <h2>20. Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. When we do, we will revise the "Last updated" date above and, for
          material changes, provide additional notice where required. Your continued use of the Service after an update
          means you accept the revised Terms.
        </p>

        <h2>21. General</h2>
        <ul>
          <li>
            These Terms, together with the Privacy Policy, are the entire agreement between you and DataThink regarding
            the Service.
          </li>
          <li>If any provision is found unenforceable, the remaining provisions will remain in effect.</li>
          <li>Our failure to enforce any right or provision is not a waiver of it.</li>
          <li>
            You may not assign these Terms without our consent; we may assign them in connection with a merger,
            acquisition, or sale of assets.
          </li>
        </ul>

        <h2>22. Contact Us</h2>
        <p>
          If you have questions about these Terms, contact us at{' '}
          <a href="mailto:mangelsona@datathink.dev">mangelsona@datathink.dev</a>.
        </p>
      </article>
    </main>
  );
}
