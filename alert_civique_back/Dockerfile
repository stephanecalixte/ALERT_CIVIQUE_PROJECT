FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=builder /app/target/alert_civique.jar app.jar
EXPOSE 8080

CMD ["java", "-jar", "app.jar"]


