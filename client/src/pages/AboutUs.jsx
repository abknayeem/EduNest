import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { openDialog } from '@/features/instructorApplicationSlice';
import { School, TrendingUp, Users, Target } from 'lucide-react';

const InfoSection = ({ title, children }) => (
  <section className="mb-12">
    <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">{title}</h2>
    <div className="text-gray-600 dark:text-gray-400 space-y-4 text-center max-w-3xl mx-auto">
      {children}
    </div>
  </section>
);

const FeatureCard = ({ icon, title, description }) => (
    <div className="bg-white dark:bg-gray-800/50 p-8 rounded-lg shadow-lg text-center transform hover:scale-105 transition-transform duration-300">
      <div className="flex justify-center text-blue-600 dark:text-blue-400 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
);


const AboutUs = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(store => store.auth);

  const handleBecomeInstructor = () => {
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
        dispatch(openDialog());
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-[#020817]">
      <div className="text-center py-20 px-6 bg-blue-600 dark:bg-blue-800 text-white">
        <div className="flex justify-center items-center gap-4 mb-4">
            <School className="h-16 w-16" />
            <h1 className="text-5xl md:text-6xl font-bold">EduNest</h1>
        </div>
        <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8">
          Bangladesh's leading Upskilling & Job Placement Platform. We are here to help you discover, learn, and upskill with our wide range of courses.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <InfoSection title="Our Mission">
          <p className="text-lg">
            Our mission is to empower the next generation of professionals in Bangladesh. We bridge the gap between ambition and opportunity by providing accessible, high-quality education that leads to tangible career growth and job placement.
          </p>
        </InfoSection>

        <section className="mb-20">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">What We Offer</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard
                icon={<Target size={40} />}
                title="Impactful Learning"
                description="Inspire students across the nation by sharing your knowledge and helping them advance their careers and achieve their goals."
                />
                <FeatureCard
                icon={<TrendingUp size={40} />}
                title="Earn Revenue"
                description="Monetize your expertise. Our platform provides the tools to launch your course and earn money for every student who enrolls."
                />
                <FeatureCard
                icon={<Users size={40} />}
                title="A Vibrant Community"
                description="Join a passionate network of instructors and learners. Get the support you need to succeed and grow with us."
                />
            </div>
        </section>

        <InfoSection title="Our Vision">
             <p className="text-lg">
                We envision a skilled Bangladesh where every individual has the power to build a successful career. By being the most trusted upskilling platform, we aim to foster a culture of continuous learning, innovation, and professional excellence that drives the nation forward.
            </p>
        </InfoSection>

        <section className="text-center bg-white dark:bg-gray-800/50 p-10 rounded-lg shadow-xl">
             <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Join Us on Our Journey</h2>
             <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
                Whether you're looking to learn a new skill or share your knowledge with the world, EduNest is the place for you. Explore our courses or become an instructor today.
             </p>
             <div className="flex justify-center gap-4">
                <Button size="lg" onClick={() => navigate('/course/search?query=')}>Explore Courses</Button>
                <Button size="lg" variant="outline" onClick={handleBecomeInstructor}>Become an Instructor</Button>
             </div>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;