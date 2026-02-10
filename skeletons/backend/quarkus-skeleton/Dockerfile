# Stage 1: Build
FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /app

# Copy Maven files
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN chmod +x mvnw

# Download dependencies (cached layer)
RUN ./mvnw dependency:resolve -B

# Copy source code and build
COPY src src
RUN ./mvnw package -DskipTests -B

# Stage 2: Run
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy the Quarkus fast-jar output
COPY --from=build /app/target/quarkus-app/ /app/

EXPOSE 8080

CMD ["java", "-jar", "quarkus-run.jar"]
