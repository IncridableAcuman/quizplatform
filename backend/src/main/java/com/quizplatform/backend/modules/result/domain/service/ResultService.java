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

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ResultService {

    private final QuizRepository quizRepository;
    private final ResultRepository resultRepository;
    private final UserRepository userRepository;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Transactional
    public ResultDto.QuizResultResponse submitQuiz(String username, ResultDto.SubmitQuizRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Foydalanuvchi topilmadi"));

        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new RuntimeException("Quiz topilmadi"));

        int correctAnswersCount = 0;
        int earnedScore = 0;

        Map<Long, Long> userAnswers = request.getAnswers() != null ? request.getAnswers() : Map.of();

        if (quiz.getQuestions() != null) {
            for (Question question : quiz.getQuestions()) {
                Long selectedOptionId = userAnswers.get(question.getId());

                if (selectedOptionId != null && question.getOptions() != null) {
                    boolean isCorrect = question.getOptions().stream()
                            .filter(opt -> Boolean.TRUE.equals(opt.getIsCorrect()))
                            .anyMatch(opt -> opt.getId().equals(selectedOptionId));

                    if (isCorrect) {
                        correctAnswersCount++;
                        earnedScore += (question.getPoints() != null ? question.getPoints() : 10);
                    }
                }
            }
        }

        int totalQuestions = quiz.getQuestions() != null ? quiz.getQuestions().size() : 0;
        double percentage = totalQuestions > 0 ? Math.round(((double) correctAnswersCount / totalQuestions) * 1000.0) / 10.0 : 0.0;
        boolean isPassed = percentage >= (quiz.getPassingScore() != null ? quiz.getPassingScore() : 60);

        // Foydalanuvchining umumiy ballini oshiramiz
        int currentScore = user.getTotalScore() != null ? user.getTotalScore() : 0;
        user.setTotalScore(currentScore + earnedScore);
        userRepository.save(user);

        Result result = Result.builder()
                .user(user)
                .quiz(quiz)
                .score(earnedScore)
                .totalQuestions(totalQuestions)
                .correctAnswers(correctAnswersCount)
                .timeTakenSeconds(request.getTimeTakenSeconds())
                .isPassed(isPassed)
                .completedAt(LocalDateTime.now())
                .build();

        Result saved = resultRepository.save(result);

        String categoryName = quiz.getCategory() != null ? quiz.getCategory().getName() : "Umumiy";

        return ResultDto.QuizResultResponse.builder()
                .id(saved.getId())
                .resultId(saved.getId())
                .quizId(quiz.getId())
                .quizTitle(quiz.getTitle())
                .categoryName(categoryName)
                .totalQuestions(totalQuestions)
                .correctAnswers(correctAnswersCount)
                .score(earnedScore)
                .timeTakenSeconds(saved.getTimeTakenSeconds())
                .timeSpentSeconds(saved.getTimeTakenSeconds())
                .isPassed(isPassed)
                .passed(isPassed)
                .percentage(percentage)
                .completedAt(saved.getCompletedAt() != null ? saved.getCompletedAt().format(FORMATTER) : LocalDateTime.now().format(FORMATTER))
                .build();
    }

    @Transactional(readOnly = true)
    public Result getResultById(Long resultId) {
        return resultRepository.findById(resultId)
                .orElseThrow(() -> new RuntimeException("Natija topilmadi"));
    }

    @Transactional(readOnly = true)
    public List<ResultDto.ResultHistoryResponse> getUserResults(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Foydalanuvchi topilmadi"));

        List<Result> results = resultRepository.findByUserIdOrderByCompletedAtDesc(user.getId());

        return results.stream().map(r -> {
            Quiz q = r.getQuiz();
            String quizTitle = q != null ? q.getTitle() : "Quiz";
            String categoryName = (q != null && q.getCategory() != null) ? q.getCategory().getName() : "Umumiy";
            int totalQ = r.getTotalQuestions() != null ? r.getTotalQuestions() : 0;
            int correctQ = r.getCorrectAnswers() != null ? r.getCorrectAnswers() : 0;
            double pct = totalQ > 0 ? Math.round(((double) correctQ / totalQ) * 1000.0) / 10.0 : 0.0;
            boolean passed = Boolean.TRUE.equals(r.getIsPassed());

            return ResultDto.ResultHistoryResponse.builder()
                    .id(r.getId())
                    .quizId(q != null ? q.getId() : null)
                    .quizTitle(quizTitle)
                    .categoryName(categoryName)
                    .score(r.getScore() != null ? r.getScore() : 0)
                    .totalQuestions(totalQ)
                    .correctAnswers(correctQ)
                    .percentage(pct)
                    .passed(passed)
                    .isPassed(passed)
                    .completedAt(r.getCompletedAt() != null ? r.getCompletedAt().format(FORMATTER) : "")
                    .timeSpentSeconds(r.getTimeTakenSeconds() != null ? r.getTimeTakenSeconds() : 0)
                    .timeTakenSeconds(r.getTimeTakenSeconds() != null ? r.getTimeTakenSeconds() : 0)
                    .build();
        }).toList();
    }
}
