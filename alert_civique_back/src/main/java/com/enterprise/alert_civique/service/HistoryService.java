package com.enterprise.alert_civique.service;

import com.enterprise.alert_civique.dto.HistoryDTO;


import java.util.List;
import java.util.Optional;

public interface HistoryService {

    HistoryDTO createHistory(HistoryDTO historyDTO);

    HistoryDTO updateHistory(Long historyId, HistoryDTO historyDTO);

    HistoryDTO deleteHistory(Long historyId);

    List<HistoryDTO> getAllHistories();

    Optional<HistoryDTO> getHistoryById(Long historyId);
}