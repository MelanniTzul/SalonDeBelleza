# ---------- Etapa 1: compilar ----------
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY gradlew settings.gradle build.gradle ./
COPY gradle ./gradle
RUN chmod +x gradlew && ./gradlew --no-daemon dependencies > /dev/null 2>&1 || true
COPY src ./src
RUN ./gradlew --no-daemon bootJar -x test \
    && cp "$(ls build/libs/*.jar | grep -v plain | head -n 1)" app.jar

# ---------- Etapa 2: ejecutar ----------
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd --system --create-home appuser \
    && mkdir -p /app/uploads \
    && chown appuser /app/uploads
COPY --from=build /app/app.jar app.jar
USER appuser
# Imágenes subidas por el administrador (en Docker Compose es un volumen para que no se pierdan al reconstruir)
ENV UPLOADS_DIR=/app/uploads
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
