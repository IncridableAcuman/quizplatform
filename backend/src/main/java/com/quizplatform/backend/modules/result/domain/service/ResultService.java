package com.quizplatform.backend.modules.result.domain.service;



import com.quizplatform.backend.modules.auth.domain.entity.User;
import com.quizplatform.backend.modules.auth.domain.repository.UserRepository;
import com.quizplatform.backend.modules.quiz.domain.entity.Option;
import com.quizplatform.backend.modules.quiz.domain.entity.Question;
import com.quizplatform.backend.modules.quiz.domain.entity.Quiz;
import com.quizplatform.backend.modules.quiz.domain.repository.QuizRepository;
import com.quizplatform.backend.modules.result.domain.dto.ResultDto;
import com.quizplatform.backend.modules.result.domain.entity.Result;
import com.quizplatform.backend.modules.result.domain.repository.ResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ResultService {

    private final QuizRepository quizRepository;
    private final ResultRepository resultRepository;
    private final UserRepository userRepository;

    @Transactional
    public Result submitQuiz(String username, ResultDto.SubmitQuizRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Foydalanuvchi topilmadi"));

        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new RuntimeException("Quiz topilmadi"));

        int correctAnswersCount = 0;
        int earnedScore = 0;

        Map<Long, Long> userAnswers = request.getAnswers();

        for (Question question : quiz.getQuestions()) {
            Long selectedOptionId = userAnswers.get(question.getId());

            if (selectedOptionId != null) {
                boolean isCorrect = question.getOptions().stream()
                        .filter(Option::getIsCorrect)
                        .anyMatch(opt -> opt.getId().equals(selectedOptionId));

                if (isCorrect) {
                    correctAnswersCount++;
                    earnedScore += question.getPoints();
                }
            }
        }

        int totalQuestions = quiz.getQuestions().size();
        double percentage = totalQuestions > 0 ? ((double) correctAnswersCount / totalQuestions) * 100 : 0;
        boolean isPassed = percentage >= quiz.getPassingScore();

        // Foydalanuvchining umumiy ballini oshiramiz
        user.setTotalScore(user.getTotalScore() + earnedScore);
        userRepository.save(user);

        Result result = Result.builder()
                .user(user)
                .quiz(quiz)
                .score(earnedScore)
                .totalQuestions(totalQuestions)
                .correctAnswers(correctAnswersCount)
                .timeTakenSeconds(request.getTimeTakenSeconds())
                .isPassed(isPassed)
                .build();

        return resultRepository.save(result);
    }

    public Result getResultById(Long resultId) {
        return resultRepository.findById(resultId)
                .orElseThrow(() -> new RuntimeException("Natija topilmadi"));
    }

    public List<Result> getUserResults(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Foydalanuvchi topilmadi"));
        return resultRepository.findByUserId(user.getId());
    }
}
