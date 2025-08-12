const request = require("supertest");
const app = require("../server"); // We'll need to modify server.js to export app
const { User } = require("../models");
const bcrypt = require("bcryptjs");

describe("Authentication System", () => {
  const seededUser = {
    email: "demo@example.com",
    password: "password123",
    name: "Demo User",
    role: "customer",
  };

  // Close database connections after all tests
  afterAll(async () => {
    await User.sequelize.close();
  });

  describe("Registration", () => {
    it("should register a new user successfully", async () => {
      const response = await request(app).post("/api/auth/register").send({
        name: "New Test User",
        email: "newtest@example.com",
        phone: "+1234567890",
        password: "testpass123",
        role: "customer",
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("token");
      expect(response.body.user).toHaveProperty("email", "newtest@example.com");

      // Clean up the newly created test user after test
      await User.destroy({ where: { email: "newtest@example.com" } });
    });

    it("should not register with existing email", async () => {
      const response = await request(app).post("/api/auth/register").send({
        name: "Another User",
        email: seededUser.email, // Using seeded user's email
        phone: "+1987654321",
        password: "testpass123",
        role: "customer",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Email already registered"
      );
    });

    it("should validate required fields", async () => {
      const response = await request(app).post("/api/auth/register").send({
        name: "Test User",
        // email missing
        password: "testpass123",
      });

      expect(response.status).toBe(400);
    });
  });

  describe("Login", () => {
    it("should login successfully with correct credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: seededUser.email,
        password: seededUser.password,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(response.body.user).toHaveProperty("email", seededUser.email);
    });

    it("should not login with incorrect password", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: seededUser.email,
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "message",
        "Invalid email or password"
      );
    });

    it("should not login with non-existent email", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "nonexistent@example.com",
        password: "testpass123",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "message",
        "Invalid email or password"
      );
    });
  });

  describe("Protected Routes", () => {
    let authToken;

    beforeAll(async () => {
      // Login to get token using seeded user
      const response = await request(app).post("/api/auth/login").send({
        email: seededUser.email,
        password: seededUser.password,
      });
      authToken = response.body.token;
    });

    it("should access protected route with valid token", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty("email", seededUser.email);
    });

    it("should not access protected route without token", async () => {
      const response = await request(app).get("/api/auth/me");

      expect(response.status).toBe(401);
    });

    it("should not access protected route with invalid token", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid_token");

      expect(response.status).toBe(401);
    });
  });

  // No cleanup needed as we're using seeded data
});
