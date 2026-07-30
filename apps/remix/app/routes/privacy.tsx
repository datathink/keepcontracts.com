import { msg } from '@lingui/core/macro';
import { Link } from 'react-router';

import { BrandingLogo } from '~/components/general/branding-logo';
import { appMetaTags } from '~/utils/meta';

export function meta() {
  return appMetaTags(msg`Privacy Policy`);
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 md:py-16">
      <Link to="/" className="mb-8 flex items-center gap-x-2">
        <BrandingLogo className="h-8 w-auto" />
      </Link>

      <article className="prose dark:prose-invert max-w-none">
        <h1>Privacy Policy</h1>
        <p>
          <strong>Last updated:</strong> July 30, 2026
        </p>

        <p>
          This Privacy Policy explains how DataThink LLC ("DataThink," "we," "us," or "our") collects, uses, discloses,
          and protects personal information when you use KeepContracts, our document preparation, electronic signature,
          and contract management platform available at keepcontracts.com (the "Service").
        </p>

        <h2>1. Information We Collect</h2>
        <p>
          We collect the following categories of information, most of which you or your organization provide directly:
        </p>
        <ul>
          <li>
            <strong>Account information:</strong> name, email address, and password (stored as a secure hash, never in
            plain text).
          </li>
          <li>
            <strong>Organization data:</strong> your organization or team name, your role, and settings your
            administrators configure.
          </li>
          <li>
            <strong>Document content:</strong> documents, fields, recipients, and signatures you upload or create in
            order to use the Service.
          </li>
          <li>
            <strong>Usage data:</strong> IP address, browser type, device information, and pages visited, collected
            automatically to operate and secure the Service.
          </li>
        </ul>
        <p>
          KeepContracts does not currently use third-party analytics or advertising tracking tools. If this changes,
          this Policy will be updated before any such tool is introduced.
        </p>

        <h2>2. How We Use Your Information</h2>
        <p>We use personal information to:</p>
        <ul>
          <li>Provide, operate, and maintain the Service, including document preparation, signing, and management;</li>
          <li>Create and authenticate your account and protect it against unauthorized access;</li>
          <li>Send transactional emails, such as document signing notifications and account alerts;</li>
          <li>Generate AI-assisted field and recipient suggestions, as described in Section 3;</li>
          <li>Respond to support requests;</li>
          <li>Monitor, secure, and improve the Service; and</li>
          <li>Comply with applicable legal obligations.</li>
        </ul>

        <h2>3. AI-Assisted Features</h2>
        <p>
          When you use AI-assisted field or recipient detection, the relevant document text and layout are sent to
          Google Cloud's Vertex AI (Gemini) service, which returns suggested fields or recipients. This processing is
          used solely to generate those suggestions. Google processes this information as our service provider, subject
          to its own data processing terms, and does not use it to train its own models.
        </p>

        <h2>4. Legal Bases for Processing (EEA/UK Users)</h2>
        <p>
          Where the GDPR applies, we process your personal data on the basis of: performance of a contract (providing
          the Service to you), our legitimate interests (securing and improving the Service, including AI-assisted
          features), and compliance with legal obligations.
        </p>

        <h2>5. How We Share Your Information</h2>
        <p>
          We do not sell your personal information. We share information only with service providers necessary to
          operate the Service — for example, hosting, email delivery, document conversion, and Google Cloud's Vertex AI
          (for AI-assisted features) — each under obligations to protect your information, or when required by law.
        </p>
        <p>
          KeepContracts does not currently use a third-party payment processor. If billing is introduced in the future,
          this Policy will be updated to name the relevant provider before it is used.
        </p>

        <h2>6. Cookies and Similar Technologies</h2>
        <p>
          We use only essential cookies required for authentication and security, such as session cookies, and
          functional cookies to remember your preferences. We do not currently use advertising or cross-site tracking
          cookies.
        </p>

        <h2>7. Data Retention</h2>
        <p>
          We retain your information for as long as your account is active or as needed to provide the Service, comply
          with legal obligations, resolve disputes, and enforce our agreements.
        </p>

        <h2>8. Data Security</h2>
        <p>
          We use reasonable technical and organizational measures, such as encryption in transit, password hashing, and
          access controls, to protect your information. No method of transmission or storage is completely secure, so we
          cannot guarantee absolute security.
        </p>

        <h2>9. Your Privacy Rights</h2>
        <p>
          You can access and update much of your information directly through your account settings, and you can request
          deletion of your account at any time. Depending on your location, you may have additional rights to correct,
          restrict, or receive a copy of your personal data, and to object to certain processing.
        </p>
        <ul>
          <li>
            <strong>EEA/UK (GDPR):</strong> the rights above, plus the right to lodge a complaint with your local data
            protection authority.
          </li>
          <li>
            <strong>California (CCPA/CPRA):</strong> the right to know what personal information we collect, request its
            correction or deletion, and not be discriminated against for exercising these rights. We do not sell or
            share personal information for cross-context behavioral advertising.
          </li>
        </ul>
        <p>
          To exercise these rights, contact us at <a href="mailto:mangelsona@datathink.dev">mangelsona@datathink.dev</a>
          .
        </p>

        <h2>10. International Data Transfers</h2>
        <p>
          We are based in the United States, and our infrastructure providers process and store information there. Where
          required, we rely on appropriate safeguards, such as standard contractual clauses, for transfers of personal
          data from the EEA, UK, or other jurisdictions with data transfer restrictions.
        </p>

        <h2>11. Children's Privacy</h2>
        <p>
          KeepContracts is not intended for use by anyone under 18. We do not knowingly collect personal information
          from children.
        </p>

        <h2>12. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. When we do, we will revise the "Last updated" date above,
          and material changes will be communicated before they take effect. Your continued use of the Service after an
          update means you accept the revised Policy.
        </p>

        <h2>13. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy or wish to exercise your privacy rights, contact us at{' '}
          <a href="mailto:mangelsona@datathink.dev">mangelsona@datathink.dev</a>.
        </p>
      </article>
    </main>
  );
}
