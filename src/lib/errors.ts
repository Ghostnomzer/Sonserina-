export function errorMessage(error: unknown): string {
  const details =
    error && typeof error === 'object'
      ? (error as { code?: string; message?: string; status?: number })
      : {};
  if (details.code === 'session_changed')
    return 'Sua sessão mudou. Entre novamente para continuar.';
  if (details.code === 'operation_pending') return 'Aguarde o salvamento atual terminar.';
  if (details.code === 'record_missing') return 'Este registro foi removido. Atualize a página.';
  if (details.code === 'password_mismatch') return 'As duas senhas precisam ser iguais.';
  if (details.code === '23503')
    return 'Esta disciplina tem atividades vinculadas. Exclua ou mova as atividades antes de removê-la.';
  if (details.code === '23505')
    return 'Este registro já existe. Atualize a página e tente novamente.';
  if (details.code === '42501') return 'Você não tem permissão para alterar este conteúdo.';
  if (details.code === 'email_not_confirmed') return 'Confirme seu e-mail antes de entrar.';
  if (details.code === 'invalid_credentials') return 'E-mail ou senha incorretos.';
  if (details.code === 'over_email_send_rate_limit' || details.status === 429)
    return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
  if (details.code === 'weak_password')
    return 'Escolha uma senha mais forte, com pelo menos 8 caracteres.';
  if (details.code === 'signup_disabled')
    return 'O cadastro de novas contas está desativado. Fale com o administrador.';
  if (details.message?.includes('fetch') || error instanceof TypeError)
    return 'Não foi possível conectar. Confira sua internet e tente novamente.';
  return 'Não foi possível concluir a operação. Tente novamente.';
}
