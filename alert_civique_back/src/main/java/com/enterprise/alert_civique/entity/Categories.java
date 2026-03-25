package com.enterprise.alert_civique.entity;

import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Categories {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  Long categoriId;
  String name;
  String description;
  @OneToMany(mappedBy="categories")
  List<Reports> reports;
}
