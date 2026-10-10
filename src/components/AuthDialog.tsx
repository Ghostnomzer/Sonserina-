import { useState } from 'react';
import { KeyRound, Mail } from 'lucide-react';
import { authRedirectUrl, getSupabase } from '../lib/supabase';
import { useAsyncAction } from '../hooks/useAsyncAction';
import Modal from './Modal';

type Mode = 'login' | 'signup' | 'reset' | 'recovery';

export default function AuthDialog({
  recovery = false,
  onClose,
  onSuccess,
}: {
  recovery?: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const [mode, setMode] = useState<Mode>(recovery ? 'recovery' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const action = useAsyncAction();
  const title = {
    login: 'Entrar no portal',
    signup: 'Criar sua conta',
    reset: 'Recuperar acesso',
    recovery: 'Definir nova senha',
  }[mode];
  function changeMode(next: Mode) {
    action.clearError();
    setMode(next);
    setMessage('');
    setPassword('');
    setConfirmPassword('');
  }

  async function submit() {
    const client = getSupabase();
    if (mode === 'login') {
      const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      onSuccess('Bem-vindo à sala comunal.');
      onClose();
    } else if (mode === 'signup') {
      const { data, error } = await client.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: authRedirectUrl() },
      });
      if (error) throw error;
      if (data.session) {
        onSuccess('Sua conta está pronta.');
        onClose();
      } else {
        setMessage('Confira seu e-mail e confirme o cadastro. Depois, volte aqui para entrar.');
        setPassword('');
      }
    } else if (mode === 'reset') {
      const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: authRedirectUrl(),
      });
      if (error) throw error;
      setMessage(
        'Se houver uma conta com este e-mail, você receberá um link para definir uma nova senha.',
      );
    } else {
      if (password !== confirmPassword) throw { code: 'password_mismatch' };
      const { error } = await client.auth.updateUser({ password });
      if (error) throw error;
      onSuccess('Sua senha foi atualizada.');
      onClose();
    }
  }

  return (
    <Modal
      title={title}
      onClose={() => {
        if (!action.busy) onClose();
      }}
    >
      <p className="modal-intro">
        Entre para acompanhar as informações da casa e salvar seu progresso.
      </p>
      <form
        className="portal-form"
        onSubmit={(event) => {
          event.preventDefault();
          void action.run(submit);
        }}
      >
        <fieldset className="form-fields" disabled={action.busy}>
          {mode !== 'recovery' && (
            <label>
              E-mail
              <input
                autoFocus
                required
                type="email"
                maxLength={254}
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seu@email.com"
              />
            </label>
          )}
          {mode !== 'reset' && (
            <label>
              {mode === 'recovery' ? 'Nova senha' : 'Senha'}
              <input
                autoFocus={mode === 'recovery'}
                required
                type="password"
                minLength={mode === 'login' ? 1 : 8}
                maxLength={128}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              {mode !== 'login' && <span className="field-hint">Use pelo menos 8 caracteres.</span>}
            </label>
          )}
          {mode === 'recovery' && (
            <label>
              Confirme a nova senha
              <input
                required
                type="password"
                minLength={8}
                maxLength={128}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </label>
          )}
          {action.error && (
            <p className="form-error" role="alert">
              {action.error}
            </p>
          )}
          {message && (
            <p className="form-success" role="status">
              {message}
            </p>
          )}
          <button className="button button-primary" type="submit">
            {mode === 'reset' ? <Mail size={17} /> : <KeyRound size={17} />}
            {action.busy
              ? 'Aguarde...'
              : {
                  login: 'Entrar',
                  signup: 'Criar conta',
                  reset: 'Enviar link',
                  recovery: 'Salvar nova senha',
                }[mode]}
          </button>
          {!recovery && (
            <div className="auth-links">
              {mode === 'login' ? (
                <>
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => changeMode('signup')}
                  >
                    Criar uma conta
                  </button>
                  <button className="text-button" type="button" onClick={() => changeMode('reset')}>
                    Esqueci minha senha
                  </button>
                </>
              ) : (
                <button className="text-button" type="button" onClick={() => changeMode('login')}>
                  Voltar para entrar
                </button>
              )}
            </div>
          )}
        </fieldset>
      </form>
    </Modal>
  );
}
