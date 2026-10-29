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

import java.util.ArrayList;
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
                .questions(new ArrayList<>())
                .build();

        if (request.getQuestions() != null) {
            for (QuizDto.QuestionRequest qDto : request.getQuestions()) {
                Question question = Question.builder()
                        .content(qDto.getContent())
                        .codeSnippet(qDto.getCodeSnippet())
                        .points(qDto.getPoints() != null ? qDto.getPoints() : 10)
                        .quiz(quiz)
                        .options(new ArrayList<>())
                        .build();

                if (qDto.getOptions() != null) {
                    for (QuizDto.OptionRequest oDto : qDto.getOptions()) {
                        Option option = Option.builder()
                                .optionText(oDto.getOptionText())
                                .isCorrect(Boolean.TRUE.equals(oDto.getIsCorrect()))
                                .question(question)
                                .build();
                        question.getOptions().add(option);
                    }
                }
                quiz.getQuestions().add(question);
            }
        }

        return quizRepository.save(quiz);
    }

    @Transactional
    public Quiz updateQuiz(Long id, QuizDto.QuizRequest request) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quiz topilmadi"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Kategoriya topilmadi"));

        quiz.setTitle(request.getTitle());
        quiz.setDescription(request.getDescription());
        quiz.setCategory(category);
        quiz.setDifficulty(request.getDifficulty());
        quiz.setTimeLimitMinutes(request.getTimeLimitMinutes());
        quiz.setPassingScore(request.getPassingScore());

        // Mavjud savollarni tozalab yangilarini qo'shamiz
        quiz.getQuestions().clear();

        if (request.getQuestions() != null) {
            for (QuizDto.QuestionRequest qDto : request.getQuestions()) {
                Question question = Question.builder()
                        .content(qDto.getContent())
                        .codeSnippet(qDto.getCodeSnippet())
                        .points(qDto.getPoints() != null ? qDto.getPoints() : 10)
                        .quiz(quiz)
                        .options(new ArrayList<>())
                        .build();

                if (qDto.getOptions() != null) {
                    for (QuizDto.OptionRequest oDto : qDto.getOptions()) {
                        Option option = Option.builder()
                                .optionText(oDto.getOptionText())
                                .isCorrect(Boolean.TRUE.equals(oDto.getIsCorrect()))
                                .question(question)
                                .build();
                        question.getOptions().add(option);
                    }
                }
                quiz.getQuestions().add(question);
            }
        }

        return quizRepository.save(quiz);
    }

    @Transactional(readOnly = true)
    public List<QuizResponseDto.QuizSummaryResponse> getAllQuizzes() {
        return quizRepository.findAll().stream()
                .map(this::mapToSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<QuizResponseDto.QuizSummaryResponse> getQuizzesByCategory(Long categoryId) {
        return quizRepository.findByCategoryId(categoryId).stream()
                .map(this::mapToSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public QuizResponseDto.QuizPublicResponse getQuizById(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quiz topilmadi"));

        QuizResponseDto.CategoryResponseDto categoryDto = mapCategory(quiz.getCategory());

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

        return QuizResponseDto.QuizPublicResponse.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .difficulty(quiz.getDifficulty())
                .timeLimitMinutes(quiz.getTimeLimitMinutes())
                .passingScore(quiz.getPassingScore())
                .category(categoryDto)
                .questions(questionDtos)
                .build();
    }

    @Transactional(readOnly = true)
    public QuizResponseDto.QuizAdminResponse getQuizForAdmin(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quiz topilmadi"));

        QuizResponseDto.CategoryResponseDto categoryDto = mapCategory(quiz.getCategory());

        List<QuizResponseDto.QuestionAdminResponse> questionDtos = null;
        if (quiz.getQuestions() != null) {
            questionDtos = quiz.getQuestions().stream().map(q -> {
                List<QuizResponseDto.OptionAdminResponse> optionDtos = null;
                if (q.getOptions() != null) {
                    optionDtos = q.getOptions().stream().map(o ->
                            QuizResponseDto.OptionAdminResponse.builder()
                                    .id(o.getId())
                                    .optionText(o.getOptionText())
                                    .isCorrect(o.getIsCorrect())
                                    .build()
                    ).toList();
                }

                return QuizResponseDto.QuestionAdminResponse.builder()
                        .id(q.getId())
                        .content(q.getContent())
                        .codeSnippet(q.getCodeSnippet())
                        .points(q.getPoints())
                        .options(optionDtos)
                        .build();
            }).toList();
        }

        return QuizResponseDto.QuizAdminResponse.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .difficulty(quiz.getDifficulty())
                .timeLimitMinutes(quiz.getTimeLimitMinutes())
                .passingScore(quiz.getPassingScore())
                .category(categoryDto)
                .questions(questionDtos)
                .build();
    }

    @Transactional
    public void deleteQuiz(Long id) {
        quizRepository.deleteById(id);
    }

    private QuizResponseDto.QuizSummaryResponse mapToSummary(Quiz quiz) {
        return QuizResponseDto.QuizSummaryResponse.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .difficulty(quiz.getDifficulty())
                .timeLimitMinutes(quiz.getTimeLimitMinutes())
                .passingScore(quiz.getPassingScore())
                .category(mapCategory(quiz.getCategory()))
                .questionsCount(quiz.getQuestions() != null ? quiz.getQuestions().size() : 0)
                .build();
    }

    private QuizResponseDto.CategoryResponseDto mapCategory(Category category) {
        if (category == null) return null;
        return QuizResponseDto.CategoryResponseDto.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .iconUrl(category.getIconUrl())
                .build();
    }
}
