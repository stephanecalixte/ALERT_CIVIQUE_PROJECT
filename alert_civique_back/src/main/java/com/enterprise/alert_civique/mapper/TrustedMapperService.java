package com.enterprise.alert_civique.mapper;

import org.springframework.stereotype.Service;

import com.enterprise.alert_civique.dto.TrustedContactDTO;
import com.enterprise.alert_civique.entity.TrustedContact;

@Service
public class TrustedMapperService {

    // Entity -> DTO
    public TrustedContactDTO toDTO(TrustedContact trustedContact) {
        if (trustedContact == null) return null;

        return new TrustedContactDTO(
            trustedContact.getTrustedContactId(),
            trustedContact.getName(),
            trustedContact.getEmail(),
            trustedContact.getPhone(),
            trustedContact.getUserId()
        );
    }

    // DTO -> Entity
    public TrustedContact toEntity(TrustedContactDTO dto) {
        if (dto == null) return null;

        TrustedContact contact = new TrustedContact();

        contact.setName(dto.name());
        contact.setEmail(dto.email());
        contact.setPhone(dto.phone());
        contact.setUserId(dto.userId());
        return contact;
    }
}

