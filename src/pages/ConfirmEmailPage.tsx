import React from 'react';

const ConfirmEmailPage: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-300">
    <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-md flex flex-col items-center gap-6 border border-neutral-200">
      <h2 className="text-2xl font-extrabold text-neutral-900 mb-2 tracking-tight text-center">Confirm Your Email</h2>
      <p className="text-neutral-700 text-center">
        We have sent a confirmation link to your email address.<br />
        Please check your inbox and click the link to activate your account.
      </p>
      <div className="text-neutral-500 text-sm text-center">
        Didn&apos;t receive the email? Check your spam folder or <b>resend</b> from your email provider.
      </div>
    </div>
  </div>
);

export default ConfirmEmailPage; 