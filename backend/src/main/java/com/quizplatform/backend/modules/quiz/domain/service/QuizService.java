package com.quizplatform.backend.modules.quiz.domain.service;



import com.quizplatform.backend.modules.category.domain.entity.Category;
import com.quizplatform.backend.modules.category.domain.repository.CategoryRepository;
import com.quizplatform.backend.modules.quiz.domain.dto.QuizDto;
import com.quizplatform.backend.modules.quiz.domain.entity.Option;
import com.quizplatform.backend.modules.quiz.domain.entity.Question;
import com.quizplatform.backend.modules.quiz.domain.entity.Quiz;
import com.quizplatform.backend.modules.quiz.domain.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final CategoryRepository categoryRepository;

    @Transactional
    public Quiz createQuiz(QuizDto.QuizRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Kategoriya topilmadi"));

        Quiz quiz = Quiz.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(category)
                .difficulty(request.getDifficulty())
                .timeLimitMinutes(request.getTimeLimitMinutes())
                .passingScore(request.getPassingScore())
                .build();

        if (request.getQuestions() != null) {
            List<Question> questions = request.getQuestions().stream().map(qDto -> {
                Question question = Question.builder()
                        .content(qDto.getContent())
                        .codeSnippet(qDto.getCodeSnippet())
                        .points(qDto.getPoints())
                        .quiz(quiz)
                        .build();

                if (qDto.getOptions() != null) {
                    List<Option> options = qDto.getOptions().stream().map(oDto ->
                            Option.builder()
                                    .optionText(oDto.getOptionText())
                                    .isCorrect(oDto.getIsCorrect())
                                    .question(question)
                                    .build()
                    ).toList();
                    question.setOptions(options);
                }
                return question;
            }).toList();

            quiz.setQuestions(questions);
        }

        return quizRepository.save(quiz);
    }

    public List<Quiz> getQuizzesByCategory(Long categoryId) {
        return quizRepository.findByCategoryId(categoryId);
    }

    public Quiz getQuizById(Long id) {
        return quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quiz topilmadi"));
    }

    @Transactional
    public void deleteQuiz(Long id) {
        quizRepository.deleteById(id);
    }
}
