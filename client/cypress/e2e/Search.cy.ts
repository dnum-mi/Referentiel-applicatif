describe("Search Application Page", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173");
    cy.login("user", "password");
  });

  it('should redirect to the search application page when clicking "Rechercher une application"', () => {
    cy.get("a.fr-btn").contains("Rechercher une application").click();
    cy.url().should("include", "/recherche-application");
  });

  it("should display search results when a valid search term is entered", () => {
    cy.get("a.fr-btn").contains("Rechercher une application").click();
    cy.url().should("include", "/recherche-application");

    cy.get('input[placeholder="Rechercher une application"]').type("basegun");
    cy.get(".card-container .fixed-card").should("have.length.greaterThan", 0);
  });

  it("should navigate to application details when clicking on a search result tile", () => {
    cy.get("a.fr-btn").contains("Rechercher une application").click();
    cy.url().should("include", "/recherche-application");

    cy.get('input[placeholder="Rechercher une application"]').type("basegun");
    cy.get(".card-container .fixed-card").first().click();
  });
});
