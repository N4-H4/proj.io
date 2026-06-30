package io.proj.projio.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.util.Map;

/**
 * Boot-time diagnostic: prints every registered Spring MVC handler mapping
 * for paths containing "projects" or "tasks" to stdout.
 * Remove before deploying to production.
 */
@Component
@Profile("!prod")
@RequiredArgsConstructor
public class MappingDiagnostic {

    private final RequestMappingHandlerMapping handlerMapping;

    @EventListener(ApplicationReadyEvent.class)
    public void printMappings() {
        System.out.println("\n========= REGISTERED ROUTE MATRIX (projects/tasks) =========");
        Map<RequestMappingInfo, org.springframework.web.method.HandlerMethod> methods =
                handlerMapping.getHandlerMethods();

        methods.forEach((info, handlerMethod) -> {
            String pattern = info.getPatternValues().toString();
            if (pattern.contains("projects") || pattern.contains("tasks")) {
                System.out.printf("  %-80s  ->  %s#%s%n",
                        info,
                        handlerMethod.getBeanType().getSimpleName(),
                        handlerMethod.getMethod().getName());
            }
        });
        System.out.println("=============================================================\n");
    }
}
