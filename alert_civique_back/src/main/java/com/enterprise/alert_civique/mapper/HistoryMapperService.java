package com.enterprise.alert_civique.mapper;



import com.enterprise.alert_civique.dto.HistoryDTO;
import com.enterprise.alert_civique.entity.History;
import com.enterprise.alert_civique.entity.Reports;
import com.enterprise.alert_civique.entity.Users;
import org.springframework.stereotype.Service;

@Service
public class HistoryMapperService {

    public HistoryDTO toDTO(History entity){
        if(entity == null) return null;
        return new HistoryDTO(
            entity.getHistoryId(),
            entity.getAnalyse(),
            entity.getReport() != null ? entity.getReport().getReportId() : null,
            entity.getUser() != null ? entity.getUser().getUserId() : null,
            entity.getAction(),
            entity.getCreatedAt(),
            entity.getDetails()
        );
    }

    public History toEntity(HistoryDTO dto){
        if(dto == null) return null;

        History entity = new History();
        entity.setHistoryId(dto.historiqueId());
        entity.setAnalyse(dto.analyse());
        entity.setAction(dto.action());
        entity.setCreatedAt(dto.createdAt());
        entity.setDetails(dto.details());

        if(dto.reportId() != null){
            Reports report = new Reports();
            report.setReportId(dto.reportId());
            entity.setReport(report);
        }

        if(dto.userId() != null){
            Users user = new Users();
            user.setUserId(dto.userId());
            entity.setUser(user);
        }

        return entity;
    }
}