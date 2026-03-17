package com.enterprise.alert_civique.service;

import com.enterprise.alert_civique.dto.AIValidationDTO;


import java.util.List;

public interface AiValidationService {

    List<AIValidationDTO> getAll();

    AIValidationDTO getById(Long AivalidationId);

    AIValidationDTO create( AIValidationDTO dto);

    AIValidationDTO update(Long AivalidationId, AIValidationDTO dto);

    void delete(Long AivalidationId);

} 
