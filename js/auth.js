'use strict';

(() => {
  const status = document.querySelector('[data-auth-status]');
  if (!status) return;

  const showStatus = (message, isError = false) => {
    status.textContent = message;
    status.classList.toggle('auth-status-error', isError);
  };
  const messageFor = (error, fallback) =>
    error && typeof error.message === 'string' ? error.message : fallback;
  const setBusy = (form, isBusy) => {
    const button = form.querySelector('button[type="submit"]');
    if (button) {
      button.disabled = isBusy;
      button.setAttribute('aria-busy', String(isBusy));
    }
  };

  try {
    if (!window.RXSupabaseClient) throw new Error('The Supabase client setup could not be loaded.');
    window.RXSupabaseClient.getClient();
  } catch (error) {
    showStatus(error.message, true);
    return;
  }

  const client = window.RXSupabaseClient.getClient();
  showStatus('Supabase client is ready.');

  const loginForm = document.querySelector('[data-auth-login]');
  const signupForm = document.querySelector('[data-auth-signup]');
  const resetRequestForm = document.querySelector('[data-auth-reset-request]');
  const passwordUpdateForm = document.querySelector('[data-auth-password-update]');
  const signedInPanel = document.querySelector('[data-auth-signed-in]');
  const signedOutPanel = document.querySelector('[data-auth-signed-out]');
  const emailLabel = document.querySelector('[data-auth-email]');
  const logoutButton = document.querySelector('[data-auth-logout]');

  if (loginForm) {
    const notice = new URLSearchParams(window.location.search).get('notice');
    if (notice === 'signed-out') showStatus('You have been signed out.');

    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!loginForm.reportValidity()) return;
      setBusy(loginForm, true);
      showStatus('Signing in…');
      try {
        const formData = new FormData(loginForm);
        const { data, error } = await client.auth.signInWithPassword({
          email: String(formData.get('email')).trim().toLowerCase(),
          password: String(formData.get('password'))
        });
        if (error) throw error;
        if (!data.session) throw new Error('Sign-in completed without a session. Try again or contact support.');
        window.location.assign('account.html');
      } catch (error) {
        showStatus(messageFor(error, 'Sign-in failed. Check your details and try again.'), true);
      } finally {
        setBusy(loginForm, false);
      }
    });
  }

  if (resetRequestForm) {
    resetRequestForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!resetRequestForm.reportValidity()) return;
      setBusy(resetRequestForm, true);
      showStatus('Sending your password reset email…');
      try {
        const formData = new FormData(resetRequestForm);
        const { error } = await client.auth.resetPasswordForEmail(
          String(formData.get('email')).trim().toLowerCase(),
          { redirectTo: new URL('reset-password.html', window.location.href).toString() }
        );
        if (error) throw error;
        showStatus('If an account exists for that email, a password reset link has been sent.');
        resetRequestForm.reset();
      } catch (error) {
        showStatus(messageFor(error, 'Password reset could not be requested. Try again.'), true);
      } finally {
        setBusy(resetRequestForm, false);
      }
    });
  }

  if (passwordUpdateForm) {
    passwordUpdateForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!passwordUpdateForm.reportValidity()) return;
      setBusy(passwordUpdateForm, true);
      showStatus('Updating your password…');
      try {
        const formData = new FormData(passwordUpdateForm);
        const password = String(formData.get('password'));
        if (password !== String(formData.get('password_confirmation'))) {
          throw new Error('The password confirmation does not match.');
        }
        const { error } = await client.auth.updateUser({ password });
        if (error) throw error;
        showStatus('Password updated. You can now sign in with your new password.');
        passwordUpdateForm.reset();
        window.setTimeout(() => window.location.assign('account.html'), 1200);
      } catch (error) {
        showStatus(messageFor(error, 'Password could not be updated. Request a new reset link and try again.'), true);
      } finally {
        setBusy(passwordUpdateForm, false);
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!signupForm.reportValidity()) return;
      setBusy(signupForm, true);
      showStatus('Creating your account…');
      try {
        const formData = new FormData(signupForm);
        const { data, error } = await client.auth.signUp({
          email: String(formData.get('email')).trim().toLowerCase(),
          password: String(formData.get('password')),
          options: {
            emailRedirectTo: new URL('account.html', window.location.href).toString()
          }
        });
        if (error) throw error;
        if (data.session) {
          window.location.assign('account.html');
          return;
        }
        showStatus('Account request received. Check your email to confirm your account before signing in.');
        signupForm.reset();
      } catch (error) {
        showStatus(messageFor(error, 'Account creation failed. Check your details and try again.'), true);
      } finally {
        setBusy(signupForm, false);
      }
    });
  }

  const renderAccount = (session) => {
    if (!signedInPanel || !signedOutPanel) return;
    if (!session?.user) {
      signedInPanel.hidden = true;
      signedOutPanel.hidden = false;
      if (emailLabel) emailLabel.textContent = '';
      showStatus('You are signed out.');
      return;
    }

    signedInPanel.hidden = false;
    signedOutPanel.hidden = true;
    emailLabel.textContent = session.user.email || 'Signed-in customer';
    showStatus('Signed in. Only your login and saved delivery addresses use Supabase.');
  };

  if (signedInPanel && signedOutPanel) {
    client.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => { void renderAccount(session); }, 0);
    });

    logoutButton.addEventListener('click', async () => {
      logoutButton.disabled = true;
      showStatus('Signing out…');
      try {
        const { error } = await client.auth.signOut();
        if (error) throw error;
        window.location.assign('login.html?notice=signed-out');
      } catch (error) {
        showStatus(messageFor(error, 'Sign-out failed. Please try again.'), true);
        logoutButton.disabled = false;
      }
    });

    client.auth.getSession()
      .then(({ data, error }) => {
        if (error) throw error;
        return renderAccount(data.session);
      })
      .catch((error) => {
        showStatus(messageFor(error, 'Your account session could not be loaded. Try refreshing this page.'), true);
      });
  }
})();
