package com.enterprise.alert_civique.main;

import javax.crypto.SecretKey;
import java.util.Base64;

public class JwtKeyGenerator {

    public static void main(String[] args) {

        SecretKey key = io.jsonwebtoken.security.Keys.secretKeyFor(io.jsonwebtoken.SignatureAlgorithm.HS512);



        String base64Key = Base64.getEncoder().encodeToString(key.getEncoded());

        System.out.println("JWT Activation Secret (Base64):");
        System.out.println(base64Key);
    }
}
