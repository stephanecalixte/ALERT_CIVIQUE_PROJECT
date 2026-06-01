package com.enterprise.alert_civique.mapper;

import com.enterprise.alert_civique.dto.TrustedContactDTO;
import com.enterprise.alert_civique.entity.TrustedContact;
import com.enterprise.alert_civique.entity.Users;
import com.enterprise.alert_civique.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TrustedMapperService {

    private final UserRepository userRepository;

    public TrustedContactDTO toDTO(TrustedContact trustedContact) {
        if (trustedContact == null) return null;

        return new TrustedContactDTO(
            trustedContact.getTrustedContactId(),
            trustedContact.getName(),
            trustedContact.getEmail(),
            trustedContact.getPhone(),
            trustedContact.getUser() != null ? trustedContact.getUser().getUserId() : null
        );
    }

    public TrustedContact toEntity(TrustedContactDTO dto) {
        if (dto == null) return null;

        TrustedContact contact = new TrustedContact();
        contact.setName(dto.name());
        contact.setEmail(dto.email());
        contact.setPhone(dto.phone());

        if (dto.userId() != null) {
            Users user = userRepository.findById(dto.userId())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé : " + dto.userId()));
            contact.setUser(user);
        }

        return contact;
    }
}
