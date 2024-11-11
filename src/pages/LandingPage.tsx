import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Calendar, Users, Award, ArrowRight, Mail, LogIn } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleContact = () => {
    // Implement contact functionality
    console.log('Contact clicked');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-end gap-4">
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={handleContact}
            >
              <Mail className="h-4 w-4" />
              Contact
            </Button>
            <Button
              variant="default"
              className="flex items-center gap-2"
              onClick={handleLogin}
            >
              <LogIn className="h-4 w-4" />
              Login
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="container mx-auto px-6 py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Southern Minnesota Science Fair
              </h1>
              <p className="text-xl text-blue-100">
                Empowering young minds to explore, discover, and innovate
                through science.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="secondary"
                  size="lg"
                  className="flex items-center gap-2"
                  onClick={handleLogin}
                >
                  <LogIn className="h-5 w-5" />
                  Login
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2 border-white text-white hover:text-white"
                  onClick={handleContact}
                >
                  <Mail className="h-5 w-5" />
                  Contact Us
                </Button>
              </div>
            </div>

            <Card className="bg-white/10 backdrop-blur-sm border-0">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold mb-6 text-white">
                  Upcoming Fair
                </h3>
                <div className="space-y-4 text-white">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5" />
                    <span>March 15-17, 2025</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5" />
                    <span>200+ Projects Expected</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5" />
                    <span>$10,000 in Prizes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">
            Why Use Our Platform?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of students, teachers, and judges in making this
            year's science fair the best one yet.
          </p>
          <Button
            variant="secondary"
            size="lg"
            className="flex items-center gap-2"
            onClick={handleLogin}
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <div className="space-y-2">
                <p>Email: contact@southernmnsciencefair.org</p>
                <p>Phone: (555) 123-4567</p>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Important Dates</h3>
              <div className="space-y-2">
                <p>Registration Opens: January 1, 2025</p>
                <p>Project Submission: February 28, 2025</p>
                <p>Fair Dates: March 15-17, 2025</p>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <button className="hover:text-white transition-colors">
                  About Us
                </button>
                <button className="hover:text-white transition-colors">
                  Rules & Guidelines
                </button>
                <button className="hover:text-white transition-colors">
                  Resources
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p>
              &copy; 2024 Southern Minnesota Science Fair. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Features data
const features = [
  {
    icon: <Users className="h-6 w-6 text-blue-600" />,
    title: 'Easy Registration',
    description:
      'Simple online registration process for students, teachers, and judges. Get started in minutes.',
  },
  {
    icon: <Calendar className="h-6 w-6 text-blue-600" />,
    title: 'Project Management',
    description:
      'Track submissions, manage deadlines, and communicate with participants all in one place.',
  },
  {
    icon: <Award className="h-6 w-6 text-blue-600" />,
    title: 'Fair Day Support',
    description:
      'Digital scoring system, real-time updates, and comprehensive event management tools.',
  },
];

// Statistics data
const stats = [
  { value: '500+', label: 'Annual Participants' },
  { value: '50+', label: 'Partner Schools' },
  { value: '100+', label: 'Volunteer Judges' },
  { value: '$10K', label: 'In Prizes' },
];

export default LandingPage;
