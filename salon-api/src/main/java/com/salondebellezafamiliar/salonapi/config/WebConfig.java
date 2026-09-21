package com.salondebellezafamiliar.salonapi.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.util.concurrent.TimeUnit;

// Sirve las imágenes subidas por el administrador en /uploads/**. Los nombres los genera el servidor
// (UUID) y nunca se reutilizan, por lo que el navegador puede guardarlas en caché por mucho tiempo.
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final String directorio;

    public WebConfig(@Value("${app.uploads.dir}") String directorio) {
        this.directorio = directorio;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String ubicacion = Path.of(directorio).toAbsolutePath().normalize().toUri().toString();
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(ubicacion.endsWith("/") ? ubicacion : ubicacion + "/")
                .setCacheControl(CacheControl.maxAge(30, TimeUnit.DAYS).cachePublic().immutable());
    }
}
