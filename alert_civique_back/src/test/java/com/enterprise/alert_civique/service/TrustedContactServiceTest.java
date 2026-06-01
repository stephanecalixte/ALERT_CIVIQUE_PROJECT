package com.enterprise.alert_civique.service;

import com.enterprise.alert_civique.dto.TrustedContactDTO;
import com.enterprise.alert_civique.entity.Users;
import com.enterprise.alert_civique.repository.TrustedcontactRepository;
import com.enterprise.alert_civique.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@DisplayName("TrustedContactService Unit Tests")
public class TrustedContactServiceTest {

    @Autowired
    private TrustedContactService trustedContactService;

    @Autowired
    private TrustedcontactRepository trustedContactRepository;

    @Autowired
    private UserRepository userRepository;

    private Users testUser;

    @BeforeEach
    public void setUp() {
        trustedContactRepository.deleteAll();
        userRepository.deleteAll();

        testUser = new Users();
        testUser.setEmail("user.trusted@example.com");
        testUser.setPassword("hashedPassword");
        testUser.setFirstname("Marie");
        testUser.setLastname("Dupont");
        testUser.setPhone("+33612345678");
        testUser.setBirthdate(LocalDate.of(1985, 3, 15));
        testUser = userRepository.save(testUser);
    }

    @Test
    @DisplayName("Devrait créer un contact de confiance avec succès")
    public void testCreateTrustedContact_Success() {
        TrustedContactDTO dto = new TrustedContactDTO(null, "Alice Martin", "alice@example.com", "+33698765432", testUser.getUserId());

        TrustedContactDTO result = trustedContactService.createTrustedContact(dto);

        assertNotNull(result);
        assertNotNull(result.id());
        assertEquals("Alice Martin", result.name());
        assertEquals("alice@example.com", result.email());
        assertEquals("+33698765432", result.phone());
    }

    @Test
    @DisplayName("Devrait retourner la liste de tous les contacts")
    public void testGetAllTrustedContacts() {
        TrustedContactDTO dto1 = new TrustedContactDTO(null, "Bob", "bob@example.com", "+33611111111", testUser.getUserId());
        TrustedContactDTO dto2 = new TrustedContactDTO(null, "Carol", "carol@example.com", "+33622222222", testUser.getUserId());
        trustedContactService.createTrustedContact(dto1);
        trustedContactService.createTrustedContact(dto2);

        List<TrustedContactDTO> contacts = trustedContactService.getAllTrustedContacts();

        assertEquals(2, contacts.size());
    }

    @Test
    @DisplayName("Devrait récupérer un contact par son ID")
    public void testGetTrustedContactById_Found() {
        TrustedContactDTO dto = new TrustedContactDTO(null, "David", "david@example.com", "+33633333333", testUser.getUserId());
        TrustedContactDTO saved = trustedContactService.createTrustedContact(dto);

        TrustedContactDTO found = trustedContactService.getTrustedContactById(saved.id());

        assertNotNull(found);
        assertEquals("David", found.name());
        assertEquals("david@example.com", found.email());
    }

    @Test
    @DisplayName("Devrait lever une exception pour un contact inexistant")
    public void testGetTrustedContactById_NotFound() {
        assertThrows(RuntimeException.class,
                () -> trustedContactService.getTrustedContactById(9999L),
                "Devrait lever RuntimeException si le contact n'existe pas");
    }

    @Test
    @DisplayName("Devrait mettre à jour un contact de confiance")
    public void testUpdateTrustedContact_Success() {
        TrustedContactDTO dto = new TrustedContactDTO(null, "Eve", "eve@example.com", "+33644444444", testUser.getUserId());
        TrustedContactDTO saved = trustedContactService.createTrustedContact(dto);

        TrustedContactDTO updateDTO = new TrustedContactDTO(saved.id(), "Eve Updated", "eve.new@example.com", "+33699999999", testUser.getUserId());
        TrustedContactDTO updated = trustedContactService.updateTrustedContact(saved.id(), updateDTO);

        assertEquals("Eve Updated", updated.name());
        assertEquals("eve.new@example.com", updated.email());
        assertEquals("+33699999999", updated.phone());
    }

    @Test
    @DisplayName("Devrait lever une exception à la mise à jour d'un contact inexistant")
    public void testUpdateTrustedContact_NotFound() {
        TrustedContactDTO dto = new TrustedContactDTO(null, "Ghost", "ghost@example.com", "+33600000000", testUser.getUserId());
        assertThrows(RuntimeException.class,
                () -> trustedContactService.updateTrustedContact(9999L, dto));
    }

    @Test
    @DisplayName("Devrait supprimer un contact de confiance")
    public void testDeleteTrustedContact_Success() {
        TrustedContactDTO dto = new TrustedContactDTO(null, "Frank", "frank@example.com", "+33655555555", testUser.getUserId());
        TrustedContactDTO saved = trustedContactService.createTrustedContact(dto);

        trustedContactService.deleteTrustedContact(saved.id());

        assertFalse(trustedContactRepository.existsById(saved.id()));
    }

    @Test
    @DisplayName("Devrait lever une exception à la suppression d'un contact inexistant")
    public void testDeleteTrustedContact_NotFound() {
        assertThrows(RuntimeException.class,
                () -> trustedContactService.deleteTrustedContact(9999L));
    }

    @Test
    @DisplayName("Devrait retourner les contacts liés à un utilisateur")
    public void testGetByUserId() {
        TrustedContactDTO dto1 = new TrustedContactDTO(null, "Grace", "grace@example.com", "+33666666666", testUser.getUserId());
        TrustedContactDTO dto2 = new TrustedContactDTO(null, "Hank", "hank@example.com", "+33677777777", testUser.getUserId());
        trustedContactService.createTrustedContact(dto1);
        trustedContactService.createTrustedContact(dto2);

        List<TrustedContactDTO> contacts = trustedContactService.getByUserId(testUser.getUserId());

        assertEquals(2, contacts.size());
        assertTrue(contacts.stream().anyMatch(c -> "Grace".equals(c.name())));
        assertTrue(contacts.stream().anyMatch(c -> "Hank".equals(c.name())));
    }

    @Test
    @DisplayName("Devrait retourner une liste vide pour un utilisateur sans contacts")
    public void testGetByUserId_Empty() {
        List<TrustedContactDTO> contacts = trustedContactService.getByUserId(testUser.getUserId());
        assertNotNull(contacts);
        assertTrue(contacts.isEmpty());
    }
}
