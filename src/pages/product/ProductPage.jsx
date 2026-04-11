import { useState, useRef, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

import {
  PRODUCT as FALLBACK_PRODUCT, SERVER_DETAILS, ITEM_DETAILS, SPEC_TABLE,
  TESTIMONIALS, FAQ_ITEMS,
  BYO_CATEGORIES, BENEFITS_MARQUEE, SERVER_IMG, SIMILAR_PRODUCTS as FALLBACK_SIMILAR,
} from '../../constants/product'
import { saleorProducts } from '../../services/saleor'

import ProductImageGallery from '../../components/modules/product/ProductImageGallery'
import RentalSidebar from '../../components/modules/product/RentalSidebar'
import ProductSpecifications from '../../components/modules/product/ProductSpecifications'
import SimilarProducts from '../../components/modules/product/SimilarProducts'
import ProductFAQ from '../../components/modules/product/ProductFAQ'
import ProductModals from '../../components/modules/product/ProductModals'

/* ───────────────────────── COMPONENT ───────────────────────── */

export default function ProductPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addItem } = useCart()

  /* Fetch product from Saleor */
  const [product, setProduct] = useState(null)
  const [similarProducts, setSimilarProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    setLoading(true)
    saleorProducts.getBySlug(slug)
      .then(p => {
        setProduct(p)
        return saleorProducts.list({ category: p?.category, pageSize: 6 })
      })
      .then(result => setSimilarProducts(result?.products || []))
      .catch(err => {
        console.error('[Saleor] Failed to fetch product:', err)
        setProduct(null)
      })
      .finally(() => setLoading(false))
  }, [slug])

  /* Image gallery */
  const [selectedImage, setSelectedImage] = useState(0)
  const [imageZoomed, setImageZoomed] = useState(false)

  /* Rental sidebar */
  const [rentalType, setRentalType] = useState('rent')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [tenureMonths, setTenureMonths] = useState(12)
  const [qty] = useState(1)

  /* Tabs */
  const [activeTab, setActiveTab] = useState('description')

  /* FAQ */
  const [openFaq, setOpenFaq] = useState(-1)

  /* Build Your Own */
  const [byoExpanded, setByoExpanded] = useState(false)

  /* Modals */
  const [showNeedHelpModal, setShowNeedHelpModal] = useState(false)
  const [showLongTermModal, setShowLongTermModal] = useState(false)
  const [showPostQuestionModal, setShowPostQuestionModal] = useState(false)
  const [showQuickViewModal, setShowQuickViewModal] = useState(null)
  const [showVariantModal, setShowVariantModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showToast, setShowToast] = useState(false)

  /* Enquiry form */
  const [enquiryName, setEnquiryName] = useState('')
  const [enquiryPhone, setEnquiryPhone] = useState('')
  const [enquiryHelp, setEnquiryHelp] = useState('')

  /* Question form */
  const [questionTab, setQuestionTab] = useState('customer')
  const [questionText, setQuestionText] = useState('')
  const [questionName, setQuestionName] = useState('')
  const [questionCompany, setQuestionCompany] = useState('')
  const [questionPhone, setQuestionPhone] = useState('')
  const [questionEmail, setQuestionEmail] = useState('')

  /* Long term plans form */
  const [ltName, setLtName] = useState('')
  const [ltPhone, setLtPhone] = useState('')
  const [ltTab, setLtTab] = useState('customer')

  /* Wishlist */
  const [wishlisted, setWishlisted] = useState(false)

  /* Coupon */
  const [couponCode, setCouponCode] = useState('')

  /* Similar products carousel */
  const carouselRef = useRef(null)

  const scrollCarousel = (dir) => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' })
    }
  }

  /* Toast auto-dismiss */
  useEffect(() => {
    if (showToast) {
      const t = setTimeout(() => setShowToast(false), 4000)
      return () => clearTimeout(t)
    }
  }, [showToast])

  const handlePostQuestion = (e) => {
    e.preventDefault()
    setShowPostQuestionModal(false)
    setShowToast(true)
    setQuestionText('')
    setQuestionName('')
    setQuestionCompany('')
    setQuestionPhone('')
    setQuestionEmail('')
  }

  const handleNeedHelpSubmit = (e) => {
    e.preventDefault()
    setShowNeedHelpModal(false)
    setShowSuccessModal(true)
    setEnquiryName('')
    setEnquiryPhone('')
    setEnquiryHelp('')
  }

  const handleBookPlan = async () => {
    if (!user) { navigate('/login'); return }
    setAddingToCart(true)
    try {
      await addItem(product.id, qty, tenureMonths)
      navigate('/checkout')
    } catch {
      setShowToast(true)
    } finally {
      setAddingToCart(false)
    }
  }

  /* Tenure slider position */
  const tenurePercent = tenureMonths <= 6 ? 0 : tenureMonths <= 12 ? 50 : 100

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading product...</div>
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="bg-white min-h-screen">
      {/* BREADCRUMB */}
      <div className="bg-white border-b border-gray-300">
        <div className="section-container py-3 flex items-center gap-2 text-sm text-gray-500 flex-wrap">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link to="/search" className="hover:text-primary transition-colors">{product.parentCategory}</Link>
          <ChevronRight size={14} />
          <Link to={`/products/${(product.category || 'server').toLowerCase()}`} className="hover:text-primary transition-colors">{product.category || 'Server'}</Link>
          <ChevronRight size={14} />
          <span className="text-dark font-semibold">{product.name}</span>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="section-container py-6">
        <div className="flex flex-col lg:flex-row gap-0">

          {/* LEFT: Image Gallery + Tabs Content */}
          <div className="flex-1 min-w-0">

            <ProductImageGallery
              product={product}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              wishlisted={wishlisted}
              setWishlisted={setWishlisted}
              setImageZoomed={setImageZoomed}
            />

            <ProductSpecifications
              product={product}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              serverDetails={product.specs ? Object.entries(product.specs).map(([k, v]) => ({ label: k, value: v })) : SERVER_DETAILS}
              itemDetails={ITEM_DETAILS}
              specTable={product.specs ? Object.entries(product.specs).map(([k, v]) => ({ label: k, value: String(v) })) : SPEC_TABLE}
              byoExpanded={byoExpanded}
              setByoExpanded={setByoExpanded}
              byoCategories={BYO_CATEGORIES}
              testimonials={TESTIMONIALS}
            />

            <ProductFAQ
              faqItems={FAQ_ITEMS}
              openFaq={openFaq}
              setOpenFaq={setOpenFaq}
              setShowPostQuestionModal={setShowPostQuestionModal}
            />
          </div>

          {/* RIGHT: Rental Sidebar */}
          <RentalSidebar
            product={product}
            rentalType={rentalType}
            setRentalType={setRentalType}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            tenureMonths={tenureMonths}
            setTenureMonths={setTenureMonths}
            tenurePercent={tenurePercent}
            qty={qty}
            setShowLongTermModal={setShowLongTermModal}
            setShowNeedHelpModal={setShowNeedHelpModal}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            benefitsMarquee={BENEFITS_MARQUEE}
            onBookPlan={handleBookPlan}
            addingToCart={addingToCart}
          />

        </div>
      </div>

      {/* RECOMMENDED SERVERS */}
      <SimilarProducts
        similarProducts={similarProducts}
        carouselRef={carouselRef}
        scrollCarousel={scrollCarousel}
      />

      {/* MODALS */}
      <ProductModals
        product={product}
        serverImg={product.images?.[0] || SERVER_IMG}
        showNeedHelpModal={showNeedHelpModal}
        setShowNeedHelpModal={setShowNeedHelpModal}
        handleNeedHelpSubmit={handleNeedHelpSubmit}
        enquiryName={enquiryName}
        setEnquiryName={setEnquiryName}
        enquiryPhone={enquiryPhone}
        setEnquiryPhone={setEnquiryPhone}
        enquiryHelp={enquiryHelp}
        setEnquiryHelp={setEnquiryHelp}
        showLongTermModal={showLongTermModal}
        setShowLongTermModal={setShowLongTermModal}
        ltName={ltName}
        setLtName={setLtName}
        ltPhone={ltPhone}
        setLtPhone={setLtPhone}
        ltTab={ltTab}
        setLtTab={setLtTab}
        setShowSuccessModal={setShowSuccessModal}
        showPostQuestionModal={showPostQuestionModal}
        setShowPostQuestionModal={setShowPostQuestionModal}
        handlePostQuestion={handlePostQuestion}
        questionTab={questionTab}
        setQuestionTab={setQuestionTab}
        questionText={questionText}
        setQuestionText={setQuestionText}
        questionName={questionName}
        setQuestionName={setQuestionName}
        questionCompany={questionCompany}
        setQuestionCompany={setQuestionCompany}
        questionPhone={questionPhone}
        setQuestionPhone={setQuestionPhone}
        questionEmail={questionEmail}
        setQuestionEmail={setQuestionEmail}
        showQuickViewModal={showQuickViewModal}
        setShowQuickViewModal={setShowQuickViewModal}
        showVariantModal={showVariantModal}
        setShowVariantModal={setShowVariantModal}
        showSuccessModal={showSuccessModal}
        showToast={showToast}
        setShowToast={setShowToast}
        imageZoomed={imageZoomed}
        setImageZoomed={setImageZoomed}
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
      />
    </div>
  )
}
