import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useGetQuizForStudentQuery, useSubmitQuizMutation } from '@/features/api/quizApi';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from 'sonner';
import { Loader2, Timer } from 'lucide-react';

const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const QuizTaker = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { data: quizData, isLoading, isError } = useGetQuizForStudentQuery(courseId);
    const [submitQuiz, { isLoading: isSubmitting }] = useSubmitQuizMutation();
    
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(null);
    const timerRef = useRef(null);

    useEffect(() => {
        if (quizData?.quiz?.timeLimit > 0) {
            setTimeLeft(quizData.quiz.timeLimit * 60);
        }
    }, [quizData]);

    const handleSubmit = React.useCallback(async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        
        toast.promise(submitQuiz({ courseId, answers }).unwrap(), {
            loading: 'Submitting your answers...',
            success: (result) => {
                navigate(`/quiz/result/${result.attemptId}`);
                return "Quiz submitted successfully!";
            },
            error: 'Failed to submit quiz.'
        });
    }, [answers, courseId, navigate, submitQuiz]);
    
    useEffect(() => {
        if (timeLeft === null) return;

        if (timeLeft === 0) {
            toast.error("Time's up! Submitting your quiz automatically.");
            handleSubmit();
            return;
        }

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [timeLeft, handleSubmit]);

    const handleAnswerChange = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    if (isLoading) return <LoadingSpinner />;
    if (isError || !quizData?.quiz) return <div className="text-center p-10"><h2>Quiz not found or could not be loaded.</h2></div>;
    
    const { quiz } = quizData;

    return (
        <div className="max-w-4xl mx-auto my-8 p-4">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl">{quiz.title}</CardTitle>
                            <CardDescription>Answer all questions to the best of your ability.</CardDescription>
                        </div>
                        {quiz.timeLimit > 0 && (
                            <div className="flex items-center gap-2 font-mono text-lg p-2 bg-muted rounded-md">
                                <Timer size={20} />
                                <span>{formatTime(timeLeft)}</span>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-8">
                    {quiz.questions.map((question, index) => (
                        <div key={question._id} className="p-4 border-t">
                            <p className="font-semibold text-lg">{index + 1}. {question.questionText}</p>
                            <RadioGroup onValueChange={(value) => handleAnswerChange(question._id, value)} className="mt-4 space-y-2">
                                {question.options.map((option, oIndex) => (
                                    <div key={oIndex} className="flex items-center space-x-3">
                                        <RadioGroupItem value={option} id={`q${index}o${oIndex}`} />
                                        <Label htmlFor={`q${index}o${oIndex}`} className="font-normal">{option}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    ))}
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Quiz
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default QuizTaker;