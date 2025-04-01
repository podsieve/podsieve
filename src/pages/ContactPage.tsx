import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';

const MAX_MESSAGE_LENGTH = 300;

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general', // Default to General Inquiry
    message: '',
  });
  
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // For message field, enforce character limit
    if (name === 'message' && value.length > MAX_MESSAGE_LENGTH) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubjectChange = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subject
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    
    try {
      // Submit to Supabase
      const { error } = await supabase
        .from('contact_messages')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message
          }
        ]);
        
      if (error) {
        throw error;
      }
      
      // On success
      setFormStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: 'general',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setFormStatus('error');
      setErrorMessage('Something went wrong. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="w-full h-[1px] border-0 border-b border-dashed border-gray-200" />
      
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Contact Us</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Have questions or feedback? Send an email to <a href="mailto:contact@podsieve.com" className="text-gray-900 font-medium hover:underline">contact@podsieve.com</a> or use the form below.
          </p>
          
          <div className="w-full h-[1px] border-0 border-b border-dashed border-gray-200 mb-4" />
          
          {/* Centered Contact Form */}
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Send Us a Message</h2>
              
              {formStatus === 'success' ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank You!</h3>
                  <p className="text-gray-600 mb-6">Your message has been sent successfully.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400"
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleSubjectChange('general')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors 
                          ${formData.subject === 'general' 
                            ? 'bg-gray-900 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        General Inquiry
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleSubjectChange('podcast-request')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors 
                          ${formData.subject === 'podcast-request' 
                            ? 'bg-gray-900 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        Podcast Addition Request
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleSubjectChange('other')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors 
                          ${formData.subject === 'other' 
                            ? 'bg-gray-900 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        Other
                      </button>
                    </div>
                    <input type="hidden" name="subject" value={formData.subject} />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message <span className="text-gray-500 text-xs">({formData.message.length}/{MAX_MESSAGE_LENGTH})</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={4}
                      maxLength={MAX_MESSAGE_LENGTH}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400"
                      placeholder="Type here..."
                    ></textarea>
                  </div>
                  
                  {formStatus === 'error' && (
                    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                      <AlertCircle className="w-5 h-5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={formStatus === 'submitting'}
                    className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {formStatus === 'submitting' ? (
                      <>Sending...</>
                    ) : (
                      <>
                        Send Message
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <div className="w-full h-[1px] border-0 border-b border-dashed border-gray-200" />
      
      <Footer />
    </div>
  );
};

export default ContactPage;