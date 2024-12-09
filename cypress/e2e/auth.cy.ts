describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should show login form on landing page', () => {
    cy.get('form').should('exist');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
  });

  it('should show validation errors for invalid email', () => {
    cy.get('input[type="email"]').type('invalid-email');
    cy.get('input[type="password"]').type('password123');
    cy.get('form').submit();
    cy.contains('Invalid email address').should('be.visible');
  });

  it('should navigate to signup page', () => {
    cy.contains('Sign up').click();
    cy.url().should('include', '/signup');
  });
});
