/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
Cypress.Commands.add('login', (username: string, password: string) => {
  // Naviguer vers la page de connexion
  cy.get('.fr-btn').contains('Se connecter').click();
  cy.wait(2000);

  // Interagir avec l'origine différente pour se connecter
  cy.origin('http://localhost:8082', { args: { username, password } }, ({ username, password }) => {
    cy.get('#username').type(username); // Saisir le nom d'utilisateur
    cy.get('#password').type(password); // Saisir le mot de passe
    cy.get('#rememberMe').check(); // Cocher "Remember me" (facultatif)
    cy.get('#kc-login').click(); // Soumettre le formulaire
  });

  // Attendre la redirection vers l'URL principale après connexion
  cy.url().should('include', 'http://localhost:5173');
});
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }