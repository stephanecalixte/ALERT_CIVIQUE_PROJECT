package com.enterprise.alert_civique.service;

import java.util.List;

import com.enterprise.alert_civique.dto.TrustedContactDTO;



public interface TrustedContactService {

    TrustedContactDTO createTrustedContact(TrustedContactDTO contactDTO);  
    List<TrustedContactDTO> getAllTrustedContacts();                    
    TrustedContactDTO getTrustedContactById(Long id);                   
    TrustedContactDTO updateTrustedContact(Long id, TrustedContactDTO contactDTO);  
    void deleteTrustedContact(Long id);
    TrustedContactDTO getTrustedContactByUserId(Long userId);             


}

