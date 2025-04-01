import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';

const NewsletterSignup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([
          {
            name: formData.name,
            email: formData.email,
          },
        ]);

      if (error) {
        throw error;
      }

      setStatus('success');
      setFormData({ name: '', email: '' });
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(
        error.code === '23505' 
          ? 'This email is already subscribed to our newsletter.'
          : 'Something went wrong. Please try again.'
      );
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="py-6 px-8">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <span className="text-2xl font-bold text-gray-800">PodSieve</span>
        </Link>
      </header>
      
      <main className="flex-1 px-8 py-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-md p-8">
          <Link to="/" className="flex items-center gap-1 text-gray-600 mb-6 hover:underline">
            <ArrowLeft size={16} />
            <span>Back to home</span>
          </Link>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Stay Updated</h1>
          <p className="text-gray-600 mb-6">Sign up for our newsletter to get Weekly Insights from podcasts and to stay updated about our work.</p>
          
          {status === 'success' ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <CheckCircle2 size={48} className="text-green-500" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Thank you for subscribing!</h2>
                <p className="text-gray-600">You'll start receiving our newsletter updates soon.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="your.email@example.com"
                />
              </div>

              {status === 'error' && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}
              
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 px-4 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NewsletterSignup;