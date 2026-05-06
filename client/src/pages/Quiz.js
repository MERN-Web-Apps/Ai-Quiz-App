import axiosApi from '../utils/axiosApi';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
function Quiz(){
    const [quiz, setQuiz] = useState(null);
    const { quizCode } = useParams();
    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await axiosApi.get(`quiz/${quizCode}`);
                setQuiz(response.data);
            } catch (error) {
                console.error("Error fetching quiz:", error);
            }
        };
        fetchQuiz();
    }, [quizCode]);
    JSON.stringify(quiz, null, 2);
    return (
        <div>
            <h1>Quiz Page</h1>
            <h2>
                quiz: {JSON.stringify(quiz, null, 2)}
            </h2>
        </div>
    )
}
export default Quiz;