package com.enterprise.alert_civique.email;


import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.enterprise.alert_civique.entity.Users;

import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private  String fromEmail;

    public void sendEmail(Users user, IEmailStrategy strategy) {
        // Implémentation de l'envoi d'email

        try {
            String htmlContent = "";

            for (String key : strategy.getContext().keySet()) {
                htmlContent.concat(key)
                        .concat(": ")
                        .concat((String) strategy.getContext().get(key))
                        .concat("\n");
            }


            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());

            helper.setFrom("");
            helper.setTo(user.getEmail());
            helper.setSubject(strategy.getSubject());
            helper.setText("Votre client email ne supporte pas le HTML.", htmlContent);

            mailSender.send(message);

            log.info("Email envoyé à {}", user.getEmail());

        } catch (MailException | MessagingException e) {
            // Gestion propre de l'erreur
            log.error("Erreur lors de l'envoi de l'email à {}", user.getEmail(), e);

            // Optionnel : envoyer une notification à l'admin, stocker dans DB, etc.

        } catch (Exception e) {
            log.error("Erreur inattendue lors de l'envoi de l'email à {}", user.getEmail(), e);
            throw new RuntimeException("Erreur envoi email");
        }
    }
}
