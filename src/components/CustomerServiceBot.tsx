import React, { useState } from 'react';

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "How can I track my order?",
    answer: "You can track your order in the 'My Orders' section of your profile. Once an order is placed, its status will be updated as it moves from 'Pending' to 'Delivered'."
  },
  {
    question: "What are the payment options?",
    answer: "We support Cash on Delivery (COD) and UPI payments for your convenience. You can select your preferred method during checkout."
  },
  {
    question: "Do you deliver to my area?",
    answer: "We currently deliver to all areas within the neighborhood. Please check if your pin code is within our service range during the checkout process."
  },
  {
    question: "How can I contact the store owner?",
    answer: "You can reach the store owner directly at +91 9876543210 or email us at support@gkshop.com for any urgent queries."
  },
  {
    question: "What is your return policy?",
    answer: "Returns are accepted within 24 hours of delivery for perishable items and 7 days for non-perishables, provided the items are in their original condition."
  }
];

const CustomerServiceBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 mb-4 flex flex-col overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-green-600 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <h3 className="font-bold">GK Shop Assistant</h3>
                <p className="text-xs text-green-100">Online | Always here to help</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setIsOpen(false);
                setSelectedFaq(null);
              }}
              className="hover:bg-green-700 p-1 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l18 18" />
              </svg>
            </button>
          </div>

          {/* Chat Content */}
          <div className="flex-1 p-4 max-h-[400px] overflow-y-auto bg-gray-50">
            {!selectedFaq ? (
              <div className="space-y-4">
                <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-800">Hello! 👋 I'm your GK Shop assistant. How can I help you today?</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">Common Questions</p>
                  {faqs.map((faq, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedFaq(faq)}
                      className="w-full text-left p-3 bg-white hover:bg-green-50 rounded-xl border border-gray-200 text-sm text-gray-700 transition-all hover:border-green-200 hover:shadow-md flex justify-between items-center group"
                    >
                      <span>{faq.question}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 group-hover:text-green-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <button 
                  onClick={() => setSelectedFaq(null)}
                  className="text-xs text-green-600 font-semibold hover:underline flex items-center gap-1 mb-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to questions
                </button>
                <div className="bg-green-600 text-white p-3 rounded-lg rounded-tr-none shadow-md ml-8">
                  <p className="text-sm">{selectedFaq.question}</p>
                </div>
                <div className="bg-white p-4 rounded-lg rounded-tl-none shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-800 leading-relaxed">{selectedFaq.answer}</p>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 text-center italic">Still need help? Contact us via phone or email.</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-white border-t border-gray-100">
            <p className="text-[10px] text-center text-gray-400">Powered by GK Shop Support</p>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 ${
          isOpen ? 'bg-gray-100 text-gray-600' : 'bg-green-600 text-white'
        }`}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </div>
        )}
      </button>
    </div>
  );
};

export default CustomerServiceBot;
