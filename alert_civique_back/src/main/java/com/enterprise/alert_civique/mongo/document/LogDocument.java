package com.enterprise.alert_civique.mongo.document;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.bson.codecs.pojo.annotations.BsonId;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class LogDocument {

    @Id
    private String id;

    private String message;
    private String level;
    private String userId;
    private String action;
    private String timestamp;

}
