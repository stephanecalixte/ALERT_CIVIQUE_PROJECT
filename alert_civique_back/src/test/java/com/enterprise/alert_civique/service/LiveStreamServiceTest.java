package com.enterprise.alert_civique.service;

import com.enterprise.alert_civique.dto.LiveStreamDTO;
import com.enterprise.alert_civique.entity.LiveStream;
import com.enterprise.alert_civique.entity.Users;
import com.enterprise.alert_civique.repository.LiveStreamRepository;
import com.enterprise.alert_civique.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@DisplayName("LiveStreamService Unit Tests")
public class LiveStreamServiceTest {

    @Autowired
    private LiveStreamService liveStreamService;

    @Autowired
    private LiveStreamRepository liveStreamRepository;

    @Autowired
    private UserRepository userRepository;

    private Users testUser;

    @BeforeEach
    public void setUp() {
        liveStreamRepository.deleteAll();
        userRepository.deleteAll();

        testUser = new Users();
        testUser.setEmail("streamer@example.com");
        testUser.setPassword("hashedPassword");
        testUser.setFirstname("Luc");
        testUser.setLastname("Bernard");
        testUser.setPhone("+33601020304");
        testUser.setBirthdate(LocalDate.of(1992, 7, 20));
        testUser = userRepository.save(testUser);
    }

    @Test
    @DisplayName("Devrait créer un live stream avec succès")
    public void testCreateLiveStream_Success() throws Exception {
        LiveStreamDTO dto = new LiveStreamDTO(
                null, testUser.getUserId(),
                null, null,
                "rtmp://stream.example.com/live", "LIVE",
                null, null
        );

        LiveStream result = liveStreamService.createLiveStream(dto);

        assertNotNull(result);
        assertNotNull(result.getLivestreamId());
        assertEquals("LIVE", result.getStatus());
    }

    @Test
    @DisplayName("Devrait lever une exception pour un DTO null")
    public void testCreateLiveStream_NullDTO() {
        assertThrows(IllegalArgumentException.class,
                () -> liveStreamService.createLiveStream(null),
                "Devrait lever IllegalArgumentException pour DTO null");
    }

    @Test
    @DisplayName("Devrait retourner tous les live streams")
    public void testGetAllLiveStreams() throws Exception {
        LiveStreamDTO dto1 = new LiveStreamDTO(null, testUser.getUserId(), null, null, "rtmp://s1", "LIVE", null, null);
        LiveStreamDTO dto2 = new LiveStreamDTO(null, testUser.getUserId(), null, null, "rtmp://s2", "LIVE", null, null);
        liveStreamService.createLiveStream(dto1);
        liveStreamService.createLiveStream(dto2);

        List<LiveStream> streams = liveStreamService.getALLLiveStream();

        assertEquals(2, streams.size());
    }

    @Test
    @DisplayName("Devrait récupérer un live stream par son ID")
    public void testGetLiveStreamById_Found() throws Exception {
        LiveStreamDTO dto = new LiveStreamDTO(null, testUser.getUserId(), null, null, "rtmp://s3", "LIVE", null, null);
        LiveStream created = liveStreamService.createLiveStream(dto);

        Optional<LiveStream> found = liveStreamService.getLiveStreamById(created.getLivestreamId());

        assertTrue(found.isPresent());
        assertEquals(created.getLivestreamId(), found.get().getLivestreamId());
    }

    @Test
    @DisplayName("Devrait retourner Optional vide pour un ID inexistant")
    public void testGetLiveStreamById_NotFound() throws Exception {
        Optional<LiveStream> found = liveStreamService.getLiveStreamById(9999L);
        assertFalse(found.isPresent());
    }

    @Test
    @DisplayName("Devrait lever une exception pour ID null lors de getLiveStreamById")
    public void testGetLiveStreamById_NullId() {
        assertThrows(IllegalArgumentException.class,
                () -> liveStreamService.getLiveStreamById(null));
    }

    @Test
    @DisplayName("Devrait mettre à jour un live stream")
    public void testUpdateLiveStream_Success() throws Exception {
        LiveStreamDTO createDTO = new LiveStreamDTO(null, testUser.getUserId(), null, null, "rtmp://original", "LIVE", null, null);
        LiveStream created = liveStreamService.createLiveStream(createDTO);

        LiveStreamDTO updateDTO = new LiveStreamDTO(
                created.getLivestreamId(), testUser.getUserId(),
                null, LocalDateTime.now(),
                "rtmp://updated", "ENDED",
                "http://video.example.com/out.mp4", 120
        );
        LiveStream updated = liveStreamService.updateLiveStream(updateDTO);

        assertEquals("ENDED", updated.getStatus());
        assertEquals("rtmp://updated", updated.getStreamUrl());
        assertEquals(120, updated.getDuration());
    }

    @Test
    @DisplayName("Devrait lever une exception si l'ID est null lors de la mise à jour")
    public void testUpdateLiveStream_NullId() {
        LiveStreamDTO dto = new LiveStreamDTO(null, testUser.getUserId(), null, null, null, null, null, null);
        assertThrows(IllegalArgumentException.class,
                () -> liveStreamService.updateLiveStream(dto));
    }

    @Test
    @DisplayName("Devrait lever une exception si le stream n'existe pas lors de la mise à jour")
    public void testUpdateLiveStream_NotFound() {
        LiveStreamDTO dto = new LiveStreamDTO(9999L, testUser.getUserId(), null, null, null, null, null, null);
        assertThrows(IllegalArgumentException.class,
                () -> liveStreamService.updateLiveStream(dto));
    }

    @Test
    @DisplayName("Devrait supprimer un live stream")
    public void testDeleteLiveStream_Success() throws Exception {
        LiveStreamDTO dto = new LiveStreamDTO(null, testUser.getUserId(), null, null, "rtmp://del", "LIVE", null, null);
        LiveStream created = liveStreamService.createLiveStream(dto);
        Long id = created.getLivestreamId();

        liveStreamService.deleteLiveStream(id);

        assertFalse(liveStreamRepository.existsById(id));
    }

    @Test
    @DisplayName("Devrait lever une exception pour ID null lors de la suppression")
    public void testDeleteLiveStream_NullId() {
        assertThrows(IllegalArgumentException.class,
                () -> liveStreamService.deleteLiveStream(null));
    }

    @Test
    @DisplayName("Devrait lever une exception si le stream n'existe pas lors de la suppression")
    public void testDeleteLiveStream_NotFound() {
        assertThrows(IllegalArgumentException.class,
                () -> liveStreamService.deleteLiveStream(9999L));
    }
}
