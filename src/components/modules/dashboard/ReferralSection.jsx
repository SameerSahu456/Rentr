import { ChevronRight, Mail, Globe, MessageCircle, Star, UserCheck, Check, Copy } from 'lucide-react'

// ─── Referral Section ───
// variant: 'customer' | 'distributor'

export default function ReferralSection({ variant = 'customer', referralEmail, setReferralEmail, codeCopied, copyReferralCode, formatCurrency }) {
  if (variant === 'distributor') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-heading text-lg font-bold text-dark uppercase tracking-wide">Referral Points Earned</h3>
            <span className="font-heading text-2xl font-bold text-primary">{formatCurrency(2000)}/-</span>
          </div>
          <p className="text-base font-semibold text-dark mb-1">Refer a business friend, Save on rent</p>
          <p className="text-sm text-gray-3 leading-relaxed">
            Earn referral points by inviting your business contacts to join rentr. For every successful referral, you earn reward points that can be redeemed against your rental payments.
          </p>
          <button className="text-sm text-primary font-medium mt-2 hover:underline flex items-center gap-1">
            Refer more to earn more! Click here for details <ChevronRight size={14} />
          </button>
        </div>

        {/* Email invite */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex gap-3 mb-5">
            <input
              type="email"
              value={referralEmail}
              onChange={(e) => setReferralEmail(e.target.value)}
              placeholder="Email ID"
              className="input-field-rect flex-1 text-sm"
            />
            <button className="btn-primary px-6 py-2.5 text-sm font-semibold flex items-center gap-1">
              Invite <ChevronRight size={14} />
            </button>
          </div>

          {/* Referral code */}
          <div className="flex items-center gap-3 mb-5">
            <span className="text-sm text-gray-2">Your referral Code:</span>
            <div className="inline-flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2 border border-gray-200">
              <span className="font-heading font-bold text-primary tracking-widest">RENTRFFRL</span>
              <button onClick={copyReferralCode} className="text-gray-3 hover:text-primary transition-colors">
                {codeCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
            </div>
            {codeCopied && <span className="text-xs text-green-500 font-medium">Copied!</span>}
          </div>

          {/* Invite contacts */}
          <div>
            <p className="text-sm font-semibold text-dark mb-3">Invite your contacts</p>
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 text-gray-2 text-sm font-medium hover:bg-gray-50 transition-colors">
                <Mail size={16} />
                Invite email contacts
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1877F2] text-white text-sm font-medium hover:bg-[#1565C0] transition-colors">
                <Globe size={16} />
                Share on facebook
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1DA1F2] text-white text-sm font-medium hover:bg-[#1a8cd8] transition-colors">
                <MessageCircle size={16} />
                Share on twitter
              </button>
            </div>
          </div>
        </div>

        {/* How it works - 3 steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { num: '1', icon: Mail, title: 'Invite Friends', desc: 'Share your referral code with business contacts via email, social media, or direct link.' },
            { num: '2', icon: UserCheck, title: 'They Sign Up', desc: 'Your friend signs up on rentr using your referral code and subscribes to a plan.' },
            { num: '3', icon: Star, title: 'Earn Rewards', desc: 'You earn referral points redeemable against your monthly rental payments.' },
          ].map((step) => (
            <div key={step.num} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3 font-heading font-bold text-lg">
                {step.num}
              </div>
              <step.icon size={24} className="mx-auto text-primary mb-2" />
              <h5 className="font-heading text-sm font-bold text-dark mb-1">{step.title}</h5>
              <p className="text-xs text-gray-3 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Terms */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h4 className="font-heading text-sm font-bold text-dark uppercase tracking-wide mb-3">Referral Terms and Conditions</h4>
          <ul className="space-y-2 text-xs text-gray-3 leading-relaxed list-disc list-inside">
            <li>Referral points are earned only when the referred party completes their first subscription payment.</li>
            <li>Points can be redeemed against future rental payments only.</li>
            <li>Maximum referral points per month is capped at 5,000.</li>
            <li>Rentr reserves the right to modify or discontinue the referral program at any time.</li>
            <li>Self-referrals are not permitted and will result in disqualification.</li>
          </ul>
        </div>
      </div>
    )
  }

  // Customer variant
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="font-heading text-xl font-bold text-gray-1 uppercase tracking-wide">Referral Points Earned</h2>
        <p className="text-gray-3 text-sm">Total amount <span className="font-heading text-2xl font-bold text-gray-1 ml-2">₹ 2000/-</span></p>
      </div>
      <div>
        <h3 className="font-heading text-base font-bold text-gray-1">Refer a business friend, Save on rent</h3>
        <p className="text-sm text-primary mt-2">Earn 2000 Rs when a business/company sign up on Rentr and upto Rs 2300 when your they order successfully.</p>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-1 mb-2">Email ID</p>
        <div className="flex gap-3 max-w-lg">
          <input type="email" value={referralEmail} onChange={(e) => setReferralEmail(e.target.value)}
            placeholder="Enter email id" className="input-field-rect flex-1" />
          <button className="bg-primary text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-primary-dark transition-colors shrink-0">Invite &gt;</button>
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-1">
          Your referral Code : <span className="font-bold text-primary">RENTRRFFRL</span>
          <button onClick={copyReferralCode} className="ml-2 text-primary text-sm underline cursor-pointer">{codeCopied ? 'Copied!' : 'Copy'}</button>
        </p>
      </div>
    </div>
  )
}
