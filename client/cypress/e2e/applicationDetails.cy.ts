describe("Application Details", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173");
    cy.login("user", "password");
    cy.get("a.fr-btn").contains("Rechercher une application").click();
    cy.get('input[placeholder="Rechercher une application"]').type("basegun");
    cy.get(".card-container .fixed-card").first().click();
    cy.url().should("match", /\/applications\/[a-f0-9\-]+/);
  });

  it("should navigate through the tabs", () => {
    cy.get('button[data-testid="test-tab-0"]').click();
    cy.get("#tab-content-0").should("be.visible").and("contain.text", "Informations générales");
    cy.get('button[data-testid="test-tab-1"]').click();
    cy.get("#tab-content-1").should("be.visible").and("contain.text", "Description");
    cy.get('button[data-testid="test-tab-2"]').click();
    cy.get("#tab-content-2").should("be.visible").and("contain.text", "Objectifs");
    cy.get('button[data-testid="test-tab-3"]').click();
    cy.get("#tab-content-3").should("be.visible").and("contain.text", "Tags");
  });
});
