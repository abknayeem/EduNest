import React, { useState } from 'react';
import { useGetQuestionsQuery, useAddQuestionMutation, useAddAnswerMutation } from '@/features/api/qnaApi';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

const QuestionItem = ({ question, courseId, lectureId }) => {
    const [showAnswerForm, setShowAnswerForm] = useState(false);
    const [answerContent, setAnswerContent] = useState('');
    const [addAnswer, { isLoading }] = useAddAnswerMutation();
    const { user: currentUser } = useSelector((state) => state.auth);

    const handlePostAnswer = () => {
        if (!answerContent.trim()) return;
        addAnswer({ questionId: question._id, content: answerContent, lectureId }).unwrap()
            .then(() => {
                setAnswerContent('');
                setShowAnswerForm(false);
                toast.success("Answer posted!");
            })
            .catch(() => toast.error("Failed to post answer."));
    };

    return (
        <div className="p-4 border-t">
            <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={question.user.photoUrl} alt={question.user.name} />
                    <AvatarFallback>{question.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{question.title}</p>
                    <p className="text-sm text-muted-foreground">by {question.user.name}</p>
                    {question.content && <p className="mt-2 text-sm">{question.content}</p>}
                </div>
            </div>

            <div className="pl-12 mt-4 space-y-4">
                {question.answers.map(answer => (
                    <div key={answer._id} className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={answer.user.photoUrl} alt={answer.user.name} />
                            <AvatarFallback>{answer.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-semibold">
                                {answer.user.name}
                                {answer.user.role === 'instructor' && <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Instructor</span>}
                            </p>
                            <p className="text-sm">{answer.content}</p>
                        </div>
                    </div>
                ))}
                
                <Button variant="link" className="p-0 h-auto text-xs" onClick={() => setShowAnswerForm(!showAnswerForm)}>
                    {showAnswerForm ? 'Cancel' : 'Reply'}
                </Button>

                {showAnswerForm && (
                     <div className="flex items-center gap-2">
                        <Textarea 
                            value={answerContent}
                            onChange={(e) => setAnswerContent(e.target.value)}
                            placeholder="Write your answer..."
                            className="text-sm"
                        />
                        <Button onClick={handlePostAnswer} disabled={isLoading} size="icon">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

const QnaSection = ({ lectureId, courseId }) => {
    const { data, isLoading, isError } = useGetQuestionsQuery(lectureId, {
        skip: !lectureId,
    });
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [addQuestion, { isLoading: isAddingQuestion }] = useAddQuestionMutation();

    const handleAskQuestion = () => {
        if (!title.trim()) {
            toast.error("Please enter a question title.");
            return;
        }
        addQuestion({ lectureId, courseId, title, content }).unwrap()
            .then(() => {
                setTitle('');
                setContent('');
                toast.success("Your question has been posted.");
            })
            .catch(() => toast.error("Failed to post question."));
    };
    
    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Questions & Answers</h2>
            <div className="p-4 border rounded-lg mb-6 space-y-3">
                 <Input 
                    placeholder="Question title..." 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                 />
                 <Textarea 
                    placeholder="Elaborate on your question (optional)..." 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                 <Button onClick={handleAskQuestion} disabled={isAddingQuestion}>
                     {isAddingQuestion && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                     Ask Question
                 </Button>
            </div>
            {isLoading && <div className="text-center p-4"><Loader2 className="h-8 w-8 animate-spin" /></div>}
            {isError && <p className="text-red-500">Could not load questions.</p>}
            {data?.questions.length === 0 && <p>Be the first to ask a question!</p>}
            {data?.questions.map(q => <QuestionItem key={q._id} question={q} courseId={courseId} lectureId={lectureId} />)}
        </div>
    );
};

export default QnaSection;