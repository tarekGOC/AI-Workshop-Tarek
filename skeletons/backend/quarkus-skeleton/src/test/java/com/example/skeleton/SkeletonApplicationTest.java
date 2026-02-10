package com.example.skeleton;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.is;

@QuarkusTest
class SkeletonApplicationTest {

    @Test
    void healthCheck() {
        // This test ensures the Quarkus application starts and health endpoint is available
        given()
            .when().get("/q/health/ready")
            .then()
            .statusCode(200)
            .body("status", is("UP"));
    }
}
