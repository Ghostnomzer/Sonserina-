import { useEffect, useState } from 'react';
import { Check, ShieldCheck } from 'lucide-react';
import type { Activity, Profile as ProfileData } from '../types/portal';
import { asset } from '../lib/assets';
import PageHeading from '../components/PageHeading';
import { Ornament } from '../components/Marks';
import { useAsyncAction } from '../hooks/useAsyncAction';

export default function Profile({
  profile,
  activities,
  onSave,
  signedIn,
  onSignIn,
}: {
  profile: ProfileData;
  activities: Activity[];
  onSave: (profile: ProfileData) => Promise<void>;
  signedIn: boolean;
  onSignIn?: () => void;
}) {
  const [name, setName] = useState(profile.name);
  const [year, setYear] = useState(profile.year);
  const [goal, setGoal] = useState(profile.goal);
  const action = useAsyncAction();
  useEffect(() => {
    setName(profile.name);
    setYear(profile.year);
    setGoal(profile.goal);
  }, [profile.name, profile.year, profile.goal]);
  const completed = activities.filter((activity) => activity.status === 'completed').length;
  return (
    <>
      <PageHeading
        eyebrow="Sua história, sua ambição"
        title="Meu Perfil"
        description="Personalize seu espaço na casa da ambição e da determinação."
      />
      <div className="profile-grid">
        <section className="profile-card panel">
          <img
            src={asset('images/crest.webp')}
            alt="Brasão da Sonserina"
            width="120"
            height="160"
          />
          <p className="eyebrow">Sonserina</p>
          <h2>{profile.name.trim() || 'Membro da Sonserina'}</h2>
          <span className="profile-year">{profile.year}</span>
          <Ornament />
          <p className="profile-goal">
            {profile.goal ? `“${profile.goal}”` : 'Defina sua ambição.'}
          </p>
          <div className="profile-achievement">
            <ShieldCheck size={23} />
            <strong>{completed}</strong>
            <span>{completed === 1 ? 'atividade concluída' : 'atividades concluídas'}</span>
          </div>
        </section>
        <section className="profile-form-panel panel">
          <h2>Um pouco sobre você</h2>
          <p>Ambições grandes começam com objetivos claros.</p>
          <form
            className="portal-form"
            onSubmit={(event) => {
              event.preventDefault();
              void action.run(() => onSave({ name: name.trim(), year, goal: goal.trim() }));
            }}
          >
            <fieldset className="form-fields" disabled={action.busy || !signedIn}>
              <label>
                Seu nome
                <input
                  maxLength={60}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Como podemos chamar você?"
                  autoComplete="given-name"
                />
              </label>
              <label>
                Ano em Hogwarts
                <select value={year} onChange={(event) => setYear(event.target.value)}>
                  <option value="">Não informado</option>
                  {Array.from({ length: 7 }, (_, i) => (
                    <option key={i} value={`${i + 1}º ano`}>
                      {i + 1}º ano
                    </option>
                  ))}
                </select>
              </label>
              {action.error && (
                <p className="form-error" role="alert">
                  {action.error}
                </p>
              )}
              <label>
                Sua ambição
                <textarea
                  rows={3}
                  maxLength={140}
                  value={goal}
                  onChange={(event) => setGoal(event.target.value)}
                  placeholder="O que você quer conquistar?"
                />
              </label>
              <div className="form-actions">
                <button className="button button-primary" type="submit">
                  <Check size={17} />
                  {action.busy ? 'Salvando...' : 'Salvar perfil'}
                </button>
              </div>
            </fieldset>
            {!signedIn && onSignIn && (
              <button className="button button-primary" type="button" onClick={onSignIn}>
                Entrar para editar meu perfil
              </button>
            )}
            <p className="storage-note">Seu perfil e seu progresso ficam vinculados à sua conta.</p>
          </form>
        </section>
      </div>
    </>
  );
}
