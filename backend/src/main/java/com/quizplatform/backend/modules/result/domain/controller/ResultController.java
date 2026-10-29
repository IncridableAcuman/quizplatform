package com.quizplatform.backend.modules.result.domain.controller;

import com.quizplatform.backend.modules.pdf.service.PdfGeneratorService;
import com.quizplatform.backend.modules.result.domain.dto.ResultDto;
import com.quizplatform.backend.modules.result.domain.entity.Result;
import com.quizplatform.backend.modules.result.domain.service.ResultService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.util.List;

@RestController
@RequestMapping("/results")
@RequiredArgsConstructor
public class ResultController {

    private final ResultService resultService;
    private final PdfGeneratorService pdfGeneratorService;

    @PostMapping("/submit")
    public ResponseEntity<ResultDto.QuizResultResponse> submitQuiz(@AuthenticationPrincipal UserDetails userDetails,
                                                                   @Valid @RequestBody ResultDto.SubmitQuizRequest request) {
        return ResponseEntity.ok(resultService.submitQuiz(userDetails.getUsername(), request));
    }

    @GetMapping("/my-history")
    public ResponseEntity<List<ResultDto.ResultHistoryResponse>> getMyHistory(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(resultService.getUserResults(userDetails.getUsername()));
    }

    @GetMapping("/history")
    public ResponseEntity<List<ResultDto.ResultHistoryResponse>> getHistoryAlias(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(resultService.getUserResults(userDetails.getUsername()));
    }

    @GetMapping("/{resultId}/pdf")
    public ResponseEntity<InputStreamResource> downloadPdfResult(@PathVariable Long resultId) {
        return servePdf(resultId);
    }

    @GetMapping("/{resultId}/certificate")
    public ResponseEntity<InputStreamResource> downloadCertificate(@PathVariable Long resultId) {
        return servePdf(resultId);
    }

    private ResponseEntity<InputStreamResource> servePdf(Long resultId) {
        Result result = resultService.getResultById(resultId);
        ByteArrayInputStream bis = pdfGeneratorService.generateResultPdf(result);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=quiz-result-" + resultId + ".pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }
}
