package com.quizplatform.backend.config;

import com.quizplatform.backend.modules.auth.domain.entity.User;
import com.quizplatform.backend.modules.auth.domain.entity.enums.Role;
import com.quizplatform.backend.modules.auth.domain.repository.UserRepository;
import com.quizplatform.backend.modules.category.domain.entity.Category;
import com.quizplatform.backend.modules.category.domain.repository.CategoryRepository;
import com.quizplatform.backend.modules.quiz.domain.entity.Option;
import com.quizplatform.backend.modules.quiz.domain.entity.Question;
import com.quizplatform.backend.modules.quiz.domain.entity.Quiz;
import com.quizplatform.backend.modules.quiz.domain.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final QuizRepository quizRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        try {
            seedUsers();
            seedCategoriesAndQuizzes();
        } catch (Exception e) {
            log.warn("Boshlang'ich ma'lumotlar bilan ishlashda ogohlantirish: {}", e.getMessage());
        }
    }

    private void seedUsers() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@quizplatform.uz")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("Bosh Administrator")
                    .role(Role.ADMIN)
                    .totalScore(450)
                    .build();
            userRepository.save(admin);
            log.info("Default admin yaratildi: admin / admin123");
        }

        if (!userRepository.existsByUsername("user")) {
            User user = User.builder()
                    .username("user")
                    .email("user@quizplatform.uz")
                    .password(passwordEncoder.encode("user123"))
                    .fullName("Izzatbek Qodirov")
                    .role(Role.USER)
                    .totalScore(320)
                    .build();
            userRepository.save(user);
            log.info("Default user yaratildi: user / user123");
        }

        if (!userRepository.existsByUsername("anvar_dev")) {
            User user2 = User.builder()
                    .username("anvar_dev")
                    .email("anvar@quizplatform.uz")
                    .password(passwordEncoder.encode("user123"))
                    .fullName("Anvar Toshmatov")
                    .role(Role.USER)
                    .totalScore(280)
                    .build();
            userRepository.save(user2);
        }

        if (!userRepository.existsByUsername("dilnoza_js")) {
            User user3 = User.builder()
                    .username("dilnoza_js")
                    .email("dilnoza@quizplatform.uz")
                    .password(passwordEncoder.encode("user123"))
                    .fullName("Dilnoza Rahimova")
                    .role(Role.USER)
                    .totalScore(240)
                    .build();
            userRepository.save(user3);
        }
    }

    private void seedCategoriesAndQuizzes() {
        if (quizRepository.count() > 0) {
            return;
        }

        // 1. Kategoriyalar
        Category javaCat = categoryRepository.save(Category.builder()
                .name("Java & Spring Boot")
                .description("Java Core, OOP, Multithreading, Spring Framework va Microservicelar")
                .iconUrl("coffee")
                .build());

        Category reactCat = categoryRepository.save(Category.builder()
                .name("React & Frontend")
                .description("React 19, TypeScript, Hooks, State Management va Tailwind CSS")
                .iconUrl("code")
                .build());

        Category dbCat = categoryRepository.save(Category.builder()
                .name("SQL & Ma'lumotlar Bazasi")
                .description("PostgreSQL, Indexlar, Tranzaksiyalar, Query optimizatsiyasi")
                .iconUrl("database")
                .build());

        // 2. Quiz 1: Java Core
        Quiz quizJava = Quiz.builder()
                .title("Java Core: OOP va Asosiy Tushunchalar")
                .description("Java dasturlash tilining asosiy ustunlari: Encapsulation, Inheritance, Polymorphism va Abstraction bo'yicha bilimlarni sinash.")
                .category(javaCat)
                .difficulty(Quiz.Difficulty.MEDIUM)
                .timeLimitMinutes(15)
                .passingScore(60)
                .questions(new ArrayList<>())
                .build();

        addQuestion(quizJava,
                "Quyidagi Java kodining natijasi nima bo'ladi?",
                "String s1 = \"Quiz\";\nString s2 = new String(\"Quiz\");\nSystem.out.println(s1 == s2);",
                List.of(
                        new OptionData("true", false),
                        new OptionData("false", true),
                        new OptionData("NullPointerException", false),
                        new OptionData("Kompilyatsiya xatoligi", false)
                ), 10);

        addQuestion(quizJava,
                "Java'da qaysi kalit so'z o'zgaruvchini multithreading muhitida keshdan emas, to'g'ridan-to'g'ri asosiy xotiradan (main memory) o'qilishini ta'minlaydi?",
                null,
                List.of(
                        new OptionData("synchronized", false),
                        new OptionData("transient", false),
                        new OptionData("volatile", true),
                        new OptionData("final", false)
                ), 10);

        addQuestion(quizJava,
                "Spring Boot'da `@RestController` annotatsiyasi qaysi ikkita annotatsiya birikmasidan iborat?",
                null,
                List.of(
                        new OptionData("@Controller va @ResponseBody", true),
                        new OptionData("@Component va @Service", false),
                        new OptionData("@Controller va @Autowired", false),
                        new OptionData("@Service va @ResponseBody", false)
                ), 10);

        addQuestion(quizJava,
                "Java Collection Framework'da qaysi to'plam elementlarning takrorlanmasligini va ularning qo'shilish tartibini saqlaydi?",
                null,
                List.of(
                        new OptionData("HashSet", false),
                        new OptionData("TreeSet", false),
                        new OptionData("LinkedHashSet", true),
                        new OptionData("ArrayList", false)
                ), 10);

        quizRepository.save(quizJava);

        // 3. Quiz 2: React
        Quiz quizReact = Quiz.builder()
                .title("Modern React & TypeScript Testi")
                .description("React 19 imkoniyatlari, custom hooklar, re-render optimizatsiyasi va TypeScript tiplari.")
                .category(reactCat)
                .difficulty(Quiz.Difficulty.HARD)
                .timeLimitMinutes(12)
                .passingScore(70)
                .questions(new ArrayList<>())
                .build();

        addQuestion(quizReact,
                "React'da `useCallback` hooki nima vazifani bajaradi?",
                null,
                List.of(
                        new OptionData("Hisoblash natijasini (qiymatni) eslab qoladi", false),
                        new OptionData("Funksiya havolasini (reference) qayta yaratilishdan himoya qilib kesholaydi", true),
                        new OptionData("Komponent DOM ga chizilganda yon ta'sirlarni chaqiradi", false),
                        new OptionData("Global state'ni boshqaradi", false)
                ), 10);

        addQuestion(quizReact,
                "Quyidagi TypeScript kodi qanday natija beradi?",
                "type Status = 'PENDING' | 'SUCCESS';\nconst val: Status = 'FAILED';",
                List.of(
                        new OptionData("Hech qanday xatolik bermaydi", false),
                        new OptionData("Type '\"FAILED\"' is not assignable to type 'Status' kompilyatsiya xatosi", true),
                        new OptionData("Runtime Error", false),
                        new OptionData("val qiymati undefined bo'ladi", false)
                ), 10);

        addQuestion(quizReact,
                "React'da komponentning keraksiz qayta chizilishining (re-render) eng asosiy sababi nima?",
                null,
                List.of(
                        new OptionData("State yoki Props havolasining (reference) o'zgarishi", true),
                        new OptionData("Komponent nomining katta harf bilan yozilishi", false),
                        new OptionData("CSS klasslarining yangilanishi", false),
                        new OptionData("Brauzer oynasi o'lchami o'zgarishi", false)
                ), 10);

        quizRepository.save(quizReact);

        // 4. Quiz 3: PostgreSQL
        Quiz quizSql = Quiz.builder()
                .title("PostgreSQL & SQL Query Performance")
                .description("Relyatsion ma'lumotlar bazalarida indekslar, JOIN turlari va so'rov optimizatsiyasi.")
                .category(dbCat)
                .difficulty(Quiz.Difficulty.EASY)
                .timeLimitMinutes(10)
                .passingScore(50)
                .questions(new ArrayList<>())
                .build();

        addQuestion(quizSql,
                "Qaysi SQL buyrug'i jadvaldagi barcha qatorlarni o'chiradi va AUTO_INCREMENT hisoblagichini nolga qaytaradi?",
                null,
                List.of(
                        new OptionData("DELETE FROM users;", false),
                        new OptionData("DROP TABLE users;", false),
                        new OptionData("TRUNCATE TABLE users;", true),
                        new OptionData("ALTER TABLE users CLEAR;", false)
                ), 10);

        addQuestion(quizSql,
                "B-Tree indeksi qaysi operatorlar bilan ishlaganda eng yuqori samaradorlik ko'rsatadi?",
                null,
                List.of(
                        new OptionData("=, <, <=, >, >= va BETWEEN", true),
                        new OptionData("Faqat LIKE '%text%'", false),
                        new OptionData("Faqat IS NULL", false),
                        new OptionData("Faqat NOT IN", false)
                ), 10);

        quizRepository.save(quizSql);
    }

    private void addQuestion(Quiz quiz, String content, String snippet, List<OptionData> options, int points) {
        Question q = Question.builder()
                .content(content)
                .codeSnippet(snippet)
                .points(points)
                .quiz(quiz)
                .options(new ArrayList<>())
                .build();

        for (OptionData od : options) {
            Option opt = Option.builder()
                    .optionText(od.text)
                    .isCorrect(od.correct)
                    .question(q)
                    .build();
            q.getOptions().add(opt);
        }

        quiz.getQuestions().add(q);
    }

    private record OptionData(String text, boolean correct) {}
}