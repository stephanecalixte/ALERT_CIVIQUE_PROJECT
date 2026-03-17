package com.enterprise.alert_civique.security;

/**
 * Interface définissant les méthodes pour le hachage et la vérification des mots de passe.<p>
 * Cette interface permet d'abstraire la logique de hachage des mots de passe,
 * ce qui facilite le changement de l'algorithme de hachage utilisé sans impacter le reste de l'application.<p>
 */
public interface IPasswordService {

    String hash(String rawPassword) throws Exception;
    boolean matches(String rawPassword, String hashedPassword) throws Exception;
}
