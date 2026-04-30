// A página raiz do domínio principal é controlada pelo middleware.
// O middleware redireciona '/' para o login do painel (app.dominio.com/login).
// Se o middleware não interceptar (ex: acesso direto em dev), redireciona aqui.
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/app/login');
}
