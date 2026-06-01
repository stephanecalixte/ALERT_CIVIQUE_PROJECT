package com.enterprise.alert_civique.repository;

import com.enterprise.alert_civique.entity.LiveStream;
import com.enterprise.alert_civique.entity.Users;
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
@DisplayName("LiveStreamRepository Tests")
public class LiveStreamRepositoryTest {

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
        testUser.setEmail("streamer.repo@example.com");
        testUser.setPassword("hash");
        testUser.setFirstname("Claude");
        testUser.setLastname("Fontaine");
        testUser.setPhone("+33600100200");
        testUser.setBirthdate(LocalDate.of(1993, 4, 10));
        testUser = userRepository.save(testUser);
    }

    private LiveStream buildLiveStream(String streamUrl) {
        LiveStream ls = new LiveStream();
        ls.setStreamUrl(streamUrl);
        ls.setUser(testUser);
        return ls;
    }

    @Test
    @DisplayName("Devrait sauvegarder un live stream et générer un ID")
    public void testSave() {
        LiveStream ls = buildLiveStream("rtmp://stream.test/live1");

        LiveStream saved = liveStreamRepository.save(ls);

        assertNotNull(saved.getLivestreamId());
        assertEquals("rtmp://stream.test/live1", saved.getStreamUrl());
    }

    @Test
    @DisplayName("Devrait déclencher @PrePersist : status='LIVE' et startedAt non null")
    public void testPrePersist_DefaultValues() {
        LiveStream ls = buildLiveStream("rtmp://stream.test/live2");

        LiveStream saved = liveStreamRepository.save(ls);

        assertEquals("LIVE", saved.getStatus());
        assertNotNull(saved.getStartedAt());
    }

    @Test
    @DisplayName("Devrait retrouver un live stream par son ID")
    public void testFindById_Found() {
        LiveStream saved = liveStreamRepository.save(buildLiveStream("rtmp://stream.test/live3"));

        Optional<LiveStream> found = liveStreamRepository.findById(saved.getLivestreamId());

        assertTrue(found.isPresent());
        assertEquals(saved.getLivestreamId(), found.get().getLivestreamId());
    }

    @Test
    @DisplayName("Devrait retourner Optional vide pour un ID inexistant")
    public void testFindById_NotFound() {
        Optional<LiveStream> found = liveStreamRepository.findById(9999L);
        assertFalse(found.isPresent());
    }

    @Test
    @DisplayName("Devrait retourner tous les live streams")
    public void testFindAll() {
        liveStreamRepository.save(buildLiveStream("rtmp://s1"));
        liveStreamRepository.save(buildLiveStream("rtmp://s2"));
        liveStreamRepository.save(buildLiveStream("rtmp://s3"));

        List<LiveStream> all = liveStreamRepository.findAll();

        assertEquals(3, all.size());
    }

    @Test
    @DisplayName("Devrait supprimer un live stream")
    public void testDelete() {
        LiveStream saved = liveStreamRepository.save(buildLiveStream("rtmp://del"));
        Long id = saved.getLivestreamId();

        liveStreamRepository.deleteById(id);

        assertFalse(liveStreamRepository.existsById(id));
    }

    @Test
    @DisplayName("Devrait mettre à jour les champs d'un live stream")
    public void testUpdate() {
        LiveStream saved = liveStreamRepository.save(buildLiveStream("rtmp://original"));

        saved.setStatus("ENDED");
        saved.setVideoUrl("http://video.example.com/v1.mp4");
        saved.setEndedAt(LocalDateTime.now());
        saved.setDuration(300);
        LiveStream updated = liveStreamRepository.save(saved);

        assertEquals("ENDED", updated.getStatus());
        assertEquals("http://video.example.com/v1.mp4", updated.getVideoUrl());
        assertEquals(300, updated.getDuration());
        assertNotNull(updated.getEndedAt());
    }

    @Test
    @DisplayName("Devrait compter les live streams correctement")
    public void testCount() {
        assertEquals(0, liveStreamRepository.count());
        liveStreamRepository.save(buildLiveStream("rtmp://c1"));
        liveStreamRepository.save(buildLiveStream("rtmp://c2"));
        assertEquals(2, liveStreamRepository.count());
    }

    @Test
    @DisplayName("Devrait vérifier l'existence d'un live stream")
    public void testExistsById() {
        LiveStream saved = liveStreamRepository.save(buildLiveStream("rtmp://exists"));

        assertTrue(liveStreamRepository.existsById(saved.getLivestreamId()));
        assertFalse(liveStreamRepository.existsById(9999L));
    }

    @Test
    @DisplayName("Devrait retourner une liste vide quand aucun live stream n'existe")
    public void testFindAll_Empty() {
        List<LiveStream> all = liveStreamRepository.findAll();
        assertNotNull(all);
        assertTrue(all.isEmpty());
    }
}
