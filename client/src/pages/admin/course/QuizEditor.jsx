import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import {
  useGetQuizByCourseQuery,
  useSaveQuizMutation,
} from "@/features/api/quizApi";
import { Loader2, PlusCircle, Trash2, ArrowLeft } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

const QuizEditor = () => {
  const { courseId } = useParams();
  const { data: quizData, isLoading: isQuizLoading } =
    useGetQuizByCourseQuery(courseId);
  const [saveQuiz, { isLoading: isSaving }] = useSaveQuizMutation();

  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [timeLimit, setTimeLimit] = useState(0);
  const [passingScore, setPassingScore] = useState(70);

  useEffect(() => {
    if (quizData?.quiz) {
      setTitle(quizData.quiz.title);
      setTimeLimit(quizData.quiz.timeLimit || 0);
      setPassingScore(quizData.quiz.passingScore || 70);
      setQuestions(quizData.quiz.questions.map((q) => ({ ...q, id: q._id })));
    } else {
      setTitle("Final Quiz");
      setQuestions([]);
    }
  }, [quizData]);

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { questionText: "", options: ["", "", "", ""], correctAnswer: "" },
    ]);
  };

  const handleRemoveQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const handleSaveQuiz = async () => {
    if (
      questions.some(
        (q) => !q.questionText || q.options.some((o) => !o) || !q.correctAnswer
      )
    ) {
      toast.error("Please fill out all fields for every question.");
      return;
    }

    const quizPayload = {
      title,
      timeLimit: Number(timeLimit),
      passingScore: Number(passingScore),
      questions: questions.map(({ id, ...rest }) => rest),
    };

    toast.promise(saveQuiz({ courseId, quizData: quizPayload }).unwrap(), {
      loading: "Saving quiz...",
      success: "Quiz saved successfully!",
      error: (err) => err.data?.message || "Failed to save quiz.",
    });
  };

  if (isQuizLoading) return <LoadingSpinner />;

  return (
    <div>
      <Link
        to={`/admin/course/${courseId}`}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Course Editor
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Quiz Editor</CardTitle>
          <CardDescription>
            Create and manage the quiz for this course. Click "Save Quiz" when
            you are done.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="quiz-title">Quiz Title</Label>
              <Input
                id="quiz-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time-limit">Time Limit (in minutes)</Label>
              <Input
                id="time-limit"
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                placeholder="0 for no limit"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passing-score">Passing Score (%)</Label>
              <Input
                id="passing-score"
                type="number"
                value={passingScore}
                onChange={(e) => setPassingScore(e.target.value)}
                placeholder="e.g., 70"
              />
            </div>
          </div>

          {questions.map((q, qIndex) => (
            <Card key={qIndex} className="p-4 bg-gray-50 dark:bg-gray-900/50">
              <CardHeader className="flex flex-row items-center justify-between p-2">
                <CardTitle className="text-lg">Question {qIndex + 1}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveQuestion(qIndex)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 p-2">
                <Input
                  placeholder="e.g., What is the capital of Bangladesh?"
                  value={q.questionText}
                  onChange={(e) =>
                    handleQuestionChange(qIndex, "questionText", e.target.value)
                  }
                />
                <div>
                  <Label>Options (Select the correct answer)</Label>
                  <RadioGroup
                    value={q.correctAnswer}
                    onValueChange={(value) =>
                      handleQuestionChange(qIndex, "correctAnswer", value)
                    }
                    className="mt-2 space-y-2"
                  >
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <RadioGroupItem
                          value={opt}
                          id={`q${qIndex}o${oIndex}`}
                        />
                        <Input
                          placeholder={`Option ${oIndex + 1}`}
                          value={opt}
                          onChange={(e) =>
                            handleOptionChange(qIndex, oIndex, e.target.value)
                          }
                        />
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button variant="outline" onClick={handleAddQuestion}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Question
          </Button>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveQuiz} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Quiz
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuizEditor;
