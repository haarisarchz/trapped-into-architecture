const fs = require('fs');
let content = fs.readFileSync('app/contact/page.tsx', 'utf8');

// 1. Add BrandIcons import
if (!content.includes('import { WhatsAppBrandIcon')) {
  content = content.replace('import { Phone, Mail, MessageCircle, MapPin, Globe, } from "lucide-react";', 
  `import { Phone, Mail, MessageCircle, MapPin, Globe, } from "lucide-react";\nimport { WhatsAppBrandIcon, FacebookBrandIcon, LinkedInBrandIcon, TelegramBrandIcon, XBrandIcon, InstagramBrandIcon } from "@/components/icons/BrandIcons";`);
}

// 2. Replace short-form text with Brand Icons
content = content.replace(/<span className="font-bold">FB<\/span>/g, '<FacebookBrandIcon size={24} />');
content = content.replace(/<span className="font-bold">X<\/span>/g, '<XBrandIcon size={24} />');
content = content.replace(/<span className="font-bold">IG<\/span>/g, '<InstagramBrandIcon size={24} />');
content = content.replace(/<span className="font-bold">IN<\/span>/g, '<LinkedInBrandIcon size={24} />');

// 3. Fix the contact form
const oldFormStart = content.indexOf('<form onSubmit={handleSubmit} className="space-y-4">');
if (oldFormStart !== -1) {
  const oldFormEnd = content.indexOf('</form>', oldFormStart) + 7;
  
  const newForm = `<form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-black outline-none" 
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                  <input 
                    required
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-black outline-none" 
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject <span className="text-red-500">*</span></label>
                  <input 
                    required
                    type="text" 
                    value={formData.subject || ""}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-black outline-none" 
                    placeholder="How can we help you?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-black outline-none" 
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message <span className="text-red-500">*</span></label>
                <textarea 
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-black outline-none resize-none" 
                  placeholder="Write your message here..."
                />
              </div>

              <button 
                type="submit" 
                disabled={status === 'submitting'}
                className="w-full bg-black text-white rounded-xl py-3.5 font-bold hover:bg-gray-800 transition disabled:opacity-50"
              >
                {status === 'submitting' ? 'Sending...' : 'Send Message'}
              </button>
              
              {status === 'success' && (
                <div className="p-4 bg-green-50 text-green-700 rounded-xl text-center font-medium">
                  Message sent successfully!
                </div>
              )}
            </form>`;

  content = content.substring(0, oldFormStart) + newForm + content.substring(oldFormEnd);
}

// 4. Update the state to include subject
if (!content.includes('subject: ""')) {
  content = content.replace(/name: "",\s*email: "",\s*phone: "",\s*message: ""/g, 'name: "", email: "", phone: "", subject: "", message: ""');
}

fs.writeFileSync('app/contact/page.tsx', content);
console.log("Updated contact form successfully");