package com.enterprise.alert_civique.service;

import com.enterprise.alert_civique.dto.MessageDTO;


import java.util.List;
import java.util.Optional;

public interface MessagesService {
    MessageDTO createMessage(MessageDTO dto);
    Optional<MessageDTO> getMessageById(Long id);
    List<MessageDTO> getAllMessages();
    MessageDTO updateMessage(Long id, MessageDTO dto);
    void deleteMessage(Long id);
}
