package com.quizplatform.backend.modules.quiz.domain.service;



import com.quizplatform.backend.modules.category.domain.entity.Category;
import com.quizplatform.backend.modules.category.domain.repository.CategoryRepository;
import com.quizplatform.backend.modules.quiz.domain.dto.QuizDto;
import com.quizplatform.backend.modules.quiz.domain.dto.QuizResponseDto;
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

    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll(); // yoki quizRepository.findByIsActiveTrue();
    }

    public List<Quiz> getQuizzesByCategory(Long categoryId) {
        return quizRepository.findByCategoryId(categoryId);
    }

    public QuizResponseDto.QuizPublicResponse getQuizById(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quiz topilmadi"));

        // 1. Kategoriya DTO ni yig'amiz
        QuizResponseDto.CategoryResponseDto categoryDto = null;
        if (quiz.getCategory() != null) {
            categoryDto = new QuizResponseDto.CategoryResponseDto();
            categoryDto.setId(quiz.getCategory().getId());
            categoryDto.setName(quiz.getCategory().getName());
            categoryDto.setDescription(quiz.getCategory().getDescription());
            categoryDto.setIconUrl(quiz.getCategory().getIconUrl());
        }

        // 2. Savollar va variantlarni DTO ga o'giramiz
        List<QuizResponseDto.QuestionPublicResponse> questionDtos = null;
        if (quiz.getQuestions() != null) {
            questionDtos = quiz.getQuestions().stream().map(q -> {
                QuizResponseDto.QuestionPublicResponse qDto = new QuizResponseDto.QuestionPublicResponse();
                qDto.setId(q.getId());
                qDto.setContent(q.getContent());
                qDto.setCodeSnippet(q.getCodeSnippet());
                qDto.setPoints(q.getPoints());

                if (q.getOptions() != null) {
                    List<QuizResponseDto.OptionPublicResponse> optionDtos = q.getOptions().stream().map(o -> {
                        QuizResponseDto.OptionPublicResponse oDto = new QuizResponseDto.OptionPublicResponse();
                        oDto.setId(o.getId());
                        oDto.setOptionText(o.getOptionText());
                        return oDto;
                    }).toList();
                    qDto.setOptions(optionDtos);
                }
                return qDto;
            }).toList();
        }

        // 3. Asosiy QuizPublicResponse ni to'ldirib qaytaramiz
        QuizResponseDto.QuizPublicResponse response = new QuizResponseDto.QuizPublicResponse();
        response.setId(quiz.getId());
        response.setTitle(quiz.getTitle());
        response.setDescription(quiz.getDescription());
        response.setDifficulty(quiz.getDifficulty());
        response.setTimeLimitMinutes(quiz.getTimeLimitMinutes());
        response.setPassingScore(quiz.getPassingScore());
        response.setCategory(categoryDto);
        response.setQuestions(questionDtos);

        return response;
    }

    @Transactional
    public void deleteQuiz(Long id) {
        quizRepository.deleteById(id);
    }
}
