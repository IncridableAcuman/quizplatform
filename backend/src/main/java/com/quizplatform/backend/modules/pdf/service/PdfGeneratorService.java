package com.quizplatform.backend.modules.pdf.service;


import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.quizplatform.backend.modules.result.domain.entity.Result;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class PdfGeneratorService {

    public ByteArrayInputStream generateResultPdf(Result result) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Ranglar palitrasi
            DeviceRgb primaryColor = new DeviceRgb(37, 99, 235); // Blue
            DeviceRgb successColor = new DeviceRgb(22, 163, 74); // Green
            DeviceRgb errorColor = new DeviceRgb(220, 38, 38);   // Red

            // Sarlavha (Header)
            Paragraph header = new Paragraph("QUIZ PLATFORM")
                    .setFontSize(28)
                    .setBold()
                    .setFontColor(primaryColor)
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(header);

            Paragraph subHeader = new Paragraph("Test Natijasi va Sertifikati")
                    .setFontSize(14)
                    .setFontColor(ColorConstants.GRAY)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(30);
            document.add(subHeader);

            // Foydalanuvchi va Quiz ma'lumotlari
            Paragraph userInfo = new Paragraph()
                    .add("Foydalanuvchi: " + result.getUser().getFullName() + " (@" + result.getUser().getUsername() + ")\n")
                    .add("Test Nomi: " + result.getQuiz().getTitle() + "\n")
                    .add("Sana: " + result.getCompletedAt().format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm")))
                    .setFontSize(12)
                    .setMarginBottom(20);
            document.add(userInfo);

            // Natijalar Jadvali
            Table table = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                    .useAllAvailableWidth()
                    .setMarginBottom(20);

            table.addHeaderCell(new Cell().add(new Paragraph("Ko'rsatkich").setBold()));
            table.addHeaderCell(new Cell().add(new Paragraph("Qiymat").setBold()));

            table.addCell("Jami Savollar");
            table.addCell(String.valueOf(result.getTotalQuestions()));

            table.addCell("To'g'ri Javoblar");
            table.addCell(String.valueOf(result.getCorrectAnswers()));

            table.addCell("Toplangan Ball");
            table.addCell(String.valueOf(result.getScore()));

            table.addCell("Sarflangan Vaqt");
            table.addCell(result.getTimeTakenSeconds() + " soniya");

            document.add(table);

            // Yakuniy Xulosa Statusi (Passed / Failed)
            String statusText = result.getIsPassed() ? "TESTDAN O'TDI" : "TESTDAN O'TA OLMADI";
            DeviceRgb statusColor = result.getIsPassed() ? successColor : errorColor;

            Paragraph status = new Paragraph(statusText)
                    .setFontSize(20)
                    .setBold()
                    .setFontColor(statusColor)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(20);
            document.add(status);

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("PDF generatsiya qilishda xatolik yuz berdi: " + e.getMessage());
        }

        return new ByteArrayInputStream(out.toByteArray());
    }
}
