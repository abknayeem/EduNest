import React from 'react';
import { Button } from '@/components/ui/button';
import { Target, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { openDialog } from '@/features/instructorApplicationSlice';

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-md text-center">
    <div className="flex justify-center mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400">{description}</p>
  </div>
);

const Step = ({ number, title, description }) => (
    <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 font-bold text-xl">
            {number}
        </div>
        <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h4>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{description}</p>
        </div>
    </div>
);


const BecomeAnInstructor = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(store => store.auth);
  const handleGetStarted = () => {
    if (!isAuthenticated) {
      toast.error("You must be logged in as a student to apply.");
      navigate('/login');
      return;
    }
    if (user?.role === 'instructor' || user?.role === 'superadmin') {
      toast.info("You already have instructor access. Redirecting to your dashboard.");
      navigate('/admin/analytics');
      return;
    }
    if (user?.role === 'student') {
        if (user.instructorApplicationStatus === 'pending') {
            toast.info("Your application is already pending review.");
            return;
        }
        if (!user.bio) {
            toast.error("Please complete your bio on your profile page before applying.");
            navigate('/profile'); // Redirect to profile to fill bio
            return;
        }
        dispatch(openDialog());
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-[#020817]">
      <div className="text-center py-20 px-6 bg-blue-600 dark:bg-blue-800 text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Teach the Next Generation</h1>
        <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8">
          Share your expertise, help learners achieve their goals, and join a vibrant community of instructors on EduNest.
        </p>
        <Button onClick={handleGetStarted} size="lg" className="bg-white text-blue-600 hover:bg-gray-100 dark:bg-gray-200 dark:hover:bg-gray-300">
          Get Started Today
        </Button>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <section className="text-center mb-20">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">Why Teach on EduNest?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard
                icon={<Target size={40} className="text-blue-500" />}
                title="Make an Impact"
                description="Inspire students across the nation by sharing your knowledge and helping them advance their careers."
                />
                <FeatureCard
                icon={<TrendingUp size={40} className="text-green-500" />}
                title="Earn Revenue"
                description="Monetize your expertise. Earn money for every student who enrolls in your course."
                />
                <FeatureCard
                icon={<Users size={40} className="text-purple-500" />}
                title="Join Our Community"
                description="Become part of a network of passionate instructors and get the support you need to succeed."
                />
            </div>
        </section>

        <section>
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">How It Works</h2>
            <div className="max-w-2xl mx-auto space-y-8">
                <Step number="1" title="Plan Your Course" description="Choose your topic and structure your curriculum. We provide tools and resources to help you create a high-quality course." />
                <Step number="2" title="Record Your Video" description="Use simple recording tools to create engaging video lectures. No prior experience needed!" />
                <Step number="3" title="Launch & Earn" description="Publish your course on our platform and start earning revenue as students enroll and learn from you." />
            </div>
        </section>
      </div>
    </div>
  );
};

export default BecomeAnInstructor;