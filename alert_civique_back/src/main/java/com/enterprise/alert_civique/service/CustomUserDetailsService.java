package com.enterprise.alert_civique.service;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.enterprise.alert_civique.entity.Users;
import com.enterprise.alert_civique.repository.UserRepository;

@Service("serviceCustomUserDetailsService")
public class CustomUserDetailsService implements UserDetailsService {



    private final UserRepository userRepository;

public  CustomUserDetailsService(UserRepository userRepository){
            this.userRepository=userRepository;
}


    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Users user = userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("User not found with email:" + email));

    return org.springframework.security.core.userdetails.User
    .builder()
    .username(user.getEmail())
    .password(user.getPassword())
    .authorities(
        user.getRoles()
        .stream()
        .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
        .toList()
    )
    .disabled(!user.isActive())
    .build();

}
}
