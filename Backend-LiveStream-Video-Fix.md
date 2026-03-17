# Fix Backend pour Persistance Vidéo LiveStream

## Problème
- Front upload multipart → backend rejette (400) car MediaController attend JSON `@RequestBody`.
- Champs `videoUrl/mediaId` ignorés (DTO/Entity manquent).

## Solution Étape par Étape

### 1. Ajouter Champs LiveStream
**dto/LiveStreamDTO.java:**
```java
public record LiveStreamDTO(
    Long livestreamId,
    LocalDateTime startedAt,
    LocalDateTime endedAt,
    String streamUrl,
    String status,
    String videoUrl,     // NOUVEAU
    Long mediaId,        // NOUVEAU
    Integer duration     // NOUVEAU
) {}
```

**entity/LiveStream.java:**
```java
@Column(name = "video_url")
private String videoUrl;

@Column(name = "media_id")
private Long mediaId;

@Column(name = "duration")
private Integer duration;
```

### 2. MediaController Multipart
**controller/MediaController.java** - Remplacer POST:
```java
@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA)
public ResponseEntity<MediaDTO> uploadVideo(
    @RequestPart("video") MultipartFile videoFile,
    @RequestPart(value = "dto", required = false) MediaDTO dto
) {
    try {
        // Créer dossier si absent
        Path uploadDir = Paths.get("src/main/resources/static/uploads/videos");
        if (!Files.exists(uploadDir)) Files.createDirectories(uploadDir);
        
        String filename = "livestream-" + System.currentTimeMillis() + ".mp4";
        Path filePath = uploadDir.resolve(filename);
        videoFile.transferTo(filePath);
        
        Media media = new Media();
        media.setUrl("/uploads/videos/" + filename);
        media.setTypeMedia("VIDEO");
        media.setDateUpload(LocalDateTime.now());
        if (dto != null) {
            media.setReportId(dto.reportId());
        }
        mediaService.createMedia(mediaMapper.toDTO(media));
        
        return ResponseEntity.ok(mediaMapper.toDTO(mediaRepository.save(media)));
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}
```

### 3. Static Resources
**application.properties:**
```
spring.web.resources.static-locations=classpath:/static/,file:src/main/resources/static/uploads/
spring.servlet.multipart.max-file-size=100MB
spring.servlet.multipart.max-request-size=100MB
```

### 4. Mapper/Service
- **LiveStreamMapperService**: Update toEntity/fromDTO for nouveaux champs.
- **MediaService**: Support typeMedia 'VIDEO'.

### 5. Test
1. `mvn compile exec:java -Dexec.mainClass="com.enterprise.alert_civique.AlertCiviqueApplication"`
2. Front → Start/Stop → Check `src/main/resources/static/uploads/videos/*.mp4`
3. DB: `SELECT * FROM lives_stream` → videoUrl présent.

## Commandes
```
# Backend
mkdir -p alert_civique_back/src/main/resources/static/uploads/videos
mvn spring-boot:run

# Front deps (une fois)
cd alert_civique_front && npx expo install expo-av expo-secure-store
npx expo start
```

**Après ces fixes → Persistance vidéo 100% fonctionnelle !** 📱➡️💾

