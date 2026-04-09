import {
  ChevronRight, ChevronLeft, Minus, Plus,
  X, Info, Phone, CheckCircle
} from 'lucide-react'
import { handleImgError } from '../../../constants/images'

export default function ProductModals({
  product,
  serverImg,
  /* Need Help modal */
  showNeedHelpModal,
  setShowNeedHelpModal,
  handleNeedHelpSubmit,
  enquiryName,
  setEnquiryName,
  enquiryPhone,
  setEnquiryPhone,
  enquiryHelp,
  setEnquiryHelp,
  /* Long Term modal */
  showLongTermModal,
  setShowLongTermModal,
  ltName,
  setLtName,
  ltPhone,
  setLtPhone,
  ltTab,
  setLtTab,
  setShowSuccessModal,
  /* Post Question modal */
  showPostQuestionModal,
  setShowPostQuestionModal,
  handlePostQuestion,
  questionTab,
  setQuestionTab,
  questionText,
  setQuestionText,
  questionName,
  setQuestionName,
  questionCompany,
  setQuestionCompany,
  questionPhone,
  setQuestionPhone,
  questionEmail,
  setQuestionEmail,
  /* Quick View modal */
  showQuickViewModal,
  setShowQuickViewModal,
  /* Variant modal */
  showVariantModal,
  setShowVariantModal,
  /* Success modal */
  showSuccessModal,
  /* Toast */
  showToast,
  setShowToast,
  /* Image zoom */
  imageZoomed,
  setImageZoomed,
  selectedImage,
  setSelectedImage,
}) {
  return (
    <>
      {/* Need Help / Get our team modal */}
      {showNeedHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowNeedHelpModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 pb-0">
              <h3 className="font-heading text-xl font-bold text-dark">
                Get our team to help you find the rig
              </h3>
              <button onClick={() => setShowNeedHelpModal(false)} className="text-gray-400 hover:text-dark">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleNeedHelpSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-dark block mb-1.5">Full name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={enquiryName}
                  onChange={(e) => setEnquiryName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-dark block mb-1.5">Phone number</label>
                <input
                  type="tel"
                  placeholder="+91"
                  value={enquiryPhone}
                  onChange={(e) => setEnquiryPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-dark block mb-1.5">How can we help ?</label>
                <input
                  type="text"
                  placeholder="How can we help ?"
                  value={enquiryHelp}
                  onChange={(e) => setEnquiryHelp(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-full hover:bg-primary-dark transition-colors"
              >
                <Phone size={16} />
                Call me
              </button>
              <button
                type="button"
                onClick={handleNeedHelpSubmit}
                className="bg-primary text-white font-semibold px-8 py-3 rounded-full hover:bg-primary-dark transition-colors"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Didn't Find / Long Term Plans Modal */}
      {showLongTermModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowLongTermModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 pb-4">
              <h3 className="font-heading text-xl font-bold text-dark">Long term Plans</h3>
              <button onClick={() => setShowLongTermModal(false)} className="text-gray-400 hover:text-dark">
                <X size={20} />
              </button>
            </div>

            {/* Savings banner */}
            <div className="mx-6 mb-4 bg-orange-50 border border-orange-100 rounded-lg px-4 py-2 flex items-center gap-2">
              <span className="text-lg">🏷️</span>
              <span className="text-sm text-orange-700">
                You will get upto <strong>15% savings</strong> by choosing our long term plans.
              </span>
            </div>

            {/* Customer / Distributor toggle */}
            <div className="px-6 mb-4">
              <div className="flex gap-0">
                <button
                  onClick={() => setLtTab('customer')}
                  className={`px-5 py-2 text-sm font-semibold rounded-full transition-colors ${
                    ltTab === 'customer' ? 'bg-primary text-white' : 'text-gray-500'
                  }`}
                >
                  Customer
                </button>
                <button
                  onClick={() => setLtTab('distributor')}
                  className={`px-5 py-2 text-sm font-semibold rounded-full transition-colors flex items-center gap-1 ${
                    ltTab === 'distributor' ? 'bg-primary text-white' : 'text-gray-500'
                  }`}
                >
                  Distributor <Info size={12} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Please leave your details and we'll get back to you shortly.</p>
            </div>

            <form className="px-6 pb-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-dark block mb-1.5">Full name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={ltName}
                  onChange={(e) => setLtName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-dark block mb-1.5">Phone number</label>
                <input
                  type="tel"
                  placeholder="+91"
                  value={ltPhone}
                  onChange={(e) => setLtPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <button
                type="button"
                onClick={() => { setShowLongTermModal(false); setShowSuccessModal(true) }}
                className="flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-full hover:bg-primary-dark transition-colors"
              >
                <Phone size={16} />
                Call me
              </button>

              <ul className="space-y-2 text-sm text-gray-600 list-disc pl-4">
                <li>Longer tenures have lower monthly rent.</li>
                <li>At the end of your minimum rental period, you can keep renting for the same price for as long as you want.</li>
                <li>In case you return the item before the chosen tenure is over, you will be asked to pay a minimal early closure charges.</li>
              </ul>
            </form>
          </div>
        </div>
      )}

      {/* Post Question Modal */}
      {showPostQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPostQuestionModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-6 pb-4">
              <h3 className="font-heading text-xl font-bold text-dark">Post your Question</h3>
              <button onClick={() => setShowPostQuestionModal(false)} className="text-gray-400 hover:text-dark">
                <X size={20} />
              </button>
            </div>

            {/* Customer / Distributor toggle */}
            <div className="px-6 mb-4">
              <div className="flex gap-0">
                <button
                  onClick={() => setQuestionTab('customer')}
                  className={`px-5 py-2 text-sm font-semibold rounded-full transition-colors ${
                    questionTab === 'customer' ? 'bg-primary text-white' : 'text-gray-500'
                  }`}
                >
                  Customer
                </button>
                <button
                  onClick={() => setQuestionTab('distributor')}
                  className={`px-5 py-2 text-sm font-semibold rounded-full transition-colors flex items-center gap-1 ${
                    questionTab === 'distributor' ? 'bg-primary text-white' : 'text-gray-500'
                  }`}
                >
                  Distributor <Info size={12} />
                </button>
              </div>
            </div>

            <form onSubmit={handlePostQuestion} className="px-6 pb-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-dark block mb-1.5">Your question</label>
                <textarea
                  placeholder="Enter your question here"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary h-20 resize-none"
                  required
                />
              </div>

              <p className="text-xs text-gray-500">
                Share your contact details and we will reach out to you with an answer within 24 hrs
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-dark block mb-1.5">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name here"
                    value={questionName}
                    onChange={(e) => setQuestionName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark block mb-1.5">Company name</label>
                  <input
                    type="text"
                    placeholder="Eg. SBI Mutual"
                    value={questionCompany}
                    onChange={(e) => setQuestionCompany(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-dark block mb-1.5">Phone number</label>
                  <input
                    type="tel"
                    placeholder="+91"
                    value={questionPhone}
                    onChange={(e) => setQuestionPhone(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark block mb-1.5">Email ID</label>
                  <input
                    type="email"
                    placeholder="example@email.com"
                    value={questionEmail}
                    onChange={(e) => setQuestionEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-primary text-white font-semibold px-8 py-3 rounded-full hover:bg-primary-dark transition-colors"
              >
                Submit
              </button>
              <p className="text-xs text-gray-500">
                Read all our <a href="#" className="text-dark font-semibold underline">FAQ&apos;s</a>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {showQuickViewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowQuickViewModal(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <button
              onClick={() => setShowQuickViewModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-dark z-10"
            >
              <X size={20} />
            </button>
            <div className="flex flex-col sm:flex-row gap-6 p-4 sm:p-6">
              {/* Image carousel */}
              <div className="w-full sm:w-64 shrink-0">
                <div className="bg-gray-50 rounded-lg p-6 flex items-center justify-center h-52 relative">
                  <img src={showQuickViewModal.image} alt="" className="max-h-full object-contain" onError={handleImgError} loading="lazy" />
                  <button className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow">
                    <ChevronLeft size={14} />
                  </button>
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
              {/* Details */}
              <div className="flex-1">
                <h3 className="font-heading text-lg font-bold text-dark">GPU Power Cables</h3>
                <p className="text-primary font-semibold mt-1">Rs 22,000</p>
                <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                  HPE DL380 Gen10 1P 16G 8LFF Svr Xeon-Silver 4110 2.1GHz/8C/B5W, 24DIMM Slots 1x
                  16GB, Open Bay 8-LFF HP Drive Cage, 4x1GbE NIC(Embedded), S100i(Embedded),
                  2U LFF Easy Install Rail Kit, 1x500W LH PS, 3yrs NBD Supprt
                </p>
                <div className="mt-4 space-y-1">
                  <p className="text-sm"><span className="font-medium text-dark">Brand</span> HPE</p>
                  <p className="text-sm"><span className="font-medium text-dark">Product Code</span> 989386458-1</p>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <span className="text-sm font-medium text-dark">Qty</span>
                  <button className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center hover:border-primary">
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-medium">2</span>
                  <button className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center hover:border-primary">
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  onClick={() => setShowQuickViewModal(null)}
                  className="mt-5 bg-primary text-white font-semibold px-8 py-2.5 rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Choose Variant Modal */}
      {showVariantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowVariantModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading text-lg font-bold text-dark uppercase tracking-wide">Choose Variant</h3>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-primary">
                  <ChevronLeft size={16} />
                </button>
                <button className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-primary">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((v) => (
                <div key={v} className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-4 flex items-center justify-center h-36">
                    <img src={serverImg} alt="" className="max-h-full object-contain" onError={handleImgError} loading="lazy" />
                  </div>
                  <div className="p-3">
                    <h4 className="text-xs font-medium text-dark">PowerEdge T30 Mini Tower Server</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500">₹3,000/month</span>
                      <div className="flex items-center gap-1 ml-auto">
                        <button className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center">
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-medium w-6 text-center">3</span>
                        <button className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center">
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => setShowVariantModal(false)}
                className="bg-primary text-white font-semibold px-8 py-2.5 rounded-lg hover:bg-primary-dark transition-colors"
              >
                Done
              </button>
              <button
                onClick={() => setShowVariantModal(false)}
                className="border border-gray-300 text-dark font-semibold px-8 py-2.5 rounded-lg hover:border-primary hover:text-primary transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSuccessModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h3 className="font-heading text-xl font-bold text-dark mb-2">
              Your query has been recorded Successfully
            </h3>
            <p className="text-sm text-gray-500 mb-2">
              We will review your request and get back to you within 24 hours at your email address.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              <a href="#" className="text-primary">Contact us</a> if something&apos;s wrong.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Back to website
            </button>
            <p className="text-xs text-gray-500 mt-4">
              <strong>Note:</strong> While we appreciate you sharing your documents, please
              note that Rentr reserves the right to confirm or decline the order
              on a case by case basis.
            </p>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white border border-gray-300 shadow-lg rounded-lg px-4 py-3 animate-[slideInRight_0.3s_ease-out]">
          <CheckCircle size={18} className="text-green-500" />
          <span className="text-sm text-dark">Thanks! Your question has been submitted.</span>
          <button onClick={() => setShowToast(false)} className="text-gray-400 hover:text-dark ml-2">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Fullscreen Image Viewer */}
      {imageZoomed && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4">
          <button
            onClick={() => setImageZoomed(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X size={28} />
          </button>
          <img
            src={product.images[selectedImage]}
            alt={product.name}
            className="max-h-[80vh] max-w-full object-contain"
            onError={handleImgError}
          />
          <div className="flex gap-3 mt-6">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`w-14 h-14 border-2 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center p-1.5 transition-colors ${
                  selectedImage === i ? 'border-primary' : 'border-white/20 hover:border-white/40'
                }`}
              >
                <img src={img} alt="" className="max-h-full object-contain" onError={handleImgError} />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
