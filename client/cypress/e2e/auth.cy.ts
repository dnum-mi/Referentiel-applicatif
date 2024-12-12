describe("Authentication", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173");
  });

  it("should log in with valid credentials", () => {
    cy.login("user", "password");
    cy.url().should("include", "/");
  });

  it("should fail to log in with invalid credentials", () => {
    cy.get(".fr-btn").contains("Se connecter").click();
    cy.origin("http://localhost:8082", () => {
      cy.get("#username").type("invaliduser");
      cy.get("#password").type("wrongpassword");
      cy.get("#kc-login").click();
      cy.get("#kc-form-wrapper").should("contain.text", "Invalid username or password");
    });
  });
});
