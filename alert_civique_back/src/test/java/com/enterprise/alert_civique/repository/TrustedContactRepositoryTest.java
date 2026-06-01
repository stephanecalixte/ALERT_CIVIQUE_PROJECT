package com.enterprise.alert_civique.repository;

import com.enterprise.alert_civique.entity.TrustedContact;
import com.enterprise.alert_civique.entity.Users;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@DisplayName("TrustedContactRepository Tests")
public class TrustedContactRepositoryTest {

    @Autowired
    private TrustedcontactRepository trustedContactRepository;

    @Autowired
    private UserRepository userRepository;

    private Users userA;
    private Users userB;

    @BeforeEach
    public void setUp() {
        trustedContactRepository.deleteAll();
        userRepository.deleteAll();

        userA = new Users();
        userA.setEmail("usera@example.com");
        userA.setPassword("hash");
        userA.setFirstname("Anna");
        userA.setLastname("Leclerc");
        userA.setPhone("+33600000001");
        userA.setBirthdate(LocalDate.of(1990, 1, 1));
        userA = userRepository.save(userA);

        userB = new Users();
        userB.setEmail("userb@example.com");
        userB.setPassword("hash");
        userB.setFirstname("Bruno");
        userB.setLastname("Moreau");
        userB.setPhone("+33600000002");
        userB.setBirthdate(LocalDate.of(1985, 6, 15));
        userB = userRepository.save(userB);
    }

    private TrustedContact buildContact(String name, String email, String phone, Users user) {
        TrustedContact c = new TrustedContact();
        c.setName(name);
        c.setEmail(email);
        c.setPhone(phone);
        c.setUser(user);
        return c;
    }

    @Test
    @DisplayName("Devrait sauvegarder et retrouver un contact de confiance")
    public void testSaveAndFindById() {
        TrustedContact contact = buildContact("Sophie", "sophie@test.com", "+33611111111", userA);

        TrustedContact saved = trustedContactRepository.save(contact);

        assertNotNull(saved.getTrustedContactId());
        Optional<TrustedContact> found = trustedContactRepository.findById(saved.getTrustedContactId());
        assertTrue(found.isPresent());
        assertEquals("Sophie", found.get().getName());
        assertEquals("sophie@test.com", found.get().getEmail());
    }

    @Test
    @DisplayName("Devrait retourner Optional vide pour un ID inexistant")
    public void testFindById_NotFound() {
        Optional<TrustedContact> found = trustedContactRepository.findById(9999L);
        assertFalse(found.isPresent());
    }

    @Test
    @DisplayName("Devrait retourner tous les contacts")
    public void testFindAll() {
        trustedContactRepository.save(buildContact("C1", "c1@test.com", "+33600000010", userA));
        trustedContactRepository.save(buildContact("C2", "c2@test.com", "+33600000011", userA));
        trustedContactRepository.save(buildContact("C3", "c3@test.com", "+33600000012", userB));

        List<TrustedContact> all = trustedContactRepository.findAll();

        assertEquals(3, all.size());
    }

    @Test
    @DisplayName("Devrait retourner les contacts d'un utilisateur spécifique")
    public void testFindByUserUserId() {
        trustedContactRepository.save(buildContact("Ami1", "ami1@test.com", "+33600000020", userA));
        trustedContactRepository.save(buildContact("Ami2", "ami2@test.com", "+33600000021", userA));
        trustedContactRepository.save(buildContact("AmiB", "amib@test.com", "+33600000022", userB));

        List<TrustedContact> contactsA = trustedContactRepository.findByUserUserId(userA.getUserId());

        assertEquals(2, contactsA.size());
        assertTrue(contactsA.stream().allMatch(c -> c.getUser().getUserId().equals(userA.getUserId())));
    }

    @Test
    @DisplayName("Devrait retourner une liste vide pour un utilisateur sans contacts")
    public void testFindByUserUserId_Empty() {
        List<TrustedContact> contacts = trustedContactRepository.findByUserUserId(userB.getUserId());
        assertNotNull(contacts);
        assertTrue(contacts.isEmpty());
    }

    @Test
    @DisplayName("Devrait supprimer un contact par son ID")
    public void testDelete() {
        TrustedContact saved = trustedContactRepository.save(
                buildContact("ToDelete", "del@test.com", "+33699999999", userA));
        Long id = saved.getTrustedContactId();

        trustedContactRepository.deleteById(id);

        assertFalse(trustedContactRepository.existsById(id));
    }

    @Test
    @DisplayName("Devrait compter les contacts correctement")
    public void testCount() {
        assertEquals(0, trustedContactRepository.count());
        trustedContactRepository.save(buildContact("X1", "x1@test.com", "+33600000030", userA));
        trustedContactRepository.save(buildContact("X2", "x2@test.com", "+33600000031", userB));
        assertEquals(2, trustedContactRepository.count());
    }

    @Test
    @DisplayName("Devrait mettre à jour les champs d'un contact")
    public void testUpdate() {
        TrustedContact saved = trustedContactRepository.save(
                buildContact("OldName", "old@test.com", "+33600000040", userA));

        saved.setName("NewName");
        saved.setEmail("new@test.com");
        TrustedContact updated = trustedContactRepository.save(saved);

        assertEquals("NewName", updated.getName());
        assertEquals("new@test.com", updated.getEmail());
    }

    @Test
    @DisplayName("Devrait vérifier l'existence d'un contact")
    public void testExistsById() {
        TrustedContact saved = trustedContactRepository.save(
                buildContact("Exists", "exists@test.com", "+33600000050", userA));

        assertTrue(trustedContactRepository.existsById(saved.getTrustedContactId()));
        assertFalse(trustedContactRepository.existsById(9999L));
    }
}
