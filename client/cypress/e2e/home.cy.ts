describe("Home Page", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173"); // URL de votre application
  });

  it("should display the header elements", () => {
    cy.get('[data-testid="header-logo"]').should("exist").and("contain.text", "Ministère");
    cy.get(".fr-header__service-title").should("exist").and("contain.text", "Référentiel des Applications");
    cy.get(".fr-header__service-tagline").should("exist").and("contain.text", "Une application pour les réunir toutes");
  });
});
