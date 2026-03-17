package com.enterprise.alert_civique.service.serviceImpl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.enterprise.alert_civique.dto.TrustedContactDTO;
import com.enterprise.alert_civique.entity.TrustedContact;
import com.enterprise.alert_civique.mapper.TrustedMapperService;
import com.enterprise.alert_civique.repository.TrustedcontactRepository;
import com.enterprise.alert_civique.service.TrustedContactService;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TrustedContactServiceImpl implements TrustedContactService {

    private final TrustedcontactRepository trustedContactRepository;
    private final TrustedMapperService mapperService; 

    public TrustedContactServiceImpl(
        TrustedcontactRepository trustedContactRepository, 
        TrustedMapperService mapperService 
    ) {
        this.trustedContactRepository = trustedContactRepository;
        this.mapperService = mapperService;
    }

    @Override
    public TrustedContactDTO createTrustedContact(TrustedContactDTO contactDTO) {

        TrustedContact contact = mapperService.toEntity(contactDTO); 

        TrustedContact savedContact = trustedContactRepository.save(contact);

        return mapperService.toDTO(savedContact);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TrustedContactDTO> getAllTrustedContacts() {

        List<TrustedContact> contacts = trustedContactRepository.findAll();

        return contacts.stream()
                .map(mapperService::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TrustedContactDTO getTrustedContactById(Long id) {
        TrustedContact contact = trustedContactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trusted contact not found"));
        return mapperService.toDTO(contact);
    }

    @Override
    public TrustedContactDTO updateTrustedContact(Long id, TrustedContactDTO contactDTO) {
     
        TrustedContact existingContact = trustedContactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trusted contact not found"));
        
  
        existingContact.setName(contactDTO.name());
        existingContact.setEmail(contactDTO.email());
        existingContact.setPhone(contactDTO.phone());
        
    
        TrustedContact updatedContact = trustedContactRepository.save(existingContact);
   
        return mapperService.toDTO(updatedContact);
    }

    @Override
    public void deleteTrustedContact(Long id) {
        TrustedContact contact = trustedContactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trusted contact not found"));
        trustedContactRepository.delete(contact);
    }

    @Override
    @Transactional(readOnly = true)
    public TrustedContactDTO getTrustedContactByUserId(Long userId) {
        
        List<TrustedContact> allContacts = trustedContactRepository.findAll();
        
        TrustedContact contact = allContacts.stream()
                .filter(c -> userId.equals(c.getUserId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Trusted contact not found for user: " + userId));
                
        return mapperService.toDTO(contact);
    }
}