it('Prodaja karata', () => {
  cy.visit('https://srbijavoz.rs/');

  // Prevent opening in a new tab behavior from the link in order to have a simpler test set-up
  cy.findByText('Продаја карата').parents('a').invoke('removeAttr', 'target').click();

  // Make the assertions in the new domain
  cy.origin('https://webapi1.srbvoz.rs', () => {
    Cypress.require('../support/commands')

    cy.findByText("Izaberite voz").should('exist');

    cy.url().should('equal', 'https://webapi1.srbvoz.rs/ekarta/app/#!/home');

    cy.findByRole('radio', { name: 'Jedan smer' }).should('be.checked');

    cy.findByRole('radio', { name: 'Povratno putovanje' }).should('not.be.checked');
  })
});

it('Konfiguracija karata', () => {
  cy.visit('https://webapi1.srbvoz.rs/ekarta/app/#!/home');

  cy.findByLabelText('Stanica OD').wait(200).type('Novi');

  // We want to assert and select the string "Novi Sad", however, in the DOM, the searched word is wrapped with a DOM element making this type of assertion more complex
  // We attempt to find the second part of the string "Sad", and when we've found it, we assert the rest of the string
  cy.findByText('Sad')
    .parent()
    .within(() => {
      cy.findByText('Novi').click();
    });

  cy.findByLabelText('Stanica OD').should('have.value', 'Novi Sad');

  // Type in a string "Beo" and the press the keyboard key "enter"
  cy.findByLabelText('Stanica DO').type('Beo{enter}');

  // We first clear the previous value, before entering the new one
  cy.findByLabelText('Broj Putnika').clear().type('3');

  cy.findByText('TRAŽI').click();

  // The data querying takes a while, and so we wait an arbitrary 2 seconds before proceeding
  // In theory, this could also be done in a more elegant way, for example waiting for the loader to disappear
  cy.findByText('Novi Sad - Beograd Centar').wait(2000).should('exist');

  // We find the first element, and click it. Then, we navigate to the nearest parent and within its scope we assert the action item "Zatvori"
  // We use the regex syntax to specify only the beginning of the string, because the string also contains the double arrow character
  cy.findAllByText(/^Detalji o vozu/)
    .first()
    .click()
    .parent()
    .as('first-result')
    .within(() => {
      cy.findByText(/^Zatvori/).click();
    });

  // After the action item "Zatvori" has been clicked, we assert that it is no longer visible
  cy.get('@first-result').within(() => {
    cy.findByText(/^Zatvori/).should('not.be.visible');
  });

  cy.get('@first-result')
    .parent()
    .within(() => {
      cy.findByText('IZABERI').click();
      cy.findByText(/izabrano$/i).should('have.css', 'background-color', 'rgb(14, 136, 12)');
    });

  // The DOM semantics are not up to the standard, so it is quite difficult to find the precise element, and also stay flexible with the implementation and maintainability
  // Thus, we select all the elements with the word "Dalje" and implicitly knowing the position of the needed action element, we use the first one
  cy.findAllByText(/^DALJE/)
    .first()
    .should('not.be.disabled')
    .click();

  // Assert that the second action element with quite the similar name, that is yet to come into play, is disabled
  cy.findByText(/^Dalje/)
    .should('have.attr', 'disabled')
    .and('match', /disabled/);

  // Read from the JSON file content and populate the input fields
  cy.readFile('cypress/fixtures/users.json').then((users) => {
    expect(users.fullName).to.eq('Zora Petrovic');
    expect(users.birthDate).to.eq('20.Nov.1983');

    const [day, month, year] = users.birthDate.split('.');

    cy.findAllByPlaceholderText('Ime i prezime').first().as('first-user').should('exist');

    cy.get('@first-user').type(users.fullName);
    cy.get('@first-user')
      .parent()
      .within(() => {
        cy.findByText('Dan').parent().select(day);
        cy.findByText('Mesec').parent().select(month);
        cy.findByText('Godina').parent().select(year);
      });

    // Assert that that second action element with quite the similar name is still disabled
    cy.findByText(/^Dalje/)
      .should('have.attr', 'disabled')
      .and('match', /disabled/);
  });
});
