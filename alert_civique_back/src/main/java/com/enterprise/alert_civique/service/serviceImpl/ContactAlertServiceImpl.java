package com.enterprise.alert_civique.service.serviceImpl;

import com.enterprise.alert_civique.dto.AlertContactNotificationRequest;
import com.enterprise.alert_civique.dto.AlertContactNotificationResult;
import com.enterprise.alert_civique.entity.TrustedContact;
import com.enterprise.alert_civique.repository.TrustedcontactRepository;
import com.enterprise.alert_civique.service.ContactAlertService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContactAlertServiceImpl implements ContactAlertService {

    private final TrustedcontactRepository trustedContactRepository;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    public List<AlertContactNotificationResult> notifyContacts(AlertContactNotificationRequest request) {
        List<TrustedContact> contacts = trustedContactRepository.findByUserId(request.userId());
        List<AlertContactNotificationResult> results = new ArrayList<>();

        String alertLabel = resolveAlertLabel(request.alertType());
        String alertEmoji = resolveAlertEmoji(request.alertType());

        for (TrustedContact contact : contacts) {
            boolean emailSent = sendBienveillanceEmail(contact, request.senderName(), alertLabel, alertEmoji);
            boolean smsSent   = sendSmsBienveillance(contact, request.senderName(), alertLabel);

            results.add(new AlertContactNotificationResult(
                contact.getName(),
                contact.getEmail(),
                contact.getPhone(),
                emailSent,
                smsSent
            ));
        }

        return results;
    }

    // ── Email de bienveillance ─────────────────────────────────────────────────
    private boolean sendBienveillanceEmail(TrustedContact contact, String senderName,
                                           String alertLabel, String alertEmoji) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    message, true, StandardCharsets.UTF_8.name());

            helper.setFrom(fromEmail);
            helper.setTo(contact.getEmail());
            helper.setSubject(alertEmoji + " Alerte AlertCivique — " + alertLabel);
            helper.setText(buildEmailText(contact.getName(), senderName, alertLabel),
                           buildEmailHtml(contact.getName(), senderName, alertLabel, alertEmoji));

            mailSender.send(message);
            log.info("📧 Email bienveillance envoyé à {} ({})", contact.getName(), contact.getEmail());
            return true;
        } catch (MessagingException e) {
            log.error("❌ Échec email vers {} : {}", contact.getEmail(), e.getMessage());
            return false;
        }
    }

    // ── SMS de bienveillance (simulé — prêt pour Twilio) ──────────────────────
    private boolean sendSmsBienveillance(TrustedContact contact, String senderName, String alertLabel) {
        String smsBody = "🚨 AlertCivique : " + senderName +
                " a déclenché une alerte " + alertLabel +
                ". Les autorités ont été notifiées. Veuillez contacter " + senderName +
                " pour vous assurer de son bien-être.";

        // TODO: Remplacer par Twilio ou un fournisseur SMS réel
        // TwilioSmsClient.send(contact.getPhone(), smsBody);
        log.info("📱 [SMS SIMULÉ] → {} ({}) : {}", contact.getName(), contact.getPhone(), smsBody);
        return true;
    }

    // ── Corps email texte brut ─────────────────────────────────────────────────
    private String buildEmailText(String contactName, String senderName, String alertLabel) {
        return "Bonjour " + contactName + ",\n\n" +
               "Nous vous contactons au nom d'AlertCivique pour vous informer qu'une alerte "
               + alertLabel + " a été déclenchée par " + senderName + ".\n\n" +
               "Les autorités compétentes ont été immédiatement notifiées et sont en route.\n\n" +
               "Nous vous encourageons à prendre contact avec " + senderName +
               " pour vous assurer de son bien-être et lui apporter votre soutien.\n\n" +
               "Merci pour votre solidarité.\n\n— L'équipe AlertCivique";
    }

    // ── Corps email HTML ───────────────────────────────────────────────────────
    private String buildEmailHtml(String contactName, String senderName,
                                   String alertLabel, String alertEmoji) {
        return """
            <!DOCTYPE html>
            <html lang="fr">
            <head><meta charset="UTF-8"/></head>
            <body style="font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px;">
              <div style="max-width:600px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;
                          box-shadow:0 2px 10px rgba(0,0,0,0.1);">
                <div style="background:#e53935;padding:30px;text-align:center;">
                  <div style="font-size:60px;">%s</div>
                  <h1 style="color:#fff;margin:10px 0 0;font-size:22px;">Alerte %s</h1>
                </div>
                <div style="padding:30px;">
                  <p style="font-size:16px;color:#333;">Bonjour <strong>%s</strong>,</p>
                  <p style="font-size:15px;color:#555;line-height:1.6;">
                    Nous vous contactons au nom d'<strong>AlertCivique</strong> pour vous informer
                    qu'une alerte <strong>%s</strong> a été déclenchée par <strong>%s</strong>.
                  </p>
                  <div style="background:#fff3e0;border-left:4px solid #e53935;padding:15px;
                              margin:20px 0;border-radius:4px;">
                    <p style="margin:0;color:#bf360c;font-weight:600;">
                      🏛️ Les autorités compétentes ont été immédiatement notifiées.
                    </p>
                  </div>
                  <p style="font-size:15px;color:#555;line-height:1.6;">
                    Nous vous encourageons à prendre contact avec <strong>%s</strong>
                    pour vous assurer de son bien-être et lui apporter votre soutien.
                  </p>
                  <div style="background:#e8f5e9;border-radius:8px;padding:20px;margin-top:25px;
                              text-align:center;">
                    <p style="margin:0;color:#2e7d32;font-size:15px;">
                      💚 Merci d'être là pour vos proches.<br/>
                      <em>Ensemble, nous faisons la différence.</em>
                    </p>
                  </div>
                </div>
                <div style="background:#f5f5f5;padding:15px;text-align:center;">
                  <p style="margin:0;font-size:12px;color:#999;">
                    Ce message a été envoyé automatiquement par AlertCivique.
                  </p>
                </div>
              </div>
            </body>
            </html>
            """.formatted(alertEmoji, alertLabel, contactName, alertLabel, senderName, senderName);
    }

    private String resolveAlertLabel(String alertType) {
        if (alertType == null) return "SOS";
        return switch (alertType.toLowerCase()) {
            case "agression" -> "Agression";
            case "accident"  -> "Accident";
            case "incendie"  -> "Incendie";
            default          -> alertType;
        };
    }

    private String resolveAlertEmoji(String alertType) {
        if (alertType == null) return "🚨";
        return switch (alertType.toLowerCase()) {
            case "agression" -> "🚨";
            case "accident"  -> "🚗";
            case "incendie"  -> "🔥";
            default          -> "🚨";
        };
    }
}
