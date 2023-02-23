import React from 'react';
import { render, screen, within } from '@testing-library/react';
import i18n from 'locales';

import App from '../App';

describe('App', () => {
    test.todo('fix rendering tests and re-enable them');
    /* it('Check if the app is correctly rendered', async () => {
        render(<App />);

        // Checks that welcome title is rendered
        const welcomeText = i18n.t('welcome.title');
        expect(screen.getByText(welcomeText)).toBeInTheDocument();

        // Checks that all import/create buttons are rendered
        const buttons = within(screen.getByTestId('auth-layout')).getAllByRole('button');
        expect(buttons.length).toBe(4);
    }); */
});
